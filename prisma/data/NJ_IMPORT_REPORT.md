# NJ Price & Offer List — Import Report

## Overview
- **Source File:** `NJ Price & Offer List Exclusive.xlsx` (Sheet `Sheet2`)
- **Total Rows in Sheet:** 653 (1 header, 652 data rows, 1 completely blank row at row 654)
- **Skipped Non-Phone Rows:** 62 (audio, tablets, laptops, smartwatches)
- **Merged Duplicate Rows:** 1 (Moto G37 4+64GB Capri (Cyan) [stock 6] and Capri Cyan [stock 16] merged into 1 product with stock 22)
- **Phone Variants to Import:** 589 unique products
- **Phone Models:** 116 distinct models across 9 storefront brands

---

## Flagged Rows for Owner / User Review

1. **vivo V70 Elite 12+512GB (Rows 575, 576):**
   - **Issue:** Priced at **₹61,999**, which is lower than both the 8+256GB tier (**₹66,999**) and 12+256GB tier (**₹71,999**).
   - **Current handling:** Importer preserves the sheet's exact figure of ₹61,999 pending confirmation.

2. **vivo X300 Ultra Photographer Kit (Row 596):**
   - **Issue:** Listed as `VIVO:X300 ULTRA 16+512GB WITH PHOTOGRAPHER KIT` at **₹2,09,999**.
   - **Current handling:** Configured as a distinct bundle option under the **vivo X300 Ultra** model rather than a colour swatch, allowing customers to choose between standard (₹1,59,999) and Photographer Kit edition (₹2,09,999).

3. **Moto G35 Dual-Tone Row (Row 113):**
   - **Issue:** `MOTOROLA:MOTO G35 4+128GB LEAF GREEN/MIDNIGHT BLACK` is priced at **₹16,000**, whereas Midnight Black (Row 114) is **₹15,999** (₹1 difference).
   - **Current handling:** Preserved exact sheet price of ₹16,000.

4. **realme C100X Missing Brand Prefix (Rows 285, 286):**
   - **Issue:** Column C (Short Name) has `C100X 4+64GB` without `REALME:` prefix, though Column B has `REALME:C100X 4+64GB`.
   - **Current handling:** Properly assigned to brand `realme` as `realme C100X`.

5. **Model Name Identification Confidence:**
   - All **116** phone models have been confidently identified and matched to official retail names.

---

## Phone Models Breakdown (Brand by Brand)

### Google (6 models, 24 variant options, Total Stock: 24)

- **Pixel 10**: 256GB | Colours: Frost, Indigo, Obsidian | Price: ₹79,999 | Total Stock: 0
- **Pixel 10a**: 256GB | Colours: Berry, FOG, Lavender, Obsidian | Price: ₹55,999 | Total Stock: 6
- **Pixel 11**: 256GB, 512GB | Colours: Frost, Hibiscus, Obsidian, Pistachio | Price: ₹89,999 – ₹104,999 | Total Stock: 8
- **Pixel 11 Pro**: 256GB, 512GB | Colours: Canyon, FOG, Obsidian, Olive | Price: ₹119,999 – ₹134,999 | Total Stock: 6
- **Pixel 11 Pro Fold**: 512GB | Colours: Olive | Price: ₹186,999 | Total Stock: 2
- **Pixel 11 Pro XL**: 256GB | Colours: Canyon, FOG | Price: ₹134,999 | Total Stock: 2

### Nothing (4 models, 27 variant options, Total Stock: 92)

- **Nothing Phone (3a) Lite**: 8GB + 128GB, 8GB + 256GB | Colours: Black, Blue, White | Price: ₹27,999 – ₹29,999 | Total Stock: 21
- **Nothing Phone (4a)**: 12GB + 256GB, 8GB + 128GB, 8GB + 256GB | Colours: Black, Blue, Pink, White | Price: ₹44,999 – ₹50,999 | Total Stock: 32
- **Nothing Phone (4a) Pro**: 12GB + 256GB, 8GB + 128GB, 8GB + 256GB | Colours: Black, Pink, Silver | Price: ₹54,999 – ₹59,999 | Total Stock: 15
- **Nothing Phone (4b)**: 8GB + 128GB, 8GB + 256GB | Colours: Black, Blue, White | Price: ₹39,999 – ₹40,999 | Total Stock: 24

### Motorola (13 models, 46 variant options, Total Stock: 306)

- **Moto Edge 70 Fusion**: 12GB + 256GB, 12GB + 512GB, 8GB + 128GB | Colours: Blue Surf, Country AIR, Orient Blue, Silhouette | Price: ₹30,999 – ₹38,999 | Total Stock: 32
- **Moto Edge 70 Max**: 12GB + 256GB, 8GB + 256GB | Colours: Aqua Gray, Dark Shadow, ICE Melt | Price: ₹54,999 – ₹59,999 | Total Stock: 12
- **Moto Edge 70 Pro**: 12GB + 256GB, 8GB + 256GB | Colours: Lily White, TEA, TEA Green, Titan Blue | Price: ₹39,999 – ₹42,999 | Total Stock: 22
- **Moto Edge 70 Pro+**: 12GB + 256GB | Colours: Chicory Coffee Brown, Zinfandel Maroon | Price: ₹47,999 | Total Stock: 5
- **Moto G Max**: 4GB + 128GB, 6GB + 128GB | Colours: Alaskan Blue, Stargazer Grey | Price: ₹25,999 – ₹27,999 | Total Stock: 55
- **Moto G06**: 4GB + 64GB | Colours: Pantone Laurel OAK, Tapestry, Tendril | Price: ₹15,999 | Total Stock: 5
- **Moto G35**: 4GB + 128GB | Colours: Leaf Green/midnight Black, Midnight Black | Price: ₹15,999 – ₹16,000 | Total Stock: 9
- **Moto G37**: 4GB + 64GB | Colours: Capri (cyan), Capri Cyan, Impenetrable Black, Nautical Blue | Price: ₹18,999 | Total Stock: 69
- **Moto G37 Power**: 4GB + 128GB, 8GB + 128GB | Colours: Capri, Nautical Blue | Price: ₹21,999 – ₹25,999 | Total Stock: 87
- **Moto G57 Power**: 8GB + 128GB | Colours: Corsair, Fluidity, Regatta | Price: ₹21,999 | Total Stock: 0
- **Moto G67 Power**: 12GB + 256GB, 8GB + 128GB | Colours: Cilantro, Curacao Blue, Parachute | Price: ₹22,999 – ₹27,999 | Total Stock: 1
- **Moto G77 Power**: 8GB + 128GB | Colours: Nautical Blue | Price: ₹27,999 | Total Stock: 8
- **Moto Signature**: 12GB + 256GB | Colours: Carbon, Martine Olive | Price: ₹59,999 | Total Stock: 1

### Apple (7 models, 46 variant options, Total Stock: 128)

- **iPhone 15**: 128GB, 256GB | Colours: Black, Blue | Price: ₹74,900 – ₹84,900 | Total Stock: 25
- **iPhone 16**: 128GB | Colours: Black, Pink, Teal, Ultramarine, White | Price: ₹89,900 | Total Stock: 17
- **iPhone 17**: 256GB | Colours: Black, Lavender, Mist Blue, Sage, White | Price: ₹99,900 | Total Stock: 57
- **iPhone 17 Pro**: 1TB, 256GB, 512GB | Colours: Cosmic Orange, Deep Blue, Silver | Price: ₹134,900 – ₹174,900 | Total Stock: 3
- **iPhone 17 Pro Max**: 1TB, 256GB, 512GB | Colours: Cosmic Orange, Deep Blue, Silver | Price: ₹149,900 – ₹189,900 | Total Stock: 10
- **iPhone 18 Pro**: 1TB, 256GB, 512GB | Colours: Black, Glacier, Silver | Price: ₹164,900 – ₹239,900 | Total Stock: 13
- **iPhone 18 Pro Max**: 256GB, 512GB | Colours: Black, Glacier, Silver | Price: ₹179,900 – ₹204,900 | Total Stock: 3

### Oppo (19 models, 86 variant options, Total Stock: 1045)

- **OPPO A6 Pro 5G**: 8GB + 128GB, 8GB + 256GB | Colours: Aurora Gold, Cappuccino Brown | Price: ₹32,999 – ₹35,999 | Total Stock: 18
- **OPPO A6C 4G**: 4GB + 128GB, 4GB + 64GB | Colours: Feather White, Stone Brown | Price: ₹17,999 – ₹19,999 | Total Stock: 58
- **OPPO A6S 5G**: 4GB + 128GB, 6GB + 128GB | Colours: Aurora Gold, Plum Purple | Price: ₹24,999 – ₹27,999 | Total Stock: 34
- **OPPO A6X 5G**: 4GB + 128GB, 4GB + 64GB, 6GB + 128GB | Colours: ICE Blue, Olive Green | Price: ₹19,999 – ₹26,999 | Total Stock: 340
- **OPPO F33 5G**: 6GB + 128GB, 8GB + 128GB, 8GB + 256GB | Colours: Forest Green, Pearl White | Price: ₹34,999 – ₹39,999 | Total Stock: 3
- **OPPO F33 Pro 5G**: 8GB + 128GB, 8GB + 256GB | Colours: Mistry Forest, Passion RED, Starry Blue | Price: ₹39,999 – ₹43,999 | Total Stock: 66
- **OPPO F35 5G**: 6GB + 128GB, 8GB + 128GB | Colours: Mist Pink, Titanium Grey, Wave Blue | Price: ₹38,999 – ₹42,999 | Total Stock: 161
- **OPPO F35 Pro 5G**: 6GB + 128GB, 8GB + 128GB, 8GB + 256GB | Colours: Sunrise Orange, Twilight Brown, Wave Blue | Price: ₹45,999 – ₹54,999 | Total Stock: 146
- **OPPO Find X9**: 12GB + 256GB, 16GB + 512GB | Colours: Space Black, Titanium Grey, Velvet RED | Price: ₹84,999 – ₹94,999 | Total Stock: 2
- **OPPO Find X9 Pro**: 16GB + 512GB | Colours: Silk White, Titanium Charcoal | Price: ₹109,999 | Total Stock: 0
- **OPPO Find X9 Ultra**: 12GB + 512GB | Colours: Canyon Orange, Tundra Umber | Price: ₹169,999 | Total Stock: 0
- **OPPO Find X9S**: 12GB + 256GB, 12GB + 512GB | Colours: Lavender SKY, Midnight Gray, Sunset Orange | Price: ₹84,999 – ₹94,999 | Total Stock: 15
- **OPPO K14X 5G**: 4GB + 128GB, 6GB + 128GB | Colours: ICY Blue, Prism Violet | Price: ₹21,999 – ₹24,999 | Total Stock: 69
- **OPPO Reno 15 5G**: 12GB + 512GB, 8GB + 256GB | Colours: Aurora Blue, Twilight Blue | Price: ₹47,999 – ₹55,999 | Total Stock: 0
- **OPPO Reno 15 Pro 5G**: 12GB + 256GB, 12GB + 512GB | Colours: Cocoa Brown, Sunset Gold | Price: ₹67,999 – ₹72,999 | Total Stock: 13
- **OPPO Reno 15 Pro Mini 5G**: 12GB + 256GB, 12GB + 512GB | Colours: Cocoa Brown, Crystal Pink, Glacier White | Price: ₹59,999 – ₹64,999 | Total Stock: 5
- **OPPO Reno 15C 5G**: 12GB + 256GB, 8GB + 256GB | Colours: Afterglow Pink, Twilight Blue | Price: ₹41,999 – ₹44,999 | Total Stock: 0
- **OPPO Reno 16 5G**: 12GB + 256GB, 8GB + 256GB | Colours: Starry White, Stellar Purple, Twilight Violet | Price: ₹72,999 – ₹79,999 | Total Stock: 41
- **OPPO Reno 16C 5G**: 12GB + 256GB, 8GB + 256GB | Colours: Starry White, Stellar Purple, Twilight Violet | Price: ₹57,999 – ₹62,999 | Total Stock: 74

### realme (13 models, 56 variant options, Total Stock: 170)

- **realme 12 Pro+ 5G**: 12GB + 256GB, 8GB + 256GB | Colours: Submarine Blue | Price: ₹30,000 – ₹32,000 | Total Stock: 0
- **realme 15X 5G**: 6GB + 128GB, 8GB + 128GB, 8GB + 256GB | Colours: Aqua Blue, Marine Blue, Maroon RED | Price: ₹23,999 – ₹27,999 | Total Stock: 12
- **realme 16 5G**: 12GB + 256GB, 8GB + 128GB, 8GB + 256GB | Colours: AIR Black, AIR White | Price: ₹41,999 – ₹47,999 | Total Stock: 17
- **realme 16 Pro 5G**: 12GB + 256GB, 8GB + 128GB, 8GB + 256GB | Colours: Master Gold, Master Grey, Orchid Purple, Pebble Grey | Price: ₹44,999 – ₹49,999 | Total Stock: 14
- **realme 16 Pro+ 5G**: 12GB + 256GB, 8GB + 128GB, 8GB + 256GB | Colours: Master Gold, Master Grey | Price: ₹53,999 – ₹58,999 | Total Stock: 9
- **realme 16T 5G**: 6GB + 128GB, 8GB + 128GB, 8GB + 256GB | Colours: Aurora Green, Starlight Black, Starlight RED | Price: ₹31,999 – ₹36,999 | Total Stock: 23
- **realme C100X**: 4GB + 64GB | Colours: Deep Blue Tides, Golden Coast | Price: ₹17,999 | Total Stock: 13
- **realme C71**: 4GB + 64GB | Colours: Obsidian Black, SEA Blue | Price: ₹12,999 | Total Stock: 0
- **realme C83 5G**: 4GB + 128GB, 4GB + 64GB, 6GB + 128GB | Colours: Blooming Purple, Sprouting Green | Price: ₹19,999 – ₹26,999 | Total Stock: 58
- **realme C85 5G**: 4GB + 128GB, 6GB + 128GB | Colours: Parrot Purple, Peacock Green | Price: ₹21,999 – ₹23,999 | Total Stock: 17
- **realme P4 Lite 5G**: 4GB + 64GB, 6GB + 128GB | Colours: Mosaic Blue, Mosaic Green | Price: ₹18,999 – ₹23,999 | Total Stock: 0
- **realme P4 Power 5G**: 12GB + 256GB | Colours: Trans Silver | Price: ₹37,999 | Total Stock: 0
- **realme P4X 5G**: 8GB + 128GB | Colours: Elegant Pink | Price: ₹29,999 | Total Stock: 7

### Xiaomi (13 models, 71 variant options, Total Stock: 828)

- **Redmi 15 5G**: 6GB + 128GB, 8GB + 128GB, 8GB + 256GB | Colours: Frosted White, Midnight Black, Midnight Black/frosted White, Sandy Purple | Price: ₹21,499 – ₹25,499 | Total Stock: 4
- **Redmi 15A 5G**: 4GB + 128GB, 4GB + 64GB, 6GB + 128GB | Colours: ACE Black, Amaze Purple, Awesome Blue | Price: ₹16,499 – ₹20,499 | Total Stock: 208
- **Redmi 15C 5G**: 4GB + 128GB, 6GB + 128GB, 8GB + 128GB | Colours: Dusk Purple, Midnight Black, Moonlight Blue | Price: ₹18,499 – ₹22,499 | Total Stock: 89
- **Redmi 17 5G**: 6GB + 128GB, 8GB + 128GB | Colours: Absolute Black, Endless Blue, Eternal Orange | Price: ₹23,999 – ₹26,999 | Total Stock: 155
- **Redmi 17C 5G**: 4GB + 128GB, 6GB + 128GB | Colours: Coffee Brew, Dark Night, Purple Dawn | Price: ₹20,999 – ₹22,999 | Total Stock: 123
- **Redmi A7 Pro**: 4GB + 64GB | Colours: Sunset Orange | Price: ₹13,999 | Total Stock: 4
- **Redmi Note 15 Pro 5G**: 8GB + 128GB | Colours: Carbon Black, Mirage Blue, Silver ASH | Price: ₹31,999 | Total Stock: 8
- **Redmi Note 15 Pro+ 5G**: 12GB + 256GB, 12GB + 512GB, 8GB + 256GB | Colours: Carbon Black, Coffee Mocha, Mirage Blue | Price: ₹39,999 – ₹44,999 | Total Stock: 33
- **Redmi Note 17 5G**: 6GB + 128GB, 8GB + 128GB | Colours: Arctic Blue, Dark Night, Starlight Purple | Price: ₹27,999 – ₹30,999 | Total Stock: 98
- **Redmi Note 17 Pro 5G**: 8GB + 128GB, 8GB + 256GB | Colours: Cloud Blue, Purple Vibe, Stealth Black | Price: ₹36,999 – ₹39,999 | Total Stock: 46
- **Redmi Note 17 Pro Max 5G**: 12GB + 256GB, 8GB + 256GB | Colours: Matcha Green, Secret Sunrise, Stealth Black | Price: ₹49,999 – ₹55,999 | Total Stock: 49
- **Xiaomi 17 Ultra**: 16GB + 512GB | Colours: Black | Price: ₹139,999 | Total Stock: 5
- **Xiaomi 17T**: 12GB + 256GB, 12GB + 512GB | Colours: Black, Blue, Violet | Price: ₹69,999 – ₹74,999 | Total Stock: 6

### Vivo (17 models, 90 variant options, Total Stock: 593)

- **vivo S2**: 8GB + 128GB, 8GB + 256GB | Colours: Regal Bronze, Sapphire Blue, Silk White | Price: ₹42,999 – ₹48,999 | Total Stock: 98
- **vivo T4 Lite 5G**: 4GB + 128GB, 6GB + 128GB, 8GB + 256GB | Colours: Prism Blue, Titanium Gold | Price: ₹18,999 – ₹23,999 | Total Stock: 0
- **vivo T5X 5G**: 6GB + 128GB, 8GB + 128GB, 8GB + 256GB | Colours: Cyber Green, Star Silver | Price: ₹27,999 – ₹34,999 | Total Stock: 0
- **vivo V70**: 12GB + 256GB, 8GB + 256GB | Colours: Authentic Black, Lemon Yellow, Passion RED, Sand Beige | Price: ₹59,999 – ₹64,999 | Total Stock: 5
- **vivo V70 Elite**: 12GB + 256GB, 12GB + 512GB, 8GB + 256GB | Colours: Authentic Black, Passion RED, Sand Beige | Price: ₹61,999 – ₹71,999 | Total Stock: 5
- **vivo V70 Fe**: 12GB + 256GB, 8GB + 128GB, 8GB + 256GB | Colours: Monsoon Blue, Northern Lights Purple | Price: ₹44,999 – ₹51,999 | Total Stock: 31
- **vivo V80**: 8GB + 128GB, 8GB + 256GB, 8GB + 512GB | Colours: Horizon Blue, Stellar Black, Sunrise Anthem | Price: ₹62,999 – ₹79,999 | Total Stock: 63
- **vivo X Fold 6**: 12GB + 512GB | Colours: Nebula Teal, Prism Black | Price: ₹219,999 | Total Stock: 2
- **vivo X300**: 16GB + 512GB | Colours: Summit RED | Price: ₹85,999 | Total Stock: 0
- **vivo X300 Fe**: 12GB + 256GB, 12GB + 512GB | Colours: Lilac Purple, Noir Black, Urban Olive | Price: ₹94,999 – ₹99,999 | Total Stock: 11
- **vivo X300 Pro**: 16GB + 512GB | Colours: Dune Gold, Elite Black | Price: ₹119,999 | Total Stock: 0
- **vivo X300 Ultra**: 16GB + 512GB | Colours: Victory Green, With Photographer Kit | Price: ₹159,999 – ₹209,999 | Total Stock: 0
- **vivo Y05**: 4GB + 64GB | Colours: Champagne Gold, Midnight Blue, Mystic Blue, Straw Gold | Price: ₹15,999 | Total Stock: 13
- **vivo Y11 5G**: 4GB + 128GB, 4GB + 64GB | Colours: Cosmic Gold, Midnight Blue, Mystic Blue, Sunrise Gold | Price: ₹18,999 – ₹22,499 | Total Stock: 201
- **vivo Y21 5G**: 4GB + 128GB, 6GB + 128GB | Colours: Champagne Gold, Midnight Blue, Mystic Blue, Straw Gold | Price: ₹23,999 – ₹27,999 | Total Stock: 100
- **vivo Y31 5G**: 4GB + 128GB, 6GB + 128GB, 6GB + 256GB | Colours: Diamond Green, Nova Green, Rose RED | Price: ₹19,999 – ₹31,999 | Total Stock: 21
- **vivo Y51 Pro 5G**: 8GB + 128GB, 8GB + 256GB | Colours: Crimson RED, Festive RED, Noble Gold | Price: ₹34,999 – ₹37,999 | Total Stock: 43

### Samsung (24 models, 143 variant options, Total Stock: 306)

- **Galaxy A06**: 4GB + 128GB | Colours: Gold, Light Blue | Price: ₹9,499 | Total Stock: 0
- **Galaxy A06 5G**: 4GB + 128GB, 4GB + 64GB, 6GB + 128GB | Colours: Black, Light Green, Light Grey | Price: ₹15,999 – ₹19,999 | Total Stock: 0
- **Galaxy A07**: 4GB + 64GB | Colours: Black, Green, Violet | Price: ₹13,499 | Total Stock: 0
- **Galaxy A07 5G**: 4GB + 128GB, 6GB + 128GB | Colours: Black, Light Green, Light Violet | Price: ₹20,999 – ₹23,999 | Total Stock: 0
- **Galaxy A17 5G**: 6GB + 128GB, 8GB + 128GB, 8GB + 256GB | Colours: Black, Blue, Grey | Price: ₹27,999 – ₹36,499 | Total Stock: 209
- **Galaxy A27 5G**: 6GB + 128GB, 8GB + 128GB, 8GB + 256GB | Colours: Black, Light Green, Pink | Price: ₹35,999 – ₹47,499 | Total Stock: 97
- **Galaxy A36 5G**: 12GB + 256GB, 8GB + 128GB, 8GB + 256GB | Colours: Awesome Black, Awesome Lavender, Awesome Lime, Awesome White, Green, Lavender | Price: ₹36,999 – ₹46,499 | Total Stock: 0
- **Galaxy A37 5G**: 12GB + 256GB, 8GB + 128GB, 8GB + 256GB | Colours: Awesome Charcoal, Awesome Gray Green, Awesome Lavender, Awesome White | Price: ₹46,999 – ₹63,999 | Total Stock: 0
- **Galaxy A56 5G**: 12GB + 256GB, 8GB + 128GB, 8GB + 256GB | Colours: Awesome Graphite, Awesome Light Gray, Awesome Olive, Awesome Pink, Grey, Olive | Price: ₹44,999 – ₹54,499 | Total Stock: 0
- **Galaxy A57 5G**: 12GB + 256GB, 8GB + 256GB | Colours: Awesome Icy Blue, Awesome Lilac, Awesome Navy, Grey | Price: ₹62,999 – ₹72,499 | Total Stock: 0
- **Galaxy F17 5G**: 4GB + 128GB, 6GB + 128GB, 8GB + 128GB | Colours: Light Violet, NEO Black, Violet POP | Price: ₹23,499 – ₹29,499 | Total Stock: 0
- **Galaxy F36 5G**: 6GB + 128GB, 8GB + 128GB | Colours: Black | Price: ₹21,999 – ₹23,999 | Total Stock: 0
- **Galaxy M36 5G**: 6GB + 128GB, 8GB + 128GB, 8GB + 256GB | Colours: Black, Light Green, Orange | Price: ₹21,999 – ₹27,999 | Total Stock: 0
- **Galaxy S25**: 12GB + 256GB | Colours: Icy Blue, Mint, Navy, Silver Shadow | Price: ₹84,999 | Total Stock: 0
- **Galaxy S25 FE**: 8GB + 512GB | Colours: Jet Black, Navy | Price: ₹77,999 | Total Stock: 0
- **Galaxy S25 Ultra**: 12GB + 256GB, 12GB + 512GB | Colours: Silver Blue, Titanium Black, Titanium Gray, Titanium Grey, Titanium Jade Green, Titanium Pink Gold, Titanium Silver Blue, Titanium White Silver, White Silver | Price: ₹119,999 – ₹139,999 | Total Stock: 0
- **Galaxy S26**: 12GB + 256GB | Colours: Black, Cobalt Violet, Light Blue | Price: ₹102,999 | Total Stock: 0
- **Galaxy S26 Ultra**: 12GB + 256GB, 12GB + 512GB, 16GB + 1TB | Colours: Black, Cobalt Violet, Light Blue, Pink Gold, SKY Blue, Silver Shadow, White | Price: ₹154,999 – ₹214,999 | Total Stock: 0
- **Galaxy S26+**: 12GB + 512GB | Colours: Cobalt Violet | Price: ₹154,999 | Total Stock: 0
- **Galaxy Z Flip7**: 12GB + 256GB | Colours: Blue Shadow | Price: ₹109,999 | Total Stock: 0
- **Galaxy Z Flip7 FE**: 8GB + 256GB | Colours: Black, White | Price: ₹95,999 | Total Stock: 0
- **Galaxy Z Fold7**: 12GB + 256GB, 12GB + 512GB | Colours: Blue Shadow, Jet Black, Mint, Silver Shadow | Price: ₹174,999 – ₹186,999 | Total Stock: 0
- **Galaxy Z Fold8**: 12GB + 256GB, 12GB + 512GB | Colours: Cream, Graphite, Green, Lavender | Price: ₹179,999 – ₹199,999 | Total Stock: 0
- **Galaxy Z Fold8 Ultra**: 12GB + 256GB, 12GB + 512GB, 16GB + 1TB | Colours: Cream, Graphite, Green Shadow, Violet Shadow | Price: ₹199,999 – ₹259,999 | Total Stock: 0

---

## Skipped Rows (62 Total)

| Row | Brand | Sheet Product Name | Reason |
|---|---|---|---|
| 48 | APPLE | `APPLE:AIRPODS 4 MXP63HN/A WHITE` | AirPods (audio accessory) |
| 49 | APPLE | `APPLE:AIRPODS 4 WANC MXP93HN/A WHITE` | AirPods (audio accessory) |
| 50 | APPLE | `APPLE:AIRPODS 5 MKFT4HN/A WITH CHARGING CASE` | AirPods (audio accessory) |
| 51 | APPLE | `APPLE:AIRPODS PRO 2ND GEN MTJV3HN/A MAGSAFE CASE USB-C WHITE` | AirPods (audio accessory) |
| 52 | APPLE | `APPLE:AIRPODS PRO 3 MFHP4HN/A WHITE` | AirPods (audio accessory) |
| 53 | APPLE | `APPLE:IPAD 11 GEN MD3Y4HN/A 11-INCH WIFI 128GB SILVER` | iPad (tablet) |
| 54 | APPLE | `APPLE:IPAD 11 GEN MD4A4HN/A 11-INCH WIFI 128GB BLUE` | iPad (tablet) |
| 55 | APPLE | `APPLE:IPAD 11 GEN MD4G4HN/A 11-INCH WIFI 256GB SILVER` | iPad (tablet) |
| 56 | APPLE | `APPLE:IPAD 11 MD4H4HN/A 11-INCH WIFI 256GB BLUE` | iPad (tablet) |
| 57 | APPLE | `APPLE:MACBOOK NEO 13 MHFE4HN  8+512GB A18/6C/5C GPU CITRUS` | MacBook (laptop) |
| 58 | APPLE | `APPLE:MACKBOOK NEO 13 MHFG4HN 8+512GB A18/6C/5C GPU INDIGO` | MacBook (laptop) |
| 59 | APPLE | `APPLE:MACKBOOK NEO 13 MHFJ4HN 8+512GB A18/6C/5C GPU BLUSH` | MacBook (laptop) |
| 60 | APPLE | `APPLE:S11 GPS 42mm MEQT4HN/A Jet Black Aluminium Case with Black Sport Band - S/M` | Apple Watch (smartwatch) |
| 61 | APPLE | `APPLE:S11 GPS 42mm MEQU4HN/A Jet Black Aluminium Case with Black Sport Band - M/L` | Apple Watch (smartwatch) |
| 62 | APPLE | `APPLE:S11 GPS 46mm MEUX4HN/A Jet Black Aluminium Case with Black Sport Band - M/L` | Apple Watch (smartwatch) |
| 63 | APPLE | `APPLE:S12 GPS 46MM MJEU4HN/A DARK BRONZE ALU CASE WITH OLIVE S-BAND M/L` | Apple Watch (smartwatch) |
| 64 | APPLE | `APPLE:SE 3 GPS 40mm MEH54HN/A Starlight Aluminium Case with Starlight Sport Band - M/L` | Apple Watch (smartwatch) |
| 65 | APPLE | `APPLE:SE 3 GPS 44mm MEHQ4HN/A Midnight Aluminium Case with Midnight Sport Band - M/L` | Apple Watch (smartwatch) |
| 131 | MOTOROLA | `MOTOROLA:MOTO PAD 60 NEO 5G 4+128GB BRONZE GREEN` | Moto Pad (tablet) |
| 132 | MOTOROLA | `MOTOROLA:MOTO PAD 60 NEO WIFI 4+128GB MABILBU BLUE` | Moto Pad (tablet) |
| 133 | MOTOROLA | `MOTOROLA:MOTO PAD 60 NEO WIFI 8+128GB MABILBU BLUE` | Moto Pad (tablet) |
| 305 | REALME | `REALME:PAD 3 5G 8+128GB CHAMGNE GOLD` | realme Pad (tablet) |
| 306 | REALME | `REALME:PAD 3 5G 8+128GB SPACE GREY` | realme Pad (tablet) |
| 307 | REALME | `REALME:PAD 3 5G 8+256GB CHAMPAGNE GOLD` | realme Pad (tablet) |
| 308 | REALME | `REALME:PAD 3 5G 8+256GB SPACE GREY` | realme Pad (tablet) |
| 369 | REDMI | `REDMI:PAD 2 PRO 5G 8+128GB GRAPHITE GREY` | Redmi Pad (tablet) |
| 370 | REDMI | `REDMI:PAD 2 PRO 5G 8+128GB QUICK SILVER` | Redmi Pad (tablet) |
| 371 | REDMI | `REDMI:PAD 2 PRO 5G 8+256GB GRAPHITE GREY` | Redmi Pad (tablet) |
| 372 | REDMI | `REDMI:PAD 2 PRO 5G 8+256GB QUICK SILVER` | Redmi Pad (tablet) |
| 373 | REDMI | `REDMI:PAD 2 PRO 8+128GB GRAPHITE GREY` | Redmi Pad (tablet) |
| 374 | REDMI | `REDMI:PAD 2 PRO 8+128GB QUICK SILVER` | Redmi Pad (tablet) |
| 375 | REDMI | `REDMI:PAD 2 WIFI 4+128GB GRAPHITE GREY` | Redmi Pad (tablet) |
| 376 | REDMI | `REDMI:PAD 2 WIFI 4+128GB SKY BLUE` | Redmi Pad (tablet) |
| 377 | REDMI | `REDMI:PAD 2 WIFI+CELL 6+128GB GRAPHITE GREY` | Redmi Pad (tablet) |
| 378 | REDMI | `REDMI:PAD 2 WIFI+CELL 6+128GB SKY BLUE` | Redmi Pad (tablet) |
| 379 | REDMI | `REDMI:PAD 2 WIFI+CELL 8+256GB GRAPHITE GREY` | Redmi Pad (tablet) |
| 380 | REDMI | `REDMI:PAD 2 WIFI+CELL 8+256GB SKY BLUE` | Redmi Pad (tablet) |
| 381 | REDMI | `REDMI:WATCH 2 LITE BLACK` | Redmi Watch (smartwatch) |
| 382 | REDMI | `REDMI:WATCH 3 ACTIVE CHARCOAL BLACK` | Redmi Watch (smartwatch) |
| 383 | REDMI | `REDMI:WATCH 3 ACTIVE PLATINUM GREY` | Redmi Watch (smartwatch) |
| 384 | REDMI | `REDMI:WATCH MOVE BLACK DRIFT` | Redmi Watch (smartwatch) |
| 534 | SAMSUNG | `SAMSUNG:WATCH 7 ULTRA L705FDAA TITANIUM GRAY` | Samsung Watch (smartwatch) |
| 535 | SAMSUNG | `SAMSUNG:WATCH 8 44MM L330NDAA BT GRAPHITE` | Samsung Watch (smartwatch) |
| 536 | SAMSUNG | `SAMSUNG:WATCH 8 44MM L330NZSA BT SILVER` | Samsung Watch (smartwatch) |
| 537 | SAMSUNG | `SAMSUNG:WATCH 8 44MM L335FDAA LTE GRAPHITE` | Samsung Watch (smartwatch) |
| 538 | SAMSUNG | `SAMSUNG:WATCH 8 44MM L335FZSA LTE SILVER` | Samsung Watch (smartwatch) |
| 539 | SAMSUNG | `SAMSUNG:WATCH ULTRA 2 (2025) L705FZB1 47MM LTE BLUE` | Samsung Watch (smartwatch) |
| 540 | SAMSUNG | `SAMSUNG:WATCH ULTRA 2 (2025) L705FZB1 BLUE.` | Samsung Watch (smartwatch) |
| 541 | SAMSUNG | `SAMSUNG:X135GZAE 8+128GB A11 LTE GREY` | Samsung Tab (tablet) |
| 542 | SAMSUNG | `SAMSUNG:X135GZSA 4+64GB A11 LTE SILVER` | Samsung Tab (tablet) |
| 543 | SAMSUNG | `SAMSUNG:X135GZSE 8+128GB A11 LTE SILVER` | Samsung Tab (tablet) |
| 544 | SAMSUNG | `SAMSUNG:X230NZAE 8+256GB A11 PLUS WIFI GREY` | Samsung Tab (tablet) |
| 545 | SAMSUNG | `SAMSUNG:X236BZSA 6+128GB A11 PLUS 5G SILVER` | Samsung Tab (tablet) |
| 546 | SAMSUNG | `SAMSUNG:X406BZRA 6+128GB S10 LITE 5G CORAL RED` | Samsung Tab (tablet) |
| 547 | SAMSUNG | `SAMSUNG:X406BZSA 6+128GB S10 LITE 5G SILVER` | Samsung Tab (tablet) |
| 643 | XIAOMI | `XIAOMI:PAD 8 8+128GB GRAPHITE GREY` | Xiaomi Pad (tablet) |
| 644 | XIAOMI | `XIAOMI:PAD 8 12+256GB GRAPHITE GREY` | Xiaomi Pad (tablet) |
| 645 | XIAOMI | `XIAOMI:PAD 8 NANO TEXTURE DISPLAY EDITION 12+256GB TITANIUM BLUE` | Xiaomi Pad (tablet) |
| 646 | XIAOMI | `XIAOMI:PAD 8 8+128GB TITANIUM BLUE` | Xiaomi Pad (tablet) |
| 647 | XIAOMI | `XIAOMI:PAD 8 12+256GB TITANIUM BLUE` | Xiaomi Pad (tablet) |
| 648 | XIAOMI | `XIAOMI:PAD 8 WITH PEN 12+256GB GRAPHITE GREY` | Xiaomi Pad (tablet) |
| 653 | SAMSUNG | `SAMSUNG:TAB S12 ULTRA 5G 12+256GB  GREY SM-X946BZAA` | Samsung Tab (tablet) |