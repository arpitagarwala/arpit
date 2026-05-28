'use client';

import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import BackButton from '@/components/BackButton/BackButton';
import styles from './aiAssistant.module.css';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const WORKER_URL = 'https://arpit-chatbot.arpitagarwala.workers.dev';

const SUGGESTIONS = [
  'What projects has Arpit built?',
  'Tell me about his experience',
  'What are his skills?',
  'How can I contact him?'
];

export default function AiAssistantClient() {
  const [isClient, setIsClient] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
    marked.setOptions({ breaks: true, gfm: true });
    // Focus input on mount
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    });
  };

  const escapeHtml = (str: string) => {
    if (typeof window === 'undefined') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const sendMessage = async (query: string) => {
    if (isProcessing || !query.trim()) return;
    setIsProcessing(true);
    setShowSuggestions(false);
    
    // Optimistic UI
    const newUserMsg: Message = { role: 'user', text: query };
    setHistory(prev => [...prev, newUserMsg]);
    setInputValue('');
    scrollToBottom();

    try {
      const payloadHistory = history.map(h => ({ role: h.role, text: h.text })).slice(-8);
      
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          history: payloadHistory,
          system_instruction: 'You are Arpit Agarwala\'s AI Avatar. You MUST ONLY answer questions related to Arpit Agarwala — his profile, projects, skills, education, experience, achievements, and portfolio. If a user asks a question that is not specifically about Arpit Agarwala or his work, politely decline by saying something like: "I\'m Arpit\'s AI Avatar and I can only help with questions about Arpit — his projects, skills, experience, and portfolio. Feel free to ask me anything about him!" Never answer general knowledge, coding help, or any topic unrelated to Arpit.'
        })
      });

      if (!res.ok) {
        throw new Error(`Server error (${res.status})`);
      }

      const data = await res.json();
      const answer = data.answer || 'Sorry, I could not generate a response.';
      
      setHistory(prev => [...prev, { role: 'model', text: answer }]);
      
    } catch (err: any) {
      console.error('Chat error:', err);
      let errorMsg = 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.';
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        errorMsg = 'The AI backend is not connected yet. Please check the setup guide to deploy the Cloudflare Worker.';
      }
      setHistory(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
      setIsProcessing(false);
      scrollToBottom();
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const clearChat = () => {
    setHistory([]);
    setShowSuggestions(true);
  };

  if (!isClient) return <div className="h-screen w-full bg-[#0a0e1a]"></div>;

  return (
    <div className={`h-screen w-full flex flex-col sm:flex-row items-center justify-center sm:p-4 md:p-6 overflow-hidden relative bg-[#0a0e1a] text-slate-100 font-sans`}>
      
      {/* Background Effect */}
      <div className={`fixed inset-0 z-0 pointer-events-none opacity-50 flex flex-wrap gap-1 content-start overflow-hidden ${styles.bgMesh}`}>
        <div className="w-full h-full absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-[#0a0e1a] z-10"></div>
        <div className="w-full h-full text-[10px] sm:text-xs text-indigo-500/20 font-mono tracking-widest absolute inset-0 z-0 animate-pulse">
          {/* Binary rain placeholder if we wanted */}
        </div>
      </div>

      {/* Main Container */}
      <div className="z-10 w-full h-full sm:h-[90vh] sm:max-w-4xl bg-slate-900/80 backdrop-blur-xl border-0 sm:border border-indigo-400/20 sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative">
        
        <header className="px-4 sm:px-6 py-4 sm:py-5 border-b border-indigo-500/10 flex items-center justify-between bg-slate-900/90 shadow-sm z-20 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-800 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-indigo-400/30 overflow-hidden">
              <img src="https://res.cloudinary.com/dxsja3wy5/image/upload/w_100,h_100,c_fill,q_auto,f_png/v1772863840/tab-icon.png" alt="Arpit" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">Arpit's AI Avatar</h1>
              <p className="text-[10px] sm:text-[12px] text-indigo-300/80 font-mono tracking-wide">Ask about Arpit's profile, projects & skills</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <BackButton />
            <button onClick={clearChat} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition">
              <i className="ri-delete-bin-line text-lg"></i>
            </button>
          </div>
        </header>

        <main ref={chatBoxRef} className={`flex-1 px-4 py-5 overflow-y-auto flex flex-col gap-4 ${styles.customScroll}`}>
          
          {/* Welcome Message */}
          <div className={`flex items-end gap-2.5 ${styles.msgIn}`}>
            <div className="w-7 h-7 rounded-full bg-slate-800 shrink-0 flex items-center justify-center overflow-hidden border border-indigo-500/30">
              <img src="https://res.cloudinary.com/dxsja3wy5/image/upload/w_100,h_100,c_fill,q_auto,f_png/v1772863840/tab-icon.png" alt="Arpit" className="w-full h-full object-cover" />
            </div>
            <div className={`bg-slate-800/80 text-slate-200 px-4 py-3 rounded-2xl rounded-bl-none max-w-[85%] shadow-md border border-white/5 text-[13px] leading-relaxed ${styles.botMsg}`}>
              <p>Hey! 👋 I'm <strong>Arpit's AI Avatar</strong>. I can answer questions about Arpit's projects, skills, experience, education, and anything on his portfolio. Feel free to ask!</p>
            </div>
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className={`flex flex-wrap gap-1.5 pl-9 ${styles.msgIn}`}>
              {SUGGESTIONS.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => sendMessage(s)} 
                  className="text-[11px] px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-300 hover:bg-indigo-500/15 hover:border-indigo-400/50 transition font-medium"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Chat History */}
          {history.map((msg, idx) => {
            if (msg.role === 'user') {
              return (
                <div key={idx} className={`flex flex-row-reverse items-end gap-2.5 ${styles.msgIn}`}>
                  <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-br-none max-w-[85%] shadow-md text-[13px] leading-relaxed" 
                       dangerouslySetInnerHTML={{ __html: escapeHtml(msg.text).replace(/\n/g, '<br>') }} />
                </div>
              );
            } else {
              return (
                <div key={idx} className={`flex items-end gap-2.5 ${styles.msgIn}`}>
                  <div className="w-7 h-7 rounded-full bg-slate-800 shrink-0 flex items-center justify-center overflow-hidden border border-indigo-500/30">
                    <img src="https://res.cloudinary.com/dxsja3wy5/image/upload/w_100,h_100,c_fill,q_auto,f_png/v1772863840/tab-icon.png" alt="Arpit" className="w-full h-full object-cover" />
                  </div>
                  <div className={`bg-slate-800/80 text-slate-200 px-4 py-3 rounded-2xl rounded-bl-none max-w-[85%] shadow-md border border-white/5 text-[13px] leading-relaxed w-full overflow-x-auto ${styles.botMsg}`} 
                       dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) as string }} />
                </div>
              );
            }
          })}

          {/* Typing Indicator */}
          {isProcessing && (
            <div className="px-4 pb-2">
              <div className={`flex items-end gap-2.5 ${styles.msgIn}`}>
                <div className="w-7 h-7 rounded-full bg-slate-800 shrink-0 flex items-center justify-center overflow-hidden border border-indigo-500/30">
                  <img src="https://res.cloudinary.com/dxsja3wy5/image/upload/w_100,h_100,c_fill,q_auto,f_png/v1772863840/tab-icon.png" alt="Arpit" className="w-full h-full object-cover" />
                </div>
                <div className="bg-slate-800/80 px-4 py-3 rounded-2xl rounded-bl-none shadow-md border border-white/5 flex gap-1.5 items-center">
                  <div className={`w-1.5 h-1.5 bg-indigo-400 rounded-full ${styles.dotBounce}`}></div>
                  <div className={`w-1.5 h-1.5 bg-indigo-400 rounded-full ${styles.dotBounce}`}></div>
                  <div className={`w-1.5 h-1.5 bg-indigo-400 rounded-full ${styles.dotBounce}`}></div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="px-4 py-3.5 bg-slate-900/40 backdrop-blur shrink-0 border-t border-white/8">
          <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
            <input 
              ref={inputRef}
              type="text" 
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask about Arpit's projects, skills…"
              className={`flex-1 bg-slate-800/70 border border-slate-700/60 rounded-xl pl-4 pr-4 py-3 text-slate-100 placeholder-slate-500 text-sm transition shadow-inner ${styles.chatInput}`}
              autoComplete="off" 
            />
            <button 
              type="submit" 
              disabled={isProcessing || !inputValue.trim()}
              className="w-10 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition shadow-lg shrink-0"
            >
              <i className="ri-send-plane-fill text-base"></i>
            </button>
          </form>
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            <span className="text-[9px] text-slate-600 font-medium tracking-wide">Powered by</span>
            <span className="text-[9px] text-indigo-400 font-bold tracking-wide">AI + RAG</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
