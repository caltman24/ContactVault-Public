using System.ComponentModel.DataAnnotations;

namespace ContactVault.DataAccess.Models;

public class SocialMediaAccount
{
    public SocialMediaAccount(string url, string platform)
    {
        Url = url;
        Platform = platform;
    }

    [MaxLength(2048)] [Url] public string Url { get; set; }

    [MaxLength(20)] public string Platform { get; set; }
}