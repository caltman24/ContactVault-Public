using ContactVault.DataAccess.Models;
using Dapper;
using Npgsql;

namespace ContactVault.DataAccess.Repositories;

public interface IUserRepository
{
    User? GetByUserId(string userId);
    Task AddAsync(User newUser);
    void Add(User newUser);
    Task DeleteAsync(string userId);
    void Delete(string userId);
    bool UserAlreadyExists(string userId);
}

public class UserRepository : IUserRepository
{
    private readonly string _connectionString;

    public UserRepository(string connectionString)
    {
        _connectionString = connectionString;
    }

    public bool UserAlreadyExists(string userId)
    {
        return GetByUserId(userId) != null;
    }

    public User? GetByUserId(string userId)
    {
        using var pgConnection = new NpgsqlConnection(_connectionString);

        const string sql = "";
        var user = pgConnection.Query<User>(sql, new { user_id = userId }).FirstOrDefault();

        return user;
    }

    public async Task AddAsync(User newUser)
    {
        await using var pgConnection = new NpgsqlConnection(_connectionString);

        const string sql = "";
        await pgConnection.ExecuteAsync(sql, new { user_id = newUser.UserId });
    }

    public void Add(User newUser)
    {
        using var pgConnection = new NpgsqlConnection(_connectionString);

        const string sql = "";
        pgConnection.Execute(sql, new { user_id = newUser.UserId });
    }

    public async Task DeleteAsync(string userId)
    {
        await using var pgConnection = new NpgsqlConnection(_connectionString);

        const string sql = "";
        await pgConnection.ExecuteAsync(sql, new { user_id = userId });
    }

    public void Delete(string userId)
    {
        using var pgConnection = new NpgsqlConnection(_connectionString);

        const string sql = "";
        pgConnection.Execute(sql, new { user_id = userId });
    }
}