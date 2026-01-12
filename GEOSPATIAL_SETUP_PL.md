# Przewodnik konfiguracji geoprzestrzennej

> 🇵🇱 Wersja polska | [🇬🇧 English version](GEOSPATIAL_SETUP.md)

Ten przewodnik wyjaśnia, jak skonfigurować dane terenowe z odpowiednimi metadanymi geoprzestrzennymi dla układu współrzędnych EPSG:2178 (Polish CS92).

## Szybki start

1. **Wyciągnij metadane z twojego GeoTIFF** (jednorazowa konfiguracja)
2. **Zaktualizuj `terrain_data/metadata.json`** wyciągniętymi wartościami
3. **Uruchom aplikację** - teren automatycznie się przeskaluje

---

## Krok 1: Wyciągnij metadane z GeoTIFF

### Opcja A: Użycie GDAL (Zalecane)

Zainstaluj GDAL, jeśli go nie masz:
```bash
# Windows (używając OSGeo4W lub Conda)
conda install -c conda-forge gdal

# Linux/Mac
sudo apt install gdal-bin  # Debian/Ubuntu
brew install gdal          # macOS
```

Wyciągnij metadane:
```bash
gdalinfo terrain_data/dem.tif
```

Szukaj tych kluczowych wartości w wyniku:

```
Upper Left  (  650000.000,  510000.000)  # minX, maxY
Lower Right (  680000.000,  480000.000)  # maxX, minY
Pixel Size = (30.0, -30.0)               # rozdzielczość X, Y
```

### Opcja B: Użycie QGIS (metoda GUI)

1. Otwórz QGIS
2. Wczytaj swój GeoTIFF: **Warstwa → Dodaj warstwę → Dodaj warstwę rastrową**
3. Kliknij prawym przyciskiem na warstwę → **Właściwości → Informacje**
4. Znajdź:
   - **Zasięg**: minX, maxX, minY, maxY
   - **Rozmiar piksela**: rozdzielczość
   - **CRS**: Powinien być EPSG:2178

---

## Krok 2: Zaktualizuj metadata.json

Edytuj `terrain_data/metadata.json` swoimi rzeczywistymi wartościami:

```json
{
  "crs": "EPSG:2178",
  "bounds": {
    "minX": 650000,    // ← Zamień na swoje wartości
    "maxX": 680000,
    "minY": 480000,
    "maxY": 510000
  },
  "elevation": {
    "min": -5.0,       // ← Minimalna wysokość w metrach
    "max": 120.0,      // ← Maksymalna wysokość w metrach
    "unit": "meters"
  },
  "resolution": {
    "x": 30.0,         // ← Rozmiar piksela w metrach (z gdalinfo)
    "y": 30.0,
    "unit": "meters"
  }
}
```

### Jak znaleźć zakres wysokości:

```bash
# Używając GDAL
gdalinfo -stats terrain_data/dem.tif

# Szukaj:
# Minimum=0.000, Maximum=120.450
```

---

## Krok 3: Opcje konfiguracji

### Dostosuj ustawienia wizualne

Edytuj `src/config.js`:

```javascript
geospatial: {
  enabled: true,  // Ustaw false aby wyłączyć tryb geoprzestrzenny

  // Przesada pionowa dla lepszej wizualizacji
  verticalExaggeration: 1.5,  // 1.0 = prawdziwa skala, 2.0 = 2x wysokość

  // Wycentruj teren w początku układu (zalecane dla Three.js)
  centerAtOrigin: true,

  // Uwaga: Wszystkie współrzędne poziome używają mapowania 1:1 w metrach
  // Tylko oś pionowa używa przesady dla wizualizacji
}
```

### Mapowanie współrzędnych

System używa **mapowania 1:1 w metrach** dla wszystkich współrzędnych poziomych:
- 1 metr w EPSG:2178 = 1 metr w scenie Three.js
- Nie stosuje się skalowania poziomego
- Tylko przesada pionowa jest używana (domyślnie: 1.5x)

---

## Krok 4: Weryfikacja konfiguracji

Kiedy uruchomisz aplikację, sprawdź konsolę przeglądarki:

```
✓ Geospatial metadata loaded
GeoTransform initialized: {
  crs: "EPSG:2178",
  realWorldSize: "30000m × 30000m",
  threeJSSize: "30.0 × 30.0",
  center: "(665000, 495000)"
}
```

Przesuń mysz nad teren - powinieneś zobaczyć:
```
EPSG:2178 Coordinates
X: 665432.12m N, Y: 495123.45m E
Elevation: 45.23 m
```
Uwaga: X = Northing (oś północ-południe), Y = Easting (oś wschód-zachód)

---

## Informacje o układach współrzędnych

### EPSG:2178 (Polish CS92)
- **Jednostki**: Metry
- **Pokrycie**: Polska
- **Typ**: Odwzorowanie płaskie (Transverse Mercator)
- **False Easting**: 500,000m
- **False Northing**: -5,300,000m

Typowe zakresy współrzędnych dla Polski:
- **X (Northing)**: 180,000 - 810,000  (oś północ-południe)
- **Y (Easting)**: 470,000 - 860,000   (oś wschód-zachód)

---

## Rozwiązywanie problemów

### Teren wydaje się zbyt płaski lub zbyt wysoki
Dostosuj `verticalExaggeration` w [config.js](src/config.js#L86):
```javascript
verticalExaggeration: 2.0,  // Wypróbuj różne wartości
```

### Kamera jest za daleko lub za blisko
Dostosuj początkową pozycję kamery w [config.js](src/config.js):
```javascript
camera: {
  position: { x: 500, y: 500, z: 300 },  // Dostosuj w zależności od rozmiaru terenu
}
```
Uwaga: Wszystkie współrzędne używają mapowania 1:1 w metrach (bez skalowania).

### Współrzędne pokazują błędne wartości
1. Zweryfikuj, że `bounds` w [metadata.json](terrain_data/metadata.json) pasują do wyniku `gdalinfo`
2. Sprawdź, że CRS to EPSG:2178
3. Upewnij się, że `centerAtOrigin: true` odpowiada twoim oczekiwaniom

### Nie wyświetla się panel współrzędnych
1. Sprawdź, że `geospatial.enabled: true` w [config.js](src/config.js#L84)
2. Zweryfikuj, że [metadata.json](terrain_data/metadata.json) wczytuje się bez błędów (sprawdź konsolę)
3. Upewnij się, że naprowadzasz kursor na mesh terenu

---

## Zaawansowane: Konwersja innych formatów

### Konwersja heightmapy PNG do GeoTIFF z metadanymi

Jeśli masz tylko PNG + plik world (.pgw):

```bash
gdal_translate -a_srs EPSG:2178 \
  -a_ullr 650000 510000 680000 480000 \
  dem.png dem.tif
```

Gdzie `-a_ullr` = Upper Left X, Upper Left Y, Lower Right X, Lower Right Y

---

## Struktura plików

```
WislaBAT/
├── terrain_data/
│   ├── dem.png              # Twoja heightmapa (aktualnie)
│   ├── dem.tif              # Opcjonalnie: źródłowy GeoTIFF
│   ├── metadata.json        # ← TO KONFIGURUJ
│   └── orto_phot.png        # Tekstura
├── src/
│   ├── config.js            # Dostosuj ustawienia wizualne tutaj
│   ├── geoUtils.js          # Logika konwersji współrzędnych
│   └── loadTerrain.js       # Stosuje transformacje geoprzestrzenne
└── GEOSPATIAL_SETUP_PL.md   # Ten plik
```

---

## Przykład: Region Warszawy

Jeśli twoje dane obejmują centrum Warszawy:

```json
{
  "crs": "EPSG:2178",
  "bounds": {
    "minX": 638000,  // Zachód Warszawy
    "maxX": 658000,  // Wschód Warszawy
    "minY": 474000,  // Południe
    "maxY": 494000   // Północ
  },
  "elevation": {
    "min": 75.0,     // Poziom Wisły
    "max": 120.0,    // Wyższe obszary
    "unit": "meters"
  },
  "resolution": {
    "x": 10.0,       // DEM 10m
    "y": 10.0,
    "unit": "meters"
  }
}
```

---

## Potrzebujesz pomocy?

1. Uruchom `gdalinfo terrain_data/twoj_plik.tif` i wklej wynik
2. Sprawdź konsolę przeglądarki w poszukiwaniu komunikatów błędów
3. Zweryfikuj, że współrzędne są w EPSG:2178 (nie lat/lon!)
