using System.ComponentModel.DataAnnotations;

namespace ContactVault.DataAccess.Models;

public class EmailAddress
{
    public EmailAddress(string email)
    {
        Email = email;
    }

    [MaxLength(320)] [EmailAddress] public string Email { get; set; }
}