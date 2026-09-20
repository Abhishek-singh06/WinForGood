"use client";

/**
 * Demo QR Code Generator
 *
 * Generates a purely decorative, non-functional QR-style pattern for demo mode.
 * CRITICAL: This does NOT encode any real payment destination, bank account,
 * UPI credentials, or any real financial information.
 *
 * The pattern is algorithmically generated using a seeded random approach
 * that varies between sessions but is always non-functional.
 */

import React, { useMemo } from "react";

interface DemoQRProps {
  size?: number;
  className?: string;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function DemoQR({ size = 200, className }: DemoQRProps) {
  const gridSize = 21; // Standard QR module count
  const cellSize = size / gridSize;

  const pattern = useMemo(() => {
    // Use current timestamp floored to minute for session variance
    const seed = Math.floor(Date.now() / 60000);
    const rng = seededRandom(seed);

    const grid: boolean[][] = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => false)
    );

    // Fixed finder patterns (top-left, top-right, bottom-left) — standard QR structure
    const drawFinderPattern = (startRow: number, startCol: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[startRow + r][startCol + c] = isOuter || isInner;
        }
      }
    };

    drawFinderPattern(0, 0);
    drawFinderPattern(0, gridSize - 7);
    drawFinderPattern(gridSize - 7, 0);

    // Timing patterns
    for (let i = 7; i < gridSize - 7; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Random data cells (avoiding finder pattern zones)
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const inFinderZone =
          (r < 8 && c < 8) ||
          (r < 8 && c >= gridSize - 8) ||
          (r >= gridSize - 8 && c < 8);
        const inTimingZone = r === 6 || c === 6;

        if (!inFinderZone && !inTimingZone) {
          grid[r][c] = rng() > 0.55;
        }
      }
    }

    return grid;
  }, []);

  return (
    <div className={className}>
      <div className="relative inline-block">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-label="Demo QR code - not a real payment QR"
          role="img"
        >
          {/* White background */}
          <rect width={size} height={size} fill="white" rx="4" />

          {/* QR modules */}
          {pattern.map((row, r) =>
            row.map((filled, c) =>
              filled ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#0A0E13"
                />
              ) : null
            )
          )}
        </svg>

        {/* DEMO overlay watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-blue-600/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            DEMO
          </div>
        </div>
      </div>
    </div>
  );
}
