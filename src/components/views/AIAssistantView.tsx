'use client';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import type { AIChatMessage } from '@/lib/types';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';

const QUICK_SUGGESTIONS = [
  'Génère un exercice d\'algèbre',
  'Explique-moi la loi d\'Ohm',
  'Quelles sont les causes de la Révolution haïtienne?',
  'Donne-moi des conseils pour réussir le concours',
];

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(date);
}

// ── Loading dots animation ─────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
      <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
      <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

// ── Empty chat state ───────────────────────────────────────────
function EmptyChatState({ onSuggestionClick }: { onSuggestionClick: (msg: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Assistant IA PrépaConcours
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Posez-moi une question en mathématiques, physique, chimie, optique ou culture générale.
        Je suis là pour vous aider à réussir le concours !
      </p>

      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {QUICK_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="text-sm px-3 py-2 rounded-full border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function AIAssistantView() {
  const {
    aiMessages,
    addAiMessage,
    aiLoading,
    setAiLoading,
    setAiMessages,
  } = useAppStore();

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Auto-scroll on new messages ───────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages, aiLoading]);

  // ── Auto-resize textarea ─────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // ── Send message ─────────────────────────────────────────────
  async function handleSend(text?: string) {
    const message = (text ?? input).trim();
    if (!message || aiLoading) return;

    // Clear input
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Add user message
    const userMsg: AIChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    addAiMessage(userMsg);

    // Start loading
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: "Préparation concours Faculté des Sciences d'Haïti",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: AIChatMessage = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
        };
        addAiMessage(aiMsg);
      } else {
        addAiMessage({
          role: 'assistant',
          content: "Désolé, une erreur est survenue lors de la communication avec l'assistant. Veuillez réessayer.",
          timestamp: new Date(),
        });
      }
    } catch {
      addAiMessage({
        role: 'assistant',
        content: "Erreur de connexion. Vérifiez votre connexion internet et réessayez.",
        timestamp: new Date(),
      });
    } finally {
      setAiLoading(false);
    }
  }

  // ── Handle keyboard ─────────────────────────────────────────
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ── Clear chat ───────────────────────────────────────────────
  function handleClear() {
    setAiMessages([]);
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assistant IA</h1>
          <p className="text-sm text-muted-foreground">
            Votre tuteur personnel pour le concours
          </p>
        </div>
        {aiMessages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleClear}
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Effacer
          </Button>
        )}
      </div>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col mx-4 mb-2 overflow-hidden">
        <ScrollArea className="flex-1" ref={scrollRef}>
          <CardContent className="p-4 space-y-4">
            {aiMessages.length === 0 && !aiLoading ? (
              <EmptyChatState onSuggestionClick={handleSend} />
            ) : (
              <>
                {aiMessages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={index}
                      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      {/* Message bubble */}
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] ${
                          isUser ? 'items-end' : 'items-start'
                        }`}
                      >
                        <Card
                          className={
                            isUser
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted border-muted'
                          }
                        >
                          <CardContent className="p-3 text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </CardContent>
                        </Card>
                        <p
                          className={`text-[11px] text-muted-foreground mt-1 ${
                            isUser ? 'text-right' : 'text-left'
                          }`}
                        >
                          {formatTimestamp(new Date(msg.timestamp))}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {aiLoading && (
                  <div className="flex gap-3 flex-row">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <Card className="bg-muted border-muted">
                      <CardContent className="p-0">
                        <TypingIndicator />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </ScrollArea>

        {/* Quick suggestions (shown when chat has messages) */}
        {aiMessages.length > 0 && !aiLoading && (
          <div className="px-4 pt-2 border-t border-border/50">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-muted-foreground mt-0.5" />
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-full border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 pt-3 border-t border-border">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question..."
              className="min-h-[44px] max-h-[160px] resize-none flex-1"
              rows={1}
              disabled={aiLoading}
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || aiLoading}
              className="flex-shrink-0 h-[44px] w-[44px]"
            >
              {aiLoading ? (
                <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
            Appuyez sur Entrée pour envoyer, Shift+Entrée pour un saut de ligne
          </p>
        </div>
      </Card>
    </div>
  );
}
