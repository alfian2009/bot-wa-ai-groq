const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
require('dotenv').config();

const client = new Client();

client.on('qr', (qr) => {
  console.log('Scan QR ini pakai WhatsApp kamu:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Bot sudah aktif!');
});

client.on('message', async (msg) => {
  const text = msg.body;

  if (!text || msg.fromMe) return;

  const reply = await getAIReply(text);
  msg.reply(reply);
});

async function getAIReply(userPrompt) {
  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'system',
            content: `
Kamu adalah admin Toko Online *Alsabina*. Jawab pertanyaan pelanggan dengan ramah.
Produk: parfum, skincare, semprotan anti-bau.
Katalog: https://alsabina.my.id/katalog
COD bisa, refund hanya pakai video unboxing.
            `.trim()
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        }
      }
    );

    return res.data.choices[0].message.content.trim();
  } catch (e) {
    console.error('AI Error:', e?.response?.data || e.message);
    return 'Maaf kak, AI-nya lagi error 😢. Coba sebentar lagi ya!';
  }
}

client.initialize();