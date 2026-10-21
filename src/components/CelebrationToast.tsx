import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, X } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface CelebrationToastProps {
  title: string;
  subtitle: string;
  expGained?: number;
  icon?: string;
  onClose: () => void;
}

export const CelebrationToast: React.FC<CelebrationToastProps> = ({
  title,
  subtitle,
  expGained,
  icon = '🎉',
  onClose,
}) => {
  useEffect(() => {
    // Launch festive retro celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F6D778', '#8B65C7', '#6ee7b7', '#F4D9F0'],
      });
    } catch {
      // Ignore if canvas is not available
    }

    const timer = setTimeout(() => {
      onClose();
    }, 5500);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 max-w-sm animate-bounce-short">
      <div className="pixel-box-gold bg-[#30254D] p-4 rounded-lg shadow-2xl border-2 border-[#F6D778] flex items-start gap-3">
        <div className="w-10 h-10 rounded bg-[#47346b] border border-[#F6D778] flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-retro font-bold text-sm text-[#F6D778] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F6D778]" />
              {title}
            </h4>
            <button
              onClick={onClose}
              className="text-[#F4D9F0]/60 hover:text-white p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[#F4D9F0] mt-1 font-retro">
            {subtitle}
          </p>
          {expGained && (
            <div className="mt-2 text-right">
              <span className="font-pixel text-[11px] text-[#F6D778] font-bold">
                +{expGained} EXP
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
