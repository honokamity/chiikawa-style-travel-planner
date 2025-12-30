
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, History, Trash2, MessageSquare, ChevronLeft, Bot, User, Image as ImageIcon, Mic, X, ChevronDown, Stars, Heart } from 'lucide-react';
import { chatWithGemini } from '../geminiService';
import { ChatMessage, ChatSession, TripProject } from '../types';

interface Props {
  project: TripProject;
  onUpdateProject: (updates: Partial<TripProject>) => void;
}

const AiAssistant: React.FC<Props> = ({ project, onUpdateProject }) => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3-flash-preview' | 'gemini-3-pro-preview'>('gemini-3-flash-preview');
  const [attachedImage, setAttachedImage] = useState<{ mimeType: string; data: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const chats = project.chats || [];
  const activeChat = chats.find(c => c.id === currentChatId);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + ' ' + transcript);
        setIsRecording(false);
      };
      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isTyping]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setAttachedImage({ mimeType: file.type, data: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !attachedImage) return;

    const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [];
    if (inputText.trim()) {
      parts.push({ text: inputText });
    }
    if (attachedImage) {
      parts.push({ inlineData: attachedImage });
    }

    const userMessage: ChatMessage = {
      role: 'user',
      parts: parts as any,
      timestamp: Date.now(),
    };

    let chatId = currentChatId;
    let newChats = [...chats];

    if (!chatId) {
      chatId = Math.random().toString(36).substr(2, 9);
      const newSession: ChatSession = {
        id: chatId,
        title: inputText.length > 25 ? inputText.substring(0, 25) + '...' : (attachedImage ? 'Image Query' : 'New Chat'),
        messages: [userMessage],
        lastUpdated: Date.now(),
        model: selectedModel
      };
      newChats = [newSession, ...newChats];
      setCurrentChatId(chatId);
    } else {
      newChats = newChats.map(c => 
        c.id === chatId 
          ? { ...c, messages: [...c.messages, userMessage], lastUpdated: Date.now() } 
          : c
      );
    }

    setInputText('');
    const sentImage = attachedImage;
    setAttachedImage(null);
    setIsTyping(true);
    onUpdateProject({ chats: newChats });

    const history = (newChats.find(c => c.id === chatId)?.messages || []).map(m => ({
      role: m.role,
      parts: m.parts.map(p => {
        if (p.text) return { text: p.text };
        if (p.inlineData) return { inlineData: p.inlineData };
        return p;
      }),
    }));

    const response = await chatWithGemini(inputText, history.slice(0, -1), selectedModel, sentImage || undefined);

    const modelMessage: ChatMessage = {
      role: 'model',
      parts: [{ text: response || '...' }],
      timestamp: Date.now(),
    };

    const finalChats = newChats.map(c => 
      c.id === chatId 
        ? { ...c, messages: [...c.messages, modelMessage], lastUpdated: Date.now() } 
        : c
    );

    onUpdateProject({ chats: finalChats });
    setIsTyping(false);
  };

  const deleteChat = (id: string) => {
    const updated = chats.filter(c => c.id !== id);
    onUpdateProject({ chats: updated });
    if (currentChatId === id) setCurrentChatId(null);
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-black text-gray-800 mt-6 mb-2">{line.replace('### ', '')}</h3>;
      }
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-pink-700 font-black">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return <div key={i} className="flex gap-2 ml-2 mb-2"><span className="text-pink-400">•</span> <div className="flex-1">{formattedLine}</div></div>;
      }
      return <p key={i} className="mb-3 leading-relaxed text-gray-700">{formattedLine}</p>;
    });
  };

  if (showHistory) {
    return (
      <div className="flex flex-col h-full bg-white animate-fadeIn relative overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-50 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-black text-gray-800">Recents ✨</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 no-scrollbar pb-32">
          {chats.length === 0 ? (
            <div className="text-center py-20 text-gray-300">
              <History size={64} className="mx-auto mb-4 opacity-10" />
              <p className="text-sm font-bold uppercase tracking-widest">No history yet</p>
            </div>
          ) : (
            chats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => { setCurrentChatId(chat.id); setShowHistory(false); }}
                className="group flex items-center justify-between p-5 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-pink-100 hover:bg-white transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl text-pink-500 shadow-sm">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 truncate max-w-[180px]">{chat.title}</h4>
                    <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase">{chat.model?.split('-')[1]?.toUpperCase() || 'FLASH'}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                  className="p-2 text-gray-300 hover:text-red-400 active:scale-90 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 p-6 bg-white">
          <button 
            onClick={() => { setCurrentChatId(null); setShowHistory(false); }}
            className="w-full py-5 bg-pink-400 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-pink-100 active:scale-[0.98] transition-all"
          >
            New Question
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Dynamic Title Banner - Pink Chiikawa Theme */}
      <div className="px-6 pt-10 pb-4 bg-white z-20 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setShowHistory(true)}
            className="p-3 bg-pink-50 text-pink-600 rounded-2xl hover:bg-pink-100 transition-colors shadow-sm"
          >
            <History size={20} />
          </button>
          
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <Heart size={16} className="text-pink-400" fill="currentColor" />
              <h1 className="text-xl font-black text-gray-800 tracking-tight">Sweet Genie</h1>
              <Sparkles size={16} className="text-pink-400" />
            </div>
            <p className="text-[9px] text-pink-600 font-black uppercase tracking-[0.2em] opacity-60 mt-0.5">Dreamy trip helper</p>
          </div>

          <button 
            className="p-3 bg-pink-50 text-pink-600 rounded-2xl hover:bg-pink-100 transition-colors shadow-sm relative group"
            onClick={() => setSelectedModel(selectedModel === 'gemini-3-flash-preview' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview')}
          >
            <Bot size={20} />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-pink-400 rounded-full border-2 border-white flex items-center justify-center">
              <ChevronDown size={8} className="text-white" />
            </div>
          </button>
        </div>
        
        <div className="flex justify-center">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 rounded-full border border-gray-100">
             <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse"></div>
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
               Powered by Gemini {selectedModel.split('-')[2].toUpperCase()}
             </span>
           </div>
        </div>
      </div>

      {/* Message Flow */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-12 no-scrollbar pb-32">
        {!activeChat && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fadeIn py-10 opacity-80">
            <div className="relative">
              <div className="absolute inset-0 bg-pink-100 rounded-full blur-2xl animate-pulse scale-150"></div>
              <div className="relative w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-pink-500 shadow-xl border-4 border-pink-50 transform -rotate-6">
                 <Heart size={48} fill="currentColor" />
              </div>
            </div>
            <div className="max-w-[260px]">
              <h2 className="text-2xl font-black text-gray-800 mb-4 tracking-tight leading-snug">Ready for your trip magic?</h2>
              <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest leading-relaxed">
                Ask about {project.title} or upload a photo of a menu!
              </p>
            </div>
          </div>
        )}

        {activeChat?.messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'user' ? (
              <div className="flex flex-col items-end gap-2 max-w-[85%] animate-fadeIn">
                <div className="px-6 py-4 bg-pink-400 text-white rounded-3xl rounded-tr-md text-sm font-bold shadow-lg shadow-pink-100">
                  {msg.parts.find(p => p.text)?.text}
                </div>
                {msg.parts.find(p => p.inlineData) && (
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-pink-400 shadow-md mt-2">
                    <img src={`data:${msg.parts.find(p => p.inlineData)!.inlineData!.mimeType};base64,${msg.parts.find(p => p.inlineData)!.inlineData!.data}`} className="w-full h-full object-cover" alt="user upload" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full animate-fadeIn">
                <div className="flex items-center gap-2 mb-5">
                   <div className="w-8 h-8 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 border border-pink-100">
                     <Sparkles size={16} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Genie Says</span>
                </div>
                <div className="text-[15px] font-medium text-gray-700 leading-relaxed pl-1 whitespace-pre-wrap">
                  {renderFormattedText(msg.parts[0].text || '')}
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex flex-col items-start space-y-4 animate-pulse">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-pink-50 rounded-xl flex items-center justify-center text-pink-400 border border-pink-100">
                 <Bot size={16} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-200">Consulting stars...</span>
            </div>
            <div className="space-y-3 w-full pl-1">
              <div className="h-2.5 bg-gray-50 rounded-full w-3/4"></div>
              <div className="h-2.5 bg-gray-50 rounded-full w-1/2"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-10" />
      </div>

      {/* Gemini Mobile Input Bar */}
      <div className="absolute bottom-4 left-0 right-0 p-4 bg-white/80 backdrop-blur-md z-30">
        <div className="max-w-md mx-auto relative">
          {attachedImage && (
            <div className="absolute bottom-full mb-3 left-4 animate-slideUp">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-pink-400 shadow-lg">
                <img src={`data:${attachedImage.mimeType};base64,${attachedImage.data}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setAttachedImage(null)}
                  className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          )}
          
          <div className={`flex items-center gap-2 bg-gray-100/60 rounded-full px-2 py-2 transition-all duration-300 ${inputText.trim() || attachedImage ? 'bg-white border-2 border-pink-200 shadow-xl' : 'border-2 border-transparent shadow-inner'}`}>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-400 hover:text-pink-600 active:scale-90 transition-all"
            >
              <ImageIcon size={22} />
            </button>
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask the genie anything..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 font-bold text-gray-700 placeholder:text-gray-300"
            />
            <button 
              onClick={handleVoiceInput}
              className={`p-3 rounded-full transition-all active:scale-90 ${isRecording ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-pink-600'}`}
            >
              <Mic size={22} className={isRecording ? 'animate-pulse' : ''} />
            </button>
            <button 
              onClick={handleSendMessage}
              disabled={(!inputText.trim() && !attachedImage) || isTyping}
              className={`p-3 rounded-full transition-all active:scale-90 ${
                (!inputText.trim() && !attachedImage) || isTyping ? 'bg-gray-100 text-white' : 'bg-pink-400 text-white hover:bg-pink-500 shadow-lg shadow-pink-100'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload} 
      />
    </div>
  );
};

export default AiAssistant;
