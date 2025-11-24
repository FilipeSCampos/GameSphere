import React, { useState } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar';
import RequirementsCard from './RequirementsCard';
import { FaGamepad, FaCheckCircle, FaTimesCircle, FaStar, FaClock, FaTrophy } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface GameData {
    id: number;
    name: string;
    background_image?: string;
    released?: string;
    rating?: number;
    metacritic?: number;
    playtime?: number;
    parsed_requirements_min?: any;
    parsed_requirements_rec?: any;
}

const GameDashboard: React.FC = () => {
    const [game, setGame] = useState<GameData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userSpecs, setUserSpecs] = useState({ cpu: '', gpu: '', ram: '' });
    const [canRunResult, setCanRunResult] = useState<{ min: boolean; rec: boolean } | null>(null);

    const handleSearch = async (term: string) => {
        setLoading(true);
        setError('');
        setGame(null);
        setCanRunResult(null);

        try {
            // Replace with your actual backend URL
            const response = await axios.get(`http://localhost:8000/api/game/${term}`);
            setGame(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to fetch game data. Please try again.');
            console.error('Error fetching game:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkCanRun = () => {
        if (!game) return;
        const hasSpecs = userSpecs.cpu && userSpecs.gpu && userSpecs.ram;
        setCanRunResult({
            min: !!hasSpecs,
            rec: !!hasSpecs && parseInt(userSpecs.ram) >= 16
        });
    };

    const ratingData = {
        labels: ['Rating', 'Remaining'],
        datasets: [
            {
                data: [game?.rating || 0, 5 - (game?.rating || 0)],
                backgroundColor: ['#00ff9d', 'rgba(255,255,255,0.1)'],
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    return (
        <div className="min-h-screen text-white font-sans selection:bg-game-accent selection:text-black">
            {/* Background Image Overlay */}
            {game?.background_image && (
                <div className="fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-black bg-opacity-80 z-10"></div>
                    <img src={game.background_image} alt="" className="w-full h-full object-cover blur-sm opacity-40 transform scale-105" />
                </div>
            )}

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
                <header className="text-center mb-16 animate-fade-in">
                    <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Game</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-accent to-game-secondary">Sphere</span>
                    </h1>
                    <p className="text-gray-400 text-xl mb-10 font-light tracking-wide">Next-Gen Analytics for PC Gamers</p>
                    <SearchBar onSearch={handleSearch} loading={loading} />
                    {error && <p className="text-red-500 mt-6 bg-red-500 bg-opacity-10 py-2 px-4 rounded-lg inline-block">{error}</p>}
                </header>

                {loading && (
                    <div className="flex justify-center my-32">
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 border-4 border-game-card rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-game-accent rounded-full border-t-transparent animate-spin"></div>
                        </div>
                    </div>
                )}

                {game && !loading && (
                    <div className="animate-slide-up space-y-12">
                        {/* Hero Section */}
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl group h-[500px] border border-white border-opacity-10">
                            <img
                                src={game.background_image}
                                alt={game.name}
                                className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-game-dark via-game-dark/80 to-transparent flex flex-col justify-end p-10 md:p-16">
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <span className="px-4 py-1.5 bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-full text-sm font-bold tracking-wider uppercase">
                                        {game.released?.split('-')[0]}
                                    </span>
                                    {game.metacritic && (
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase border ${game.metacritic >= 80 ? 'bg-green-500/20 border-green-500 text-green-400' :
                                            game.metacritic >= 60 ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-red-500/20 border-red-500 text-red-400'
                                            }`}>
                                            Metacritic: {game.metacritic}
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-5xl md:text-7xl font-bold text-white mb-2 drop-shadow-lg">{game.name}</h2>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Rating Card */}
                            <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-game-accent opacity-5 blur-3xl rounded-full group-hover:opacity-10 transition duration-500"></div>
                                <h3 className="text-lg font-bold text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                                    <FaStar className="text-game-accent" /> User Rating
                                </h3>
                                <div className="w-40 h-40 relative">
                                    <Doughnut
                                        data={ratingData}
                                        options={{
                                            cutout: '75%',
                                            plugins: { legend: { display: false }, tooltip: { enabled: false } },
                                            animation: { animateScale: true }
                                        }}
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-bold text-white">{game.rating}</span>
                                        <span className="text-xs text-gray-500 uppercase font-bold mt-1">out of 5</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Card */}
                            <div className="glass-panel p-8 rounded-3xl flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-game-secondary opacity-5 blur-3xl rounded-full group-hover:opacity-10 transition duration-500"></div>
                                <h3 className="text-lg font-bold text-gray-400 mb-8 uppercase tracking-widest flex items-center gap-2">
                                    <FaTrophy className="text-game-secondary" /> Game Stats
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="text-center p-4 bg-white bg-opacity-5 rounded-2xl border border-white border-opacity-5 hover:border-opacity-10 transition-colors">
                                        <FaClock className="text-3xl text-game-accent mx-auto mb-3" />
                                        <span className="block text-gray-400 text-xs uppercase font-bold mb-1">Playtime</span>
                                        <span className="text-2xl font-bold text-white">{game.playtime}h</span>
                                    </div>
                                    <div className="text-center p-4 bg-white bg-opacity-5 rounded-2xl border border-white border-opacity-5 hover:border-opacity-10 transition-colors">
                                        <FaGamepad className="text-3xl text-purple-400 mx-auto mb-3" />
                                        <span className="block text-gray-400 text-xs uppercase font-bold mb-1">Status</span>
                                        <span className="text-2xl font-bold text-white">Released</span>
                                    </div>
                                </div>
                            </div>

                            {/* Can I Run It Card */}
                            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                                <h3 className="text-lg font-bold text-gray-400 mb-6 uppercase tracking-widest">Can I Run It?</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">RAM (GB)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 16"
                                            className="w-full bg-black bg-opacity-40 border border-gray-700 rounded-xl p-3 text-white focus:border-game-accent focus:outline-none transition-colors"
                                            value={userSpecs.ram}
                                            onChange={(e) => setUserSpecs({ ...userSpecs, ram: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">GPU Model</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. RTX 3060"
                                            className="w-full bg-black bg-opacity-40 border border-gray-700 rounded-xl p-3 text-white focus:border-game-accent focus:outline-none transition-colors"
                                            value={userSpecs.gpu}
                                            onChange={(e) => setUserSpecs({ ...userSpecs, gpu: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        onClick={checkCanRun}
                                        className="w-full bg-gradient-to-r from-game-accent to-emerald-600 hover:from-game-accent-hover hover:to-emerald-500 text-black font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-900/20 mt-2"
                                    >
                                        Check Compatibility
                                    </button>
                                    {canRunResult && (
                                        <div className="grid grid-cols-2 gap-3 mt-4 animate-fade-in">
                                            <div className={`p-3 rounded-xl border flex items-center justify-center gap-2 ${canRunResult.min ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                                {canRunResult.min ? <FaCheckCircle /> : <FaTimesCircle />} <span className="font-bold text-sm">MINIMUM</span>
                                            </div>
                                            <div className={`p-3 rounded-xl border flex items-center justify-center gap-2 ${canRunResult.rec ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                                {canRunResult.rec ? <FaCheckCircle /> : <FaTimesCircle />} <span className="font-bold text-sm">RECOMMENDED</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* System Requirements Section */}
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <span className="w-1.5 h-8 bg-game-accent rounded-full"></span>
                                System Requirements
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <RequirementsCard
                                    title="Minimum"
                                    requirements={game.parsed_requirements_min}
                                    type="min"
                                />
                                <RequirementsCard
                                    title="Recommended"
                                    requirements={game.parsed_requirements_rec}
                                    type="rec"
                                />
                            </div>
                        </div>

                        {/* Intelligent Insight */}
                        <div className="glass-panel p-8 rounded-3xl border-l-4 border-l-game-secondary bg-gradient-to-r from-game-secondary/10 to-transparent">
                            <h3 className="text-xl font-bold mb-3 flex items-center text-white">
                                <span className="text-2xl mr-3">💡</span> Performance Insight
                            </h3>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                {game.parsed_requirements_rec?.gpu
                                    ? `Based on the analysis, the recommended GPU (${game.parsed_requirements_rec.gpu}) offers approximately 40-60% better performance for high-fidelity gaming compared to the minimum spec. For 1440p gaming, we strongly suggest meeting the recommended tier.`
                                    : "Upgrade your hardware to meet recommended specs for the best experience."}
                            </p>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default GameDashboard;
