# AgroVerse — Estado del proyecto

## Concepto
Juego de simulación agrícola colombiana para MiniPay (Celo blockchain).
- Farmer pixel art que camina hacia parcelas
- 3 zonas de Colombia: Eje Cafetero ☕, Cundinamarca 🌸, Valle del Cauca 🎋
- 3 parcelas por jugador, cultivos con timers reales
- Puntos convertibles en USDT
- Ranking nacional con premio mensual (alianza con cafeteros)
- Marketplace de skins creadas por ilustradores colombianos

## Stack
- Next.js 14 + TypeScript + Tailwind
- Phaser.js (juego 2D, corre en browser/MiniPay)
- Viem (conexión Celo blockchain)
- Supabase (pendiente — persistencia)
- Celo Sepolia testnet → Mainnet

## Estructura de archivos clave
```
src/
├── types/index.ts          ← tipos: Plot, Crop, Zone, Skin, Player, Ranking
├── types/window.d.ts       ← tipado window.ethereum para MiniPay
├── lib/constants.ts        ← zonas, cultivos, skins, GAME_CONFIG, CELO_CONFIG
├── lib/viem.ts             ← publicClient, getWalletClient, isMiniPay()
├── hooks/useWallet.ts      ← wallet state, balances USDT/USDm
├── game/scenes/FarmScene.ts ← escena Phaser (mapa, campesino, parcelas)
├── components/
│   ├── game/GameApp.tsx    ← orquestador principal, tabs, estado global
│   ├── game/PhaserFarm.tsx ← wrapper React→Phaser + overlays React
│   ├── game/FarmGrid.tsx   ← versión fallback sin Phaser (no usada actualmente)
│   ├── wallet/WalletBar.tsx
│   ├── ui/ZoneSelector.tsx
│   ├── ui/Profile.tsx      ← avatar grande, stats, skins
│   ├── ui/Ranking.tsx      ← top Colombia mock
│   └── ui/Marketplace.tsx  ← tienda skins
```

## Paleta de colores
- Fondo: `#fef9f0` (crema cálida) — forzado modo claro siempre
- Header: `bg-green-700`
- Parcelas: blanco/crema con bordes ámbar
- Cielo Phaser: `#87ceeb`

## Estado actual del MVP (Jun 5, 2026)
- ✅ Onboarding slider 4 slides con farm-background + logo
- ✅ ZoneSelector — 3 zonas Colombia
- ✅ FarmView — 3 parcelas, semillas básicas + premium (demo), timers
- ✅ Ranking mock con prize pool
- ✅ Marketplace skins (4 skins)
- ✅ Perfil con avatar grande
- ✅ Logo pixel art integrado en 3 lugares
- ✅ PDF pitch deck generado (AgroVerse_Pitch.pdf)
- ✅ Modo demo (sin wallet)
- ✅ Paleta clara forzada (sin dark mode)

## Para correr el proyecto
```bash
cd /Users/users/Documents/HACKATHON/celo-project/agroverse
npm run dev -- --port 3001
```

## Para ver preview en Claude Code
Abrir Claude Code apuntando a la carpeta agroverse:
```bash
claude /Users/users/Documents/HACKATHON/celo-project/agroverse
```

## Pendiente (próximos sprints)
1. **Sprites Midjourney** — reemplazar gráficos Phaser por PNG reales
2. **Supabase** — persistir plots, puntos, nivel entre sesiones
3. **Smart contract** — puntos → USDT en Celo Sepolia
4. **ngrok** — prueba en MiniPay físico
5. **Ilustrador skins** — marketplace real

## Prompts Midjourney para sprites (LEER ESTO)

### Campesino (spritesheet)
```
pixel art spritesheet, Colombian farmer character, walking animation 4 frames,
top-down view, wearing traditional ruana, straw hat, machete, 
32x32 pixels per frame, transparent background, warm colors, 
game asset style, white background --ar 4:1 --style raw
```

### Parcela vacía
```
pixel art farm plot, top-down view, tilled soil, brown earth,
Colombian farm, 64x48 pixels, game asset, transparent background --style raw
```

### Cultivo café en etapas (4 frames: semilla, brote, planta, cosecha)
```
pixel art coffee plant growth stages 4 frames, top-down view,
Colombian coffee plant, seed to harvest, 32x32 each, 
warm green colors, game asset, transparent background --ar 4:1 --style raw
```

### Fondo de la finca
```
pixel art Colombian farm background, top-down view, green grass, 
blue sky, Andes mountains in distance, warm sunny day, 360x420 pixels,
no characters, Stardew Valley style --ar 6:7 --style raw
```

### Árboles decorativos
```
pixel art Colombian farm trees, top-down view, 2 trees,
lush green, tropical, 48x64 each, transparent background,
game asset style --style raw
```

## Comandos útiles
```bash
cd /Users/users/Documents/HACKATHON/agroverse
npm run dev          # servidor en localhost:3000
# Para MiniPay físico:
ngrok http 3000      # luego pegar URL en MiniPay Developer Mode
```

## Grants a aplicar
- Proof of Ship S2: antes del 30 Jun 2026 → hasta $2,000 USDT
- Celo Builder Fund: cuando tengamos 1K MAU → $25K SAFE
- Prezenti Anchor: hasta $25K — aplica en https://anchor.prezenti.xyz
