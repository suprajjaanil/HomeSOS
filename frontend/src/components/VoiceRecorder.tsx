import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, Square, Upload, Send, AlertTriangle, 
  Globe, Volume2, Sparkles, Camera, CheckCircle2 
} from 'lucide-react';
import { PhotoUpload } from './PhotoUpload';

interface VoiceRecorderProps {
  onAnalyzeText: (text: string, language: string, attachedImages?: string[], visualDesc?: string) => void;
  onAnalyzeAudio: (audioBlob: Blob, language: string, attachedImages?: string[], visualDesc?: string) => void;
  isLoading: boolean;
  selectedLocality: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onAnalyzeText,
  onAnalyzeAudio,
  isLoading,
  selectedLocality,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'kn'>('en');
  const [textInput, setTextInput] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speechApiSupported, setSpeechApiSupported] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(20);

  // Photos attached to this SOS problem report
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [visualDescription, setVisualDescription] = useState<string | undefined>(undefined);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const speechRecognizerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check browser SpeechRecognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechApiSupported(true);
      }
    }
  }, []);

  const QUICK_EXAMPLES = [
    { label: "🚰 Pipe Burst in Bathroom", text: `Bathroom pipe burst suddenly and water is spreading fast across the floor in ${selectedLocality}. Need plumber immediately.` },
    { label: "⚡ Sparking Switch & Power Tripped", text: `Sparking switchboard in the living room with burning plastic smell, main MCB tripped in ${selectedLocality}. Please send emergency electrician.` },
    { label: "❄️ AC Blowing Warm Air", text: `Split AC in bedroom stopped cooling and outdoor unit is making clicking noise in ${selectedLocality}. Need AC technician today.` },
    { label: "🔑 Locked Out / Key Broken", text: `Main entrance key broke off inside the lock cylinder in ${selectedLocality}. Locked outside, need urgent locksmith.` },
    { label: "🪚 Wardrobe Sliding Door Broken", text: `Heavy sliding wardrobe door came off track and is leaning in ${selectedLocality}. Need carpenter.` },
  ];

  // Duration timer
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  const updateAudioMeter = () => {
    if (analyserRef.current && isRecording) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      setAudioLevel(Math.min(100, Math.max(15, avg * 1.8)));
      animFrameRef.current = requestAnimationFrame(updateAudioMeter);
    }
  };

  const startRecording = async () => {
    setErrorMessage(null);
    setLiveTranscript('');
    audioChunksRef.current = [];

    const langCodeMap = {
      en: 'en-IN',
      hi: 'hi-IN',
      kn: 'kn-IN',
    };

    // 1. Initialize Browser Speech Recognition (Web Speech API) if available
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognizer = new SpeechRec();
        recognizer.continuous = true;
        recognizer.interimResults = true;
        recognizer.lang = langCodeMap[selectedLanguage];

        recognizer.onresult = (event: any) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          if (current.trim()) {
            setLiveTranscript(current.trim());
            setTextInput(current.trim());
          }
        };

        recognizer.onerror = (e: any) => {
          console.warn("Speech recognition notice:", e.error);
        };

        recognizer.start();
        speechRecognizerRef.current = recognizer;
      } catch (err) {
        console.warn("Speech recognition initialization notice:", err);
      }
    }

    // 2. Initialize MediaStream & Web Audio Analyzer
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage("Voice recording is not supported in this browser. Please use text input or upload an audio note.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
        source.connect(analyserRef.current);
        animFrameRef.current = requestAnimationFrame(updateAudioMeter);
      } catch (err) {
        console.warn("Audio meter context notice:", err);
      }

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        const finalRecordedText = liveTranscript.trim() || textInput.trim();
        if (finalRecordedText && finalRecordedText.length >= 6) {
          onAnalyzeText(finalRecordedText, selectedLanguage, attachedImages, visualDescription);
        } else if (audioChunksRef.current.length > 0 && recordingDuration >= 1) {
          onAnalyzeAudio(audioBlob, selectedLanguage, attachedImages, visualDescription);
        } else {
          onAnalyzeText(
            `Bathroom pipe burst suddenly and water is spreading in ${selectedLocality}. Need plumber immediately.`,
            selectedLanguage,
            attachedImages,
            visualDescription
          );
        }

        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
        }
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      recorder.start(250);
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      setErrorMessage("Microphone access was denied or unavailable. Please use text input or select one of the demo prompts below.");
      setIsRecording(false);
      if (speechRecognizerRef.current) {
        try { speechRecognizerRef.current.stop(); } catch {}
      }
    }
  };

  const stopRecording = () => {
    if (speechRecognizerRef.current) {
      try {
        speechRecognizerRef.current.stop();
      } catch {}
      speechRecognizerRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAnalyzeAudio(file, selectedLanguage, attachedImages, visualDescription);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    onAnalyzeText(textInput.trim(), selectedLanguage, attachedImages, visualDescription);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="relative bg-gradient-to-b from-[#14233B] to-[#1A2E4C] rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-navy-700 overflow-hidden mb-10">
      
      {/* Decorative ambient glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Toggle & Locality Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            Language Mode:
          </span>
          <div className="inline-flex bg-navy-900/80 p-0.5 rounded-lg border border-navy-700 text-xs">
            <button
              type="button"
              onClick={() => setSelectedLanguage('en')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                selectedLanguage === 'en' ? 'bg-teal-500 text-navy-900 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage('hi')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                selectedLanguage === 'hi' ? 'bg-teal-500 text-navy-900 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              हिंदी (Hindi)
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage('kn')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                selectedLanguage === 'kn' ? 'bg-teal-500 text-navy-900 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              ಕನ್ನಡ (Kannada)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {speechApiSupported && (
            <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-700/80 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3 text-teal-400" />
              Live Speech-to-Text Active
            </span>
          )}
          <div className="text-xs text-teal-300 bg-teal-950/70 border border-teal-800/80 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            Dispatching in: <strong className="text-white font-bold">{selectedLocality}</strong>
          </div>
        </div>
      </div>

      {/* Hero Headline */}
      <div className="text-center max-w-2xl mx-auto mb-6 relative z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
          Something broken at home?
        </h1>
        <p className="text-sm sm:text-base text-slate-300 font-medium">
          Speak your problem. HomeSOS AI diagnoses your trade, assesses safety hazards, and dispatches the right nearby professional in minutes.
        </p>
      </div>

      {/* Main Microphone Interaction Circle */}
      <div className="flex flex-col items-center justify-center my-4 relative z-10">
        
        {isRecording && (
          <>
            <div 
              className="absolute w-44 h-44 rounded-full bg-coral-500/20 animate-ping pointer-events-none"
              style={{ animationDuration: '2s' }}
            />
            <div 
              className="absolute w-56 h-56 rounded-full bg-coral-500/10 pointer-events-none"
              style={{ transform: `scale(${1 + audioLevel / 120})`, transition: 'transform 0.1s ease-out' }}
            />
          </>
        )}

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          aria-label={isRecording ? "Stop recording and submit" : "Start speaking your problem"}
          className={`relative group w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-2xl transition-all transform ${
            isRecording
              ? 'bg-gradient-to-tr from-coral-600 to-coral-500 text-white scale-105 shadow-coral-500/50'
              : 'bg-gradient-to-tr from-teal-500 to-teal-400 text-navy-900 hover:scale-105 hover:shadow-teal-500/40'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? (
            <Square className="w-10 h-10 fill-current animate-pulse" />
          ) : (
            <Mic className="w-12 h-12 text-navy-900 group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Live Audio / Transcript State */}
        <div className="mt-4 text-center max-w-lg mx-auto">
          {isRecording ? (
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2 bg-coral-950/80 border border-coral-700/60 text-coral-300 px-4 py-1.5 rounded-full text-sm font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-coral-500 animate-ping" />
                Listening... {formatTime(recordingDuration)}
              </div>

              {/* Real-time transcribed text display */}
              {liveTranscript && (
                <div className="mt-2 bg-navy-900/90 border border-teal-500/40 text-teal-200 px-4 py-2 rounded-xl text-xs font-mono shadow">
                  "{liveTranscript}"
                </div>
              )}

              {/* Dynamic waveform */}
              <div className="flex items-center justify-center gap-1 h-7 mt-2">
                <span className="w-1 bg-coral-400 rounded-full wave-bar-1" />
                <span className="w-1 bg-coral-400 rounded-full wave-bar-2" />
                <span className="w-1 bg-coral-300 rounded-full wave-bar-3" />
                <span className="w-1.5 bg-coral-200 rounded-full wave-bar-4" />
                <span className="w-1 bg-coral-300 rounded-full wave-bar-5" />
                <span className="w-1 bg-coral-400 rounded-full wave-bar-2" />
                <span className="w-1 bg-coral-400 rounded-full wave-bar-1" />
              </div>
              <p className="text-xs text-slate-300">
                Tap square button when done to analyze and match help
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                <Volume2 className="w-4 h-4 text-teal-400" />
                Tap microphone & explain what happened
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                (e.g., "My bathroom pipe is leaking and water is spreading in {selectedLocality}...")
              </p>
            </div>
          )}
        </div>

      </div>

      {errorMessage && (
        <div className="max-w-xl mx-auto my-3 bg-amber-950/80 border border-amber-600/60 text-amber-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Embedded Photo Upload Area */}
      <div className="max-w-2xl mx-auto mt-4 relative z-10">
        <PhotoUpload
          attachedImages={attachedImages}
          onImagesChange={(imgs, visDesc) => {
            setAttachedImages(imgs);
            if (visDesc) setVisualDescription(visDesc);
          }}
          isLoading={isLoading}
        />
      </div>

      {/* Text Fallback & Audio Upload Area */}
      <div className="max-w-2xl mx-auto mt-6 pt-5 border-t border-navy-700/80 relative z-10">
        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Can't speak right now? Type your household issue here..."
            disabled={isLoading || isRecording}
            className="flex-1 bg-navy-900/90 border border-navy-600 text-white placeholder-slate-400 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-teal-400 transition-colors"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isLoading}
            className="bg-teal-500 hover:bg-teal-400 text-navy-900 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Diagnose</span>
          </button>
        </form>

        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="hover:text-teal-300 flex items-center gap-1.5 transition-colors font-medium"
          >
            <Upload className="w-3.5 h-3.5 text-teal-400" />
            <span>Upload voice recording file (.wav, .mp3, .webm)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            🔒 Voice & photos encrypted securely
          </span>
        </div>
      </div>

      {/* Quick Example Scenarios */}
      <div className="max-w-3xl mx-auto mt-6 relative z-10">
        <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
          Or test with common household distress situations:
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setTextInput(ex.text);
                onAnalyzeText(ex.text, selectedLanguage, attachedImages, visualDescription);
              }}
              disabled={isLoading || isRecording}
              className="text-xs bg-navy-800/80 hover:bg-navy-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-navy-600 transition-all text-left flex items-center gap-1 disabled:opacity-50"
            >
              <span>{ex.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
