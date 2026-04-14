# Service History

Microservei per registrar l'historial de cerques de l'usuari.

## Endpoints

| Mètode | Ruta           | Descripció                        |
|--------|----------------|-----------------------------------|
| GET    | /history       | Obté tot l'historial              |
| POST   | /history       | Afegeix una cerca a l'historial   |
| DELETE | /history       | Esborra tot l'historial           |
| DELETE | /history/:id   | Elimina una entrada concreta      |
| GET    | /health        | Health check                      |

## Exemple POST body

```json
{
  "query": "japan",
  "code": "JPN",
  "name": "Japan",
  "flag": "🇯🇵"
}
```

## Comportament

- Màxim 50 entrades. Les més antigues s'eliminen automàticament.
- Si es repeteix una cerca, es mou al principi de la llista.

## Instal·lació

```bash
npm install
npm start
```

## Desplegament

Desplegat a: **Fly.io**
