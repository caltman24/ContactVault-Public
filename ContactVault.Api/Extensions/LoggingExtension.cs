using Serilog;

namespace ContactVault.Api.Extensions;

public static class LoggingExtension
{
    public static ILoggingBuilder AddLogging(this ILoggingBuilder logging, IConfiguration config)
    {
        var logger = new LoggerConfiguration()
            .ReadFrom.Configuration(config)
            .CreateLogger();

        return logging.ClearProviders().AddSerilog(logger);
    }
}