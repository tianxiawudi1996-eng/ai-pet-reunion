import React, { useState, useEffect } from 'react';
import { AppStep, GenerationResult, GenerationOptions, HistoryItem } from './types';
import InputStep from './components/InputStep';
import ConfirmationStep from './components/ConfirmationStep';
import ResultsStep from './components/ResultsStep';
import PreviewPanel from './components/PreviewPanel';
import HistorySidebar from './components/HistorySidebar';
import { generateContent, validateApiKey } from './services/geminiService';
import { Edit3, MonitorPlay, Settings, Key, X, AlertCircle, CheckCircle, Loader2, Wifi, Smartphone, Globe, ArrowRight, Dog, History, Heart, PawPrint } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [draftText, setDraftText] = useState(''); 
  const [sourceText, setSourceText] = useState('');
  
  const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');
  
  const [options, setOptions] = useState<any>(null);
  const [results, setResults] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [apiKey, setApiKey] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'key' | 'deploy'>('key');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('pet_reunion_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
        localStorage.removeItem('pet_reunion_history');
      }
    }
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const saveToHistory = (data: GenerationResult, source: string) => {
    const historyData = {
      ...data,
      imagePrompts: data.imagePrompts.map(prompt => ({
        ...prompt,
        generatedImage: undefined 
      }))
    };

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      data: historyData,
      sourceText: source
    };
    
    try {
      const updated = [newItem, ...history].slice(0, 30);
      setHistory(updated);
      localStorage.setItem('pet_reunion_history', JSON.stringify(updated));
    } catch (e) {
      console.error("Storage full", e);
      // Emergency simple save
      try {
         const emergencyRescue = [newItem];
         setHistory(emergencyRescue);
         localStorage.setItem('pet_reunion_history', JSON.stringify(emergencyRescue));
      } catch (finalError) {
         setError("저장 공간이 부족하여 히스토리가 저장되지 않았습니다.");
      }
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("정말 삭제할까요? 멍멍? 🐶")) return;
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('pet_reunion_history', JSON.stringify(updated));
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setResults(item.data);
    setSourceText(item.sourceText);
    setDraftText(item.sourceText);
    setStep(AppStep.RESULTS);
    setActiveView('editor');
    setIsHistoryOpen(false);
  };

  const handleInputNext = (data: any) => {
    setSourceText(draftText);
    setOptions(data);
    setStep(AppStep.CONFIRMATION);
  };

  const handleConfirm = async () => {
    setStep(AppStep.GENERATING);
    setError(null);
    
    if (!apiKey && !process.env.API_KEY) {
       try {
         const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
         if (hasKey === false) {
            await (window as any).aistudio.openSelectKey();
         }
       } catch (e) {}
    }

    try {
      const fullOptions: GenerationOptions = {
        apiKey: apiKey, 
        sourceText,
        category: options.category,
        manualMusicStyle: options.manualMusicStyle,
        autoGenerateImages: options.autoGenerateImages,
        aspectRatio: options.aspectRatio,
        visualSettings: options.visualSettings,
        musicSettings: options.musicSettings,
        referenceImages: options.referenceImages
      };
      
      const data = await generateContent(fullOptions);
      saveToHistory(data, sourceText);
      
      setResults(data);
      setStep(AppStep.RESULTS);
      setActiveView('preview');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "오류가 발생했습니다. API 키를 확인해주세요.");
      setStep(AppStep.CONFIRMATION);
    }
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setIsSettingsOpen(false);
    setTestStatus('idle');
  };

  const handleTestConnection = async () => {
    if (!apiKey) {
      setTestStatus('error');
      setTestMessage("API Key를 입력해주세요.");
      return;
    }
    setTestStatus('testing');
    try {
      await validateApiKey(apiKey);
      setTestStatus('success');
      setTestMessage("연결 성공! 왈왈!");
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(e.message || "연결 실패 ㅠㅠ");
    }
  };

  return (
    <div className="h-screen bg-[#FFF8F0] text-stone-700 font-sans break-keep flex flex-col overflow-hidden selection:bg-orange-200 selection:text-orange-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 shrink-0 z-20 px-4 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-orange-400 p-2 rounded-2xl text-white shadow-lg shadow-orange-200"><Dog size={20} /></div>
          <div>
            <h1 className="text-lg font-display text-stone-800 leading-none tracking-tight">멍냥이 구조대</h1>
            <span className="text-[10px] text-orange-400 font-bold tracking-widest uppercase">AI STUDIO</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
             <button 
               onClick={() => setActiveView('editor')} 
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeView === 'editor' ? 'bg-white text-orange-500 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
             >
                <Edit3 size={14} /> 작성
             </button>
             <button 
               onClick={() => setActiveView('preview')} 
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeView === 'preview' ? 'bg-white text-orange-500 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
             >
                <MonitorPlay size={14} /> 미리보기
             </button>
           </div>
           
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className={`w-9 h-9 flex items-center justify-center bg-white border border-stone-200 rounded-xl transition-all shadow-sm hover:shadow-md hover:border-orange-200 ${apiKey ? 'text-orange-400' : 'text-stone-400'}`}
           >
             <Settings size={18} />
           </button>

           <button 
             onClick={() => setIsHistoryOpen(true)}
             className="w-9 h-9 flex items-center justify-center bg-white border border-stone-200 rounded-xl text-stone-400 hover:text-orange-500 transition-all shadow-sm hover:shadow-md hover:border-orange-200"
           >
             <History size={18} />
           </button>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {/* Editor View */}
        <div className={`absolute inset-0 transition-transform duration-500 p-4 lg:p-8 overflow-y-auto scrollbar-hide ${activeView === 'editor' ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="max-w-xl mx-auto pb-24">
            {step === AppStep.INPUT && <InputStep value={draftText} onChange={setDraftText} onNext={handleInputNext} apiKey={apiKey} />}
            {step === AppStep.CONFIRMATION && <ConfirmationStep onConfirm={handleConfirm} onEdit={() => setStep(AppStep.INPUT)} />}
            {step === AppStep.GENERATING && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="relative mb-8">
                   <div className="w-24 h-24 border-4 border-orange-100 border-t-orange-400 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center"><PawPrint size={32} className="text-orange-400 animate-bounce" /></div>
                </div>
                <h3 className="text-2xl font-display text-stone-800 mb-2">열심히 만드는 중... 🐾</h3>
                <p className="text-stone-500 text-sm">AI가 감동적인 스토리와 이미지를 그리고 있어요!</p>
              </div>
            )}
            {step === AppStep.RESULTS && results && <ResultsStep data={results} onReset={() => setStep(AppStep.INPUT)} />}
            
            {error && (
              <div className="mt-6 p-5 bg-red-50 text-red-500 border border-red-100 rounded-3xl text-sm font-bold flex flex-col gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
                {(error.includes("API Key") || error.includes("API_KEY")) && (
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="self-start px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                  >
                    API Key 설정하기
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview View */}
        <div className={`absolute inset-0 transition-transform duration-500 p-4 lg:p-8 overflow-y-auto bg-stone-100 ${activeView === 'preview' ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="max-w-xl mx-auto h-full relative z-10 pb-24">
             <PreviewPanel step={step} text={step === AppStep.INPUT ? draftText : sourceText} results={results} />
          </div>
        </div>
      </main>

      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history} 
        onSelect={loadHistoryItem}
        onDelete={deleteHistoryItem}
      />

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md p-6 rounded-[2rem] shadow-2xl relative border-4 border-orange-100">
             <button onClick={() => { setIsSettingsOpen(false); setTestStatus('idle'); }} className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 bg-stone-100 rounded-full p-1"><X size={20}/></button>
             
             <div className="flex items-center gap-3 mb-6">
               <div className="bg-orange-100 text-orange-500 p-3 rounded-2xl"><Settings size={24}/></div>
               <div>
                  <h2 className="text-xl font-display text-stone-800">설정</h2>
                  <p className="text-xs text-stone-400 font-bold uppercase">Configuration</p>
               </div>
             </div>

             <div className="flex p-1.5 bg-stone-100 rounded-2xl mb-6">
               <button 
                 onClick={() => setSettingsTab('key')} 
                 className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${settingsTab === 'key' ? 'bg-white text-orange-500 shadow-sm' : 'text-stone-400'}`}
               >
                 API Key
               </button>
               <button 
                 onClick={() => setSettingsTab('deploy')} 
                 className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${settingsTab === 'deploy' ? 'bg-white text-orange-500 shadow-sm' : 'text-stone-400'}`}
               >
                 배포 안내
               </button>
             </div>
             
             {settingsTab === 'key' ? (
               <div className="space-y-4 animate-fadeIn">
                 <div>
                    <label className="text-xs font-bold text-stone-500 mb-2 block flex items-center gap-2">
                      <Key size={14} /> Google Gemini API Key
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="password" 
                        placeholder="API Key를 입력하세요"
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          if (testStatus !== 'idle') setTestStatus('idle');
                        }}
                        className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                      />
                      <button 
                        onClick={handleTestConnection}
                        disabled={testStatus === 'testing' || !apiKey}
                        className={`px-4 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all ${
                          testStatus === 'success' ? 'bg-green-100 text-green-600 border-green-200' :
                          testStatus === 'error' ? 'bg-red-100 text-red-500 border-red-200' :
                          'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                        }`}
                      >
                        {testStatus === 'testing' ? <Loader2 size={16} className="animate-spin"/> : <Wifi size={16}/>}
                        {testStatus === 'testing' ? '' : '테스트'}
                      </button>
                    </div>
                    
                    {testStatus === 'success' && <p className="mt-2 text-xs font-bold text-green-500 flex items-center gap-1"><CheckCircle size={12}/> {testMessage}</p>}
                    {testStatus === 'error' && <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {testMessage}</p>}
                 </div>
                 
                 <div className="pt-4 flex gap-3">
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-500 text-xs font-bold hover:bg-stone-50 flex items-center justify-center">
                      키 발급받기
                    </a>
                    <button onClick={() => handleSaveApiKey(apiKey)} className="flex-1 py-3 bg-orange-400 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-200 transition-all">
                      저장하기
                    </button>
                 </div>
               </div>
             ) : (
               <div className="space-y-5 animate-fadeIn">
                 <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <div className="flex items-start gap-3">
                       <Smartphone size={20} className="text-orange-400 mt-1"/>
                       <div>
                          <h4 className="text-sm font-bold text-stone-800 mb-1">스마트폰 사용법</h4>
                          <p className="text-xs text-stone-500 leading-relaxed">
                            이 앱을 Vercel에 배포하면 스마트폰에서도 예쁜 앱처럼 사용할 수 있어요!
                          </p>
                       </div>
                    </div>
                 </div>
                 <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="w-full py-4 bg-stone-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg">
                   <Globe size={16}/> Vercel 배포하기 <ArrowRight size={16} />
                 </a>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-orange-100 h-10 px-4 flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest shrink-0">
         <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${step === AppStep.GENERATING ? 'bg-orange-400 animate-pulse' : 'bg-stone-300'}`}></div>
            <span>STEP: {step}</span>
         </div>
         <div className="flex items-center gap-1">
            <Heart size={10} className="text-pink-400 fill-pink-400" />
            <span>WITH GEMINI 3 PRO</span>
         </div>
      </footer>
    </div>
  );
};

export default App;