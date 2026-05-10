# Migration Next.js + Neon (pas à pas)

## 1) Lancer l'app en local
```bash
npm install
npm run dev
```

## 2) Créer la base Neon
1. Crée un projet sur Neon.
2. Ouvre SQL Editor.
3. Exécute `neon/schema.sql`.

## 3) Variables d'environnement
1. Copie `.env.example` en `.env.local`.
2. Renseigne:
   - `DATABASE_URL`

## 4) API Neon déjà branchée
Routes disponibles:
1. `GET /api/state` (transactions + reports hebdo)
2. `POST /api/transactions`
3. `DELETE /api/transactions?id=...`
4. `POST /api/carryovers`

## 5) Déployer sur Vercel
1. Import du repo GitHub.
2. Root Directory: `web`.
3. Ajoute les mêmes variables d'environnement dans Vercel.
4. Déploie.
