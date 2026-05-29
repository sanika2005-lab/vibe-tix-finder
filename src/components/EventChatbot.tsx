import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Mic, MicOff, Volume2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { events } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/event-chat`;

// Lean events context for the model
const eventsContext = events.map((e) => ({
  id: e.id,
  title: e.title,
  category: e.category,
  date: e.date,
  time: e.time,
  venue: e.location,
  price_inr: e.price,
  about: e.description,
}));

// Web Speech recognition (vendor prefix)
const getRecognition = (): any => {
  if (typeof window === "undefined") return null;
  const w = window as any;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const r = new Ctor();
  r.lang = "en-IN";
  r.interimResults = false;
  r.maxAlternatives = 1;
  return r;
};

export const EventChatbot = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm VibeBot 🎟️ Ask me anything about events, seat availability, UPI payments, or how booking works. You can type or tap the mic to speak.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceReply, setVoiceReply] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const recogRef = useRef<any>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const speak = (text: string) => {
    if (!voiceReply || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-IN";
      u.rate = 1.02;
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: Msg = { role: "user", content: trimmed };
    setMessages((p) => [...p, userMsg, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages.filter((m) => m.content), userMsg],
          eventsContext,
        }),
      });

      if (resp.status === 429) throw new Error("Too many requests — wait a moment.");
      if (resp.status === 402) throw new Error("AI credits exhausted. Please top up.");
      if (!resp.ok || !resp.body) throw new Error("Chat unavailable right now.");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let done = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages((p) => {
                const copy = [...p];
                copy[copy.length - 1] = { role: "assistant", content: assistantText };
                return copy;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (assistantText) speak(assistantText);
    } catch (e: any) {
      setMessages((p) => {
        const copy = [...p];
        copy[copy.length - 1] = {
          role: "assistant",
          content: e?.message || "Something went wrong. Please try again.",
        };
        return copy;
      });
      toast({ title: "Chat error", description: e?.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (listening) {
      recogRef.current?.stop();
      setListening(false);
      return;
    }
    const r = getRecognition();
    if (!r) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice input. Try Chrome on Android/desktop.",
        variant: "destructive",
      });
      return;
    }
    recogRef.current = r;
    r.onresult = (ev: any) => {
      const transcript = ev.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) send(transcript);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    setListening(true);
    r.start();
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow transition-bounce hover:scale-110"
        aria-label="Open AI chatbot"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[min(560px,80vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elegant">
          <div className="flex items-center justify-between border-b border-border/60 bg-gradient-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <div>
                <p className="text-sm font-semibold leading-tight">VibeBot</p>
                <p className="text-[10px] opacity-90">AI event assistant · voice enabled</p>
              </div>
            </div>
            <button
              onClick={() => setVoiceReply((v) => !v)}
              className={`grid h-8 w-8 place-items-center rounded-full transition-smooth ${
                voiceReply ? "bg-white/20" : "bg-white/5 opacity-60"
              }`}
              aria-label="Toggle voice replies"
              title={voiceReply ? "Voice replies on" : "Voice replies off"}
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.content || (loading && i === messages.length - 1 ? "…" : "")}
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border/60 p-2"
          >
            <Button
              type="button"
              size="icon"
              variant={listening ? "default" : "outline"}
              onClick={toggleMic}
              className="h-10 w-10 shrink-0 rounded-full"
              aria-label="Voice input"
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening…" : "Ask about events, seats, payment…"}
              disabled={loading}
              className="h-10 rounded-full"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="h-10 w-10 shrink-0 rounded-full"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};
