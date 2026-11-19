import React, { useState, useEffect } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  DemoScenariosBar 
} from './components/DemoScenariosBar';
import { 
  VoiceRecorder 
} from './components/VoiceRecorder';
import { 
  AIAnalysisCard 
} from './components/AIAnalysisCard';
import { 
  MatchingSection 
} from './components/MatchingSection';
import { 
  TrackingView 
} from './components/TrackingView';
import { 
  DashboardView 
} from './components/DashboardView';
import { 
  AuthModal 
} from './components/AuthModal';
import { api } from './services/api';
import { 
  AIAnalyzeResponse, 
  MatchedProfessional, 
  ServiceRequest, 
  PresetScenario, 
  HistoryStats,
  User 
} from './types';
import { Sparkles, Shield, PhoneCall, CheckCircle2, Clock } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<'report' | 'matching' | 'tracking' | 'dashboard'>('report');
  const [selectedLocality, setSelectedLocality] = useState<string>('BTM Layout');
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // AI and Flow State
  const [analysisResult, setAnalysisResult] = useState<AIAnalyzeResponse | null>(null);
  const [matchedProfessionals, setMatchedProfessionals] = useState<MatchedProfessional[]>([]);
  const [activeRequest, setActiveRequest] = useState<ServiceRequest | null>(null);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [visualDescription, setVisualDescription] = useState<string | null>(null);
  
  // Data State
  const [presetScenarios, setPresetScenarios] = useState<PresetScenario[]>([]);
  const [historyList, setHistoryList] = useState<ServiceRequest[]>([]);
  const [historyStats, setHistoryStats] = useState<HistoryStats | null>(null);
  const [aiEngineStatus, setAiEngineStatus] = useState<string>('Rule Engine Demo');
  
  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize data on load
  useEffect(() => {
    async function initData() {
      // 1. Try restoring logged in user
      try {
        const user = await api.getMe();
        if (user) {
          setCurrentUser(user);
          if (user.locality) {
            setSelectedLocality(user.locality);
          }
        }
      } catch (e) {
        console.warn("Auth check fallback:", e);
      }

      // 2. Health check
      try {
        const health = await api.getHealth();
        setAiEngineStatus(health.ai_engine || 'Rule Engine Demo');
      } catch (e) {
        console.warn("Backend health check fallback:", e);
      }

      // 3. Scenarios
      try {
        const scenarios = await api.getScenarios();
        setPresetScenarios(scenarios);
      } catch (e) {
        console.warn("Scenarios fetch fallback:", e);
      }

      loadHistory();
    }
    initData();
  }, []);

  const loadHistory = async (overrideCustomerId?: string) => {
    try {
      const hist = await api.getHistory(overrideCustomerId || currentUser?.id);
      setHistoryList(hist);
      const st = await api.getHistoryStats(overrideCustomerId || currentUser?.id);
      setHistoryStats(st);
      
      // Auto-detect active in-flight request if present
      const inFlight = hist.find((r) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
      if (inFlight && !activeRequest) {
        setActiveRequest(inFlight);
      }
    } catch (e) {
      console.warn("History load note:", e);
    }
  };

  // Handler: Analyze Text
  const handleAnalyzeText = async (
    text: string, 
    language: string, 
    images: string[] = [], 
    visualDesc?: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    setAttachedImages(images);
    setVisualDescription(visualDesc || null);
    try {
      const result = await api.analyzeProblem(text, language, selectedLocality);
      if (visualDesc && !result.visual_description) {
        result.visual_description = visualDesc;
      }
      setAnalysisResult(result);
      if (result.customer_location) {
        setSelectedLocality(result.customer_location);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Analyze Uploaded Audio
  const handleAnalyzeAudio = async (
    blob: Blob, 
    language: string, 
    images: string[] = [], 
    visualDesc?: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    setAttachedImages(images);
    setVisualDescription(visualDesc || null);
    try {
      const result = await api.uploadAudio(blob, language, selectedLocality);
      if (visualDesc && !result.visual_description) {
        result.visual_description = visualDesc;
      }
      setAnalysisResult(result);
      if (result.customer_location) {
        setSelectedLocality(result.customer_location);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Audio processing error. Using fallback.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Preset Scenario Selected
  const handleSelectScenario = async (scenario: PresetScenario) => {
    setSelectedLocality(scenario.customer_location);
    await handleAnalyzeText(scenario.sample_input, 'en');
  };

  // Handler: Confirm AI diagnosis & fetch matches
  const handleConfirmAnalysis = async (confirmed: AIAnalyzeResponse) => {
    setIsLoading(true);
    setErrorMessage(null);
    setAnalysisResult(confirmed);
    try {
      const matches = await api.matchProfessionals(
        confirmed.category,
        confirmed.customer_location,
        confirmed.urgency,
        5
      );
      setMatchedProfessionals(matches);
      setCurrentTab('matching');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve nearby professionals.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Dispatch chosen professional
  const handleRequestProfessional = async (prof: MatchedProfessional) => {
    if (!analysisResult) return;
    setIsLoading(true);
    setErrorMessage(null);

    const customerName = currentUser?.name || 'Priya Sharma';
    const customerPhone = currentUser?.phone || '+91 98765 43210';
    const customerId = currentUser?.id;

    try {
      const newReq = await api.createRequest({
        customer_id: customerId,
        problem_description: analysisResult.problem_description,
        category: analysisResult.category,
        urgency: analysisResult.urgency,
        symptoms: analysisResult.symptoms,
        safety_concerns: analysisResult.safety_concerns,
        immediate_guidance: analysisResult.immediate_guidance,
        customer_location: analysisResult.customer_location,
        customer_name: customerName,
        customer_phone: customerPhone,
        preferred_time: analysisResult.preferred_time,
        estimated_complexity: analysisResult.estimated_complexity,
        technician_briefing: analysisResult.technician_briefing,
        assigned_professional_id: prof.id,
        price_estimate_min: Math.max(300, prof.response_time_min * 20),
        price_estimate_max: Math.max(700, prof.response_time_min * 45),
        images: attachedImages,
        image_analysis: visualDescription || analysisResult.visual_description,
      });

      setActiveRequest(newReq);
      setCurrentTab('tracking');
      loadHistory();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to dispatch request.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Simulate Next Step for Hackathon Demo
  const handleSimulateStep = async () => {
    if (!activeRequest) return;
    setIsSimulating(true);
    try {
      const updated = await api.simulateStep(activeRequest.id);
      setActiveRequest(updated);
      loadHistory();
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Handler: Cancel request
  const handleCancelRequest = async () => {
    if (!activeRequest) return;
    if (!window.confirm("Are you sure you want to cancel this emergency request?")) return;
    try {
      const updated = await api.updateStatus(activeRequest.id, 'CANCELLED', 'Customer requested cancellation');
      setActiveRequest(updated);
      loadHistory();
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  // Reset to new voice request
  const handleNewRequest = () => {
    setAnalysisResult(null);
    setMatchedProfessionals([]);
    setAttachedImages([]);
    setVisualDescription(null);
    setCurrentTab('report');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab === 'matching' ? 'report' : currentTab}
        setCurrentTab={setCurrentTab}
        selectedLocality={selectedLocality}
        setSelectedLocality={setSelectedLocality}
        activeRequestId={activeRequest && activeRequest.status !== 'COMPLETED' ? activeRequest.id : null}
        aiEngineStatus={aiEngineStatus}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-sm">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-600 font-bold ml-2 text-sm"
            >
              ×
            </button>
          </div>
        )}

        {/* TAB 1: REPORT ISSUE & HOME */}
        {currentTab === 'report' && (
          <div>
            {/* Hackathon Judge 1-Click Scenarios Bar */}
            <DemoScenariosBar
              scenarios={presetScenarios}
              onSelectScenario={handleSelectScenario}
              isLoading={isLoading}
            />

            {/* AI Diagnosis Card (if analyzed) OR Voice Recorder (default) */}
            {analysisResult ? (
              <AIAnalysisCard
                analysis={analysisResult}
                attachedImages={attachedImages}
                visualDescription={visualDescription}
                onConfirm={handleConfirmAnalysis}
                onCancel={() => {
                  setAnalysisResult(null);
                  setAttachedImages([]);
                  setVisualDescription(null);
                }}
                isLoadingMatches={isLoading}
              />
            ) : (
              <VoiceRecorder
                onAnalyzeText={(txt, lang, imgs, desc) => handleAnalyzeText(txt, lang, imgs, desc)}
                onAnalyzeAudio={(blob, lang, imgs, desc) => handleAnalyzeAudio(blob, lang, imgs, desc)}
                isLoading={isLoading}
                selectedLocality={selectedLocality}
              />
            )}

            {/* How It Works & Trust Pillars */}
            <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 font-bold text-sm">
                  1
                </div>
                <h4 className="text-sm font-bold text-navy-900 mb-1">1. Speak Naturally</h4>
                <p className="text-xs text-slate-500">
                  Explain your issue in English, Hindi, or Kannada without browsing endless service catalogs.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 font-bold text-sm">
                  2
                </div>
                <h4 className="text-sm font-bold text-navy-900 mb-1">2. AI Diagnosis</h4>
                <p className="text-xs text-slate-500">
                  HomeSOS detects category, urgency, risks & generates an exact technician briefing.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 font-bold text-sm">
                  3
                </div>
                <h4 className="text-sm font-bold text-navy-900 mb-1">3. Nearest Pro Matched</h4>
                <p className="text-xs text-slate-500">
                  Proximity-weighted matching connects you with available Bengaluru specialists in minutes.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 font-bold text-sm">
                  4
                </div>
                <h4 className="text-sm font-bold text-navy-900 mb-1">4. Live Tracking</h4>
                <p className="text-xs text-slate-500">
                  Track arrival, verify transparent price estimates, and keep a digital service memory.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MATCHED PROFESSIONALS */}
        {currentTab === 'matching' && analysisResult && (
          <MatchingSection
            professionals={matchedProfessionals}
            analysis={analysisResult}
            onRequestProfessional={handleRequestProfessional}
            isSubmitting={isLoading}
            onBack={() => setCurrentTab('report')}
          />
        )}

        {/* TAB 3: TRACKING VIEW */}
        {currentTab === 'tracking' && activeRequest && (
          <TrackingView
            request={activeRequest}
            onSimulateStep={handleSimulateStep}
            onCancelRequest={handleCancelRequest}
            onNewRequest={handleNewRequest}
            isSimulating={isSimulating}
          />
        )}

        {/* TAB 4: DASHBOARD & HISTORY */}
        {currentTab === 'dashboard' && (
          <DashboardView
            stats={historyStats}
            history={historyList}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onSelectRequest={(req) => {
              setActiveRequest(req);
              setCurrentTab('tracking');
            }}
            onNewRequest={handleNewRequest}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#14233B] text-slate-400 border-t border-navy-700 py-6 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-extrabold text-white">HomeSOS</span> • Speak your problem. Get the right help.
            <p className="text-[11px] text-slate-400 mt-0.5">
              Built for the ECHO Track Hackathon • Serving BTM, Jayanagar, JP Nagar, Koramangala & South Bengaluru
            </p>
          </div>
          <div className="flex items-center gap-3 text-teal-400 text-[11px]">
            <span>⚡ AI Problem-to-Service Dispatcher</span>
            <span>•</span>
            <span>🛡️ Seeded Bangalore Demo Network</span>
          </div>
        </div>
      </footer>

      {/* Customer Account & Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={(user) => {
          setCurrentUser(user);
          loadHistory(user?.id);
          if (user?.locality) {
            setSelectedLocality(user.locality);
          }
        }}
      />

    </div>
  );
}

export default App;

