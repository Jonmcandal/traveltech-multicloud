# Service Favorites

Microservei per gestionar països favorits.

## Endpoints

| Mètode | Ruta              | Descripció                  |
|--------|-------------------|-----------------------------|
| GET    | /favorites        | Obté tots els favorits      |
| POST   | /favorites        | Afegeix un favorit nou      |
| DELETE | /favorites/:code  | Elimina un favorit pel codi |
| GET    | /health           | Health check                |

## Exemple POST body

```json
{
  "code": "ESP",
  "name": "Spain",
  "flag": "🇪🇸"
}
```

## Instal·lació

```bash
npm install
npm start
```

## Desplegament

Desplegat a: **Render**
