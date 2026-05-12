import express from "express";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://kyqudwhiwrrsfcpxjyef.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0UmVmIjoia3lxdWR3aGl3cnJzZmNweGp5ZWYiLCJpYXQiOjE3NDcwNzE4NDMsImV4cCI6MjA2MjY0Nzg0M30.eyJpZCI6ImJmYmZzZzI3LWJmYmYtNGJmZi04YmZmLWJmYmZzZzI3YmZiZiIsInJvbGUiOiJhbm9uIn0');

const app = express();
app.use(express.json());

app.post("/api/telegram-webhook", async (req, res) => {
  const { message } = req.body;
  res.sendStatus(200);
  if (!message?.text?.startsWith("/start")) return;

  const userId = message.from.id;
  const username = message.from.username || "User";
  const referrerId = message.text.split(" ")[1];

  const { data: user } = await supabase.from('users').select('*').eq('telegram_id', userId).single();

  if (!user) {
    await supabase.from('users').insert([{
      telegram_id: userId,
      username: username,
      balance: 10,
      referred_by: (referrerId && referrerId != userId) ? parseInt(referrerId) : null
    }]);

    if (referrerId && referrerId != userId) {
      await supabase.rpc('increment_balance', { user_id: parseInt(referrerId), amount: 5 });
    }
  }
});

app.listen(3000);
