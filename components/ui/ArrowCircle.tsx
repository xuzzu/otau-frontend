export function ArrowCircle({
  size = 64,
  dark = true,
}: {
  size?: number;
  dark?: boolean;
}) {
  const c = dark ? "#1A1612" : "#FBF8F2";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        border: `1px solid ${c}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size * 0.32}
        height={size * 0.32}
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M2 8 H14 M9 3 L14 8 L9 13"
          stroke={c}
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
    </div>
  );
}
