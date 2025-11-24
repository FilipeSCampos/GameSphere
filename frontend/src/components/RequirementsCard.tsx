import React from 'react';
import { FaMicrochip, FaMemory, FaHdd, FaWindows, FaVideo } from 'react-icons/fa';

interface ParsedRequirements {
    cpu?: string;
    gpu?: string;
    ram?: string;
    storage?: string;
    os?: string;
}

interface RequirementsCardProps {
    title: string;
    requirements?: ParsedRequirements;
    rawText?: string;
    type: 'min' | 'rec';
}

const RequirementRow: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-start space-x-4 p-3 hover:bg-white hover:bg-opacity-5 rounded-lg transition-colors">
            <div className="mt-1 text-game-accent text-xl">{icon}</div>
            <div className="flex-1">
                <span className="text-gray-500 text-xs uppercase tracking-wider font-bold block mb-1">{label}</span>
                <span className="text-gray-200 font-medium leading-tight block">{value}</span>
            </div>
        </div>
    );
};

const RequirementsCard: React.FC<RequirementsCardProps> = ({ title, requirements, rawText, type }) => {
    const isRec = type === 'rec';

    return (
        <div className={`glass-panel rounded-2xl p-1 h-full relative overflow-hidden group`}>
            <div className={`absolute top-0 left-0 w-full h-1 ${isRec ? 'bg-gradient-to-r from-game-accent to-blue-500' : 'bg-gray-700'}`}></div>

            <div className="bg-game-dark bg-opacity-40 p-6 h-full rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-bold ${isRec ? 'text-white' : 'text-gray-300'}`}>{title}</h3>
                    {isRec && <span className="px-3 py-1 bg-game-accent bg-opacity-20 text-game-accent text-xs font-bold rounded-full border border-game-accent border-opacity-30">BEST EXPERIENCE</span>}
                </div>

                {requirements ? (
                    <div className="space-y-1">
                        <RequirementRow icon={<FaWindows />} label="OS" value={requirements.os} />
                        <RequirementRow icon={<FaMicrochip />} label="Processor" value={requirements.cpu} />
                        <RequirementRow icon={<FaVideo />} label="Graphics" value={requirements.gpu} />
                        <RequirementRow icon={<FaMemory />} label="Memory" value={requirements.ram} />
                        <RequirementRow icon={<FaHdd />} label="Storage" value={requirements.storage} />
                    </div>
                ) : (
                    <p className="text-gray-500 italic p-4 text-center">{rawText || "No detailed requirements available."}</p>
                )}
            </div>
        </div>
    );
};

export default RequirementsCard;
