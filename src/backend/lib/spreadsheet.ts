import "server-only";
import { inflateRawSync } from "node:zlib";

// Just enough spreadsheet support for the admin price list: read a CSV or the
// first sheet of an .xlsx into rows of strings, and write a CSV Excel opens
// cleanly. No dependency: an .xlsx is a zip of XML files.

export type Rows = string[][];

/** RFC 4180 CSV (quotes, doubled quotes, newlines in quotes). Also accepts ; or tab separated. */
export function parseCsv(text: string): Rows {
  text = text.replace(/^﻿/, "");
  const firstLine = text.slice(0, text.indexOf("\n") === -1 ? undefined : text.indexOf("\n"));
  const sep = [",", ";", "\t"].reduce((best, s) => (count(firstLine, s) > count(firstLine, best) ? s : best), ",");

  const rows: Rows = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function count(s: string, ch: string) {
  return s.split(ch).length - 1;
}

/**
 * CSV bytes to text. "CSV UTF-8" from Excel is UTF-8, but plain "CSV (Comma
 * delimited)" on Windows is Windows-1252, so fall back to that rather than
 * turning ₹ and accented names into garbage.
 */
export function decodeCsv(buf: Buffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    return new TextDecoder("windows-1252").decode(buf);
  }
}

/** CSV with a BOM so Excel reads ₹ and other non-ASCII characters correctly. */
export function toCsv(rows: (string | number | null)[][]) {
  const cell = (v: string | number | null) => {
    const s = v === null ? "" : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}

// ---------------------------------------------------------------- .xlsx

/** Reads the first worksheet of an .xlsx file. Throws a readable error if it isn't one. */
export function readXlsx(buf: Buffer): Rows {
  const files = unzip(buf);
  const read = (name: string) => files.get(name)?.toString("utf8");

  const workbook = read("xl/workbook.xml");
  if (!workbook) throw new Error("That file isn't an Excel workbook.");
  const firstSheetRel = workbook.match(/<sheet\b[^>]*\br:id="([^"]+)"/)?.[1];
  const rels = read("xl/_rels/workbook.xml.rels") ?? "";
  let target = firstSheetRel
    ? new RegExp(`<Relationship\\b[^>]*Id="${firstSheetRel}"[^>]*Target="([^"]+)"`).exec(rels)?.[1] ??
      new RegExp(`<Relationship\\b[^>]*Target="([^"]+)"[^>]*Id="${firstSheetRel}"`).exec(rels)?.[1]
    : undefined;
  target = target ? (target.startsWith("/") ? target.slice(1) : `xl/${target}`) : "xl/worksheets/sheet1.xml";
  const sheet = read(target);
  if (!sheet) throw new Error("Couldn't find the first sheet in that workbook.");

  const shared: string[] = [];
  for (const si of (read("xl/sharedStrings.xml") ?? "").matchAll(/<si>([\s\S]*?)<\/si>/g)) {
    shared.push(textRuns(si[1]));
  }

  const rows: Rows = [];
  for (const r of sheet.matchAll(/<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const cells: string[] = [];
    for (const c of (r[1] ?? "").matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = c[1];
      const body = c[2] ?? "";
      const ref = /\br="([A-Z]+)\d+"/.exec(attrs)?.[1];
      const col = ref ? colIndex(ref) : cells.length;
      const type = /\bt="([^"]+)"/.exec(attrs)?.[1];
      const v = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
      let value = "";
      if (type === "s" && v !== undefined) value = shared[Number(v)] ?? "";
      else if (type === "inlineStr") value = textRuns(body);
      else if (v !== undefined) value = decode(v);
      while (cells.length < col) cells.push("");
      cells[col] = value;
    }
    rows.push(cells);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function textRuns(xml: string) {
  return [...xml.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((m) => decode(m[1])).join("");
}

function decode(s: string) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&");
}

function colIndex(letters: string) {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/** Minimal zip reader (stored + deflate), enough for Office files. */
function unzip(buf: Buffer) {
  const files = new Map<string, Buffer>();
  // End of central directory: last 22+ bytes, signature 0x06054b50.
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) throw new Error("That file isn't an Excel (.xlsx) or CSV file.");
  const entries = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let e = 0; e < entries; e++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break;
    const method = buf.readUInt16LE(p + 10);
    const compressed = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);
    p += 46 + nameLen + extraLen + commentLen;

    const dataStart = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const data = buf.subarray(dataStart, dataStart + compressed);
    if (method === 0) files.set(name, data);
    else if (method === 8) files.set(name, inflateRawSync(data));
  }
  return files;
}
