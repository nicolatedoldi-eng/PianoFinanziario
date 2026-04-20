# CONTEXT — PianoFinanziario

Documento di riferimento per sessioni Claude Code.
Aggiornalo ogni volta che cambiano struttura, tabelle o logica.

---

## Stack tecnico

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 19 + Vite 8 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 4 |
| Charts | Recharts 3 |
| PDF | jsPDF 4 |
| Auth + DB | Supabase (Auth + Postgres + Edge Functions) |
| Email | Resend (via Supabase Edge Functions in Deno) |
| Pagamenti | Stripe |
| Deploy | Vercel (branch `main` → produzione) |
| URL produzione | https://piano-finanziario.vercel.app |

---

## Struttura cartelle

```
/
├── src/
│   ├── App.jsx                  # Routing principale
│   ├── main.jsx                 # Entry point React
│   ├── contexts/
│   │   └── AuthContext.jsx      # Context Supabase Auth
│   ├── components/
│   │   ├── Layout.jsx           # Navbar + wrapper pagina
│   │   ├── ProtectedRoute.jsx   # Guard auth + onboarding
│   │   ├── ProModal.jsx         # Modal upgrade Pro
│   │   └── InstallBanner.jsx    # PWA install prompt
│   ├── pages/
│   │   ├── Landing.jsx          # Homepage pubblica
│   │   ├── Auth.jsx             # Login / Registrazione
│   │   ├── Onboarding.jsx       # Wizard 6 domande → profilo
│   │   ├── Dashboard.jsx        # App principale (3 tab)
│   │   ├── Profilo.jsx          # Impostazioni utente
│   │   ├── Pricing.jsx          # Pagina prezzi / upgrade Pro
│   │   └── Impara/
│   │       ├── Index.jsx        # Lista articoli educativi
│   │       ├── Article.jsx      # Articolo singolo
│   │       └── articles/        # Contenuti articoli (JS)
│   ├── lib/
│   │   ├── supabase.js          # Client Supabase
│   │   ├── portfolios.js        # Definizione 4 profili + ETF + recommendPortfolio()
│   │   ├── finance.js           # calculateProjection, calculateScenarios, calculateMilestones, formatEuro, generateInsight
│   │   └── generatePdf.js       # Generazione PDF piano (solo Pro)
│   └── hooks/
│       └── useProfile.js        # Hook profilo utente
├── supabase/
│   └── functions/
│       ├── send-welcome-email/  # Email post-onboarding
│       ├── send-rebalance-alert/ # Email ribilanciamento (cron)
│       └── send-annual-reminder/ # Email report annuale (cron)
├── supabase-schema.sql          # Schema Postgres completo
├── vercel.json                  # Config Vercel (SPA rewrites)
└── CONTEXT.md                   # Questo file
```

### Route pubbliche
| Path | Componente |
|------|----------|
| `/` | Landing |
| `/login` | Auth (login) |
| `/registrazione` | Auth (register) |
| `/prezzi` | Pricing |
| `/impara` | ImparaIndex |
| `/impara/:slug` | ImparaArticle |

### Route protette
| Path | Guard |
|------|-------|
| `/onboarding` | ProtectedRoute (solo auth) |
| `/dashboard` | OnboardingGuard (auth + onboarding completato) |
| `/profilo` | OnboardingGuard |

---

## Tabelle Supabase

### `user_profiles`

| Campo | Tipo | Note |
|-------|------|------|
| `id` | uuid | PK, auto-generated |
| `user_id` | uuid | FK → auth.users, UNIQUE |
| `email` | text | |
| `profile` | text | `essenziale` \| `prudente` \| `bilanciato` \| `crescita` |
| `initial_capital` | numeric(12,2) | Capitale iniziale € |
| `monthly_payment` | numeric(10,2) | PAC mensile € |
| `horizon_years` | integer | Orizzonte temporale (anni) |
| `annual_return` | numeric(5,2) | Rendimento atteso % (dal profilo) |
| `annual_payment_growth` | numeric(5,2) | Crescita PAC annua % (default 3) |
| `goal` | text | `casa` \| `pensione` \| `liberta` \| `emergenze` |
| `experience` | text | `zero` \| `letto` \| `qualcosa` \| `esperto` |
| `risk_tolerance` | text | `vendo` \| `aspetto` \| `continuo` \| `compro` |
| `onboarding_completed` | boolean | default false |
| `is_pro` | boolean | Upgrade Stripe (aggiunto via migration) |
| `created_at` | timestamptz | default now() |
| `last_rebalance_at` | timestamptz | Aggiornato dopo ogni email ribilanciamento |

RLS abilitata: ogni utente vede/modifica solo il proprio record.

---

## Variabili d'ambiente

### Frontend (Vite — file `.env`)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Supabase Edge Functions
```
RESEND_API_KEY=re_...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SITE_URL=https://piano-finanziario.vercel.app
```

### Stripe (Vercel env vars)
```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
```

### Resend / App (Vercel env vars)
```
APP_URL=https://piano-finanziario.vercel.app
RESEND_FROM_EMAIL=PianoFinanziario <noreply@pianofinanziario.app>
RESEND_REPLY_TO=support@pianofinanziario.app
```

---

## I 4 profili e i loro ETF

### Essenziale — 6.5% atteso — colore #534AB7
Ribilanciamento: mensile (ogni 30 giorni)

| ETF | ISIN | % | Descrizione |
|-----|------|---|-------------|
| VWCE | IE00B3RBWM25 | 80% | Azioni globali (sviluppati + emergenti) |
| AGGH | IE00BDBRDM35 | 20% | Obbligazioni globali |

---

### Prudente — 5.5% atteso — colore #1D9E75
Ribilanciamento: semestrale (ogni 180 giorni)

| ETF | ISIN | % | Descrizione |
|-----|------|---|-------------|
| SWRD | IE00B4L5Y983 | 40% | Azioni paesi sviluppati |
| IBTM | IE00B1FZS467 | 35% | Titoli di stato europei 7-10yr |
| SGLE | IE00B4ND3602 | 15% | Oro fisico |
| XEON | LU0290358497 | 10% | Liquidità tasso BCE |

---

### Bilanciato — 7.5% atteso — colore #EF9F27
Ribilanciamento: semestrale (ogni 180 giorni)

| ETF | ISIN | % | Descrizione |
|-----|------|---|-------------|
| VWCE | IE00B3RBWM25 | 55% | Azioni globali |
| EIMI | IE00B4L5YC18 | 10% | Mercati emergenti |
| AGGH | IE00BDBRDM35 | 25% | Obbligazioni globali |
| SGLE | IE00B4ND3602 | 10% | Oro fisico |

---

### Crescita — 9.5% atteso — colore #E24B4A
Ribilanciamento: mensile (ogni 30 giorni)

| ETF | ISIN | % | Descrizione |
|-----|------|---|-------------|
| VWCE | IE00B3RBWM25 | 60% | Azioni globali |
| EIMI | IE00B4L5YC18 | 15% | Mercati emergenti (overweight) |
| ZPRV | IE00BSPLC413 | 15% | Small cap value USA |
| SGLE | IE00B4ND3602 | 10% | Oro fisico |

---

### Logica di assegnazione profilo (`recommendPortfolio`)

Punteggio basato su 4 risposte:
- **Goal**: casa=0, emergenze=0, pensione=1, liberta=2
- **Experience**: zero=0, letto=1, qualcosa=2, esperto=3
- **Risk**: vendo=0, aspetto=1, continuo=2, compro=3
- **Horizon**: ≥20 anni=+2, ≥10 anni=+1

| Punteggio totale | Profilo |
|-----------------|---------|
| 0–2 | Essenziale |
| 3–4 | Prudente |
| 5–6 | Bilanciato |
| 7+ | Crescita |

---

## Email automatiche (Resend via Edge Functions)

### 1. `send-welcome-email` — Email di benvenuto
- **Trigger**: invocata da `Onboarding.jsx` subito dopo il salvataggio del profilo
- **Input**: `{ email, profile, dashboardUrl, initialCapital, monthlyPayment }`
- **Subject**: `Il tuo piano [NomeProfilo] è pronto`
- **Contenuto**:
  - Messaggio motivazionale di apertura
  - Profilo assegnato + rendimento atteso %
  - 3 passi concreti: apri broker / primo acquisto con tabella ETF+importi / PAC automatico
  - CTA → dashboard
  - Avvertenza mercati + disclaimer

### 2. `send-rebalance-alert` — Email ribilanciamento
- **Trigger**: cron schedulato — controlla tutti gli utenti con `onboarding_completed = true`
- **Frequenza controllo**:
  - Essenziale, Crescita: ogni 30 giorni (da `last_rebalance_at` o `created_at`)
  - Prudente, Bilanciato: ogni 180 giorni
- **Subject**: `Controllo [semestrale|annuale] del tuo portafoglio — ci vogliono 5 minuti`
  - "semestrale" per Prudente e Bilanciato
  - "annuale" per Essenziale e Crescita
- **Contenuto**:
  - Range target ETF specifici per profilo
  - Istruzioni: se nei range → niente; se fuori → usa versamento prima, poi vendi
  - Nota fiscale (26% su vendite)
  - CTA → dashboard
- **Aggiornamento DB**: `last_rebalance_at = now()` dopo ogni invio

### 3. `send-annual-reminder` — Report annuale
- **Trigger**: cron schedulato — invia solo agli utenti dove `monthsSince(created_at) === 12`
- **Subject**: `Un anno fa hai fatto la cosa giusta — ecco dove sei adesso`
- **Contenuto**:
  - Messaggio motivazionale
  - Capitale stimato oggi (calcolato con `estimateCapital`)
  - Tabella parametri: capitale iniziale, PAC, rendimento atteso, crescita PAC 3%
  - Versato in totale e interessi stimati (capitale − versato)
  - Suggerimento aumento PAC (+€50/mese)
  - Outlook prossimo anno
  - CTA → dashboard
- **Calcolo capitale**: `estimateCapital(initialCapital, monthlyPayment, annualReturn, years, annualPaymentGrowth)` con capitalizzazione mensile e crescita PAC annuale

---

## Piano Free vs Pro

| Funzionalità | Free | Pro |
|---|---|---|
| Dashboard con proiezione base | ✓ | ✓ |
| Profilo portafoglio + ETF | ✓ | ✓ |
| Email automatiche (welcome, rebalance, annual) | ✓ | ✓ |
| Sezione Impara (articoli educativi) | ✓ | ✓ |
| 3 scenari (pessimistico / base / ottimistico) | — | ✓ |
| Confronto portafogli | — | ✓ |
| Simulazione crescita PAC | — | ✓ |
| Export PDF del piano finanziario | — | ✓ |

L'upgrade Pro avviene tramite Stripe. Il campo `is_pro` in `user_profiles` viene impostato a `true` dal webhook Stripe (`STRIPE_WEBHOOK_SECRET`).

---

## Branch Git

| Branch | Scopo |
|--------|-------|
| `main` | Produzione (Vercel deploya da qui) |
| `claude/pianofinanziario-app-8lsDU` | Branch di sviluppo Claude |

I push a `main` avvengono tramite GitHub MCP (`create_or_update_file`) quando il proxy git locale restituisce 503.
