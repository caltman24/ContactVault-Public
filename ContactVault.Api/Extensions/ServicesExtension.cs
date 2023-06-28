using System.IO.Compression;
using dotenv.net.Utilities;
using Amazon;
using Amazon.Extensions.NETCore.Setup;
using Amazon.Runtime;
using Amazon.S3;
using ContactVault.DataAccess.Repositories;
using ContactVault.DataAccess.Services;
using Microsoft.AspNetCore.ResponseCompression;

namespace ContactVault.Api.Extensions;

internal static class ServicesExtensions
{
    internal static IServiceCollection AddDependencies(this IServiceCollection services, IWebHostEnvironment enviroment)
    {
        string connectionString;
        string awsAccessKeyId = EnvReader.GetStringValue("AwsAccessKeyId");
        string awsSecretAccessKey = EnvReader.GetStringValue("AwsSecretAccessKey");

        if (enviroment.IsProduction())
        {

            connectionString = EnvReader.GetStringValue("DB_ConnectionString_Prod");
        }
        else
        {
            connectionString = EnvReader.GetStringValue("DB_ConnectionString_Dev");
        }

        services.AddScoped<IUserRepository>(_ => new UserRepository(connectionString));
        services.AddScoped<IContactRepository>(_ => new ContactRepository(connectionString));
        services.AddScoped<IImageUploadService, ImageUploadService>();

        services.AddAWSService<IAmazonS3>(new AWSOptions
        {
            Region = RegionEndpoint.USEast2,
            Credentials = new BasicAWSCredentials(
                awsAccessKeyId,
                awsSecretAccessKey)
        });

        return services;
    }

    internal static IServiceCollection AddGzipCompression(this IServiceCollection services)
    {
        return services.AddResponseCompression(opts =>
        {
            opts.EnableForHttps = true;
            opts.Providers.Add<GzipCompressionProvider>();
        }).Configure<GzipCompressionProviderOptions>(options => { options.Level = CompressionLevel.SmallestSize; });
    }
}