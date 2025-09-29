import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); // .env dosyasını oku

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // frontend buradan servis edilir

// 🔑 Gizli değişkenler artık .env’den geliyor
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.DATABASE_ID;

// 📌 Ana sayfa (leitner.html)
app.get("/", (req, res) => {
  res.sendFile("leitner.html", { root: "public" });
});

// 📌 Bugünkü kartları getir
app.post("/query", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        filter: {
          property: "Next Review",
          date: { on_or_before: today }
        }
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Yeni kart ekle
app.post("/insert", async (req, res) => {
  try {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Kart güncelle (Box ve Next Review)
app.patch("/update/:pageId", async (req, res) => {
  try {
    const { pageId } = req.params;
    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Çalışma sürelerini güncelle
app.patch("/update-hours/:pageId", async (req, res) => {
  try {
    const { pageId } = req.params;
    const { daily, total } = req.body;

    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        properties: {
          "Daily Hours": { number: daily },
          "Total Hours": { number: total }
        }
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Sunucuyu çalıştır
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
});
