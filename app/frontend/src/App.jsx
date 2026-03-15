import { useState } from 'react';
import { Globe, Zap, FileText, Home, Cloud, DollarSign } from 'lucide-react';
import { AgentCard } from './components/AgentCard';
import { SwarmLiveFeed } from './components/SwarmLiveFeed';
import { RelocationBlueprint } from './components/RelocationBlueprint';
import { streamRelocationPlan } from './services/api'; // ADD THIS IMPORT

export default function App() {
  const [input, setInput] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [logs, setLogs] = useState([]);
  const [agentProgress, setAgentProgress] = useState({
    visa: { progress: 0, status: 'idle' },
    finance: { progress: 0, status: 'idle' },
    housing: { progress: 0, status: 'idle' },
    climate: { progress: 0, status: 'idle' },
  });
  const [blueprint, setBlueprint] = useState(null);

  const addLog = (agent, message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [...prev, { timestamp, agent, message, type }]);
  };

  const handleDeploySwarm = async () => {
    if (!input.trim()) return;

    setIsDeploying(true);
    setLogs([]);
    setBlueprint(null);
    setAgentProgress({
      visa: { progress: 0, status: 'idle' },
      finance: { progress: 0, status: 'idle' },
      housing: { progress: 0, status: 'idle' },
      climate: { progress: 0, status: 'idle' },
    });

    addLog('SYSTEM', 'Establishing secure connection to Agentverse...', 'info');

    streamRelocationPlan(
      input,
      (update) => {
        addLog('SWARM', update.status, 'info');

        if (update.status.includes("Visa Agent")) {
          setAgentProgress(prev => ({ ...prev, visa: { progress: 50, status: 'active' } }));
        } else if (update.status.includes("Finance Agent")) {
          setAgentProgress(prev => ({ ...prev, finance: { progress: 50, status: 'active' } }));
        } else if (update.status.includes("Housing Agent")) {
          setAgentProgress(prev => ({ ...prev, housing: { progress: 50, status: 'active' } }));
        } else if (update.status.includes("Climate Agent")) {
          setAgentProgress(prev => ({ ...prev, climate: { progress: 50, status: 'active' } }));
        } else if (update.status.includes("Synthesis")) {
          // Wrap up the active states when synthesis begins
          setAgentProgress({
            visa: { progress: 100, status: 'complete' },
            finance: { progress: 100, status: 'complete' },
            housing: { progress: 100, status: 'complete' },
            climate: { progress: 100, status: 'complete' },
          });
        }
      },
      (finalReport) => {
        setBlueprint(finalReport);
        addLog('SYSTEM', 'Relocation Blueprint finalized.', 'success');
        setIsDeploying(false);
      },
      (errorMsg) => {
        addLog('SYSTEM', `ERROR: ${errorMsg}`, 'warning');
        setIsDeploying(false);
      }
    );
  };

  return (
    /* Ensure bg covers full height even on scroll */
    <div className="min-h-screen bg-[#0A192F] text-white flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-[1400px] mx-auto w-full p-6 space-y-8 flex-grow">

        {/* 1. Header Section (Full Width) */}
        <header className="flex items-center gap-4">
          <div className="bg-linear-to-br from-[#007BFF] to-cyan-400 p-3 rounded-xl shadow-lg shadow-[#007BFF]/20">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">NEXUSMIGRATE</h1>
            <p className="text-sm text-cyan-400 font-medium tracking-wide">Multi-Agent Relocation Swarm</p>
          </div>
        </header>

        {/* 2. Main Input & Monitoring Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN (Col Span 7): Input & Instructions */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative group">
              <div
                className="absolute inset-0 bg-linear-to-br from-[#007BFF]/10 to-cyan-400/10 rounded-2xl blur-xl group-hover:opacity-75 transition-opacity"
                style={{ background: 'rgba(0, 123, 255, 0.05)' }}
              />
              <div className="relative p-8 bg-[#0F2642]/50 border border-[#1E3A5F] rounded-2xl backdrop-blur-md space-y-6">
                <div>
                  <label className="text-xs text-cyan-400 mb-3 block font-bold uppercase tracking-widest">Describe Your Move</label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., Software engineer from Indonesia to Johor, with family, budget 20M IDR"
                    className="w-full h-48 px-5 py-4 bg-[#0A192F] border border-[#1E3A5F] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#007BFF] focus:ring-4 focus:ring-[#007BFF]/10 resize-none transition-all text-lg"
                  />
                </div>
                <button
                  onClick={handleDeploySwarm}
                  disabled={isDeploying || !input.trim()}
                  className="w-full bg-linear-to-r from-[#007BFF] to-cyan-500 text-white py-5 rounded-xl font-bold text-lg hover:from-[#0066D9] hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-[#007BFF]/20 flex items-center justify-center gap-3"
                >
                  <Zap className={`w-6 h-6 ${isDeploying ? 'animate-pulse' : ''}`} />
                  {isDeploying ? 'Deploying Swarm...' : 'Deploy Swarm'}
                </button>
              </div>
            </div>

            <div className="bg-[#0F2642]/30 border border-[#1E3A5F] rounded-2xl p-8 backdrop-blur-sm">
              <h3 className="text-cyan-400 font-bold text-sm mb-6 uppercase tracking-[0.2em]">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center font-bold text-cyan-400 border border-cyan-400/30">1</div>
                  <p>Define your origin, destination, and constraints.</p>
                </div>
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center font-bold text-cyan-400 border border-cyan-400/30">2</div>
                  <p>Agents research data concurrently via live tools.</p>
                </div>
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center font-bold text-cyan-400 border border-cyan-400/30">3</div>
                  <p>Review your final AI-synthesized blueprint.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Col Span 5): Live Status & Feedback */}
          <div className="lg:col-span-5 space-y-6 flex flex-col h-full">
            {/* Agent Cards (2x2 Grid) above Log */}
            <div className="grid grid-cols-2 gap-4">
              <AgentCard name="Visa Agent" icon={FileText} progress={agentProgress.visa.progress} status={agentProgress.visa.status} />
              <AgentCard name="Finance Agent" icon={DollarSign} progress={agentProgress.finance.progress} status={agentProgress.finance.status} />
              <AgentCard name="Housing Agent" icon={Home} progress={agentProgress.housing.progress} status={agentProgress.housing.status} />
              <AgentCard name="Climate Agent" icon={Cloud} progress={agentProgress.climate.progress} status={agentProgress.climate.status} />
            </div>

            {/* Activity Log - Stretches to fill remaining height */}
            <div className="flex-grow min-h-[400px]">
              <SwarmLiveFeed logs={logs} />
            </div>
          </div>
        </div>

        {/* 3. The Blueprint (Full Width - Bottom) */}
        <section className="w-full pt-4 transition-all duration-1000">
          <RelocationBlueprint content={blueprint} />
        </section>

      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 123, 255, 0.2); border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 123, 255, 0.4); }
    `}</style>
    </div>
  );
}