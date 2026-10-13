import { useEffect, useMemo, useState, useCallback } from "react";
import { sendChatMessage, deleteConversation } from "../services/api.js";
import { getContextualQuickQuestions, buildGuideResponse } from "../services/guideBotService.js";

const STORAGE_KEY = "negomind-ai-chatbot-state";

const DEFAULT_WELCOME_MESSAGE = {
  id: "welcome-msg",
  sender: "bot",
  text: "Hello! I am your **NegoMind AI Assistant** 🤖\n\nI can answer general questions, technical/coding concepts, mathematics, AI engineering, and analyze your live negotiation sessions.\n\nHow can I help you today?",
  timestamp: new Date().toISOString(),
  provider: "gemini"
};

export function useGuideBot(currentPage = "Dashboard", negotiationId = null) {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
      if (typeof saved.isOpen === "boolean") return saved.isOpen;
    } catch {
      // ignore
    }
    return false;
  });

  const [conversationId, setConversationId] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
      return saved.conversationId || null;
    } catch {
      return null;
    }
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState(null);

  const [messages, setMessages] = useState([DEFAULT_WELCOME_MESSAGE]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isOpen,
          conversationId
        })
      );
    } catch {
      // ignore storage errors
    }
  }, [isOpen, conversationId]);

  // General & NegoMind starter prompts required by Section 9
  const quickQuestions = useMemo(() => {
    const defaultPrompts = [
      "Explain this negotiation",
      "Why did the agent reject the offer?",
      "Summarize my negotiation",
      "What is ZOPA?",
      "Explain concession tracking",
      "What is LLM Mode?",
      "What is Normal Mode?",
      "How does NegoMind AI work?"
    ];
    const contextual = getContextualQuickQuestions(currentPage);
    // Combine unique prompts
    const set = new Set([...defaultPrompts, ...contextual]);
    return Array.from(set);
  }, [currentPage]);

  const submitPrompt = useCallback(
    async (promptText = null) => {
      const question = String(promptText || input || "").trim();
      if (!question || isLoading) return;

      setError(null);
      setLastFailedPrompt(null);
      setInput("");

      const userMsgId = `user-${Date.now()}`;
      const userMsg = {
        id: userMsgId,
        sender: "user",
        text: question,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const response = await sendChatMessage(
          question,
          conversationId,
          negotiationId,
          `Page Context: ${currentPage}`
        );

        if (response && response.message) {
          if (response.conversation_id) {
            setConversationId(response.conversation_id);
          }

          const botMsg = {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: response.message,
            timestamp: new Date().toISOString(),
            provider: response.provider || "gemini",
            model: response.model || ""
          };

          setMessages((prev) => [...prev, botMsg]);
          setError(null);
          return;
        }

        // Intelligent Client Fallback Response if response from API is null
        const fallbackRes = buildGuideResponse(question, currentPage);
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: fallbackRes.message || "Hello! I am your NegoMind AI Assistant. How can I help you today?",
          timestamp: new Date().toISOString(),
          provider: "fallback",
          model: "rule-engine-v1"
        };

        setMessages((prev) => [...prev, botMsg]);
        setError(null);
      } catch (err) {
        console.warn("Chat API error, proceeding to intelligent fallback:", err);
        const fallbackRes = buildGuideResponse(question, currentPage);
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: fallbackRes.message || "Hello! I am your NegoMind AI Assistant. How can I help you today?",
          timestamp: new Date().toISOString(),
          provider: "fallback",
          model: "rule-engine-v1"
        };

        setMessages((prev) => [...prev, botMsg]);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, conversationId, negotiationId, currentPage]
  );

  const retryLastPrompt = useCallback(() => {
    if (lastFailedPrompt) {
      submitPrompt(lastFailedPrompt);
    }
  }, [lastFailedPrompt, submitPrompt]);

  const startNewConversation = useCallback(async () => {
    if (conversationId) {
      try {
        await deleteConversation(conversationId);
      } catch {
        // non-blocking
      }
    }
    setConversationId(null);
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setError(null);
    setLastFailedPrompt(null);
    setInput("");
  }, [conversationId]);

  const clearMessages = useCallback(() => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setError(null);
  }, []);

  return {
    isOpen,
    setIsOpen,
    openPanel: () => setIsOpen(true),
    closePanel: () => setIsOpen(false),
    messages,
    input,
    setInput,
    isLoading,
    error,
    submitPrompt,
    retryLastPrompt,
    startNewConversation,
    clearMessages,
    quickQuestions
  };
}
