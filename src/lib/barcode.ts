// Self-contained Code128B + QR encoders for the ORIGINAL PDF templates. In
// @react-pdf we cannot run the HTML page's browser JS, so these return raw
// geometry (bar widths / a boolean module matrix) that the renderer draws with
// <Rect> elements. Ported 1:1 from the approved mockups' encoders — the barcode
// is a real, scannable Code128B; the QR is a real ISO/IEC 18004 byte-mode code.

// ── Code128 Set B ──────────────────────────────────────────────────────────
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
];
const CODE128_START_B = 104;
const CODE128_STOP = 106;

export interface Code128Bar {
  x: number;
  width: number;
}

/** Real Code128B encoding of `data` → filled-bar rects on a 0..totalUnits scale
 *  (bars only; spaces are the gaps). `quiet` adds a left/right quiet zone. */
export function code128b(data: string, quiet = 0): { bars: Code128Bar[]; width: number } {
  const codes: number[] = [CODE128_START_B];
  let sum = CODE128_START_B;
  for (let i = 0; i < data.length; i++) {
    const val = data.charCodeAt(i) - 32; // Code128B value = ASCII - 32
    codes.push(val);
    sum += val * (i + 1);
  }
  codes.push(sum % 103); // checksum
  codes.push(CODE128_STOP);

  const seq: number[] = [];
  for (const code of codes) {
    const pat = CODE128_PATTERNS[code];
    for (const ch of pat) seq.push(parseInt(ch, 10));
  }

  const bars: Code128Bar[] = [];
  let x = quiet;
  let isBar = true;
  for (const w of seq) {
    if (isBar) bars.push({ x, width: w });
    x += w;
    isBar = !isBar;
  }
  return { bars, width: x + quiet };
}

// ── QR Code (byte mode, versions 1-10, ECC-M by default) ────────────────────
// Galois field GF(256), primitive 0x11d.
const GF_EXP = new Array<number>(256);
const GF_LOG = new Array<number>(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  GF_EXP[255] = GF_EXP[0];
})();

function gmul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[(GF_LOG[a] + GF_LOG[b]) % 255];
}

function rsGenPoly(n: number): number[] {
  let poly = [1];
  for (let i = 0; i < n; i++) {
    const np = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      np[j] ^= gmul(poly[j], GF_EXP[i]);
      np[j + 1] ^= poly[j];
    }
    poly = np;
  }
  return poly.reverse();
}

function rsEncode(data: number[], ecLen: number): number[] {
  const gen = rsGenPoly(ecLen);
  const res = new Array<number>(data.length + ecLen).fill(0);
  for (let i = 0; i < data.length; i++) res[i] = data[i];
  for (let i = 0; i < data.length; i++) {
    const coef = res[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) res[i + j] ^= gmul(gen[j], coef);
    }
  }
  return res.slice(data.length);
}

type QrLevel = 'L' | 'M' | 'Q' | 'H';
type Group = [number, number]; // [numBlocks, totalCodewordsPerBlock]
type EcSpec = [number, Group[]]; // [ecCodewordsPerBlock, groups]

// Standard QR EC block table for versions 1..10 (enough for a ~55-byte URL).
const EC_BLOCKS: Record<number, Record<QrLevel, EcSpec>> = {
  1: { L: [7, [[1, 26]]], M: [10, [[1, 26]]], Q: [13, [[1, 26]]], H: [17, [[1, 26]]] },
  2: { L: [10, [[1, 44]]], M: [16, [[1, 44]]], Q: [22, [[1, 44]]], H: [28, [[1, 44]]] },
  3: { L: [15, [[1, 70]]], M: [26, [[1, 70]]], Q: [18, [[2, 35]]], H: [22, [[2, 35]]] },
  4: { L: [20, [[1, 100]]], M: [18, [[2, 50]]], Q: [26, [[2, 50]]], H: [16, [[4, 25]]] },
  5: { L: [26, [[1, 134]]], M: [24, [[2, 67]]], Q: [18, [[2, 33], [2, 34]]], H: [22, [[2, 33], [2, 34]]] },
  6: { L: [18, [[2, 86]]], M: [16, [[4, 43]]], Q: [24, [[4, 43]]], H: [28, [[4, 43]]] },
  7: { L: [20, [[2, 98]]], M: [18, [[4, 49]]], Q: [18, [[2, 32], [4, 33]]], H: [26, [[4, 39], [1, 40]]] },
  8: { L: [24, [[2, 121]]], M: [22, [[2, 60], [2, 61]]], Q: [22, [[4, 40], [2, 41]]], H: [26, [[4, 40], [2, 41]]] },
  9: { L: [30, [[2, 146]]], M: [22, [[3, 58], [2, 59]]], Q: [20, [[4, 36], [4, 37]]], H: [24, [[4, 36], [4, 37]]] },
  10: { L: [18, [[2, 86], [2, 87]]], M: [26, [[4, 69], [1, 70]]], Q: [24, [[6, 43], [2, 44]]], H: [28, [[6, 43], [2, 44]]] },
};
const ALIGN: Record<number, number[]> = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
  6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
};
const LEVEL_IDX: Record<QrLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };

function bchFormat(fmt: number): number {
  const g = 0x537;
  let d = fmt << 10;
  for (let i = 14; i >= 10; i--) if (d & (1 << i)) d ^= g << (i - 10);
  return ((fmt << 10) | d) ^ 0x5412;
}

/** Build a real QR matrix for `text` (byte mode). Returns a boolean grid where
 *  true = dark module. Throws if the text is too long for version ≤ 10. */
export function qrMatrix(text: string, level: QrLevel = 'M'): boolean[][] {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 128) bytes.push(c);
    else if (c < 2048) bytes.push(192 | (c >> 6), 128 | (c & 63));
    else bytes.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
  }

  let version = 0;
  let ec: EcSpec | null = null;
  let totalData = 0;
  let blocks: Group[] = [];
  for (let v = 1; v <= 10; v++) {
    const spec = EC_BLOCKS[v][level];
    const ecPer = spec[0];
    const grp = spec[1];
    let dataCwCount = 0;
    for (const gg of grp) dataCwCount += gg[0] * (gg[1] - ecPer);
    const lenBits = v < 10 ? 8 : 16;
    const need = Math.ceil((4 + lenBits + bytes.length * 8) / 8);
    if (need <= dataCwCount) {
      version = v;
      ec = spec;
      totalData = dataCwCount;
      blocks = grp;
      break;
    }
  }
  if (version === 0 || ec === null) throw new Error('QR: data too long for v<=10');
  const ecPer = ec[0];

  // Bit buffer → data codewords.
  const bits: number[] = [];
  const put = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };
  put(4, 4); // byte mode
  put(bytes.length, version < 10 ? 8 : 16);
  for (const by of bytes) put(by, 8);
  const cap = totalData * 8;
  for (let i = 0; i < 4 && bits.length < cap; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  const pad = [0xec, 0x11];
  let pi = 0;
  while (bits.length < cap) {
    put(pad[pi % 2], 8);
    pi++;
  }
  const dataCw: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    dataCw.push(b);
  }

  // Split into blocks, compute EC, interleave.
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let idx = 0;
  for (const gg of blocks) {
    for (let bcount = 0; bcount < gg[0]; bcount++) {
      const dlen = gg[1] - ecPer;
      const blk = dataCw.slice(idx, idx + dlen);
      idx += dlen;
      dataBlocks.push(blk);
      ecBlocks.push(rsEncode(blk, ecPer));
    }
  }
  const finalCw: number[] = [];
  const maxData = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxData; i++) {
    for (let b = 0; b < dataBlocks.length; b++) if (i < dataBlocks[b].length) finalCw.push(dataBlocks[b][i]);
  }
  for (let i = 0; i < ecPer; i++) {
    for (let b = 0; b < ecBlocks.length; b++) finalCw.push(ecBlocks[b][i]);
  }

  // Build the module matrix + reserved mask (function patterns).
  const size = version * 4 + 17;
  const m: number[][] = [];
  const reserved: boolean[][] = [];
  for (let i = 0; i < size; i++) {
    m.push(new Array<number>(size).fill(0));
    reserved.push(new Array<boolean>(size).fill(false));
  }
  const setF = (r: number, c: number, val: boolean) => {
    m[r][c] = val ? 1 : 0;
    reserved[r][c] = true;
  };
  const finder = (r: number, c: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        const inb =
          (dr >= 0 && dr <= 6 && (dc === 0 || dc === 6)) ||
          (dc >= 0 && dc <= 6 && (dr === 0 || dr === 6)) ||
          (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
        setF(rr, cc, inb);
      }
    }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);
  // Timing patterns.
  for (let i = 8; i < size - 8; i++) {
    if (!reserved[6][i]) setF(6, i, i % 2 === 0);
    if (!reserved[i][6]) setF(i, 6, i % 2 === 0);
  }
  // Alignment patterns.
  const ap = ALIGN[version];
  for (let a = 0; a < ap.length; a++) {
    for (let bb = 0; bb < ap.length; bb++) {
      const ar = ap[a];
      const ac = ap[bb];
      if (reserved[ar][ac]) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const on = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
          setF(ar + dr, ac + dc, on);
        }
      }
    }
  }
  // Dark module.
  setF(size - 8, 8, true);
  // Reserve format-info areas.
  for (let i = 0; i < 9; i++) {
    if (!reserved[8][i]) reserved[8][i] = true;
    if (!reserved[i][8]) reserved[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 1 - i] = true;
    reserved[size - 1 - i][8] = true;
  }

  const allBits: number[] = [];
  for (const cw of finalCw) for (let j = 7; j >= 0; j--) allBits.push((cw >> j) & 1);

  const maskFn = (mask: number, row: number, cc: number): boolean => {
    switch (mask) {
      case 0: return (row + cc) % 2 === 0;
      case 1: return row % 2 === 0;
      case 2: return cc % 3 === 0;
      case 3: return (row + cc) % 3 === 0;
      case 4: return (Math.floor(row / 2) + Math.floor(cc / 3)) % 2 === 0;
      case 5: return ((row * cc) % 2) + ((row * cc) % 3) === 0;
      case 6: return (((row * cc) % 2) + ((row * cc) % 3)) % 2 === 0;
      default: return (((row + cc) % 2) + ((row * cc) % 3)) % 2 === 0;
    }
  };

  const placeAndMask = (mask: number): number[][] => {
    const mm: number[][] = m.map((r) => r.slice());
    let bitIdx = 0;
    let dir = -1;
    let col = size - 1;
    while (col > 0) {
      if (col === 6) col--;
      for (let rr2 = 0; rr2 < size; rr2++) {
        const row = dir < 0 ? size - 1 - rr2 : rr2;
        for (let cc2 = 0; cc2 < 2; cc2++) {
          const cc = col - cc2;
          if (reserved[row][cc]) continue;
          let bit = bitIdx < allBits.length ? allBits[bitIdx] : 0;
          bitIdx++;
          if (maskFn(mask, row, cc)) bit ^= 1;
          mm[row][cc] = bit;
        }
      }
      dir = -dir;
      col -= 2;
    }
    // Format info.
    const fmt = (LEVEL_IDX[level] << 3) | mask;
    const fbits = bchFormat(fmt);
    for (let i = 0; i < 15; i++) {
      const b = (fbits >> i) & 1;
      if (i < 6) mm[i][8] = b;
      else if (i === 6) mm[7][8] = b;
      else if (i < 8) mm[8][8] = b;
      else if (i === 8) mm[8][7] = b;
      else mm[8][14 - i] = b;
      if (i < 8) mm[8][size - 1 - i] = b;
      else mm[size - 15 + i][8] = b;
    }
    mm[size - 8][8] = 1;
    return mm;
  };

  const penalty = (mm: number[][]): number => {
    let p = 0;
    const n = size;
    for (let pass = 0; pass < 2; pass++) {
      for (let r = 0; r < n; r++) {
        let run = 1;
        for (let c = 1; c < n; c++) {
          const a = pass ? mm[c][r] : mm[r][c];
          const pv = pass ? mm[c - 1][r] : mm[r][c - 1];
          if (a === pv) {
            run++;
            if (run === 5) p += 3;
            else if (run > 5) p++;
          } else run = 1;
        }
      }
    }
    for (let r = 0; r < n - 1; r++) {
      for (let c = 0; c < n - 1; c++) {
        const v = mm[r][c];
        if (v === mm[r][c + 1] && v === mm[r + 1][c] && v === mm[r + 1][c + 1]) p += 3;
      }
    }
    const pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
    const pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n - 10; c++) {
        let s1 = true;
        let s2 = true;
        for (let k = 0; k < 11; k++) {
          if (mm[r][c + k] !== pat1[k]) s1 = false;
          if (mm[r][c + k] !== pat2[k]) s2 = false;
        }
        if (s1) p += 40;
        if (s2) p += 40;
      }
    }
    for (let c = 0; c < n; c++) {
      for (let r = 0; r < n - 10; r++) {
        let s1 = true;
        let s2 = true;
        for (let k = 0; k < 11; k++) {
          if (mm[r + k][c] !== pat1[k]) s1 = false;
          if (mm[r + k][c] !== pat2[k]) s2 = false;
        }
        if (s1) p += 40;
        if (s2) p += 40;
      }
    }
    let dark = 0;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (mm[r][c]) dark++;
    const ratio = (dark * 100) / (n * n);
    p += Math.floor(Math.abs(ratio - 50) / 5) * 10;
    return p;
  };

  let best: number[][] = placeAndMask(0);
  let bestP = penalty(best);
  for (let mk = 1; mk < 8; mk++) {
    const mm = placeAndMask(mk);
    const pp = penalty(mm);
    if (pp < bestP) {
      bestP = pp;
      best = mm;
    }
  }
  return best.map((row) => row.map((v) => v === 1));
}
