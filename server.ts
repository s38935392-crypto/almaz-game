import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8541772961:AAEOt48FaNzK966bkN7bkfBm5UnJnl-Q8Kk";
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Oddiy xotirada foydalanuvchilarni saqlash (production'da DB kerak)
const users: Record<string, { diamonds: number; referredBy?: string; joinedAt: number }> = {};
const referrals: Record<string, string[]> = {}; // referralCode -> [userId[]]

async function sendTelegramMessage(chatId: string | number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (e) {
    console.error("Telegram xabar yuborishda xato:", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ── Telegram Bot Webhook ──────────────────────────────────────────────
  app.post("/api/telegram-webhook", async (req, res) => {
    const update = req.body;
    res.sendStatus(200); // Telegramga tez javob

    if (!update?.message) return;

    const msg = update.message;
    const userId = msg.from?.id?.toString();
    const chatId = msg.chat?.id;
    const text = msg.text || "";
    const firstName = msg.from?.first_name || "Foydalanuvchi";

    if (!userId) return;

    // /start komandasi
    if (text.startsWith("/start")) {
      const parts = text.split(" ");
      const startParam = parts[1] || ""; // referral kodi

      const isNewUser = !users[userId];

      if (isNewUser) {
        // Yangi foydalanuvchi
        users[userId] = {
          diamonds: 10, // Boshlang'ich bonus
          joinedAt: Date.now(),
        };

        // Referal bilan kelgan bo'lsa
        if (startParam && startParam.startsWith("REF")) {
          const referrerId = startParam.replace("REF", "");

          if (referrerId !== userId) {
            // Yangi foydalanuvchiga bonus
            users[userId].diamonds += 5;
            users[userId].referredBy = startParam;

            // Referal beruvchiga bonus
            if (!users[referrerId]) {
              users[referrerId] = { diamonds: 10, joinedAt: Date.now() };
            }
            users[referrerId].diamonds += 5;

            // Referallar ro'yxatiga qo'shish
            if (!referrals[startParam]) referrals[startParam] = [];
            referrals[startParam].push(userId);

            // Referal beruvchiga xabar
            await sendTelegramMessage(
              referrerId,
              `🎉 *Tabriklaymiz!*\n\n👤 *${firstName}* sizning havolangiz orqali qo'shildi!\n💎 Sizga *+5 Almaz* qo'shildi!\n\n💰 Jami almazlaringiz: *${users[referrerId].diamonds}*`
            );

            // Yangi foydalanuvchiga xabar
            await sendTelegramMessage(
              chatId,
              `🎁 *Xush kelibsiz, ${firstName}!*\n\nReferal havola orqali keldingiz!\n💎 Sizga *+5 Almaz* sovg'a!\n\n🎮 Almazlaringiz: *${users[userId].diamonds}*\n\nO'yinni boshlash uchun quyidagi tugmani bosing 👇`
            );
          } else {
            await sendTelegramMessage(
              chatId,
              `👋 *Xush kelibsiz, ${firstName}!*\n\n💎 Boshlang'ich almazlaringiz: *${users[userId].diamonds}*`
            );
          }
        } else {
          // Referalsiz kelgan yangi foydalanuvchi
          await sendTelegramMessage(
            chatId,
            `👋 *Xush kelibsiz, ${firstName}!*\n\n💎 Boshlang'ich almazlaringiz: *${users[userId].diamonds}*\n\n🔗 Do'stlaringizni taklif qilib +5 almaz oling!`
          );
        }
      } else {
        // Eski foydalanuvchi
        await sendTelegramMessage(
          chatId,
          `👋 *Qaytib keldingiz, ${firstName}!*\n\n💎 Almazlaringiz: *${users[userId].diamonds}*`
        );
      }
    }
  });

  // ── Foydalanuvchi ma'lumotlarini olish ──────────────────────────────
  app.get("/api/user/:userId", (req, res) => {
    const { userId } = req.params;
    const user = users[userId];
    if (!user) {
      return res.json({ diamonds: 10, referrals: [] });
    }
    const userReferrals = referrals[`REF${userId}`] || [];
    res.json({
      diamonds: user.diamonds,
      referrals: userReferrals,
      referralCount: userReferrals.length,
    });
  });

  // ── Referallar ro'yxatini olish ─────────────────────────────────────
  app.get("/api/referrals/:referralCode", (req, res) => {
    const { referralCode } = req.params;
    const list = referrals[referralCode] || [];
    res.json({ referrals: list, count: list.length });
  });

  // ── Bonus qo'shish (frontend dan) ───────────────────────────────────
  app.post("/api/add-bonus", async (req, res) => {
    const { userId, amount, reason } = req.body;
    if (!users[userId]) {
      users[userId] = { diamonds: 10, joinedAt: Date.now() };
    }
    users[userId].diamonds += amount;
    res.json({ success: true, diamonds: users[userId].diamonds });
  });

  // ── Yechish so'rovi ──────────────────────────────────────────────────
  app.post("/api/withdraw", async (req, res) => {
    const { userId, username, freeFireId, amount, diamondsBefore, diamondsAfter } = req.body;

    if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
      console.error("TELEGRAM_BOT_TOKEN yoki ADMIN_CHAT_ID sozlanmagan");
      return res.status(500).json({ error: "Server xatosi: Telegram sozlamalari noto'g'ri" });
    }

    const text = `
🆕 *Yangi yechish so'rovi!*

👤 *Foydalanuvchi:* ${username} (ID: ${userId})
🎮 *Free Fire ID:* \`${freeFireId}\`
💎 *Yechilayotgan miqdor:* ${amount} Almaz
💰 *Eski balans:* ${diamondsBefore}
📉 *Yangi balans:* ${diamondsAfter}

Iltimos, tekshirib almazni tashlab bering.
    `;

    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      });

      if (response.ok) {
        res.json({ success: true });
      } else {
        const errData = await response.json();
        res.status(500).json({ error: "Telegramga xabar yuborib bo'lmadi" });
      }
    } catch (error) {
      res.status(500).json({ error: "Ichki server xatosi" });
    }
  });

  // ── Webhook o'rnatish ────────────────────────────────────────────────
  app.get("/api/setup-webhook", async (req, res) => {
    const domain = req.headers.host;
    const webhookUrl = `https://${domain}/api/telegram-webhook`;

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: webhookUrl }),
        }
      );
      const data = await response.json();
      res.json({ success: true, webhook: webhookUrl, result: data });
    } catch (e) {
      res.status(500).json({ error: "Webhook o'rnatishda xato" });
    }
  });

  // ── Vite / Static ────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("<h1>Build topilmadi</h1>");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server ishga tushdi: http://0.0.0.0:${PORT}`);
  });
}

startServer();
