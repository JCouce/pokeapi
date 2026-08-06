# Pokédex - Next.js 16 & TypeScript

[![CI](https://github.com/JCouce/pokeapi/actions/workflows/ci.yml/badge.svg)](https://github.com/JCouce/pokeapi/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tests](https://img.shields.io/badge/tests-48%20passing-green)

A modern, fully-featured Pokédex application built with Next.js 16, TypeScript, and the PokéAPI. Features server-side rendering, advanced filtering, and pagination.

## Getting Started

## 🚀 FeaturesFirst, run the development server:

### ✅ Implemented (Phase 1 & 2)```bash

npm run dev

- **Complete Pokémon Listing**: Display all 1025+ Pokémon from generations I-IX# or

- **Advanced Filtering**:yarn dev

  - Filter by Pokémon type (18 types available)# or

  - Filter by generation (I-IX)pnpm dev

  - Combined filters (type AND generation)# or

  - Active filters display with quick removebun dev

- **Pagination**: 50 items per page with full navigation controls```

- **Detailed Pokémon Cards**:

  - Name and IDOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

  - Official artwork

  - Types with color codingYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

  - Generation

  - Height and weight

- **Optimized Performance**:

  - Server Components for initial rendering## Learn More

  - Data caching with Next.js

  - Efficient API callsTo learn more about Next.js, take a look at the following resources:

- **Responsive Design**: Mobile-first, adapts from 1 to 4 columns

- **Loading & Error States**: Skeleton loaders and error boundaries

- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

### 🚧 Upcoming (Phase 3 & 4)

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

- **Phase 3**: Search by name functionality

- **Phase 4**: Individual Pokémon detail pages## Deploy on Vercel

## 🛠️ Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)

- **Language**: TypeScript 5.9.3
- **Styling**: TailwindCSS 4.1.17
- **Data Validation**: Zod 4.1.12
- **Testing**: Vitest 4.0.10 + React Testing Library
- **Package Manager**: pnpm 10.18.2
- **API**: [PokéAPI v2](https://pokeapi.co/)

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd pokeapi

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 🏗️ Project Structure

```
pokeapi/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx             # Main page (Pokemon listing)
│   ├── loading.tsx          # Loading skeleton
│   ├── error.tsx            # Error boundary
│   ├── not-found.tsx        # 404 page
│   └── globals.css          # Global styles
├── components/
│   ├── filters.tsx          # Type & generation filters (Client Component)
│   ├── pokemon-card.tsx     # Pokemon card display (Server Component)
│   ├── pokemon-list.tsx     # Pokemon grid (Server Component)
│   └── pagination.tsx       # Pagination controls (Client Component)
├── lib/
│   ├── api/
│   │   └── pokeapi.ts       # PokeAPI integration functions
│   ├── types/
│   │   └── pokemon.ts       # TypeScript types & Zod schemas
│   └── utils/
│       └── helpers.ts       # Utility functions
├── __tests__/
│   └── lib/
│       └── api/
│           └── pokeapi.test.ts  # Unit tests (33 tests)
├── vitest.config.ts         # Vitest configuration
├── vitest.setup.ts          # Test setup
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## 🧪 Testing

The project includes comprehensive unit tests for critical functionality:

- ✅ API utility functions (ID extraction, generation formatting)
- ✅ Filter utilities (by type, by generation, search by name/evolution)
- ✅ Format utilities (names, weights, heights, numbers)
- ✅ Evolution chain logic

**Test Coverage**: 48 passing tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

## 🔄 CI/CD

The project uses **GitHub Actions** for continuous integration:

### Automated Checks on Pull Requests:

- ✅ **Type Checking**: Verifies TypeScript types
- ✅ **Linting**: Runs ESLint
- ✅ **Unit Tests**: Executes all 48 tests
- ✅ **Build**: Ensures production build succeeds

### Workflow Configuration

Located at `.github/workflows/ci.yml`, the CI pipeline:

- Runs on every PR to `main` or `develop`
- Uses Node.js 20.x with pnpm
- Caches dependencies for faster runs
- Runs in parallel (test + lint jobs)

To see the CI status, check the badge at the top of this README or visit the Actions tab in GitHub.

## 🎨 Component Architecture

### Server Components

- `pokemon-list.tsx`: Renders the grid of Pokémon cards
- `pokemon-card.tsx`: Displays individual Pokémon information

### Client Components

- `filters.tsx`: Interactive filters with URL state management
- `pagination.tsx`: Page navigation with URL parameters

### Data Flow

1. URL search parameters define filters and page
2. Server fetches filtered data from PokeAPI
3. Data is cached on the server
4. Server Components render static HTML
5. Client Components hydrate for interactivity
6. Filter/pagination changes update URL and trigger re-fetch

## 🔧 Configuration

### Environment Variables

No environment variables required. The app uses the public PokéAPI.

### Caching Strategy

- **Static Generation**: Filter dropdowns (generations, types)
- **Server-side Caching**: Pokémon data (24-hour revalidation)
- **Client-side Navigation**: URL-based state persistence

## 📊 API Integration

### PokeAPI Endpoints Used

- `/pokemon` - List all Pokémon
- `/pokemon/{id}` - Individual Pokémon details
- `/pokemon-species/{id}` - Species info (generation)
- `/generation` - All generations
- `/type` - All Pokémon types

### Data Optimization

- Parallel requests with `Promise.all()`
- Efficient pagination (only fetch needed data when no filters)
- Zod validation for type safety
- Next.js automatic caching

## 🎯 Development Decisions

### Why Next.js 16?

- Latest features (Server Actions, improved caching)
- App Router for better performance
- Built-in optimization (images, fonts, scripts)
- Server Components by default

### Why Server Components?

- Faster initial page load
- Reduced JavaScript bundle size
- SEO-friendly
- Better performance on low-end devices

### Why pnpm?

- Faster than npm/yarn
- Efficient disk space usage
- Strict dependency resolution
- Better monorepo support

### Why Zod?

- Runtime type validation
- Type inference for TypeScript
- API data validation
- Better error messages

## 🚀 Performance

- **Initial Load**: Server-rendered HTML
- **Caching**: 24-hour revalidation for static data
- **Images**: Next.js Image optimization
- **Hydration**: Minimal client-side JavaScript
- **Pagination**: Prevents loading all 1025 Pokémon at once

## 📝 Git Commit History

The project follows conventional commits:

1. `feat: initial project setup` - Project scaffolding, types, API layer, tests
2. `feat: implement Pokemon listing with filters and pagination` - UI components, filters, pagination
3. `feat: add loading and error states` - UX improvements

## 🤝 Contributing

This is a learning/demo project. Feel free to fork and modify!

## 📄 License

MIT

## 🙏 Acknowledgments

- [PokéAPI](https://pokeapi.co/) for the comprehensive Pokémon data
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Vercel](https://vercel.com/) for hosting capabilities

---

**Built with ❤️ using Next.js 16 and TypeScript**
