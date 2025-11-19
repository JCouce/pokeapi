import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getEnrichedPokemon, getAllPokemonBasic, extractIdFromUrl } from '@/lib/api/pokeapi';
import {
  formatPokemonName,
  formatPokemonNumber,
  formatHeight,
  formatWeight,
  getTypeColor,
  capitalize,
} from '@/lib/utils/helpers';
import { ArrowLeft } from 'lucide-react';

interface PokemonPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  const allPokemon = await getAllPokemonBasic();
  // Generar solo los primeros 500 para no sobrecargar
  return allPokemon.slice(0, 500).map((p) => ({
    id: extractIdFromUrl(p.url).toString(),
  }));
}

export default async function PokemonPage({ params }: PokemonPageProps) {
  const { id } = await params;
  const pokemon = await getEnrichedPokemon(id);

  if (!pokemon) {
    notFound();
  }

  // Obtener datos de las evoluciones
  const evolutionData = await Promise.all(
    pokemon.evolutionChain.map(async (name) => {
      try {
        const evo = await getEnrichedPokemon(name);
        return evo;
      } catch {
        return null;
      }
    })
  );

  const evolutions = evolutionData.filter((e) => e !== null);

  // Calcular el total de stats para la barra de porcentaje
  const maxStatValue = 255; // Valor máximo típico de stats en Pokémon
  const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.value, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-gray-700 hover:text-purple-600"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Pokédex</span>
        </Link>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">{formatPokemonName(pokemon.name)}</h1>
                <p className="text-xl opacity-90">{pokemon.generationName}</p>
              </div>
              <span className="text-3xl font-mono opacity-90">{formatPokemonNumber(pokemon.id)}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Left Column - Image and Basic Info */}
            <div className="space-y-6">
              {/* Image */}
              <div className="relative h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                {pokemon.sprite ? (
                  <Image
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    width={300}
                    height={300}
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-9xl mb-4">?</div>
                    <div className="text-xl">No image available</div>
                  </div>
                )}
              </div>

              {/* Types */}
              <div>
                <h2 className="text-lg font-bold text-gray-700 mb-3">Types</h2>
                <div className="flex gap-3">
                  {pokemon.types.map((type) => (
                    <span
                      key={type.slot}
                      className={`${getTypeColor(
                        type.name
                      )} text-white px-6 py-2 rounded-full text-lg font-medium shadow-md`}
                    >
                      {capitalize(type.name)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Physical Attributes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Height</h3>
                  <p className="text-2xl text-gray-800 font-bold">{formatHeight(pokemon.height)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Weight</h3>
                  <p className="text-2xl text-gray-800 font-bold">{formatWeight(pokemon.weight)}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Stats and Evolution */}
            <div className="space-y-6">
              {/* Stats */}
              <div>
                <h2 className="text-lg font-bold text-gray-700 mb-4">Base Stats</h2>
                <div className="space-y-3">
                  {pokemon.stats.map((stat) => (
                    <div key={stat.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-600 uppercase">
                          {stat.name.replace('-', ' ')}
                        </span>
                        <span className="text-sm font-bold text-gray-800">{stat.value}</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                          style={{ width: `${(stat.value / maxStatValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-700 uppercase">Total</span>
                      <span className="text-lg font-bold text-purple-600">{totalStats}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evolution Chain */}
              <div>
                <h2 className="text-lg font-bold text-gray-700 mb-4">Evolution Chain</h2>
                <div className="flex flex-wrap gap-4">
                  {evolutions.map((evo) => (
                    <Link
                      key={evo.id}
                      href={`/pokemon/${evo.id}`}
                      className={`relative flex-1 min-w-[140px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 transition-all duration-200 ${
                        evo.id === pokemon.id
                          ? 'ring-4 ring-purple-500 shadow-lg scale-105'
                          : 'hover:shadow-md hover:scale-105 opacity-75 hover:opacity-100'
                      }`}
                    >
                      {evo.id === pokemon.id && (
                        <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Current
                        </div>
                      )}
                      <div className="text-center">
                        {evo.sprite && (
                          <Image
                            src={evo.sprite}
                            alt={evo.name}
                            width={100}
                            height={100}
                            className="object-contain mx-auto mb-2"
                          />
                        )}
                        <p className="font-medium text-gray-800">{formatPokemonName(evo.name)}</p>
                        <p className="text-xs text-gray-500 font-mono">
                          {formatPokemonNumber(evo.id)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
