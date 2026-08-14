# Padel House Beograd — rezervacije

Sajt i sistem rezervacija za Padel House — teren, kafe i prostor za događaje u šancu Beogradske tvrđave na Kalemegdanu.

Javna stranica sa rezervacijom u realnom vremenu i admin panel za vođenje rasporeda — uključujući **stalne termine**, koji su i glavni razlog zašto ovo postoji.

Next.js (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres) · Resend · Vercel

---

## Šta rešava

Primanje rezervacija nije problem. Problem je **praćenje**: stalni termini, jednokratne rezervacije i otkazivanja koji se vode kroz svesku i telefon, na tri terena istovremeno. Admin panel je napravljen oko toga:

- **Stalni termini** se kreiraju jednom za ceo period (npr. „utorkom u 15:30, septembar–decembar"), a posle se brišu ili produžavaju **jednim klikom**, ne termin po termin.
- Pre kreiranja se vidi **tačan spisak datuma** i **koji su već zauzeti** — bez tihog preskakanja.
- Pojedinačni termin iz serije se može otkazati (odsustvo jedne nedelje) bez diranja ostatka.

---

## Pokretanje

### 1. Supabase projekat

1. Napravite besplatan projekat na [supabase.com](https://supabase.com/dashboard).
2. **SQL Editor** → nalepite ceo sadržaj [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → **Run**.
   (Alternativa: `npx supabase link --project-ref <ref>` pa `npx supabase db push`.)
3. **Settings → API** → kopirajte `Project URL` i `service_role` ključ.

### 2. Env varijable

```bash
cp .env.example .env.local
```

Popunite:

| Varijabla | Čemu služi |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL iz Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` ključ — **samo server**, nikad u browser |
| `ADMIN_PASSWORD` | Jedna lozinka za `/admin` |
| `ADMIN_SESSION_SECRET` | Nasumičan string 32+ karaktera (potpisuje kolačić) |
| `RESEND_API_KEY` | Obaveštenje vlasniku o novoj rezervaciji |
| `OWNER_EMAIL` | Adresa vlasnika kluba |
| `RESEND_FROM` | Pošiljalac; do verifikacije domena koristite `onboarding@resend.dev` |

`ADMIN_SESSION_SECRET` generisati sa:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Podaci i pokretanje

```bash
npm install
npm run seed     # 3 terena, ~34 rezervacije, 3 serije stalnih termina
npm run dev
```

`npm run seed -- --dry` prikaže raspored koji bi se upisao (uključujući mapu popunjenosti po danima) bez ijednog upisa u bazu.

- `/` — javna stranica
- `/rezervacija` — rezervacija termina
- `/admin` — admin panel (lozinka iz `ADMIN_PASSWORD`)

---

## Provere

```bash
npm run verify      # vreme/cene + šema baze; ne traži Supabase ni internet
npm run verify:time # DST, peak/off-peak, latinica, validacija mreže termina
npm run verify:db   # primenjuje migraciju na pravi Postgres (PGlite) i testira ograničenja
npm run lint && npm run build
```

### Test trke (`npm run race`)

Ključni test cele aplikacije. Gađa **pravi HTTP endpoint**, pa mu treba pokrenut server — u **dva terminala**:

```bash
npm run dev     # terminal 1 — ostavite da radi
npm run race    # terminal 2
```

Očekivani rezultat je **tačno jedan 201 i devet 409**:

```
  201 Created:     1   (očekivano 1)
  409 Conflict:    9   (očekivano 9)
  redova u bazi:   1   (očekivano 1)

✓ PROŠAO — baza je propustila tačno jednu rezervaciju.
```

---

## Kako je sprečena dupla rezervacija

Na nivou baze, ne u UI-ju. Aplikacija **nikada ne radi „proveri pa upiši"** — između `SELECT`-a i `INSERT`-a postoji prozor u kom dva zahteva prolaze oba.

```sql
-- Jedna potvrđena rezervacija po terenu i po vremenu početka.
create unique index bookings_court_start_confirmed_uniq
  on bookings (court_id, starts_at)
  where status = 'confirmed';

-- Dodatni sloj: odbija BILO KAKVO preklapanje, ne samo isti početak.
alter table bookings add constraint bookings_no_overlap
  exclude using gist (court_id with =, tstzrange(starts_at, ends_at, '[)') with &&)
  where (status = 'confirmed');
```

API ruta upisuje direktno i hvata grešku koju baza vrati:

- `23505` (unique) ili `23P01` (exclusion) → **HTTP 409** + poruka *„Termin je upravo rezervisan. Molimo izaberite drugi."*
- Klijent istovremeno osvežava mrežu, pa korisnik odmah vidi da je termin zauzet.

Indeks je **parcijalan** (`where status = 'confirmed'`), pa otkazivanje odmah oslobađa termin, a otkazani red ostaje u bazi kao istorija.

Sve ovo je provereno u `npm run verify:db` protiv pravog Postgresa.

**Poznato ograničenje:** provera da li je termin blokiran (`blocked_slots`) je „pročitaj pa proveri" i nije zaštićena od trke sa administratorom koji baš u tom trenutku blokira termin. Sporni put — igrač protiv igrača — je u potpunosti zaštićen na nivou baze.

---

## Vreme i vremenska zona

Server radi u UTC, klub razmišlja u beogradskom vremenu (UTC+1 zimi, UTC+2 leti). Sve konverzije prolaze kroz [`lib/time.ts`](lib/time.ts) i `date-fns-tz` — nigde nema ručnog računanja pomeraja.

Zato stalni termin u 15:30 ostaje 15:30 i posle oktobarske promene vremena, umesto da se tiho pomeri na 14:30. Pokriveno testom u `npm run verify:time`.

---

## Cene

U [`lib/config.ts`](lib/config.ts):

| Tarifa | Cena (90 min) | Kada |
|---|---|---|
| Off-peak | 4.000 RSD | Radnim danima |
| Peak | 5.000 RSD | Vikendom, ceo dan |

Termini: `08:00 · 09:30 · 11:00 · 12:30 · 14:00 · 15:30` (poslednji se završava u 17:00).

> 90 minuta se ne uklapa ravnomerno u 08:00–18:00, pa poslednji termin ide do 17:00.
> Pravilo „radnim danima od 17:00 = peak" je implementirano i konfigurabilno — čim se u
> `SLOT_START_TIMES` dodaju večernji termini, peak cena se aktivira i radnim danima,
> bez izmena u kodu.

---

## Sigurnost

- Sav pristup bazi je **serverski**, sa `service_role` ključem. Anon ključ se nikad ne šalje u browser.
- RLS je uključen na svim tabelama **bez ijedne policy** — anon i authenticated ključevi ne vide ništa. Imena i brojevi telefona gostiju su nedostupni čak i da ključ procuri.
- `lib/supabase.ts` i `lib/email.ts` koriste `import "server-only"`: slučajan import iz klijentske komponente ruši build umesto da procuri ključ.
- Admin sesija je httpOnly kolačić potpisan HMAC-om; lozinka se poredi u konstantnom vremenu.
- **Svaka** Server Action ponovo proverava sesiju — Server Actions su javni endpointi i ne smeju da se oslanjaju na to što je stranica bila zaštićena.

---

## Deploy na Vercel

1. Push na GitHub, pa **Import Project** na Vercel.
2. Dodajte sve env varijable iz `.env.example` (**Production** i **Preview**).
3. Dodajte `NEXT_PUBLIC_SITE_URL` sa punim URL-om — koristi se za link u mejlu vlasniku.
4. Deploy.

Za mejlove sa sopstvenog domena verifikujte domen u Resend-u i promenite `RESEND_FROM`.

---

## Fotografije

Originali stoje u `img/`, a `public/photos/` sadrži obrađene verzije (resize, EXIF strip, AVIF + JPEG):

```bash
node scripts/prepare-photos.mjs
```

Mapiranje izvorne datoteke na imenovano mesto u layoutu je na vrhu tog skripta — nove slike se dodaju tako što se ubace u `img/` i doda red u `MAP`, bez diranja komponenti.

## Dizajn

- **Fraunces** (serif) nosi sve naslove — prati serifni logotip kluba i ima pun `latin-ext`, pa `č ć š ž đ` rade ispravno.
- **Barlow** nosi telo teksta i ceo interfejs rezervacija i admina. Serif je glas brenda, sans je interfejs.
- Paleta je uzeta sa samog objekta: tamnozelena iz logotipa, **terakota sa terena** kao akcenat, bež i toplo drvo. Akcenat se koristi najviše jednom po ekranu — na onome što treba kliknuti.

## Pre prezentacije

- [ ] Potvrditi adresu — `Tadeuša Košćuška BB` je sa njihovog Google profila; „BB" znači bez broja.
- [ ] Potvrditi **cene** — 4.000 / 5.000 RSD su procena tržišta, ne njihov cenovnik.
- [ ] Potvrditi nazive terena (`Teren 1/2/3`) i email kluba (`CLUB.email`).
- [ ] Osvežiti recenzije u `lib/config.ts` sa Google profila pre prezentacije.

### Radno vreme vs. termini

Objekat radi **08:00 – 18:00**. Padel mreža je zasebna: šest termina od 90 minuta koji se ređaju od 08:00 i završavaju u 17:00, pa kafe radi još sat vremena posle poslednjeg meča. Za venčanja i proslave se radi i duže, po dogovoru — to se ne vodi kroz rezervacije nego kroz `blocked_slots` u adminu.

---

## Struktura

```
app/
  page.tsx                     javna stranica
  rezervacija/page.tsx         mreža termina
  api/bookings/route.ts        upis rezervacije + hvatanje 23505/23P01
  admin/page.tsx               dnevni pregled
  admin/stalni-termini/        upravljanje serijama
lib/
  config.ts                    podaci kluba, termini, cene
  time.ts                      SVE konverzije za Europe/Belgrade
  pricing.ts  slots.ts         peak logika, mreža termina
  supabase.ts                  serverski klijent (service_role)
  admin-auth.ts                sesija i zaštita
  admin-actions.ts             Server Actions za admin
  recurring.ts                 širenje nedeljne serije
  email.ts                     Resend obaveštenje
supabase/migrations/           šema + ograničenja + RLS
scripts/                       seed i provere
```
