using Microsoft.AspNetCore.Mvc;

namespace ContactVault.Api.Controllers;

public class ErrorsController : ControllerBase
{
    [Route("/error")]
    [HttpGet]
    [ApiExplorerSettings(IgnoreApi = true)]
    public IActionResult Error()
    {
        return Problem();
    }
}