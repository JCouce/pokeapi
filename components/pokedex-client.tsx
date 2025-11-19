'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PokemonList } from './pokemon-list';
import { Pagination } from './pagination';
import { type EnrichedPokemon } from '@/lib/types/pokemon';
import { applyFilters } from '@/lib/utils/helpers';

interface PokedexClientProps {
  allPokemon: EnrichedPokemon[];
  itemsPerPage: number;
}

/**
 * Componente 100% cliente que maneja TODA la lógica de filtrado y paginación.
 * 
 * Ventajas:
 * - Filtros instantáneos (sin llamadas al servidor)
 * - Paginación instantánea
 * - URL actualizada para compartir
 * - Sin re-renders del servidor
 */
export function PokedexClient({ allPokemon, itemsPerPage }: PokedexClientProps) {
  const searchParams = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const typeFilter = searchParams.get('type') || '';
  const generationFilter = searchParams.get('generation') || '';
  const searchFilter = searchParams.get('search') || '';

  // Escuchar cambios de URL sin re-render del servidor
  useEffect(() => {
    const handleURLChange = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('urlchange', handleURLChange);
    window.addEventListener('popstate', handleURLChange);

    return () => {
      window.removeEventListener('urlchange', handleURLChange);
      window.removeEventListener('popstate', handleURLChange);
    };
  }, []);

  // Aplicar filtros y paginación en memoria (instantáneo)
  const { paginatedPokemon, totalFiltered, totalPages } = useMemo(() => {
    // 1. Aplicar filtros
    const filtered = applyFilters(allPokemon, {
      type: typeFilter,
      generation: generationFilter,
      search: searchFilter,
    });

    // 2. Calcular paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    return {
      paginatedPokemon: paginated,
      totalFiltered: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    };
  }, [allPokemon, typeFilter, generationFilter, searchFilter, currentPage, itemsPerPage, refreshKey]);

  // Si la página actual es mayor que el total de páginas, volver a la página 1
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', '1');
      const url = `?${params.toString()}`;
      window.history.pushState(null, '', url);
      window.dispatchEvent(new Event('urlchange'));
    }
  }, [currentPage, totalPages, searchParams]);

  return (
    <>
      {/* Pokemon List */}
      <PokemonList pokemon={paginatedPokemon} />

      {/* Paginación */}
      {totalFiltered > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalFiltered}
          itemsPerPage={itemsPerPage}
        />
      )}
    </>
  );
}
