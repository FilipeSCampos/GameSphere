import { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';

interface GameSuggestion {
    id: number;
    name: string;
    slug: string;
    background_image: string | null;
    rating: number;
    released: string;
}

interface SearchBarProps {
    onSearch: (gameName: string) => void;
    loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading }) => {
    const [term, setTerm] = useState('');
    const [suggestions, setSuggestions] = useState<GameSuggestion[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const debounceTimer = useRef<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search for autocomplete
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (term.trim().length === 0) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        debounceTimer.current = window.setTimeout(async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/search', {
                    params: { query: term }
                });
                setSuggestions(response.data.results || []);
                setShowDropdown(true);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
            }
        }, 400);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [term]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (term.trim()) {
            onSearch(term);
            setShowDropdown(false);
        }
    };

    const handleSelectGame = (game: GameSuggestion) => {
        setTerm(game.name);
        setShowDropdown(false);
        onSearch(game.name);
    };

    return (
        <div className="w-full max-w-3xl mx-auto relative z-10" ref={dropdownRef}>
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-game-accent to-game-secondary rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder="Search for any game (e.g., Cyberpunk 2077)..."
                        className="w-full px-8 py-5 text-xl bg-black bg-opacity-80 backdrop-blur-md text-white rounded-full border border-gray-800 focus:border-game-accent focus:outline-none shadow-2xl transition-all placeholder-gray-500"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-3 top-2 bottom-2 px-6 bg-game-accent text-black font-bold rounded-full hover:bg-game-accent-hover transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <FaSearch size={20} />
                        )}
                    </button>
                </div>
            </form>

            {/* Autocomplete Dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-game-card backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                    {suggestions.map((game) => (
                        <button
                            key={game.id}
                            onClick={() => handleSelectGame(game)}
                            className="w-full flex items-center gap-4 p-3 hover:bg-white/5 transition-colors duration-200 text-left"
                        >
                            {game.background_image ? (
                                <img
                                    src={game.background_image}
                                    alt={game.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                                    <FaSearch className="text-gray-500" />
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="text-white font-semibold">{game.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    {game.released && <span>{game.released}</span>}
                                    {game.rating > 0 && (
                                        <>
                                            <span>•</span>
                                            <span className="text-game-accent">★ {game.rating}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
