import { TutorDifficulty, TutorMode } from "../types";

export interface TutorRequestParams {
  prompt: string;
  questTitle?: string;
  stageTitle?: string;
  currentPhase?: string;
  difficulty?: TutorDifficulty;
  mode?: TutorMode;
  history?: { role: string; text: string }[];
}

export interface TutorResponse {
  reply: string;
  source: "pedagogical_engine" | "fallback";
  status: "success" | "partial" | "error";
}

/**
 * Local pedagogical rule-based Socratic mentor.
 * Operates 100% offline with zero external API dependencies or latency.
 */
export async function askNeuroTutor(params: TutorRequestParams): Promise<TutorResponse> {
  const mode = params.mode || "chat";
  const quest = params.questTitle || "Artificial Intelligence";
  const stage = params.stageTitle || "Foundations";
  const diff = params.difficulty || "intermediate";
  const prompt = (params.prompt || "").trim().toLowerCase();

  // Small delay to feel natural
  await new Promise((r) => setTimeout(r, 400));

  let reply = "";

  if (mode === "hint") {
    reply = `💡 **Hint for ${quest}** (${diff} level):\n\nThink about how information transforms from input to output. In this stage (${stage}), focus on identifying which parameter directly controls the boundary or error metric. Try changing one variable at a time to isolate its effect!`;
  } else if (mode === "misconceptions") {
    reply = `⚠️ **Common Misconceptions in ${quest}**:\n\n1. **Correlation vs. Causation**: Assuming weights directly equal semantic importance without normalization.\n2. **Overfitting**: Mistaking high training accuracy for real-world generalization ability.\n3. **Local Minima**: Thinking gradient descent always finds the single global optimal solution immediately.\n\nTake a close look at your model's test vs. training performance!`;
  } else if (mode === "explain") {
    reply = `🧠 **Deep-Dive Intuition: ${quest}**\n\nAt the ${diff} tier, think of this concept like an optimization landscape:\n\n• **Core Goal**: Minimize the discrepancy between actual values and model predictions.\n• **Key Mechanism**: Information flows forward to produce a prediction, and error signals flow backward to adjust internal weights.\n• **Intuition**: Rather than memorizing cases, the system learns continuous representations in high-dimensional vector spaces.`;
  } else if (mode === "practice") {
    reply = `🎯 **Practice Challenge: ${quest}**\n\n**Question**: If you double the learning rate and notice your loss function starts oscillating wildly instead of decreasing, what mathematical phenomenon is occurring?\n\n*A) Gradient vanishing*\n*B) Overshooting the local minimum*\n*C) Matrix dimension mismatch*\n\nTake a moment to analyze what happens when step size exceeds the surface curvature!`;
  } else {
    // Contextual chat responses
    if (prompt.includes("loss") || prompt.includes("cost") || prompt.includes("error")) {
      reply = `**Regarding Loss & Error Functions:**\nA loss function quantifies how 'wrong' the predictions are. In **${quest}**, minimizing this value guides parameter optimization. For regression we often use Mean Squared Error (MSE), whereas classification frequently uses Cross-Entropy.`;
    } else if (prompt.includes("weight") || prompt.includes("bias") || prompt.includes("parameter")) {
      reply = `**Regarding Weights and Biases:**\nWeights determine the strength and direction of the connection between neurons, while bias acts as an offset to shift the activation function. Together, they allow the model to represent non-zero-centered functions!`;
    } else if (prompt.includes("gradient") || prompt.includes("learning rate")) {
      reply = `**Understanding Gradients & Step Size:**\nThe gradient points in the direction of steepest *increase* in loss. We take steps in the *opposite* direction (gradient descent). The learning rate scales the magnitude of each step—too small and learning is slow; too large and it diverges.`;
    } else {
      reply = `**Neuro Socratic Guidance for ${quest}:**\n\nYou asked: *"${params.prompt}"*\n\nTo build solid intuition here, consider what objective the system is optimizing for. How would varying the input distribution or representation affect the downstream predictions in this phase of **${stage}**?`;
    }
  }

  return {
    reply,
    source: "pedagogical_engine",
    status: "success",
  };
}
