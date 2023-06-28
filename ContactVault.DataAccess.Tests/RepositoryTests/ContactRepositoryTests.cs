using Bogus;
using ContactVault.DataAccess.Constants;
using ContactVault.DataAccess.Models;
using ContactVault.DataAccess.Repositories;

namespace ContactVault.DataAccess.Tests.RepositoryTests;

// TODO: These tests should be rewritten to mock a database connection.
// I guess this works for now though. It was a first good attempt

[Obsolete("Do not use. Bad Test. Needs rewritten to integration tests")]
public class ContactRepositoryTests : IDisposable
{
    private const string UserId = "test456";
    private readonly IContactRepository _contactRepository = new ContactRepository("connection string");
    private readonly User _testUser;
    private readonly IUserRepository _userRepository;

    public ContactRepositoryTests()
    {
        _testUser = new User(UserId);
        _userRepository = new UserRepository("connection string");
        _userRepository.Add(_testUser);
    }

    public void Dispose()
    {
        _userRepository.Delete(UserId);
    }


    [Fact]
    public async void Add_ShouldExistInDatabase()
    {
        var testContact = CreateTestContact();

        var newContactId = await _contactRepository.AddAsync(testContact, _testUser.UserId);
        testContact.Id = newContactId;

        var contact = _contactRepository.GetById(testContact.Id);

        AssertValidContactDetails(contact);
        AssertTwoContactsAreSame(testContact, contact!);
    }

    [Fact]
    public async void GetAll_ShouldNotBeEmptyAndContainEmptyObjects()
    {
        // Add test data to db
        var contactsToAdd = CreateManyTestContacts();

        foreach (var contact in contactsToAdd) await _contactRepository.AddAsync(contact, _testUser.UserId);

        var userContacts = await _contactRepository.GetAllAsync(_testUser.UserId);

        Assert.NotEmpty(userContacts);

        foreach (var contact in userContacts) AssertValidContactDetails(contact);
    }


    [Fact]
    public async void GetById_ShouldNotBeNull()
    {
        var testContact = CreateTestContact();

        var id = await _contactRepository.AddAsync(testContact, _testUser.UserId);
        var contact = _contactRepository.GetById(id);

        AssertValidContactDetails(contact);
    }

    [Fact]
    public async void Delete_ShouldNotBeInTheDatabase()
    {
        var testContact = CreateTestContact();

        var newContactId = await _contactRepository.AddAsync(testContact, _testUser.UserId);
        await _contactRepository.DeleteAsync(newContactId);
        var deletedContact = _contactRepository.GetById(newContactId);

        Assert.Null(deletedContact);
    }

    [Fact]
    public async void Upsert_ShouldUpdateRecord()
    {
        var testContact = CreateTestContact();

        // Add new contact
        var newContactId = await _contactRepository.AddAsync(testContact, _testUser.UserId);
        testContact.Id = newContactId;
        var insertedContact = _contactRepository.GetById(testContact.Id);

        // validate the contact we inserted is the one we retrieved
        AssertValidContactDetails(insertedContact);
        AssertTwoContactsAreSame(testContact, insertedContact);

        // Update the contact's info
        insertedContact!.FirstName = "Updated";
        insertedContact.PhoneNumbers[0].Type = PhoneNumberType.Home;
        insertedContact.EmailAddresses[0].Email = "updatedemail@email.com";
        insertedContact.SocialMediaAccounts[0].Platform = SocialMediaPlatforms.Instagram;

        // Apply changes
        await _contactRepository.UpsertAsync(insertedContact, _testUser.UserId);
        var updatedContact = _contactRepository.GetById(insertedContact.Id);

        // Validate the changes were properly made
        AssertValidContactDetails(updatedContact);
        AssertTwoContactsAreSame(insertedContact, updatedContact!);

        // Cleanup. Remove if you need to see result
        await _contactRepository.DeleteAsync(updatedContact!.Id);
    }

    private static void AssertValidContactDetails(Contact? contact)
    {
        Assert.NotNull(contact);
        Assert.Multiple(() =>
        {
            Assert.NotNull(contact.LastName);
            AssertNotEmptyAndNull(contact.PhoneNumbers);
            AssertNotEmptyAndNull(contact.EmailAddresses);
            AssertNotEmptyAndNull(contact.SocialMediaAccounts);
        });

        void AssertNotEmptyAndNull<T>(IEnumerable<T> collection)
        {
            Assert.NotEmpty(collection);
            Assert.NotNull(collection);
        }
    }

    private static void AssertTwoContactsAreSame(Contact expected, Contact? actual)
    {
        // validate basic contact
        Assert.NotNull(actual);

        Assert.Multiple(() =>
        {
            Assert.Equal(expected.Id, actual.Id);
            Assert.Equal(expected.FirstName, actual.FirstName);
            Assert.Equal(expected.LastName, actual.LastName);
            Assert.Equal(expected.ImageUrl, actual.ImageUrl);
        });

        // validate email addresses
        Assert.Multiple(() =>
        {
            Assert.Equal(expected.EmailAddresses.Count, actual.EmailAddresses.Count);

            var expectedEmailAddresses = expected.EmailAddresses
                .OrderBy(x => x.Email);
            var actualEmailAddresses = actual.EmailAddresses
                .OrderBy(x => x.Email);

            foreach (var (expectedEmailAddress, actualEmailAddress)
                     in expectedEmailAddresses.Zip(actualEmailAddresses))
                Assert.Equal(expectedEmailAddress.Email, actualEmailAddress.Email);
        });

        // validate phone numbers
        Assert.Multiple(() =>
        {
            Assert.Equal(expected.PhoneNumbers.Count, actual.PhoneNumbers.Count);

            var expectedPhoneNumbers = expected.PhoneNumbers
                .OrderBy(x => x.Number)
                .ThenBy(x => x.Type);
            var actualPhoneNumbers = actual.PhoneNumbers
                .OrderBy(x => x.Number)
                .ThenBy(x => x.Type);

            foreach (var (expectedPhoneNumber, actualPhoneNumber)
                     in expectedPhoneNumbers.Zip(actualPhoneNumbers))
            {
                Assert.Equal(expectedPhoneNumber.Number, actualPhoneNumber.Number);
                Assert.Equal(expectedPhoneNumber.Type, actualPhoneNumber.Type);
            }
        });

        // validate social media accounts
        Assert.Multiple(() =>
        {
            Assert.Equal(expected.SocialMediaAccounts.Count, actual.SocialMediaAccounts.Count);

            var expectedAccounts = expected.SocialMediaAccounts
                .OrderBy(x => x.Url)
                .ThenBy(x => x.Platform);
            var actualAccounts = actual.SocialMediaAccounts
                .OrderBy(x => x.Url)
                .ThenBy(x => x.Platform);

            foreach (var (expectedAccount, actualAccount)
                     in expectedAccounts.Zip(actualAccounts))
            {
                Assert.Equal(expectedAccount.Url, actualAccount.Url);
                Assert.Equal(expectedAccount.Platform, actualAccount.Platform);
            }
        });
    }

    private static Contact CreateTestContact()
    {
        return new Contact
        {
            FirstName = "John",
            LastName = "Doe",
            ImageUrl = null,
            PhoneNumbers = new List<PhoneNumber>
            {
                new("894-343-4323", PhoneNumberType.Work)
            },
            EmailAddresses = new List<EmailAddress>
            {
                new("johndoeman@johndoe.com"),
                new("johnbonaton@johndoe.com")
            },
            SocialMediaAccounts = new List<SocialMediaAccount>
            {
                new(
                    "https://facebook.com/johndoedaman",
                    SocialMediaPlatforms.Facebook)
            }
        };
    }

    private static List<Contact> CreateManyTestContacts(int amount = 5, int perDetailAmount = 3)
    {
        var testEmailAddresses = new Faker<EmailAddress>()
            .CustomInstantiator(f => new EmailAddress(f.Internet.Email()));

        var testPhoneNumbers = new Faker<PhoneNumber>()
            .CustomInstantiator(f => new PhoneNumber(f.Phone.PhoneNumber(), f.PickRandom<PhoneNumberType>()));

        var testSocialMediaAccounts = new Faker<SocialMediaAccount>()
            .CustomInstantiator(f => new SocialMediaAccount(f.Person.Avatar,
                f.PickRandom(SocialMediaPlatforms.Facebook, SocialMediaPlatforms.Instagram,
                    SocialMediaPlatforms.Pinterest, SocialMediaPlatforms.TikTok, SocialMediaPlatforms.LinkedIn,
                    SocialMediaPlatforms.Twitter)));

        var newContact = new Faker<Contact>()
            .RuleFor(c => c.Id, f => f.IndexFaker)
            .RuleFor(c => c.FirstName, f => f.Name.FirstName())
            .RuleFor(c => c.LastName, f => f.Name.LastName())
            .RuleFor(c => c.ImageUrl, f => f.Image.PlaceholderUrl(25, 25))
            .RuleFor(c => c.EmailAddresses, _ =>
                testEmailAddresses.Generate(perDetailAmount).ToList())
            .RuleFor(c => c.PhoneNumbers, _ =>
                testPhoneNumbers.Generate(perDetailAmount).ToList())
            .RuleFor(c => c.SocialMediaAccounts, _ =>
                testSocialMediaAccounts.Generate(perDetailAmount).ToList());

        var contacts = newContact.Generate(amount);

        return contacts;
    }
}