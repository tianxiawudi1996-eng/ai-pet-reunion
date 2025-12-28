
import React from 'react';
import { X, Clock, Trash2, ChevronRight, LayoutTemplate } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, history, onSelect, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/20 backdrop-blur-sm flex justify-end transition-opacity" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white border-l border-stone-200 h-full flex flex-col shadow-2xl animate-slideInRight" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-white shadow-sm shrink-0">
           <h2 className="font-display text-stone-800 text-lg flex items-center gap-2">
             <Clock size={20} className="text-orange-400"/> 히스토리
           </h2>
           <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X size={20} className="text-stone-400"/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50 scrollbar-hide">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 text-sm gap-3">
              <LayoutTemplate size={40} className="opacity-20"/>
              <p className="font-bold">아직 만든 캠페인이 없어요 🐶</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => onSelect(item)}
                className="bg-white border border-stone-200 hover:border-orange-300 rounded-2xl p-4 cursor-pointer transition-all group relative overflow-hidden shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                     <span className="bg-orange-50 text-orange-500 text-[10px] font-black px-2 py-0.5 rounded-lg border border-orange-100 uppercase tracking-tight">
                       {item.data.storyType || 'PET CASE'}
                     </span>
                  </div>
                  <button 
                    onClick={(e) => onDelete(item.id, e)} 
                    className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors z-10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <h3 className="font-display text-stone-800 text-base mb-1 truncate pr-6">{item.data.factSummary.name}</h3>
                <p className="text-xs text-stone-500 font-medium mb-4 truncate">{item.data.youtubePackage.title}</p>
                
                <div className="flex justify-between items-end border-t border-stone-100 pt-3">
                   <span className="text-[10px] text-stone-400 font-mono">
                     {new Date(item.timestamp).toLocaleDateString()}
                   </span>
                   <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                     열기 <ChevronRight size={12} />
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorySidebar;
