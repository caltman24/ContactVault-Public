using ContactVault.DataAccess.Models;
using ContactVault.DataAccess.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ContactVault.Api.Controllers;

[Authorize]
public class UserController : ApiController
{
    private readonly IUserRepository _userRepository;

    public UserController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet]
    public IActionResult GetUser()
    {
        var userId = GetUserIdentityName();
        var user = _userRepository.GetByUserId(userId);

        if (user == null)
        {
            _userRepository.Add(new User(userId));
            var newUser = _userRepository.GetByUserId(userId);

            if (newUser == null) throw new Exception("Failed to get newly added user in GetUser Action");

            return CreatedAtAction(nameof(GetUser), new { userId = newUser.UserId }, newUser);
        }

        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> AddUser()
    {
        var userId = GetUserIdentityName();
        var newUser = new User(userId);

        var userExists = _userRepository.UserAlreadyExists(newUser.UserId);
        if (userExists) return Conflict($"User with id {newUser.UserId} already exists");

        await _userRepository.AddAsync(newUser);

        return CreatedAtAction(nameof(GetUser), new { userId = newUser.UserId }, newUser);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteUser()
    {
        var userId = GetUserIdentityName();
        await _userRepository.DeleteAsync(userId);

        return NoContent();
    }
}