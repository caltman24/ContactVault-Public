using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;

namespace ContactVault.Api.Extensions;

public static class SwaggerGenExtension
{
    internal static IServiceCollection AddSwaggerGenService(this IServiceCollection services)
    {
        return services.AddSwaggerGen(opts =>
        {
            opts.SwaggerDoc("v1", new OpenApiInfo
            {
                Version = "v1",
                Title = "Contact Vault API",
                Description = "The api for Contact Vault"
            });
            opts.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey,
                BearerFormat = "JWT",
                Scheme = JwtBearerDefaults.AuthenticationScheme,
                Description = "Jwt bearer for auth0 authentication"
            });
            opts.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Id = JwtBearerDefaults.AuthenticationScheme,
                            Type = ReferenceType.SecurityScheme
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });
    }
}