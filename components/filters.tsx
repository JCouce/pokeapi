'use client';

import { useSearchParams } from 'next/navigation';
import { type Generation, type Type } from '@/lib/types/pokemon';
import { capitalize } from '@/lib/utils/helpers';

interface FiltersProps {
  generations: Generation[];
  types: Type[];
}

export function Filters({ generations, types }: FiltersProps) {
  const searchParams = useSearchParams();

  // Obtener tipos como array (separados por coma)
  const currentTypes = searchParams.get('type')?.split(',').filter(Boolean) || [];
  const currentGeneration = searchParams.get('generation') || '';

  // Actualizar URL sin re-render del servidor
  const updateURL = (params: URLSearchParams) => {
    const url = params.toString() ? `?${params.toString()}` : '/';
    window.history.pushState(null, '', url);
    // Disparar evento personalizado para que el componente cliente reaccione
    window.dispatchEvent(new Event('urlchange'));
  };

  // Manejar toggle de tipo (agregar o quitar)
  const handleTypeToggle = (typeName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    let newTypes: string[];
    if (currentTypes.includes(typeName)) {
      // Quitar el tipo si ya está seleccionado
      newTypes = currentTypes.filter(t => t !== typeName);
    } else {
      // Agregar el tipo si no está seleccionado
      newTypes = [...currentTypes, typeName];
    }

    if (newTypes.length > 0) {
      params.set('type', newTypes.join(','));
    } else {
      params.delete('type');
    }

    // Reset a la primera página cuando cambian los filtros
    params.set('page', '1');

    updateURL(params);
  };

  const handleGenerationChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set('generation', value);
    } else {
      params.delete('generation');
    }

    // Reset a la primera página cuando cambian los filtros
    params.set('page', '1');

    updateURL(params);
  };

  const handleClearFilters = () => {
    // Mantener la búsqueda si existe, solo limpiar type y generation
    const params = new URLSearchParams(searchParams.toString());
    params.delete('type');
    params.delete('generation');
    params.set('page', '1');
    updateURL(params);
  };

  const hasActiveFilters = currentTypes.length > 0 || currentGeneration;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col gap-6">
        {/* Type Filter - Multiple Selection */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Filter by Type (select multiple)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {types
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((type) => {
                const isSelected = currentTypes.includes(type.name);
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeToggle(type.name)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    {capitalize(type.name)}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Generation Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1 w-full">
            <label htmlFor="generation-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Generation
            </label>
            <select
              id="generation-filter"
              value={currentGeneration}
              onChange={(e) => handleGenerationChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all duration-200 cursor-pointer text-gray-900"
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
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 hover:shadow-md transition-all duration-200 whitespace-nowrap cursor-pointer font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {currentTypes.map((type) => (
            <span key={type} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Type: {capitalize(type)}
              <button
                onClick={() => handleTypeToggle(type)}
                className="ml-1 hover:text-blue-900 hover:scale-110 transition-all duration-200 cursor-pointer font-bold"
                aria-label={`Remove ${type} filter`}
              >
                ×
              </button>
            </span>
          ))}
          {currentGeneration && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Gen {getRomanNumeral(parseInt(currentGeneration))}
              <button
                onClick={() => handleGenerationChange('')}
                className="ml-1 hover:text-purple-900 hover:scale-110 transition-all duration-200 cursor-pointer font-bold"
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
