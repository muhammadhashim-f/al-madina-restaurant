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
• Phone & WhatsApp: 0300-1234567
• Timings: Dopahar 12:00 PM se Raat 12:00 AM (Rozana open).
• Home Delivery: Karachi bhar mein sirf Rs 150 delivery charge hai. Live GPS tracking dastiyab hai.
• Seating & Reservation: VIP Family Hall aur Shahi Dawat seating reservation website se dastiyab hai.

=== MENU DISHES & OFFICIAL RATES ===
1. VIP Shahi Dawat Platter (👑 VIP Selection): Rs 2,400 (Discount 20%)
   - Khasiyat: Saffron Biryani, 4x Char-grilled Seekh Kebabs, Malai Boti, 2 Rogheni Naan, Fresh Mint Salad, Special Raita & 2x Shahi Gulab Jamun. Serving: 3-4 persons.
2. VIP Royal Handi Mutton Feast (👑 VIP Selection): Rs 2,200 (Discount 15%)
   - Khasiyat: Mitti Di Handi Mutton Feast: Pure Desi Ghee mein dum diya gaya taaza desi bakray ka gosht, roasted zeera tadka, 4 Rogheni Naan aur 2 chilled Kashmiri Chai. Serving: 2-3 persons.
3. Shahi Malai Boti (Charcoal, Starters): Rs 780
   - Khasiyat: Boneless chicken boti marinated in malai cream, cashew paste, green cardamom & gentle white pepper.
4. Chicken Seekh Kebab (Starters): Rs 650
   - Khasiyat: Taaza chicken ke bareek qeeme mein 16 shahi khushbudar masalay, saffron, taaza dhaniya aur koyla-dam char-grill (4 Pcs).
5. Vegetable Samosa (Starters): Rs 250 (Discount 20%)
   - Khasiyat: Hath se baili hui khas khasta patti, taaza aaloo, matar, roasted zeera aur anardana (2 Pcs Plate).
6. Mutton Karahi (Mains): Rs 1,450
   - Khasiyat: Desi ghee aur mitti ki handi mein dum diya gaya taaza desi bakray ka gosht (1 KG Handi).
7. Chicken Biryani (Mains): Rs 850 (Discount 20%)
   - Khasiyat: Dum pukht lambe daanay dar sela basmati chawal, taaza desi chicken, aaloo-bukhara aur sadiyon purana shahi biryani masala.
8. Dal Makhani (Mains): Rs 600
   - Khasiyat: 12-hour slow simmered kale urad aur raajma, asli makhan aur taaza malai ka shahi tadka.
9. Gulab Jamun (Desserts): Rs 300
   - Khasiyat: Asli khoya aur pisi elaichi se tayyar shuda garam naram gulab jamun, kewra-gulab sheera (2 Pcs Plate).
10. Kashmiri Chai (Drinks): Rs 200
    - Khasiyat: Pahari sabz patti se 4 ghantay karr kar nikala gaya qudrati gulabi rang, doodh, kuta badam, pista.
11. Fresh Lime Soda (Drinks): Rs 180
    - Khasiyat: Taaza desi leemo, pudina, kala namak aur chilled sparkling soda.

=== SAKHT HIDAYAAT (RULES) ===
1. TYPO TOLERANCE: Agar customer spelling mistake kare jese 'Button' ya 'muton' ya 'batan' likhe, to foran samajh jayein ke wo 'Mutton' (bakray ke gosht) ki baat kar raha hai! Uske sawal ka seedha Mutton Karahi / Mutton dishes ke rates aur details ke sath jawab dein, bilawaja Chicken Biryani na chipkayen!
2. COMPLETE BILL ESTIMATE: Agar customer kisi bhi items ka bill banane ka kahe, to har item ka alag rate, quantity, delivery fee (Rs 150) aur Grand Total hisab bana kar pesh karein, sath sehat bakhsh faiday bhi batayein.
3. RECIPES & BENEFITS: Kisi bhi dish ki preparation recipe aur sehat bakhsh faiday poochein to boht VIP aur shahi andaz mein tafseel batayein.
4. ORDER PLACEMENT: Agar customer apna pata (address) aur items bataye, to order auto-confirm ka shahi andaz mein khushamdeed kahein.
5. NON-RESTAURANT TOPICS: Agar koi gher-mutaliqa topic (cricket, politics, coding, etc.) pooche to nihayat tehzeeb se maazrat kar ke Al Madina Restaurant ke khano par wapis layein.
6. BARI AUR SHAHI GUFTAGU: Jawab tafseeli, ba-adab aur dilchasp ho, aur aakhir mein customer se agla shahi mashwara ya sawal poochein taakay baat jari rahay.`;

// API Route for AI Chatbot
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // If Gemini client initialized, call real Gemini AI
  if (ai) {
    try {
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
      const generatePromise = (async () => {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: message,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.7,
            },
          });
          return response.text?.trim() || null;
        } catch (e: any) {
          console.warn('Gemini 3.1 flash lite error:', e?.message || e);
          return null;
        }
      })();

      const replyText = await Promise.race([generatePromise, timeoutPromise]);
      if (replyText) {
        return res.json({ reply: replyText, source: 'gemini' });
      }
    } catch (err: any) {
      console.error('Server Gemini AI Error:', err?.message || err);
      return res.json({
        reply: null,
        error: err?.message || String(err),
        source: 'fallback',
      });
    }
  }

  // Graceful intelligent fallback if AI service temporary glitch
  return res.json({
    reply: null,
    source: 'fallback',
  });
});

// Setup Vite middleware in dev or serve dist in production
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
    // In Express 5, use fallback middleware for SPA routing
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
