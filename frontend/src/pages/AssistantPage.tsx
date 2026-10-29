import { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Database,
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Package,
  Users,
  ShoppingCart,
  Truck,
  Warehouse,
  Receipt,
  FileText,
} from "lucide-react";
import { assistantApi } from "../services/assistantApi";
import type { AssistantSource, AssistantStatus } from "../types/sales";

// ── Source type icons & labels ────────────────────────────────

const SOURCE_CONFIG: Record<
  string,
  { icon: typeof Package; label: string; color: string }
> = {
  product: { icon: Package, label: "Product", color: "var(--chart-1)" },
  customer: { icon: Users, label: "Customer", color: "var(--chart-3)" },
  order: { icon: ShoppingCart, label: "Order", color: "var(--chart-2)" },
  supplier: { icon: Truck, label: "Supplier", color: "var(--chart-4)" },
  inventory: { icon: Warehouse, label: "Inventory", color: "var(--chart-4)" },
  expense: { icon: Receipt, label: "Expense", color: "var(--chart-6)" },
  expense_summary: { icon: FileText, label: "Summary", color: "var(--chart-5)" },
};

// ── Message type ─────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: AssistantSource[];
  timestamp: Date;
}

// ── Suggested questions ──────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  "What are my top-selling products?",
  "Which customers have spent the most?",
  "Show me orders that are still pending",
  "Which items are low on stock?",
  "Summarize my expense categories",
  "Who are my suppliers?",
];

// ── Source Card ───────────────────────────────────────────────

function SourceCard({ source }: { source: AssistantSource }) {
  const [expanded, setExpanded] = useState(false);
  const config = SOURCE_CONFIG[source.source_type] || {
    icon: FileText,
    label: source.source_type,
    color: "var(--chart-axis)",
  };
  const Icon = config.icon;
  const relevance = Math.round(source.score * 100);

  return (
    <div
      className="rounded-xl border border-surface-700/50 bg-surface-900/50 overflow-hidden
                 transition-all duration-200 hover:border-surface-600/50"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `color-mix(in srgb, ${config.color} 13%, transparent)` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-surface-200">
              {config.label}
            </span>
            {source.source_id && source.source_id !== "all" && (
              <span className="text-[10px] text-surface-500">
                #{source.source_id}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              background: `color-mix(in srgb, ${config.color} 8%, transparent)`,
              color: "var(--text-strong)",
            }}
          >
            {relevance}%
          </span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-surface-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-surface-500" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 animate-fade-in">
          <div className="text-xs text-surface-400 leading-relaxed bg-surface-950/50 rounded-lg p-2.5 whitespace-pre-wrap">
            {source.content}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Typing indicator ─────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-fg" />
      </div>
      <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 mt-1">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full bg-primary-400 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary-400 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary-400 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<AssistantStatus | null>(null);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadStatus = async () => {
    try {
      const data = await assistantApi.getStatus();
      setStatus(data);
    } catch {
      // Status is optional — don't block on failure
    }
  };

  const handleSend = async (question?: string) => {
    const q = question || input.trim();
    if (!q || loading) return;

    setInput("");
    setError("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: q,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await assistantApi.ask(q);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (status) {
        setStatus({ ...status, chunks_in_db: data.chunks_in_db });
      }
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { error?: string; detail?: string } };
      };
      setError(
        axiosErr.response?.data?.error ||
          axiosErr.response?.data?.detail ||
          "Failed to get a response. Ensure the AI service is running."
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError("");
      const result = await assistantApi.sync();
      await loadStatus();

      const syncMsg: ChatMessage = {
        id: `system-${Date.now()}`,
        role: "assistant",
        content: `✅ **Data synced successfully!** ${result.chunks_created} chunks indexed from your business data. You can now ask me questions.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, syncMsg]);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { error?: string; detail?: string } };
      };
      setError(
        axiosErr.response?.data?.error ||
          axiosErr.response?.data?.detail ||
          "Sync failed. Ensure the AI service is running."
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple markdown-to-HTML for the assistant answer
  const renderMarkdown = (text: string) => {
    let html = text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-fg">$1</strong>')
      // Bullet points
      .replace(
        /^[-•]\s+(.*)$/gm,
        '<div class="flex gap-2 ml-1"><span class="text-primary-400 shrink-0">•</span><span>$1</span></div>'
      )
      // Numbered lists
      .replace(
        /^(\d+)\.\s+(.*)$/gm,
        '<div class="flex gap-2 ml-1"><span class="text-primary-400 shrink-0 font-semibold">$1.</span><span>$2</span></div>'
      )
      // Line breaks
      .replace(/\n\n/g, '<div class="h-3"></div>')
      .replace(/\n/g, "<br />");
    return html;
  };

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100dvh-7rem)] lg:h-[calc(100dvh-8rem)] min-h-[420px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-fg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-fg">
                Business Assistant
              </h1>
              <p className="text-surface-400 text-sm">
                AI-powered natural language business intelligence
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Chunk status */}
          {status && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass text-xs">
              <Database className="w-3.5 h-3.5 text-primary-400" />
              <span className="text-surface-400">
                <span className="text-fg font-semibold">
                  {status.chunks_in_db}
                </span>{" "}
                chunks indexed
              </span>
            </div>
          )}

          {/* Sync button */}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm font-medium
                       text-surface-300 hover:text-fg hover:bg-surface-700/50
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Sync Data
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-5 shadow-glow">
                <Sparkles className="w-10 h-10 text-fg" />
              </div>
              <h2 className="text-xl font-semibold text-fg mb-2">
                Ask me anything about your business
              </h2>
              <p className="text-surface-400 text-sm text-center max-w-md mb-8">
                I can analyze your sales, inventory, customers, orders,
                suppliers, and expenses data.{" "}
                {(!status || status.chunks_in_db === 0) && (
                  <span className="text-warning">
                    Click "Sync Data" first to index your business data.
                  </span>
                )}
              </p>

              {/* Suggested questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-left px-4 py-3 rounded-xl border border-surface-700/50
                               bg-surface-900/30 text-surface-300 text-sm
                               hover:border-primary-500/30 hover:text-fg hover:bg-surface-800/50
                               transition-all duration-200 group"
                  >
                    <span className="text-primary-400 mr-2 group-hover:text-primary-300">
                      →
                    </span>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 animate-slide-up ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-surface-700"
                    : "gradient-primary"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4 text-surface-300" />
                ) : (
                  <Bot className="w-4 h-4 text-fg" />
                )}
              </div>

              {/* Message bubble */}
              <div
                className={`max-w-[75%] ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "gradient-primary text-white rounded-tr-sm"
                      : "glass rounded-tl-sm"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    <div
                      className="text-sm text-surface-200 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(msg.content),
                      }}
                    />
                  )}
                </div>

                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-[11px] text-surface-500 font-medium px-1">
                      Sources ({msg.sources.length})
                    </p>
                    <div className="space-y-1.5">
                      {msg.sources.map((source, i) => (
                        <SourceCard key={i} source={source} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <p
                  className={`text-[10px] text-surface-600 mt-1.5 px-1 ${
                    msg.role === "user" ? "text-right" : ""
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {loading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-surface-700/50 p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your business data..."
                rows={1}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-surface-700/50
                           bg-surface-900/50 text-surface-100 text-sm
                           placeholder:text-surface-500 resize-none
                           focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20
                           transition-all duration-200"
                style={{
                  minHeight: "48px",
                  maxHeight: "120px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "48px";
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center
                         text-fg shrink-0 hover:shadow-glow transition-all duration-200
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-surface-600 mt-2 text-center">
            AI-powered by Gemini + pgvector RAG • Answers are based on your
            synced business data
          </p>
        </div>
      </div>
    </div>
  );
}
