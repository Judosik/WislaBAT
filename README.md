# Wizualizacja Poziomu Wody z Three.js

Interaktywna wizualizacja 3D poziomów wody z wykorzystaniem fotogrametrycznych modeli terenu, zbudowana z Three.js, Vite przy wykorzystaniu technologi open-source. Projekt wizualizacji scenariuszy powodziowych na bazie danych z fotogrametrii dronowej.

## 🎯 Funkcje

- **Ładowanie Terenu Fotogrametrycznego**: Modele glTF z kompresją Draco z fotogrametrii UAV
- **Interaktywna Kontrola Poziomu Wody**: Predefiniowane poziomy lub niestandardowe wprowadzanie wysokości w czasie rzeczywistym
- **Dynamiczne Oświetlenie HDR**: Mapy środowiskowe dla realistycznego oświetlenia bez wizualnych artefaktów tła
- **Automatyczne Kadrowanie Kamery**: Pozycjonowanie i ostrość na terenie niezależnie od jego geometrii
- **Modułowa Architektura**: Wzorce komponenty + systemy dla czystego rozdzielenia odpowiedzialności
- **Optymalizacja Sieciowa**: Zoptymalizowano dla GitHub Pages z strategiami kompresji
- **Responsywny Design**: Pełnoekranowa wizualizacja 3D z adaptacyjnymi proporcjami

## 📋 Wymagania

- Node.js 18+ i npm
- Model fotogrametryczny (przetworzony w Blenderze z kompresją Draco)
- WebGL 2.0 (Chrome 56+, Firefox 51+, Safari 15+, Edge 79+)

## 🚀 Szybki Start

### Instalacja i uruchomienie

```bash
git clone <twój-url-repozytorium>
cd water-level-viz
npm install
npm run dev
```

Otwórz `http://localhost:5173` w przeglądarce. Vite zapewnia Hot Module Replacement podczas deweloperki.

### Budowanie do produkcji

```bash
npm run build
```

Wynik w `/dist` jest gotowy do wdrożenia na GitHub Pages lub statycznym hostingu.

## 📁 Struktura Projektu

```
water-level-viz/
├── public/
│   ├── models/terrain.glb              # Model Draco
│   ├── textures/waternormals.jpg
│   └── hdri/environment.hdr            # Oświetlenie HDR
├── src/
│   ├── main.js                         # Punkt wejścia
│   ├── core/
│   │   ├── Scene.js                    # Wrapper THREE.Scene
│   │   ├── Camera.js                   # Zarządzanie kamerą
│   │   └── Renderer.js                 # Konfiguracja renderera
│   ├── components/
│   │   ├── TerrainLoader.js            # Ładowanie glTF + Draco
│   │   ├── WaterPlane.js               # Siatka wody i poziomy
│   │   └── SkySystem.js                # Shader nieba
│   ├── systems/
│   │   ├── LightingSystem.js           # Oświetlenie + HDR
│   │   ├── ControlsSystem.js           # OrbitControls + ostrość
│   │   └── GUIManager.js               # Kontrolki lil-gui
│   ├── utils/helpers.js                # Funkcje pomocnicze
│   └── config/constants.js             # Globalna konfiguracja
├── index.html
├── vite.config.js
└── package.json
```

## 🔧 Konfiguracja

### Predefiniowane poziomy wody

W `src/components/WaterPlane.js`:

```javascript
this.waterLevelPresets = {
    'Low': 0.2,
    'Normal': 0.54,
    'High': 1.2,
    'Flood': 2.0,
};
```

Wartości w metrach względem punktu początkowego terenu (ustawionego w Blenderze).

### Parametry oświetlenia

W `src/systems/LightingSystem.js`:

```javascript
this.sunParams = { 
    elevation: 4,      // 0-90 stopni
    azimuth: -152      // -180 do 180 stopni
};

this.ambientLight.intensity = 0.5;       // Jasność otoczenia
this.directionalLight.intensity = 1.0;   // Jasność słońca
```

### Ustawienia kamery

W `src/systems/ControlsSystem.js`:

```javascript
this.controls.minDistance = 10.0;
this.controls.maxDistance = 180.0;
this.controls.maxPolarAngle = Math.PI * 0.495;  // Ogranicz obrót pionowy
```

## 📦 Przygotowanie Modelu Fotogrametrycznego

### Przepływ pracy w Blenderze

1. **Importuj** surowy model fotogrametryczny
2. **Ustaw Początek**: Kursor 3D do najniższego punktu → Object → Set Origin → Origin to 3D Cursor
3. **Zastosuj Transformacje**: Ctrl+A → All Transforms
4. **Zmniejsz Siatkę**: Decimation modifier, cel 40–100 tys. ścian
5. **Weryfikuj**: Orientacja Y w górę (standard Three.js)
6. **Eksportuj**: File → Export → glTF 2.0 (.glb) → Draco mesh compression (level 5–7)

### Rozmiary docelowe

| Etap | Rozmiar | Narzędzie |
|------|---------|----------|
| Surowa fotogrametria | 500MB–2GB | UAV/fotogrametria |
| Po redukcji | 50–200MB | Blender |
| Po kompresji Draco | 5–20MB | glTF-Transform/Blender |

Dla GitHub Pages finalny model powinien być poniżej 20MB.

### Kompresja linią komend (opcjonalnie)

```bash
npm install --save-dev @gltf-transform/cli

# Draco + kwantyzacja
npx gltf-transform draco input.glb output.glb \
  --compression 7 \
  --quantize-position 11 \
  --quantize-normal 8

# Kompresja tekstur (basis universal)
npx gltf-transform etc1s output.glb output-compressed.glb --size 512
```

## 🌐 Wdrożenie

### GitHub Pages

```bash
# Buduj pakiet
npm run build

# Utwórz worktree dla gh-pages
git worktree add dist gh-pages

# Wdróż
cp -r dist/* ../
cd ..
git add .
git commit -m "Deploy"
git push origin gh-pages
```

Alternatywnie użyj Akcji GitHub (zobacz `.github/workflows/deploy.yml`).

## 🎮 Interakcje

| Kontrola | Akcja |
|----------|-------|
| LPM + Przeciągnij | Obrót widoku |
| PPM + Przeciągnij | Przesunięcie kamery |
| Scroll | Zoom |
| Rozwijana lista | Predefiniowany poziom wody |
| Suwak | Niestandardowa wysokość |
| Folder Sun | Elewacja/azymut słońca |
| Folder Water | Zniekształcenie wody |

## 🏗️ Wzorce Architektoniczne

### Komponenty

Elementy wizualne (teren, woda, niebo) jako samodzielne klasy:

```javascript
export class WaterPlane {
    create() { /* geometria + materiał */ }
    update(delta) { /* animacja */ }
    setLevel(level) { /* kontrola poziomu */ }
}
```

### Systemy

Zagadnienia przekrojowe (oświetlenie, GUI) scentralizowane:

```javascript
export class LightingSystem {
    setupLights() { /* otoczenia + kierunkowe */ }
    loadEnvironment() { /* HDR */ }
    updateSun() { /* pozycja słońca */ }
}
```

### Aplikacja

Orkiestrator inicjalizuje wszystkie systemy:

```javascript
class Application {
    async init() { /* załaduj komponenty */ }
    animate() { /* pętla renderowania */ }
}
```

## 🔍 Optymalizacja Wydajności

### Model

- Kompresja Draco: redukcja 70–95% rozmiaru
- Cel: ≤40 tys. ścian dla płynnej interakcji
- Wypalanie tekstur zamiast proceduralnych shaderów

### Kod

- Vite tree-shaking: tylko używane moduły Three.js
- Code splitting dla dużych zasobów
- Lazy loading dla niekrytycznych komponentów

### Runtime

- Mapy cienia: maksymalnie 2048×2048
- Tylko widoczny fragment płaszczyzny wody
- Współczynnik pikseli ≤2×
- Frustum culling domyślnie włączone

## 📊 Wsparcie Przeglądarek

| Przeglądarka | Wersja | Wsparcie |
|--------------|--------|---------|
| Chrome | 90+ | ✅ |
| Firefox | 88+ | ✅ |
| Safari | 15+ | ✅ |
| Edge | 90+ | ✅ |

WebGL 2.0 wymagany. Sprawdź wsparcie na caniuse.com/webgl2.

## 🐛 Rozwiązywanie Problemów

### Model się nie ładuje

- Zweryfikuj ścieżkę w `public/models/`
- Sprawdź konsolę przeglądarki pod kątem CORS
- Upewnij się, że dekoder Draco jest dostępny (gstatic.com/draco)

### Słaba wydajność

- Zmniejsz liczbę ścian (cel: 40–100 tys.)
- Obniż rozdzielczość tekstur (max 1024×1024)
- Wyłącz cienie: `directionalLight.castShadow = false`

### Woda niewidoczna

- Sprawdź wartość `waterLevel` (powinna być powyżej terenu)
- Zweryfikuj, że `waternormals.jpg` jest załadowany
- Dostosuj `distortionScale` (zakres 0–8)

### Automatyczne kadrowanie nie działa

- Upewnij się, że model terenu ma zdefiniowane bounds
- Sprawdź, czy model jest na scenie przed `focusOnObject()`

## 👨‍💻 Rozwój

### Dodawanie komponentu

```javascript
// src/components/NewComponent.js
export class NewComponent {
    create() { /* logika */ }
    update(delta) { /* animacja */ }
}

// main.js
import { NewComponent } from './components/NewComponent.js';
const component = new NewComponent();
component.create();
this.scene.add(component.mesh);
```

### Styl kodu

- Moduły ES6 i async/await
- Konwencje nazewnictwa Three.js
- Komentarze dla skomplikowanych obliczeń
- Metody prywatne z prefiksem `_`

## 📚 Zasoby

- [Three.js Dokumentacja](https://threejs.org/docs)
- [Specyfikacja glTF 2.0](https://www.khronos.org/registry/glTF/specs/2.0/glTF-2.0.html)
- [Draco Mesh Compression](https://github.com/google/draco)
- [Vite](https://vitejs.dev/)

## 📄 Licencja

MIT — zobacz plik LICENSE.

## 👤 Autor

Wizualizacja do geoinformatycznej analizy powodzi z fotogrametrii UAV.

## 📦 Zbudowane z

- [Three.js](https://threejs.org/) — Renderowanie 3D WebGL
- [Vite](https://vitejs.dev/) — Build tool
- [Draco](https://github.com/google/draco) — Kompresja siatki
- [lil-gui](https://lil-gui.georgealgo.com/) — Kontrolki UI
- [Blender](https://www.blender.org/) — Przygotowanie modelu
- [GitHub Pages](https://pages.github.com/) — Wdrożenie
