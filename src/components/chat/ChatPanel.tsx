"use client";

import { useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/types";
import { INITIAL_AI_MESSAGE } from "@/lib/constants";

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "assistant",
      content: INITIAL_AI_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Lo siento, hubo un error al procesar tu consulta. Por favor intenta de nuevo.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-skaut-border bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-3 border-b border-skaut-border px-4 py-3 dark:border-slate-700">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-skaut-blue to-skaut-sky text-white shadow-md">
          <Sparkles size={18} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-skaut-text">Asesor Estratégico Skaut</h3>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] text-skaut-muted">Procesando tiempo real</span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-skaut-blue/10">
                <Bot size={14} className="text-skaut-blue" />
              </div>
            )}
            <div
              className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-skaut-blue text-white"
                  : "bg-slate-50 text-skaut-text dark:bg-slate-700 dark:text-slate-100"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-skaut-muted">
            <Loader2 size={16} className="animate-spin" />
            Analizando oportunidades...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-skaut-border p-3 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta a la IA sobre un territorio..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-skaut-border bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-skaut-muted focus:border-skaut-blue focus:ring-2 focus:ring-blue-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-blue-900"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-skaut-blue text-white shadow-md shadow-blue-200 transition-all hover:bg-skaut-blue-dark disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
