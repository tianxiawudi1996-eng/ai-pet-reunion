
import React from 'react';
import { AppStep, GenerationResult } from '../types';
import { FileText, Music, Play, Heart } from 'lucide-react';

interface PreviewPanelProps {
  step: AppStep;
  text: string;
  results: GenerationResult | null;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ step, text, results }) => {
  if (step === AppStep.INPUT || step === AppStep.CONFIRMATION || step === AppStep.GENERATING) {
    return (
      <div className="h-full flex flex-col animate-fadeIn">
        <div className="bg-white flex-1 rounded-[2rem] shadow-xl border border-stone-100 overflow-hidden flex flex-col">
          <div className="bg-stone-50 border-b border-stone-100 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-400">
              <FileText size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">입력 데이터 미리보기</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-orange-300"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-300"></div>
            </div>
          </div>
          
          <div className="flex-1 p-8 bg-white overflow-y-auto">
            {text ? (
              <div className="prose prose-sm prose-stone max-w-none text-stone-600 font-sans whitespace-pre-wrap leading-relaxed">
                {text}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-300">
                <FileText size={48} className="mb-4 opacity-30" />
                <p className="text-sm font-medium">왼쪽에 내용을 입력하면<br/>여기에 미리보기가 나타나요 📝</p>
              </div>
            )}
          </div>

          <div className="bg-stone-50 border-t border-stone-100 px-5 py-2 flex justify-between items-center text-[10px] text-stone-400 font-mono">
            <span>{text.length} 자</span>
            <span>PET-REUNION-DOC</span>
          </div>
        </div>
      </div>
    );
  }

  if (step === AppStep.RESULTS && results) {
    const thumbnailImage = results.imagePrompts.find(p => p.generatedImage)?.generatedImage;

    return (
      <div className="h-full flex flex-col gap-6 animate-fadeIn">
        
        <div className="bg-white rounded-[2rem] shadow-xl border border-stone-100 overflow-hidden flex flex-col">
          {/* Video Player Mockup */}
          <div className="aspect-video bg-stone-900 relative flex items-center justify-center group cursor-pointer overflow-hidden">
            {thumbnailImage ? (
               <img 
                 src={`data:image/png;base64,${thumbnailImage}`} 
                 alt="Thumbnail" 
                 className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
               />
            ) : (
               <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-pink-100 opacity-20"></div>
            )}
            
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl z-10 transform group-hover:scale-110 transition-transform">
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
               <div className="h-full w-1/3 bg-red-500"></div>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded font-medium">
              3:42
            </div>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="font-display font-bold text-stone-800 text-lg leading-snug line-clamp-2 mb-2">
              {results.youtubePackage.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-stone-400 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">AI</div>
              <span className="font-medium text-stone-600">멍냥이 구조대</span>
              <span className="text-stone-300">•</span>
              <span>조회수 0회</span>
              <span className="text-stone-300">•</span>
              <span>방금 전</span>
            </div>
            <div className="text-sm text-stone-600 mb-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <p className="whitespace-pre-wrap leading-relaxed">{results.youtubePackage.descriptionKR}</p>
              <div className="mt-4 pt-4 border-t border-stone-200">
                 <p className="text-stone-400 text-xs uppercase font-bold mb-1">Tags</p>
                 <div className="flex flex-wrap gap-1">
                  {results.youtubePackage.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-400 to-orange-400 rounded-2xl shadow-lg shadow-orange-100 p-5 text-white flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
               <Music size={20} />
             </div>
             <div>
               <div className="text-xs font-bold text-white/80 uppercase">Genre</div>
               <div className="font-display font-bold text-lg">{results.musicDirection.genre}</div>
             </div>
           </div>
           <div className="text-right">
             <div className="text-xs font-bold text-white/80 uppercase">Vocal</div>
             <div className="font-display font-bold text-lg">{results.musicDirection.vocalStyle}</div>
           </div>
        </div>

      </div>
    );
  }

  return null;
};

export default PreviewPanel;
