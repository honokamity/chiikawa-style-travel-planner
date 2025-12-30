
import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Pencil, ChevronRight, MapPin, X } from 'lucide-react';
import { TripProject } from '../types';

interface Props {
  projects: TripProject[];
  onSelect: (id: string) => void;
  onSave: (data: { id?: string; title: string; startDate: string; endDate: string }) => void;
  onDelete: (id: string) => void;
}

const Dashboard: React.FC<Props> = ({ projects, onSelect, onSave, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<TripProject | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const openModal = (project?: TripProject) => {
    if (project) {
      setEditingProject(project);
      setTitle(project.title);
      setStartDate(project.startDate);
      setEndDate(project.endDate);
    } else {
      setEditingProject(null);
      setTitle('');
      setStartDate('');
      setEndDate('');
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!title || !startDate || !endDate) return;
    onSave({
      id: editingProject?.id,
      title,
      startDate,
      endDate
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn relative">
      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => (
          <div 
            key={project.id}
            className="group relative bg-white p-6 rounded-[2rem] border-2 border-yellow-50 hover:border-yellow-200 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer overflow-hidden"
            onClick={() => onSelect(project.id)}
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10 flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-pink-100 rounded-xl text-pink-500">
                    <MapPin size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{project.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={12} />
                  <span className="text-xs font-medium">{project.startDate} - {project.endDate}</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                   <span className="text-[10px] font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full uppercase tracking-widest">
                     {project.itinerary.length} Days
                   </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 items-center">
                <div className="flex gap-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(project);
                    }}
                    className="p-2 text-gray-300 hover:text-blue-400 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(project.id);
                    }}
                    className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="p-2 text-yellow-400 group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={24} />
                </div>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={() => openModal()}
          className="w-full py-10 border-4 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-gray-300 hover:text-yellow-400 hover:border-yellow-100 hover:bg-yellow-50/30 transition-all group"
        >
          <div className="p-4 bg-gray-50 rounded-full group-hover:scale-110 transition-transform group-hover:bg-yellow-100">
            <Plus size={32} />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">Create New Itinerary</span>
        </button>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-yellow-900/20 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-yellow-100 p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-yellow-800">
                {editingProject ? 'Edit Itinerary ✨' : 'New Adventure! ✈️'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-gray-500">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest block mb-1">Destination (City/Country)</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Tokyo, Japan"
                  className="w-full p-4 bg-yellow-50 rounded-2xl border-none focus:ring-2 focus:ring-yellow-200 font-medium text-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest block mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-4 bg-yellow-50 rounded-2xl border-none focus:ring-2 focus:ring-yellow-200 text-xs font-bold text-gray-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest block mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-4 bg-yellow-50 rounded-2xl border-none focus:ring-2 focus:ring-yellow-200 text-xs font-bold text-gray-600"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-white rounded-[2rem] font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              {editingProject ? 'Save Changes' : 'Create Itinerary'}
            </button>
          </div>
        </div>
      )}

      <div className="p-8 bg-blue-50 rounded-[2.5rem] border-2 border-blue-100 flex flex-col items-center text-center">
         <div className="w-20 h-20 bg-white rounded-full mb-4 border-4 border-blue-100 overflow-hidden shadow-sm">
            <img src="https://picsum.photos/seed/hachiware_dash/100" alt="Hachiware" className="w-full h-full object-cover" />
         </div>
         <h4 className="text-blue-800 font-bold text-lg mb-1">Planning is easy!</h4>
         <p className="text-xs text-blue-500 font-medium">Add locations, set times, and keep track of your bookings all in one place. ✨</p>
      </div>
    </div>
  );
};

export default Dashboard;
