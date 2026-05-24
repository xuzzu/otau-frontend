"use client";

/**
 * Stylized QR placeholder — a 21×21 grid that looks like a real QR code
 * but encodes nothing. Used purely for the demo's AR prompt.
 */

const GRID = 21;

function genCells(seed: number): boolean[][] {
  const rng = mulberry32(seed);
  const m: boolean[][] = [];
  for (let y = 0; y < GRID; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < GRID; x++) row.push(rng() > 0.5);
    m.push(row);
  }
  // Place finder patterns (top-left, top-right, bottom-left)
  const finder = [
    [0, 0],
    [GRID - 7, 0],
    [0, GRID - 7],
  ] as const;
  for (const [fx, fy] of finder) {
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 7; x++) {
        const onBorder = y === 0 || y === 6 || x === 0 || x === 6;
        const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        m[fy + y][fx + x] = onBorder || inner;
      }
  }
  // Quiet separators around finders — clear adjacent rows/cols
  for (const [fx, fy] of finder) {
    for (let y = -1; y <= 7; y++) {
      if (fy + y >= 0 && fy + y < GRID && fx + 7 < GRID) m[fy + y][fx + 7] = false;
      if (fy + y >= 0 && fy + y < GRID && fx - 1 >= 0) m[fy + y][fx - 1] = false;
    }
    for (let x = -1; x <= 7; x++) {
      if (fx + x >= 0 && fx + x < GRID && fy + 7 < GRID) m[fy + 7][fx + x] = false;
      if (fx + x >= 0 && fx + x < GRID && fy - 1 >= 0) m[fy - 1][fx + x] = false;
    }
  }
  return m;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function QRPlaceholder({
  size = 140,
  seed = 42,
}: {
  size?: number;
  seed?: number;
}) {
  const cells = genCells(seed);
  const cell = size / (GRID + 2); // 1-cell quiet zone around
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
    >
      <rect width={size} height={size} fill="#FBF8F2" />
      {cells.flatMap((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={(x + 1) * cell}
              y={(y + 1) * cell}
              width={cell}
              height={cell}
              fill="#1A1612"
            />
          ) : null
        )
      )}
    </svg>
  );
}
