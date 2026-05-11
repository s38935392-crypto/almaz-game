import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Telegramga xabar yuborish API
  app.post("/api/withdraw", async (req, res) => {
    const { userId, username, freeFireId, amount, diamondsBefore, diamondsAfter } = req.body;
    
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

    if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
      console.error("TELEGRAM_BOT_TOKEN yoki ADMIN_CHAT_ID sozlanmagan");
      return res.status(500).json({ error: "Server xatosi: Telegram sozlamalari noto'g'ri" });
    }

    const text = `
🆕 **Yangi yechish so'rovi!**

👤 **Foydalanuvchi:** ${username} (ID: ${userId})
🎮 **Free Fire ID:** \`${freeFireId}\`
💎 **Yechilayotgan miqdor:** ${amount} Almaz
💰 **Eski balans:** ${diamondsBefore}
📉 **Yangi balans:** ${diamondsAfter}

Iltimos, tekshirib almazni tashlab bering.
    `;

    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: text,
          parse_mode: "Markdown",
        }),
      });

      if (response.ok) {
        res.json({ success: true });
      } else {
        const errData = await response.json();
        console.error("Telegram API xatosi:", errData);
        res.status(500).json({ error: "Telegramga xabar yuborib bo'lmadi" });
      }
    } catch (error) {
      console.error("Fetch xatosi:", error);
      res.status(500).json({ error: "Ichki server xatosi" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Development rejimida ishga tushirildi...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    console.log("Production rejimi. Statik fayllar manzili:", distPath);
    
    // Asosiy statik fayllar (js, css, images)
    app.use(express.static(distPath));

    // Barcha boshqa yo'llarni index.html ga yo'naltirish (SPA fallback)
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send(`
          <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>Xatolik: Build fayllari topilmadi</h1>
            <p>'dist' papkasi serverda mavjud emas. Iltimos, AI Studio'da build jarayoni tugashini kuting.</p>
          </div>
        `);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
