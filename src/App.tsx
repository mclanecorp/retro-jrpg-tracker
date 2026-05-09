import { useEffect, useMemo, useState } from 'react'
import gamesData from './data/games.json'
import './App.css'

type Game = {
  id: string
  title: string
  platform: 'SNES' | 'GBA'
  releaseYear: number
  rating: number
  summary: string
  walkthroughUrl: string
  ratingSource: string
  screenshotUrl?: string
  screenshotGalleryUrl: string
}

type ProgressStatus = 'not-started' | 'in-progress' | 'done'

type GameProgress = {
  status: ProgressStatus
  comment: string
}

type ProgressMap = Record<string, GameProgress>

type SortOption =
  | 'rating-desc'
  | 'rating-asc'
  | 'title-asc'
  | 'title-desc'
  | 'year-desc'
  | 'year-asc'

const STORAGE_KEY = 'retro-rpg-tracker-v1'
const games = [...(gamesData as Game[])].sort((a, b) => b.rating - a.rating)

const statusMeta: Record<ProgressStatus, { label: string; tone: string }> = {
  'not-started': { label: 'Pas commencé', tone: 'neutral' },
  'in-progress': { label: 'En cours', tone: 'warning' },
  done: { label: 'Terminé', tone: 'success' },
}

const createDefaultProgress = (): ProgressMap =>
  Object.fromEntries(
    games.map((game) => [game.id, { status: 'not-started' as ProgressStatus, comment: '' }]),
  )

function App() {
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState<'all' | 'SNES' | 'GBA'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | ProgressStatus>('all')
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc')
  const [progress, setProgress] = useState<ProgressMap>(() => {
    const defaults = createDefaultProgress()
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return defaults
    }

    try {
      const parsed = JSON.parse(stored) as ProgressMap
      return { ...defaults, ...parsed }
    } catch {
      return defaults
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const filteredGames = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const matches = games.filter((game) => {
      const gameProgress = progress[game.id] ?? { status: 'not-started', comment: '' }
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          game.title,
          game.platform,
          game.summary,
          game.ratingSource,
          gameProgress.comment,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesPlatform = platform === 'all' || game.platform === platform
      const matchesStatus = statusFilter === 'all' || gameProgress.status === statusFilter

      return matchesSearch && matchesPlatform && matchesStatus
    })

    return matches.sort((a, b) => {
      switch (sortBy) {
        case 'rating-asc':
          return a.rating - b.rating
        case 'title-asc':
          return a.title.localeCompare(b.title)
        case 'title-desc':
          return b.title.localeCompare(a.title)
        case 'year-desc':
          return b.releaseYear - a.releaseYear
        case 'year-asc':
          return a.releaseYear - b.releaseYear
        case 'rating-desc':
        default:
          return b.rating - a.rating
      }
    })
  }, [platform, progress, search, sortBy, statusFilter])

  const stats = useMemo(() => {
    const allProgress = Object.values(progress)
    const doneCount = allProgress.filter((entry) => entry.status === 'done').length
    const inProgressCount = allProgress.filter((entry) => entry.status === 'in-progress').length
    const commentedCount = allProgress.filter((entry) => entry.comment.trim().length > 0).length

    return {
      total: games.length,
      doneCount,
      inProgressCount,
      commentedCount,
    }
  }, [progress])

  const updateStatus = (gameId: string, status: ProgressStatus) => {
    setProgress((current) => ({
      ...current,
      [gameId]: {
        ...(current[gameId] ?? { comment: '', status: 'not-started' }),
        status,
      },
    }))
  }

  const updateComment = (gameId: string, comment: string) => {
    setProgress((current) => ({
      ...current,
      [gameId]: {
        ...(current[gameId] ?? { comment: '', status: 'not-started' }),
        comment,
      },
    }))
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Retro Quest Database</span>
          <h1>Les meilleurs JRPG et RPG SNES + GBA, classés du mieux noté au moins bien noté.</h1>
          <p>
            Un hub sombre et nerd pour suivre tes classiques rétro : notes, résumés, liens de
            soluce, galerie de screenshots, recherche, filtres, tri et suivi personnel.
          </p>
        </div>

        <div className="hero-stats" aria-label="Statistiques de progression">
          <article>
            <strong>{stats.total}</strong>
            <span>jeux référencés</span>
          </article>
          <article>
            <strong>{stats.doneCount}</strong>
            <span>terminés</span>
          </article>
          <article>
            <strong>{stats.inProgressCount}</strong>
            <span>en cours</span>
          </article>
          <article>
            <strong>{stats.commentedCount}</strong>
            <span>commentés</span>
          </article>
        </div>
      </section>

      <section className="toolbar-panel">
        <label className="search-field">
          <span>Recherche</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Chrono Trigger, tactical, Pokémon, commentaire..."
          />
        </label>

        <label>
          <span>Plateforme</span>
          <select value={platform} onChange={(event) => setPlatform(event.target.value as 'all' | 'SNES' | 'GBA')}>
            <option value="all">Toutes</option>
            <option value="SNES">SNES</option>
            <option value="GBA">GBA</option>
          </select>
        </label>

        <label>
          <span>Progression</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | ProgressStatus)}
          >
            <option value="all">Tous les statuts</option>
            <option value="not-started">Pas commencé</option>
            <option value="in-progress">En cours</option>
            <option value="done">Terminé</option>
          </select>
        </label>

        <label>
          <span>Trier par</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
            <option value="rating-desc">Note décroissante</option>
            <option value="rating-asc">Note croissante</option>
            <option value="title-asc">Titre A → Z</option>
            <option value="title-desc">Titre Z → A</option>
            <option value="year-desc">Année récente → ancienne</option>
            <option value="year-asc">Année ancienne → récente</option>
          </select>
        </label>
      </section>

      <section className="results-summary">
        <p>
          <strong>{filteredGames.length}</strong> résultat{filteredGames.length > 1 ? 's' : ''}{' '}
          affiché{filteredGames.length > 1 ? 's' : ''}
        </p>
        <button
          type="button"
          className="ghost-button"
          onClick={() => {
            setSearch('')
            setPlatform('all')
            setStatusFilter('all')
            setSortBy('rating-desc')
          }}
        >
          Réinitialiser les filtres
        </button>
      </section>

      <section className="games-grid">
        {filteredGames.map((game, index) => {
          const gameProgress = progress[game.id] ?? { status: 'not-started', comment: '' }
          const currentStatus = statusMeta[gameProgress.status]

          return (
            <article className="game-card" key={game.id}>
              <div className="game-visual">
                {game.screenshotUrl ? (
                  <img src={game.screenshotUrl} alt={`Screenshot de ${game.title}`} />
                ) : (
                  <div className="visual-fallback" aria-hidden="true">
                    <span>{game.platform}</span>
                    <strong>{game.title}</strong>
                    <small>Galerie externe disponible</small>
                  </div>
                )}
                <div className="visual-overlay">
                  <span className="rank-badge">#{index + 1}</span>
                  <span className={`status-pill ${currentStatus.tone}`}>{currentStatus.label}</span>
                </div>
              </div>

              <div className="game-content">
                <div className="game-heading">
                  <div>
                    <div className="meta-row">
                      <span className="platform-chip">{game.platform}</span>
                      <span>{game.releaseYear}</span>
                    </div>
                    <h2>{game.title}</h2>
                  </div>
                  <div className="rating-box">
                    <strong>{game.rating}</strong>
                    <span>/100</span>
                  </div>
                </div>

                <p className="summary">{game.summary}</p>
                <p className="source-line">Source note : {game.ratingSource}</p>

                <div className="action-links">
                  <a href={game.walkthroughUrl} target="_blank" rel="noreferrer">
                    Voir la soluce
                  </a>
                  <a href={game.screenshotGalleryUrl} target="_blank" rel="noreferrer">
                    Voir les screenshots
                  </a>
                </div>

                <div className="status-controls" role="group" aria-label={`Progression pour ${game.title}`}>
                  <button
                    type="button"
                    className={gameProgress.status === 'not-started' ? 'active' : ''}
                    onClick={() => updateStatus(game.id, 'not-started')}
                  >
                    Pas commencé
                  </button>
                  <button
                    type="button"
                    className={gameProgress.status === 'in-progress' ? 'active' : ''}
                    onClick={() => updateStatus(game.id, 'in-progress')}
                  >
                    En cours
                  </button>
                  <button
                    type="button"
                    className={gameProgress.status === 'done' ? 'active' : ''}
                    onClick={() => updateStatus(game.id, 'done')}
                  >
                    Terminé
                  </button>
                </div>

                <label className="comment-field">
                  <span>Mon commentaire</span>
                  <textarea
                    rows={4}
                    value={gameProgress.comment}
                    onChange={(event) => updateComment(game.id, event.target.value)}
                    placeholder="Tes impressions, ton équipe, ta progression, un boss pénible, une note perso..."
                  />
                </label>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}

export default App
