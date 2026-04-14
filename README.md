# TravelTech Solutions — Arquitectura Multi-Cloud

Plataforma web de planificació de viatges basada en microserveis independents desplegats en operadors cloud diferents.

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                  USUARI (navegador)                  │
└──────────────────────────┬──────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  FRONTEND   │  ← Render/Netlify
                    │  (port 3000)│
                    └──┬──┬──┬───┘
                       │  │  │
          ┌────────────┘  │  └────────────┐
          │               │               │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
   │  FAVORITES  │ │  WISHLIST   │ │   HISTORY   │
   │  (port 3001)│ │  (port 3002)│ │  (port 3003)│
   │   Render    │ │   Railway   │ │   Fly.io    │
   └─────────────┘ └─────────────┘ └─────────────┘
          │
   ┌──────▼──────┐
   │RestCountries│  ← API externa
   │    API      │
   └─────────────┘
```

## Components

| Component         | Tecnologia       | Cloud      | Port  |
|-------------------|------------------|------------|-------|
| Frontend          | Node + Express   | Render     | 3000  |
| service-favorites | Node + Express   | Render     | 3001  |
| service-wishlist  | Node + Express   | Railway    | 3002  |
| service-history   | Node + Express   | Fly.io     | 3003  |
| API externa       | RestCountries v3 | —          | —     |

## Microserveis

### service-favorites (reutilitzat/adaptat)
Permet guardar i recuperar els països marcats com a favorits.

### service-wishlist (NOU)
Gestiona la llista de països que l'usuari vol visitar en el futur, amb motiu opcional.

### service-history (NOU)
Registra les cerques realitzades, permet consultar-les i esborrar-les. Màxim 50 entrades.

## Desplegament local (desenvolupament)

```bash
# Terminal 1 — Favorites
cd service-favorites && npm install && npm start

# Terminal 2 — Wishlist
cd service-wishlist && npm install && npm start

# Terminal 3 — History
cd service-history && npm install && npm start

# Terminal 4 — Frontend
cd frontend && npm install && npm start
```

Obre http://localhost:3000

> Recorda activar les URLs locals al `script.js` (secció CONFIG comentada).

## URLs de producció

| Servei       | URL                                         |
|--------------|---------------------------------------------|
| Frontend     | https://traveltech-frontend.onrender.com           |
| Favorites    | https://service-favorites.onrender.com             |
| Wishlist     | https://traveltech-multicloud-mq85.vercel.app      |
| History      | https://traveltech-multicloud-yydf.vercel.app      |

> Actualitzar amb les URLs reals un cop desplegats.

## Memòria tècnica

### Serveis creats
- **service-wishlist**: microservei nou per guardar països pendents de visitar amb motiu opcional.
- **service-history**: microservei nou per registrar l'historial de cerques (màxim 50 entrades, sense duplicats).

### Servei reutilitzat
- **service-favorites**: adaptat de l'activitat anterior, separat completament del frontend i desplegat com a microservei independent.

### Operadors cloud
- Frontend → **Render**
- service-favorites → **Render** (servei separat)
- service-wishlist → **Railway**
- service-history → **Fly.io**

### Dificultats trobades
- Configuració correcta del CORS per permetre peticions del frontend cap als microserveis en dominis diferents.
- Gestió del `data.json` persistent als entorns cloud (alguns proveïdors utilitzen sistemes de fitxers efímers).
- Sincronització de l'estat entre frontend i els tres serveis per mantenir els botons actualitzats.
