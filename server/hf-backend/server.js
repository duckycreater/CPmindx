import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

app.post("/chat", async (req, res) => {
  try {
    if (!req.body.inputs) {
      return res.status(400).json({ error: "Missing inputs" });
    }

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "Bạn là trợ lý ảo bán hàng máy tính cho PC Shop. Trả lời ngắn gọn, thân thiện, bằng tiếng Việt."
          },
          {
            role: "user",
            content: req.body.inputs
          }
        ],
        temperature: 0.4,
        max_tokens: 131072
      })
    });

    const raw = await response.text();
    console.log("GROQ RAW:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        error: "Groq returned non-JSON response",
        raw
      });
    }

    if (!response.ok) {
      return res.status(500).json({
        error: "Groq request failed",
        raw: data
      });
    }

    res.json([
      {
        generated_text: data.choices[0].message.content
      }
    ]);
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(
    `🚀 Backend chạy ở http://localhost:${process.env.PORT || 3000}`
  );
});
