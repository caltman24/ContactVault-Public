using System.Data;
using ContactVault.DataAccess.Models;
using Dapper;
using Npgsql;

namespace ContactVault.DataAccess.Repositories;

public interface IContactRepository
{
    Task<List<Contact>> GetAllAsync(string userId);
    Contact? GetById(int contactId);
    Task<string?> GetImageKey(int contactId);
    Task<int> AddAsync(Contact newContact, string userId);
    Task UpsertAsync(Contact contactToUpsert, string userId);
    Task DeleteAsync(int contactId);
}

public class ContactRepository : IContactRepository
{
    private readonly string _connectionString;

    public ContactRepository(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<List<Contact>> GetAllAsync(string userId)
    {
        List<Contact> output = new();

        await using var pgConnection = new NpgsqlConnection(_connectionString);

        // Query for basic contact 
        var sql = @"";
        var allContacts = pgConnection.Query<BasicContact>(sql,
            new { user_id = userId });

        if (allContacts.Count() == 0)
        {
            return output;
        }

        // retrieve multiple result sets from a single query
        sql = ""
        foreach (var contact in allContacts)
        {
            using var multiQuery = await pgConnection.QueryMultipleAsync(sql, new { contact_id = contact.Id });

            var contactPhoneNumbers = multiQuery.Read<PhoneNumber>();
            var contactEmailAddresses = multiQuery.Read<EmailAddress>();
            var contactSocialMediaAccounts = multiQuery.Read<SocialMediaAccount>();

            output.Add(new Contact
            {
                Id = contact.Id,
                ImageUrl = contact.ImageUrl,
                FirstName = contact.FirstName,
                LastName = contact.LastName,
                PhoneNumbers = contactPhoneNumbers.ToList(),
                EmailAddresses = contactEmailAddresses.ToList(),
                SocialMediaAccounts = contactSocialMediaAccounts.ToList()
            });
        }

        return output;
    }

    public Contact? GetById(int contactId)
    {
        using var pgConnection = new NpgsqlConnection(_connectionString);

        var sql = "";
        var contact = pgConnection.Query<Contact>(sql, new { contact_id = contactId }).FirstOrDefault();

        // retrieve multiple result sets from a single query
        sql = "";

        if (contact == null) return null;

        using var multiQuery = pgConnection.QueryMultiple(sql, new { contact_id = contact.Id });

        contact.PhoneNumbers = multiQuery.Read<PhoneNumber>().ToList();
        contact.EmailAddresses = multiQuery.Read<EmailAddress>().ToList();
        contact.SocialMediaAccounts = multiQuery.Read<SocialMediaAccount>().ToList();

        return contact;
    }

    public async Task<string?> GetImageKey(int contactId)
    {
        await using var pgConnection = new NpgsqlConnection(_connectionString);

        const string sql = @"";

        var queryResult = await pgConnection.QueryAsync<string>(sql, new { contactId });

        return queryResult.FirstOrDefault();
    }

    public async Task<int> AddAsync(Contact newContact, string userId)
    {
        await using var pgConnection = new NpgsqlConnection(_connectionString);

        const string sql =
            @"";
        var newContactId = pgConnection.Query<int>(sql,
            new
            {
                image_url = newContact.ImageUrl,
                imageKey = newContact.ImageKey,
                first_name = newContact.FirstName,
                last_name = newContact.LastName,
                auth_id = userId
            }).FirstOrDefault();

        await AddNewContactDetailsToDb(pgConnection, newContact, newContactId);

        return newContactId;
    }

    public async Task UpsertAsync(Contact contactToUpsert, string userId)
    {
        await using var pgConnection = new NpgsqlConnection(_connectionString);

        // Update basic contact info
        var sql =
            @"";
        await pgConnection.ExecuteAsync(sql, new
        {
            contact_id = contactToUpsert.Id,
            user_id = userId,
            first_name = contactToUpsert.FirstName,
            last_name = contactToUpsert.LastName,
            image_url = contactToUpsert.ImageUrl,
            imageKey = contactToUpsert.ImageKey
        });

        // Delete old contact details
        // We want to do this synchronously because we want to make sure this is done before we insert.
        sql = "";
        pgConnection.Execute(sql, new { contact_id = contactToUpsert.Id });

        // Insert new contact details
        await AddNewContactDetailsToDb(pgConnection, contactToUpsert, contactToUpsert.Id);
    }

    public async Task DeleteAsync(int contactId)
    {
        await using var pgConnection = new NpgsqlConnection(_connectionString);

        const string sql = @"";

        await pgConnection.ExecuteAsync(sql, new { contact_id = contactId });
    }

    private static async Task AddNewContactDetailsToDb(IDbConnection pgConnection, Contact newContact, int newContactId)
    {
        var sql = @"";
        foreach (var phoneNumber in newContact.PhoneNumbers)
            await pgConnection.ExecuteAsync(sql, new
            {
                contact_id = newContactId,
                phone_number = phoneNumber.Number,
                phone_number_type = Enum.GetName(phoneNumber.Type)
            });

        sql = @"";
        foreach (var emailAddress in newContact.EmailAddresses)
            await pgConnection.ExecuteAsync(sql, new
            {
                contact_id = newContactId,
                email_address = emailAddress.Email
            });

        sql = @"";
        foreach (var account in newContact.SocialMediaAccounts)
            await pgConnection.ExecuteAsync(sql, new
            {
                contact_id = newContactId,
                url = account.Url,
                platform = account.Platform
            });
    }
}