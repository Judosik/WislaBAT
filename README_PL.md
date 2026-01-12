# WislaBAT - Wizualizacja Terenu i Poziomu Wody 3D

> 🇵🇱 Wersja polska | [🇬🇧 English version](README.md)

> Interaktywna wizualizacja 3D scenariuszy powodziowych z wykorzystaniem danych fotogrametrycznych i geoprzestrzennych w układzie EPSG:2178 (Polish CS92)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/Three.js-r170-blue.svg)](https://threejs.org/)

![WislaBAT Screenshot](docs/screenshot.png)

## Spis treści

- [Opis projektu](#opis-projektu)
- [Funkcje](#funkcje)
- [Demo](#demo)
- [Instalacja](#instalacja)
- [Konfiguracja danych geoprzestrzennych](#konfiguracja-danych-geoprzestrzennych)
- [Użytkowanie](#użytkowanie)
- [Struktura projektu](#struktura-projektu)
- [Konfiguracja](#konfiguracja)
- [Przygotowanie danych](#przygotowanie-danych)
- [Deployment](#deployment)
- [Rozwój](#rozwój)
- [Rozwiązywanie problemów](#rozwiązywanie-problemów)
- [Dokumentacja techniczna](#dokumentacja-techniczna)
- [Licencja](#licencja)
- [Autorzy](#autorzy)

## Opis projektu

**WislaBAT** to narzędzie do wizualizacji 3D scenariuszy zagrożenia powodziowego oparte na danych z fotogrametrii UAV i numerycznych modelach terenu (DEM). Projekt wykorzystuje WebGL (Three.js) do renderowania interaktywnych modeli terenu z pełnym wsparciem dla układu współrzędnych EPSG:2178 (Polish CS92), umożliwiając precyzyjną analizę przestrzenną i symulację różnych poziomów wody.

### Dla kogo?

- **Geoinformatycy** - analiza danych przestrzennych z precyzyjnymi współrzędnymi
- **Hydrolodzy** - symulacja scenariuszy powodziowych
- **Planiści** - ocena ryzyka i planowanie przestrzenne
- **Badacze** - wizualizacja danych terenowych UAV

## Funkcje

### 🌍 Wsparcie geoprzestrzenne
- ✅ Pełna obsługa EPSG:2178 (Polish CS92) z mapowaniem 1:1 w metrach
- ✅ Automatyczne wczytywanie metadanych z GeoTIFF
- ✅ Interaktywne wyświetlanie współrzędnych w czasie rzeczywistym
- ✅ Konwersja współrzędnych scena ↔ układ odniesienia

### 🗺️ Ładowanie i renderowanie terenu
- ✅ **Główny model GLTF**: Wysoko-precyzyjny teren fotogrametryczny z kompresją Draco
- ✅ Automatyczna transformacja współrzędnych z EPSG:2178 do przestrzeni Three.js
- ✅ Wsparcie DEM heightmap jako fallback do szybkiego prototypowania
- ✅ Automatyczne skalowanie na podstawie rzeczywistych wymiarów
- ✅ Konfigurowalny vertical exaggeration

### 💧 Symulacja wody
- ✅ Interaktywna kontrola poziomu wody (presety + custom)
- ✅ Realistyczna animacja powierzchni wody
- ✅ Dynamiczne odbicia i zniekształcenia

### ☀️ Oświetlenie i renderowanie
- ✅ Shader nieba z kontrolą pozycji słońca (elevation/azimuth)
- ✅ Dynamiczne cienie w czasie rzeczywistym
- ✅ Tone mapping (ACES Filmic)
- ✅ Responsywny render z adaptive resolution

### 🎮 Interfejs użytkownika
- ✅ Orbit controls (obracanie, zoom, pan)
- ✅ GUI z presetami poziomu wody
- ✅ Panel współrzędnych geoprzestrzennych
- ✅ Statystyki wydajności (FPS, memory)

## Demo

🔗 **[Zobacz live demo](https://judosik.github.io/WislaBAT/)**

## Instalacja

### Wymagania

- **Nowoczesna przeglądarka** z obsługą WebGL 2.0 (Chrome 90+, Firefox 88+, Safari 15+, Edge 90+)
- **Lokalny serwer WWW** (Python, Node.js http-server, VS Code Live Server, lub dowolny serwer HTTP)
- **GDAL** (opcjonalnie, do ekstrakcji metadanych GeoTIFF)

### Kroki instalacji

```bash
# 1. Sklonuj repozytorium
git clone https://github.com/Judosik/WislaBAT.git
cd WislaBAT

# 2. Uruchom lokalny serwer WWW (wybierz jedną metodę):

# Opcja A: Python 3
python -m http.server 8000

# Opcja B: Python 2
python -m SimpleHTTPServer 8000

# Opcja C: Node.js http-server (zainstaluj najpierw: npm install -g http-server)
http-server -p 8000

# Opcja D: Rozszerzenie VS Code Live Server
# Kliknij prawym przyciskiem na index.html → "Open with Live Server"

# 3. Otwórz przeglądarkę
# http://localhost:8000
```

### Weryfikacja instalacji

Po otwarciu w przeglądarce sprawdź konsolę (F12):

```
Inicjowanie sceny...
Przetwarzanie terenu...
Loading GLTF terrain model...
✓ Geospatial metadata loaded
✓ GLTF terrain loaded (zeroed model)
✓ Camera positioned automatically
✓ Initialization complete
```

## Konfiguracja danych geoprzestrzennych

### Szybki start (5 minut)

1. **Wyciągnij metadane z twojego GeoTIFF:**

```bash
# Zainstaluj GDAL (jeśli nie masz)
# Windows: https://gdal.org/download.html
# Linux: sudo apt install gdal-bin
# macOS: brew install gdal

# Sprawdź metadane
gdalinfo terrain_data/dem.tif
```

2. **Zaktualizuj `terrain_data/metadata.json`:**

Skopiuj wartości z `gdalinfo`:

```json
{
  "crs": "EPSG:2178",
  "bounds": {
    "minX": 650000,  // Upper Left X
    "maxX": 680000,  // Lower Right X
    "minY": 480000,  // Lower Right Y
    "maxY": 510000   // Upper Left Y
  },
  "elevation": {
    "min": -5.0,     // z gdalinfo -stats
    "max": 120.0,
    "unit": "meters"
  },
  "resolution": {
    "x": 30.0,       // Pixel Size
    "y": 30.0,
    "unit": "meters"
  }
}
```

3. **Gotowe!** Odśwież przeglądarkę i najedź myszką na teren - zobaczysz współrzędne EPSG:2178.

### Szczegółowa dokumentacja

Pełny przewodnik konfiguracji geoprzestrzennej: **[GEOSPATIAL_SETUP_PL.md](GEOSPATIAL_SETUP_PL.md)** | **[English version](GEOSPATIAL_SETUP.md)**

Obejmuje:
- Konwersję formatów danych
- Dostosowanie skalowania
- Troubleshooting współrzędnych
- Przykłady dla różnych regionów Polski

## Użytkowanie

### Podstawowa kontrola

| Akcja | Kontrola |
|-------|----------|
| **Obrót kamery** | Lewy przycisk myszy + przeciągnij |
| **Przesunięcie** | Prawy przycisk myszy + przeciągnij |
| **Zoom** | Kółko myszy |
| **Poziom wody** | GUI → Water Level → Preset/Custom |
| **Pozycja słońca** | GUI → Sky → Elevation/Azimuth |
| **Współrzędne** | Najedź myszką na teren |

### Interfejs GUI

**Water Level**
- **Preset**: Wybierz predefiniowany scenariusz
  - Risk: 1 to 10 years (0.2m)
  - Risk: 1 to 100 years (0.54m)
  - Risk: 1 to 500 years (1.2m)
  - Mean level of water (2.0m)
- **Water Level (m)**: Niestandardowa wysokość -3 do 3m

**Sky**
- **Elevation**: Wysokość słońca 0-90° (4° = wschód/zachód)
- **Azimuth**: Kierunek słońca -180° do 180° (-152° = domyślny)

**Water**
- **Distortion Scale**: Intensywność fal 0-8 (3.7 = domyślny)

## Struktura projektu

```
WislaBAT/
├── index.html                 # Entry point HTML
├── main.js                    # Główny plik aplikacji
├── package.json               # Zależności npm
├── vite.config.js             # Konfiguracja Vite
│
├── src/
│   ├── config.js              # Centralna konfiguracja
│   ├── geoUtils.js            # Narzędzia geoprzestrzenne EPSG:2178
│   ├── loadTerrain.js         # Ładowanie DEM + GLTF
│   ├── setupScene.js          # Inicjalizacja Three.js
│   └── setupUI.js             # GUI, water, sky, controls
│
├── terrain_data/
│   ├── dem.png                # Heightmap (fallback/prototypowanie)
│   ├── orto_phot.png          # Tekstura ortofoto
│   └── metadata.json          # Metadane geoprzestrzenne ← KONFIGURUJ TO
│
├── models/
│   └── model_zeroed.glb       # Główny model terenu GLTF (kompresja Draco)
│
├── textures/
│   └── waternormals.jpg       # Normal map wody
│
├── docs/
│   └── GEOSPATIAL_SETUP.md    # Szczegółowy przewodnik
│
└── dist/                      # Build produkcyjny (generowany)
```

## Konfiguracja

### Podstawowe ustawienia - `src/config.js`

```javascript
export const CONFIG = {
  // Renderowanie
  renderer: {
    toneMappingExposure: 0.5,    // Jasność sceny
    shadowMapSize: 2048,          // Jakość cieni (512/1024/2048/4096)
  },

  // Kamera
  camera: {
    fov: 45,                      // Pole widzenia
    position: { x: 30, y: 120, z: 130 },
  },

  // Geoprzestrzenne
  geospatial: {
    enabled: true,                // Włącz/wyłącz tryb geoprzestrzenny
    verticalExaggeration: 1.5,    // Przesada pionowa (1.0 = prawdziwa skala)
    centerAtOrigin: true,         // Wyśrodkuj teren w punkcie (0,0,0)
    // Uwaga: Współrzędne poziome używają mapowania 1:1 w metrach
  },

  // Woda
  water: {
    distortionScale: 3.7,         // Intensywność fal
    defaultLevel: 0.54,           // Domyślny poziom (m)
  },

  // Oświetlenie
  lighting: {
    sun: {
      elevation: 4,               // Wysokość słońca (stopnie)
      azimuth: -152,              // Kierunek słońca (stopnie)
    },
  },
};
```

### Zaawansowane - Przesada pionowa

Dostosuj przesadę pionową dla lepszej wizualizacji:

| Typ terenu | verticalExaggeration | Efekt |
|------------|---------------------|-------|
| Płaski teren | 2.0 - 5.0         | Podkreśl subtelne zmiany wysokości |
| Umiarkowane wzniesienia | 1.5 - 2.0 | Zbalansowana wizualizacja (domyślnie: 1.5) |
| Górzysty | 1.0 - 1.5            | Zachowaj naturalne proporcje |

Uwaga: Wszystkie współrzędne poziome używają mapowania 1:1 w metrach (bez skalowania).

## Przygotowanie danych

### 1. Heightmap (DEM)

**Z GeoTIFF:**
```bash
# Konwersja GeoTIFF → PNG (8-bit)
gdal_translate -of PNG -scale dem.tif dem.png
```

**Z chmury punktów:**
```bash
# LAS/LAZ → GeoTIFF (GDAL/PDAL)
pdal pipeline pipeline.json
```

**Wymagania:**
- Format: PNG (8-bit grayscale) lub TIFF
- Rozdzielczość: 512x512 do 2048x2048
- Zakres wysokości: znormalizowany 0-255

### 2. Ortofoto (tekstura)

```bash
# Zmniejsz rozmiar ortofoto do optymalnego rozmiaru
gdal_translate -outsize 2048 2048 ortofoto.tif ortofoto.png
```

**Wymagania:**
- Format: PNG/JPG
- Rozmiar: 1024x1024 do 4096x4096 (zalecane: 2048x2048)
- Kompresja: JPG quality 85-95

### 3. Model GLTF (opcjonalnie)

**Blender workflow:**

1. Import → fotogrametria (OBJ/PLY/FBX)
2. Mesh cleanup:
   - Decimate modifier (cel: 40-100k tris)
   - Remove doubles
   - Recalculate normals
3. Origin → Set to lowest point
4. Apply all transforms (Ctrl+A)
5. Export → glTF 2.0:
   - ✅ Draco compression (level 7)
   - ✅ +Y up
   - ✅ Include normals
   - ❌ Cameras/lights

**Linia komend (gltf-transform):**
```bash
npm install -g @gltf-transform/cli

gltf-transform draco input.glb output.glb \
  --compression 7 \
  --quantize-position 14 \
  --quantize-normal 10
```

**Cel:** < 20MB dla GitHub Pages

## Deployment

### GitHub Pages

```bash
# 1. Zbuduj projekt
npm run build

# 2. Deploy na gh-pages branch
npm run deploy   # jeśli skonfigurowane

# LUB manualnie:
git add dist -f
git commit -m "Build"
git subtree push --prefix dist origin gh-pages
```

### Własny serwer

```bash
# Zbuduj
npm run build

# Wynik w /dist jest gotowy do skopiowania na serwer HTTP
# Apache/Nginx/Cloudflare Pages/Netlify/Vercel
```

## Rozwój

### Uruchomienie dev server

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
```

### Dodawanie funkcji

```javascript
// 1. Utwórz nowy moduł
// src/myFeature.js
export function myFeature() {
  // implementacja
}

// 2. Zaimportuj w main.js
import { myFeature } from './src/myFeature.js';

// 3. Użyj w init()
async function init() {
  // ...
  myFeature();
}
```

### Struktura kodu

- **Modułowa**: Każdy plik = jedna odpowiedzialność
- **ES6+**: Import/export, async/await, arrow functions
- **Konfiguracja**: Wszystkie stałe w `src/config.js`
- **Komentarze**: JSDoc dla publicznych API

### Konwencje nazewnictwa

```javascript
// Pliki
setupScene.js       // camelCase
geoUtils.js

// Funkcje/zmienne
function loadTerrain() {}
const terrainMesh = ...

// Klasy (jeśli używane)
class GeoTransform {}

// Stałe
const TERRAIN_SEGMENTS = 256;
```

## Rozwiązywanie problemów

### Teren się nie ładuje

**Problem:** Czarny ekran, brak terenu w konsoli

**Rozwiązanie:**
1. Sprawdź konsolę przeglądarki (F12)
2. Zweryfikuj ścieżki w `src/config.js`:
   ```javascript
   assets: {
     heightmap: "terrain_data/dem.png",  // ścieżka względem public/
   }
   ```
3. Upewnij się, że pliki są w odpowiednich folderach

### Współrzędne pokazują błędne wartości

**Problem:** Współrzędne EPSG:2178 poza zakresem dla Polski

**Rozwiązanie:**
1. Sprawdź `terrain_data/metadata.json` - bounds muszą być w EPSG:2178 (metry)
2. Użyj `gdalinfo` aby zweryfikować CRS źródłowego GeoTIFF
3. Jeśli dane są w innym układzie, przekonwertuj:
   ```bash
   gdalwarp -s_srs EPSG:4326 -t_srs EPSG:2178 input.tif output.tif
   ```

### Słaba wydajność (niskie FPS)

**Rozwiązanie:**
1. Zmniejsz `shadowMapSize` w config.js (2048 → 1024)
2. Ogranicz `TERRAIN_SEGMENTS` w loadTerrain.js (256 → 128)
3. Wyłącz cienie:
   ```javascript
   renderer.shadowMap.enabled = false;
   ```
4. Zmniejsz rozdzielczość tekstur (4096 → 2048px)

### Woda jest niewidoczna

**Rozwiązanie:**
1. Sprawdź czy `waterLevel > elevation_terenu`
2. Zweryfikuj załadowanie `waternormals.jpg`:
   - Otwórz konsołę → Network → sprawdź 404 errors
3. Zwiększ `water.size` jeśli teren jest duży:
   ```javascript
   water: { size: 10000 }  // w src/config.js
   ```

### Model GLTF nie ładuje się

**Problem:** "Failed to load GLTF" w konsoli

**Rozwiązanie:**
1. Sprawdź czy `CONFIG.useGLTF = true` w config.js
2. Zweryfikuj ścieżkę: `models/terrain.glb`
3. Upewnij się że dekoder Draco jest dostępny:
   ```
   https://www.gstatic.com/draco/versioned/decoders/1.5.6/
   ```
4. Test połączenia: otwórz URL w przeglądarce

## Dokumentacja techniczna

### Architektura

```
┌─────────────────────────────────────────────────┐
│                   main.js                        │
│              (Application Entry)                 │
└─────────────────────────────────────────────────┘
         │
         ├─► setupScene.js ────► THREE.Scene/Camera/Renderer
         │
         ├─► loadTerrain.js ───► geoUtils.js ─┬─► GeoTransform
         │                                     └─► Coordinate conversion
         │
         ├─► setupUI.js ───────► Water/Sky/Controls/GUI
         │
         └─► config.js ────────► Central configuration
```

### Klasy i moduły

**GeoTransform** (`src/geoUtils.js`)
- Konwersja EPSG:2178 ↔ Three.js coordinates
- Skalowanie wysokości z vertical exaggeration
- Kalkulacja wymiarów terenu

**loadTerrain()** (`src/loadTerrain.js`)
- Ładowanie metadanych geoprzestrzennych
- Generowanie mesh z heightmap
- Opcjonalne upgrade do GLTF

**setupUI()** (`src/setupUI.js`)
- Water mesh + animacja
- Sky shader system
- OrbitControls
- lil-gui panel

### API Reference

**Podstawowe funkcje:**

```javascript
// Ładowanie terenu
loadTerrain(scene) → Promise<THREE.Mesh>

// Pobranie transformacji geoprzestrzennej
getGeoTransform() → GeoTransform | null

// Update loop
updateWater(water, deltaTime)
updateSun(sun, sky, water, light, parameters)
```

**GeoTransform API:**

```javascript
const geo = new GeoTransform(metadata);

// Scene → Geo
geo.toGeoCoords(sceneX, sceneZ) → {x, y}
geo.toGeoElevation(sceneY) → elevation_meters

// Geo → Scene
geo.toSceneCoords(x, y) → {x, z}
geo.toSceneElevation(elevation) → sceneY
```

## Technologie

- **[Three.js r170](https://threejs.org/)** - WebGL rendering engine
- **[Vite 5.x](https://vitejs.dev/)** - Build tool i dev server
- **[lil-gui](https://lil-gui.georgealgo.com/)** - Lightweight GUI
- **[Draco](https://github.com/google/draco)** - Mesh compression
- **[GDAL](https://gdal.org/)** - Geospatial data processing

## Wsparcie przeglądarek

| Przeglądarka | Minimalna wersja | Status |
|--------------|------------------|--------|
| Chrome       | 90+              | ✅ Tested |
| Firefox      | 88+              | ✅ Tested |
| Safari       | 15+              | ✅ Compatible |
| Edge         | 90+              | ✅ Tested |

**Wymagania:** WebGL 2.0, ES6 modules

## Roadmapa

- [ ] Eksport zrzutów ekranu (PNG)
- [ ] Pomiar odległości/powierzchni
- [ ] Import wielu warstw terenu
- [ ] Timeline dla animacji poziomu wody
- [ ] VR mode (WebXR)
- [ ] Wsparcie dla innych układów współrzędnych

## Contributing

Pull requesty są mile widziane! Dla większych zmian, najpierw otwórz issue aby przedyskutować proponowane zmiany.

1. Fork projektu
2. Utwórz branch (`git checkout -b feature/AmazingFeature`)
3. Commit zmian (`git commit -m 'Add AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## Licencja

Ten projekt jest licencjonowany na licencji **MIT** - zobacz plik [LICENSE](LICENSE) dla szczegółów.

## Autorzy

**WislaBAT** - Narzędzie do wizualizacji powodziowej z fotogrametrii UAV

Projekt powstał w ramach badań nad zastosowaniem fotogrametrii dronowej w analizie zagrożenia powodziowego.

## Cytowanie

Jeśli używasz tego projektu w badaniach naukowych, prosimy o cytowanie:

```bibtex
@software{wislabat2024,
  title={WislaBAT: 3D Flood Visualization Tool},
  author={[Twoje Imię]},
  year={2024},
  url={https://github.com/Judosik/WislaBAT}
}
```

## Wsparcie

- 📫 Issues: [GitHub Issues](https://github.com/Judosik/WislaBAT/issues)
- 📖 Wiki: [GitHub Wiki](https://github.com/Judosik/WislaBAT/wiki)
- 💬 Dyskusje: [GitHub Discussions](https://github.com/Judosik/WislaBAT/discussions)

---

**Zbudowano z ❤️ dla społeczności geoinformatycznej**
