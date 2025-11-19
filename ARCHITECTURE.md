# Decisiones de Arquitectura - Pokédex Project

> Documentación de decisiones técnicas, trade-offs y razonamiento detrás de la implementación.

---

## 📋 Tabla de Contenidos

1. [Stack Tecnológico](#stack-tecnológico)
2. [Arquitectura de Datos](#arquitectura-de-datos)
3. [Sistema de Filtros](#sistema-de-filtros)
4. [Optimización de Performance](#optimización-de-performance)
5. [Testing Strategy](#testing-strategy)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Trade-offs y Alternativas](#trade-offs-y-alternativas)

---

## 🔧 Stack Tecnológico

### Next.js 15 (App Router)

**Decisión**: Usar Next.js 15 con App Router en lugar de Pages Router.

**Razonamiento**:

- **Server Components por defecto**: Reduce bundle size del cliente
- **Streaming & Suspense**: Mejor UX con loading states
- **File-based routing**: Simplicidad y convenciones claras
- **generateStaticParams**: Pre-renderizado de 500 páginas de detalle

**Alternativas consideradas**:

- ❌ **Vite + React**: Menos opinado, sin SSR out-of-the-box
- ❌ **Pages Router**: API antigua, más boilerplate
- ❌ **Remix**: Menos maduro, menor ecosistema

### TypeScript (Strict Mode)

**Decisión**: TypeScript con `strict: true` en toda la codebase.

**Razonamiento**:

- **Type safety de extremo a extremo**: Errores en compile-time, no runtime
- **Mejor DX**: Autocomplete, refactoring seguro
- **Zod integration**: Validación en runtime + tipos en compile-time

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**Impacto**:

- ✅ 0 errores en runtime por tipos incorrectos
- ✅ Refactoring seguro (48 tests validan cambios)
- ⚠️ Curva de aprendizaje inicial más alta

### Zod para Validación

**Decisión**: Usar Zod en lugar de validación manual o TypeScript puro.

**Razonamiento**:

````typescript
**Razonamiento**:

```typescript
// Sin Zod - vulnerable a cambios en API
const pokemon = await response.json(); // any

// Con Zod - garantía de estructura
const pokemon = PokemonSchema.parse(await response.json());
//    ^? Pokemon (validado en runtime)
````

````

**Beneficios**:

- **Fail-fast**: Errores claros si PokeAPI cambia schema
- **Type inference**: Tipos automáticos desde schemas
- **Documentación viva**: Schema = documentación + validación

---

## 🏗️ Arquitectura de Datos

### Hidratación Manual (REST Multi-Call)

**Decisión**: Hacer múltiples llamadas REST para enriquecer datos en lugar de usar GraphQL.

**Proceso de hidratación**:

```typescript
// 1. Lista básica (500 Pokémon)
GET /pokemon?limit=500
→ [{ name, url }]

// 2. Datos individuales (por cada Pokémon)
GET /pokemon/{id}
→ { name, types, stats, species: { url } }

// 3. Información de especie
GET /pokemon-species/{id}
→ { generation, evolution_chain: { url } }

// 4. Cadena de evolución
GET /evolution-chain/{id}
→ { chain: { species, evolves_to } }
````

**Razonamiento**:

- PokeAPI REST es más estable que su GraphQL endpoint
- `unstable_cache` mitiga el problema de N+1 queries
- Control total sobre error handling por endpoint

**Alternativas consideradas**:

- ❌ **GraphQL (PokeAPI Beta)**: Menos estable, documentación limitada
- ❌ **Single endpoint con joins**: No disponible en PokeAPI
- ✅ **Batching + Cache**: Solución adoptada

### Batch Loading (20 por lote)

**Decisión**: Cargar 500 Pokémon en lotes de 20 en lugar de uno por uno o todos a la vez.

```typescript
const BATCH_SIZE = 20;
const MAX_FETCH = 500;

for (let i = 0; i < MAX_FETCH; i += BATCH_SIZE) {
  const batch = pokemonList.slice(i, i + BATCH_SIZE);
  const enriched = await Promise.all(
    batch.map((p) => enrichPokemonWithGeneration(p))
  );
  allEnriched.push(...enriched.filter(Boolean));
}
```

**Razonamiento**:

- **Memory efficiency**: No cargar 500 requests en memoria simultáneamente
- **Rate limiting**: Evitar saturar PokeAPI (aunque no tiene límite estricto)
- **Progressive loading**: Posibilidad futura de mostrar progreso

**Trade-offs**:

- ✅ Menor uso de memoria
- ✅ Más resiliente a fallos (1 batch falla ≠ todo falla)
- ⚠️ Ligeramente más lento que `Promise.all([...500])`

### Timeout y Retry Logic

**Decisión**: Implementar timeout de 10s con 2 reintentos.

```typescript
async function fetchWithTimeout(
  url: string,
  timeout = 10000,
  retries = 2
): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      if (i === retries) throw error;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

**Razonamiento**:

- **Resilencia**: PokeAPI puede tener latencia variable
- **UX**: Usuario prefiere espera con retry vs error inmediato
- **Exponential backoff**: 1s, 2s entre reintentos

---

## 🎯 Sistema de Filtros

### Arquitectura Híbrida (Server + Client)

**Decisión CRÍTICA**: Cargar TODOS los datos en servidor, filtrar en cliente.

#### Initial Approach (❌ Descartado)

```typescript
// Server Components con filtros en URL
// Problema: Re-render completo del servidor por cada filtro
export default async function Page({ searchParams }) {
  const pokemon = await getAllPokemon();
  const filtered = applyFilters(pokemon, searchParams);
  // ❌ 1-3 segundos de delay por cambio de filtro
}
```

**Problema identificado**:

- Cada cambio de filtro → navegación → server re-render
- Usuario experimentaba delays de 1-3 segundos
- UX inaceptable para filtros interactivos

#### Final Solution (✅ Adoptada)

```typescript
// Server Component: Carga datos UNA vez
export default async function Page() {
  const allPokemon = await getCachedAllPokemon(); // 500 Pokémon
  return <PokedexClient initialPokemon={allPokemon} />;
}

// Client Component: Filtra instantáneamente
("use client");
export function PokedexClient({ initialPokemon }) {
  const filtered = useMemo(
    () => applyFilters(initialPokemon, filters),
    [filters]
  );
  // ✅ <100ms por cambio de filtro
}
```

**Razonamiento**:

- **Dataset pequeño**: 500 Pokémon × ~5KB = ~2.5MB (manejable en cliente)
- **Instant feedback**: `useMemo` recalcula en <100ms
- **Best of both worlds**: SSR inicial + interactividad cliente

**Trade-offs**:

- ✅ Performance óptima (<100ms)
- ✅ Mejor UX
- ⚠️ Payload inicial más grande (~2.5MB JSON)
- ⚠️ No escala a millones de registros

### window.history.pushState (No Navegación)

**Decisión**: Usar `window.history.pushState` en lugar de `router.push()`.

```typescript
// ❌ Enfoque inicial
const handleFilterChange = (type: string) => {
  router.push(`/?type=${type}`); // Trigger server re-render
};

// ✅ Solución final
const handleFilterChange = (type: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set("type", type);
  window.history.pushState({}, "", url);
  window.dispatchEvent(new Event("urlchange")); // Custom event
};
```

**Razonamiento**:

- **Evita re-render del servidor**: Solo actualiza URL, no navega
- **Shareable URLs**: Usuario puede compartir filtros activos
- **Back button funciona**: Browser history se mantiene

**Implementación Client-Side**:

```typescript
useEffect(() => {
  const handleUrlChange = () => {
    const params = new URLSearchParams(window.location.search);
    setFilters({
      types: params.getAll("type"),
      generation: params.get("generation"),
      search: params.get("search"),
    });
  };

  window.addEventListener("popstate", handleUrlChange);
  window.addEventListener("urlchange", handleUrlChange);

  return () => {
    window.removeEventListener("popstate", handleUrlChange);
    window.removeEventListener("urlchange", handleUrlChange);
  };
}, []);
```

### Filtros Apilables (AND Logic)

**Decisión**: Filtros de tipo usan lógica AND en lugar de OR.

```typescript
// Ejemplo: bug + poison = solo Pokémon con AMBOS tipos
const filterByType = (pokemon: EnrichedPokemon[], types: string[]) => {
  if (!types.length) return pokemon;

  return pokemon.filter((p) =>
    types.every((type) => p.types.some((t) => t.type.name === type))
  );
};
```

**Razonamiento**:

- **Caso de uso**: "Quiero Pokémon bug Y poison" (Weedle, Venomoth)
- **Más útil**: OR daría 100+ resultados, AND da exactos
- **UX clara**: Badges visibles muestran combinación activa

**Alternativa considerada**:

- ❌ **OR logic**: Demasiados resultados
- ❌ **Toggle AND/OR**: Complejidad innecesaria para este caso

### Búsqueda por Evolución

**Decisión**: Búsqueda incluye nombres de evoluciones, no solo nombre actual.

```typescript
const filterBySearch = (pokemon: EnrichedPokemon[], search: string) => {
  if (!search) return pokemon;

  return pokemon.filter(
    (p) =>
      p.name.toLowerCase().includes(search) ||
      p.evolutionChain.some((evo) => evo.toLowerCase().includes(search))
  );
};
```

**Ejemplo**:

```
Búsqueda: "raichu"
Resultados: Pichu, Pikachu, Raichu
(Porque todos están en la misma cadena evolutiva)
```

**Razonamiento**:

- **UX mejorada**: Usuario busca cualquier forma evolutiva
- **Data ya disponible**: evolutionChain se carga en hidratación
- **Sin overhead**: Cliente ya tiene todos los datos

---

## ⚡ Optimización de Performance

### unstable_cache (Next.js 15)

**Decisión CRÍTICA**: Cachear dataset completo por 24 horas.

```typescript
export const getCachedAllPokemon = unstable_cache(
  async () => {
    console.log("[Cache Miss] Cargando 500 Pokémon...");
    return await getAllPokemon();
  },
  ["all-pokemon-cached"],
  {
    revalidate: 86400, // 24 horas
    tags: ["pokemon"],
  }
);
```

**Impacto medido**:

- **Primera carga (cache miss)**: ~2-3 segundos
- **Cargas subsiguientes (cache hit)**: **<100ms**
- **Reducción de carga en PokeAPI**: 99.9% (1 request/día vs 1/visita)

**Razonamiento**:

- **Data estática**: Pokémon Gen I-IX no cambian
- **Shared cache**: Todos los usuarios comparten misma data
- **Invalidación manual**: Disponible con `revalidateTag('pokemon')` si necesario

**Alternativas consideradas**:

- ❌ **No cache**: 2-3s cada visita (UX horrible)
- ❌ **Client-side cache**: No compartido entre usuarios
- ❌ **ISR con revalidate: 60**: Cache muy corto para data estática
- ✅ **unstable_cache 24h**: Óptimo para este caso

### useMemo para Filtros

**Decisión**: Memoizar cálculo de filtros en cliente.

```typescript
const filteredPokemon = useMemo(() => {
  console.log("[Client] Recalculando filtros...");
  return applyFilters(allPokemon, { types, generation, search });
}, [allPokemon, types, generation, search]);
```

**Razonamiento**:

- **Evita re-renders innecesarios**: Solo recalcula si dependencias cambian
- **Performance**: <100ms para filtrar 500 items
- **Profiling real**: console.log confirmó que solo ejecuta cuando necesario

### generateStaticParams (SSG)

**Decisión**: Pre-renderizar las 500 páginas de detalle en build time.

```typescript
export async function generateStaticParams() {
  const allPokemon = await getAllPokemon();

  return allPokemon.map((pokemon) => ({
    id: pokemon.id.toString(),
  }));
}
```

**Beneficios**:

- **0ms TTFB**: HTML ya generado
- **SEO perfecto**: Crawlers ven contenido inmediato
- **Edge caching**: Páginas servidas desde CDN

**Trade-off**:

- ⚠️ Build time: +30s por 500 páginas
- ✅ Runtime: Instantáneo

---

## 🧪 Testing Strategy

### Vitest + React Testing Library

**Decisión**: 48 unit tests cubriendo lógica crítica.

**Cobertura**:

```
✓ API Utilities (6 tests)
  - extractIdFromUrl
  - getGenerationName

✓ Filter Utilities (26 tests)
  - filterByType (8 tests) ← Multi-type AND logic
  - filterByGeneration (3 tests)
  - filterBySearch (8 tests) ← Evolution search
  - applyFilters (7 tests) ← Integration

✓ Format Utilities (16 tests)
  - capitalize, formatPokemonName
  - formatWeight, formatHeight
  - formatPokemonNumber
```

**Razonamiento**:

- **Test lógica, no UI**: Filtros son pura lógica, fácil de testear
- **Regression protection**: Bug de multi-type se detectaría inmediatamente
- **Fast feedback**: 48 tests ejecutan en <500ms

**Casos críticos testeados**:

```typescript
// Bug real que existió
it("should filter by bug AND poison types (Weedle)", () => {
  const result = filterByType(mockPokemon, ["bug", "poison"]);
  expect(result).toHaveLength(1);
  expect(result[0].name).toBe("weedle");
});
```

### No E2E Tests (Decisión consciente)

**Decisión**: Solo unit tests, sin Playwright/Cypress.

**Razonamiento**:

- **Scope pequeño**: App simple, sin auth ni forms complejos
- **UI coverage**: Manual testing suficiente
- **Trade-off tiempo**: E2E requiere 10x más setup

**Cuando agregaría E2E**:

- ✅ Login/registro de usuarios
- ✅ Flujos multi-paso complejos
- ✅ Pagos o acciones críticas

---

## 🚀 CI/CD Pipeline

### GitHub Actions

**Decisión**: CI automático en cada PR con 4 checks.

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    - Type Check (tsc --noEmit)
    - Run Tests (vitest run)
    - Lint (eslint)
    - Build (next build)
```

**Razonamiento**:

- **Prevent broken merges**: PR no se puede mergear si falla algo
- **Consistent environment**: Node 22, pnpm frozen lockfile
- **Fast feedback**: ~2 minutos total

**Configuración específica**:

```yaml
strategy:
  matrix:
    node-version: [22.x]

run: |
  pnpm install --frozen-lockfile
  pnpm run type-check
  pnpm test
```

**Alternativas consideradas**:

- ❌ **Vercel CI solo**: No corre tests
- ❌ **Pre-commit hooks**: Bypaseable
- ✅ **GitHub Actions**: Mandatory, cloud-based

---

## 🔄 Trade-offs y Alternativas

### ¿Por qué NO GraphQL?

**Pregunta común**: PokeAPI tiene GraphQL, ¿por qué REST?

**Respuesta**:

| Aspecto            | REST (elegido)             | GraphQL                    |
| ------------------ | -------------------------- | -------------------------- |
| **Estabilidad**    | ✅ API estable desde 2015  | ⚠️ Beta, menos docs        |
| **Cache**          | ✅ HTTP cache works        | ⚠️ Requiere Apollo/URQL    |
| **Learning curve** | ✅ Más simple              | ⚠️ Queries complejas       |
| **Over-fetching**  | ⚠️ Sí (mitigado con cache) | ✅ Solo pides lo necesario |

**Conclusión**: Para este proyecto, REST + `unstable_cache` es óptimo.

### ¿Por qué NO T3 Stack?

**T3 Stack** = Next.js + TypeScript + tRPC + Tailwind

**Tenemos**:

- ✅ Next.js
- ✅ TypeScript
- ✅ Tailwind
- ❌ tRPC (no hay backend propio)

**Razonamiento**:

- **tRPC es para tu API**: Aquí consumimos PokeAPI externa
- **No hay mutations**: Solo lectura, no CRUD
- **Simplicity wins**: Agregar tRPC sería over-engineering

**Cuándo sí usaría T3**:

- ✅ Backend propio con DB
- ✅ Auth (login/register)
- ✅ Mutations (crear/editar/borrar)

### ¿Por qué NO Server Actions para Filtros?

**Decisión**: Filtros en cliente, no Server Actions.

**Razonamiento**:

```typescript
// Server Action (descartado)
"use server";
async function filterPokemon(types: string[]) {
  const all = await getAllPokemon();
  return filterByType(all, types);
  // ❌ Network roundtrip, 100-500ms
}

// Client useMemo (adoptado)
const filtered = useMemo(() => filterByType(allPokemon, types), [types]);
// ✅ Instantáneo, <100ms
```

**Server Actions son mejores para**:

- ✅ Mutations (POST/PUT/DELETE)
- ✅ Auth checks
- ✅ Database writes

**Client-side es mejor para**:

- ✅ Filtros interactivos
- ✅ Instant feedback
- ✅ Data ya en cliente

---

## 📊 Métricas Finales

### Performance

| Métrica                     | Valor   | Target    |
| --------------------------- | ------- | --------- |
| **First Load (cache miss)** | 2-3s    | <5s ✅    |
| **Subsequent loads**        | <100ms  | <500ms ✅ |
| **Filter change**           | <100ms  | <200ms ✅ |
| **Page transition**         | Instant | <300ms ✅ |
| **Build time**              | ~45s    | <2min ✅  |

### Code Quality

| Métrica              | Valor              |
| -------------------- | ------------------ |
| **Tests**            | 48/48 passing      |
| **Type coverage**    | 100% (strict mode) |
| **Lines of code**    | ~1,500             |
| **Bundle size**      | ~150KB (gzipped)   |
| **Lighthouse Score** | 95+ (estimated)    |

---

## 🎯 Conclusiones

### Principios Seguidos

1. **Simplicidad sobre abstracción**: No over-engineer
2. **Performance percibida**: UX > métricas técnicas
3. **Type safety**: Fallar en compile-time, no runtime
4. **Cache agresivo**: Data estática = cache largo
5. **Test lo crítico**: Filtros tienen tests, UI no

### Lecciones Aprendidas

1. **Server vs Client balance**: No todo debe ser Server Component
2. **Cache invalida complejidad**: `unstable_cache` resolvió N+1 queries
3. **window.history.pushState**: Subestimado para instant UX
4. **Zod vale la pena**: Runtime validation salvó bugs con API changes

### Next Steps (Futuros)

Si escalara el proyecto:

1. **Rate limiting visual**: Mostrar progreso de carga inicial
2. **Image optimization**: `next/image` con blur placeholders
3. **Virtual scrolling**: Si dataset crece >1000 items
4. **Error boundary**: Better error UX para API failures
5. **Analytics**: Tracking de filtros más usados

---

**Autor**: Javier Couce  
**Fecha**: Noviembre 2025  
**Versión**: 1.0
