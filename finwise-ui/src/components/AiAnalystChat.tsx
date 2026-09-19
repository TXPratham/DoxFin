import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  BookOpen,
  ExternalLink,
  Bot,
  User,
  Zap
} from 'lucide-react';
import type { ChatMessage } from '../types/finwise';

interface AiAnalystChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onInspectPage: (pageNumber: number) => void;
}

export const AiAnalystChat: React.FC<AiAnalystChatProps> = ({
  messages,
  onSendMessage,
  onInspectPage
}) => {
  const [inputText, setInputText] = useState<string>('');

  const samplePrompts = [
    'Why did net profit margin contract in FY2025 despite 20% revenue growth?',
    'What is the Free Cash Flow trend and CapEx breakdown?',
    'Explain the trade receivables expansion and credit terms change.'
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-purple flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Granite LLM Explanation Engine
              </span>
              <span className="badge badge-cyan">FAISS RAG Grounded</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-heading">
              Evidence-Backed AI Financial Analyst
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              Ask natural language questions about your 500-page annual report. Every response is verified against Python deterministic metrics and linked with page-level citations.
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="glass-panel p-6 space-y-6 flex flex-col min-h-[550px] justify-between">
        {/* Messages Stream */}
        <div className="space-y-4 overflow-y-auto max-h-[450px] pr-2">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-purple-300" />
                  </div>
                )}

                <div
                  className={`max-w-2xl p-4 rounded-xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-sky-600/30 text-white border border-sky-500/40 rounded-tr-none'
                      : 'bg-slate-900 text-gray-200 border border-gray-800 rounded-tl-none space-y-3'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="font-bold text-[11px] text-gray-300">
                      {isUser ? 'Financial Analyst (You)' : 'FinWise Intelligence Model'}
                    </span>
                    <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                  </div>

                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Citations Box */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-800/80 space-y-2">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                        Verified Evidence Citations:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.citations.map((cit, idx) => (
                          <div
                            key={idx}
                            onClick={() => onInspectPage(cit.pageNumber)}
                            className="bg-slate-950 p-2.5 rounded-lg border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition flex items-start justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="w-3 h-3 text-cyan-400" />
                                <span className="font-bold text-cyan-300 text-[11px]">
                                  Page {cit.pageNumber}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 block mt-0.5 truncate max-w-[170px]">
                                {cit.section}
                              </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-sky-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Prompts */}
        <div className="space-y-3 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Suggested Research Questions:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => onSendMessage(p)}
                className="bg-slate-900 hover:bg-slate-800 text-xs text-sky-300 border border-gray-800 hover:border-sky-500/40 px-3 py-1.5 rounded-lg transition text-left"
              >
                "{p}"
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask FinWise about revenue, margins, debt notes, cash flow, or segment breakdown..."
              className="flex-1 bg-slate-900 text-xs text-gray-200 p-3 rounded-xl border border-gray-800 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="btn-primary bg-purple-600 hover:bg-purple-700 border-purple-500 text-xs px-5"
            >
              <Send className="w-4 h-4" />
              Ask
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
