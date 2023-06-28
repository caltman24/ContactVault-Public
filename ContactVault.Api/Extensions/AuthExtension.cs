using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using dotenv.net.Utilities;
namespace ContactVault.Api.Extensions;

internal static class AuthExtension
{
    internal static AuthenticationBuilder AddAuthenticationService(this IServiceCollection services)
    {
        return services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, opts =>
            {
                opts.Authority = EnvReader.GetStringValue("Auth0_Authority");
                opts.Audience = EnvReader.GetStringValue("Auth0_Audience");
                opts.TokenValidationParameters = new TokenValidationParameters
                {
                    NameClaimType = ClaimTypes.NameIdentifier
                };
            });
    }
}