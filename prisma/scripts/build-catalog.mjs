import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, '../data/mop-list.raw.csv');
const catalogPath = path.join(__dirname, '../data/catalog.json');
const reportPath = path.join(__dirname, '../data/CATALOG_REPORT.md');

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    let inQuotes = false;
    let field = '';
    const row = [];
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          field += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(field);
        field = '';
      } else {
        field += char;
      }
    }
    row.push(field);
    result.push(row);
  }
  return result;
}

const rawData = parseCSV(fs.readFileSync(csvPath, 'utf8'));

const MODEL_MAP = {
  "ALCATEL": {
    "V3 CLASSIC": { name: "V3 Classic", category: "phones" },
    "V3 PRO": { name: "V3 Pro", category: "phones" },
    "V3 ULTRA": { name: "V3 Ultra", category: "phones" },
    "V3 ILTRA": { name: "V3 Ultra", category: "phones" }
  },
  "AI PLUS": {
    "NOVA 2 NEO": { name: "Nova 2 Neo", category: "phones" }
  },
  "APPLE": {
    "15": { name: "iPhone 15", category: "phones" },
    "16": { name: "iPhone 16", category: "phones" },
    "16E": { name: "iPhone 16e", category: "phones" },
    "17": { name: "iPhone 17", category: "phones" },
    "17 PRO": { name: "iPhone 17 Pro", category: "phones" },
    "17 PRO MAX": { name: "iPhone 17 Pro Max", category: "phones" },
    "17E": { name: "iPhone 17e", category: "phones" },
    "AIR": { name: "iPhone Air", category: "phones" },
    "IPAD 11 GEN 11-INCH WIFI": { name: "iPad 11-inch Wi-Fi", category: "tablets" },
    "IPAD 11 11-INCH WIFI": { name: "iPad 11-inch Wi-Fi", category: "tablets" },
    "S11 GPS": { name: "Apple Watch Series 11", category: "smartwatches" },
    "SE 3 GPS": { name: "Apple Watch SE 3", category: "smartwatches" },
    "MACBOOK NEO 13": { name: "MacBook Neo 13", category: "laptops" },
    "AIRPODS 4": { name: "AirPods 4", category: "accessories" },
    "AIRPODS 4 WANC": { name: "AirPods 4 with ANC", category: "accessories" },
    "AIRPODS PRO 3": { name: "AirPods Pro 3", category: "accessories" },
    "AIRPODS PRO 2ND GEN MAGSAFE CASE USB-C": { name: "AirPods Pro 2 USB-C", category: "accessories" },
    "AIRPODS PRO 2ND GEN": { name: "AirPods Pro 2 USB-C", category: "accessories" }
  },
  "GOOGLE": {
    "PIXEL 10": { name: "Pixel 10", category: "phones" },
    "PIXEL 10A": { name: "Pixel 10a", category: "phones" },
    "PIXEL 11": { name: "Pixel 11", category: "phones" },
    "PIXEL 11 PRO": { name: "Pixel 11 Pro", category: "phones" },
    "PIXEL 11 PRO XL": { name: "Pixel 11 Pro XL", category: "phones" },
    "PIXEL 11 PRO FOLD": { name: "Pixel 11 Pro Fold", category: "phones" }
  },
  "INFINIX": {
    "NOTE 60 PRO": { name: "Note 60 Pro", category: "phones" },
    "NOTE EDGE": { name: "Note Edge", category: "phones" }
  },
  "MOTOROLA": {
    "MOTO EDGE 70 FUSION": { name: "Edge 70 Fusion", category: "phones" },
    "EDGE 70 FUSION": { name: "Edge 70 Fusion", category: "phones" },
    "MOTO EDGE 70 PRO": { name: "Edge 70 Pro", category: "phones" },
    "EDGE 70 PRO": { name: "Edge 70 Pro", category: "phones" },
    "MOTO EDGE 70 PROPLUS": { name: "Edge 70 Pro+", category: "phones" },
    "EDGE 70 PROPLUS": { name: "Edge 70 Pro+", category: "phones" },
    "MOTO EDGE 70 MAX": { name: "Edge 70 Max", category: "phones" },
    "EDGE 70 MAX": { name: "Edge 70 Max", category: "phones" },
    "MOTO SIGNATURE": { name: "Signature", category: "phones" },
    "SIGNATURE": { name: "Signature", category: "phones" },
    "MOTO G06": { name: "G06", category: "phones" },
    "G06": { name: "G06", category: "phones" },
    "MOTO G35": { name: "G35", category: "phones" },
    "G35": { name: "G35", category: "phones" },
    "MOTO G37": { name: "G37", category: "phones" },
    "G37": { name: "G37", category: "phones" },
    "MOTO G37 POWER": { name: "G37 Power", category: "phones" },
    "G37 POWER": { name: "G37 Power", category: "phones" },
    "MOTO EDGE 70 FUSION": { name: "Moto Edge 70 Fusion", category: "phones" },
    "MOTO EDGE 70 PROPLUS": { name: "Moto Edge 70 Pro+", category: "phones" },
    "MOTO EDGE 70 PRO": { name: "Moto Edge 70 Pro", category: "phones" },
    "MOTO G06": { name: "Moto G06", category: "phones" },
    "MOTO G35": { name: "Moto G35", category: "phones" },
    "MOTO G37 POWER": { name: "Moto G37 Power", category: "phones" },
    "MOTO G37": { name: "Moto G37", category: "phones" },
    "MOTO G47": { name: "Moto G47", category: "phones" },
    "MOTO G57": { name: "Moto G57", category: "phones" },
    "MOTO G77": { name: "Moto G77", category: "phones" },
    "MOTO G87": { name: "Moto G87", category: "phones" },
    "RAZR 60 ULTRA": { name: "Razr 60 Ultra", category: "phones" },
    "RAZR 60": { name: "Razr 60", category: "phones" },
    "MOTO G67 POWER": { name: "Moto G67 Power", category: "phones" },
    "G67 POWER": { name: "Moto G67 Power", category: "phones" },
    "MOTO PAD 60 NEO 5G": { name: "Moto Pad 60 Neo 5G", category: "tablets" },
    "MOTO PAD 60 NEO WIFI": { name: "Moto Pad 60 Neo Wi-Fi", category: "tablets" }
  },
  "NOTHING": {
    "PHONE 4A": { name: "Phone 4a", category: "phones" },
    "PHONE 3A PLUS": { name: "Phone 3a Plus", category: "phones" },
    "3A PLUS": { name: "Phone 3a Plus", category: "phones" },
    "PHONE 3A": { name: "Phone 3a", category: "phones" },
    "3A": { name: "Phone 3a", category: "phones" },
    "PHONE 4 PRO": { name: "Phone 4 Pro", category: "phones" },
    "4 PRO": { name: "Phone 4 Pro", category: "phones" },
    "PHONE 4A PRO": { name: "Phone 4a Pro", category: "phones" },
    "4A PRO": { name: "Phone 4a Pro", category: "phones" },
    "PHONE 4B": { name: "Phone 4b", category: "phones" },
    "4B": { name: "Phone 4b", category: "phones" }
  },
  "OPPO": {
    "A6 PRO 5G": { name: "A6 Pro 5G", category: "phones" },
    "A6C 4G": { name: "A6c 4G", category: "phones" },
    "A6C4G": { name: "A6c 4G", category: "phones" },
    "A6S 5G": { name: "A6s 5G", category: "phones" },
    "A6X 5G": { name: "A6x 5G", category: "phones" },
    "F33 5G": { name: "F33 5G", category: "phones" },
    "F33 PRO 5G": { name: "F33 Pro 5G", category: "phones" },
    "FIND X9": { name: "Find X9", category: "phones" },
    "FIND X9 PRO": { name: "Find X9 Pro", category: "phones" },
    "FIND X9 ULTRA": { name: "Find X9 Ultra", category: "phones" },
    "FIND X9S": { name: "Find X9s", category: "phones" },
    "K14X 5G": { name: "K14x 5G", category: "phones" },
    "RENO 15 5G": { name: "Reno 15 5G", category: "phones" },
    "RENO 15 PRO 5G": { name: "Reno 15 Pro 5G", category: "phones" },
    "RENO 15 PRO MINI 5G": { name: "Reno 15 Pro Mini 5G", category: "phones" },
    "RENO 15C 5G": { name: "Reno 15c 5G", category: "phones" },
    "RENO 16 5G": { name: "Reno 16 5G", category: "phones" },
    "RENO 16C 5G": { name: "Reno 16c 5G", category: "phones" }
  },
  "REALME": {
    "12 PRO+ 5G": { name: "12 Pro+ 5G", category: "phones" },
    "12 PRO PLUS 5G": { name: "12 Pro+ 5G", category: "phones" },
    "15X 5G": { name: "15x 5G", category: "phones" },
    "16 5G": { name: "16 5G", category: "phones" },
    "16 PRO 5G": { name: "16 Pro 5G", category: "phones" },
    "16 PRO+ 5G": { name: "16 Pro+ 5G", category: "phones" },
    "16 PRO PLUS 5G": { name: "16 Pro+ 5G", category: "phones" },
    "16T 5G": { name: "16T 5G", category: "phones" },
    "C71": { name: "C71", category: "phones" },
    "C83 5G": { name: "C83 5G", category: "phones" },
    "C85 5G": { name: "C85 5G", category: "phones" },
    "P4 LITE 5G": { name: "P4 Lite 5G", category: "phones" },
    "P4 POWER 5G": { name: "P4 Power 5G", category: "phones" },
    "P4X 5G": { name: "P4x 5G", category: "phones" },
    "PAD 3 5G": { name: "realme Pad 3 5G", category: "tablets" },
    "PAD 3": { name: "realme Pad 3 5G", category: "tablets" }
  },
  "REDMI": {
    "17 5G": { name: "Xiaomi 17 5G", category: "phones" },
    "17 ULTRA": { name: "Xiaomi 17 Ultra", category: "phones" },
    "17T": { name: "Xiaomi 17T", category: "phones" },
    "17": { name: "Xiaomi 17", category: "phones" },
    "PAD 7 NANO TEXTURE DISPLAY EDITION": { name: "Xiaomi Pad 7 Nano Texture Display Edition", category: "tablets" },
    "PAD 7": { name: "Xiaomi Pad 7", category: "tablets" },
    "15 5G": { name: "Redmi 15 5G", category: "phones" },
    "15A 5G": { name: "Redmi 15A 5G", category: "phones" },
    "15C 5G": { name: "Redmi 15C 5G", category: "phones" },
    "A7 PRO": { name: "Redmi A7 Pro", category: "phones" },
    "NOTE 15 5G": { name: "Redmi Note 15 5G", category: "phones" },
    "NOTE 15 PRO 5G": { name: "Redmi Note 15 Pro 5G", category: "phones" },
    "NOTE 15 PRO+ 5G": { name: "Redmi Note 15 Pro+ 5G", category: "phones" },
    "NOTE 15 PRO PLUS 5G": { name: "Redmi Note 15 Pro+ 5G", category: "phones" },
    "PAD 2 PRO 5G": { name: "Redmi Pad 2 Pro 5G", category: "tablets" },
    "PAD 2 PRO WIFI": { name: "Redmi Pad 2 Pro Wi-Fi", category: "tablets" },
    "PAD 2 WIFI + CELLULAR": { name: "Redmi Pad 2 Wi-Fi + Cellular", category: "tablets" },
    "PAD 2 WIFI+CELL": { name: "Redmi Pad 2 Wi-Fi + Cellular", category: "tablets" },
    "PAD 2 WIFI": { name: "Redmi Pad 2 Wi-Fi", category: "tablets" },
    "PAD PRO 5G": { name: "Redmi Pad Pro 5G", category: "tablets" },
    "PAD PRO": { name: "Redmi Pad Pro", category: "tablets" },
    "WATCH 2 LITE": { name: "Redmi Watch 2 Lite", category: "smartwatches" },
    "WATCH 3 ACTIVE": { name: "Redmi Watch 3 Active", category: "smartwatches" },
    "WATCH MOVE": { name: "Redmi Watch Move", category: "smartwatches" }
  },
  "XIAOMI": {
    "17 5G": { name: "Xiaomi 17 5G", category: "phones" },
    "17 ULTRA": { name: "Xiaomi 17 Ultra", category: "phones" },
    "17T": { name: "Xiaomi 17T", category: "phones" },
    "17": { name: "Xiaomi 17", category: "phones" },
    "PAD 7 NANO TEXTURE DISPLAY EDITION": { name: "Xiaomi Pad 7 Nano Texture Display Edition", category: "tablets" },
    "PAD 7": { name: "Xiaomi Pad 7", category: "tablets" }
  },
  "SAMSUNG": {
    "A06": { name: "Galaxy A06", category: "phones" },
    "A06 5G": { name: "Galaxy A06 5G", category: "phones" },
    "A07": { name: "Galaxy A07", category: "phones" },
    "A07 5G": { name: "Galaxy A07 5G", category: "phones" },
    "A17 5G": { name: "Galaxy A17 5G", category: "phones" },
    "A27 5G": { name: "Galaxy A27 5G", category: "phones" },
    "A275G": { name: "Galaxy A27 5G", category: "phones" },
    "A36 5G": { name: "Galaxy A36 5G", category: "phones" },
    "A37 5G": { name: "Galaxy A37 5G", category: "phones" },
    "56 5G": { name: "Galaxy A56 5G", category: "phones" },
    "A56 5G": { name: "Galaxy A56 5G", category: "phones" },
    "A57 5G": { name: "Galaxy A57 5G", category: "phones" },
    "A575G": { name: "Galaxy A57 5G", category: "phones" },
    "F17 5G": { name: "Galaxy F17 5G", category: "phones" },
    "E176B": { name: "Galaxy F17 5G", category: "phones" },
    "F36 5G": { name: "Galaxy F36 5G", category: "phones" },
    "M36 5G": { name: "Galaxy M36 5G", category: "phones" },
    "S25 FE": { name: "Galaxy S25 FE", category: "phones" },
    "S25": { name: "Galaxy S25", category: "phones" },
    "S25 ULTRA": { name: "Galaxy S25 Ultra", category: "phones" },
    "S26": { name: "Galaxy S26", category: "phones" },
    "S26+": { name: "Galaxy S26+", category: "phones" },
    "S26 PLUS": { name: "Galaxy S26+", category: "phones" },
    "S26 ULTRA": { name: "Galaxy S26 Ultra", category: "phones" },
    "Z FLIP7 FE": { name: "Galaxy Z Flip7 FE", category: "phones" },
    "FLIP 7 FE": { name: "Galaxy Z Flip7 FE", category: "phones" },
    "Z FLIP7": { name: "Galaxy Z Flip7", category: "phones" },
    "FLIP 7": { name: "Galaxy Z Flip7", category: "phones" },
    "Z FOLD7": { name: "Galaxy Z Fold7", category: "phones" },
    "FOLD 7": { name: "Galaxy Z Fold7", category: "phones" },
    "Z FOLD 8 ULTRA": { name: "Galaxy Z Fold8 Ultra", category: "phones" },
    "FOLD 8 ULTRA": { name: "Galaxy Z Fold8 Ultra", category: "phones" },
    "Z FOLD 8": { name: "Galaxy Z Fold8", category: "phones" },
    "FOLD 8": { name: "Galaxy Z Fold8", category: "phones" },
    "TAB A11 LTE": { name: "Galaxy Tab A11 LTE", category: "tablets" },
    "A11 LTE": { name: "Galaxy Tab A11 LTE", category: "tablets" },
    "X135 A11 LTE": { name: "Galaxy Tab A11 LTE", category: "tablets" },
    "TAB A11+ WIFI": { name: "Galaxy Tab A11+ Wi-Fi", category: "tablets" },
    "A11+ WIFI": { name: "Galaxy Tab A11+ Wi-Fi", category: "tablets" },
    "A11 PLUS WIFI": { name: "Galaxy Tab A11+ Wi-Fi", category: "tablets" },
    "TAB A11+ 5G": { name: "Galaxy Tab A11+ 5G", category: "tablets" },
    "A11+ 5G": { name: "Galaxy Tab A11+ 5G", category: "tablets" },
    "A11 PLUS 5G": { name: "Galaxy Tab A11+ 5G", category: "tablets" },
    "S10 LITE 5G": { name: "Galaxy Tab S10 Lite 5G", category: "tablets" },
    "WATCH ULTRA 2 (2025)": { name: "Galaxy Watch Ultra 2", category: "smartwatches" },
    "WATCH ULTRA 2": { name: "Galaxy Watch Ultra 2", category: "smartwatches" },
    "WATCH 7 ULTRA": { name: "Galaxy Watch Ultra", category: "smartwatches" },
    "WATCH8 BT": { name: "Galaxy Watch8 BT", category: "smartwatches" },
    "WATCH 8 BT": { name: "Galaxy Watch8 BT", category: "smartwatches" },
    "WATCH8 LTE": { name: "Galaxy Watch8 LTE", category: "smartwatches" },
    "WATCH 8 LTE": { name: "Galaxy Watch8 LTE", category: "smartwatches" },
    "WATCH 8": { name: "Galaxy Watch8 BT", category: "smartwatches" },
    "WATCH9 LTE": { name: "Galaxy Watch9 LTE", category: "smartwatches" },
    "WATCH 9 LTE": { name: "Galaxy Watch9 LTE", category: "smartwatches" },
    "WATCH 9": { name: "Galaxy Watch9 LTE", category: "smartwatches" }
  },
  "TECNO": {
    "POVA CURVE 2 5G": { name: "Pova Curve 2 5G", category: "phones" },
    "SPARK 50": { name: "Spark 50", category: "phones" },
    "SPARK GO 3": { name: "Spark Go 3", category: "phones" }
  },
  "VIVO": {
    "T4 LITE 5G": { name: "T4 Lite 5G", category: "phones" },
    "T5X 5G": { name: "T5x 5G", category: "phones" },
    "V70": { name: "V70", category: "phones" },
    "V70 ELITE": { name: "V70 Elite", category: "phones" },
    "V70 FE": { name: "V70 FE", category: "phones" },
    "X300": { name: "X300", category: "phones" },
    "X300 FE": { name: "X300 FE", category: "phones" },
    "X300 PRO": { name: "X300 Pro", category: "phones" },
    "X300 ULTRA": { name: "X300 Ultra", category: "phones" },
    "Y05": { name: "Y05", category: "phones" },
    "Y11 5G": { name: "Y11 5G", category: "phones" },
    "Y21 5G": { name: "Y21 5G", category: "phones" },
    "Y31 5G": { name: "Y31 5G", category: "phones" },
    "Y400 5G": { name: "Y400 5G", category: "phones" },
    "Y51 PRO 5G": { name: "Y51 Pro 5G", category: "phones" },
    "Y51 PRO": { name: "Y51 Pro 5G", category: "phones" }
  }
};

const reportFlags = [];
const modelsMap = new Map();
const excluded = [];
let sourceRowsCount = 0;
let variantsCount = 0;


const ALLOWED_ACRONYMS = ['LTE', 'GPS', 'ANC', 'USB', 'WIFI', 'BT', 'FE', 'S/M', 'M/L'];

function titleCaseColor(str) {
  if (!str) return '';
  let clean = str.replace(/[()]/g, '').trim();
  if (clean.endsWith('.')) clean = clean.slice(0, -1);
  return clean.split(/\s+/).map(w => {
    const upperW = w.toUpperCase();
    if (ALLOWED_ACRONYMS.includes(upperW)) return upperW;
    if (upperW === '5G') return '5G';
    return upperW.charAt(0) + upperW.slice(1).toLowerCase();
  }).join(' ');
}

// Typo fixes
const TYPO_FIXES = {
  'AWSOME': 'Awesome',
  'LAVENDAR': 'Lavender',
  'VOILET': 'Violet',
  'CHAMGNE': 'Champagne',
  'GRPHITE': 'Graphite',
  'TIATNIUM': 'Titanium',
  'CHAMPANG': 'Champagne',
  'DAIMOND': 'Diamond'
};

function applyTypoFixes(str) {
  let res = str;
  for (const [bad, good] of Object.entries(TYPO_FIXES)) {
    const regex = new RegExp('\\b' + bad + '\\b', 'ig');
    res = res.replace(regex, good);
  }
  return res;
}

function processRow(rowRaw) {
  const [sheet, srNo, rawName, priceStr, stockStr] = rowRaw;
  const raw = rawName.trim();
  const sourceRow = `${sheet.trim()}#${srNo}`;
  const price = parseInt(priceStr.trim(), 10);
  if (!price || isNaN(price) || price <= 0) return;
  const stock = stockStr ? parseInt(stockStr.trim(), 10) : null;
  
  if (raw === '') return;
  sourceRowsCount++;
  
  let sheetKey = sheet.trim().toUpperCase();
  if (sheetKey === 'ALACATEL') sheetKey = 'ALCATEL';
  if (sheetKey === 'AI+') sheetKey = 'AI PLUS';

  if (raw.startsWith('C100X') || raw.startsWith('AI PLUS NOVA 2 NEO')) {
    excluded.push({ sourceRow, raw, reason: 'Excluded brand' });
    reportFlags.push(`Excluded row: ${raw}`);
    return;
  }
  
  let brandPrefix = '';
  let rest = '';
  
  if (raw.includes(':')) {
    const parts = raw.split(':');
    brandPrefix = parts[0].trim();
    rest = parts.slice(1).join(':').replace(/\s+/g, ' ').trim();
  } else {
    excluded.push({ sourceRow, raw, reason: 'No brand prefix' });
    reportFlags.push(`Excluded row without brand prefix: ${raw}`);
    return;
  }
  
  let sku = null;
  let modelRaw = '';
  let colorRaw = '';
  let memoryStr = null;
  let ram = null;
  let storage = null;
  
  // 1. Extract Memory
  let foundMem = null;
  let memMatch = rest.match(/\b(\d+)\+(\d+)\s*(GB|TB)?\b/i);
  if (memMatch) {
    foundMem = memMatch[0];
    ram = memMatch[1] + 'GB';
    storage = memMatch[2] + (memMatch[3] ? memMatch[3].toUpperCase() : 'GB');
    if (storage === '128') storage = '128GB';
    if (storage === '256') storage = '256GB';
    if (storage === '512') storage = '512GB';
  } else {
    memMatch = rest.match(/\b(\d+)\s*(GB|TB)\b/i);
    if (memMatch) {
      foundMem = memMatch[0];
      storage = memMatch[1] + memMatch[2].toUpperCase();
    }
  }

  let modelText = '';
  let afterMemText = '';

  if (foundMem) {
    memoryStr = foundMem;
    const parts = rest.split(foundMem);
    modelText = parts[0].trim();
    afterMemText = parts.slice(1).join(foundMem).trim();
  } else {
    modelText = rest;
  }

  // 2. Extract SKU
  let skuMatch;
  if (sheetKey === 'APPLE') {
    skuMatch = rest.match(/\b[A-Z0-9]{5,6}HN(?:\/A)?\b/i);
    if (raw.includes('XIAOMI:17 5G')) {
      console.log('REAL SKU MATCH:', skuMatch);
    }
  } else if (sheetKey === 'SAMSUNG') {
    // S25 ULTRA S938BZBB 
    skuMatch = rest.match(/\b([A-Z0-9]{5,})\b/);
    if (skuMatch && (!/[A-Z]/.test(skuMatch[1]) || !/[0-9]/.test(skuMatch[1]) || ['ULTRA','FOLD','FLIP','WATCH','PLUS'].includes(skuMatch[1].toUpperCase()))) {
      skuMatch = null; 
      // Try finding another one
      const allMatches = [...rest.matchAll(/\b([A-Z0-9]{5,})\b/g)];
      for (const m of allMatches) {
        if (/[A-Z]/.test(m[1]) && /[0-9]/.test(m[1]) && !['ULTRA','FOLD','FLIP','WATCH','PLUS'].includes(m[1].toUpperCase())) {
          skuMatch = m;
          break;
        }
      }
    }
  } else {
    skuMatch = rest.match(/\b([A-Z0-9\/]{6,})\b/);
    if (skuMatch && (!/[A-Z]/.test(skuMatch[1]) || !/[0-9]/.test(skuMatch[1]))) {
      skuMatch = null;
    }
  }

  if (skuMatch) {
    sku = skuMatch[0];
    if (sku === 'MFYYM4HN/A') reportFlags.push(`Malformed Apple SKU flagged: MFYYM4HN/A in ${raw}`);
    if (sku === 'A366ELGJ') reportFlags.push(`Flagged SKU A366ELGJ appears on multiple variations in ${raw}`);
    
    // Remove SKU from texts
    modelText = modelText.replace(sku, '').replace(/\s+/g, ' ').trim();
    afterMemText = afterMemText.replace(sku, '').replace(/\s+/g, ' ').trim();
  }

  // 3. Match Model
  let matchedModelKey = null;
  let matchedLength = 0;
  
  const mapForBrand = MODEL_MAP[sheetKey] || {};
  
  // We want longest prefix match in modelText
  for (const key of Object.keys(mapForBrand)) {
    if (modelText.toUpperCase().startsWith(key) && key.length > matchedLength) {
      matchedModelKey = key;
      matchedLength = key.length;
    }
  }

  // If no prefix match in modelText, try finding it anywhere in rest
  if (!matchedModelKey) {
    let searchStr = rest.toUpperCase().replace(sku || '', '').replace(foundMem || '', '').replace(/\s+/g, ' ').trim();
    for (const key of Object.keys(mapForBrand)) {
      if (searchStr.includes(key) && key.length > matchedLength) {
        matchedModelKey = key;
        matchedLength = key.length;
      }
    }
  }

  if (matchedModelKey) {
    modelRaw = matchedModelKey;
    if (foundMem) {
      colorRaw = afterMemText;
      
      let colorWords = colorRaw.split(' ');
      const modelWords = (matchedModelKey || modelText).toUpperCase().split(' ');
      if (colorWords[0] === modelWords[0]) {
        colorWords.shift();
        if (colorWords[0] === '5G') colorWords.shift();
        colorRaw = colorWords.join(' ');
      }
    } else {
      // If no memory, color is whatever is left after removing model and sku
      colorRaw = rest.toUpperCase().replace(matchedModelKey, '').replace(sku || '', '').replace(/\s+/g, ' ').trim();
    }
  } else {
    modelRaw = modelText || rest;
    colorRaw = afterMemText;
  }

  let processor = null;
  if (colorRaw && colorRaw.includes('A18/6C/5C GPU')) {
    processor = 'A18, 6-core CPU, 5-core GPU';
    colorRaw = colorRaw.replace('A18/6C/5C GPU', '').trim();
  }

  // Look up model in MODEL_MAP
  let modelObjData = mapForBrand[matchedModelKey || modelRaw.toUpperCase().trim()];
  
  if (!modelObjData) {
    // try without brand word
    const withoutBrand = (matchedModelKey || modelRaw.toUpperCase().trim()).replace(/^(REDMI|XIAOMI|MOTO)\s+/, '');
    modelObjData = mapForBrand[withoutBrand];
  }

  let finalModelName = modelRaw;
  let finalBrand = sheetKey === 'APPLE' ? 'Apple' : sheetKey === 'SAMSUNG' ? 'Samsung' : sheetKey === 'GOOGLE' ? 'Google' : sheetKey === 'MOTOROLA' ? 'Motorola' : sheetKey === 'NOTHING' ? 'Nothing' : sheetKey === 'OPPO' ? 'OPPO' : sheetKey === 'REALME' ? 'realme' : sheetKey === 'VIVO' ? 'vivo' : sheetKey === 'POCO' ? 'POCO' : sheetKey === 'ALCATEL' ? 'Alcatel' : sheetKey === 'INFINIX' ? 'Infinix' : sheetKey === 'TECNO' ? 'Tecno' : sheetKey === 'AI PLUS' ? 'AI+' : sheetKey === 'XIAOMI' ? 'Xiaomi' : sheetKey === 'REDMI' ? 'Xiaomi' : sheetKey;
  let finalCategory = 'phones';
  
  if (modelObjData) {
    finalModelName = modelObjData.name;
    finalCategory = modelObjData.category;
  } else {
    reportFlags.push(`Unmapped model: ${modelRaw} (Raw: ${raw})`);
    // Hard failure will happen in assertions
  }

  if (finalBrand === 'Samsung' && finalModelName.includes('Watch8')) {
    if (raw.includes('LTE') || (sku && sku.startsWith('L335F'))) {
      finalModelName = 'Galaxy Watch8 LTE';
    } else {
      finalModelName = 'Galaxy Watch8 BT';
    }
  }

  if (finalBrand === 'Samsung' && finalModelName.includes('Watch Ultra')) {
    if (sku && sku.startsWith('L715F')) {
      finalModelName = 'Galaxy Watch Ultra 2';
    } else if (sku && sku.startsWith('L705F')) {
      finalModelName = 'Galaxy Watch Ultra';
      if (raw.includes('ULTRA 2')) {
        reportFlags.push(`Flagged: Watch Ultra SKU L705F but labelled ULTRA 2: ${raw}`);
      }
    }
  }
  
  // Specific checks
  if (raw.includes('TACTICAL EDITION')) {
    reportFlags.push(`Flagged Infinix TACTICAL EDITION with no color: ${raw}`);
  }
  if (raw.includes('WITH PHOTOGRAPHER KIT')) {
    reportFlags.push(`Flagged vivo X300 Ultra WITH PHOTOGRAPHER KIT bundle: ${raw}`);
  }

  // Apply typo fixes
  if (colorRaw) {
    colorRaw = applyTypoFixes(colorRaw);
  }

  // Parse color and watch specs
  let color = colorRaw ? titleCaseColor(colorRaw) : null;
  let size = undefined;
  let band = undefined;
  
  if (finalCategory === 'smartwatches') {
    if (colorRaw) {
      const sizeMatch = colorRaw.match(/(\d{2}mm)/i);
      if (sizeMatch) {
        size = sizeMatch[1].toLowerCase();
        colorRaw = colorRaw.replace(sizeMatch[0], '').trim();
      }
      const withMatch = colorRaw.match(/with\s+(.*)/i);
      if (withMatch) {
        band = withMatch[1].trim();
        colorRaw = colorRaw.replace(withMatch[0], '').trim();
      }
      color = colorRaw ? titleCaseColor(colorRaw) : null;
    }
  }

  // Verify unconfirmed typos
  const unconfirmedTypos = ['SILHOUTTE', 'SILHOUUETTE', 'TEA', 'MABILBU', 'MARTINE', 'MISTRY', 'AQUE', 'TRANSSILVER', 'MIST MIST'];
  for (const typo of unconfirmedTypos) {
    if (raw.toUpperCase().includes(typo)) {
      reportFlags.push(`Unconfirmed spelling flagged: ${typo} in ${raw}`);
    }
  }

  const modelKey = `${finalBrand.toLowerCase()}-${finalModelName.toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]+/g, '-')}`;
  let variantSlug = `${modelKey}${ram ? '-' + ram.toLowerCase().replace(/\+/g, 'plus') : ''}${storage ? '-' + storage.toLowerCase().replace(/\+/g, 'plus') : ''}${size ? '-' + size.toLowerCase() : ''}${color ? '-' + color.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''}${band ? '-' + band.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''}`;
  
  if (!modelsMap.has(modelKey)) {
    modelsMap.set(modelKey, {
      modelKey,
      brand: finalBrand,
      model: finalModelName,
      category: finalCategory,
      officialUrl: null,
      specs: {},
      specSource: null,
      newArrival: false,
      variants: []
    });
  }
  
  const modelObj = modelsMap.get(modelKey);
  
  const variant = {
    slug: variantSlug,
    ram,
    storage,
    sheetColor: colorRaw || null,
    color: color || null,
    sku,
    swatch: null,
    price,
    stock
  };
  if (size) variant.size = size;
  if (band) variant.band = band;
  variant.sourceRows = [sourceRow];
  
  let existing = modelObj.variants.find(v => v.slug === variantSlug);
  
  // Watch Ultra 2 Merging by SKU base
  if (!existing && sku) {
    existing = modelObj.variants.find(v => v.sku === sku);
    
    // Check if SKUs differ but they merged. If SKU base differs (e.g. L705F vs L715F), DO NOT MERGE!
    if (existing && existing.sku && sku.substring(0, 5) !== existing.sku.substring(0, 5)) {
      existing = null; // Do not merge!
    }
  }
  
  if (existing) {
    if (existing.price !== price) {
      reportFlags.push(`Price anomaly on duplicate variant ${variantSlug}: ${existing.price} vs ${price} (Rows: ${existing.sourceRows.join(', ')} and ${sourceRow})`);
      variant.slug = `${variantSlug}-${sku || 'dup'}`;
      modelObj.variants.push(variant);
      variantsCount++;
    } else {
      existing.sourceRows.push(sourceRow);
      if (processor) {
        if (!existing.specs) existing.specs = {};
        existing.specs.Processor = processor;
      }
      reportFlags.push(`Merged duplicate variant ${variantSlug} from ${sourceRow}`);
    }
  } else {
    if (processor) {
      if (!variant.specs) variant.specs = {};
      variant.specs.Processor = processor;
    }
    modelObj.variants.push(variant);
    variantsCount++;
  }
}
rawData.forEach(processRow);

// Price anomaly check across configurations for same model
for (const model of modelsMap.values()) {
  const configs = model.variants;
  for (let i = 0; i < configs.length; i++) {
    for (let j = i + 1; j < configs.length; j++) {
      const v1 = configs[i];
      const v2 = configs[j];
      if (v1.ram === v2.ram && v1.storage === v2.storage && v1.price !== v2.price) {
        reportFlags.push(`Price anomaly within model ${model.model} for config ${v1.ram}-${v1.storage}: Multiple prices found (${v1.price}, ${v2.price})`);
      }
      
      // Check if larger config is cheaper
      if (v1.ram && v2.ram && v1.storage && v2.storage) {
        const r1 = parseInt(v1.ram);
        const r2 = parseInt(v2.ram);
        const s1 = v1.storage.includes('TB') ? parseInt(v1.storage) * 1024 : parseInt(v1.storage);
        const s2 = v2.storage.includes('TB') ? parseInt(v2.storage) * 1024 : parseInt(v2.storage);
        
        if (r1 >= r2 && s1 >= s2 && (r1 > r2 || s1 > s2)) {
          if (v1.price < v2.price) {
            reportFlags.push(`Price anomaly within model ${model.model}: Larger config ${v1.ram}+${v1.storage} (₹${v1.price}) is cheaper than ${v2.ram}+${v2.storage} (₹${v2.price})`);
          }
        }
      }
    }
  }
}


// Assertions
let totalMerged = reportFlags.filter(f => f.startsWith('Merged duplicate')).length;
const totalExpectedRows = variantsCount + excluded.length + totalMerged;

const assertionErrors = [];

if (totalExpectedRows !== 670) {
  assertionErrors.push(`Rows mismatch. Expected 670, got ${totalExpectedRows} (variants: ${variantsCount}, excluded: ${excluded.length}, merged: ${totalMerged})`);
}

// Exactly 12 brands allowed
const finalBrands = new Set([...modelsMap.values()].map(m => m.brand));
if (finalBrands.size !== 12) {
  assertionErrors.push(`Expected 12 brands, got ${finalBrands.size}`);
}

const unmapped = reportFlags.filter(f => f.startsWith('Unmapped model'));
if (unmapped.length > 0) {
  assertionErrors.push(`Unmapped models found:\n${unmapped.join('\n')}`);
}

// Model counts by category
const catCounts = { phones: 0, tablets: 0, laptops: 0, accessories: 0, smartwatches: 0 };
for (const m of modelsMap.values()) catCounts[m.category]++;
if (catCounts.phones !== 116 || catCounts.tablets !== 16 || catCounts.laptops !== 1 || catCounts.accessories !== 4 || catCounts.smartwatches !== 10) {
  assertionErrors.push(`Category counts mismatch:\n${JSON.stringify(catCounts)}\nExpected: phones:116, tablets:16, laptops:1, accessories:4, smartwatches:10`);
}

// Per brand model counts
const brandCatCounts = { Apple: 0, Motorola: 0, Xiaomi: 0, realme: 0, Samsung: 0 };
for (const m of modelsMap.values()) {
  if (m.brand === 'Apple') brandCatCounts.Apple++;
  if (m.brand === 'Motorola') brandCatCounts.Motorola++;
  if (m.brand === 'Xiaomi') brandCatCounts.Xiaomi++;
  if (m.brand === 'realme') brandCatCounts.realme++;
  if (m.brand === 'Samsung') brandCatCounts.Samsung++;
}
if (brandCatCounts.Apple !== 16 || brandCatCounts.Motorola !== 14 || brandCatCounts.Xiaomi !== 21 || brandCatCounts.realme !== 13 || brandCatCounts.Samsung !== 33) {
  assertionErrors.push(`Per brand counts mismatch:\n${JSON.stringify(brandCatCounts)}\nExpected: Apple:16, Motorola:14, Xiaomi:21, realme:13, Samsung:33`);
}

for (const model of modelsMap.values()) {
  for (const variant of model.variants) {
    if (['phones', 'tablets'].includes(model.category) && !variant.storage) {
      if (model.brand !== 'Samsung' || !model.model.includes('Watch')) {
        assertionErrors.push(`Missing storage for phone/tablet ${variant.slug}`);
      }
    }
    if (model.category === 'phones' && model.brand !== 'Apple' && model.brand !== 'Google' && !variant.ram) {
      if (!model.brand || model.brand !== 'Samsung' || !model.model.includes('Watch')) {
        assertionErrors.push(`Missing ram for non-Apple/Google phone ${variant.slug}`);
      }
    }
    if (variant.color) {
      if (/\d+\+\d+|\d+\s?(GB|TB)\b|HN\/A|\bPods\b/.test(variant.color)) {
        assertionErrors.push(`Color contains invalid memory/SKU token: ${variant.color}`);
      }
      for (const k of Object.keys(TYPO_FIXES)) {
        if (new RegExp('\\b' + k + '\\b', 'i').test(variant.color) && TYPO_FIXES[k].toUpperCase() !== k.toUpperCase()) {
          assertionErrors.push(`Color contains unfixed typo ${k}: ${variant.color}`);
        }
      }
      
      const words = variant.color.split(' ');
      for (const w of words) {
        if (w === w.toUpperCase() && w.length >= 3 && /^[A-Z]+$/.test(w) && !['LTE', 'GPS', 'ANC', 'USB', 'WIFI', 'PRO', 'MAX'].includes(w)) {
          assertionErrors.push(`Color contains uppercase word ${w}: ${variant.color}`);
        }
      }
      
      if (new RegExp('\\b[A-Z]\\d{2}\\b', 'i').test(variant.color)) {
        assertionErrors.push(`Color contains model code: ${variant.color}`);
      }
      
      const modelNameUpper = model.model.toUpperCase().replace(/\+/g, '');
      const colorUpper = variant.color.toUpperCase();
      if (modelNameUpper.length > 3 && colorUpper.includes(modelNameUpper)) {
        assertionErrors.push(`Color contains model name: ${variant.color} (Model: ${model.model})`);
      }
    }
  }
}

if (assertionErrors.length > 0) {
  console.error('ASSERTIONS FAILED:\\n' + assertionErrors.join('\\n'));
  process.exit(1);
}

const catalogJson = {
  source: "Website REGULAR MOP LIST.xlsx",
  models: Array.from(modelsMap.values()),
  excluded
};

fs.mkdirSync(path.dirname(catalogPath), { recursive: true });
fs.writeFileSync(catalogPath, JSON.stringify(catalogJson, null, 2));

// Generate CATALOG_REPORT.md
let reportMd = `# MOP List Catalog Report\n\n`;

reportMd += `## Processed Stats\n`;
reportMd += `- **Models extracted:** ${modelsMap.size}\n`;
reportMd += `- **Variants extracted:** ${variantsCount}\n`;
reportMd += `- **Excluded rows:** ${excluded.length}\n`;
reportMd += `- **Total rows processed:** ${variantsCount + excluded.length + totalMerged}\n\n`;

reportMd += `## Per-Brand Table\n`;
reportMd += `| Brand | Rows in | Excluded | Merged duplicates | Variants | Phones | Tablets | Watches | Laptops | Accessories |\n`;
reportMd += `|---|---|---|---|---|---|---|---|---|---|\n`;

// Aggregate stats per brand
const brandStats = {};
for (const b of finalBrands) {
  brandStats[b] = { rowsIn: 0, excluded: 0, merged: 0, variants: 0, phones: 0, tablets: 0, watches: 0, laptops: 0, accessories: 0 };
}

for (const e of excluded) {
  const b = e.sourceRow.split('#')[0].replace('REALME ', 'REALME').replace('REDMI', 'XIAOMI').replace('ALACATEL', 'AI PLUS');
  let brandMap = b === 'APPLE' ? 'Apple' : b === 'SAMSUNG' ? 'Samsung' : b === 'GOOGLE' ? 'Google' : b === 'MOTOROLA' ? 'Motorola' : b === 'NOTHING' ? 'Nothing' : b === 'OPPO' ? 'OPPO' : b === 'REALME' ? 'realme' : b === 'VIVO' ? 'vivo' : b === 'POCO' ? 'POCO' : b === 'INFINIX' ? 'Infinix' : b === 'TECNO' ? 'Tecno' : b === 'XIAOMI' ? 'Xiaomi' : b === 'AI PLUS' ? 'AI+' : b;
  if (brandStats[brandMap]) {
    brandStats[brandMap].rowsIn++;
    brandStats[brandMap].excluded++;
  }
}

for (const m of modelsMap.values()) {
  const bs = brandStats[m.brand];
  if (!bs) continue;
  
  bs.variants += m.variants.length;
  bs.rowsIn += m.variants.length; // 1 row per variant (base)
  if (m.category === 'phones') bs.phones++;
  if (m.category === 'tablets') bs.tablets++;
  if (m.category === 'smartwatches') bs.watches++;
  if (m.category === 'laptops') bs.laptops++;
  if (m.category === 'accessories') bs.accessories++;
  
  for (const v of m.variants) {
    if (v.sourceRows && v.sourceRows.length > 1) {
      bs.merged += v.sourceRows.length - 1;
      bs.rowsIn += v.sourceRows.length - 1;
    }
  }
}

let totals = { rowsIn: 0, excluded: 0, merged: 0, variants: 0, phones: 0, tablets: 0, watches: 0, laptops: 0, accessories: 0 };

for (const b of Array.from(finalBrands).sort()) {
  const s = brandStats[b];
  reportMd += `| ${b} | ${s.rowsIn} | ${s.excluded} | ${s.merged} | ${s.variants} | ${s.phones} | ${s.tablets} | ${s.watches} | ${s.laptops} | ${s.accessories} |\n`;
  totals.rowsIn += s.rowsIn;
  totals.excluded += s.excluded;
  totals.merged += s.merged;
  totals.variants += s.variants;
  totals.phones += s.phones;
  totals.tablets += s.tablets;
  totals.watches += s.watches;
  totals.laptops += s.laptops;
  totals.accessories += s.accessories;
}

reportMd += `| **TOTAL** | **${totals.rowsIn}** | **${totals.excluded}** | **${totals.merged}** | **${totals.variants}** | **${totals.phones}** | **${totals.tablets}** | **${totals.watches}** | **${totals.laptops}** | **${totals.accessories}** |\n\n`;

reportMd += `## Correction Log & Flags\n`;
reportMd += reportFlags.map(f => `- ${f}`).join('\n') + `\n\n`;

reportMd += `## Owner Questions\n`;
reportMd += `- AI+ and C100X rows were excluded as their brands are not officially supported. The AI+ rows (ALACATEL#13-17) were: \n`;
for (const e of excluded) {
  if (e.raw.includes('AI PLUS')) reportMd += `  - ${e.sourceRow}: ${e.raw}\n`;
}
reportMd += `- Is the price column the selling price (MOP) or the MRP?\n`;
reportMd += `- What is the stock for the 11 brands without a STOCK column?\n`;
reportMd += `- Which models are new arrivals?\n`;

fs.writeFileSync(reportPath, reportMd);
console.log('Build complete');