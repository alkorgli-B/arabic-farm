'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, RotateCcw, Heart, Eye } from 'lucide-react';
import useStore from '../store/useStore';

/* ─── Animal Emoji/Icon by type ─── */
const animalIcons = {
  qaswa: '🐪',
  duldul: '🫏',
  sakb: '🐴',
  ufayr: '🫏',
};

/* ─── Animal Card ─── */
function AnimalCard({ animal, isSelected, onSelect }) {
  const happinessPercent = Math.round((animal.happiness / animal.maxHappiness) * 100);

  // Earthy tones per animal
  const cardAccent = {
    qaswa: '#C4944A',
    duldul: '#7B6B5A',
    sakb: '#6B3420',
    ufayr: '#888',
  };
  const accent = cardAccent[animal.id] || '#A08060';

  return (
    <motion.button
      onClick={() => onSelect(animal.id)}
      className={`parchment-glass rounded-xl p-3 text-right transition-all duration-300 w-full ${
        isSelected ? 'ring-1' : 'hover:bg-white/5'
      }`}
      style={{
        borderColor: isSelected ? accent : 'rgba(212,167,106,0.1)',
        ringColor: isSelected ? accent : undefined,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3 justify-end">
        <div className="text-right flex-1 min-w-0">
          <div className="font-bold text-sm" style={{ color: '#F5E6C8' }}>
            {animal.name}
          </div>
          <div className="text-[#A08060] text-[10px] truncate">{animal.title}</div>
        </div>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
          style={{ background: `${accent}20`, border: `1px solid ${accent}30` }}
        >
          {animalIcons[animal.id]}
        </div>
      </div>

      {/* Happiness Bar */}
      <div className="mt-2 h-1.5 bg-[#2A2015] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${accent}, #D4A76A)` }}
          animate={{ width: `${happinessPercent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-[#8A7050]">{animal.interactions} تفاعل</span>
        <span className="text-[9px] text-[#A08060]">{happinessPercent}% سعادة</span>
      </div>
    </motion.button>
  );
}

/* ─── Info Panel ─── */
function InfoPanel({ animal }) {
  return (
    <AnimatePresence>
      {animal && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="parchment-glass rounded-2xl p-5 text-right max-w-xs"
          style={{ borderColor: 'rgba(212,167,106,0.2)' }}
        >
          <div className="flex items-center gap-3 justify-end mb-3">
            <div>
              <h3 className="font-bold text-lg text-[#F5E6C8]">
                {animal.name}
              </h3>
              <p className="text-[#A08060] text-xs">{animal.title}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{
                background: 'rgba(212,167,106,0.1)',
                border: '1px solid rgba(212,167,106,0.2)',
              }}
            >
              {animalIcons[animal.id]}
            </div>
          </div>
          <p className="text-[#B8A080] text-xs leading-relaxed">{animal.description}</p>
          <div className="flex justify-between mt-3 pt-3 border-t border-[#3A2A1A]">
            <span className="text-[10px] text-[#8A7050]">
              مستوى السعادة: {animal.happiness.toFixed(1)}
            </span>
            <span className="text-[10px] text-[#D4A76A]">
              إضغط للرعاية
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Main HUD ─── */
export default function HUD() {
  const animals = useStore((s) => s.animals);
  const selectedAnimal = useStore((s) => s.selectedAnimal);
  const selectAnimal = useStore((s) => s.selectAnimal);
  const clearSelection = useStore((s) => s.clearSelection);
  const resetAll = useStore((s) => s.resetAll);
  const audioEnabled = useStore((s) => s.audioEnabled);
  const toggleAudio = useStore((s) => s.toggleAudio);

  const selected = animals.find((a) => a.id === selectedAnimal);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* ── Top Header ── */}
      <header className="flex justify-between items-start p-6 pointer-events-auto">
        <div className="text-right">
          <motion.h1
            className="text-3xl font-black glow-warm tracking-tight"
            style={{ color: '#D4A76A' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            المزرعة المباركة
          </motion.h1>
          <motion.p
            className="text-[#8A7050] text-[11px] mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            حيوانات من السيرة النبوية الشريفة
          </motion.p>
        </div>

        <motion.div
          className="text-left"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-xs text-[#6A5A40] font-mono tracking-widest">
            THE BLESSED FARM
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#6B9F3B] animate-pulse" />
            <span className="text-[10px] text-[#6A5A40] font-mono">GOLDEN HOUR</span>
          </div>
        </motion.div>
      </header>

      {/* ── Right Panel — Animal Cards ── */}
      <div className="absolute top-24 right-6 flex flex-col gap-2 w-52 pointer-events-auto">
        {animals.map((animal) => (
          <AnimalCard
            key={animal.id}
            animal={animal}
            isSelected={selectedAnimal === animal.id}
            onSelect={selectAnimal}
          />
        ))}
      </div>

      {/* ── Bottom Left — Info Panel ── */}
      <div className="absolute bottom-24 left-6 pointer-events-auto">
        <InfoPanel animal={selected} />
      </div>

      {/* ── Bottom Center — Controls ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
        <motion.div
          className="parchment-glass rounded-full flex items-center gap-4 px-6 py-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={toggleAudio}
            className="text-[#A08060] hover:text-[#D4A76A] transition-colors"
            title={audioEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <div className="w-px h-5 bg-[#3A2A1A]" />

          <button
            onClick={clearSelection}
            className="text-[#A08060] hover:text-[#D4A76A] transition-colors text-xs"
          >
            نظرة عامة
          </button>

          <div className="w-px h-5 bg-[#3A2A1A]" />

          <button
            onClick={resetAll}
            className="text-[#A08060] hover:text-red-400 transition-colors"
            title="إعادة ضبط"
          >
            <RotateCcw size={16} />
          </button>
        </motion.div>
      </div>

      {/* ── Corner accents — parchment style ── */}
      <div className="absolute top-4 left-4 w-6 h-6 border-l border-t border-[#3A2A1A] pointer-events-none" />
      <div className="absolute top-4 right-4 w-6 h-6 border-r border-t border-[#3A2A1A] pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-l border-b border-[#3A2A1A] pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-r border-b border-[#3A2A1A] pointer-events-none" />
    </div>
  );
}
