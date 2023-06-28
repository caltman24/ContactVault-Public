using AspNetCoreRateLimit;

namespace ContactVault.Api.Extensions;

public static class RateLimitExtension
{
    public static IServiceCollection AddRateLimiting(this IServiceCollection services, IConfiguration config)
    {
        //load general configuration from appsettings.json
        services.Configure<ClientRateLimitOptions>(config.GetSection("ClientRateLimiting"));

        // inject counter and rules stores
        services.AddInMemoryRateLimiting();

        services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

        return services;
    }
}