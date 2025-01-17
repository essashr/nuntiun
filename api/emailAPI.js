const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    if (req.method === 'POST') {
        const { emailContent, recipients, emailSubject } = req.body;

        if (!emailContent || !recipients || recipients.length === 0 || !emailSubject) {
            return res.status(400).json({ error: 'Conteúdo do e-mail, destinatários e assunto são obrigatórios.' });
        }

        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_PASS
                }
            });
            
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: recipients.join(', '),
                subject: emailSubject,
                html: emailContent
            };
            await transporter.sendMail(mailOptions);
            return res.status(200).json({ message: 'E-mail enviado com sucesso!' });
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            return res.status(500).json({ error: 'Erro ao enviar o e-mail.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Método ${req.method} não permitido.`);
    }
};
