using System.ComponentModel.DataAnnotations;
using ContactVault.DataAccess.Constants;

namespace ContactVault.DataAccess.Models;

public class PhoneNumber
{
    public PhoneNumber(string number, PhoneNumberType type)
    {
        Number = number;
        Type = type;
    }

    [MaxLength(15)] [Phone] public string Number { get; set; }

    public PhoneNumberType Type { get; set; }
}