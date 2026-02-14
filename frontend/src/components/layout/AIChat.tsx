import { useState, useRef, useEffect } from "react";
import { Send, Search, Swords, ShieldCheck, GraduationCap, Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockChatMessages } from "@/lib/mock-data";
import { ChatMessage, ChatMode } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const modes: { id: ChatMode; label: string; icon: React.ElementType; color: string }[] = [
  { id: "analyzer", label: "Analyzer", icon: Search, color: "text-info" },
  { id: "adversary", label: "Adversary", icon: Swords, color: "text-destructive" },
  { id: "critic", label: "Critic", icon: ShieldCheck, color: "text-warning" },
  { id: "tutor", label: "Tutor", icon: GraduationCap, color: "text-success" },
];

const quickActions = ["Explain this error", "Suggest improvement", "Find patterns", "Generate test"];

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChat({ isOpen, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [input, setInput] = useState("");
  const [activeMode, setActiveMode] = useState<ChatMode>("analyzer");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Mock AI response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: "assistant",
        content: `Based on my analysis as ${activeMode}, I can see several opportunities for improvement in your approach. Let me break this down:\n\n1. **Architecture**: Consider separating concerns further\n2. **Performance**: Watch for N+1 query patterns\n3. **Security**: Input validation is crucial here\n\nWould you like me to elaborate on any of these points?`,
        timestamp: new Date().toISOString(),
        mode: activeMode,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-80 bg-card border-l border-border flex flex-col shrink-0 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">DevForge AI</span>
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Mode Toggles */}
      <div className="flex gap-1 px-2 py-2 border-b border-border">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all",
              activeMode === mode.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <mode.icon className="h-3 w-3" />
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "text-xs leading-relaxed",
              msg.role === "user" && "ml-6",
              msg.role === "system" && "text-center text-muted-foreground italic"
            )}
          >
            {msg.role !== "system" && (
              <div className={cn(
                "rounded-lg px-3 py-2 whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted text-foreground"
              )}>
                {msg.mode && (
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">
                    {msg.mode} mode
                  </div>
                )}
                {msg.content}
              </div>
            )}
            {msg.role === "system" && (
              <div className="text-[10px] py-1">{msg.content}</div>
            )}
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-1 px-2 py-1.5 border-t border-border overflow-x-auto">
        {quickActions.map((action) => (
          <button
            key={action}
            onClick={() => setInput(action)}
            className="shrink-0 text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-border">
        <div className="flex gap-1.5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendMessage();
            }}
            placeholder="Ask DevForge AI..."
            className="flex-1 bg-muted rounded-md px-3 py-2 text-xs resize-none h-16 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button size="icon" className="h-8 w-8 shrink-0 self-end" onClick={sendMessage}>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="text-[10px] text-muted-foreground mt-1">⌘ + Enter to send</div>
      </div>
    </motion.div>
  );
}
