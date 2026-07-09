"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { InterviewStage } from "@/lib/session";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface SavedSession {
  messages: Message[];
  stage: InterviewStage;
  savedAt: string;
}

const STORAGE_KEY = "ai-rep-session";

// 保存会话到 localStorage
function saveSession(messages: Message[], stage: InterviewStage) {
  if (typeof window === "undefined") return;
  const session: SavedSession = {
    messages,
    stage,
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // localStorage 可能已满或不可用
  }
}

// 从 localStorage 加载会话
function loadSession(): SavedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as SavedSession;
  } catch {
    return null;
  }
}

// 清除 localStorage 中的会话
function clearSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stage, setStage] = useState<InterviewStage>("demographics");
  const [isInitialized, setIsInitialized] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // 初始化时检查是否有已保存的会话
  useEffect(() => {
    const saved = loadSession();
    if (saved && saved.messages.length > 0) {
      setMessages(saved.messages);
      setStage(saved.stage);
    }
    setIsInitialized(true);
  }, []);

  // 当消息或阶段变化时，自动保存到 localStorage
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      saveSession(messages, stage);
    }
  }, [messages, stage, isInitialized]);

  const sendMessage = useCallback(
    async (content: string, hidden: boolean = false) => {
      if (isStreaming || !content.trim()) return;

      const userMessage: Message = {
        role: "user",
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMessage];
      setIsStreaming(true);

      // Add placeholder for assistant response
      const assistantMessage: Message = {
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };
      // 如果 hidden 为 true，不显示用户消息在界面上
      if (hidden) {
        setMessages([...messages, assistantMessage]);
      } else {
        setMessages([...updatedMessages, assistantMessage]);
      }

      try {
        abortRef.current = new AbortController();

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            stage,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.content) {
                  fullContent += parsed.content;

                  // Check for stage change marker
                  const stageMatch = fullContent.match(
                    /\[STAGE_CHANGE:(\w+)\]/
                  );
                  if (stageMatch) {
                    const newStage = stageMatch[1] as InterviewStage;
                    setStage(newStage);
                    // Remove the marker from displayed content
                    const cleanContent = fullContent.replace(
                      /\[STAGE_CHANGE:\w+\]\s*/,
                      ""
                    );
                    setMessages((prev) => {
                      const updated = [...prev];
                      updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: cleanContent,
                      };
                      return updated;
                    });
                  } else {
                    setMessages((prev) => {
                      const updated = [...prev];
                      updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: fullContent,
                      };
                      return updated;
                    });
                  }
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Chat error:", error);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content:
              "抱歉，连接出现了一些问题。请重试。",
          };
          return updated;
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming, stage]
  );

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  // 恢复已保存的会话
  const restoreSession = useCallback(() => {
    const saved = loadSession();
    if (saved && saved.messages.length > 0) {
      setMessages(saved.messages);
      setStage(saved.stage);
      return true;
    }
    return false;
  }, []);

  // 开始新的会话
  const startNewSession = useCallback(() => {
    clearSession();
    setMessages([]);
    setStage("demographics");
  }, []);

  // 检查是否有已保存的会话
  const hasSavedSession = useCallback(() => {
    const saved = loadSession();
    return saved !== null && saved.messages.length > 0;
  }, []);

  // 获取已保存会话的信息
  const getSavedSessionInfo = useCallback(() => {
    const saved = loadSession();
    if (!saved) return null;
    return {
      messageCount: saved.messages.length,
      stage: saved.stage,
      savedAt: saved.savedAt,
    };
  }, []);

  // Auto-scroll to bottom
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return {
    messages,
    isStreaming,
    stage,
    isInitialized,
    sendMessage,
    stopStreaming,
    restoreSession,
    startNewSession,
    hasSavedSession,
    getSavedSessionInfo,
    scrollRef,
  };
}
