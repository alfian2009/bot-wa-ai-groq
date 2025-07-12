const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {
    const userMessage = msg.body;

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "mixtral-8x7b-32768",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: userMessage }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
                }
            }
        );

        const aiReply = response.data.choices[0].message.content;
        msg.reply(aiReply);

    } catch (err) {
        console.error('Error from Groq API:', err.message);
        msg.reply('Maaf, terjadi kesalahan.');
    }
});

client.initialize();
