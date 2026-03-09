import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  Users, 
  MapPin, 
  ClipboardCheck, 
  BarChart3, 
  ArrowLeft,
  XCircle,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ELECTION_DATA, ElectionLevel, ElectionUnit, Candidate } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Step = 'selection' | 'counting' | 'results';

interface Ballot {
  id: number;
  votedCandidateIds: string[];
  isInvalid: boolean;
}

export default function App() {
  const [step, setStep] = useState<Step>('selection');
  const [selectedLevel, setSelectedLevel] = useState<ElectionLevel | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<ElectionUnit | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('');
  
  const [ballots, setBallots] = useState<Ballot[]>([]);
  const [currentBallotGạchIds, setCurrentBallotGạchIds] = useState<string[]>([]);

  // Selection Logic
  const handleLevelSelect = (level: ElectionLevel) => {
    setSelectedLevel(level);
    setSelectedUnit(null);
    setSelectedArea('');
  };

  const handleUnitSelect = (unit: ElectionUnit) => {
    setSelectedUnit(unit);
    setSelectedArea('');
  };

  const startCounting = () => {
    if (selectedLevel && selectedUnit && selectedArea) {
      setStep('counting');
      setBallots([]);
      setCurrentBallotGạchIds([]);
    }
  };

  // Counting Logic
  const toggleGạch = (candidateId: string) => {
    setCurrentBallotGạchIds(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId) 
        : [...prev, candidateId]
    );
  };

  const submitBallot = () => {
    if (!selectedUnit) return;

    const allCandidateIds = selectedUnit.candidates.map(c => c.id);
    const votedIds = allCandidateIds.filter(id => !currentBallotGạchIds.includes(id));
    
    // A ballot is invalid if the number of voted people > maxVotes
    const isInvalid = votedIds.length > selectedUnit.maxVotes || votedIds.length === 0;

    const newBallot: Ballot = {
      id: ballots.length + 1,
      votedCandidateIds: isInvalid ? [] : votedIds,
      isInvalid
    };

    setBallots([...ballots, newBallot]);
    setCurrentBallotGạchIds([]);
  };

  const finishCounting = () => {
    setStep('results');
  };

  const resetApp = () => {
    setStep('selection');
    setSelectedLevel(null);
    setSelectedUnit(null);
    setSelectedArea('');
    setBallots([]);
  };

  // Results Calculation
  const results = useMemo(() => {
    if (!selectedUnit) return { candidates: [], stats: [] };

    const candidateVotes = selectedUnit.candidates.map(candidate => {
      const votes = ballots.reduce((acc, ballot) => {
        return acc + (ballot.votedCandidateIds.includes(candidate.id) ? 1 : 0);
      }, 0);
      return { ...candidate, votes };
    }).sort((a, b) => b.votes - a.votes);

    const voteCountStats = [1, 2, 3, 4, 5].map(count => {
      const frequency = ballots.filter(b => !b.isInvalid && b.votedCandidateIds.length === count).length;
      return { count: `${count} người`, frequency };
    });

    const invalidCount = ballots.filter(b => b.isInvalid).length;

    return { candidates: candidateVotes, stats: voteCountStats, invalidCount, total: ballots.length };
  }, [ballots, selectedUnit]);

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#141414] font-sans selection:bg-[#141414] selection:text-white">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-12">
        {/* Header */}
        <header className="mb-8 md:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-[#141414]">
              UBBC phường Tân Tiến
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-[#141414]/20"></span>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold opacity-40">
                Hệ thống kiểm phiếu 2026
              </p>
            </div>
          </div>
          {step !== 'selection' && (
            <button 
              onClick={resetApp}
              className="group flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-all bg-white sm:bg-transparent px-4 py-2 sm:p-0 rounded-full border border-[#141414]/5 sm:border-0 shadow-sm sm:shadow-none"
            >
              <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" />
              Làm lại
            </button>
          )}
        </header>

        <AnimatePresence mode="wait">
          {step === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 rounded-full bg-[#141414] text-white text-[10px] flex items-center justify-center font-bold">1</div>
                  <label className="text-xs uppercase tracking-widest font-bold opacity-40">Cấp bầu cử</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {ELECTION_DATA.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => handleLevelSelect(level)}
                      className={cn(
                        "relative p-6 text-left border transition-all duration-300 rounded-3xl overflow-hidden group min-h-[140px] flex flex-col justify-between",
                        selectedLevel?.id === level.id 
                          ? "bg-[#141414] text-white border-[#141414] shadow-2xl shadow-[#141414]/20" 
                          : "bg-white border-[#141414]/5 hover:border-[#141414]/20 hover:shadow-xl hover:shadow-[#141414]/5"
                      )}
                    >
                      <Users size={24} className={cn("transition-colors", selectedLevel?.id === level.id ? "text-white/40" : "text-[#141414]/10")} />
                      <h3 className="font-bold text-lg leading-tight pr-4">{level.name}</h3>
                      {selectedLevel?.id === level.id && (
                        <motion.div layoutId="active-level" className="absolute top-4 right-4">
                          <CheckCircle2 size={20} className="text-white" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {selectedLevel && (
                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-6 h-6 rounded-full bg-[#141414] text-white text-[10px] flex items-center justify-center font-bold">2</div>
                    <label className="text-xs uppercase tracking-widest font-bold opacity-40">Đơn vị bầu cử</label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedLevel.units.map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => handleUnitSelect(unit)}
                        className={cn(
                          "px-6 py-4 text-sm font-bold border rounded-2xl transition-all text-left flex justify-between items-center group",
                          selectedUnit?.id === unit.id
                            ? "bg-[#141414] text-white border-[#141414] shadow-lg"
                            : "bg-white border-[#141414]/5 hover:border-[#141414]/20"
                        )}
                      >
                        <span>{unit.name}</span>
                        <ChevronRight size={16} className={cn("transition-transform", selectedUnit?.id === unit.id ? "translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0")} />
                      </button>
                    ))}
                  </div>
                </motion.section>
              )}

              {selectedUnit && (
                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-6 h-6 rounded-full bg-[#141414] text-white text-[10px] flex items-center justify-center font-bold">3</div>
                    <label className="text-xs uppercase tracking-widest font-bold opacity-40">Khu vực (Tổ dân phố)</label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {selectedUnit.areas.map((area) => (
                      <button
                        key={area}
                        onClick={() => setSelectedArea(area)}
                        className={cn(
                          "px-4 py-3 text-xs font-bold border rounded-xl transition-all flex items-center justify-center gap-2 text-center",
                          selectedArea === area
                            ? "bg-[#141414] text-white border-[#141414] shadow-md"
                            : "bg-white border-[#141414]/5 hover:border-[#141414]/20"
                        )}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </motion.section>
              )}

              {selectedArea && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="pt-12 flex justify-center sticky bottom-6 z-10"
                >
                  <button
                    onClick={startCounting}
                    className="bg-[#141414] text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#333] transition-all shadow-2xl shadow-[#141414]/40 flex items-center gap-4 active:scale-95"
                  >
                    Bắt đầu kiểm phiếu
                    <ChevronRight size={18} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 'counting' && selectedUnit && (
            <motion.div
              key="counting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8 pb-24 lg:pb-0"
            >
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-5 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-[#141414]/5 shadow-xl shadow-[#141414]/5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-10 gap-6">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141414]/5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Đang kiểm phiếu</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Phiếu số {ballots.length + 1}</h2>
                      <p className="text-[10px] md:text-xs font-medium opacity-40">
                        {selectedUnit.name} • {selectedArea}
                      </p>
                    </div>
                    
                    {/* Mobile Sticky Counter (Visible only on small screens) */}
                    <div className="sm:hidden sticky top-4 z-20 w-full bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-[#141414]/10 shadow-lg flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">Đã bầu</span>
                        <span className={cn(
                          "text-xl font-bold tabular-nums",
                          (selectedUnit.candidates.length - currentBallotGạchIds.length) > selectedUnit.maxVotes ? "text-red-500" : "text-[#141414]"
                        )}>
                          {selectedUnit.candidates.length - currentBallotGạchIds.length} / {selectedUnit.maxVotes}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={submitBallot}
                          className="bg-[#141414] text-white p-3 rounded-xl shadow-md active:scale-90 transition-transform"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Desktop Counter */}
                    <div className="hidden sm:flex gap-4">
                      <div className="bg-[#F8F8F6] px-5 py-3 rounded-2xl text-center">
                        <span className="block text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1">Đã bầu</span>
                        <span className={cn(
                          "text-2xl font-bold tabular-nums",
                          (selectedUnit.candidates.length - currentBallotGạchIds.length) > selectedUnit.maxVotes ? "text-red-500" : "text-[#141414]"
                        )}>
                          {selectedUnit.candidates.length - currentBallotGạchIds.length}
                        </span>
                      </div>
                      <div className="bg-[#F8F8F6] px-5 py-3 rounded-2xl text-center">
                        <span className="block text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1">Tối đa</span>
                        <span className="text-2xl font-bold tabular-nums opacity-40">{selectedUnit.maxVotes}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-4 md:mb-6 opacity-40">
                      <XCircle size={14} />
                      <p className="text-[11px] font-bold uppercase tracking-widest">Gạch tên người không bầu</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:gap-3">
                      {selectedUnit.candidates.map((candidate) => {
                        const isGạch = currentBallotGạchIds.includes(candidate.id);
                        return (
                          <button
                            key={candidate.id}
                            onClick={() => toggleGạch(candidate.id)}
                            className={cn(
                              "w-full p-4 md:p-6 rounded-2xl md:rounded-3xl border transition-all flex justify-between items-center group active:scale-[0.98]",
                              isGạch 
                                ? "bg-red-50 border-red-100 text-red-600" 
                                : "bg-white border-[#141414]/5 hover:border-[#141414]/20"
                            )}
                          >
                            <span className={cn(
                              "text-base md:text-lg font-bold transition-all text-left",
                              isGạch && "line-through opacity-40"
                            )}>
                              {candidate.name}
                            </span>
                            <div className={cn(
                              "w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                              isGạch 
                                ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-200" 
                                : "border-[#141414]/10 group-hover:border-[#141414]/30"
                            )}>
                              {isGạch && <Plus size={16} className="rotate-45" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Desktop Action Buttons */}
                  <div className="mt-12 hidden sm:flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={submitBallot}
                      className="flex-[2] bg-[#141414] text-white py-5 rounded-3xl font-bold uppercase tracking-widest text-xs hover:bg-[#333] transition-all shadow-xl shadow-[#141414]/20 flex items-center justify-center gap-3 active:scale-95"
                    >
                      <Plus size={20} />
                      Ghi nhận phiếu
                    </button>
                    <button
                      onClick={finishCounting}
                      className="flex-1 py-5 border-2 border-[#141414]/5 rounded-3xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#141414] hover:text-white transition-all active:scale-95"
                    >
                      Hoàn tất
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Sticky Footer Actions */}
              <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-[#141414]/5 z-30 flex gap-3">
                <button
                  onClick={submitBallot}
                  className="flex-[2] bg-[#141414] text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-[#141414]/20"
                >
                  <Plus size={16} />
                  Ghi nhận
                </button>
                <button
                  onClick={finishCounting}
                  className="flex-1 py-4 border-2 border-[#141414]/10 rounded-2xl font-bold uppercase tracking-widest text-[9px] active:scale-95"
                >
                  Hoàn tất
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-[#141414] text-white p-8 rounded-[2.5rem] shadow-2xl shadow-[#141414]/20">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-8 flex items-center gap-2">
                    <ClipboardCheck size={14} />
                    Tiến độ
                  </h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium opacity-60">Số phiếu đã kiểm</span>
                      <span className="text-5xl font-bold tabular-nums">{ballots.length}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-white" 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (ballots.length / 100) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-[#141414]/5 shadow-xl shadow-[#141414]/5">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-6">Lịch sử phiếu</h3>
                  <div className="space-y-3">
                    {ballots.slice(-4).reverse().map((ballot) => (
                      <div key={ballot.id} className="flex justify-between items-center p-4 bg-[#F8F8F6] rounded-2xl">
                        <span className="text-xs font-bold opacity-30">#{ballot.id}</span>
                        {ballot.isInvalid ? (
                          <span className="text-red-500 font-bold text-[10px] uppercase tracking-widest bg-red-50 px-2 py-1 rounded-md">Không hợp lệ</span>
                        ) : (
                          <span className="font-bold text-xs">{ballot.votedCandidateIds.length} người</span>
                        )}
                      </div>
                    ))}
                    {ballots.length === 0 && (
                      <div className="text-center py-8 opacity-20">
                        <ClipboardCheck size={32} className="mx-auto mb-2" />
                        <p className="text-[10px] uppercase font-bold tracking-widest">Chưa có dữ liệu</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'results' && selectedUnit && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-[#141414]/5 shadow-2xl shadow-[#141414]/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                      <CheckCircle2 size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Báo cáo hoàn tất</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Kết quả tổng hợp</h2>
                    <p className="text-xs font-medium opacity-40">{selectedLevel?.name} • {selectedUnit.name}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                    <div className="bg-[#F8F8F6] p-4 rounded-2xl text-center">
                      <span className="block text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1">Tổng</span>
                      <span className="text-xl font-bold tabular-nums">{results.total}</span>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl text-center">
                      <span className="block text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1 text-emerald-600/60">Hợp lệ</span>
                      <span className="text-xl font-bold tabular-nums text-emerald-600">{results.total - results.invalidCount}</span>
                    </div>
                    <div className="bg-red-50 p-4 rounded-2xl text-center">
                      <span className="block text-[9px] uppercase tracking-widest font-bold opacity-40 mb-1 text-red-600/60">Lỗi</span>
                      <span className="text-xl font-bold tabular-nums text-red-500">{results.invalidCount}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-[11px] uppercase tracking-widest font-bold opacity-40 flex items-center gap-2">
                    <Users size={14} />
                    Danh sách ứng cử viên
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {results.candidates.map((c, idx) => (
                      <div key={c.id} className="group">
                        <div className="flex justify-between items-end mb-3 px-1">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold opacity-10 tabular-nums">{(idx + 1).toString().padStart(2, '0')}</span>
                            <span className="text-lg font-bold">{c.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold tabular-nums">{c.votes}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Phiếu</span>
                          </div>
                        </div>
                        <div className="h-4 bg-[#F8F8F6] rounded-full overflow-hidden p-1">
                          <motion.div 
                            className="h-full bg-[#141414] rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${results.total > 0 ? (c.votes / results.total) * 100 : 0}%` }}
                            transition={{ delay: idx * 0.1, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-[#141414]/5 shadow-xl shadow-[#141414]/5">
                  <h3 className="text-[11px] uppercase tracking-widest font-bold opacity-40 mb-10 flex items-center gap-2">
                    <BarChart3 size={14} />
                    Thống kê số lượng bầu
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.stats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="count" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#141414', opacity: 0.3 }}
                        />
                        <YAxis hide />
                        <Tooltip 
                          cursor={{ fill: '#F8F8F6', radius: 12 }}
                          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                          itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                        />
                        <Bar dataKey="frequency" radius={[10, 10, 10, 10]} barSize={32}>
                          {results.stats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#141414' : '#141414/40'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#141414] text-white p-10 rounded-[2.5rem] flex flex-col justify-center items-center text-center shadow-2xl shadow-[#141414]/30">
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10">
                    <ClipboardCheck size={48} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight mb-4">Hoàn tất quy trình</h3>
                  <p className="text-sm font-medium opacity-40 max-w-xs mb-10 leading-relaxed">
                    Dữ liệu đã được lưu trữ và tổng hợp thành công cho đơn vị bầu cử này.
                  </p>
                  <button 
                    onClick={() => setStep('selection')}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-[#141414] px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95"
                  >
                    <ArrowLeft size={16} />
                    Quay lại trang chủ
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <footer className="mt-20 pb-10 text-center space-y-4">
          <div className="flex justify-center gap-4 opacity-10">
            <div className="w-1 h-1 rounded-full bg-[#141414]"></div>
            <div className="w-1 h-1 rounded-full bg-[#141414]"></div>
            <div className="w-1 h-1 rounded-full bg-[#141414]"></div>
          </div>
          <p className="text-[9px] uppercase tracking-[0.4em] font-black opacity-20">
            Ủy ban bầu cử phường Tân Tiến • Bắc Ninh
          </p>
        </footer>
      </div>
    </div>
  );
}
