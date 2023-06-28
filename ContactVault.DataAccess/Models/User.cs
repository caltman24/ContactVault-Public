namespace ContactVault.DataAccess.Models;

public class User
{
    public User(string userId)
    {
        UserId = userId;
    }

    public string UserId { get; set; }
}