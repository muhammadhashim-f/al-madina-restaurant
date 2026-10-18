import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Google Gemini AI SDK
const rawKey = process.env.GEMINI_API_KEY;
const geminiApiKey = rawKey && rawKey !== 'MY_GEMINI_API_KEY' && !rawKey.includes('PLACEHOLDER') ? rawKey : null;
let ai: GoogleGenAI | null = null;
try {
  if (geminiApiKey) {
    ai = new GoogleGenAI({ apiKey: geminiApiKey });
    console.log('GoogleGenAI initialized with active API key.');
  } else {
    console.log('No external Gemini API key provided; intelligent built-in AI host enabled.');
  }
} catch (err) {
  console.warn('GoogleGenAI initialization warning:', err);
}

const SYSTEM_INSTRUCTION = `Aap Al Madina Restaurant (Karachi, Pakistan) ke Royal AI Shahi Host hain.
Customer aapse jis zuban mein baat kare (Roman Urdu, Urdu, ya English), aap usi zuban mein nihayat adab, apnaiyat aur VIP hospitality ke sath tafseeli jawab den.

=== RESTAURANT KI ZAROORI MAALOOMAAT ===
• Naam: Al Madina Restaurant (Shahi Dastarkhwan)
• Location: 25, 2 1/2 Korangi, Sector 33-B / 36-B, Korangi, Karachi, Pakistan.
• Phone & WhatsApp: 0307-0769139
• Timings: Dopahar 12:00 PM se Raat 12:00 AM (Rozana open).
• Home Delivery: Karachi bhar mein sirf Rs 150 delivery charge hai. Live GPS tracking dastiyab hai.
• Seating & Reservation: VIP Family Hall aur Shahi Dawat seating reservation website se dastiyab hai.

=== SAKHT HIDAYAAT (RULES) ===
1. TYPO TOLERANCE: Agar customer spelling mistake kare jese 'Button' ya 'muton' ya 'batan' likhe, to foran samajh jayein ke wo 'Mutton' ki baat kar raha hai.
2. COMPLETE BILL ESTIMATE: Har item ka alag rate, quantity, delivery fee (Rs 150) aur Grand Total hisab bana kar pesh karein.
3. RECIPES & BENEFITS: Dishes ki preparation recipe aur sehat bakhsh faiday VIP andaz mein batayein.
4. Jawab tafseeli, ba-adab aur dilchasp ho, aur aakhir mein customer se agla shahi mashwara poochein.`;

// API Route for AI Chatbot
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (ai) {
    try {
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
      const generatePromise = (async () => {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.7,
            },
          });
          return response.text?.trim() || null;
        } catch (e: any) {
          console.warn('Gemini 2.5 flash error:', e?.message || e);
          try {
            const fallbackRes = await ai.models.generateContent({
              model: 'gemini-2.5-flash-lite',
              contents: message,
              config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.7,
              },
            });
            return fallbackRes.text?.trim() || null;
          } catch {
            return null;
          }
        }
      })();

      const replyText = await Promise.race([generatePromise, timeoutPromise]);
      if (replyText) {
        return res.json({ reply: replyText, source: 'gemini' });
      }
    } catch (err: any) {
      console.error('Server Gemini AI Error:', err?.message || err);
      return res.json({ reply: null, error: err?.message || String(err), source: 'fallback' });
    }
  }

  return res.json({ reply: null, source: 'fallback' });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.use((_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Al Madina Restaurant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});