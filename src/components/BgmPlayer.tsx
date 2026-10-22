import React, { useState, useEffect } from 'react';
import { bgmManager } from '../utils/bgm';
import { saveStoredBgmSettings, loadStoredBgmSettings } from '../utils/storage';
import { Music, Play, Pause, Volume2, VolumeX, Disc } from 'lucide-react';
import { soundManager } from '../utils/sound';

export const BgmPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.35);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState(false);

  useEffect(() => {
    const saved = loadStoredBgmSettings();
    setVolume(saved.volume);
    bgmManager.setVolume(saved.volume);
    // Note: Auto-play is restricted by browsers, user must explicitly initiate playback
  }, []);

  const handleTogglePlay = async () => {
    soundManager.playBlip();
    const wasPlaying = bgmManager.getIsPlaying();
    const playing = await bgmManager.toggle();
    setIsPlaying(playing);
    setPlaybackError(!wasPlaying && !playing);
    saveStoredBgmSettings({ isPlaying: playing, volume });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    bgmManager.setVolume(val);
    saveStoredBgmSettings({ isPlaying, volume: val });
  };

  return (
    <div className="relative">
      {/* Compact Mini Music Button */}
      <button
        type="button"
        onClick={() => {
          soundManager.playBlip();
          setIsExpanded(!isExpanded);
        }}
        title="16-bit RPG 背景音樂控制器"
        className={`p-2 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
          isPlaying
            ? 'bg-[#432d6b] border-[#F6D778] text-[#F6D778]'
            : 'bg-[#30254D] border-[#524177] text-[#F4D9F0]/80 hover:text-white hover:bg-[#3b2e5e]'
        }`}
      >
        <Music className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
        <span className="hidden xl:inline text-xs font-retro">BGM</span>
      </button>

      {/* Expanded Popover / Dropdown */}
      {isExpanded && (
        <div className="absolute right-0 top-11 z-50 w-64 bg-[#2b1e47] border-2 border-[#8B65C7] rounded-lg pixel-box p-3.5 shadow-2xl font-retro animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-[#F6D778] font-bold">
              <Disc className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} />
              <span>公會背景音樂 (8-bit BGM)</span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-[#F4D9F0]/50 hover:text-white text-xs p-0.5"
            >
              ✕
            </button>
          </div>

          <div className="text-[11px] text-[#F4D9F0]/80 mb-3 flex items-center justify-between">
            <span>曲目：心動旅人的平靜午後</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded ${isPlaying ? 'bg-emerald-950 text-emerald-400' : 'bg-stone-800 text-stone-400'}`}>
              {isPlaying ? '播放中' : '已暫停'}
            </span>
          </div>
          {playbackError && (
            <p role="status" className="mb-2 text-[10px] leading-relaxed text-amber-200">
              無法啟動音樂，請再按一次播放；並確認手機媒體音量已開啟。
            </p>
          )}

          {/* Controls: Play/Pause and Volume */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`w-full pixel-btn py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer ${
                isPlaying
                  ? 'bg-[#382b57] text-[#F6D778] border border-[#F6D778]'
                  : 'bg-[#8B65C7] hover:bg-[#9d71e8] text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? '暫停音樂' : '開始播放音樂'}</span>
            </button>

            {/* Volume slider */}
            <div className="flex items-center gap-2 text-xs">
              {volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-[#F4D9F0]/50 shrink-0" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#F6D778] shrink-0" />
              )}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1.5 bg-[#170e26] rounded appearance-none cursor-pointer accent-[#F6D778]"
              />
              <span className="font-mono text-[10px] text-[#F4D9F0]/70 w-8 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
