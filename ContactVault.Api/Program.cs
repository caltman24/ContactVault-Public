using AspNetCoreRateLimit;
using System.Text.Json.Serialization;
using ContactVault.Api.Extensions;
using dotenv.net;

DotEnv.Load();

var builder = WebApplication.CreateBuilder(args);
{
    // needed to store rate limit counters and ip rules
    builder.Services.AddMemoryCache();

    builder.Services.AddControllers().AddJsonOptions(opts =>
        {
            opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });

    builder.Services.AddSpaStaticFiles(opts =>
        {
            opts.RootPath = builder.Environment.IsEnvironment("Preview") ? "../Client/dist" : "dist";
        });

    builder.Services.AddGzipCompression();

    // Swagger services
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGenService();

    builder.Services.AddAuthenticationService();
    builder.Services.AddAuthorization();


    builder.Services.AddRateLimiting(builder.Configuration);

    builder.Services.AddDependencies(builder.Environment);

    builder.Logging.AddLogging(builder.Configuration);
}

var app = builder.Build();
{
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // I think these are ordered properlly 
    app.UseExceptionHandler("/error");
    app.UseSpaStaticFiles();
    app.UseRouting();
    app.UseAuthentication();
    app.UseAuthorization();
    app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
    app.UseClientRateLimiting();
    app.UseResponseCompression();

    app.UseSpa(opts =>
    {
        if (app.Environment.IsDevelopment()) opts.UseProxyToSpaDevelopmentServer("https://localhost:3000");
    });

    app.Run();
}