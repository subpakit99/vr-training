"use client";
import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2, Headset, MessageSquareHeart } from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "พนักงานคนไหนพัฒนาสุดในเดือนนี้?",
    "ใบรับรองของใครใกล้หมดอายุ?",
    "แผนกไหนอบรมน้อยสุด?",
    "ใครยังขาดหลักสูตรบังคับ?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text })
      });

      const data = await res.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || data.error || 'เกิดข้อผิดพลาดในการรับข้อมูล'
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อกับผู้ช่วยของคุณค่ะ' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.15)] transition-all duration-300 hover:shadow-[0_0_25px_rgb(16,185,129,0.5)] hover:scale-110 flex items-center justify-center bg-blue-500 text-white group ${isOpen ? 'opacity-0 pointer-events-none scale-50' : 'opacity-100 scale-100'}`}
      >
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute 0 top-0 right-0 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-300 border-2 border-blue-500"></span>
        </span>
      </button>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Panel */}
      <div 
        className={`fixed top-0 bottom-0 right-0 z-50 w-full md:w-[420px] md:h-[700px] md:top-auto md:bottom-6 md:right-6 bg-bg-card shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] md:rounded-3xl flex flex-col transition-all duration-300 ease-out border border-border-color/50 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-border-color shrink-0 bg-bg-card md:rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Headset size={24} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-bg-card rounded-full"></div>
            </div>
            <div>
              <h2 className="font-bold text-text-primary text-lg leading-tight">น้องวีอาร์ (VR Support)</h2>
              <p className="text-blue-500 text-xs font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                พร้อมให้บริการค่ะ
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-bg-primary rounded-xl transition-colors text-text-secondary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 bg-bg-primary flex flex-col gap-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-700">
              <div className="w-20 h-20 bg-white shadow-sm text-blue-500 rounded-[2rem] flex items-center justify-center mb-5 rotate-3 border border-border-color/50">
                <MessageSquareHeart size={36} className="animate-pulse" />
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-2">สวัสดีค่ะ! มีอะไรให้วีอาร์ช่วยไหมคะ? ✨</h3>
              <p className="text-sm text-text-secondary mb-8 leading-relaxed max-w-[260px]">
                สอบถามข้อมูลการอบรม หรือสรุปสถิติพนักงานได้เลยค่ะ วีอาร์ยินดีให้บริการ
              </p>
              
              <div className="flex flex-col gap-2.5 w-full">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="text-left text-sm bg-bg-card border border-border-color hover:border-blue-500 hover:shadow-md hover:text-blue-600 hover:-translate-y-0.5 px-4 py-3.5 rounded-2xl transition-all duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-1 shadow-sm">
                      <Headset size={16} />
                    </div>
                  )}
                  <div className={`p-3.5 text-[15px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-bg-card border border-border-color text-text-primary rounded-2xl rounded-tl-sm whitespace-pre-wrap'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%] animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Headset size={16} />
                  </div>
                  <div className="p-4 bg-bg-card border border-border-color rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-[50px]">
                     <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                     <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                     <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-1" />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-bg-card border-t border-border-color md:rounded-b-3xl shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="พิมพ์ข้อความคุยกับวีอาร์..."
                className="w-full pl-4 pr-10 py-3 bg-bg-primary border border-border-color rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[15px] text-text-primary placeholder:text-text-secondary/60 transition-all"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={() => handleSend(input)}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
            </button>
          </div>
          <div className="text-center mt-3">
            <span className="text-[10px] text-text-secondary/70 uppercase tracking-wider font-medium">✨ Powered by AI Assistant ✨</span>
          </div>
        </div>
      </div>
    </>
  );
}
