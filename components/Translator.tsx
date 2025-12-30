
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Languages, Sparkles, Mic, Type, X, Send, Play, Square, Star } from 'lucide-react';
import { translateVision, translateText, translateAudio } from '../geminiService';

const languages = [
  { name: 'Detect Language', code: 'Auto-detect' },
  { name: 'Japanese', code: 'Japanese' },
  { name: 'Traditional Chinese', code: 'Traditional Chinese' },
  { name: 'Simplified Chinese', code: 'Simplified Chinese' },
  { name: 'English', code: 'English' },
  { name: 'Korean', code: 'Korean' },
  { name: 'Thai', code: 'Thai' },
  { name: 'Vietnamese', code: 'Vietnamese' },
  { name: 'French', code: 'French' },
  { name: 'German', code: 'German' },
  { name: 'Spanish', code: 'Spanish' },
  { name: 'Italian', code: 'Italian' },
  { name: 'Portuguese', code: 'Portuguese' },
  { name: 'Russian', code: 'Russian' },
];

const Translator: React.FC = () => {
  const [mode, setMode] = useState<'text' | 'camera' | 'voice'>('text');
  const [fromLang, setFromLang] = useState('Auto-detect');
  const [toLang, setToLang] = useState(''); // Default empty for placeholder
  const [translation, setTranslation] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [inputText, setInputText] = useState('');
  const [streamActive, setStreamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraIntervalRef = useRef<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (cameraIntervalRef.current) clearInterval(cameraIntervalRef.current);
    };
  }, []);

  const handleModeChange = (newMode: 'text' | 'camera' | 'voice') => {
    stopCamera();
    setTranslation('');
    setMode(newMode);
  };

  const handleTextTranslate = async () => {
    if (!inputText.trim() || !toLang) return;
    setIsProcessing(true);
    const result = await translateText(inputText, fromLang, toLang);
    setTranslation(result);
    setIsProcessing(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
        cameraIntervalRef.current = window.setInterval(captureAndTranslate, 4000);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Please allow camera access!");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    if (cameraIntervalRef.current) clearInterval(cameraIntervalRef.current);
  };

  const captureAndTranslate = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing || !toLang) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    setIsProcessing(true);
    const result = await translateVision(base64Data, fromLang, toLang);
    setTranslation(result);
    setIsProcessing(false);
  };

  const startRecording = async () => {
    if (!toLang) {
      alert("Please select a target language first!");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsProcessing(true);
          const result = await translateAudio(base64Audio, fromLang, toLang);
          setTranslation(result);
          setIsProcessing(false);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranslation('');
    } catch (err) {
      console.error("Error accessing mic:", err);
      alert("Please allow microphone access!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col animate-fadeIn px-2 pt-12 pb-8">
      {/* Title Banner - Hachiware Blue Theme */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="w-16 h-1 bg-sky-200 rounded-full mb-4 opacity-50"></div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-100 rounded-2xl text-sky-600 shadow-sm">
            <Star size={20} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Magic Wand</h1>
          <div className="p-2 bg-sky-100 rounded-2xl text-sky-600 shadow-sm">
            <Sparkles size={20} />
          </div>
        </div>
        <p className="text-[10px] text-sky-600 mt-2 uppercase font-black tracking-[0.2em] opacity-60">Talk to everyone like a local!</p>
      </div>

      <div className="space-y-6">
        {/* Mode Tab Switcher */}
        <div className="flex bg-white p-1.5 rounded-[2rem] border-2 border-sky-100 shadow-sm">
          {(['text', 'camera', 'voice'] as const).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${
                mode === m ? 'bg-sky-400 text-white shadow-md' : 'text-gray-300 hover:text-sky-400'
              }`}
            >
              {m === 'text' && <Type size={14} />}
              {m === 'camera' && <Camera size={14} />}
              {m === 'voice' && <Mic size={14} />}
              {m}
            </button>
          ))}
        </div>

        {/* Language Selection */}
        <div className="bg-white p-5 rounded-[2.5rem] border-2 border-sky-50 shadow-sm flex items-center gap-4">
          <div className="flex-1">
            <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">Source</label>
            <select value={fromLang} onChange={(e) => setFromLang(e.target.value)} className="w-full bg-transparent border-none p-0 font-black text-sky-800 text-xs focus:ring-0 appearance-none">
              {languages.map(lang => <option key={`from-${lang.code}`} value={lang.code}>{lang.name}</option>)}
            </select>
          </div>
          <div className="p-2 bg-sky-50 rounded-full text-sky-500 shadow-inner">
            <Languages size={14} />
          </div>
          <div className="flex-1">
            <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest block mb-1">Target</label>
            <select 
              value={toLang} 
              onChange={(e) => setToLang(e.target.value)} 
              className={`w-full bg-transparent border-none p-0 font-black text-xs focus:ring-0 appearance-none ${toLang === '' ? 'text-gray-300' : 'text-sky-800'}`}
            >
              <option value="" disabled hidden>Select a Language</option>
              {languages.filter(l => l.code !== 'Auto-detect').map(lang => <option key={`to-${lang.code}`} value={lang.code}>{lang.name}</option>)}
            </select>
          </div>
        </div>

        {/* Translation Mode Body */}
        <div className="min-h-[260px] relative">
          {mode === 'text' && (
            <div className="bg-white rounded-[3rem] border-2 border-sky-100 p-8 shadow-sm group focus-within:border-sky-300 transition-all">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your magic words... ✨"
                className="w-full h-32 bg-transparent border-none focus:ring-0 text-xl font-bold text-gray-700 resize-none p-0 placeholder:text-gray-200"
              />
              <div className="flex justify-end mt-4">
                <button onClick={handleTextTranslate} disabled={isProcessing || !inputText.trim() || !toLang} className="bg-sky-400 text-white p-4 rounded-full shadow-lg active:scale-95 disabled:opacity-30 transition-all shadow-sky-100"><Send size={20} /></button>
              </div>
            </div>
          )}

          {mode === 'camera' && (
            <div className="relative bg-black rounded-[3rem] overflow-hidden aspect-[4/3] shadow-xl border-4 border-white">
              {!streamActive ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-sky-50/50 p-8 text-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 border-4 border-sky-100 shadow-xl text-sky-500"><Camera size={40} /></div>
                  <button onClick={startCamera} className="px-10 py-4 bg-sky-400 text-white rounded-full font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all shadow-sky-100">Enable Vision</button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <button onClick={stopCamera} className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40"><X size={24} /></button>
                  <canvas ref={canvasRef} className="hidden" />
                </>
              )}
            </div>
          )}

          {mode === 'voice' && (
            <div className="bg-sky-50/50 rounded-[3rem] border-2 border-sky-100 p-12 flex flex-col items-center text-center space-y-8 shadow-inner relative overflow-hidden">
               <div className="relative z-10">
                  {isRecording && <div className="absolute inset-0 bg-sky-400/30 rounded-full animate-ping scale-150"></div>}
                  <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-90 ${isRecording ? 'bg-red-500 scale-110' : 'bg-sky-400 hover:bg-sky-500 shadow-sky-200'}`}>
                    {isRecording ? <Square size={36} className="text-white" /> : <Mic size={36} className="text-white" />}
                  </button>
               </div>
               <div className="z-10">
                  <h3 className="font-black text-sky-800 text-xl tracking-tight">{isRecording ? 'Listening...' : 'Hold & Speak'}</h3>
                  <p className="text-[10px] text-sky-600 font-bold uppercase tracking-widest mt-2 opacity-60">Magic translation in real-time</p>
               </div>
            </div>
          )}
        </div>

        {/* Translation Results */}
        {(translation || isProcessing) && (
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-[3rem] border-2 border-sky-100 shadow-2xl animate-slideUp">
            {isProcessing && !translation ? (
              <div className="flex flex-col items-center gap-4 text-sky-600 animate-pulse py-4">
                <Sparkles size={32} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Casting Translation Spell...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-800 font-black text-2xl text-center leading-snug px-4 italic">"{translation}"</p>
                <div className="flex justify-center gap-3">
                   <button onClick={() => {
                      const utterance = new SpeechSynthesisUtterance(translation);
                      utterance.lang = toLang === 'Japanese' ? 'ja-JP' : (toLang.includes('Chinese') ? 'zh-HK' : 'en-US');
                      window.speechSynthesis.speak(utterance);
                    }} className="p-4 bg-sky-400 rounded-full text-white hover:bg-sky-500 shadow-lg active:scale-90 transition-all shadow-sky-100"><Play size={20} fill="currentColor" /></button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-5 bg-sky-50/80 rounded-[2.5rem] border border-sky-100 flex items-start gap-4 shadow-sm">
           <div className="w-12 h-12 bg-white rounded-2xl flex-shrink-0 flex items-center justify-center border-2 border-sky-50 shadow-sm overflow-hidden">
             <img src="https://picsum.photos/seed/hachiware_tip/80" alt="Tip" className="w-full h-full object-cover" />
           </div>
           <p className="text-[11px] text-sky-700 leading-relaxed font-bold pt-1">
             <span className="block text-[9px] uppercase tracking-widest opacity-50 mb-0.5">Quick Hint</span>
             Translate menus with Camera mode, or talk to locals using Voice mode! 💙✨
           </p>
        </div>
      </div>
    </div>
  );
};

export default Translator;
