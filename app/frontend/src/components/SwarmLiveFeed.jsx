import { Terminal } from 'lucide-react';

export function SwarmLiveFeed({ logs }) {
    const typeColors = {
        info: 'text-cyan-400',
        success: 'text-emerald-400',
        warning: 'text-yellow-400',
    };

    return (
        <div className="bg-[#0A192F] border border-[#1E3A5F] rounded-lg overflow-hidden">
            <div className="bg-[#0F2642] border-b border-[#1E3A5F] px-4 py-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm text-white/90">Agentverse Activity Log</h3>
                <div className="ml-auto flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
            </div>
            <div className="p-4 font-mono text-xs h-64 overflow-y-auto custom-scrollbar">
                {logs.map((log, index) => (
                    <div key={index} className="mb-2 flex gap-2">
                        <span className="text-gray-500 select-none">{log.timestamp}</span>
                        <span className={`${typeColors[log.type]} font-medium`}>[{log.agent}]</span>
                        <span className="text-gray-300">{log.message}</span>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div className="text-gray-500 italic">Waiting for swarm deployment...</div>
                )}
            </div>
        </div>
    );
}