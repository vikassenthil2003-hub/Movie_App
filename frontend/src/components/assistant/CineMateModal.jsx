import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Trash2, ArrowRight, Film, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAssistant } from '../../context/AssistantContext';
import { useLocationContext } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';

const CineMateModal = () => {
  const { isOpen, closeAssistant, toggleAssistant, messages, sendMessage, isLoading, clearChat } =
    useAssistant();
  const { selectedCity } = useLocationContext();
  const { isAdmin } = useAuth();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleChipClick = (chipText) => {
    sendMessage(chipText);
  };

  return (
    <>
      {/* Floating CineMate AI Launcher Button */}
      {!isOpen && (
        <button
          onClick={toggleAssistant}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-teal-500 text-white shadow-glow-violet hover:scale-105 active:scale-95 transition-all group font-medium text-sm border border-white/20 animate-float"
          aria-label="Open CineMate AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal-300 animate-ping" />
          </div>
          <span className="font-semibold tracking-wide">Ask CineMate AI</span>
        </button>
      )}

      {/* CineMate Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full sm:w-[440px] h-[600px] max-h-[85vh] flex flex-col rounded-2xl glass-panel shadow-2xl border border-violet-500/30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-cine-800/80 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-teal-500 text-white shadow-glow-violet">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base font-display">CineMate AI</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Live Assistant
                  </span>
                </div>
                <p className="text-xs text-slate-400">Context: {selectedCity}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={closeAssistant}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-violet-600/40 border border-violet-400/30 flex items-center justify-center text-violet-300 flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-violet-600 text-white rounded-tr-none shadow-glow-violet'
                        : 'bg-cine-800 text-slate-200 rounded-tl-none border border-white/10'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Suggestion Chips */}
                  {msg.suggestedChips && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedChips.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleChipClick(chip)}
                          className="text-xs px-3 py-1.5 rounded-full bg-cine-700/60 hover:bg-violet-600/40 hover:border-violet-500 border border-white/10 text-slate-300 hover:text-white transition-all text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action Cards (Movies, Shows, Theatres) */}
                  {msg.actionCards && msg.actionCards.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {msg.actionCards.map((card, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-3 rounded-xl bg-cine-850/90 border border-white/10 hover:border-violet-500/50 transition-all flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {card.posterUrl ? (
                              <img
                                src={card.posterUrl}
                                alt={card.title}
                                className="w-12 h-16 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-cine-700 flex items-center justify-center text-violet-400 flex-shrink-0">
                                {card.type === 'theatre' ? <MapPin className="w-5 h-5" /> : <Film className="w-5 h-5" />}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h5 className="font-semibold text-white text-xs truncate group-hover:text-violet-400 transition-colors">
                                {card.title}
                              </h5>
                              <p className="text-[11px] text-slate-400 truncate">{card.subtitle}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {card.badge && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-semibold">
                                    {card.badge}
                                  </span>
                                )}
                                {card.rating && (
                                  <span className="text-[10px] text-amber-400 font-bold">
                                    {card.rating}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {isAdmin && card.link?.startsWith('/booking/') ? (
                            <span
                              title="Ticket booking is disabled for admin accounts. Please use a customer account."
                              className="px-3 py-1.5 rounded-lg bg-cine-700/60 text-slate-400 text-xs font-semibold flex items-center gap-1 flex-shrink-0 cursor-not-allowed select-none opacity-70"
                            >
                              <span>Admin View</span>
                            </span>
                          ) : (
                            <Link
                              to={card.link}
                              onClick={closeAssistant}
                              className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1 flex-shrink-0 shadow-sm transition-all"
                            >
                              <span>{card.actionText || 'Book'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.reasoning && (
                    <p className="text-[10px] text-slate-500 italic pl-1">
                      💡 {msg.reasoning}
                    </p>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-center text-slate-400 text-xs">
                <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-400 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5 bg-cine-800 px-3.5 py-2.5 rounded-2xl border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-2 text-slate-400">Finding matching shows...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-cine-800/90 border-t border-white/10">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about shows, tickets, prices, recliners..."
                className="w-full pl-4 pr-12 py-3 rounded-xl glass-input text-xs sm:text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 p-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-all shadow-glow-violet"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default CineMateModal;
