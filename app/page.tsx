import { Suspense } from 'react';
import { Filters } from '@/components/filters';
import { SearchBar } from '@/components/search-bar';
import { PokedexClient } from '@/components/pokedex-client';
import { getAllGenerations, getAllTypes, getCachedAllPokemon } from '@/lib/api/pokeapi';

const ITEMS_PER_PAGE = 50;

export default async function Home() {
  // Cargar TODOS los datos una sola vez en el servidor
  // El cliente manejará filtros y paginación instantáneamente
  const [generations, types, allPokemon] = await Promise.all([
    getAllGenerations(),
    getAllTypes(),
    getCachedAllPokemon(), // Versión cacheada - <100ms después del primer request
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Pokédex
          </h1>
          <p className="text-gray-600 text-lg">
            Explore all {allPokemon.length} Pokémon from all generations
          </p>
        </header>

        {/* Search Bar */}
        <Suspense fallback={<div className="h-16 bg-white rounded-lg shadow-md animate-pulse mb-6" />}>
          <div className="mb-6">
            <SearchBar />
          </div>
        </Suspense>

        {/* Filters */}
        <Suspense fallback={<div className="h-32 bg-white rounded-lg shadow-md animate-pulse" />}>
          <Filters generations={generations} types={types} />
        </Suspense>

        {/* Pokemon List - 100% cliente para filtros instantáneos */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <div key={i} className="h-96 bg-white rounded-lg shadow-md animate-pulse" />
              ))}
            </div>
          }
        >
          <PokedexClient allPokemon={allPokemon} itemsPerPage={ITEMS_PER_PAGE} />
        </Suspense>
      </div>
    </div>
  );
}
