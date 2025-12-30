
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  CreditCard, 
  Sparkles, 
  Plus, 
  Trash2, 
  ChevronLeft,
  Languages
} from 'lucide-react';
import { TripItem, DayPlan, TripProject } from './types';
import ItineraryView from './components/ItineraryView';
import CurrencyCalculator from './components/CurrencyCalculator';
import AiAssistant from './components/AiAssistant';
import MapViewer from './components/MapViewer';
import Dashboard from './components/Dashboard';
import Translator from './components/Translator';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'trip'>('dashboard');
  const [activeTab, setActiveTab] = useState<'planner' | 'map' | 'translator' | 'currency' | 'ai'>('planner');
  
  const [projects, setProjects] = useState<TripProject[]>(() => {
    const start = new Date('2025-12-17');
    const end = new Date('2025-12-31');
    const days: DayPlan[] = [];
    let current = new Date(start);
    while (current <= end) {
      days.push({ 
        id: Math.random().toString(36).substr(2, 5), 
        date: current.toISOString().split('T')[0], 
        items: current.getDate() === 17 ? [
          { id: 'item1', time: '10:00', activity: 'Shibuya Crossing', location: 'Shibuya, Tokyo', type: 'sightseeing', completed: false, notes: 'Famous intersection!' },
          { id: 'item2', time: '12:30', activity: 'Ichiran Ramen', location: 'Shibuya, Tokyo', type: 'food', completed: false, bookingRef: 'BK-12345' },
        ] : []
      });
      current.setDate(current.getDate() + 1);
    }

    return [{
      id: 'p1',
      title: 'Tokyo, Japan 🗼',
      startDate: '2025-12-17',
      endDate: '2025-12-31',
      bannerUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1000',
      itinerary: days,
      chats: []
    }];
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('Tokyo, Japan');

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setView('trip');
    setActiveTab('planner');
  };

  const handleUpdateProject = (projectId: string, updates: Partial<TripProject>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  const handleSaveProject = (projectData: { id?: string; title: string; startDate: string; endDate: string }) => {
    const start = new Date(`${projectData.startDate}T00:00:00`);
    const end = new Date(`${projectData.endDate}T00:00:00`);
    const days: DayPlan[] = [];
    
    let current = new Date(start);
    while (current <= end) {
      days.push({ 
        id: Math.random().toString(36).substr(2, 5), 
        date: current.toISOString().split('T')[0], 
        items: [] 
      });
      current.setDate(current.getDate() + 1);
    }

    if (projectData.id) {
      setProjects(prev => prev.map(p => {
        if (p.id === projectData.id) {
          const updatedItinerary = days.map((day, index) => {
            const existingDay = p.itinerary[index];
            return { ...day, items: existingDay ? existingDay.items : [] };
          });
          return { ...p, title: projectData.title, startDate: projectData.startDate, endDate: projectData.endDate, itinerary: updatedItinerary };
        }
        return p;
      }));
    } else {
      const newProject: TripProject = {
        id: Math.random().toString(36).substr(2, 9),
        title: projectData.title,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        itinerary: days,
        chats: []
      };
      setProjects([newProject, ...projects]);
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleUpdateItem = (dayId: string, itemId: string, updates: Partial<TripItem>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === selectedProjectId) {
        return {
          ...p,
          itinerary: p.itinerary.map(day => {
            if (day.id === dayId) {
              return { ...day, items: day.items.map(item => item.id === itemId ? { ...item, ...updates } : item) };
            }
            return day;
          })
        };
      }
      return p;
    }));
  };

  const handleAddItem = (dayId: string) => {
    const newItem: TripItem = {
      id: Math.random().toString(36).substr(2, 9),
      time: '12:00',
      activity: 'New Activity',
      location: '',
      type: 'sightseeing',
      completed: false,
      notes: ''
    };
    setProjects(prev => prev.map(p => {
      if (p.id === selectedProjectId) {
        return {
          ...p,
          itinerary: p.itinerary.map(day => {
            if (day.id === dayId) {
              return { ...day, items: [...day.items, newItem] };
            }
            return day;
          })
        };
      }
      return p;
    }));
  };

  const handleDeleteItem = (dayId: string, itemId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === selectedProjectId) {
        return {
          ...p,
          itinerary: p.itinerary.map(day => {
            if (day.id === dayId) {
              return { ...day, items: day.items.filter(item => item.id !== itemId) };
            }
            return day;
          })
        };
      }
      return p;
    }));
  };

  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto bg-white shadow-2xl relative overflow-hidden">
      {view === 'dashboard' && (
        <header className="bg-yellow-50 p-6 rounded-b-[2.5rem] chiikawa-shadow border-b-2 border-yellow-100 flex items-center justify-between z-30">
          <div>
            <h1 className="text-xl font-bold text-yellow-800 tracking-tight leading-none">My Travel Plans</h1>
            <p className="text-[10px] text-yellow-600 mt-1 uppercase font-bold tracking-widest">Chiikawa x Travel ✨</p>
          </div>
        </header>
      )}

      <main className={`flex-1 relative ${activeTab === 'ai' ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar'} ${view === 'dashboard' ? 'p-4 mt-2' : ''}`}>
        {view === 'dashboard' ? (
          <Dashboard projects={projects} onSelect={handleSelectProject} onSave={handleSaveProject} onDelete={handleDeleteProject} />
        ) : (
          <div className="h-full">
            {activeTab === 'planner' && selectedProject && (
              <ItineraryView 
                project={selectedProject}
                onUpdateProject={(updates) => handleUpdateProject(selectedProject.id, updates)}
                onUpdateItem={handleUpdateItem}
                onAddItem={handleAddItem}
                onDeleteItem={handleDeleteItem}
                onShowMap={(loc) => { setSelectedLocation(loc); setActiveTab('map'); }}
                onBack={() => setView('dashboard')}
              />
            )}
            
            {activeTab !== 'planner' && (
              <div className={`h-full ${activeTab === 'ai' ? 'px-0' : 'px-4 py-2'}`}>
                {activeTab === 'map' && <MapViewer location={selectedLocation} />}
                {activeTab === 'translator' && <Translator />}
                {activeTab === 'currency' && <CurrencyCalculator />}
                {activeTab === 'ai' && selectedProject && (
                  <AiAssistant project={selectedProject} onUpdateProject={(updates) => handleUpdateProject(selectedProject.id, updates)} />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {view === 'trip' && (
        <nav className="shrink-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-2 py-4 flex justify-between items-center rounded-t-[2rem] shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-50">
          <NavButton active={activeTab === 'planner'} color="yellow" onClick={() => setActiveTab('planner')} icon={<Calendar size={20} />} label="Plan" />
          <NavButton active={activeTab === 'map'} color="green" onClick={() => setActiveTab('map')} icon={<MapPin size={20} />} label="Map" />
          <NavButton active={activeTab === 'translator'} color="sky" onClick={() => setActiveTab('translator')} icon={<Languages size={20} />} label="Trans" />
          <NavButton active={activeTab === 'currency'} color="indigo" onClick={() => setActiveTab('currency')} icon={<CreditCard size={20} />} label="Exch." />
          <NavButton active={activeTab === 'ai'} color="pink" onClick={() => setActiveTab('ai')} icon={<Sparkles size={20} />} label="AI Ask" />
        </nav>
      )}
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: 'yellow' | 'green' | 'sky' | 'indigo' | 'pink';
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label, color }) => {
  const colorMap = {
    yellow: { active: 'text-yellow-600', bg: 'bg-yellow-100' },
    green: { active: 'text-green-600', bg: 'bg-green-100' },
    sky: { active: 'text-sky-600', bg: 'bg-sky-100' },
    indigo: { active: 'text-indigo-600', bg: 'bg-indigo-100' },
    pink: { active: 'text-pink-600', bg: 'bg-pink-100' },
  };

  const selectedColor = colorMap[color];

  return (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center gap-1 transition-all duration-300 ${active ? `${selectedColor.active} scale-110` : 'text-gray-400 hover:text-gray-500'}`}>
      <div className={`p-2 rounded-2xl transition-all ${active ? selectedColor.bg : 'bg-transparent'}`}>{icon}</div>
      <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
};

export default App;
