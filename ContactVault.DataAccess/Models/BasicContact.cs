namespace ContactVault.DataAccess.Models;

public class BasicContact
{
    public int Id { get; set; }
    public string? ImageUrl { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
}