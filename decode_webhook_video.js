const fs = require('fs');

// Full base64 VIDEO data from webhook response
// This is the actual base64 string from the images array (which is actually video)
const base64Video = '/9j/4AAQSkZJRgABAQAAAQABAAD/7QB8UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAGAcAigAWkZCTUQyMzAwMDkxZDAyMDAwMDEyMjIwMDAwODIyNTAwMDA0MjI5MDAwMGRjNGEwMDAwZDc2MzAwMDA0NDdkMDAwMGY1OWQwMDAwYTBhZjAwMDA4M2NiMDAwMAD/2wCEAAUGBgsICwsLCwsNCwsLDQ4ODQ0ODg8NDg4ODQ8QEBARERAQEBAPExITDxARExQUExETFhYWExYVFRYZFhkWFhIBBQUFCgcKCAkJCAsICggLCgoJCQoKDAkKCQoJDA0LCgsLCgsNDAsLCAsLDAwMDQ0MDA0KCwoNDA0NDBMUExMTnP/CABEIAyACgAMBIgACEQEDEQH/xADwAAABBQEBAQEAAAAAAAAAAAADAQIEBQYHAAgJAQEBAQEBAQEAAAAAAAAAAAAAAQIDBAUGEAABAgUDAgMGBQMFAAAAAAABAAIDEBEgMBIhMQRBE0BRBSIyYXGBFEJSkbFQYoIzcqHR8BEAAQMBBQQHBgQGAgIDAQAAAQACEQMEEBIhMSBBUWETIjBxgZHwBTJAobHBQlJy0RQjM2Lh8VCCFUMkYJLCEgEAAgICAwEBAQEBAAAAAAABABEQISAxMEFRYXGBkSDRAAECAwYGAwEBAQAAAAAAAAEAESExQRBRYXGBkSBAobHB8DDR4fFQYP/aAAwDAQACEAMRAD==';

try {
    // Convert base64 to buffer
    const videoBuffer = Buffer.from(base64Video, 'base64');

    // Save as MP4 file
    const outputPath = 'generated_video_from_webhook.mp4';
    fs.writeFileSync(outputPath, videoBuffer);

    console.log('✅ Vídeo decodificado e salvo com sucesso!');
    console.log('📁 Arquivo:', outputPath);
    console.log('📊 Tamanho:', videoBuffer.length, 'bytes');
    console.log('');
    console.log('O vídeo está pronto para visualização.');
} catch (error) {
    console.error('❌ Erro ao decodificar vídeo:', error.message);
    process.exit(1);
}
