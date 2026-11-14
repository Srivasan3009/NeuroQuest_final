import { TutorDifficulty, TutorMode } from "../types";

export interface TutorRequestParams {
  prompt: string;
  questTitle?: string;
  stageTitle?: string;
  currentPhase?: string;
  difficulty?: TutorDifficulty;
  mode?: TutorMode;
  history?: { role: "user" | "model"; text: string }[];
}

export interface TutorResponse {
  reply: string;
  source: "gemini" | "pedagogical_engine" | "fallback";
  model?: string;
  status: "success" | "partial" | "error";
}

/**
 * Sends learner messages to the server-side Gemini AI tutor route (/api/tutor).
 */
export async function askNeuroTutor(params: TutorRequestParams): Promise<TutorResponse> {
  const response = await fetch("/api/tutor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: params.prompt,
      questTitle: params.questTitle,
      stageTitle: params.stageTitle,
      currentPhase: params.currentPhase,
      difficulty: params.difficulty || "intermediate",
      mode: params.mode || "chat",
      history: params.history || [],
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      typeof data?.error === "string" && data.error
        ? data.error
        : `Neuro AI request failed (${response.status}).`;
    throw new Error(errorMsg);
  }

  if (typeof data?.reply !== "string" || !data.reply.trim()) {
    throw new Error("Neuro AI returned an empty reply. Please try again.");
  }

  return {
    reply: data.reply,
    source: data.source || "gemini",
    model: data.model,
    status: "success",
  };
}
