'use client';

import { useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SearchBar() {
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

  // Sincronizar con URL cuando cambia externamente
  useEffect(() => {
    setSearchValue(searchParams.get('search') || '');
  }, [searchParams]);

  const updateURL = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value.trim()) {
      params.set('search', value.trim());
    } else {
      params.delete('search');
    }

    // Reset a la primera página cuando cambia la búsqueda
    params.set('page', '1');

    const url = params.toString() ? `?${params.toString()}` : '/';
    window.history.pushState(null, '', url);
    window.dispatchEvent(new Event('urlchange'));
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    updateURL(value);
  };

  const handleClear = () => {
    setSearchValue('');
    updateURL('');
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search Pokémon (including evolutions)..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
        />
        {searchValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {searchValue && (
        <p className="text-sm text-gray-500 mt-2">
          Searching for "{searchValue}" in Pokémon names and their evolutions
        </p>
      )}
    </div>
  );
}
