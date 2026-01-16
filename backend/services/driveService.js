const { google } = require('googleapis');
const path = require('path');

// Configuração do OAuth2
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI // Deve corresponder ao configurado no Google Cloud
);

// Configurar Refresh Token (necessário para acesso offline/servidor)
if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
} else {
    console.warn('⚠️ GOOGLE_REFRESH_TOKEN não encontrado. A galeria pode não funcionar corretamente.');
}

const drive = google.drive({ version: 'v3', auth: oauth2Client });

/**
 * Lista vídeos (MP4) de uma pasta específica no Google Drive.
 * A pasta é buscada pelo nome, que deve corresponder ao ID do usuário.
 * @param {string} userId - ID do usuário (usado como nome da pasta)
 * @returns {Promise<Array>} - Lista de vídeos com metadados
 */
async function listUserVideos(userId) {
    try {
        if (!process.env.GOOGLE_REFRESH_TOKEN) {
            throw new Error('GOOGLE_REFRESH_TOKEN não configurado no servidor.');
        }

        // 1. Encontrar a pasta do usuário
        console.log(`Buscando pasta para usuário: ${userId}`);
        const folderQuery = `mimeType = 'application/vnd.google-apps.folder' and name = '${userId}' and trashed = false`;
        const folderRes = await drive.files.list({
            q: folderQuery,
            fields: 'files(id, name, parents)',
            spaces: 'drive',
        });

        const folders = folderRes.data.files;
        console.log(`Pastas encontradas para ${userId}:`, folders.length);

        if (!folders || folders.length === 0) {
            console.log(`Pasta para usuário ${userId} não encontrada.`);
            return []; // Retorna lista vazia se a pasta não existir
        }

        const folderId = folders[0].id; // Pega a primeira pasta encontrada
        console.log(`Usando pasta ID: ${folderId} (Nome: ${folders[0].name})`);

        // 2. Listar arquivos MP4 dentro dessa pasta
        console.log(`Listando arquivos na pasta ${folderId}...`);
        // Removendo filtro estrito de mimeType para debug, ou ajustando para garantir que pegue tudo
        const fileQuery = `'${folderId}' in parents and trashed = false`;
        // Vamos pegar tudo e filtrar no código ou ver o que vem
        const fileRes = await drive.files.list({
            q: fileQuery,
            fields: 'files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, createdTime, size)',
            orderBy: 'createdTime desc',
        });

        const allFiles = fileRes.data.files;
        console.log(`Total de arquivos encontrados na pasta: ${allFiles.length}`);
        allFiles.forEach(f => console.log(`Arquivo: ${f.name} (${f.mimeType})`));

        // Filtrar apenas videos mp4 (ou o que o usuário quiser)
        // Adicionando application/octet-stream pois as vezes o n8n salva sem mimetype correto
        const files = allFiles.filter(f =>
            f.mimeType.includes('video') ||
            f.name.endsWith('.mp4') ||
            f.mimeType === 'application/octet-stream'
        );
        console.log(`Vídeos filtrados: ${files.length}`);

        // Processar e retornar os arquivos
        return files.map(file => ({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType, // Adicionado mimeType
            // Tenta usar o link da API, se não, constrói um link público de thumbnail
            thumbnail: file.thumbnailLink || `https://drive.google.com/thumbnail?id=${file.id}&sz=w600`,
            downloadLink: file.webContentLink, // Link para baixar
            createdAt: file.createdTime,
            size: file.size
        }));

    } catch (error) {
        console.error('Erro ao listar vídeos do Drive:', error);
        throw error;
    }
}

module.exports = {
    listUserVideos
};
