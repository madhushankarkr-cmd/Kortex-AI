import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Shield, Cpu, Activity, Clock, ChevronRight, Calendar, Mic, Paperclip, CheckCircle2, Sparkles, Wifi, Power, AlertTriangle, Crosshair, Aperture, BarChart3, Lock, Zap, Layers, Globe, Radio } from 'lucide-react';


const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
    
    .font-sci-fi { font-family: 'Rajdhani', sans-serif; }
    .font-mono-sci { font-family: 'Share Tech Mono', monospace; }
    
    /* ANIMATIONS */
    .animate-scanline {
      animation: scanline 6s linear infinite;
    }
    @keyframes scanline {
      0% { transform: translateY(-100%); opacity: 0.5; }
      50% { opacity: 0.2; }
      100% { transform: translateY(100vh); opacity: 0.5; }
    }

    .animate-spin-slow { animation: spin 10s linear infinite; }
    .animate-spin-slower { animation: spin 20s linear infinite; }
    .animate-spin-reverse { animation: spin-rev 15s linear infinite; }
    .animate-spin-fast { animation: spin 3s linear infinite; }
    
    @keyframes spin { 100% { transform: rotate(360deg); } }
    @keyframes spin-rev { 100% { transform: rotate(-360deg); } }

    .glitch-hover:hover {
      animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
      color: #06b6d4;
    }
    @keyframes glitch {
      0% { transform: translate(0); }
      20% { transform: translate(-2px, 2px); }
      40% { transform: translate(-2px, -2px); }
      60% { transform: translate(2px, 2px); }
      80% { transform: translate(2px, -2px); }
      100% { transform: translate(0); }
    }
    
    .scrollbar-hide::-webkit-scrollbar { display: none; }
  `}</style>
);

const playSound = (type) => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  if (type === 'hover') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === 'success') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'boot') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  }
};


const MOCK_SCENARIOS = {
  attendance: {
    steps: [
      { type: 'info', msg: '>> INITIALIZING ATTENDANCE_PROTOCOL_V4...' },
      { type: 'gemini', msg: '>> GEMINI_CORE: PARSING INTENT [GET_ATTENDANCE]' },
      { type: 'puppeteer', msg: '>> NET_LINK: TARGET [portal.gla.ac.in] LOCKED' },
      { type: 'success', msg: '>> AUTH_HANDSHAKE: TOKEN [82910] VERIFIED' },
      { type: 'puppeteer', msg: '>> DOM_PARSER: EXTRACTING TABLE DATA...' },
      { type: 'sync', msg: '>> UPLINK: SYNCING FIREBASE SHARD [44ms]' },
      { type: 'done', msg: '>> OPERATION COMPLETE' }
    ],
    response: "ATTENDANCE MATRIX RETRIEVED.\n\n[CRITICAL] Mathematics: 74%\n[OPTIMAL] Data Structures: 88%\n[OPTIMAL] OS: 92%\n\nDIRECTIVE: Attend next 2 sessions to resolve critical status."
  },
  leave: {
    steps: [
      { type: 'info', msg: '>> PROTOCOL START: LEAVE_REQ' },
      { type: 'gemini', msg: '>> INTENT: APPLY_LEAVE [TYPE: SICK]' },
      { type: 'puppeteer', msg: '>> NAV: E-FORMS MODULE ACCESSED' },
      { type: 'puppeteer', msg: '>> INPUT: AUTO-FILLING FORM [Medical]' },
      { type: 'success', msg: '>> ASSET: SIGNATURE_KEY ATTACHED' },
      { type: 'done', msg: '>> TRANSMISSION: PACKET SENT TO HOD' }
    ],
    response: "LEAVE APPLICATION DISPATCHED.\n\nCATEGORY: Medical\nDURATION: 48 Hours\nREF_ID: #LVE-992\nSTATUS: Awaiting Admin Handshake."
  },
  greeting: {
    steps: [{ type: 'info', msg: '>> SYS: HANDSHAKE INITIATED' }, { type: 'done', msg: '>> SYS: READY' }],
    response: "KORTEX NEURAL LINK ESTABLISHED.\n\nMODULES ACTIVE:\n> Attendance Monitoring\n> Grade Analysis\n> Vision Interpretation\n> Auto-Drafting\n\nAwaiting Directive."
  },
  vision_analysis: {
    steps: [
      { type: 'info', msg: '>> UPLOAD: BUFFERING IMAGE STREAM...' },
      { type: 'gemini', msg: '>> GEMINI_VISION: PIXEL MATRIX ANALYSIS' },
      { type: 'gemini', msg: '>> OCR: TEXT_LAYER EXTRACTED [Viral Fever]' },
      { type: 'puppeteer', msg: '>> FORM: INJECTING REASON CODE...' },
      { type: 'done', msg: '>> STATUS: READY FOR CONFIRMATION' }
    ],
    response: "VISUAL DATA PARSED.\n\nDIAGNOSIS: Viral Fever detected.\nACTION: Drafted 3-Day Leave Request.\n\nConfirm transmission?"
  },
  study_help: {
    steps: [
      { type: 'info', msg: '>> INIT PROTOCOL: KNOWLEDGE_BASE' },
      { type: 'gemini', msg: '>> GEMINI: MODE [TUTOR]' },
      { type: 'gemini', msg: '>> GEN: COMPILING EXPLANATION...' },
      { type: 'done', msg: '>> STATUS: OUTPUT READY' }
    ],
    response: "TOPIC: DEADLOCK\n\nDEFINITION: A state where processes map to a circular wait condition.\n\nCONDITIONS:\n1. Mutual Exclusion\n2. Hold & Wait\n3. No Preemption\n4. Circular Wait\n\n[QUERY] Load code example?"
  },
  email_draft: {
    steps: [
      { type: 'info', msg: '>> INIT PROTOCOL: DRAFT_GEN' },
      { type: 'gemini', msg: '>> GEMINI: INTENT [DRAFT_EMAIL]' },
      { type: 'gemini', msg: '>> GEN: SYNTHESIZING TEXT...' },
      { type: 'done', msg: '>> STATUS: DRAFT READY' }
    ],
    response: "EMAIL DRAFT:\n\nTO: HOD_CS\nSUB: Sick Leave Application\n\nBODY:\nRespectfully stating that due to viral fever diagnosis (doc attached), I request leave for 3 days.\n\n[END TRANSMISSION]"
  },
  unknown: {
    steps: [{ type: 'error', msg: '>> ERR: INTENT UNRECOGNIZED' }],
    response: "COMMAND SYNTAX ERROR.\n\nValid Protocols:\n- Check Attendance\n- Analyze Results\n- Upload Medical Slip"
  }
};



const TypingEffect = ({ text }) => {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setDisplay(prev => prev + text.charAt(i));
      i++;
      if(i >= text.length) clearInterval(t);
    }, 12);
    return () => clearInterval(t);
  }, [text]);
  return <span className="font-mono-sci leading-relaxed tracking-wide text-cyan-50">{display}</span>;
};


const HolographicGlobe = () => {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center perspective-1000">
      {/* Base Glow */}
      <div className="absolute inset-0 rounded-full bg-cyan-500/5 blur-xl"></div>
      
      {/* Outer Pulse Ring */}
      <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-20"></div>
      
      {/* Rotating SVG Wireframe */}
      <svg className="w-full h-full animate-spin-slower" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="globeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#06b6d4', stopOpacity:0.1}} />
            <stop offset="100%" style={{stopColor:'#06b6d4', stopOpacity:0.4}} />
          </linearGradient>
        </defs>
        
        {/* Core Sphere */}
        <circle cx="50" cy="50" r="18" fill="url(#globeGrad)" className="animate-pulse" />
        
        {/* Longitudinal Rings */}
        <ellipse cx="50" cy="50" rx="42" ry="12" stroke="#06b6d4" strokeWidth="0.5" fill="none" className="opacity-40" />
        <ellipse cx="50" cy="50" rx="42" ry="12" stroke="#06b6d4" strokeWidth="0.5" fill="none" className="opacity-40" transform="rotate(60 50 50)" />
        <ellipse cx="50" cy="50" rx="42" ry="12" stroke="#06b6d4" strokeWidth="0.5" fill="none" className="opacity-40" transform="rotate(120 50 50)" />
        
        {/* Latitudinal Rings */}
        <circle cx="50" cy="50" r="42" stroke="#06b6d4" strokeWidth="0.5" fill="none" className="opacity-20" strokeDasharray="4 4" />
      </svg>

      {/* Orbiting Satellites */}
      <div className="absolute inset-0 animate-spin-fast">
         <div className="absolute top-2 left-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#06b6d4] transform -translate-x-1/2"></div>
      </div>
      <div className="absolute inset-4 animate-spin-reverse">
         <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444] transform -translate-x-1/2"></div>
      </div>
    </div>
  );
};


const BootScreen = ({ onComplete }) => {
  const [lines, setLines] = useState([]);
  
  useEffect(() => {
    const bootLines = [
      "INITIALIZING KORTEX KERNEL v1.0.4...",
      "LOADING NEURAL MODULES... [OK]",
      "ESTABLISHING SECURE HANDSHAKE... [OK]",
      "MOUNTING FILE SYSTEM... [OK]",
      "CONNECTING TO GEMINI 1.5 FLASH... [OK]",
      "CALIBRATING PUPPETEER DRIVERS... [OK]",
      "SYSTEM READY."
    ];

    let i = 0;
    const t = setInterval(() => {
      if (i < bootLines.length) {
        setLines(prev => [...prev, bootLines[i]]);
        playSound('hover');
        i++;
      } else {
        clearInterval(t);
        playSound('boot');
        setTimeout(onComplete, 800);
      }
    }, 400);

    return () => clearInterval(t);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center font-mono-sci text-cyan-500">
      <div className="w-96 p-6 border border-cyan-800 bg-[#050a14] relative overflow-hidden rounded-[2rem]">
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 animate-pulse"></div>
        {lines.map((l, i) => (
          <div key={i} className="mb-2 text-xs tracking-wider opacity-80">{l}</div>
        ))}
        <div className="mt-4 h-1 w-full bg-cyan-900/30 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500 animate-[width_3s_ease-out_forwards]" style={{width: `${(lines.length / 7) * 100}%`}}></div>
        </div>
      </div>
    </div>
  );
};


const App = () => {
  const [booted, setBooted] = useState(false);
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([{ sender: 'bot', text: 'Successfully Connected To GLA Portal...' }]);
  const [logs, setLogs] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef(null);
  const logRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    logRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, logs]);

  const handleSend = async (txt = input) => {
    if (!txt.trim()) return;
    
    // 1. UI Updates
    playSound('success');
    setInput('');
    setChat(prev => [...prev, { sender: 'user', text: txt }]);
    setProcessing(true);
    setLogs([]); // Clear previous logs

    // 2. Start Sci-Fi Loading Animation (Immediate Visual Feedback)
    const initialSteps = [
      { type: 'info', msg: '>> INITIALIZING NEURAL LINK...' },
      { type: 'sync', msg: '>> UPLINK: ENCRYPTING PACKET [AES-256]' },
      { type: 'puppeteer', msg: '>> NET: PINGING HOST [localhost:3000]' }
    ];
    
    for (const step of initialSteps) {
      setLogs(prev => [...prev, step]);
      await new Promise(r => setTimeout(r, 300)); // Small delay for effect
    }

    try {
      // 3. ATTEMPT REAL BACKEND CONNECTION
      const response = await fetch('https://devoid-uncontrollably-aurora.ngrok-free.dev/api/chat', { // USE YOUR NGROK LINK HERE
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: txt })
      });

      if (!response.ok) throw new Error("Backend Unreachable");

      const data = await response.json();

      // 4. Success: Show Real Response
      setLogs(prev => [...prev, { type: 'success', msg: '>> DATA_PACKET: RECEIVED [200 OK]' }]);
      setChat(prev => [...prev, { sender: 'bot', text: data.botReply, isNew: true }]);

    } catch (error) {
      // 5. FALLBACK TO DEMO MODE (If Backend Fails)
      console.warn("Backend failed, switching to Simulation Mode");
      setLogs(prev => [...prev, { type: 'error', msg: '>> WARN: CONNECTION UNSTABLE. ENGAGING SIMULATION CORE.' }]);
      
      const lower = txt.toLowerCase();
      let key = 'unknown';
      if (lower.includes('attend')) key = 'attendance';
      else if (lower.includes('leave') || lower.includes('sick')) key = 'leave';
      else if (lower.includes('grade') || lower.includes('mark')) key = 'grades';
      else if (lower.includes('draft')) key = 'email_draft';
      else if (lower.includes('analyze')) key = 'vision_analysis';

      const scenario = MOCK_SCENARIOS[key] || MOCK_SCENARIOS['unknown'];
      
      // Play the specific scenario steps
      for (const step of scenario.steps) {
        await new Promise(r => setTimeout(r, 400));
        setLogs(prev => [...prev, step]);
      }
      setChat(prev => [...prev, { sender: 'bot', text: scenario.response, isNew: true }]);
    }

    setProcessing(false);
  };
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice not supported. Use Chrome.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    setListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  if (!booted) return <BootScreen onComplete={() => setBooted(true)} />;

  return (
    <div className="min-h-screen bg-[#020408] text-cyan-500 font-sci-fi overflow-hidden relative selection:bg-cyan-500/20 selection:text-white">
      <GlobalStyles />
      
      {/* BACKGROUND FX */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>
      <div className="absolute w-full h-[4px] bg-cyan-500/10 animate-scanline pointer-events-none z-0 blur-[4px]"></div>

      {/* MAIN UI */}
      <div className="flex h-screen p-4 gap-4 relative z-10">
        
        {/* LEFT COL */}
        <div className="w-64 hidden md:flex flex-col gap-4">
          <div className="bg-[#050a14]/80 border border-cyan-900/50 p-4 rounded-[2rem] relative group hover:border-cyan-500/50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-cyan-900/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                <Shield size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="text-xl font-bold tracking-widest text-white glitch-hover">AXIOM</div>
                <div className="text-[10px] text-cyan-600 font-mono-sci tracking-widest">PRIVACY PROTECTED</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] tracking-wider text-gray-400"><span>ENCRYPTION</span><span>AES-256</span></div>
              <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden"><div className="w-full h-full bg-cyan-500 animate-pulse"></div></div>
            </div>
          </div>

          <div className="flex-1 bg-[#050a14]/80 border border-cyan-900/50 p-4 relative flex flex-col gap-4 rounded-[2rem]">
             <div className="text-xs font-bold tracking-[0.2em] text-cyan-700 mb-2 border-b border-cyan-900/50 pb-2">DIAGNOSTICS</div>
             {[
               { l: 'ATTENDANCE', v: '85%', c: 'text-cyan-400' },
               { l: 'LIVE_DATE', v: new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'short'}).toUpperCase(), c: 'text-blue-400' },
               { l: 'EXAM_SCHED', v: '15 AUG', c: 'text-green-400' }
             ].map((s,i) => (
               <div key={i} className="flex justify-between items-center bg-black/40 p-3 rounded-full border border-cyan-900/50 hover:border-cyan-400 transition-colors cursor-default" onMouseEnter={()=>playSound('hover')}>
                 <span className="text-[10px] font-mono-sci text-gray-500">{s.l}</span>
                 <span className={`text-sm font-bold font-mono-sci ${s.c}`}>{s.v}</span>
               </div>
             ))}
             
             {/* HOLOGRAPHIC GLOBE CONTAINER */}
             <div className="mt-auto flex flex-col items-center gap-4 py-4 relative">
                <HolographicGlobe />
                <div className="text-[10px] text-cyan-800 tracking-[0.2em] font-mono-sci animate-pulse">GLOBAL_LINK_STABLE</div>
             </div>
          </div>
        </div>

        {/* CENTER COL */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 bg-[#03060a]/90 border border-cyan-500/20 backdrop-blur-sm flex flex-col relative overflow-hidden rounded-[2.5rem]">
            <div className="h-16 border-b border-cyan-500/20 bg-cyan-900/10 flex items-center justify-between px-8">
              <div className="flex items-center gap-3">
                <Aperture className="text-cyan-400 animate-spin-slow" size={24} />
                <span className="text-2xl font-bold tracking-[0.2em] text-white glitch-hover">KORTEX.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono-sci text-cyan-600 animate-pulse">LIVE_FEED</span>
                <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto space-y-6 relative z-10 scrollbar-hide">
              {chat.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-5 border relative rounded-[1.5rem] ${
                    msg.sender === 'user' 
                      ? 'bg-cyan-900/20 border-cyan-500/50 text-right rounded-br-md' 
                      : 'bg-gray-900/40 border-gray-700/50 text-left rounded-bl-md'
                  }`}>
                    <div className={`text-[8px] tracking-[0.2em] mb-1 font-mono-sci ${msg.sender==='user'?'text-cyan-400':'text-orange-400'}`}>
                      {msg.sender === 'user' ? 'CMD_INPUT' : 'KORTEX_RESP'}
                    </div>
                    {msg.sender === 'bot' && msg.isNew ? <TypingEffect text={msg.text} /> : <span className="font-mono-sci text-sm text-cyan-50">{msg.text}</span>}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="p-6 bg-black/80 border-t border-cyan-500/30 flex items-center gap-4">
              <button onClick={() => handleSend("Analyze this medical slip")} className="w-12 h-12 border border-cyan-800 bg-cyan-900/10 flex items-center justify-center rounded-full hover:bg-cyan-500/20 hover:border-cyan-400 transition-all text-cyan-600">
                <Paperclip size={20} />
              </button>
              <div className="flex-1 bg-cyan-900/5 border border-cyan-800 flex items-center px-6 h-14 relative overflow-hidden rounded-full focus-within:border-cyan-400 transition-colors">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="ENTER COMMAND..." 
                  className="bg-transparent w-full text-cyan-100 placeholder:text-cyan-800 font-mono-sci tracking-wider outline-none z-10 text-lg"
                />
              </div>
              <button onClick={startListening} className={`w-12 h-12 border border-cyan-800 flex items-center justify-center rounded-full hover:bg-cyan-500/20 hover:border-cyan-400 transition-all ${listening ? 'bg-red-900/50 animate-pulse border-red-500 text-red-500' : 'text-cyan-600'}`}>
                <Mic size={20} />
              </button>
              <button onClick={() => handleSend()} disabled={processing} className="h-14 px-8 bg-cyan-600/20 border border-cyan-500 text-cyan-400 font-bold tracking-widest hover:bg-cyan-500 hover:text-black transition-all rounded-full">
                EXECUTE
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COL */}
        <div className="w-80 hidden lg:flex flex-col gap-4">
          <div className="flex-1 bg-black/80 border-l border-cyan-500/20 relative flex flex-col rounded-[2rem] overflow-hidden">
            <div className="p-4 border-b border-cyan-900/30 bg-cyan-950/10 flex justify-between items-center">
              <span className="text-[10px] font-mono-sci tracking-[0.2em] text-gray-500">KERNEL_LOG</span>
              <Activity size={14} className="text-cyan-600" />
            </div>
            <div className="flex-1 p-5 font-mono-sci text-[10px] overflow-y-auto space-y-3 scrollbar-hide text-cyan-300/80">
              <div className="text-gray-600 mb-4 pb-2 border-b border-gray-800">
                // SYSTEM READY<br/>
                // UPLINK: STABLE<br/>
              </div>
              {logs.map((l, i) => (
                <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  <span className="text-gray-600">[{new Date().toLocaleTimeString('en-US',{hour12:false})}]</span>
                  <span className={l.type === 'error' ? 'text-red-500' : l.type === 'success' ? 'text-green-400' : 'text-cyan-100'}>{l.msg}</span>
                </div>
              ))}
              <div ref={logRef} />
              {processing && <span className="animate-pulse text-cyan-500">_</span>}
            </div>
          </div>
          
          <div className="h-64 bg-[#050a14]/80 border border-cyan-900/50 p-5 relative overflow-hidden rounded-[2rem]">
             <div className="flex justify-between items-end mb-4 border-b border-cyan-900/50 pb-2">
                <span className="text-xs font-bold tracking-widest text-cyan-100">UPCOMING</span>
                <Radio size={14} className="text-cyan-600 animate-pulse" />
             </div>
             <div className="space-y-4">
               {[
                 { time: '09:00', event: 'Data Structures', loc: 'LH-5', status: 'DONE' },
                 { time: '11:00', event: 'Operating Sys', loc: 'LH-3', status: 'ACTIVE' },
                 { time: '14:00', event: 'AI Lab', loc: 'LAB-2', status: 'PENDING' }
               ].map((e, i) => (
                 <div key={i} className="flex gap-3 items-center group cursor-default">
                   <div className={`text-[10px] font-mono-sci ${e.status === 'ACTIVE' ? 'text-white' : 'text-gray-600'}`}>{e.time}</div>
                   <div className="w-1 h-8 bg-cyan-900 group-hover:bg-cyan-500 transition-colors rounded-full"></div>
                   <div>
                     <div className={`text-xs font-bold ${e.status === 'ACTIVE' ? 'text-cyan-400' : 'text-gray-400'}`}>{e.event}</div>
                     <div className="text-[10px] text-gray-600">{e.loc}</div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;