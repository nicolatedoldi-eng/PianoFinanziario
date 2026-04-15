-- Migration: rinomina il profilo 'dormiglione' in 'essenziale'
-- Aggiorna tutti gli utenti gia' registrati con il vecchio valore.

-- 1. Rimuovi il vincolo CHECK esistente
alter table public.user_profiles
  drop constraint if exists user_profiles_profile_check;

-- 2. Aggiorna i record esistenti
update public.user_profiles
set profile = 'essenziale'
where profile = 'dormiglione';

-- 3. Ricrea il vincolo CHECK con il nuovo valore
alter table public.user_profiles
  add constraint user_profiles_profile_check
  check (profile in ('essenziale', 'prudente', 'bilanciato', 'crescita'));
