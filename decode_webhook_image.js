const fs = require('fs');

// Full base64 image data from webhook response
// This is the actual base64 string from the images array
const base64Image = '/9j/4AAQSkZJRgABAQAAAQABAAD/7QB8UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAGAcAigAWkZCTUQyMzAwMDkxZDAyMDAwMDEyMjIwMDAwODIyNTAwMDA0MjI5MDAwMGRjNGEwMDAwZDc2MzAwMDA0NDdkMDAwMGY1OWQwMDAwYTBhZjAwMDA4M2NiMDAwMAD/2wCEAAUGBgsICwsLCwsNCwsLDQ4ODQ0ODg8NDg4ODQ8QEBARERAQEBAPExITDxARExQUExETFhYWExYVFRYZFhkWFhIBBQUFCgcKCAkJCAsICggLCgoJCQoKDAkKCQoJDA0LCgsLCgsNDAsLCAsLDAwMDQ0MDA0KCwoNDA0NDBMUExMTnP/CABEIAyACgAMBIgACEQEDEQH/xADwAAABBQEBAQEAAAAAAAAAAAADAQIEBQYHAAgJAQEBAQEBAQEAAAAAAAAAAAAAAQIDBAUGEAABAgUDAgMGBQMFAAAAAAABAAIDEBEgMBIhMQRBE0BRBSIyYXGBFEJSkbFQYoIzcqHR8BEAAQMBBQQHBgQGAgIDAQAAAQACEQMEEBIhMSBBUWETIjBxgZHwBTJAobHBQlJy0RQjM2Lh8VCCFUMkYJLCEgEAAgICAwEBAQEBAAAAAAABABEQISAxMEFRYXGBkSDRAAECAwYGAwEBAQAAAAAAAAEAESExQRBRYXGBkSBAobHB8DDR4fFQYP/aAAwDAQACEAMRAD==';

try {
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // Save to file
    const outputPath = 'generated_image_from_webhook.jpg';
    fs.writeFileSync(outputPath, imageBuffer);

    console.log('✅ Image successfully decoded and saved!');
    console.log('📁 File:', outputPath);
    console.log('📊 Size:', imageBuffer.length, 'bytes');
    console.log('');
    console.log('The image is now ready to view.');
} catch (error) {
    console.error('❌ Error decoding image:', error.message);
    process.exit(1);
}
