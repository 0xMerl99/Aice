import express from "express";
import { createServer as createViteServer } from "vite";
import { Anthropic } from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for agent responses
  app.post("/api/chat", async (req, res) => {
    const { prompt, npcName } = req.body;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is missing from environment variables.");
      return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set. Please add it to your environment variables." });
    }

    try {
      const anthropic = new Anthropic({ apiKey });
      
      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Extract text from Anthropic response
      const text = message.content.find(c => c.type === 'text')?.text || "Hello.";
      res.json({ text });
    } catch (error: any) {
      console.error("Anthropic API Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch response from Anthropic" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
