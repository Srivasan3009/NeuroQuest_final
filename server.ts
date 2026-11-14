import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = "gemini-4-hydrogen";

interface HistoryTurn {
  role?: string;
  text?: string;
}

interface TutorRequestBody {
  prompt?: string;
  questTitle?: string;
  stageTitle?: string;
  currentPhase?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  mode?: "explain" | "hint" | "misconceptions" | "practice" | "chat";
  history?: HistoryTurn[];
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured on the server. Add your key in Settings > Secrets."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function buildSystemInstruction(params: {
  questTitle: string;
  stageTitle: string;
  currentPhase: string;
  difficulty: string;
  mode: string;
}): string {
  const tierGuidance =
    params.difficulty === "beginner"
      ? "Use Simple mode: friendly, everyday analogies, minimal jargon, short clear paragraphs suitable for beginners of all ages."
      : params.difficulty === "advanced"
      ? "Use Formal mode: rigorous mathematical/ML terminology, optimization dynamics, architectural trade-offs, and precision."
      : "Use Standard mode: clear intuition paired with accurate core AI/ML terminology and concrete examples.";

  const modeGuidance =
    params.mode === "hint"
      ? "The learner requested a Socratic hint. Give a targeted guiding clue that points them toward the reasoning step without directly giving away the final answer."
      : params.mode === "misconceptions"
      ? "List 2-3 specific, high-value misconceptions learners commonly make on this exact topic and briefly clarify why each is wrong."
      : params.mode === "explain"
      ? "Break down the core concept cleanly with intuition, how it works, and a concrete example."
      : params.mode === "practice"
      ? "Create one crisp, engaging practice challenge or multiple-choice check tailored to the current quest topic. Ask the learner to reply with their answer and reasoning without immediately spoiling the solution."
      : "Answer the learner's question directly using Socratic tutoring: clarify the concept clearly, connect it to the active lesson, and end with a brief follow-up check-in question when helpful.";

  return [
    "You are NeuroBot (Neuro AI), the Socratic AI & Machine Learning tutor inside NeuroQuest AI Academy.",
    `Active Context -> Stage: "${params.stageTitle}" | Quest: "${params.questTitle}" | Lesson Phase: "${params.currentPhase}".`,
    `Depth Tier: ${tierGuidance}`,
    `Task Mode: ${modeGuidance}`,
    "Keep responses concise, structured with clean markdown bullets/bolding, encouraging, and directly grounded in the learner's question and quest topic.",
  ].join("\n");
}

function mapGeminiError(error: unknown): { status: number; message: string } {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();

  if (lower.includes("gemini_api_key is not configured")) {
    return { status: 503, message: raw };
  }
  if (
    lower.includes("permission_denied") ||
    lower.includes("api_key_invalid") ||
    lower.includes("api key not valid") ||
    lower.includes("403") ||
    lower.includes("401")
  ) {
    return {
      status: 403,
      message:
        "Gemini API authentication failed. Please verify GEMINI_API_KEY in Settings > Secrets.",
    };
  }
  if (lower.includes("resource_exhausted") || lower.includes("429") || lower.includes("quota")) {
    return {
      status: 429,
      message:
        "Gemini free-tier rate limit or quota reached temporarily. Please wait a moment and try again.",
    };
  }
  if (lower.includes("not_found") || lower.includes("404")) {
    return {
      status: 404,
      message: `Requested Gemini model (${MODEL_NAME}) was not found.`,
    };
  }
  return {
    status: 500,
    message: raw || "NeuroBot encountered an error communicating with Gemini.",
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      model: MODEL_NAME,
      configured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.post("/api/tutor", async (req, res) => {
    try {
      const body = (req.body || {}) as TutorRequestBody;
      const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
      if (!prompt) {
        return res.status(400).json({ error: "Please enter a question or select a tutor action." });
      }
      if (prompt.length > 4000) {
        return res.status(400).json({ error: "Message is too long (max 4,000 characters)." });
      }

      const questTitle =
        typeof body.questTitle === "string" && body.questTitle.trim()
          ? body.questTitle.trim().slice(0, 140)
          : "Artificial Intelligence Foundations";
      const stageTitle =
        typeof body.stageTitle === "string" && body.stageTitle.trim()
          ? body.stageTitle.trim().slice(0, 140)
          : "Foundations";
      const currentPhase =
        typeof body.currentPhase === "string" && body.currentPhase.trim()
          ? body.currentPhase.trim().slice(0, 60)
          : "Learn";
      const difficulty =
        body.difficulty === "beginner" || body.difficulty === "advanced"
          ? body.difficulty
          : "intermediate";
      const mode =
        body.mode === "explain" ||
        body.mode === "hint" ||
        body.mode === "misconceptions" ||
        body.mode === "practice"
          ? body.mode
          : "chat";

      const rawHistory = Array.isArray(body.history) ? body.history.slice(-12) : [];
      const history = rawHistory
        .filter(
          (item): item is { role: string; text: string } =>
            Boolean(item && typeof item.text === "string" && item.text.trim())
        )
        .map((item) => ({
          role: item.role === "user" ? ("user" as const) : ("model" as const),
          parts: [{ text: item.text.slice(0, 4000) }],
        }));

      const ai = getGeminiClient();
      const systemInstruction = buildSystemInstruction({
        questTitle,
        stageTitle,
        currentPhase,
        difficulty,
        mode,
      });

      const chat = ai.chats.create({
        model: MODEL_NAME,
        history,
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const response = await chat.sendMessage({
        message: prompt,
      });

      const reply = (response.text || "").trim();
      if (!reply) {
        return res.status(502).json({
          error: "Gemini returned an empty response. Please try asking again.",
        });
      }

      return res.json({
        reply,
        source: "gemini",
        model: MODEL_NAME,
        status: "success",
      });
    } catch (error) {
      console.error("Tutor API error:", error);
      const mapped = mapGeminiError(error);
      return res.status(mapped.status).json({ error: mapped.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("/{*splat}", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }
      return res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NeuroQuest server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start NeuroQuest server:", err);
  process.exit(1);
});
