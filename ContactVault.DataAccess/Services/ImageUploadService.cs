using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;

namespace ContactVault.DataAccess.Services;

public interface IImageUploadService
{
    Task<List<S3Object>> ListFromBucketAsync();
    string GetFromBucket();
    Task<string> UploadToBucketAsync(Stream memoryStream, string fileName);

    Task DeleteFromBucketAsync(string objectKey);

    string GenerateFileName(string fileExtension);

    string GenerateObjectUrl(string objectKey);
}

public class ImageUploadService : IImageUploadService
{
    private const string BucketName = "BucketName";
    private const string Prefix = "Prefix";
    private readonly IAmazonS3 _s3Client;
    private readonly string Region = RegionEndpoint.USEast2.SystemName;

    public ImageUploadService(IAmazonS3 s3Client)
    {
        _s3Client = s3Client;
    }

    public async Task<string> UploadToBucketAsync(Stream memoryStream, string fileName)
    {
        using var transferUtility = new TransferUtility(_s3Client);
        var key = Prefix + fileName;

        // Optimize Image
        using var optimizedStream =
            await OptimizeImageStreamAsync(memoryStream, jpegQuality: 50, PngCompressionLevel.Level9);

        var uploadRequest = new TransferUtilityUploadRequest
        {
            BucketName = BucketName,
            Key = key,
            InputStream = optimizedStream
        };

        // Possibly save the Key to the contact
        await transferUtility.UploadAsync(uploadRequest);

        return key;
    }


    public string GetFromBucket()
    {
        var imageUrl = _s3Client.GeneratePreSignedURL(
            BucketName,
            "",
            DateTime.Now.AddMinutes(2),
            null);

        return imageUrl;
    }

    public async Task DeleteFromBucketAsync(string objectKey)
    {
        var deleteObjectRequest = new DeleteObjectRequest
        {
            BucketName = BucketName,
            Key = objectKey
        };

        await _s3Client.DeleteObjectAsync(deleteObjectRequest);
    }

    public async Task<List<S3Object>> ListFromBucketAsync()
    {
        var request = new ListObjectsV2Request
        {
            BucketName = BucketName,
            Prefix = Prefix
        };

        var bucketObjects = await _s3Client.ListObjectsV2Async(request);

        return bucketObjects.S3Objects;
    }

    public string GenerateFileName(string fileExtension)
    {
        return Guid.NewGuid() + fileExtension;
    }

    public string GenerateObjectUrl(string objectKey)
    {
        // ObjectURL Format:  $"https://{bucketName}.s3.{regionEndpoint.SystemName}.amazonaws.com/{objectKey}";
        return $"https://{BucketName}.s3.{Region}.amazonaws.com/{objectKey}";
    }

    private static async Task<MemoryStream> OptimizeImageStreamAsync(Stream memoryStream, int jpegQuality,
        PngCompressionLevel pngCompressionLevel)
    {
        using var image = await Image.LoadAsync(memoryStream);
        var imageFormat = image.Metadata.DecodedImageFormat;
        IImageEncoder encoder;

        // Resize Image if necessary
        if (image.Width > 300)
        {
            image.Mutate(x => x.Resize(300, 0));
        }

        if (imageFormat == JpegFormat.Instance)
            encoder = new JpegEncoder { Quality = jpegQuality };
        else if (imageFormat == PngFormat.Instance)
            encoder = new PngEncoder { CompressionLevel = pngCompressionLevel };
        else
            throw new NotSupportedException($"Image format \"{imageFormat?.Name}\" not supported");

        var compressedStream = new MemoryStream();

        await image.SaveAsync(compressedStream, encoder);

        // Reset stream position
        compressedStream.Position = 0;

        return compressedStream;
    }
}

public record UploadedImage(
    string ObjectUrl,
    string ObjectKey
);