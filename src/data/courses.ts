import { Course } from "../types";

export const AVAILABLE_COURSES: Course[] = [
  {
    id: "ai-foundations",
    title: "AI Foundations & Deep Learning",
    subtitle: "From Classical Code to Loss Landscapes & Deep Neural Networks",
    tag: "Core Foundations",
    lessonsCount: 6,
    icon: "Cpu",
    stageIds: [
      "foundations-rules-vs-learning",
      "foundations-ml-optimization",
      "foundations-deep-neural-nets"
    ]
  },
  {
    id: "ai-agents",
    title: "Autonomous Agents & Tool Calling",
    subtitle: "ReAct loops, environment actions, tool calling, memory, and multi-agent systems",
    tag: "Advanced Engineering",
    lessonsCount: 6,
    icon: "Bot",
    stageIds: [
      "agents-react-loops",
      "agents-tool-environment",
      "agents-memory-multi-agent"
    ]
  },
  {
    id: "generative-ai",
    title: "Generative AI & LLM Systems",
    subtitle: "Tokens, prompt engineering, vector RAG pipelines, fine-tuning & guardrails",
    tag: "Popular Masterclass",
    lessonsCount: 6,
    icon: "Sparkles",
    stageIds: [
      "genai-prompt-craft",
      "genai-embeddings-vector-rag",
      "genai-finetuning-guardrails"
    ]
  }
];
