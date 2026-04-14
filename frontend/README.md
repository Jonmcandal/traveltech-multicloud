# Frontend — TravelTech Solutions

Interfície web que permet:

- Cercar informació de qualsevol país via **RestCountries API**
- Gestionar **favorits** (service-favorites)
- Gestionar la **wishlist** de viatges pendents (service-wishlist)
- Consultar l'**historial** de cerques (service-history)

## Configuració

Edita les URLs dels microserveis a `public/script.js`, secció `CONFIG`:

```js
const CONFIG = {
  FAVORITES_API: 'https://service-favorites.onrender.com',
  WISHLIST_API:  'https://service-wishlist.up.railway.app',
  HISTORY_API:   'https://service-history.fly.dev',
  COUNTRIES_API: 'https://restcountries.com/v3.1'
};
```

## Instal·lació

```bash
npm install
npm start
```

## Desplegament

Desplegat a: **Render / Netlify**
