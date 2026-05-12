import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { createClient } from '@supabase/supabase-js';

// --- SOZLAMALAR ---
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8541772961:AAEOt48FaNzK966bkN7bkfBm5UnJnl-Q8Kk";
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Supabase ulanishi (image_d2e4ee.png dan)
const supabaseUrl = 'https://kyqudwhiwrrsfcpxjyef.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0UmVmIjoia3lxdWR3aGl3cnJzZmNweGp5ZWYiLCJpYXQiOjE3NDcwNzE4NDMsImV4cCI6MjA2MjY0Nzg0M30.eyJpZCI6ImJmYmZzZzI3LWJmYmYtNGJmZi04YmZmLWJmYmZzZzI3YmZiZiIsInJvbGUiOiJhbm9uIn0'; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function sendTelegramMessage(chatId: string | number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
  } catch (e) {
    console.error("Telegram xatolik:", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  // ── Telegram Bot Webhook ──────────────────────────────────────────────
  app.post("/api/telegram-webhook", async (req, res) => {
    const update = req.body;
    res.sendStatus(200);

    if (!update?.message) return;

    const msg = update.message;
    const userId = msg.from?.id;
    const chatId = msg.chat?.id;
    const text = msg.text || "";
    const username = msg.from?.username || msg.from?.first_name || "User";

    if (!userId) return;

    if (text.startsWith("/start")) {
      const parts = text.split(" ");
      const referrerId = parts.length > 1 ? parts[1] : null;

      // 1. Bazada foydalanuvchi bormi?
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', userId)
        .single();

      if (!existingUser) {
        // Yangi foydalanuvchi bo'lsa - BAZAGA QO'SHISH
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ 
            telegram_id: userId, 
            username: username, 
            balance: 10, // Boshlang'ich bonus
            referred_by: (referrerId && referrerId !== userId.toString()) ? parseInt(referrerId) : null
          }]);

        if (!insertError) {
          // 2. Taklif qilgan odamga BONUS BERISH
          if (referrerId && referrerId !== userId.toString()) {
            await supabase.rpc('increment_balance', { 
                user_id: parseInt(referrerId), 
                amount: 5 
            });

            await sendTelegramMessage(referrerId, `🎉 *Tabriklaymiz!*\n\n👤 @${username} taklifingiz bilan qo'shildi!\n💎 Sizga *+5 Almaz* berildi!`);
          }

          await sendTelegramMessage(chatId, `🎁 *Xush kelibsiz, ${username}!*\n\n💎 Sizga 10 almaz sovg'a berildi!\n🔗 Do'stlarni taklif qilib ko'proq yuting!`);
        }
      } else {
        await sendTelegramMessage(chatId, `👋 *Salom, @${username}!*\n\n💎 Almazlaringiz: *${existingUser.balance}*`);
      }
    }
  });

  // ── Foydalanuvchi balansini olish (Frontend uchun) ─────────────────
  app.get("/api/user/:userId", async (req, res) => {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', userId)
      .single();

    if (error || !data) {
      return res.json({ diamonds: 10, referrals: [] });
    }
    res.json({ diamonds: data.balance, userId: data.telegram_id });
  });

  // ── Yechish so'rovi (Admin'ga) ──────────────────────────────────────
  app.post("/api/withdraw", async (req, res) => {
    const { userId, username, freeFireId, amount } = req.body;

    const text = `🆕 *Yechish so'rovi!*\n\n👤 User: ${username}\n🎮 FF ID: \`${freeFireId}\` \n💎 Miqdor: ${amount}`;

    try {
      await sendTelegramMessage(ADMIN_CHAT_ID!, text);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Xato" });
    }
  });

  // ── Vite / Production sozlamalari ───────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
}

startServer();
