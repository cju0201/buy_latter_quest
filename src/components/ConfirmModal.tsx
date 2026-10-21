import React from 'react';
import { AlertCircle, ShieldAlert, Trash2, RotateCcw, X } from 'lucide-react';
import { soundManager } from '../utils/sound';

export interface ConfirmConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'warning';
  icon?: 'shield' | 'trash' | 'warning' | 'reset';
  onConfirm: () => void;
}

interface ConfirmModalProps {
  config: ConfirmConfig | null;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ config, onClose }) => {
  if (!config) return null;

  const handleConfirm = () => {
    soundManager.playBlip();
    config.onConfirm();
    onClose();
  };

  const handleCancel = () => {
    soundManager.playBlip();
    onClose();
  };

  const isSuccess = config.variant === 'success';
  const isDanger = config.variant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className={`relative w-full max-w-md rounded-lg overflow-hidden shadow-2xl p-5 ${
        isSuccess 
          ? 'pixel-box-green bg-[#22332c] border-2 border-[#4ade80]'
          : isDanger
          ? 'pixel-box bg-[#351e28] border-2 border-red-500'
          : 'pixel-box-gold bg-[#30254D] border-2 border-[#F6D778]'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${
              isSuccess 
                ? 'bg-[#184232] text-[#6ee7b7]'
                : isDanger
                ? 'bg-[#4f1f2a] text-red-400'
                : 'bg-[#48336d] text-[#F6D778]'
            }`}>
              {config.icon === 'shield' && <ShieldAlert className="w-5 h-5" />}
              {config.icon === 'trash' && <Trash2 className="w-5 h-5" />}
              {config.icon === 'reset' && <RotateCcw className="w-5 h-5" />}
              {(!config.icon || config.icon === 'warning') && <AlertCircle className="w-5 h-5" />}
            </div>
            <h3 className="font-retro font-bold text-base text-white">
              {config.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="text-[#F4D9F0]/60 hover:text-white p-1 rounded hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <div className="py-2 text-xs sm:text-sm text-[#F4D9F0]/90 font-retro leading-relaxed whitespace-pre-line">
          {config.message}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleCancel}
            className="px-3.5 py-1.5 rounded text-xs text-[#F4D9F0]/80 hover:text-white hover:bg-white/10 font-retro transition-colors"
          >
            {config.cancelText || '取消'}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className={`pixel-btn px-4 py-2 text-xs font-bold rounded cursor-pointer transition-all ${
              isSuccess
                ? 'bg-[#2d7353] hover:bg-[#388e66] text-white border border-[#4ade80]'
                : isDanger
                ? 'bg-red-600 hover:bg-red-700 text-white border border-red-400'
                : 'bg-[#8B65C7] hover:bg-[#9d71e8] text-white border border-[#F6D778]'
            }`}
          >
            {config.confirmText || '確定'}
          </button>
        </div>
      </div>
    </div>
  );
};
