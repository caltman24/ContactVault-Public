using Microsoft.AspNetCore.Mvc;

namespace ContactVault.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class ApiController : ControllerBase
{
    protected string GetUserIdentityName()
    {
        return HttpContext.User.Identity?.Name!;
    }
}