
import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, FileText, Youtube, Music, Camera, Upload, X, Sparkles, Loader2, Dog, Zap, Heart, Cloud, AlertTriangle, Sprout, Megaphone, Film, Image as ImageIcon } from 'lucide-react';
import { analyzeYoutubeContent } from '../services/geminiService';
import { PetCategory, UploadedMedia } from '../types';

interface InputStepProps {
  value: string;
  onChange: (text: string) => void;
  onNext: (options: any) => void;
  apiKey?: string;
}

// 1. REORDERED CATEGORIES (Together -> Growth -> Adoption -> Missing -> Rainbow)
const CATEGORIES: { id: PetCategory; label: string; icon: any; color: string; bg: string; border: string; desc: string }[] = [
  { id: 'TOGETHER', label: '행복한 일상', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-100', desc: '귀여운 하루' },
  { id: 'GROWTH', label: '성장 일기', icon: Sprout, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100', desc: '시간의 흐름' },
  { id: 'ADOPTION', label: '입양 홍보', icon: Megaphone, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', desc: '가족 찾기' },
  { id: 'MISSING', label: '실종 구조', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', desc: '긴급한 구조' },
  { id: 'RAINBOW', label: '무지개 다리', icon: Cloud, color: 'text-blue-400', bg: 'bg-blue-50', border: 'border-blue-100', desc: '추억과 추모' },
];

// 2. PER-CATEGORY MUSIC GENRES (10 Items each)
const CATEGORY_GENRES: Record<PetCategory, string[]> = {
  TOGETHER: [
    'Acoustic Pop (밝고 경쾌한)', 'Cute Whistle (귀여운 휘파람)', 'Upbeat Piano (신나는 피아노)', 
    'Sunny Guitar (따뜻한 기타)', 'Playful Jazz (장난스러운 재즈)', 'Bossa Nova (여유로운)', 
    'Happy Synth-pop (통통 튀는)', 'Funky Rhythm (개구쟁이 느낌)', 'Morning Coffee (편안한)', 'Disney Musical (뮤지컬 스타일)'
  ],
  GROWTH: [
    'Sentimental Folk (감성적인 포크)', 'Warm Acoustic (따뜻한 어쿠스틱)', 'Soft Piano & Strings (피아노와 현악기)', 
    'Nostalgic Indie (추억 돋는 인디)', 'Gentle Lullaby (부드러운 자장가)', 'Coming of Age Pop (성장 드라마)', 
    'Emotional Ballad (감동적인)', 'Timeless Melody (시간이 흘러도)', 'Family Movie OST (가족 영화 느낌)', 'Slow Tempo Rock (잔잔한 락)'
  ],
  ADOPTION: [
    'Hopeful Pop (희망찬 팝)', 'Bright Acoustic (밝은 어쿠스틱)', 'Uplifting Cinematic (벅차오르는)', 
    'Energetic Rock (에너지 넘치는)', 'Friendly Ukulele (다정한 우쿨렐레)', 'Optimistic March (행진곡 풍)', 
    'Heartwarming Ballad (마음을 울리는)', 'Clean Electronic (깔끔한)', 'Inspiring Piano (영감을 주는)', 'Happy Whistle (행복한 휘파람)'
  ],
  MISSING: [
    'Urgent Cinematic (다급한 시네마틱)', 'Dramatic Strings (드라마틱한 현악기)', 'Emotional Piano (애절한 피아노)', 
    'Tense Ambient (긴장감 있는)', 'Desperate Ballad (간절한 발라드)', 'Fast Tempo Orchestral (빠른 템포)', 
    'Heartbeat Rhythm (심장 박동)', 'Melancholic Cello (슬픈 첼로)', 'Searching Pulse (추적하는 느낌)', 'Impactful Rock (강렬한)'
  ],
  RAINBOW: [
    'Healing Piano (치유의 피아노)', 'Ethereal Ambient (몽환적인)', 'Heavenly Strings (천국 같은)', 
    'Soft Choral (성스러운 코러스)', 'Peaceful Nature (평화로운 자연음)', 'Sad Waltz (슬픈 왈츠)', 
    'Angelic Harp (천사의 하프)', 'Slow Emotional Ballad (느린 발라드)', 'Spiritual New Age (영적인)', 'Quiet Reflection (고요한 회상)'
  ]
};

const MUSIC_MOODS = [
  'Touching & Sad', 'Bright & Playful', 'Urgent & Desperate', 'Warm & Cozy',
  'Nostalgic', 'Hopeful', 'Pure & Innocent', 'Lonely', 'Miraculous'
];

const MUSIC_INSTRUMENTS = [
  'Acoustic Guitar', 'Piano', 'Strings (Violin/Cello)', 'Soft Synth',
  'Ukulele', 'Whistling', 'Light Percussion', 'Orchestra', 'Toy Instruments'
];

const VISUAL_LIGHTING = [
  'Natural Sunlight', 'Warm Golden Hour', 'Soft Indoor Window', 'Cinematic Moody',
  'Bright Studio', 'Dreamy/Ethereal', 'Evening Street Light', 'Shadowy/Noir'
];

const VISUAL_ANGLES = [
  'Eye Level (Pet View)', 'Low Angle (Ground)', 'High Angle (Human View)', 'Close-up (Face)',
  'Macro (Nose/Paw)', 'Wide Shot (Landscape)', 'Over-the-shoulder'
];

const VISUAL_BACKGROUNDS = [
  'Grassy Park', 'Cozy Living Room', 'Empty Street', 'Front Porch',
  'Forest/Nature', 'Rainy Window', 'Sunset Horizon', 'Abstract Blurred', 'Backyard', 'Studio Backdrop'
];

const VISUAL_STYLES = [
  'Realistic Photo 8K', 'Disney/Pixar 3D', 'Studio Ghibli Anime', 'Watercolor Painting',
  'Soft Pastel', 'Cinematic Film', 'Documentary', 'Oil Painting', 'Sketch'
];

const InputStep: React.FC<InputStepProps> = ({ value, onChange, onNext, apiKey }) => {
  const [category, setCategory] = useState<PetCategory>('TOGETHER');
  const [mode, setMode] = useState<'text' | 'youtube'>('text');
  const [youtubeInput, setYoutubeInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Music State
  const [musicMode, setMusicMode] = useState<'auto' | 'manual'>('auto');
  const [manualMusicStyle, setManualMusicStyle] = useState('');
  const [musicGenre, setMusicGenre] = useState(''); // Initialized in useEffect
  const [musicMood, setMusicMood] = useState(MUSIC_MOODS[0]);
  const [musicInstruments, setMusicInstruments] = useState(MUSIC_INSTRUMENTS[0]);
  const [musicTempo, setMusicTempo] = useState('Medium');

  // Visual State
  const [autoGenerateImages, setAutoGenerateImages] = useState(false);
  const [visualMode, setVisualMode] = useState<'auto' | 'manual'>('auto');
  const [manualVisualStyle, setManualVisualStyle] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:3" | "16:9" | "9:16">("16:9");
  const [lighting, setLighting] = useState(VISUAL_LIGHTING[0]);
  const [angle, setAngle] = useState(VISUAL_ANGLES[0]);
  const [background, setBackground] = useState(VISUAL_BACKGROUNDS[0]);
  const [style, setStyle] = useState(VISUAL_STYLES[0]);
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedMedia[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-recommendation & Default Genre logic
  useEffect(() => {
    // Set default genre to the first item of the selected category's list
    setMusicGenre(CATEGORY_GENRES[category][0]);

    switch (category) {
      case 'MISSING':
        setMusicMood('Urgent & Desperate');
        setMusicInstruments('Strings (Violin/Cello)');
        setMusicTempo('Fast & Urgent');
        setLighting('Evening Street Light');
        setStyle('Realistic Photo 8K');
        break;
      case 'RAINBOW':
        setMusicMood('Nostalgic');
        setMusicInstruments('Piano');
        setMusicTempo('Slow & Emotional');
        setLighting('Dreamy/Ethereal');
        setStyle('Watercolor Painting');
        break;
      case 'TOGETHER':
        setMusicMood('Bright & Playful');
        setMusicInstruments('Ukulele');
        setMusicTempo('Medium');
        setLighting('Natural Sunlight');
        setStyle('Disney/Pixar 3D');
        break;
      case 'GROWTH':
        setMusicMood('Warm & Cozy');
        setMusicInstruments('Acoustic Guitar');
        setMusicTempo('Medium');
        setLighting('Warm Golden Hour');
        setStyle('Soft Pastel');
        break;
      case 'ADOPTION':
        setMusicMood('Hopeful');
        setMusicInstruments('Whistling');
        setMusicTempo('Medium');
        setLighting('Bright Studio');
        setStyle('Realistic Photo 8K');
        break;
    }
  }, [category]);

  // Set default placeholder based on category
  const getPlaceholder = () => {
    if (category === 'MISSING') {
      return `[실종 정보 예시]
이름: 초코
견종: 골든 리트리버
실종 장소: 서울숲 공원
특징: 빨간 스카프, 왼쪽 귀 흉터.
상황: 산책 중 줄을 놓침.`;
    } else if (category === 'RAINBOW') {
      return `[추모 정보 예시]
이름: 나비
별이 된 날: 2024년 1월 10일
특징: 내 배 위에서 잠듬.
메시지: 15년 동안 행복했어.`;
    } else if (category === 'GROWTH') {
      return `[성장 일기 예시]
이름: 두부
내용: 주먹만하던 꼬물이 시절부터 늠름한 성견이 되기까지.
특징: 어릴 땐 귀가 접혀 있었는데 크면서 쫑긋해짐.`;
    } else if (category === 'ADOPTION') {
      return `[입양 홍보 예시]
이름: 사랑이 (3살 추정)
성격: 사람을 너무 좋아하고 배변 100% 가림.
구조 사연: 보호소에서 안락사 직전 구조.
메시지: 평생 가족을 기다려요.`;
    } else {
      return `[일상 이야기 예시]
이름: 뭉치
특징: 산책만 나가면 엉덩이 씰룩거림.
메시지: 너 때문에 매일이 시트콤이야.`;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    
    files.forEach(file => {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video/');
      
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setUploadedFiles(prev => [
          ...prev, 
          { type: isVideo ? 'video' : 'image', data: base64, name: file.name }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleYoutubeAnalysis = async () => {
    if (!youtubeInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeYoutubeContent(youtubeInput, apiKey);
      onChange(result);
      setMode('text');
      alert("분석 완료! 멍멍!");
    } catch (err: any) {
      console.error(err);
      alert(`분석 실패: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (value.trim()) {
      // Extract images for AI reference if needed
      const refImages = uploadedFiles
        .filter(f => f.type === 'image')
        .slice(0, 3)
        .map(f => f.data);

      onNext({
        category,
        manualMusicStyle: musicMode === 'manual' ? manualMusicStyle : undefined,
        musicSettings: { 
          genre: musicGenre, 
          mood: musicMood, 
          instruments: musicInstruments, 
          tempo: musicTempo 
        },
        autoGenerateImages,
        manualVisualStyle: visualMode === 'manual' ? manualVisualStyle : undefined,
        aspectRatio,
        visualSettings: { lighting, angle, background, style },
        referenceImages: refImages, // For AI generation
        uploadedMedia: uploadedFiles // For UI display later
      });
    }
  };

  return (
    <div className="animate-fadeIn pb-10 space-y-8">
      <header>
        <h2 className="text-3xl font-display text-stone-800 mb-2 flex items-center gap-2">
           <Dog className="text-orange-400" size={32}/> 반려동물 정보 입력
        </h2>
        <p className="text-stone-500 text-sm font-medium">어떤 이야기를 노래로 만들고 싶으신가요?</p>
      </header>

      {/* Category Selector */}
      <div>
        <label className="block text-xs font-bold text-stone-500 mb-2 uppercase tracking-wider">프로젝트 유형 선택</label>
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex-none w-32 p-4 rounded-2xl border-2 text-center transition-all relative overflow-hidden group snap-center flex flex-col items-center justify-center gap-2 ${
                category === cat.id 
                  ? `bg-white ${cat.border} shadow-lg scale-105 ring-2 ring-offset-1 ring-orange-100` 
                  : 'bg-white border-stone-100 hover:border-orange-200 opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`p-3 rounded-full ${cat.bg} ${cat.color} mb-1 transition-transform group-hover:scale-110`}>
                <cat.icon size={20} className="fill-current" />
              </div>
              <div>
                <h3 className={`font-display text-sm ${category === cat.id ? 'text-stone-800' : 'text-stone-500'}`}>{cat.label}</h3>
                <p className="text-[10px] text-stone-400 font-medium leading-tight mt-1">{cat.desc}</p>
              </div>
              {category === cat.id && <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${cat.color.replace('text', 'bg')} animate-pulse`}></div>}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-orange-100 shadow-sm mt-6">
        <button onClick={() => setMode('text')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider ${mode === 'text' ? 'bg-orange-400 text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}>
          <FileText size={16} /> 직접 입력
        </button>
        <button onClick={() => setMode('youtube')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider ${mode === 'youtube' ? 'bg-purple-100 text-purple-500' : 'text-stone-400 hover:text-stone-600'}`}>
          <Sparkles size={16} /> AI 자동 분석
        </button>
      </div>

      {/* Input Area */}
      {mode === 'youtube' ? (
        <div className="animate-fadeIn space-y-6">
          <div className="bg-purple-50 border border-purple-100 rounded-[2rem] p-6">
            <h3 className="text-purple-500 font-bold mb-4 flex items-center gap-2 text-sm">
              <Youtube size={18} /> SNS/유튜브 사연 분석
            </h3>
            <textarea
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(e.target.value)}
              placeholder="블로그, 인스타그램, 유튜브 등의 사연을 복사해서 붙여넣으세요."
              className="w-full h-40 bg-white border border-purple-200 rounded-2xl p-4 text-stone-700 placeholder-stone-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none text-sm mb-4 outline-none"
            />
            <button
              onClick={handleYoutubeAnalysis}
              disabled={isAnalyzing || !youtubeInput.trim()}
              className="w-full py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-stone-300 disabled:text-stone-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-200"
            >
              {isAnalyzing ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
              {isAnalyzing ? '사연 분석하기' : '내용 요약하기'}
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-fadeIn space-y-6">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full h-64 bg-white border border-orange-100 rounded-[2rem] p-6 text-stone-700 placeholder-stone-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all resize-none text-base leading-relaxed shadow-sm font-sans"
          />
        </div>
      )}

      {/* Visual Studio - Updated for Direct Upload First */}
      <div className="bg-white rounded-[2rem] p-6 border border-orange-100 shadow-sm space-y-6">
          <h3 className="text-stone-800 font-display text-lg flex items-center gap-2">
            <Camera size={20} className="text-purple-400"/> 비주얼 스튜디오
          </h3>
          
          {/* Section 1: Upload (Primary) */}
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload size={14}/> 내 사진/영상 업로드 (필수)
                </span>
                <span className="text-[10px] text-stone-400">영상 제작에 사용됩니다</span>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 min-h-[90px]">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-sm group bg-white">
                    {file.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-stone-800 text-white">
                        <Film size={20} />
                      </div>
                    ) : (
                      <img src={`data:image/png;base64,${file.data}`} className="w-full h-full object-cover" />
                    )}
                    <button onClick={() => removeFile(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={10} />
                    </button>
                  </div>
                ))}
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 flex flex-col items-center justify-center cursor-pointer transition-all bg-white text-purple-400 shrink-0"
                >
                    <div className="bg-purple-100 p-1.5 rounded-full mb-1"><Upload size={14}/></div>
                    <span className="text-[9px] font-bold">자료 추가</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*,video/*" 
                  multiple 
                />
            </div>
          </div>

          {/* Section 2: AI Generation (Optional) */}
          <div className="pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 cursor-pointer group w-fit mb-4">
               <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${autoGenerateImages ? 'bg-purple-500 border-purple-500' : 'bg-white border-stone-300'}`}>
                  {autoGenerateImages && <Sparkles size={12} className="text-white"/>}
               </div>
               <input 
                 type="checkbox" 
                 checked={autoGenerateImages}
                 onChange={(e) => setAutoGenerateImages(e.target.checked)}
                 className="hidden" 
               />
               <span className={`text-sm font-bold transition-colors ${autoGenerateImages ? 'text-purple-600' : 'text-stone-400'}`}>
                 AI 이미지 추가 생성 (선택 사항)
               </span>
            </label>

            {autoGenerateImages && (
              <div className="space-y-6 animate-fadeIn bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                {/* Visual Toggle: Auto vs Manual */}
                <div className="flex bg-white p-1 rounded-xl border border-stone-200">
                    <button 
                      onClick={() => setVisualMode('auto')} 
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${visualMode === 'auto' ? 'bg-purple-100 text-purple-600' : 'text-stone-400'}`}
                    >
                      자동 추천
                    </button>
                    <button 
                      onClick={() => setVisualMode('manual')} 
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${visualMode === 'manual' ? 'bg-purple-100 text-purple-600' : 'text-stone-400'}`}
                    >
                      직접 입력
                    </button>
                </div>

                {visualMode === 'auto' ? (
                    <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 block uppercase">화면 비율</label>
                          <div className="grid grid-cols-2 gap-2">
                              {(["1:1", "16:9", "9:16", "4:3"] as const).map(ratio => (
                                <button 
                                  key={ratio}
                                  onClick={() => setAspectRatio(ratio)}
                                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${aspectRatio === ratio ? 'bg-purple-500 border-purple-500 text-white shadow-md' : 'bg-white border-stone-200 text-stone-500 hover:border-purple-300'}`}
                                >
                                  {ratio}
                                </button>
                              ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 block uppercase">그림체 스타일</label>
                          <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 outline-none focus:border-purple-400">
                              {VISUAL_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 block uppercase">조명</label>
                          <select value={lighting} onChange={(e) => setLighting(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 outline-none focus:border-purple-400">
                              {VISUAL_LIGHTING.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 block uppercase">카메라 앵글</label>
                          <select value={angle} onChange={(e) => setAngle(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 outline-none focus:border-purple-400">
                              {VISUAL_ANGLES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fadeIn">
                      <textarea 
                        value={manualVisualStyle}
                        onChange={(e) => setManualVisualStyle(e.target.value)}
                        placeholder="예: 픽사 스타일의 3D 애니메이션 느낌으로, 따뜻한 오후 햇살이 들어오는 거실 배경..."
                        className="w-full h-24 bg-white border border-stone-200 rounded-xl p-4 text-sm text-stone-700 placeholder-stone-400 focus:border-purple-400 outline-none resize-none"
                      />
                    </div>
                )}
              </div>
            )}
          </div>
      </div>

      {/* Music Settings - Enhanced with 10 Genres per Category */}
      <div className="bg-white rounded-[2rem] p-6 border border-orange-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
           <h3 className="text-stone-800 font-display text-lg flex items-center gap-2">
             <Music size={20} className="text-pink-400"/> 음악 스튜디오
           </h3>
           <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-lg border border-pink-100">
             {CATEGORIES.find(c => c.id === category)?.label} 추천 장르
           </span>
        </div>

        <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200 mb-4">
          <button 
             onClick={() => setMusicMode('auto')} 
             className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${musicMode === 'auto' ? 'bg-white text-pink-500 shadow-sm' : 'text-stone-400'}`}
          >
             추천 장르 선택
          </button>
          <button 
             onClick={() => setMusicMode('manual')} 
             className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${musicMode === 'manual' ? 'bg-white text-pink-500 shadow-sm' : 'text-stone-400'}`}
          >
             직접 입력
          </button>
        </div>

        {musicMode === 'auto' ? (
           <div className="grid grid-cols-2 gap-4 animate-fadeIn">
              <div className="col-span-2 space-y-2">
                 <label className="text-xs font-bold text-stone-500 block uppercase">장르 선택 (Best 10)</label>
                 <select value={musicGenre} onChange={(e) => setMusicGenre(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-sm font-bold text-stone-800 outline-none focus:border-pink-400 ring-2 ring-transparent focus:ring-pink-100 transition-all">
                    {CATEGORY_GENRES[category].map(g => <option key={g} value={g}>{g}</option>)}
                 </select>
              </div>
              
              <div className="space-y-2">
                 <label className="text-xs font-bold text-stone-500 block uppercase">분위기</label>
                 <select value={musicMood} onChange={(e) => setMusicMood(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 outline-none focus:border-pink-400">
                    {MUSIC_MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold text-stone-500 block uppercase">악기</label>
                 <select value={musicInstruments} onChange={(e) => setMusicInstruments(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 outline-none focus:border-pink-400">
                    {MUSIC_INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
                 </select>
              </div>
              <div className="space-y-2 col-span-2">
                 <label className="text-xs font-bold text-stone-500 block uppercase">템포</label>
                 <select value={musicTempo} onChange={(e) => setMusicTempo(e.target.value)} className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 outline-none focus:border-pink-400">
                    <option value="Slow & Emotional">Slow & Emotional</option>
                    <option value="Medium">Medium</option>
                    <option value="Fast & Urgent">Fast & Urgent</option>
                 </select>
              </div>
           </div>
        ) : (
           <div className="animate-fadeIn">
              <textarea 
                value={manualMusicStyle}
                onChange={(e) => setManualMusicStyle(e.target.value)}
                placeholder="예: 슬픈 피아노 선율과 빗소리가 섞인 발라드, 90년대 K-POP 스타일..."
                className="w-full h-32 bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm text-stone-700 placeholder-stone-400 focus:border-pink-400 outline-none resize-none"
              />
           </div>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={!value.trim()}
        className="w-full py-5 bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 disabled:from-stone-300 disabled:to-stone-300 disabled:text-stone-500 text-white rounded-[2rem] font-display text-xl shadow-xl shadow-orange-200 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
      >
        다음 단계 <ArrowRight size={24} />
      </button>
    </div>
  );
};

export default InputStep;
