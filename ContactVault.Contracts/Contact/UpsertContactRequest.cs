using System.ComponentModel.DataAnnotations;
using ContactVault.DataAccess.Models;

namespace ContactVault.Contracts.Contact;

public record UpsertContactRequest(
    int Id, //
    string? ImageUrl,
    string FirstName,
    string? LastName,
    List<EmailAddress> EmailAddresses,
    List<PhoneNumber> PhoneNumbers,
    List<SocialMediaAccount> SocialMediaAccounts,
    bool DeleteImageRequest);