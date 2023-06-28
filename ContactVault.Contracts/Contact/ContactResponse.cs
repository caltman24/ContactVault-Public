using ContactVault.DataAccess.Models;

namespace ContactVault.Contracts.Contact;

public record ContactResponse(
    int Id,
    string? ImageUrl,
    string FirstName,
    string? LastName,
    List<EmailAddress> EmailAddresses,
    List<PhoneNumber> PhoneNumbers,
    List<SocialMediaAccount> SocialMediaAccounts)
{
    public ContactResponse() : this(
        default,
        default,
        default!,
        default,
        default!,
        default!,
        default!)
    {
    }
}