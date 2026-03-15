export function AgentCard({ name, icon: Icon, progress, status }) {
    const statusColors = {
        idle: 'bg-gray-600',
        active: 'bg-cyan-400',
        complete: 'bg-emerald-400',
    };

    const progressColors = {
        idle: 'from-gray-600 to-gray-700',
        active: 'from-cyan-400 to-blue-500',
        complete: 'from-emerald-400 to-green-500',
    };

    return (
        <div className="bg-[#0F2642] border border-[#1E3A5F] rounded-lg p-4 flex items-center gap-3 hover:border-[#007BFF]/50 transition-all duration-300">
            <div className="relative">
                <div className={`${statusColors[status]} p-2.5 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {status === 'active' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                )}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-sm text-white/90">{name}</h4>
                    <span className="text-xs text-cyan-400">{progress}%</span>
                </div>
                <div className="h-1.5 bg-[#0A192F] rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-linear-to-r ${progressColors[status]} transition-all duration-500 rounded-full`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}