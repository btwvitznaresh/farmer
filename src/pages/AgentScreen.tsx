import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, PhoneOff, Volume2, VolumeX, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { getNvidiaTts } from '@/lib/apiClient';
import { toast } from 'sonner';
import { callArjunAgent, fetchArjunGreeting } from '@/agent/ArjunApiClient';
import {
    AgentMemory,
    defaultMemory,
    saveMemory,
    loadMemory,
    clearMemory,
    getMemorySummary
} from '@/agent/AgentMemory';
import type { ConversationMessage } from '@/lib/apiClient';

type AgentState = 'connecting' | 'idle' | 'listening' | 'thinking' | 'speaking' | 'empathy';
type AvatarMood = 'calm' | 'listening' | 'thinking' | 'happy' | 'concerned';

interface IWindow { webkitSpeechRecognition: any; SpeechRecognition: any; }

// ── Avatar Ring Component ───────────────────────────────────────────────────
function AvatarRing({ state, mood }: { state: AgentState; mood: AvatarMood }) {
    const ringColor = {
        calm: 'rgba(118,185,0,0.4)',
        listening: 'rgba(239,68,68,0.5)',
        thinking: 'rgba(99,102,241,0.4)',
        happy: 'rgba(251,191,36,0.5)',
        concerned: 'rgba(249,115,22,0.4)',
    }[mood];

    const isAnimating = state === 'listening' || state === 'speaking' || state === 'thinking';

    return (
        <div className="relative flex items-center justify-center">
            {/* Outer pulse rings */}
            {isAnimating && (
                <>
                    <div
                        className="absolute rounded-full animate-ping opacity-20"
                        style={{ width: 220, height: 220, background: ringColor, animationDuration: '2s' }}
                    />
                    <div
                        className="absolute rounded-full animate-ping opacity-10"
                        style={{ width: 260, height: 260, background: ringColor, animationDuration: '2.5s', animationDelay: '0.5s' }}
                    />
                </>
            )}

            {/* Avatar circle */}
            <div
                className="relative rounded-full flex items-center justify-center transition-all duration-700"
                style={{
                    width: 180,
                    height: 180,
                    background: `radial-gradient(circle at 40% 35%, #2a3a1a, #111)`,
                    border: `2px solid ${ringColor}`,
                    boxShadow: `0 0 40px ${ringColor}, 0 0 80px ${ringColor}30`
                }}
            >
                {/* Arjun initials / avatar */}
                <div className="flex flex-col items-center gap-1 select-none">
                    <span className="text-5xl font-black" style={{ color: '#76b900', textShadow: '0 0 20px #76b90060' }}>A</span>
                    <span className="text-[10px] tracking-[0.3em] font-bold text-white/40 uppercase">Arjun</span>
                </div>

                {/* State overlay */}
                {state === 'thinking' && (
                    <div className="absolute inset-0 rounded-full bg-indigo-500/5 animate-pulse" />
                )}
                {state === 'empathy' && (
                    <div className="absolute inset-0 rounded-full bg-orange-500/5 animate-pulse" />
                )}
            </div>
        </div>
    );
}

// ── Waveform Component ──────────────────────────────────────────────────────
function Waveform({ state }: { state: AgentState }) {
    const active = state === 'listening' || state === 'speaking';
    const color = state === 'listening' ? '#ef4444' : '#76b900';

    return (
        <div className="flex items-end justify-center gap-1 h-12 w-48">
            {active ? (
                Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-full"
                        style={{
                            width: 3,
                            background: color,
                            height: '100%',
                            transformOrigin: 'bottom',
                            animation: `arjun-wave 0.9s ease-in-out infinite`,
                            animationDelay: `${i * 0.04}s`,
                            opacity: 0.7 + Math.random() * 0.3
                        }}
                    />
                ))
            ) : (
                <div className="h-px w-32 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
            )}
        </div>
    );
}

// ── State label ─────────────────────────────────────────────────────────────
function StateLabel({ state }: { state: AgentState }) {
    const labels: Record<AgentState, { text: string; color: string }> = {
        connecting: { text: 'CONNECTING...', color: '#ffffff40' },
        idle: { text: 'TAP MIC TO SPEAK', color: '#ffffff30' },
        listening: { text: '● LISTENING', color: '#ef4444' },
        thinking: { text: '◎ THINKING...', color: '#818cf8' },
        speaking: { text: '▶ ARJUN SPEAKING', color: '#76b900' },
        empathy: { text: '◎ UNDERSTANDING...', color: '#f97316' },
    };
    const { text, color } = labels[state];
    return (
        <p className="text-xs font-black tracking-[0.25em] uppercase transition-all duration-500 h-5"
            style={{ color }}>
            {text}
        </p>
    );
}

// ── Action Badge ────────────────────────────────────────────────────────────
function ActionBadge({ action, onClick }: { action: string; onClick: () => void }) {
    const labels: Record<string, string> = {
        BOOK_SERVICE: '📅 Book Field Visit',
        FETCH_MANDI: '📊 View Mandi Prices',
        FETCH_WEATHER: '🌤 Check Weather',
        SHOW_SCHEMES: '🏛 Government Schemes',
        SHOW_SCAN: '🔬 Open Scan Report',
    };
    const label = labels[action];
    if (!label) return null;

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 animate-in slide-in-from-bottom-2 duration-300"
            style={{
                background: 'rgba(118,185,0,0.15)',
                border: '1px solid rgba(118,185,0,0.3)',
                color: '#76b900'
            }}
        >
            {label}
        </button>
    );
}

// ── Main AgentScreen ────────────────────────────────────────────────────────
export default function AgentScreen() {
    const navigate = useNavigate();
    const { language, setLanguage, selectedVoice, isMuted, setIsMuted, weatherData, setConversationHistory } = useApp();

    // Agent state
    const [agentState, setAgentState] = useState<AgentState>('connecting');
    const agentStateRef = useRef<AgentState>('connecting');

    // Memory (loaded from session)
    const [memory, setMemory] = useState<AgentMemory>(() => loadMemory());

    // Conversation
    const [history, setHistory] = useState<ConversationMessage[]>([]);
    const [transcript, setTranscript] = useState('');
    const [subtitles, setSubtitles] = useState('');
    const [pendingActions, setPendingActions] = useState<string[]>([]);
    const [mood, setMood] = useState<AvatarMood>('calm');

    // Memory summary visible on screen
    const [memSummary, setMemSummary] = useState('');

    // Refs
    const isActiveRef = useRef(false);
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const accumulatedRef = useRef('');
    const greetingDoneRef = useRef(false);
    const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

    const setState = (s: AgentState) => {
        agentStateRef.current = s;
        setAgentState(s);
    };

    // Sync state ref
    useEffect(() => { agentStateRef.current = agentState; }, [agentState]);

    // ── Lifecycle ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (greetingDoneRef.current) return;
        isActiveRef.current = true;
        greetingDoneRef.current = true;

        // Clear memory for fresh call session
        const freshMem = defaultMemory();
        freshMem.language = language;
        setMemory(freshMem);
        saveMemory(freshMem);
        setHistory([]);

        const timer = setTimeout(async () => {
            if (!isActiveRef.current) return;

            // Check if coming from crop scan — auto-send disease context
            const prefill = sessionStorage.getItem('arjun_prefill');
            if (prefill) {
                sessionStorage.removeItem('arjun_prefill');
                // Brief acknowledgement first, then process
                const acks: Record<string, string> = {
                    en: "I can see you scanned a crop. Let me look at this...",
                    hi: "मैंने देखा आपने फसल स्कैन की। देखता हूँ...",
                    ta: "பயிர் ஸ்கேன் பண்ணிருக்கீங்க. பாக்கிறேன்...",
                    te: "మీరు పంట స్కాన్ చేశారు. చూస్తాను...",
                    mr: "पिक स्कॅन केलंय. बघतो..."
                };
                await speakText(acks[language] || acks.en);
                // submitToArjun will be called after onSpeakEnd → startListening would fire
                // Instead, queue the prefill for immediate auto-submit
                setTimeout(() => {
                    if (isActiveRef.current) submitToArjun(prefill);
                }, 500);
            } else {
                const greeting = await fetchArjunGreeting(language);
                await speakText(greeting);
            }
        }, 1200);

        return () => {
            isActiveRef.current = false;
            clearTimeout(timer);
            cleanup();
        };
    }, []);

    const cleanup = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
            try { recognitionRef.current.stop(); } catch { }
            recognitionRef.current = null;
        }
        if (ttsAudioRef.current) {
            ttsAudioRef.current.pause();
            ttsAudioRef.current.src = '';
        }
        window.speechSynthesis.cancel();
    };

    const endCall = () => {
        isActiveRef.current = false;
        cleanup();
        navigate(-1);
    };

    // ── Speech Recognition ────────────────────────────────────────────────
    const startListening = useCallback(() => {
        if (!isActiveRef.current) return;
        const Win = window as unknown as IWindow;
        const Recognition = Win.webkitSpeechRecognition || Win.SpeechRecognition;
        if (!Recognition) { toast.error('Speech recognition not supported'); return; }

        cleanup();

        const rec = new Recognition();
        const langMap: Record<string, string> = { hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', mr: 'mr-IN', en: 'en-IN' };
        rec.lang = langMap[language] || 'en-IN';
        rec.continuous = true;
        rec.interimResults = true;

        rec.onstart = () => {
            if (!isActiveRef.current) return;
            setState('listening');
            setMood('listening');
            setTranscript('');
            accumulatedRef.current = '';
        };

        rec.onresult = (event: any) => {
            if (!isActiveRef.current || agentStateRef.current !== 'listening') return;
            let interim = '', final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) final += event.results[i][0].transcript;
                else interim += event.results[i][0].transcript;
            }
            if (final) accumulatedRef.current += final + ' ';
            const full = (accumulatedRef.current + interim).trim();
            setTranscript(full);

            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            if (full.length > 0) {
                silenceTimerRef.current = setTimeout(() => {
                    if (isActiveRef.current && agentStateRef.current === 'listening') {
                        submitToArjun(full);
                    }
                }, 3000);
            }
        };

        rec.onend = () => {
            if (isActiveRef.current && agentStateRef.current === 'listening') {
                try { rec.start(); } catch { }
            }
        };

        rec.onerror = (e: any) => {
            if (e.error === 'no-speech') return;
            console.error('[Arjun] Recognition error:', e.error);
        };

        try { rec.start(); recognitionRef.current = rec; } catch (e) { console.error(e); }
    }, [language]);

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
            try { recognitionRef.current.stop(); } catch { }
            recognitionRef.current = null;
        }
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    // ── Submit to Arjun ───────────────────────────────────────────────────
    const submitToArjun = async (text: string) => {
        if (!isActiveRef.current || !text.trim() || agentStateRef.current !== 'listening') return;

        stopListening();
        setState('thinking');
        setMood('thinking');
        setTranscript('');
        accumulatedRef.current = '';

        // Goodbye detection
        const goodbyeRe = /\b(bye|goodbye|alvida|tata|poitu varen|poitaa|vellostha|avlo)\b/i;
        if (text.trim().split(/\s+/).length <= 8 && goodbyeRe.test(text)) {
            const farewells: Record<string, string> = {
                en: "Goodbye farmer friend! Take care of those crops. Call me anytime!",
                hi: "अलविदा किसान भाई! खेत का ख्याल रखना। जब चाहो बात करो!",
                ta: "போய் வாங்க! பயிரை கவனியுங்க. எப்பவும் பேசலாம்!",
                te: "వెళ్లొస్తారు! పంటను జాగ్రత్తగా చూసుకోండి. ఎప్పుడైనా మాట్లాడవచ్చు!",
                mr: "निरोप! पिकाची काळजी घ्या. केव्हाही बोलत जा!"
            };
            await speakText(farewells[language] || farewells.en, true);
            return;
        }

        const weatherContext = weatherData ? {
            temp: weatherData.current.temperature_2m,
            humidity: weatherData.current.relative_humidity_2m,
            condition: weatherData.current.weather_code
        } : null;

        const result = await callArjunAgent({
            message: text,
            language,
            agentMemory: memory,
            conversationHistory: history,
            weatherContext
        });

        if (!isActiveRef.current) return;

        if (result.success && result.response) {
            // Update memory
            if (result.updatedMemory) {
                const newMem = result.updatedMemory;
                setMemory(newMem);
                saveMemory(newMem);
                setMemSummary(getMemorySummary(newMem));

                // Set language if changed
                if (newMem.language && newMem.language !== language) {
                    setLanguage(newMem.language);
                }

                // Mood from emotional state
                const moodMap: Record<string, AvatarMood> = {
                    happy: 'happy', distressed: 'concerned', worried: 'concerned',
                    frustrated: 'concerned', neutral: 'calm'
                };
                setMood(moodMap[newMem.emotionalState] || 'calm');
            }

            // Update conversation history
            const newHistory: ConversationMessage[] = [
                ...history,
                { role: 'user', content: text },
                { role: 'assistant', content: result.response }
            ].slice(-20);
            setHistory(newHistory);
            setConversationHistory(newHistory);

            // Handle actions
            if (result.actions && result.actions.length > 0) {
                setPendingActions(result.actions);
            }

            await speakText(result.response);
        } else {
            console.error('[Arjun] Failed:', result.error);
            setState('idle');
            setMood('calm');
            startListening();
        }
    };

    // ── TTS Playback ──────────────────────────────────────────────────────
    const speakText = async (text: string, isExit = false) => {
        if (!isActiveRef.current) return;
        setState('speaking');
        setSubtitles(text);

        if (isMuted) {
            setTimeout(() => onSpeakEnd(isExit), 3000);
            return;
        }

        try {
            const blob = await getNvidiaTts(text, language, selectedVoice);
            if (!isActiveRef.current) return;

            if (blob) {
                const url = URL.createObjectURL(blob);
                const audio = new Audio();
                audio.onended = () => { URL.revokeObjectURL(url); onSpeakEnd(isExit); };
                audio.onerror = () => { URL.revokeObjectURL(url); onSpeakEnd(isExit); };
                audio.playbackRate = 1.05;
                ttsAudioRef.current = audio;
                audio.src = url;
                audio.load();
                audio.play().catch(() => onSpeakEnd(isExit));
            } else {
                // Browser TTS fallback
                const utter = new SpeechSynthesisUtterance(text);
                const langMap: Record<string, string> = { hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', mr: 'mr-IN', en: 'en-IN' };
                utter.lang = langMap[language] || 'en-IN';
                utter.onend = () => onSpeakEnd(isExit);
                utter.onerror = () => onSpeakEnd(isExit);
                window.speechSynthesis.speak(utter);
            }
        } catch {
            onSpeakEnd(isExit);
        }
    };

    const onSpeakEnd = (isExit = false) => {
        if (!isActiveRef.current) return;
        setSubtitles('');
        if (isExit) { endCall(); return; }
        setState('idle');
        setMood('calm');
        startListening();
    };

    // ── Action handlers ───────────────────────────────────────────────────
    const handleAction = (action: string) => {
        setPendingActions(prev => prev.filter(a => a !== action));
        switch (action) {
            case 'BOOK_SERVICE': navigate('/services'); break;
            case 'FETCH_MANDI': navigate('/market'); break;
            case 'SHOW_SCHEMES': navigate('/library'); break;
            case 'SHOW_SCAN': navigate('/analyze'); break;
            case 'FETCH_WEATHER': navigate('/'); break;
        }
    };

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-screen bg-black text-white overflow-hidden relative select-none">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-black" />
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 40%, rgba(118,185,0,0.07) 0%, transparent 65%)' }} />

            {/* Header */}
            <header className="flex items-center justify-between px-6 pt-10 pb-4 z-10 relative">
                <button onClick={endCall}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <ArrowLeft size={18} className="text-white/60" />
                </button>

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Sparkles size={10} style={{ color: '#76b900' }} />
                        <span className="text-[9px] font-black tracking-[0.35em] uppercase" style={{ color: '#76b900' }}>
                            LIVE SESSION
                        </span>
                    </div>
                    <h1 className="text-lg font-black text-white tracking-tight">Arjun</h1>
                    <p className="text-[10px] text-white/30 tracking-wider">AgroTalk Agronomist</p>
                </div>

                <button onClick={() => setIsMuted(!isMuted)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
                    style={{ background: isMuted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white/60" />}
                </button>
            </header>

            {/* Memory context pill */}
            {memSummary && (
                <div className="z-10 relative mx-6 mb-2">
                    <div className="text-[10px] text-white/25 text-center truncate px-4">{memSummary}</div>
                </div>
            )}

            {/* Avatar area */}
            <div className="flex-1 flex flex-col items-center justify-center z-10 relative gap-8">
                <AvatarRing state={agentState} mood={mood} />

                {/* State label */}
                <StateLabel state={agentState} />

                {/* Waveform */}
                <Waveform state={agentState} />
            </div>

            {/* Subtitles / Transcript */}
            <div className="z-20 relative px-6 min-h-[72px] flex items-end justify-center pb-2">
                {(subtitles || transcript) && (
                    <div className="max-w-sm text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <span className="text-base font-medium leading-relaxed"
                            style={{
                                color: subtitles ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
                                background: 'rgba(0,0,0,0.6)',
                                padding: '8px 16px',
                                borderRadius: 14,
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                display: 'inline-block'
                            }}>
                            {subtitles || transcript}
                        </span>
                    </div>
                )}
            </div>

            {/* Action badges */}
            {pendingActions.length > 0 && (
                <div className="z-20 relative flex flex-wrap justify-center gap-2 px-6 pb-3">
                    {pendingActions.map(action => (
                        <ActionBadge key={action} action={action} onClick={() => handleAction(action)} />
                    ))}
                </div>
            )}

            {/* Bottom controls */}
            <div className="z-10 relative pb-14 pt-4 px-8">
                <div className="flex items-center justify-center gap-12 max-w-xs mx-auto">
                    {/* End call */}
                    <button onClick={endCall}
                        className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90"
                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <PhoneOff size={22} style={{ color: '#ef4444' }} />
                    </button>

                    {/* Mic button */}
                    <button
                        onClick={() => {
                            if (agentState === 'listening') { stopListening(); setState('idle'); }
                            else if (agentState === 'idle') startListening();
                        }}
                        disabled={agentState === 'connecting' || agentState === 'thinking' || agentState === 'speaking'}
                        className="w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-90"
                        style={{
                            background: agentState === 'listening'
                                ? 'rgba(239,68,68,0.8)'
                                : 'rgba(118,185,0,0.2)',
                            border: `2px solid ${agentState === 'listening' ? 'rgba(239,68,68,0.6)' : 'rgba(118,185,0,0.4)'}`,
                            boxShadow: agentState === 'listening' ? '0 0 30px rgba(239,68,68,0.3)' : '0 0 20px rgba(118,185,0,0.15)',
                            opacity: (agentState === 'connecting' || agentState === 'thinking' || agentState === 'speaking') ? 0.35 : 1,
                            cursor: (agentState === 'connecting' || agentState === 'thinking' || agentState === 'speaking') ? 'not-allowed' : 'pointer'
                        }}>
                        <Mic size={30} className="text-white" />
                    </button>

                    {/* Spacer */}
                    <div className="w-14 h-14" />
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes arjun-wave {
                    0%, 100% { transform: scaleY(0.3); }
                    50% { transform: scaleY(1); }
                }
            `}</style>
        </div>
    );
}
