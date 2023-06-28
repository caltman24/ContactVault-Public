namespace ContactVault.DataAccess.Models;

public class Contact
{
    public int Id { get; set; }

    public string? ImageUrl { get; set; }

    public string? ImageKey { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string? LastName { get; set; }

    public List<EmailAddress> EmailAddresses { get; set; } = new();

    public List<PhoneNumber> PhoneNumbers { get; set; } = new();

    public List<SocialMediaAccount> SocialMediaAccounts { get; set; } = new();
}