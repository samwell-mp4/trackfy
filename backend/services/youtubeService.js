const fs = require('fs');
const path = require('path');
const youtubedl = require('youtube-dl-exec');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

// Configurar path do ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

const DOWNLOAD_DIR = path.join(__dirname, '../downloads');
const OUTPUT_DIR = path.join(__dirname, '../public/highlights');

// Garantir que diretórios existem
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Baixa um vídeo do YouTube
 * @param {string} url URL do vídeo
 * @returns {Promise<string>} Caminho do arquivo baixado
 */
async function downloadVideo(url) {
    const timestamp = Date.now();
    const outputTemplate = path.join(DOWNLOAD_DIR, `video_${timestamp}.%(ext)s`);

    console.log(`Iniciando download de: ${url}`);

    try {
        const output = await youtubedl(url, {
            output: outputTemplate,
            format: 'mp4',
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:youtube.com', 'user-agent:googlebot']
        });

        // Encontrar o arquivo baixado (pode ter extensão diferente dependendo do yt-dlp)
        // Mas forçamos mp4 acima.
        const expectedFile = path.join(DOWNLOAD_DIR, `video_${timestamp}.mp4`);

        // Pequeno delay para garantir sistema de arquivos
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (fs.existsSync(expectedFile)) {
            return expectedFile;
        }

        // Se não achou exatamente, tenta listar diretório
        const files = fs.readdirSync(DOWNLOAD_DIR);
        const match = files.find(f => f.startsWith(`video_${timestamp}`));
        if (match) return path.join(DOWNLOAD_DIR, match);

        throw new Error('Arquivo não encontrado após download');
    } catch (error) {
        console.error('Erro no download:', error);
        throw error;
    }
}

/**
 * Extrai destaques do vídeo (Heurística: 3 clipes de 15s)
 * @param {string} videoPath Caminho do vídeo original
 * @returns {Promise<Array<string>>} Lista de caminhos dos clipes gerados (relativos para frontend)
 */
async function extractHighlights(videoPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) return reject(err);

            const duration = metadata.format.duration;
            if (!duration) return reject(new Error('Não foi possível obter duração do vídeo'));

            // Definir pontos de corte: 20%, 50%, 80% do vídeo
            const startTimes = [
                duration * 0.2,
                duration * 0.5,
                duration * 0.8
            ];

            const clipDuration = 15; // 15 segundos
            const generatedFiles = [];
            const promises = [];

            startTimes.forEach((start, index) => {
                const outputFilename = `highlight_${Date.now()}_${index + 1}.mp4`;
                const outputPath = path.join(OUTPUT_DIR, outputFilename);
                const publicPath = `/highlights/${outputFilename}`; // Caminho para frontend

                const p = new Promise((res, rej) => {
                    ffmpeg(videoPath)
                        .setStartTime(start)
                        .setDuration(clipDuration)
                        .output(outputPath)
                        .on('end', () => {
                            console.log(`Clipe ${index + 1} gerado: ${outputPath}`);
                            generatedFiles.push(publicPath);
                            res();
                        })
                        .on('error', (err) => {
                            console.error(`Erro ao gerar clipe ${index + 1}:`, err);
                            rej(err);
                        })
                        .run();
                });
                promises.push(p);
            });

            Promise.all(promises)
                .then(() => resolve(generatedFiles))
                .catch(reject);
        });
    });
}

module.exports = {
    downloadVideo,
    extractHighlights
};
