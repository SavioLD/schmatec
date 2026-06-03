# Schmatec GmbH – Neue Website (V1)

Statische Site für die **Schmatec GmbH**, Schneider Maschinen Technik,
Waidbachstraße 12, 78661 Dietingen-Irslingen.

> **Hinweis Repo-Ablage:** Aktuell lebt der Site-Code als Unterordner
> `/schmatec/` im Repo `saviold/laendle-digital`. Für den Live-Betrieb
> bitte in ein eigenes Repo `schmatec-website` umziehen (z.B. via
> `git subtree push prefix=schmatec`).

## Struktur

```
schmatec/
├── index.html                          ← Startseite
├── foerdertechnik-gemuesebau.html      ← Bereich 01
├── aufbereitung-lebensmittel.html      ← Bereich 02
├── anlagenplanung.html                 ← Engineering / Vorgehen
├── referenzen.html                     ← Anonymisierte Projektliste
├── ueber-uns.html                      ← Unternehmen / Werte
├── karriere.html                       ← Jobs
├── kontakt.html                        ← 4-Step Wizard + Ansprechpartner
├── impressum.html                      ← Echte Pflichtangaben
├── datenschutz.html                    ← DSGVO-Standard
├── agb.html                            ← VDMA-nahe Vorlage (anwaltlich prüfen!)
├── robots.txt
├── sitemap.xml
├── css/styles.css                      ← Komplettes Stylesheet
├── js/main.js                          ← Nav, Reveal, Counter, Wizard
└── assets/images/
    └── logo-schmatec.png               ← aus Brand Guide (PPTX) extrahiert
```

## Brand & Design

Komplett umgesetzt nach **Schmatec Brand Guide Edition 2026 (SCH-BG-2026.01)**.

**Farben (alle als CSS Custom Properties in `css/styles.css`):**
- Primary: `#1B3F7A` Schmatec Blue · `#2E7FCC` Signal Blue · `#C7CACE` Industrial Silver
- Sekundär: `#14305C` Deep Blue · `#5BA0E0` Sky · `#E07A22` Harvest · `#3E8E5A` Field
- Neutral: `#1C1F24` Anthrazit · `#5A6068` Steel · `#F4F5F7` Paper

**Typografie:**
- Display: **Saira** Bold Italic (Headlines)
- Body: **IBM Plex Sans**
- Technical/Mono: **IBM Plex Mono**

Alle Fonts via Google Fonts. Für DSGVO-konformen Live-Betrieb empfohlen,
Fonts lokal einzubinden — siehe Hinweis in `datenschutz.html`.

## Kontaktformular (Web3Forms)

Das Mehrstufen-Formular in `kontakt.html` versendet via
[Web3Forms](https://web3forms.com) (gratis, kein Account nötig, nur Access Key).

**Setup in 3 Minuten:**
1. Auf [web3forms.com](https://web3forms.com) Access Key generieren (E-Mail = `info@schmatec.de`)
2. In `kontakt.html` `data-web3forms-key="YOUR_WEB3FORMS_ACCESS_KEY"` ersetzen
3. Fertig — E-Mails landen direkt im Schmatec-Postfach

**Fallback:** Solange kein Key gesetzt ist, öffnet der „Senden"-Button
den E-Mail-Client mit vorbefüllter Mail (mailto:) — funktioniert ohne Backend.

## SEO

- Saubere Title/Meta-Tags je Seite (deutsch, Keywords lokalisiert)
- Open Graph + Twitter Cards
- `schema.org`: Organization, LocalBusiness, ContactPage, ProductGroup
- `lang="de"`, semantisches HTML, Breadcrumbs
- `sitemap.xml` + `robots.txt`

## Lokal anschauen

```bash
cd schmatec
python3 -m http.server 8000
# → http://localhost:8000
```

## Deployment

Statische Site — funktioniert auf jedem Hoster:
- **Netlify / Vercel:** Repo verbinden, kein Build-Command, Publish-Directory = `schmatec/` (bzw. Repo-Root nach Umzug)
- **Klassisch:** Inhalte per FTP/SFTP auf den Webserver
- **GitHub Pages:** Inhalte ins Repo-Root, dann GH Pages aktivieren

DNS auf `schmatec.de` umstellen, sobald produktiv.

## TODOs vor Go-Live

- [ ] **Web3Forms Access Key** in `kontakt.html` eintragen
- [ ] **Echte Produktbilder** in Assets ergänzen (Hallen, Maschinen im Einsatz, Produkte
      laut Brand Guide: „natürlich, kühl, entsättigt — kein Stock, keine KI")
- [ ] **Logo als SVG** liefern (aktuell PNG aus PPTX extrahiert — funktioniert,
      aber SVG wäre für Retina-Schärfe besser)
- [ ] **Favicon-Set** generieren (16, 32, apple-touch-icon)
- [ ] **OG-Image** designen (1200×630, mit Logo + Headline)
- [ ] **AGB anwaltlich prüfen** lassen — aktuelle Fassung ist VDMA-naher Platzhalter
- [ ] **Referenzen mit echten Kundenstimmen** ersetzen (aktuell anonymisierte Platzhalter)
- [ ] **Echte Stellenanzeigen** in `karriere.html` (aktuell sind die Jobs typische
      Profile für einen Anlagenbauer dieser Größe — bitte mit Patrick Wild abgleichen)
- [ ] **Google Fonts lokal einbinden** für DSGVO-Konformität ohne Cookie-Banner
- [ ] **Tracking/Analytics** entscheiden (Matomo on-prem empfohlen)
- [ ] **Domain umziehen** + HTTPS-Zertifikat aktivieren
```
