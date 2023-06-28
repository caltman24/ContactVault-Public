using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using ContactVault.DataAccess.Services;
using Moq;

namespace ContactVault.DataAccess.Tests.ServiceTests;

public class ImageUploadServiceTests
{
    private readonly Mock<IAmazonS3> _s3ClientMock = new();
    private readonly IImageUploadService _uploadService;

    public ImageUploadServiceTests()
    {
        _uploadService = new ImageUploadService(_s3ClientMock.Object);
    }

    [Fact]
    public async void ListFromBucketAsync_ShouldReturnObjectsResponse()
    {
        // Arrange
        var expectedResponse = new ListObjectsV2Response
        {
            S3Objects = new List<S3Object>
            {
                new() { Key = "test1.png", Size = 1024 },
                new() { Key = "test2.png", Size = 2048 },
                new() { Key = "test3.png", Size = 3072 }
            }
        };

        _s3ClientMock
            .Setup(x => x.ListObjectsV2Async(
                It.IsAny<ListObjectsV2Request>(), default))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _uploadService.ListFromBucketAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(expectedResponse.S3Objects.Count, result.Count);
        foreach (var s3Object in expectedResponse.S3Objects)
        {
            var match = result.FirstOrDefault(o => o.Key == s3Object.Key && o.Size == s3Object.Size);
            Assert.NotNull(match);
        }
    }

    [Fact]
    public async Task UploadToBucketAsync_ShouldUpload()
    {
        // Arrange
        Mock<ITransferUtility> transferUtilityMock = new();

        var memoryStream = new MemoryStream(new byte[] { 1, 2, 3, 4, 5 });
        const string fileName = "test.jpg";
        const string bucketName = "bucket";
        const string prefix = "prefix";
        const string expectedKey = prefix + fileName;

        // Act
        var result = await _uploadService.UploadToBucketAsync(memoryStream, fileName);

        // Assert
        transferUtilityMock.Setup(x => x.UploadAsync(
            It.Is<TransferUtilityUploadRequest>(r =>
                r.BucketName == bucketName &&
                r.Key == expectedKey &&
                r.InputStream == memoryStream
            ), default));

        Assert.Equal(expectedKey, result);
    }

    [Fact]
    public void GenerateFileName_ShouldReturnValidFileNameWithExtension()
    {
        var validExtensions = new[]
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };

        foreach (var extension in validExtensions)
        {
            var fileName = _uploadService.GenerateFileName(extension);
            Assert.NotNull(fileName);
            Assert.NotEmpty(fileName);
            Assert.EndsWith(extension, fileName);
        }
    }

    [Fact]
    public void GenerateObjectUrl_ShouldReturnValidUrl()
    {
        const string objectKey = "prefix/objecturl.png";
        var objectUrl = _uploadService.GenerateObjectUrl(objectKey);

        Assert.NotNull(objectUrl);
        Assert.EndsWith(objectKey, objectUrl);
    }
}