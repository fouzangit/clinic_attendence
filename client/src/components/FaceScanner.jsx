import React, { useEffect, useState } from 'react';
import { useFaceScanner } from '../hooks/useFaceScanner';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const FaceScanner = ({ onCapture }) => {
  const {
    modelsLoaded, detection, status, error,
    currentChallenge, challengeProgress, verifiedLiveness,
    qualityIssues,
    videoRef, startVideo, stopVideo, handleVideoPlay, captureFrame, reset
  } = useFaceScanner();

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    startVideo();
    return () => stopVideo();
  }, [startVideo, stopVideo]);

  useEffect(() => {
    if (verifiedLiveness && !isProcessing) {
      setIsProcessing(true);
      setTimeout(() => {
        const frame = captureFrame();
        if (frame) onCapture(frame);
      }, 800);
    }
  }, [verifiedLiveness, isProcessing, captureFrame, onCapture]);

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 rounded-[40px] border border-red-500/20">
        <p className="text-red-400 font-bold mb-4">{error}</p>
        <button onClick={startVideo} className="text-white bg-red-600 px-6 py-2 rounded-xl text-xs font-black uppercase">Retry</button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* MINIMALIST SCANNER CONTAINER */}
      <div className="relative w-full aspect-square md:aspect-[4/3] max-w-xl rounded-[50px] overflow-hidden bg-black border-[6px] border-white/5 shadow-2xl group transition-all duration-500">
        
        {/* VIDEO FEED */}
        <video
          ref={videoRef}
          onPlay={handleVideoPlay}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover mirror scale-105"
        />

        {/* AI OVERLAY */}
        <div className="absolute inset-0 pointer-events-none">
          {/* VIGNETTE */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          
          {/* SCAN FRAME (FACE ID STYLE) */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 border-2 transition-all duration-1000 ${verifiedLiveness ? 'border-emerald-500 rounded-full scale-110' : 'border-white/20 rounded-[80px]'}`}>
             {!verifiedLiveness && <div className="absolute inset-0 scan-line rounded-[80px]" />}
             
             {/* CORNERS */}
             <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl" />
             <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl" />
             <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl" />
             <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-2xl" />
          </div>
        </div>

        {/* CHALLENGE UI */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-center z-20">
           {!verifiedLiveness ? (
             <div className="space-y-4">
               {qualityIssues.length > 0 ? (
                 <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-xl border border-amber-500/20 px-6 py-3 rounded-2xl animate-pulse">
                   <FaExclamationCircle className="text-amber-500" />
                   <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">{qualityIssues[0]}</span>
                 </div>
               ) : (
                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">AI Biometric Check</p>
                    <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic italic-bold">{currentChallenge?.label}</h3>
                    <div className="w-32 mx-auto h-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${challengeProgress}%` }} />
                    </div>
                 </div>
               )}
             </div>
           ) : (
             <div className="animate-in zoom-in duration-500 py-4">
                <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.5)] mb-4">
                   <FaCheckCircle className="text-3xl text-white" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-widest">Verified</h3>
             </div>
           )}
        </div>

        {/* LOADING SHADE */}
        {!modelsLoaded && (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
             <div className="w-12 h-12 border-2 border-blue-600 border-t-white rounded-full animate-spin mb-4" />
             <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Initializing Biometric Module</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <button onClick={reset} className="text-white/20 hover:text-white/40 text-[10px] font-black uppercase tracking-widest transition-colors">Reset AI Scan</button>
      </div>
    </div>
  );
};

export default FaceScanner;
