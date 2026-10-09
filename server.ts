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
1. Desi Mitti Handi Mutton Karahi (1 KG): Rs 1,450
   - Khasiyat: Taaza zabiha desi bakray ka gosht, organic pure desi ghee, tamatar, roasted zeera tadka, pissa hua garam masala.
   - Faiday: High zinc & organic iron, stamina aur natural vitality ke liye behtareen.
2. VIP Royal Handi Mutton Feast Platter: Rs 2,200
   - Khasiyat: 1 KG Mutton Karahi + 4x Rogheni Naan + Fresh Salad & Mint Raita + 2 chilled Kashmiri Pink Chai.
3. Dum Pukht Chicken Biryani: Rs 680
   - Khasiyat: Zafrani sela basmati chawal, degh mein slow dum cooked tender marinated chicken, kewra water aromatics.
   - Faiday: High protein, saffron antioxidants, hazme ke liye behtareen.
4. Shahi Mutton Dum Biryani: Rs 950
   - Khasiyat: Mandi bakray ke chaamp ka naram gosht aur royal biryani spices.
5. Charcoal Seekh Kebab (4 Pcs): Rs 650
   - Khasiyat: Koylay par seekhein, desi masalay, fresh pudina chatni ke sath.
   - Faiday: Lean char-grilled protein, low calorie.
6. 12-Hour Slow Simmered Dal Makhani: Rs 600
   - Khasiyat: Kali daal makkhan aur taaza malai ke shahi tadkay ke sath.
7. Shahi Khoya Gulab Jamun (2 Pcs): Rs 300
   - Khasiyat: Khalis khoya dumplings, desi ghee fry, elaichi-rose warm syrup.
8. Authentic Kashmiri Pink Chai: Rs 200
   - Khasiyat: Slow brewed pink tea, pista badam crunch, natural cardamom.
9. Crisp Vegetable Samosa (2 Pcs Plate): Rs 200
10. VIP Shahi Family Dawat Deal (20% Off): Rs 1,920

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
