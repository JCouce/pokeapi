'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PokemonList } from './pokemon-list';
import { Pagination } from './pagination';
import { type EnrichedPokemon } from '@/lib/types/pokemon';
import { applyFilters } from '@/lib/utils/helpers';

interface PokemonListWrapperProps {
  initialPokemon: EnrichedPokemon[];
  total: number;
  hasFilters: boolean;
  itemsPerPage: number;
}

/**
 * Componente híbrido inteligente para optimizar el rendimiento de filtros:
 * 
 * - Sin filtros: Muestra los Pokémon de la página actual (server-side pagination)
 * - Con filtros: Usa caché en cliente para filtrado instantáneo
 * 
 * Estrategia:
 * 1. Primera carga sin filtros: Solo 50 Pokémon (rápido)
 * 2. Al activar primer filtro: Servidor envía 300-500 Pokémon pre-cargados
 * 3. Cambios de filtro siguientes: Filtrado instantáneo en cliente
 * 4. Sin filtros de nuevo: Vuelve a paginación server-side
 */
export function PokemonListWrapper({
  initialPokemon,
  total,
  hasFilters,
  itemsPerPage,
}: PokemonListWrapperProps) {
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const typeFilter = searchParams.get('type') || '';
  const generationFilter = searchParams.get('generation') || '';

  // Determinar si debemos usar filtrado en cliente
  const shouldUseClientFiltering = hasFilters && initialPokemon.length > itemsPerPage;

  // Filtrado y paginación en cliente (cuando hay filtros)
  const { paginatedPokemon, totalFiltered, totalPages } = useMemo(() => {
    if (!shouldUseClientFiltering) {
      // Server-side: usar datos tal cual vienen
      return {
        paginatedPokemon: initialPokemon,
        totalFiltered: total,
        totalPages: Math.ceil(total / itemsPerPage),
      };
    }

    // Client-side: aplicar filtros sobre todos los Pokémon
    const filtered = applyFilters(initialPokemon, {
      type: typeFilter,
      generation: generationFilter,
    });

    // Paginar los resultados filtrados
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    return {
      paginatedPokemon: paginated,
      totalFiltered: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    };
  }, [
    shouldUseClientFiltering,
    initialPokemon,
    typeFilter,
    generationFilter,
    currentPage,
    itemsPerPage,
    total,
  ]);

  return (
    <>
      <PokemonList pokemon={paginatedPokemon} />

      {/* Mostrar paginación solo si hay más de una página */}
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
