# Skaut IA

Agente de inteligencia artificial para análisis de oportunidades de inversión y negocio a nivel nacional en Colombia.

## Stack tecnológico

- **Next.js 15** — App Router, Server Components, API Routes
- **React 19** + **TypeScript**
- **Tailwind CSS 4** — Diseño responsive y moderno
- **react-globe.gl** + **Three.js** — Globo terráqueo 3D centrado en Colombia
- **Recharts** — Gráficos de métricas sectoriales
- **Lucide React** — Iconografía

## Fuentes de datos

- [Banco Mundial (World Bank Open Data)](https://data.worldbank.org/country/colombia) — Inflación, PIB, desempleo
- DANE — Estadísticas nacionales
- Banco de la República — Tasas de interés, TRM, IED

## Inicio rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Configuración del agente IA

Copia `.env.example` a `.env.local` y agrega tu clave de OpenAI:

```
OPENAI_API_KEY=sk-...
```

Sin la clave, el chat funciona con respuestas inteligentes predefinidas basadas en contexto colombiano.

## Estructura

```
src/
├── app/              # Páginas y API routes
├── components/       # UI: sidebar, globo, métricas, chat
├── lib/              # Datos y constantes
└── types/            # Tipos TypeScript
```

## Vistas

| Vista | Descripción |
|-------|-------------|
| Estrategia | Métricas sectoriales e índices de valorización |
| Seguridad | Estabilidad macro y volatilidad |
| Inteligencia | IED, innovación, rotación sectorial |
| Predicciones | Proyecciones PIB, inflación, inmobiliario |
