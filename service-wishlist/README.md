# Service Wishlist

Microservei per gestionar la llista de viatges pendents (wishlist).

## Endpoints

| Mètode | Ruta             | Descripció                        |
|--------|------------------|-----------------------------------|
| GET    | /wishlist        | Obté tota la wishlist             |
| POST   | /wishlist        | Afegeix un país a la wishlist     |
| PATCH  | /wishlist/:code  | Actualitza el motiu d'un element  |
| DELETE | /wishlist/:code  | Elimina un element de la wishlist |
| GET    | /health          | Health check                      |

## Exemple POST body

```json
{
  "code": "JPN",
  "name": "Japan",
  "flag": "🇯🇵",
  "reason": "Vull veure el Mont Fuji"
}
```

## Instal·lació

```bash
npm install
npm start
```

## Desplegament

Desplegat a: **Railway**
