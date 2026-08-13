'use client';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import type { AIChatMessage } from '@/lib/types';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';

const QUICK_SUGGESTIONS = [
  "Explique-moi les lois de Newton",
  "Genere un exercice d'algebre avec solution",
  "Quelles sont les causes de la Revolution haitienne?",
  "Comment calculer la limite d'une fonction?",
  "Explique la loi de Snell-Descartes",
  "Donne-moi des conseils pour reussir le concours",
];

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(date);
}

// Typing indicator
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
      <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
      <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

// Empty chat state
function EmptyChatState({ onSuggestionClick }: { onSuggestionClick: (msg: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Assistant IA PrepaConcours
      </h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Posez-moi n'importe quelle question en mathematiques, physique, chimie, optique, culture generale ou autre.
        L'IA repond a toutes vos questions !
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

// Main component
export default function AIAssistantView() {
  const {
    aiMessages,
    addAiMessage,
    aiLoading,
    setAiLoading,
    setAiMessages,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, aiLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Cleanup abort on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Send message to /api/ai endpoint (server-side z-ai-web-dev-sdk)
  async function handleSend(text?: string) {
    const message = (text ?? input).trim();
    if (!message || aiLoading) return;

    // Clear input
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setError(null);

    // Add user message
    addAiMessage({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Start loading
    setAiLoading(true);

    // Build conversation history for context (last 10 messages)
    const historyForContext = aiMessages
      .slice(-10)
      .map((m) => `${m.role === 'user' ? 'Etudiant' : 'Assistant'}: ${m.content}`)
      .join('\n');

    try {
      // Abort previous request if any
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: historyForContext || undefined,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`Erreur serveur (${res.status})`);
      }

      const data = await res.json();
      const reply = data.reply || 'Desole, je n\'ai pas pu generer une reponse. Veuillez reessayer.';

      addAiMessage({
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      addAiMessage({
        role: 'assistant',
        content: 'Desole, une erreur est survenue lors de la communication avec l\'assistant IA. Veuillez verifier votre connexion et reessayer.',
        timestamp: new Date(),
      });
    } finally {
      setAiLoading(false);
      abortRef.current = null;
    }
  }

  // Handle keyboard
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Clear chat
  function handleClear() {
    setAiMessages([]);
    setError(null);
  }

  // Render
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assistant IA</h1>
          <p className="text-sm text-muted-foreground">
            Posez n'importe quelle question - l'IA repond a tout !
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
        <ScrollArea className="flex-1">
          <CardContent className="p-4 space-y-4">
            {aiMessages.length === 0 && !aiLoading ? (
              <EmptyChatState onSuggestionClick={handleSend} />
            ) : (
              <>
                {aiMessages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  const avatarContent = isUser
                    ? <User className="w-4 h-4" />
                    : <Bot className="w-4 h-4" />;
                  return (
                    <div
                      key={index}
                      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {avatarContent}
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

                {/* Error banner */}
                {error && (
                  <div className="text-center text-xs text-red-500 bg-red-50 rounded-lg py-2 px-3">
                    {error}
                  </div>
                )}

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
          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </ScrollArea>

        {/* Quick suggestions (shown when chat has messages) */}
        {aiMessages.length > 0 && !aiLoading && (
          <div className="px-4 pt-2 border-t border-border/50">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-muted-foreground mt-0.5" />
              {QUICK_SUGGESTIONS.slice(0, 4).map((suggestion) => (
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
              placeholder="Posez n'importe quelle question..."
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
            Appuyez sur Entree pour envoyer, Shift+Entree pour un saut de ligne
          </p>
        </div>
      </Card>
    </div>
  );
}
