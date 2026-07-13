// Pure-design placeholder for the Godot/engine split.
// Runtime logic currently lives in app/game/page.tsx to avoid breaking the web alpha.
export const WEATHER_KINDS = ["ปกติ", "ฝนหลงฤดู", "แล้งจัด", "หนาวยาว", "พายุเข้าเร็ว", "หมอกชื้น"] as const;
export function weatherRiskPressure(kind: string, severity: number) {
  if (kind === "ปกติ") return 0;
  return Math.max(0, Math.min(100, Math.round(severity)));
}
