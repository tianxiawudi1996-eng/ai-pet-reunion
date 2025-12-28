
import React from 'react';
import { Edit2, AlertTriangle, ArrowRight, CheckSquare } from 'lucide-react';

interface ConfirmationStepProps {
  onConfirm: () => void;
  onEdit: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ onConfirm, onEdit }) => {
  return (
    <div className="animate-fadeIn h-full flex flex-col">
      <div className="mb-6">
         <h2 className="text-3xl font-display text-stone-800 mb-3 flex items-center gap-2">
            ✅ 마지막 확인!
         </h2>
         <p className="text-stone-500 text-lg">
           AI가 세상에 하나뿐인 노래를 만들기 전에,<br/>
           입력하신 정보가 맞는지 확인해주세요.
         </p>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-[2rem] p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-orange-500 font-bold text-lg">
          <AlertTriangle size={24} />
          <span>체크리스트</span>
        </div>
        <ul className="space-y-3">
          {[
            "🐶 반려동물의 이름과 품종이 맞나요?",
            "📅 날짜와 장소 정보가 정확한가요?",
            "💖 아이의 특징이나 습관을 잘 적었나요?",
            "✨ 전하고 싶은 메시지가 빠지지 않았나요?"
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-orange-100 shadow-sm">
              <div className="mt-0.5">
                  <CheckSquare size={18} className="text-orange-400" />
              </div>
              <span className="text-stone-700 font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex flex-col gap-4">
        <button
          onClick={onConfirm}
          className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-orange-400 to-pink-400 text-white rounded-[2rem] hover:shadow-xl hover:shadow-orange-200 transition-all transform hover:scale-[1.01] font-display text-xl"
        >
          🚀 이야기 생성 시작
          <ArrowRight size={24} />
        </button>
        
        <button
          onClick={onEdit}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 text-stone-500 bg-white border border-stone-200 hover:bg-stone-50 rounded-[2rem] transition-colors font-bold shadow-sm"
        >
          <Edit2 size={18} />
          ✏️ 다시 수정하기
        </button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
