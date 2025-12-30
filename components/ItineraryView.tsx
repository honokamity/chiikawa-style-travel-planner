
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, MapPin, CheckCircle, ExternalLink, Clock, Image as ImageIcon, Sparkles, Upload, ChevronLeft, ChevronRight, Sun, Cloud, CloudRain, Snowflake } from 'lucide-react';
import { DayPlan, TripItem, TripProject } from '../types';
import { generateBanner, fetchCurrentWeather } from '../geminiService';

interface Props {
  project: TripProject;
  onUpdateProject: (updates: Partial<TripProject>) => void;
  onUpdateItem: (dayId: string, itemId: string, updates: Partial<TripItem>) => void;
  onAddItem: (dayId: string) => void;
  onDeleteItem: (dayId: string, itemId: string) => void;
  onShowMap: (location: string) => void;
  onBack: () => void;
}

const ItineraryView: React.FC<Props> = ({ project, onUpdateProject, onUpdateItem, onAddItem, onDeleteItem, onShowMap, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [weather, setWeather] = useState<{ high: number; low: number; condition: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dayBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadWeather = async () => {
      const data = await fetchCurrentWeather(project.title);
      if (data) setWeather(data);
    };
    loadWeather();
  }, [project.title]);

  const handleAiBanner = async () => {
    setIsGenerating(true);
    const url = await generateBanner(project.title);
    if (url) {
      onUpdateProject({ bannerUrl: url });
    }
    setIsGenerating(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdateProject({ bannerUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const scrollDays = (direction: 'left' | 'right') => {
    if (dayBarRef.current) {
      const scrollAmount = 200;
      dayBarRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const getShortDate = (dateStr: string) => {
    const d = new Date(`${dateStr}T00:00:00`);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  };

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    const iconClass = "drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] filter";
    if (c.includes('sun') || c.includes('clear')) return <Sun className={`text-yellow-400 ${iconClass}`} size={20} />;
    if (c.includes('cloud')) return <Cloud className={`text-gray-100 ${iconClass}`} size={20} />;
    if (c.includes('rain') || c.includes('shower')) return <CloudRain className={`text-blue-300 ${iconClass}`} size={20} />;
    if (c.includes('snow')) return <Snowflake className={`text-blue-100 ${iconClass}`} size={20} />;
    return <Cloud className={`text-gray-100 ${iconClass}`} size={20} />;
  };

  const activeDay = project.itinerary[activeDayIndex] || project.itinerary[0];

  useEffect(() => {
    if (activeDayIndex >= project.itinerary.length) {
      setActiveDayIndex(0);
    }
  }, [project.itinerary.length]);

  return (
    <div className="animate-fadeIn">
      {/* Banner Header Section */}
      <div className="relative group overflow-hidden rounded-b-[3.5rem] shadow-2xl aspect-[16/11] bg-yellow-100 border-b-4 border-yellow-200">
        {project.bannerUrl ? (
          <img src={project.bannerUrl} alt="Trip Banner" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-yellow-300">
            <ImageIcon size={64} strokeWidth={1} />
            <p className="text-xs font-bold uppercase tracking-widest mt-2">Add a banner to start ✨</p>
          </div>
        )}
        
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>

        <button onClick={onBack} className="absolute top-6 left-6 p-2.5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full border border-white/30 text-white shadow-lg z-20"><ChevronLeft size={24} /></button>
        
        <div className="absolute top-6 right-6 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white/90 hover:bg-black/40"><Upload size={18} /></button>
          <button onClick={handleAiBanner} disabled={isGenerating} className="p-2.5 bg-yellow-400/80 backdrop-blur-md rounded-full text-white hover:bg-yellow-500"><Sparkles size={18} className={isGenerating ? 'animate-spin' : ''} /></button>
        </div>

        <div className="absolute bottom-6 left-8 flex flex-col items-start pointer-events-none z-10">
           <h1 className="text-3xl font-bold text-white tracking-tight leading-tight mb-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{project.title}</h1>
           <p className="text-[11px] text-white/90 uppercase font-black tracking-[0.15em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{project.startDate} — {project.endDate}</p>
        </div>

        <div className="absolute bottom-6 right-8 flex flex-col items-end z-10 pointer-events-none">
          {weather ? (
            <div className="text-right">
              <div className="flex items-center gap-2.5 justify-end">
                {getWeatherIcon(weather.condition)}
                <span className="text-xl font-black text-white leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {weather.high}°<span className="text-white/70 text-sm font-bold ml-1">/ {weather.low}°</span>
                </span>
              </div>
              <p className="text-[10px] text-white/80 font-black uppercase tracking-widest mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {weather.condition}
              </p>
              <p className="text-[8px] text-white/50 font-bold tracking-tight mt-0.5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                {new Date().toLocaleDateString('en-GB')}
              </p>
            </div>
          ) : (
            <div className="animate-pulse text-white/40 text-[10px] font-bold uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Syncing Weather...</div>
          )}
        </div>

        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
      </div>

      {/* Day Selector Section */}
      <div className="px-2 mt-8 relative z-30">
        <div className="relative flex items-center group/nav">
          <button 
            onClick={() => scrollDays('left')}
            className="absolute left-2 z-40 p-2 bg-white/90 backdrop-blur-md rounded-full text-yellow-600 shadow-lg border border-yellow-100 transition-all active:scale-90 opacity-0 group-hover/nav:opacity-100"
          >
            <ChevronLeft size={20} />
          </button>

          <div 
            ref={dayBarRef}
            className="flex-1 flex items-center gap-4 overflow-x-auto no-scrollbar py-4 px-12 scroll-smooth snap-x"
          >
            {project.itinerary.map((day, idx) => (
              <button
                key={day.id}
                onClick={() => setActiveDayIndex(idx)}
                className={`shrink-0 snap-center flex flex-col items-center justify-center w-16 h-18 py-3 rounded-[1.5rem] transition-all duration-300 transform ${
                  activeDayIndex === idx 
                    ? 'bg-yellow-400 text-white shadow-[0_10px_20px_rgba(251,191,36,0.3)] scale-110 -translate-y-2' 
                    : 'bg-white text-gray-400 hover:bg-yellow-50 shadow-sm border border-yellow-50'
                }`}
              >
                <span className={`text-[10px] font-black tracking-tighter mb-1 ${activeDayIndex === idx ? 'text-white/80' : 'text-gray-300'}`}>
                  {getShortDate(day.date)}
                </span>
                <span className="text-xl font-black leading-none">
                  D{idx + 1}
                </span>
              </button>
            ))}
          </div>

          <button 
            onClick={() => scrollDays('right')}
            className="absolute right-2 z-40 p-2 bg-white/90 backdrop-blur-md rounded-full text-yellow-600 shadow-lg border border-yellow-100 transition-all active:scale-90 opacity-0 group-hover/nav:opacity-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Selected Day View */}
      {activeDay && (
        <div className="px-6 pt-6 animate-fadeIn pb-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-800">{formatDate(activeDay.date)}</h2>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">{activeDay.items.length} Activities</p>
            </div>
            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-400 border-2 border-pink-100 shadow-sm"><Sparkles size={24} /></div>
          </div>

          <div className="space-y-6">
            {activeDay.items.length === 0 ? (
              <div className="py-20 text-center text-gray-300 flex flex-col items-center gap-3">
                <div className="p-4 bg-gray-50 rounded-full"><Plus size={32} strokeWidth={1} /></div>
                <p className="text-sm font-bold">Nothing planned for D{activeDayIndex + 1} yet!</p>
              </div>
            ) : (
              activeDay.items.map((item, index) => (
                <div key={item.id} className="relative pl-8">
                  {/* 只為活動項目渲染虛線，且如果是最後一個項目則縮短虛線 */}
                  <div className={`absolute left-0 top-0 w-0.5 border-l-2 border-dashed border-pink-100 ${index === activeDay.items.length - 1 ? 'h-8' : 'h-full'}`}></div>
                  
                  {/* Timeline Dot */}
                  <div className="absolute top-8 -left-[11px] w-5 h-5 bg-pink-100 border-4 border-white rounded-full z-10"></div>
                  
                  <div className={`group bg-white p-5 rounded-[2.5rem] border-2 transition-all duration-300 shadow-sm relative ${item.completed ? 'border-green-100 bg-green-50/20 opacity-75' : 'border-yellow-50 hover:border-yellow-200'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <input type="time" value={item.time} onChange={(e) => onUpdateItem(activeDay.id, item.id, { time: e.target.value })} className="text-xs font-bold text-gray-500 bg-transparent border-none p-0 focus:ring-0" />
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => onUpdateItem(activeDay.id, item.id, { completed: !item.completed })} className={`p-2 rounded-full ${item.completed ? 'text-green-600 bg-green-100' : 'text-gray-300 bg-gray-50'}`}><CheckCircle size={18} /></button>
                        <button onClick={() => onDeleteItem(activeDay.id, item.id)} className="p-2 text-gray-300 hover:text-red-400"><Trash2 size={18} /></button>
                      </div>
                    </div>
                    <input type="text" value={item.activity} onChange={(e) => onUpdateItem(activeDay.id, item.id, { activity: e.target.value })} placeholder="Activity name..." className={`w-full font-black text-gray-800 bg-transparent border-none p-0 mb-2 text-xl focus:ring-0 ${item.completed ? 'line-through text-gray-400' : ''}`} />
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-yellow-500" />
                      <input type="text" value={item.location} onChange={(e) => onUpdateItem(activeDay.id, item.id, { location: e.target.value })} placeholder="Location..." className="flex-1 text-xs font-bold text-gray-500 bg-transparent border-none p-0 focus:ring-0" />
                      {item.location && <button onClick={() => onShowMap(item.location)} className="text-[9px] font-black text-yellow-600 bg-yellow-100 px-3 py-1.5 rounded-full uppercase">MAP</button>}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* 最後的按鈕與 Marker：這裡不再有左側虛線 */}
            <div className="pl-8">
              <button onClick={() => onAddItem(activeDay.id)} className="w-full py-5 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex items-center justify-center gap-2 text-gray-300 hover:text-yellow-400 hover:bg-yellow-50 transition-all font-black uppercase tracking-widest text-xs mb-4"><Plus size={20} /> Add Activity</button>
              
              <div className="flex flex-col items-center py-6 opacity-40">
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-3"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">— End of Day —</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryView;
