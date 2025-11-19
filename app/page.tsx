import { Suspense } from 'react';
import { Filters } from '@/components/filters';
import { PokemonList } from '@/components/pokemon-list';
import { Pagination } from '@/components/pagination';
import { getAllGenerations, getAllTypes, getFilteredPokemonList } from '@/lib/api/pokeapi';

const ITEMS_PER_PAGE = 50;

interface SearchParams {
  type?: string;
  generation?: string;
  page?: string;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const typeFilter = params.type;
  const generationFilter = params.generation;

  // Obtener datos necesarios para los filtros
  const [generations, types, { pokemon, total, totalFiltered }] = await Promise.all([
    getAllGenerations(),
    getAllTypes(),
    getFilteredPokemonList(
      {
        type: typeFilter,
        generation: generationFilter,
        page: currentPage,
      },
      ITEMS_PER_PAGE
    ),
  ]);

  const totalPages = Math.ceil(totalFiltered / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Pokédex
          </h1>
          <p className="text-gray-600 text-lg">
            Explore all {total} Pokémon from all generations
          </p>
        </header>

        {/* Filters */}
        <Suspense fallback={<div className="h-32 bg-white rounded-lg shadow-md animate-pulse" />}>
          <Filters generations={generations} types={types} />
        </Suspense>

        {/* Pokemon List */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <div key={i} className="h-96 bg-white rounded-lg shadow-md animate-pulse" />
              ))}
            </div>
          }
        >
          <PokemonList pokemon={pokemon} />
        </Suspense>

        {/* Pagination */}
        {totalFiltered > ITEMS_PER_PAGE && (
          <Suspense fallback={<div className="h-16 mt-8" />}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalFiltered}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
