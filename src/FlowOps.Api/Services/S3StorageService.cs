using Amazon.S3;
using Amazon.S3.Model;

namespace FlowOps.Api.Services;

public class S3StorageService
{
    private readonly IAmazonS3 _s3;
    private readonly string _bucketName;

    public S3StorageService(IAmazonS3 s3, IConfiguration config)
    {
        _s3 = s3;
        _bucketName = config["AWS:BucketName"]!;
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        var key = $"products/{Guid.NewGuid()}{Path.GetExtension(fileName)}";

        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = fileStream,
            ContentType = contentType
        };

        await _s3.PutObjectAsync(request);

        return key;
    }

    public string GetPresignedUrl(string key)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _bucketName,
            Key = key,
            Expires = DateTime.UtcNow.AddHours(1),
            Verb = HttpVerb.GET
        };

        return _s3.GetPreSignedURL(request);
    }

    public async Task DeleteAsync(string key)
    {
        await _s3.DeleteObjectAsync(_bucketName, key);
    }
}
