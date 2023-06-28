using ContactVault.Contracts.Contact;
using ContactVault.DataAccess.Models;
using ContactVault.DataAccess.Repositories;
using ContactVault.DataAccess.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace ContactVault.Api.Controllers;

internal record FormData<T>(
    IFormFile? Image,
    T Contact);

[Authorize]
public class ContactController : ApiController
{
    private readonly IContactRepository _contactRepository;
    private readonly IImageUploadService _imageUploadService;
    private readonly ILogger<ContactController> _logger;

    public ContactController(IContactRepository contactRepository, ILogger<ContactController> logger,
        IImageUploadService imageUploadService)
    {
        _contactRepository = contactRepository;
        _logger = logger;
        _imageUploadService = imageUploadService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllContacts()
    {
        var userId = GetUserIdentityName();
        var userContacts = await _contactRepository.GetAllAsync(userId);

        var contactResponse = MapContactResponse(userContacts);

        return Ok(contactResponse);
    }

    [HttpGet("{id:int}")]
    public IActionResult GetContact(int id)
    {
        var contact = _contactRepository.GetById(id);

        if (contact == null) return NotFound($"contact with id {id} not found");

        var contactResponse = MapContactResponse(contact);

        return Ok(contactResponse);
    }

    [HttpPost]
    public async Task<IActionResult> AddContact()
    {
        var userId = GetUserIdentityName();
        var (formImage, createContactRequest) = ReadFromMultipartForm<CreateContactRequest>(HttpContext.Request.Form);

        var newContact = new Contact
        {
            FirstName = createContactRequest.FirstName,
            LastName = createContactRequest.LastName,
            ImageUrl = createContactRequest.ImageUrl,
            EmailAddresses = createContactRequest.EmailAddresses,
            PhoneNumbers = createContactRequest.PhoneNumbers,
            SocialMediaAccounts = createContactRequest.SocialMediaAccounts
        };

        if (formImage != null)
        {
            var uploadedImage = await UploadToBucket(formImage);

            // Add uploaded Image data to contact info
            newContact.ImageKey = uploadedImage.ObjectKey;
            newContact.ImageUrl = uploadedImage.ObjectUrl;

            _logger.LogDebug("Upload to bucket complete @ upsert contact");
        }

        var newId = await _contactRepository.AddAsync(newContact, userId);
        newContact.Id = newId;

        var contactResponse = MapContactResponse(newContact);

        return CreatedAtAction(nameof(GetContact), new { id = newId }, contactResponse);
    }

    [HttpPut]
    public async Task<IActionResult> UpsertContact()
    {
        var userId = GetUserIdentityName();
        var (formImage, upsertContactRequest) =
            ReadFromMultipartForm<UpsertContactRequest>(HttpContext.Request.Form);

        var upsertContact = new Contact
        {
            Id = upsertContactRequest.Id,
            FirstName = upsertContactRequest.FirstName,
            LastName = upsertContactRequest.LastName,
            ImageUrl = upsertContactRequest.ImageUrl,
            EmailAddresses = upsertContactRequest.EmailAddresses,
            PhoneNumbers = upsertContactRequest.PhoneNumbers,
            SocialMediaAccounts = upsertContactRequest.SocialMediaAccounts
        };

        // If the client cleared the image OR there is an uploaded image: Grab the imagekey
        if (upsertContactRequest.DeleteImageRequest || formImage != null)
        {
            // grab existing imageKey
            // FIXME: We are making a request here when f
            var imageKey = await _contactRepository.GetImageKey(upsertContact.Id);
            if (imageKey != null)
            {
                await _imageUploadService.DeleteFromBucketAsync(imageKey);
                upsertContact.ImageKey = null;
                // We do not set contact.ImageUrl here because it is set by the client;
            }
        }

        // If there is a form image check if there is an image key. 
        if (formImage != null)
        {
            var uploadedImage = await UploadToBucket(formImage);

            // Add uploaded Image data to contact info
            upsertContact.ImageKey = uploadedImage.ObjectKey;
            upsertContact.ImageUrl = uploadedImage.ObjectUrl;


            _logger.LogDebug("Upload to bucket complete @ upsert contact {object}", uploadedImage.ToString());
        }

        await _contactRepository.UpsertAsync(upsertContact, userId);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteContact(int id)
    {
        var imageKey = await _contactRepository.GetImageKey(id);

        if (imageKey != null) await _imageUploadService.DeleteFromBucketAsync(imageKey);

        await _contactRepository.DeleteAsync(id);

        return NoContent();
    }

    private async Task<UploadedImage> UploadToBucket(IFormFile image)
    {
        await using var stream = new MemoryStream();

        await image.CopyToAsync(stream);
        stream.Position = 0; // Reset the stream to the beginning

        var fileExtension = Path.GetExtension(image.FileName);

        var randomFileName = _imageUploadService.GenerateFileName(fileExtension);

        var objectKey = await _imageUploadService.UploadToBucketAsync(stream, randomFileName);

        var objectUrl = _imageUploadService.GenerateObjectUrl(objectKey);

        return new UploadedImage(objectUrl, objectKey);
    }

    private FormData<T> ReadFromMultipartForm<T>(IFormCollection form)
    {
        var objectKey = form.Keys.ToArray()[0];
        var isValid = form.TryGetValue(objectKey, out var rawJson);

        if (!isValid) throw new Exception($"Failed to read object value from key \"{objectKey}\" ");

        var objectModel = JsonConvert.DeserializeObject<T>(rawJson);

        if (objectModel is null)
            throw new JsonSerializationException($"Failed to deserialize json object {nameof(objectModel)}");

        var image = form.Files.Count > 0 ? form.Files[0] : null;

        _logger.LogDebug("Succeeded to read multipart form data: {object}\n{image}", objectModel.ToString(),
            image?.ToString());

        return new FormData<T>(image, objectModel);
    }

    private static ContactResponse MapContactResponse(Contact contact)
    {
        return new ContactResponse(
            contact.Id,
            contact.ImageUrl,
            contact.FirstName,
            contact.LastName,
            contact.EmailAddresses,
            contact.PhoneNumbers,
            contact.SocialMediaAccounts);
    }

    private static List<ContactResponse> MapContactResponse(List<Contact> contacts)
    {
        List<ContactResponse> output = new();

        if (contacts.Count == 0) return output;

        output.AddRange(
            contacts.Select(contact =>
                new ContactResponse(
                    contact.Id,
                    contact.ImageUrl,
                    contact.FirstName,
                    contact.LastName,
                    contact.EmailAddresses,
                    contact.PhoneNumbers,
                    contact.SocialMediaAccounts)));

        return output;
    }
}