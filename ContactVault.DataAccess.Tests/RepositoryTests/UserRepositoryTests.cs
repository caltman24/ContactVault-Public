using ContactVault.DataAccess.Models;
using ContactVault.DataAccess.Repositories;

namespace ContactVault.DataAccess.Tests.RepositoryTests;

// TODO: These tests should be rewritten to integration tests that mock a database connection.
// I guess this works for now though

[Obsolete("Do not use. Bad Test. Needs rewritten to integration tests")]
public class UserRepositoryTests
{
    private readonly IUserRepository _userRepository;

    public UserRepositoryTests()
    {
        _userRepository = new UserRepository("connection string");
    }

    [Fact]
    public async void GetByUserId_ShouldNotBeNullAndValidData()
    {
        const string userId = "test123";

        var newUser = new User(userId);
        await _userRepository.AddAsync(newUser);
        var user = _userRepository.GetByUserId(newUser.UserId);

        Assert.NotNull(user);
        Assert.Equal(newUser.UserId, user.UserId);

        // Cleanup. Delete if you want to see result
        await _userRepository.DeleteAsync(newUser.UserId);
    }

    [Fact]
    public async void Add_ShouldExistInDatabase()
    {
        const string userId = "newTest456";
        var newUser = new User(userId);

        await _userRepository.AddAsync(newUser);
        var userExists = _userRepository.UserAlreadyExists(newUser.UserId);

        Assert.True(userExists);

        // Cleanup. Delete if you want to see result
        await _userRepository.DeleteAsync(newUser.UserId);
    }

    [Fact]
    public async void Delete_ShouldNotExistInDatabase()
    {
        const string userId = "deleteTest123";
        var newUser = new User(userId);

        await _userRepository.AddAsync(newUser);
        await _userRepository.DeleteAsync(newUser.UserId);

        var userExists = _userRepository.UserAlreadyExists(newUser.UserId);

        Assert.False(userExists);
    }
}