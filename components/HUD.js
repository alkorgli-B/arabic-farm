'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, RotateCcw, Sparkles, Eye } from 'lucide-react';
import useStore from '../store/useStore';

/* ─── Animal Card ─── */
function AnimalCard({ animal, isSelected, onSelect }) {
  const luminancePercent = Math.round((animal.luminance / animal.maxLuminance) * 100);

  return (
    <motion.button
      onClick={() => onSelect(animal.id)}
      className={`glass rounded-xl p-3 text-right transition-all duration-300 w-full ${
        isSelected
          ? 'border-opacity-40 ring-1 ring-white/20'
          : 'hover:bg-white/5'
      }`}
      style={{
        borderColor: isSelected ? animal.color : 'rgba(255,255,255,0.08)',
        boxShadow: isSelected ? `0 0 20px ${animal.color}22` : 'none',
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3 justify-end">
        <div className="text-right flex-1 min-w-0">
          <div className="font-bold text-sm" style={{ color: animal.color }}>
            {animal.name}
          </div>
          <div className="text-white/40 text-[10px] truncate">{animal.title}</div>
        </div>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${animal.color}15`, border: `1px solid ${animal.color}30` }}
        >
          <Sparkles size={14} style={{ color: animal.color }} />
        </div>
      </div>

      {/* Luminance Bar */}
      <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: animal.color }}
          animate={{ width: `${luminancePercent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-white/25">{animal.interactions} تفاعل</span>
        <span className="text-[9px] text-white/30">{luminancePercent}%</span>
      </div>
    </motion.button>
  );
}

/* ─── Info Panel (selected animal details) ─── */
function InfoPanel({ animal }) {
  return (
    <AnimatePresence>
      {animal && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="glass rounded-2xl p-5 text-right max-w-xs"
          style={{ borderColor: `${animal.color}30` }}
        >
          <div className="flex items-center gap-3 justify-end mb-3">
            <div>
              <h3 className="font-bold text-lg" style={{ color: animal.color }}>
                {animal.name}
              </h3>
              <p className="text-white/40 text-xs">{animal.title}</p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${animal.color}30, transparent)`,
                border: `1px solid ${animal.color}25`,
              }}
            >
              <Eye size={18} style={{ color: animal.color }} />
            </div>
          </div>
          <p className="text-white/50 text-xs leading-relaxed">{animal.description}</p>
          <div className="flex justify-between mt-3 pt-3 border-t border-white/5">
            <span className="text-[10px] text-white/30">
              مستوى النور: {animal.luminance.toFixed(1)}
            </span>
            <span className="text-[10px]" style={{ color: animal.color }}>
              إضغط للرعاية
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Main HUD Component ─── */
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
      {/* ─── Top Header ─── */}
      <header className="flex justify-between items-start p-6 pointer-events-auto">
        {/* Right side — Title (RTL) */}
        <div className="text-right">
          <motion.h1
            className="text-3xl font-black glow-gold tracking-tight"
            style={{ color: '#FFD700' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            محمية الأنوار
          </motion.h1>
          <motion.p
            className="text-white/30 text-[11px] mt-1 font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            حيوانات مقدسة من التاريخ الإسلامي
          </motion.p>
        </div>

        {/* Left side — System Status */}
        <motion.div
          className="text-left"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-xs text-white/20 font-mono tracking-widest">
            LUMINOUS SANCTUARY
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-white/30 font-mono">SYSTEM ACTIVE</span>
          </div>
        </motion.div>
      </header>

      {/* ─── Right Side Panel — Animal Cards ─── */}
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

      {/* ─── Bottom Left — Info Panel ─── */}
      <div className="absolute bottom-24 left-6 pointer-events-auto">
        <InfoPanel animal={selected} />
      </div>

      {/* ─── Bottom Center — Controls ─── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
        <motion.div
          className="glass rounded-full flex items-center gap-4 px-6 py-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={toggleAudio}
            className="text-white/50 hover:text-white/90 transition-colors"
            title={audioEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <div className="w-px h-5 bg-white/10" />

          <button
            onClick={clearSelection}
            className="text-white/50 hover:text-white/90 transition-colors text-xs"
          >
            نظرة عامة
          </button>

          <div className="w-px h-5 bg-white/10" />

          <button
            onClick={resetAll}
            className="text-white/50 hover:text-red-400 transition-colors"
            title="إعادة ضبط"
          >
            <RotateCcw size={16} />
          </button>
        </motion.div>
      </div>

      {/* ─── Decorative Corner Brackets ─── */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-white/10 pointer-events-none" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r border-t border-white/10 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l border-b border-white/10 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-white/10 pointer-events-none" />
    </div>
  );
}
