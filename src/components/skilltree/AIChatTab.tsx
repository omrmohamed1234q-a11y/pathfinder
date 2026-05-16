import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Lightbulb, Sparkles, BookOpen, Zap, User } from 'lucide-react';
import { toast } from 'sonner';
import { streamChat } from '@/services/geminiService';
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIChatTabProps {
  nodeTitle: string;
  nodeContent?: string;
  topic: string;
}

export const AIChatTab: React.FC<AIChatTabProps> = ({ nodeTitle, nodeContent, topic }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your AI tutor for "${nodeTitle}". I can help you understand concepts, generate practice problems, or explain things in simpler terms. What would you like to know?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [streamingMessage, setStreamingMessage] = useState('');

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // Build context-aware system prompt
      const systemPrompt = `You are an expert AI tutor helping a student learn about "${nodeTitle}" in the context of "${topic}".

Current lesson content: ${nodeContent || 'No content available'}

Your role:
- Answer questions clearly and concisely
- Provide real-world examples
- Generate practice problems when asked
- Give progressive hints (don't spoil answers immediately)
- Adapt explanations to the student's level
- Be encouraging and supportive

Keep responses under 200 words unless the student asks for more detail.`;

      // Build message history
      const chatMessages = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: textToSend }
      ];

      // Stream response using Gemini
      const fullResponse = await streamChat(systemPrompt, chatMessages, (chunk) => {
        setStreamingMessage(chunk);
      });

      // Add complete message
      const assistantMessage: Message = {
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage('');

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please check your API key.');
      
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    let prompt = '';
    switch (action) {
      case 'eli5':
        prompt = 'Explain this concept like I\'m 5 years old';
        break;
      case 'example':
        prompt = 'Give me a real-world example of this concept';
        break;
      case 'practice':
        prompt = 'Generate 3 practice problems for me to solve';
        break;
      case 'hint':
        prompt = 'Give me a hint to understand this better (don\'t give away the answer)';
        break;
    }
    setInput(prompt);
    sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          onClick={() => handleQuickAction('eli5')}
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={isLoading}
        >
          <Sparkles className="h-3 w-3 mr-1" />
          ELI5
        </Button>
        <Button
          onClick={() => handleQuickAction('example')}
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={isLoading}
        >
          <BookOpen className="h-3 w-3 mr-1" />
          Example
        </Button>
        <Button
          onClick={() => handleQuickAction('practice')}
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={isLoading}
        >
          <Zap className="h-3 w-3 mr-1" />
          Practice
        </Button>
        <Button
          onClick={() => handleQuickAction('hint')}
          variant="outline"
          size="sm"
          className="text-xs"
          disabled={isLoading}
        >
          <Lightbulb className="h-3 w-3 mr-1" />
          Hint
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 glass rounded-xl p-4 mb-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="glass-strong rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'glass-strong'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="glass-strong rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-secondary" />
                </div>
              )}
            </div>
          ))}

          {/* Streaming message */}
          {streamingMessage && (
            <div className="flex gap-3 justify-start">
              <div className="glass-strong rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="max-w-[80%] rounded-2xl px-4 py-3 glass-strong">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{streamingMessage}</p>
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && !streamingMessage && (
            <div className="flex gap-3 justify-start">
              <div className="glass-strong rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="glass-strong rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask me anything about this topic..."
          className="resize-none"
          rows={2}
          disabled={isLoading}
        />
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="h-auto"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Tip */}
      <p className="text-xs text-muted-foreground mt-2 text-center">
        💡 Tip: Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
};
