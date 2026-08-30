import { useEffect, useMemo, useState } from "react";
import {
  buildGuideResponse,
  getContextualQuickQuestions,
} from "../services/guideBotService.js";

const STORAGE_KEY = "negotiation-guide-bot-state";

export function useGuideBot(currentPage = "Dashboard") {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi! I'm your Negotiation Guide. I can help you understand the platform and guide you through each step.",
    },
  ]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
      if (typeof saved.isOpen === "boolean") {
        setIsOpen(saved.isOpen);
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        isOpen,
      })
    );
  }, [isOpen]);

  const quickQuestions = useMemo(
    () => getContextualQuickQuestions(currentPage),
    [currentPage]
  );

  const appendMessage = (sender, text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${sender}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        sender,
        text,
      },
    ]);
  };

  const submitPrompt = (promptText) => {
    const question = String(promptText || input || "").trim();
    if (!question) return;

    appendMessage("user", question);

    const response = buildGuideResponse(question, currentPage);
    appendMessage("bot", response.message);
    setInput("");
  };

  return {
    isOpen,
    setIsOpen,
    openPanel: () => setIsOpen(true),
    closePanel: () => setIsOpen(false),
    messages,
    input,
    setInput,
    submitPrompt,
    quickQuestions,
  };
}
