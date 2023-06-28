using System.ComponentModel.DataAnnotations;
using ContactVault.DataAccess.Models;

namespace ContactVault.Contracts.Contact;

public record CreateContactRequest(
    string? ImageUrl,
    string FirstName,
    string? LastName,
    List<EmailAddress> EmailAddresses,
    List<PhoneNumber> PhoneNumbers,
    List<SocialMediaAccount> SocialMediaAccounts);