
import React, { useState, useRef } from 'react';
import { Sparkles, Upload, Send, RefreshCcw, Download } from 'lucide-react';
import { editTravelPhoto } from '../geminiService';

const PhotoEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setIsProcessing(true);
    const result = await editTravelPhoto(image, prompt);
    if (result) {
      setResultImage(result);
    } else {
      alert("Something went wrong with the AI magic!");
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-purple-50 p-6 rounded-[2.5rem] border-2 border-purple-100">
        <h2 className="text-xl font-bold text-purple-800 mb-2 flex items-center gap-2">
          <Sparkles className="text-purple-500" /> AI Photo Magic
        </h2>
        <p className="text-xs text-purple-600 mb-6">Edit your Japan photos with natural language!</p>

        {!image ? (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square border-4 border-dashed border-purple-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 bg-white hover:bg-purple-100 transition-all group"
          >
            <div className="p-5 bg-purple-50 rounded-full group-hover:scale-110 transition-transform">
              <Upload size={32} className="text-purple-400" />
            </div>
            <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">Select Travel Photo</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*"
            />
          </button>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-[2rem] overflow-hidden border-4 border-white shadow-lg aspect-square bg-gray-100">
              <img src={resultImage || image} alt="Travel preview" className="w-full h-full object-cover" />
              {isProcessing && (
                <div className="absolute inset-0 bg-purple-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="font-bold text-lg">Usagi is drawing... 🥕</p>
                  <p className="text-xs opacity-75">Gemini 2.5 Flash Image is editing your photo</p>
                </div>
              )}
            </div>

            <div className="bg-white p-3 rounded-3xl border-2 border-purple-100 shadow-inner flex items-center gap-3">
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. 'Add a cute pink filter' or 'Make it snowy'"
                className="flex-1 text-sm bg-transparent border-none focus:ring-0 p-2"
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              />
              <button 
                onClick={handleEdit}
                disabled={isProcessing || !prompt}
                className="bg-purple-600 text-white p-2.5 rounded-2xl hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => { setImage(null); setResultImage(null); setPrompt(''); }}
                className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
              >
                <RefreshCcw size={16} /> Reset
              </button>
              {resultImage && (
                 <a 
                  href={resultImage} 
                  download="chiikawa-trip-photo.png"
                  className="flex-1 py-3 bg-purple-100 text-purple-600 rounded-2xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-purple-200 transition-all"
                >
                  <Download size={16} /> Save
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-yellow-50 rounded-3xl border border-yellow-100 flex items-start gap-3">
         <div className="w-10 h-10 bg-white rounded-full flex-shrink-0 flex items-center justify-center text-xl shadow-sm border border-yellow-200">💡</div>
         <p className="text-[11px] text-yellow-800 leading-relaxed font-medium pt-1">
           <span className="font-bold">Try saying:</span> "Add a retro film grain", "Enhance the colors to be vibrant like an anime", or "Remove the tourists in the background".
         </p>
      </div>
    </div>
  );
};

export default PhotoEditor;
