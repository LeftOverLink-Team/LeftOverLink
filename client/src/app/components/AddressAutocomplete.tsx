import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { Input } from './ui/input';
import api from '../api/axios'; // Automatically handles API base URL
import { cn } from './ui/utils';

export interface LocationResult {
    display_name: string;
    city: string;
    state: string;
    country: string;
    lat: number;
    lon: number;
}

interface AddressAutocompleteProps {
    onSelect: (location: LocationResult) => void;
    defaultValue?: string;
    placeholder?: string;
    className?: string;
}

export function AddressAutocomplete({ onSelect, defaultValue = '', placeholder = 'Search location...', className }: AddressAutocompleteProps) {
    const [query, setQuery] = useState(defaultValue);
    const debouncedQuery = useDebounce(query, 500);
    const [results, setResults] = useState<LocationResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef]);

    // Search effect
    useEffect(() => {
        const searchLocation = async () => {
            if (!debouncedQuery || debouncedQuery.length < 3) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await api.get(`/location/search?q=${encodeURIComponent(debouncedQuery)}`);

                if (response.data.success) {
                    setResults(response.data.data);
                    setIsOpen(true);
                    setSelectedIndex(-1);
                } else {
                    setError('No results found. Try a different search.');
                    setResults([]);
                }
            } catch (err: any) {
                const status = err?.response?.status;
                const isTimeout = err?.code === 'ECONNABORTED' || err?.message?.includes('timeout');
                if (status === 429) {
                    setError('Too many searches — please slow down a bit');
                } else if (isTimeout) {
                    setError('Location search timed out, please try again');
                } else if (status >= 500) {
                    setError('Location service unavailable, try again shortly');
                } else {
                    setError('Could not search location. Check your connection.');
                }
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        searchLocation();
    }, [debouncedQuery]);

    const handleSelect = (result: LocationResult) => {
        setQuery(result.display_name);
        setIsOpen(false);
        onSelect(result);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleSelect(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    return (
        <div ref={wrapperRef} className={cn("relative w-full", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-4 h-4 text-muted-foreground" />
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!isOpen && e.target.value.length >= 3) {
                            setIsOpen(true);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (query.length >= 3 && results.length > 0) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder={placeholder}
                    className="pl-9 pr-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-green-500"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                        <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                    </div>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (query.length >= 3) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-[100] max-h-60 overflow-y-auto">
                    {error ? (
                        <div className="p-4 flex items-center justify-center gap-2 text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    ) : results.length === 0 && !isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No results found for "{query}"
                        </div>
                    ) : (
                        <ul className="py-2">
                            {results.map((result, index) => (
                                <li
                                    key={`${result.lat}-${result.lon}-${index}`}
                                    className={cn(
                                        "px-4 py-3 cursor-pointer flex items-start gap-3 transition-colors",
                                        index === selectedIndex ? "bg-green-50 dark:bg-green-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    )}
                                    onClick={() => handleSelect(result)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <MapPin className={cn(
                                        "w-5 h-5 mt-0.5 shrink-0 transition-colors",
                                        index === selectedIndex ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                                    )} />
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-medium text-foreground truncate">{result.display_name.split(',')[0]}</span>
                                        <span className="text-xs text-muted-foreground truncate">
                                            {result.display_name.substring(result.display_name.indexOf(',') + 1).trim()}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
