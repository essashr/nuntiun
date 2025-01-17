import fetch from 'node-fetch';

module.exports = async (req, res) => {
    const githubToken = process.env.GITHUB_TOKEN;
    const branch = 'main';

    if (!githubToken) {
        return res.status(500).json({ error: 'Token do GitHub não configurado' });
    }

    const { imageUrl } = req.body;
    if (!imageUrl) {
        return res.status(400).json({ error: 'Nenhuma URL de imagem fornecida' });
    }

    const imageName = imageUrl.split('/').pop();
    try {
        const sha = await getSha(imageName);
        const response = await fetch(`https://api.github.com/repos/Essashr/nuntiun/contents/images/${imageName}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Deletando a imagem ${imageName}`,
                branch,
                sha
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(500).json({ error: 'Erro ao excluir a imagem no GitHub', details: errorData });
        }

        res.status(200).json({ message: `Imagem ${imageName} excluída com sucesso!` });
    } catch (error) {
        console.error('Erro ao excluir a imagem:', error.message);
        res.status(500).json({ error: 'Erro ao excluir a imagem', details: error.message });
    }
};

async function getSha(imageName) {
    const githubToken = process.env.GITHUB_TOKEN;
    const response = await fetch(`https://api.github.com/repos/Essashr/nuntiun/contents/images/${imageName}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${githubToken}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    if (!response.ok) throw new Error('Erro ao buscar SHA da imagem');
    return data.sha;
}
