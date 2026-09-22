const nodemailer = require('nodemailer');

// Rate limit simples em memória: máx. 3 pedidos a cada 15 min por IP.
// Obs: em serverless (Vercel) cada instância tem sua própria memória, então
// isso não é 100% à prova de bots distribuídos, mas já barra a esmagadora
// maioria dos abusos (scripts simples, alguém clicando várias vezes, etc).
// Se quiser algo mais robusto e ainda gratuito, dá pra trocar por Upstash
// Redis (free tier: 10.000 comandos/dia) usando @upstash/ratelimit.
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_REQUESTS = 3;
const hits = new Map(); // ip -> [timestamps]

function isRateLimited(ip) {
    const now = Date.now();
    const timestamps = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
    timestamps.push(now);
    hits.set(ip, timestamps);
    return timestamps.length > MAX_REQUESTS;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Método ${req.method} não permitido.`);
    }

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();

    if (isRateLimited(ip)) {
        return res.status(429).json({ error: 'Muitas tentativas. Tente novamente mais tarde.' });
    }

    const { email } = req.body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'E-mail inválido.' });
    }

    // Conteúdo fixo — nunca aceito do cliente aqui, diferente da rota /api/emailAPI
    // (que é só para o admin logado enviar campanhas).
    const emailContent = `
        <h2>Obrigado por se inscrever na nossa newsletter!</h2>
        <p>Estamos muito felizes em tê-lo conosco. A partir de agora, você receberá atualizações e novidades diretamente no seu e-mail.</p>
        <p>Prepare-se para receber conteúdos incríveis que preparamos especialmente para você. Fique atento aos nossos próximos envios!</p>
        <p>Se tiver alguma dúvida ou sugestão, não hesite em entrar em <a href="https://nuntiun.vercel.app/contacts.html">contato</a> conosco.</p>
        <p>Atenciosamente,<br>A Equipe Nuntiun</p>
    `;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email, // sempre e só o e-mail que a pessoa acabou de informar
            subject: 'Inscrição Newsletter Nuntiun',
            html: emailContent
        });

        return res.status(200).json({ message: 'E-mail enviado com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar e-mail de confirmação:', error);
        return res.status(500).json({ error: 'Erro ao enviar o e-mail.' });
    }
};