import React, { useEffect, useState } from 'react';
import { useFaceScanner } from '../hooks/useFaceScanner';
import { FaExclamationCircle, FaCheckCircle, FaUserShield, FaVideo, FaSyncAlt, FaShieldAlt } from 'react-icons/fa';



const FaceScanner = ({ onCapture }) => {
  const {
    modelsLoaded, detection, confidence, status, error,
    currentChallenge, challengeProgress, verifiedLiveness,
    qualityScore, qualityIssues,
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
      }, 1200);
    }
  }, [verifiedLiveness, isProcessing, captureFrame, onCapture]);

  if (error) {
    return (
      <div className="bg-red-950/40 border-2 border-red-500/30 p-12 rounded-[50px] text-center space-y-6 backdrop-blur-3xl shadow-2xl">
        <div className="text-7xl animate-pulse">📡</div>
        <h3 className="text-2xl font-black text-red-400 tracking-tight uppercase">Encryption Link Failed</h3>
        <p className="text-red-300/60 text-sm max-w-xs mx-auto font-medium">{error}</p>
        <button onClick={startVideo} className="bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-2xl font-black shadow-xl transition-all uppercase text-xs tracking-widest">Re-establish Link</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      {/* BIOMETRIC SCANNER HUB */}
      <div className="relative w-full aspect-square md:aspect-[16/10] rounded-[60px] md:rounded-[80px] overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.15)] bg-slate-950 border-[8px] border-white/5 group">
        
        {/* RAW VIDEO FEED */}
        <video
          ref={videoRef}
          onPlay={handleVideoPlay}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover mirror opacity-70 scale-105"
        />

        {/* AI SCANNER INTERFACE */}
        <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-transparent to-slate-950/40" />
          
          {/* SCAN FRAME */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] border-[2px] transition-all duration-700 ${verifiedLiveness ? 'border-emerald-500 rounded-full scale-110 shadow-[0_0_60px_rgba(16,185,129,0.4)]' : 'border-blue-500/30 rounded-[60px]'}`}>
             {!verifiedLiveness && <div className="scan-line" />}
             {/* CORNER ACCENTS */}
             <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-3xl" />
             <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-3xl" />
             <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-3xl" />
             <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-3xl" />
          </div>
        </div>

        {/* LOADING ENGINE */}
        {!modelsLoaded && (
          <div className="absolute inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 border-4 border-blue-600 border-t-white rounded-full animate-spin mb-10 shadow-[0_0_40px_rgba(37,99,235,0.4)]" />
            <h2 className="text-white text-3xl font-black uppercase tracking-widest mb-3">Syncing Neural Core</h2>
            <p className="text-blue-500/60 font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">Loading Biometric Modules v4.0</p>
          </div>
        )}

        {/* REAL-TIME TRACKING OVERLAY */}
        {detection && !verifiedLiveness && (
          <div 
            className="absolute border-2 border-blue-400/20 bg-blue-500/5 rounded-2xl z-20 pointer-events-none transition-all duration-75"
            style={{
              left: `${detection.x}px`,
              top: `${detection.y}px`,
              width: `${detection.width}px`,
              height: `${detection.height}px`,
              transform: 'scaleX(-1)'
            }}
          >
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400 rounded-tl-lg" />
          </div>
        )}

        {/* TOP HUD (Security Stats) */}
        <div className="absolute top-8 left-8 right-8 z-40 flex justify-between items-start">
           <div className="space-y-2">
             <div className="bg-black/40 backdrop-blur-2xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3">
               <div className={`w-2 h-2 rounded-full animate-pulse ${confidence > 90 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
               <span className="text-white font-black text-[10px] uppercase tracking-widest">Confidence: {confidence}%</span>
             </div>
             
             <div className="bg-black/40 backdrop-blur-2xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3">
               <div className={`w-2 h-2 rounded-full ${qualityScore > 80 ? 'bg-emerald-400' : 'bg-red-400'}`} />
               <span className="text-white font-black text-[10px] uppercase tracking-widest">Quality: {qualityScore}%</span>
             </div>
           </div>
           
           <div className="bg-emerald-600/10 backdrop-blur-2xl border border-emerald-500/30 px-5 py-2.5 rounded-2xl flex items-center gap-2">
             <FaShieldAlt className="text-emerald-400 text-lg" />

             <div className="text-left">
                <p className="text-emerald-400 font-black text-[8px] uppercase tracking-widest leading-none">Status</p>
                <p className="text-white font-black text-[10px] uppercase tracking-widest">Secured</p>
             </div>
           </div>
        </div>

        {/* CHALLENGE HUB (Bottom Section) */}
        <div className="absolute bottom-0 left-0 w-full z-30 p-10 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
          <div className="max-w-sm mx-auto text-center">
             {!verifiedLiveness ? (
               <div className="space-y-6">
                 {qualityIssues.length > 0 ? (
                   <div className="flex items-center justify-center gap-3 text-amber-400 bg-amber-400/10 py-3 px-6 rounded-2xl border border-amber-400/20 animate-pulse">
                     <FaExclamationCircle className="text-xl shrink-0" />
                     <p className="text-sm font-black uppercase tracking-tight">{qualityIssues[0]}</p>
                   </div>
                 ) : (
                   <div className="space-y-4">
                     <div className="text-6xl animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{currentChallenge?.icon}</div>
                     <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">{currentChallenge?.label}</h3>
                     <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-blue-500 transition-all duration-700 shadow-[0_0_15px_rgba(59,130,246,0.5)]" style={{ width: `${challengeProgress}%` }} />
                     </div>
                   </div>
                 )}
               </div>
             ) : (
               <div className="space-y-5 py-4 animate-in zoom-in duration-500">
                 <div className="inline-flex bg-emerald-500 p-5 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.6)]">
                   <FaCheckCircle className="text-5xl text-white" />
                 </div>
                 <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Verified</h3>
                 <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Identity Multi-Frame Verified</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* FOOTER SPECS */}
      <div className="mt-12 w-full grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
         {[
           { icon: <FaVideo />, label: 'FPS', value: '30.2' },
           { icon: <FaUserShield />, label: 'Encryption', value: 'SHA-256' },
           { icon: <FaShieldAlt />, label: 'Protocol', value: 'BioAuth v4' },

           { icon: <FaSyncAlt />, label: 'Samples', value: '10 Avg' }
         ].map((spec, i) => (
           <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-3xl text-center">
             <div className="text-blue-500 mb-2 flex justify-center">{spec.icon}</div>
             <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">{spec.label}</p>
             <p className="text-xs font-black text-white uppercase mt-0.5">{spec.value}</p>
           </div>
         ))}
      </div>
      
      <button onClick={reset} className="mt-10 text-white/20 hover:text-white/40 font-black uppercase text-[10px] tracking-[0.3em] transition-all">Reset Biometric Stream</button>
    </div>
  );
};

export default FaceScanner;
