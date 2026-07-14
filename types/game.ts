// Portable interfaces for the future Godot port.
// The running web prototype still keeps the live implementation in app/game/page.tsx,
// but every new system should mirror its shape here before it is moved into a pure engine.
export type WeatherKind = "ปกติ" | "ฝนหลงฤดู" | "แล้งจัด" | "หนาวยาว" | "พายุเข้าเร็ว" | "หมอกชื้น";
export type WeatherState = { kind: WeatherKind; severity: number; monthsLeft: number; forecast: string; lastYearPattern: string };
export type CampPolicies = { autoFoodShift: boolean; autoMaintenance: boolean; protectChildren: boolean; reserveWater: boolean; rationMode: "เท่าเทียม" | "ให้แรงงานหนักก่อน" | "ประหยัดเสบียง" };
export type EndgameCrisisKind = "none" | "long_winter" | "bandit_host" | "great_plague";
export type EndgameCrisis = { kind: EndgameCrisisKind; yearsUntil: number; warningLevel: number; active: boolean; resolved: boolean };
export type BuildingCondition<T extends string = string> = Partial<Record<T, number>>;
export type SkillXP<T extends string = string> = Partial<Record<T, number>>;

export type EraStage = "ค่ายพักแรม" | "ชุมชนแรกเริ่ม" | "หมู่บ้านถาวร" | "เมืองเล็ก" | "เมืองการค้า" | "นครรัฐ" | "อาณาจักร";
export type GuildKey = "huntersGuild" | "buildersGuild" | "merchantsGuild";
export type GuildState = Record<GuildKey, { level: number; funding: number; activeEdict: string }>;
export type OutpostKind = "water" | "wood" | "food" | "mine" | "flax" | "trade";
export type Outpost<TLocation extends string = string, TResource extends string = string> = { id: string; location: TLocation; name: string; kind: OutpostKind; workers: number; level: number; security: number; monthly: Partial<Record<TResource, number>> };
export type FactionKey = "guards" | "farmers" | "merchants" | "builders";
export type FactionState = Record<FactionKey, { approval: number; power: number }>;

// v0.9.37 stabilization contracts
export type RngState = {
  seed: string;
  state: number;
  calls: number;
};

export type EngineTraceEntry = {
  id: string;
  before: unknown;
  after: unknown;
  delta: unknown;
};

export type SaveEnvelope<TGame = unknown> = {
  format: "evolution-of-us-save";
  schemaVersion: number;
  gameVersion: string;
  savedAt: string;
  metadata: Record<string, unknown>;
  game: TGame;
  checksum: string;
};

export type RuntimeValidationIssue = {
  path: string;
  message: string;
  severity: "error" | "warning";
};


// v0.9.38 balance and UX contracts
export type Difficulty = "story" | "normal" | "survival" | "ironman";

export type EventHistoryEntry = {
  id: string;
  category: string;
  year: number;
  month: number;
  rare: boolean;
};

export type MonthlyReportRow<TKey extends string = string> = {
  key: TKey;
  label: string;
  before: number;
  after: number;
  delta: number;
};

// v0.9.39 dynasty and endgame contracts
export type VictoryPathKey = "enduring" | "trade" | "peace" | "knowledge" | "legacy" | "guardian";

export type SuccessionRecord = {
  year: number;
  month: number;
  fromName: string;
  toName: string;
  reason: string;
  generation: number;
};

export type DynastyState = {
  founderName: string;
  generation: number;
  currentLeaderId: string;
  designatedHeirId: string | null;
  successionHistory: SuccessionRecord[];
  familyMilestones: string[];
  lastSuccession: string;
};

export type VictoryEnding = {
  path: VictoryPathKey;
  title: string;
  subtitle: string;
  achievedYear: number;
  achievedMonth: number;
  leaderName: string;
  population: number;
  stage: EraStage;
  paragraphs: string[];
  highlights: Array<{ title: string; year: number; month: number; text: string }>;
  fallen: Array<{ name: string; age: number; cause: string }>;
};

export type VictoryState = {
  chosenPath: VictoryPathKey | null;
  completedPaths: VictoryPathKey[];
  achievedAt: { year: number; month: number; path: VictoryPathKey } | null;
  ending: VictoryEnding | null;
  lastEvaluation: Record<string, { current: number; complete: boolean; details: string[] }>;
};
