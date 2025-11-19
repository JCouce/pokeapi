'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { type Generation, type Type } from '@/lib/types/pokemon';
import { capitalize } from '@/lib/utils/helpers';

interface FiltersProps {
  generations: Generation[];
  types: Type[];
}

export function Filters({ generations, types }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get('type') || '';
  const currentGeneration = searchParams.get('generation') || '';
  const currentPage = searchParams.get('page') || '1';

  const handleFilterChange = (filterType: 'type' | 'generation', value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(filterType, value);
    } else {
      params.delete(filterType);
    }

    // Reset a la primera página cuando cambian los filtros
    params.set('page', '1');

    router.push(`/?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push('/');
  };

  const hasActiveFilters = currentType || currentGeneration;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
        {/* Type Filter */}
        <div className="flex-1 w-full">
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Type
          </label>
          <select
            id="type-filter"
            value={currentType}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {types
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((type) => (
                <option key={type.id} value={type.name}>
                  {capitalize(type.name)}
                </option>
              ))}
          </select>
        </div>

        {/* Generation Filter */}
        <div className="flex-1 w-full">
          <label htmlFor="generation-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Generation
          </label>
          <select
            id="generation-filter"
            value={currentGeneration}
            onChange={(e) => handleFilterChange('generation', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Generations</option>
            {generations.map((gen) => (
              <option key={gen.id} value={gen.id.toString()}>
                Generation {getRomanNumeral(gen.id)}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors whitespace-nowrap"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {currentType && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Type: {capitalize(currentType)}
              <button
                onClick={() => handleFilterChange('type', '')}
                className="ml-1 hover:text-blue-900"
                aria-label="Remove type filter"
              >
                ×
              </button>
            </span>
          )}
          {currentGeneration && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Gen {getRomanNumeral(parseInt(currentGeneration))}
              <button
                onClick={() => handleFilterChange('generation', '')}
                className="ml-1 hover:text-purple-900"
                aria-label="Remove generation filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function getRomanNumeral(num: number): string {
  const numerals: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
    9: 'IX',
  };
  return numerals[num] || num.toString();
}
