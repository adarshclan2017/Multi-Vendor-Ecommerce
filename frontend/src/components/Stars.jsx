import React from "react";

export default function Stars({ value = 0, size = 16 }) {
  const v = Math.round(value * 2) / 2; // allow .5
  const stars = [1, 2, 3, 4, 5].map((n) => {
    const full = v >= n;
    const half = !full && v >= n - 0.5;
    return { n, full, half };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {stars.map((s) => (
        <span
          key={s.n}
          style={{
            fontSize: size,
            lineHeight: 1,
            color: s.full || s.half ? "#f59e0b" : "#d1d5db",
            position: "relative",
            display: "inline-block",
            width: size,
            textAlign: "center",
          }}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}
