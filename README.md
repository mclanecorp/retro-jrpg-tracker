# Retro JRPG Tracker

Site web sombre et moderne pour explorer les meilleurs JRPG / RPG de la SNES et de la GBA.

Fonctionnalités :
- classement du mieux noté au moins bien noté
- recherche
- filtres par plateforme et progression
- tri par note, titre et année
- statut par jeu : pas commencé / en cours / terminé
- commentaire personnel par jeu
- lien de soluce pour chaque jeu
- screenshot local pour chaque jeu
- sauvegarde locale de la progression via `localStorage`

## Stack

- React
- TypeScript
- Vite
- GitHub Actions
- GitHub Pages

## Cloner le projet

```bash
git clone https://github.com/mclanecorp/retro-jrpg-tracker.git
cd retro-jrpg-tracker
```

## Installation

```bash
npm install
```

## Lancer en développement

```bash
npm run dev
```

Puis ouvrir l'URL affichée dans le terminal, en général :

```text
http://localhost:5173/
```

## Build production

```bash
npm run build
```

## Prévisualiser le build production

```bash
npm run preview
```

## Vérification qualité

```bash
npm run lint
```

## Déploiement GitHub Pages

Le site est publié automatiquement sur GitHub Pages via GitHub Actions.

- La CI exécute `npm run lint` puis `npm run build`
- Le workflow de déploiement publie le contenu de `dist/` sur GitHub Pages à chaque push sur `main`

URL publique :

```text
https://mclanecorp.github.io/retro-jrpg-tracker/
```

## Notes

- Les statuts et commentaires sont sauvegardés dans le navigateur.
- Les screenshots locaux proviennent d'un set de snaps RetroArch/libretro-thumbnails intégré au repo pour éviter les liens morts externes.
