
import React, { useState } from 'react';
import { GenerationResult } from '../types';
import { 
  Music, Video, Image as ImageIcon, FileText, Check, Download, 
  Maximize2, Sparkles, Copy, ClipboardCheck, Dog, Calendar, MapPin, Heart
} from 'lucide-react';

interface ResultsStepProps {
  data: GenerationResult;
  onReset: () => void;
}

const ResultsStep: React.FC<ResultsStepProps> = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState<'facts' | 'music' | 'youtube' | 'images'>('music');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 1500);
  };

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case 'MISSING': return '실종/구조';
      case 'RAINBOW': return '무지개 다리';
      case 'TOGETHER': return '행복한 일상';
      case 'GROWTH': return '성장 일기';
      case 'ADOPTION': return '입양 홍보';
      default: return '반려동물 이야기';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'MISSING': return 'bg-red-50 text-red-500 border-red-100';
      case 'RAINBOW': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'TOGETHER': return 'bg-pink-50 text-pink-500 border-pink-100';
      case 'GROWTH': return 'bg-green-50 text-green-500 border-green-100';
      case 'ADOPTION': return 'bg-orange-50 text-orange-500 border-orange-100';
      default: return 'bg-stone-50 text-stone-500 border-stone-100';
    }
  };

  const TabButton = ({ id, icon: Icon, label }: { id: typeof activeTab; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border-b-4 transition-all ${
        activeTab === id ? 'border-orange-400 text-orange-500 bg-orange-50' : 'border-transparent text-stone-400 hover:text-stone-600'
      }`}
    >
      <Icon size={18} />
      <span className="hidden sm:inline font-display">{label}</span>
    </button>
  );

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-orange-100 overflow-hidden flex flex-col h-full animate-fadeIn relative">
      <div className="bg-white p-5 flex justify-between items-start border-b border-stone-100">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(data.category)}`}>
               {getCategoryLabel(data.category)}
             </span>
           </div>
          <h2 className="text-xl font-display text-stone-800 flex items-center gap-2">
            {data.factSummary.name}의 이야기
          </h2>
          <p className="text-xs text-stone-400 mt-1 font-bold">총 {data.imagePrompts.length}개의 장면 생성됨</p>
        </div>
        <button onClick={onReset} className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold text-stone-500 transition-all">🔄 새 프로젝트</button>
      </div>

      <div className="flex border-b border-stone-100 bg-white">
        <TabButton id="facts" icon={FileText} label="요약" />
        <TabButton id="music" icon={Music} label="노래" />
        <TabButton id="youtube" icon={Video} label="유튜브" />
        <TabButton id="images" icon={ImageIcon} label="이미지" />
      </div>

      <div className="p-4 lg:p-5 overflow-y-auto bg-stone-50/50 scrollbar-hide">
        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="animate-fadeIn space-y-6">
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex items-center gap-4">
               <Sparkles className="text-purple-400 animate-pulse" size={24} />
               <div>
                  <h4 className="text-sm font-black text-purple-600 uppercase">AI 스토리보드</h4>
                  <p className="text-[11px] text-purple-400">스토리에 맞는 감성적인 장면들입니다.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.imagePrompts.map((prompt, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col hover:border-purple-300 transition-all group shadow-sm hover:shadow-md">
                  <div className="relative overflow-hidden cursor-pointer" onClick={() => setSelectedImage(idx)}>
                    {prompt.generatedImage ? (
                      <img 
                        src={`data:image/png;base64,${prompt.generatedImage}`} 
                        className="w-full aspect-video sm:aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={prompt.section}
                      />
                    ) : (
                      <div className="aspect-video bg-stone-100 flex items-center justify-center text-stone-400 font-bold uppercase text-[10px]">이미지 없음</div>
                    )}
                    <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-purple-600 shadow-sm">SCENE {idx + 1}</div>
                    {prompt.generatedImage && (
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <Maximize2 size={24} className="text-white drop-shadow-lg scale-90 group-hover:scale-100 transition-transform"/>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="text-xs font-black text-stone-600 uppercase tracking-tight">{prompt.section}</h3>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-[11px] text-stone-500 leading-relaxed italic line-clamp-2">
                       {prompt.imagePromptEN}
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => copyToClipboard(prompt.imagePromptEN, `p-${idx}`)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold transition-all ${copiedSection === `p-${idx}` ? 'bg-green-500 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
                          {copiedSection === `p-${idx}` ? <Check size={12}/> : <Copy size={12}/>}
                          {copiedSection === `p-${idx}` ? '완료!' : '프롬프트 복사'}
                       </button>
                       {prompt.generatedImage && (
                         <a href={`data:image/png;base64,${prompt.generatedImage}`} download={`scene_${idx+1}.png`} className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all shadow-md shadow-purple-200">
                            <Download size={14} />
                         </a>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Facts Tab */}
        {activeTab === 'facts' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="text-xs font-black text-orange-400 border-b border-stone-100 pb-3 mb-5 uppercase tracking-widest">스토리 핵심 정보</h3>
              <div className="space-y-4">
                <FactItem label="이름" value={data.factSummary.name} icon={Dog} />
                <FactItem label="날짜 정보" value={data.factSummary.subInfo} icon={Calendar} />
                <FactItem label="주요 장소" value={data.factSummary.location} icon={MapPin} />
                <FactItem label="특징" value={data.factSummary.breedAndFeatures} icon={Heart} />
                <FactItem label="상황/내용" value={data.factSummary.situation} icon={FileText} />
                <div className="pt-4 border-t border-stone-100">
                  <span className="block text-[10px] font-black text-stone-400 uppercase mb-2">주인의 마음</span>
                  <p className="text-sm text-stone-600 leading-relaxed italic break-keep bg-orange-50 p-4 rounded-xl border border-orange-100">"{data.factSummary.ownerMessage}"</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Music Tab */}
        {activeTab === 'music' && (
           <div className="space-y-8 animate-fadeIn">
              <SongCard 
                trackId="t1" 
                trackLabel="트랙 1 (K-Pop 감성)" 
                title={data.track1.titleKO} 
                subtitle={data.track1.titleEN} 
                prompt={data.track1.stylePrompt} 
                lyrics={data.track1.lyrics} 
                copiedSection={copiedSection} 
                onCopy={copyToClipboard} 
                color="pink"
              />
              <SongCard 
                trackId="t2" 
                trackLabel="트랙 2 (글로벌 팝)" 
                title={data.track2.titleEN} 
                subtitle={data.track2.titleKO} 
                prompt={data.track2.stylePrompt} 
                lyrics={data.track2.lyrics} 
                copiedSection={copiedSection} 
                onCopy={copyToClipboard} 
                color="orange"
              />
           </div>
        )}

        {/* Youtube Tab */}
        {activeTab === 'youtube' && (
          <div className="animate-fadeIn space-y-6">
             <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xs font-black text-red-500 uppercase tracking-widest">유튜브 업로드용</h3>
                   <button onClick={() => copyToClipboard(JSON.stringify(data.youtubePackage, null, 2), 'yt-json')} className={`text-[10px] font-bold px-3 py-1 rounded-lg border transition-all ${copiedSection === 'yt-json' ? 'bg-green-500 border-green-500 text-white' : 'bg-stone-100 border-stone-200 text-stone-500'}`}>
                      {copiedSection === 'yt-json' ? '복사 완료!' : 'JSON 복사'}
                   </button>
                </div>
                <div className="space-y-6">
                   <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-stone-400 uppercase">제목</span>
                        <button onClick={() => copyToClipboard(data.youtubePackage.title, 'yt-title')} className="text-[10px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                          {copiedSection === 'yt-title' ? <Check size={12}/> : <Copy size={12}/>} 복사
                        </button>
                      </div>
                      <p className="text-sm font-bold text-stone-800 border-b border-stone-100 pb-2">{data.youtubePackage.title}</p>
                   </div>
                   <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase">설명란 (본문)</span>
                        <button onClick={() => copyToClipboard(data.youtubePackage.descriptionKR, 'yt-desc')} className="text-[10px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                          {copiedSection === 'yt-desc' ? <Check size={12}/> : <Copy size={12}/>} 본문 복사
                        </button>
                      </div>
                      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-stone-600 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">{data.youtubePackage.descriptionKR}</div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Fullscreen Image */}
      {selectedImage !== null && (
         <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedImage(null)}>
            <div className="max-w-4xl w-full flex flex-col gap-4" onClick={e => e.stopPropagation()}>
               <div className="relative">
                  <img src={`data:image/png;base64,${data.imagePrompts[selectedImage].generatedImage}`} className="w-full h-auto rounded-3xl shadow-2xl" />
                  <button onClick={() => setSelectedImage(null)} className="absolute -top-4 -right-4 bg-white text-stone-800 p-2 rounded-full shadow-lg hover:scale-110 transition-transform font-bold">✕</button>
               </div>
               <div className="bg-white p-6 rounded-3xl shadow-xl">
                  <h3 className="text-xl font-display text-stone-800 mb-2">{data.imagePrompts[selectedImage].section}</h3>
                  <p className="text-stone-500 text-sm italic">"{data.imagePrompts[selectedImage].imagePromptEN}"</p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

const FactItem = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
  <div className="flex flex-col gap-1 border-b border-stone-100 pb-2">
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-stone-400"/>
      <span className="text-[10px] font-black text-stone-400 uppercase">{label}</span>
    </div>
    <p className="text-sm font-medium text-stone-800">{value || '-'}</p>
  </div>
);

const SongCard = ({ trackId, trackLabel, title, subtitle, prompt, lyrics, copiedSection, onCopy, color }: any) => {
  const isPink = color === 'pink';
  const headerColor = isPink ? 'bg-pink-50 border-pink-100' : 'bg-orange-50 border-orange-100';
  const iconColor = isPink ? 'text-pink-400' : 'text-orange-400';
  const buttonColor = isPink ? 'bg-pink-500 hover:bg-pink-600' : 'bg-orange-400 hover:bg-orange-500';

  return (
    <div className="bg-white rounded-[2rem] border border-stone-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-6 border-b ${headerColor} flex justify-between items-center`}>
         <div className="flex-1">
           <span className={`text-[10px] font-black uppercase tracking-widest ${iconColor}`}>{trackLabel}</span>
           <div className="flex items-center gap-3">
              <h3 className="text-lg font-display text-stone-800">{title}</h3>
              <button 
                onClick={() => onCopy(title, `${trackId}-title`)} 
                className={`p-1.5 rounded-lg border transition-all ${copiedSection === `${trackId}-title` ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-stone-200 text-stone-400 hover:text-stone-600'}`}
              >
                {copiedSection === `${trackId}-title` ? <Check size={14}/> : <Copy size={14}/>}
              </button>
           </div>
         </div>
         <div className="hidden sm:block">
            <div className="w-12 h-12 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-stone-300">
               <Music size={24} className={iconColor} />
            </div>
         </div>
      </div>

      <div className="p-6 space-y-6">
         <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={12} /> Suno 스타일 프롬프트
              </span>
              <button 
                onClick={() => onCopy(prompt, `${trackId}-style`)} 
                className={`text-[10px] font-bold px-2 py-1 rounded-md border transition-all ${copiedSection === `${trackId}-style` ? 'bg-blue-500 border-blue-500 text-white' : 'bg-stone-100 border-stone-200 text-stone-500'}`}
              >
                {copiedSection === `${trackId}-style` ? '복사됨!' : '스타일 복사'}
              </button>
            </div>
            <p className="text-xs text-stone-600 font-medium bg-stone-50 p-3 rounded-xl border border-stone-100 leading-relaxed">
              {prompt}
            </p>
         </div>

         <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">가사 (숫자 한글화 완료)</span>
              <button 
                onClick={() => onCopy(lyrics, `${trackId}-lyrics`)} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-[10px] transition-all text-white ${copiedSection === `${trackId}-lyrics` ? 'bg-green-500' : buttonColor}`}
              >
                {copiedSection === `${trackId}-lyrics` ? <ClipboardCheck size={14}/> : <Copy size={14}/>}
                {copiedSection === `${trackId}-lyrics` ? '복사 완료' : '전체 가사 복사'}
              </button>
            </div>
            <div className="relative group">
              <pre className="text-xs text-stone-600 font-sans leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto p-5 bg-stone-50 rounded-2xl border border-stone-200 scrollbar-hide">
                {lyrics}
              </pre>
            </div>
         </div>
      </div>
    </div>
  );
}

export default ResultsStep;
