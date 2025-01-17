const fetch = require('node-fetch');
const multer = require('multer');
const upload = multer();

module.exports = async (req, res) => {
    const githubToken = process.env.GITHUB_TOKEN;
    const branch = 'main';
    if (!githubToken) {
        const errorMessage = 'Token do GitHub não configurado';
        console.error(errorMessage);
        return res.status(500).json({ error: errorMessage });
    }

    upload.single('image')(req, res, async (err) => {
        if (err) {
            console.error('Erro ao fazer upload da imagem:', err);
            return res.status(500).json({ error: 'Erro ao processar a imagem' });
        }

        if (!req.file) {
            const errorMessage = 'Nenhuma imagem foi enviada';
            console.error(errorMessage);
            return res.status(400).json({ error: errorMessage });
        }

        const imageFile = req.file;
        console.log('Imagem recebida:', imageFile.originalname);
        const imageName = `${Date.now()}-${imageFile.originalname}`;

        console.log('Iniciando upload para o GitHub');
        try {
            const content = imageFile.buffer.toString('base64');
            const response = await fetch(`https://api.github.com/repos/Essashr/nuntiun/contents/images/${imageName}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${githubToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Adicionando imagem ${imageName}`,
                    content,
                    branch
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro ao enviar para o GitHub:', errorData);
                return res.status(500).json({ error: 'Erro ao enviar a imagem para o GitHub', details: errorData });
            }

            const responseData = await response.json();
            const fileUrl = responseData.content.download_url;
            res.status(200).json({ url: fileUrl });
        } catch (error) {
            console.error('Erro ao fazer o upload da imagem:', error.message);
            res.status(500).json({ error: 'Erro ao fazer upload da imagem', details: error.message });
        }
    });
};