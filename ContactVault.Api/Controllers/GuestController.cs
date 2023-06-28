using Bogus;
using ContactVault.Contracts.Contact;
using ContactVault.DataAccess.Constants;
using ContactVault.DataAccess.Models;
using Microsoft.AspNetCore.Mvc;

namespace ContactVault.Api.Controllers;

public class GuestController : ApiController
{
    [HttpGet("contacts")]
    public IActionResult GetContacts()
    {
        var contacts = GenerateRandomContacts();

        return Ok(contacts);
    }

    private List<ContactResponse> GenerateRandomContacts()
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

        var newContact = new Faker<ContactResponse>()
            .RuleFor(c => c.Id, f => f.IndexFaker)
            .RuleFor(c => c.FirstName, f => f.Name.FirstName())
            .RuleFor(c => c.LastName, f => f.Name.LastName())
            .RuleFor(c => c.ImageUrl, f => "https://i.stack.imgur.com/l60Hf.png")
            .RuleFor(c => c.EmailAddresses, _ =>
                testEmailAddresses.Generate(RandomAmount()).ToList())
            .RuleFor(c => c.PhoneNumbers, _ =>
                testPhoneNumbers.Generate(RandomAmount()).ToList())
            .RuleFor(c => c.SocialMediaAccounts, _ =>
                testSocialMediaAccounts.Generate(RandomAmount()).ToList());

        var contacts = newContact.Generate(RandomAmount(6, 24));

        return contacts;
    }

    private int RandomAmount(int min = 1, int max = 3)
    {
        return Random.Shared.Next(min, max);
    }
}