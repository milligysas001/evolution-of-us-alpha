"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Origin = "builder" | "hunter" | "healer" | "keeper" | "mediator";
type View = "เมือง" | "คน" | "ก่อสร้าง" | "วิจัย" | "Chronicle" | "ตั้งค่า";
type Stage = "ค่ายพักแรม" | "ชุมชนแรกเริ่ม" | "หมู่บ้านถาวร" | "เมืองเล็ก";
type Season = "ฤดูใบไม้ผลิ" | "ฤดูร้อน" | "ฤดูฝน" | "ฤดูใบไม้ร่วง" | "ฤดูหนาว";
type LaborKey = "forage" | "wood" | "stone" | "build" | "guard" | "care" | "research";
type ResourceKey = "food" | "wood" | "stone" | "tools" | "herbs" | "hides" | "water" | "knowledge" | "fuel" | "ore";
type BuildingKey = "shelter" | "campfire" | "storage" | "well" | "watchPost" | "farmPlot" | "workshop" | "healerHut" | "palisade" | "graveyard" | "meetingHall";
type ResearchKey = "foodPreservation" | "stoneTools" | "woodShelter" | "basicFarming" | "herbalCare" | "watchRoutine" | "simpleCraft" | "waterFinding" | "sanitation" | "storyRecords" | "palisadeCraft";
type LeaderFocusKey = "workWithPeople" | "study" | "trainGuard" | "family" | "scout" | "mediate" | "rationPlan" | "inspectRations" | "leadForage" | "boilHerbs" | "isolateSick" | "nightPatrol" | "trackBeasts" | "campRules" | "holdCouncil" | "memorial" | "firewoodPlan" | "repairTools" | "rainShelter" | "winterWatch" | "quietRest";
type LogKind = "normal" | "good" | "bad" | "death" | "rare" | "milestone";
type MetricKey = "morale" | "security" | "trust" | "health" | "cohesion" | "fairness";
type SkillKey = "hunter" | "builder" | "healer" | "keeper" | "guard" | "farmer" | "child" | "elder";

type Resources = Record<ResourceKey, number>;
type Buildings = Record<BuildingKey, number>;
type ResearchDone = Record<ResearchKey, boolean>;
type Labor = Record<LaborKey, number>;
type Metrics = Record<MetricKey, number>;
type Risks = Record<"food" | "shelter" | "disease" | "beast" | "conflict" | "weather" | "accident", number>;
type PathScores = Record<"survival" | "family" | "knowledge" | "trade" | "fortress" | "faith", number>;
type CrisisLevel = "มั่นคง" | "น่ากังวล" | "วิกฤต" | "ใกล้ล่มสลาย";
type CollapseTrack = { hungerMonths: number; noWorkerMonths: number; trustCrisisMonths: number; assaultCrisisMonths: number; };
type GameOverState = {
  cause: string;
  title: string;
  text: string[];
  survivedText: string;
  finalStats: Array<{ label: string; value: string }>;
} | null;

type Person = {
  id: string;
  name: string;
  age: number;
  kin: string;
  role: string;
  skill: SkillKey;
  health: number;
  morale: number;
  fatigue: number;
  injured: boolean;
  alive: boolean;
  traits: string[];
  cause?: string;
};

type Casualty = {
  id: string;
  year: number;
  month: number;
  name: string;
  age: number;
  cause: string;
  story: string;
};

type LogEntry = {
  id: string;
  year: number;
  month: number;
  title: string;
  text: string;
  kind: LogKind;
  tags: string[];
};

type Memory = {
  id: string;
  year: number;
  month: number;
  title: string;
  text: string;
  effect: string;
  kind: "trauma" | "pride" | "lesson" | "oath" | "loss";
};

type Rumor = {
  id: string;
  title: string;
  detail: string;
  danger: "ต่ำ" | "กลาง" | "สูง";
  discovered: boolean;
};

type Project<T extends string> = { id: T; progress: number } | null;
type DelayedEvent = { id: string; months: number };

type SummaryModal = {
  title: string;
  paragraphs: string[];
  changes: string[];
  kind: LogKind;
} | null;

type GameState = {
  version: "0.9.7";
  leaderName: string;
  houseName: string;
  origin: Origin;
  year: number;
  month: number;
  stage: Stage;
  resources: Resources;
  buildings: Buildings;
  researchDone: ResearchDone;
  construction: Project<BuildingKey>;
  activeResearch: Project<ResearchKey>;
  labor: Labor;
  leaderFocus: LeaderFocusKey;
  selectedChoiceId: string | null;
  currentEventId: string;
  pendingEvents: string[];
  delayedEvents: DelayedEvent[];
  recentEventIds: string[];
  metrics: Metrics;
  people: Person[];
  casualties: Casualty[];
  logs: LogEntry[];
  memories: Memory[];
  rumors: Rumor[];
  leaderTraits: string[];
  milestones: string[];
  flags: Record<string, number | boolean | string>;
  threat: number;
  pathScores: PathScores;
  collapse: CollapseTrack;
  gameOver: GameOverState;
  lastRisk: Risks;
  summaryModal: SummaryModal;
  savedText: string;
};

type Delta = {
  resources?: Partial<Resources>;
  metrics?: Partial<Metrics>;
  path?: Partial<PathScores>;
  threat?: number;
  population?: number;
  wounded?: number;
  casualtyChance?: number;
  risk?: Partial<Risks>;
};

type EventChoice = {
  id: string;
  icon: string;
  title: string;
  tone: string;
  hint: string;
  delta: Delta;
  story: string[];
  addMemory?: Omit<Memory, "id" | "year" | "month">;
  addRumor?: Omit<Rumor, "id" | "discovered">;
  addPending?: string;
  addDelayed?: DelayedEvent;
  setFlag?: string;
  addTrait?: string;
};

type GameEvent = {
  id: string;
  title: string;
  category: string;
  text: string;
  rare?: boolean;
  condition?: (game: GameState) => boolean;
  weight: (game: GameState) => number;
  choices: EventChoice[];
};

const views: View[] = ["เมือง", "คน", "ก่อสร้าง", "วิจัย", "Chronicle", "ตั้งค่า"];
const seasons: Season[] = ["ฤดูใบไม้ผลิ", "ฤดูใบไม้ผลิ", "ฤดูร้อน", "ฤดูร้อน", "ฤดูฝน", "ฤดูฝน", "ฤดูฝน", "ฤดูใบไม้ร่วง", "ฤดูใบไม้ร่วง", "ฤดูหนาว", "ฤดูหนาว", "ฤดูหนาว"];
const saveKey = "eou-v097-save";
const setupKey = "eou-v097-setup";
const tutorialKey = "eou-v097-tutorial-seen";

const laborMeta: Array<{ id: LaborKey; icon: string; title: string; text: string }> = [
  { id: "forage", icon: "🌾", title: "หาอาหาร / ล่าสัตว์", text: "อาหารมากขึ้น แต่เสี่ยงอุบัติเหตุในป่าและสัตว์ร้าย" },
  { id: "wood", icon: "🪵", title: "ตัดไม้", text: "ใช้สร้างที่พัก คลัง รั้ว ไฟ และซ่อมเครื่องมือ" },
  { id: "stone", icon: "🪨", title: "เก็บหิน", text: "ใช้บ่อน้ำ กองไฟ คลัง และสิ่งก่อสร้างที่คงทน" },
  { id: "build", icon: "🛖", title: "ก่อสร้าง", text: "เร่งโครงการ แต่เสี่ยงลื่น ตก บาดเจ็บเมื่อเครื่องมือไม่ดี" },
  { id: "guard", icon: "🛡️", title: "เฝ้ายาม", text: "ลดสัตว์ป่า โจร และความกลัวตอนกลางคืน" },
  { id: "care", icon: "🌿", title: "ดูแลคนป่วย", text: "รักษาผู้บาดเจ็บ ลดโรค ลดโอกาสเสียชีวิตจากแผลติดเชื้อ" },
  { id: "research", icon: "📜", title: "ทดลอง / เรียนรู้", text: "เพิ่มความรู้ วิจัยภูมิปัญญาพื้นฐาน และลดความเสี่ยงระยะยาว" },
];

type LeaderAction = { id: LeaderFocusKey; icon: string; title: string; text: string; reason?: string; locked?: boolean; lockReason?: string; priority?: number; };

const leaderFocuses: LeaderAction[] = [
  { id: "workWithPeople", icon: "🤲", title: "ลงมือกับชาวบ้าน", text: "เพิ่มความไว้ใจและลดความเหนื่อยใจของแรงงาน" },
  { id: "study", icon: "📖", title: "ศึกษาภูมิปัญญา", text: "เพิ่มความรู้และเร่งวิจัยเล็กน้อย" },
  { id: "trainGuard", icon: "⚔️", title: "ฝึกเวรยาม", text: "เพิ่มความปลอดภัย ลดสัตว์ป่าและภัยคนเร่ร่อน" },
  { id: "family", icon: "🏡", title: "ดูแลครอบครัว", text: "เพิ่มกำลังใจและโอกาสเกิดความทรงจำสายเลือด" },
  { id: "scout", icon: "🧭", title: "สำรวจพื้นที่", text: "เปิดข่าวลือ ทรัพยากร และ เหตุการณ์ต่อเนื่อง ใหม่ แต่เสี่ยงบาดเจ็บ" },
  { id: "mediate", icon: "⚖️", title: "ไกล่เกลี่ยข้อขัดแย้ง", text: "เพิ่มความยุติธรรมและลดการทะเลาะเรื่องเสบียง" },
  { id: "rationPlan", icon: "📦", title: "วางแผนเสบียง", text: "ลดอาหารเสียและความเสี่ยงอดอาหาร แต่คนอาจรู้สึกเข้มงวด" },
];



function makeLeaderAction(id: LeaderFocusKey, icon: string, title: string, text: string, reason: string, priority = 50, locked = false, lockReason?: string): LeaderAction {
  return { id, icon, title, text, reason, priority, locked, lockReason };
}

function dynamicLeaderActions(game: GameState, event: GameEvent): LeaderAction[] {
  const risk = riskPreview(game);
  const season = seasonOf(game.month);
  const recentDeaths = game.casualties.filter((c) => (game.year - c.year) * 12 + (game.month - c.month) <= 3).length;
  const actions: LeaderAction[] = [
    { ...leaderFocuses.find((f) => f.id === "workWithPeople")!, reason: "เป็นการกระทำพื้นฐานที่ช่วยให้แรงงานยังเชื่อว่าผู้นำไม่ได้สั่งจากระยะไกล", priority: 30 },
    { ...leaderFocuses.find((f) => f.id === "study")!, reason: "เหมาะเมื่ออยากเร่งภูมิปัญญาและปลดล็อกทางรอดระยะยาว", priority: 25 },
    { ...leaderFocuses.find((f) => f.id === "trainGuard")!, reason: "เป็นทางเลือกปลอดภัยเมื่อค่ายยังไม่มีแนวป้องกันที่มั่นคง", priority: 24 },
    { ...leaderFocuses.find((f) => f.id === "scout")!, reason: "เปิดข่าวลือและเหตุการณ์ต่อเนื่อง แต่อาจเพิ่มความเสี่ยงให้ผู้นำ", priority: 20 },
  ];

  if (risk.food >= 45 || game.resources.food < foodNeedFor(game) * 2 || event.category.includes("อาหาร")) {
    actions.push(makeLeaderAction("inspectRations", "📦", "ตรวจคลังและนับเสบียงต่อหน้าทุกคน", "ลดความสับสนเรื่องอาหาร เพิ่มความยุติธรรม แต่ทำให้คนรู้ว่าค่ายตึงมือเพียงใด", "ขึ้นมาเพราะเสบียงกำลังเป็นจุดเสี่ยงของเดือนนี้", 95));
    actions.push(makeLeaderAction("leadForage", "🌾", "นำคนออกหาอาหารด้วยตนเอง", "เพิ่มอาหารทันที แต่ผู้นำและพรานเสี่ยงบาดเจ็บจากป่า", "เหมาะเมื่ออาหารไม่พอหรือใกล้ฤดูที่ผลิตอาหารยาก", 88));
  }
  if (woundedCount(game) > 0 || risk.disease >= 42 || event.category.includes("โรค") || event.title.includes("ไข้")) {
    const locked = game.resources.herbs < 2 && game.buildings.healerHut === 0;
    actions.push(makeLeaderAction("boilHerbs", "🌿", "ต้มสมุนไพรแจกทั้งค่าย", "ช่วยลดไข้และแผลติดเชื้อ ใช้สมุนไพรหรือความรู้หมอยา", "ขึ้นมาเพราะมีผู้บาดเจ็บ/ความเสี่ยงโรค", 92, locked, "ต้องมีสมุนไพรอย่างน้อย 2 หรือมีกระท่อมหมอยา"));
    actions.push(makeLeaderAction("isolateSick", "🧺", "แยกผู้ป่วยออกจากที่พักรวม", "ลดการแพร่โรค แต่คนบางส่วนรู้สึกโดดเดี่ยวและหวาดกลัว", "ขึ้นมาเพราะสุขาภิบาลและโรคมีความสำคัญในเดือนนี้", 86));
  }
  if (risk.beast >= 40 || game.threat >= 35 || event.category.includes("สัตว์") || event.title.includes("รอยเท้า") || event.title.includes("หมาป่า")) {
    actions.push(makeLeaderAction("nightPatrol", "🌙", "เดินเวรยามกลางคืนกับคนเฝ้าค่าย", "ลดภัยสัตว์ป่าและผู้บุกรุก แต่เพิ่มความเหนื่อยของผู้นำและเวรยาม", "ขึ้นมาเพราะร่องรอยภัยนอกค่ายชัดขึ้น", 94));
    actions.push(makeLeaderAction("trackBeasts", "🐾", "ตามรอยสัตว์ก่อนมันย้อนกลับมา", "อาจได้อาหารและลดภัย แต่มีโอกาสเกิดอุบัติเหตุล่าสัตว์", "เหมาะเมื่อป่ากำลังขยับเข้ามาใกล้กองไฟ", 83));
  }
  if (risk.conflict >= 42 || game.metrics.trust < 45 || game.metrics.fairness < 45 || event.category.includes("ข้อพิพาท") || event.title.includes("ทะเลาะ")) {
    actions.push(makeLeaderAction("campRules", "⚖️", "ตั้งกติกาแบ่งเสบียงอย่างเปิดเผย", "เพิ่มความยุติธรรม ลดคำครหา แต่ผู้ที่เสียประโยชน์อาจไม่พอใจ", "ขึ้นมาเพราะความไว้ใจหรือความยุติธรรมเริ่มสั่นคลอน", 90));
    actions.push(makeLeaderAction("holdCouncil", "🔥", "เรียกประชุมรอบกองไฟ", "เปิดให้คนพูดก่อนความเงียบจะกลายเป็นรอยร้าว", "เหมาะเมื่อค่ายต้องการความสามัคคีมากกว่าคำสั่งแข็ง ๆ", 84));
  }
  if (season === "ฤดูหนาว" || risk.weather >= 55 || game.resources.fuel < alivePeople(game).length) {
    actions.push(makeLeaderAction("firewoodPlan", "🪵", "จัดเวรเก็บฟืนและซ่อมกองไฟ", "เพิ่มฟืนและลดโอกาสหนาวตาย แต่ดึงแรงงานออกจากงานอื่น", "ขึ้นมาเพราะฤดูหนาว/ฟืนกำลังเป็นความเสี่ยง", 93));
    actions.push(makeLeaderAction("winterWatch", "🧣", "ตรวจที่นอนเด็กและผู้เฒ่าก่อนค่ำ", "ช่วยกลุ่มเปราะบาง ลดการป่วยจากหนาว แต่ใช้ฟืนเพิ่มเล็กน้อย", "เหมาะเมื่ออากาศเริ่มกัดกระดูก", 81, game.resources.fuel < 2, "ต้องมีฟืนอย่างน้อย 2"));
  }
  if (season === "ฤดูฝน" || risk.weather >= 50) {
    actions.push(makeLeaderAction("rainShelter", "☔", "ขึงผ้าและซ่อมรอยรั่วก่อนฝนลงหนัก", "ลดโรคและความชื้น ใช้ไม้เล็กน้อย", "ขึ้นมาเพราะฝนและที่พักส่งผลต่อสุขภาพจริง", 78, game.resources.wood < 2, "ต้องมีไม้อย่างน้อย 2"));
  }
  if (risk.accident >= 45 || game.resources.tools <= 2 || event.category.includes("อุบัติเหตุ")) {
    actions.push(makeLeaderAction("repairTools", "🛠️", "ซ่อมเครื่องมือที่เริ่มแตกร้าว", "ลดอุบัติเหตุแรงงานและเพิ่มความมั่นใจของช่าง", "ขึ้นมาเพราะเครื่องมือหรืออุบัติเหตุกำลังน่ากังวล", 82, game.resources.wood < 2, "ต้องมีไม้อย่างน้อย 2 เพื่อซ่อมด้ามและลิ่ม"));
  }
  if (recentDeaths > 0 || game.casualties.length > 0) {
    actions.push(makeLeaderAction("memorial", "🕯️", "กล่าวชื่อผู้จากไปต่อหน้ากองไฟ", "ลดบาดแผลในใจ เพิ่มความสามัคคี และทำให้ความตายไม่กลายเป็นเพียงตัวเลข", "ขึ้นมาเพราะค่ายเพิ่งเผชิญความสูญเสีย", 87, game.casualties.length === 0, "ต้องมีผู้จากไปในพงศาวดารก่อน"));
  }
  if (game.metrics.morale < 38 || alivePeople(game).some((p) => p.alive && p.fatigue > 82)) {
    actions.push(makeLeaderAction("quietRest", "🛌", "สั่งพักงานหนักหนึ่งคืน", "ลดความเหนื่อยและอุบัติเหตุ แต่ผลผลิตเดือนนี้อาจไม่พุ่งสูง", "ขึ้นมาเพราะความเหนื่อยหรือขวัญกำลังใจกำลังต่ำ", 80));
  }

  // ตัวเลือกเฉพาะเหตุการณ์: ทำให้ผู้นำตอบสนองกับเรื่องที่เกิดขึ้นจริงในเดือนนั้น
  if (event.id === "first_night") actions.push(makeLeaderAction("holdCouncil", "🔥", "ให้ทุกคนกล่าวชื่อและหน้าที่ต่อหน้ากองไฟ", "ช่วยให้สิบชีวิตเริ่มจำกันในฐานะชุมชน ไม่ใช่แค่ผู้รอดชีวิตที่ยืนข้างกัน", "ตัวเลือกเฉพาะคืนแรก", 99));
  if (event.title.includes("รอยเท้า") || event.title.includes("หมาป่า")) actions.push(makeLeaderAction("trackBeasts", "🐾", "ให้พรานชี้รอยเท้าแล้วพาคนรุ่นหนุ่มเรียนรู้", "ลดภัยซ้ำในอนาคตและเพิ่มความรู้เรื่องป่า", "ตัวเลือกเฉพาะเหตุการณ์สัตว์ป่า", 98));
  if (event.title.includes("เสบียง") || event.title.includes("อาหาร")) actions.push(makeLeaderAction("inspectRations", "📦", "เปิดถุงเสบียงต่อหน้าคนทั้งค่าย", "ตัดข่าวลือเรื่องการซ่อนอาหาร และบังคับให้ทุกคนเห็นความจริงเดียวกัน", "ตัวเลือกเฉพาะเหตุการณ์เสบียง", 98));

  const map = new Map<LeaderFocusKey, LeaderAction>();
  actions.forEach((a) => {
    const existing = map.get(a.id);
    if (!existing || (a.priority ?? 0) > (existing.priority ?? 0)) map.set(a.id, a);
  });
  const result = Array.from(map.values()).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  const unlocked = result.filter((a) => !a.locked).slice(0, 7);
  const locked = result.filter((a) => a.locked).slice(0, 3);
  return [...unlocked, ...locked];
}



const tutorialSteps = [
  {
    title: "เป้าหมายแรก: รอดให้ครบปีแรก",
    icon: "🔥",
    text: "เจ้าพาครอบครัวและชาวบ้านสิบชีวิตมาตั้งถิ่นฐานใหม่ ที่นี่ไม่มีบ้าน ไม่มีคลัง ไม่มีเส้นทางค้าขาย มีเพียงกองไฟแรกกับการตัดสินใจของเจ้า เป้าหมายแรกไม่ใช่ความรุ่งเรือง แต่คือการมีชีวิตพอจะเห็นฤดูถัดไป",
    bullets: ["สร้างที่พักให้พอ", "เก็บอาหารและฟืนก่อนฤดูหนาว", "อย่าปล่อยให้ผู้บาดเจ็บถูกลืม"]
  },
  {
    title: "ทรัพยากรทุกอย่างมีเหตุผล",
    icon: "🏺",
    text: "อาหารทำให้คนไม่อดตาย ไม้กลายเป็นที่พักและฟืน หินทำให้สิ่งปลูกสร้างมั่นคง เครื่องมือช่วยให้ทำงานเร็วขึ้นแต่มันพังได้ น้ำไม่สะอาดจะพาโรคเข้าค่าย และความรู้คือสิ่งที่ทำให้ความผิดพลาดเดิมไม่เกิดซ้ำ",
    bullets: ["อาหารและน้ำถูกใช้ทุกเดือน", "ฟืนสำคัญมากในฤดูหนาว", "คลังและการถนอมอาหารช่วยลดการสูญเสีย"]
  },
  {
    title: "จัดแรงงานคือหัวใจของทุกเดือน",
    icon: "🧑‍🌾",
    text: "ทุกเดือนเจ้าต้องตัดสินว่าใครจะหาอาหาร ใครจะตัดไม้ ใครจะสร้าง ใครจะเฝ้ายาม และใครจะดูแลคนป่วย หากใช้คนเกินกำลัง ความเหนื่อยจะสะสมและอุบัติเหตุจะตามมา",
    bullets: ["ปุ่มแนะนำแรงงานช่วยจัดตามสถานการณ์", "แรงงานไม่ใช่ประชากรทั้งหมด เด็ก ผู้เฒ่า และคนเจ็บทำงานหนักไม่ได้", "ไม่มีเวรยามคือการเชิญป่าเข้ามาใกล้กองไฟ"]
  },
  {
    title: "ผู้นำต้องตอบสนองต่อสถานการณ์จริง",
    icon: "👑",
    text: "การกระทำของผู้นำจะเปลี่ยนไปตามความเสี่ยงและเหตุการณ์ในเดือนนั้น หากมีโรค จะมีทางเลือกดูแลผู้ป่วย หากมีรอยเท้าหมาป่า จะมีทางเลือกติดตามรอย หากอาหารต่ำ จะมีทางเลือกตรวจคลังหรือออกหาอาหารด้วยตนเอง",
    bullets: ["ตัวเลือกบางอย่างถูกล็อกจนกว่าจะมีทรัพยากรพอ", "คำสั่งผู้นำส่งผลต่อความไว้ใจ ความปลอดภัย สุขภาพ และพงศาวดาร", "เลือกให้เข้ากับปัญหา ไม่ใช่เลือกชุดเดิมทุกเดือน"]
  },
  {
    title: "เหตุการณ์ไม่ใช่การสุ่มลงโทษล้วน ๆ",
    icon: "🌧️",
    text: "เกมจะพยายามบอกสัญญาณล่วงหน้า: ความเสี่ยง ฤดูกาล ข่าวลือ และเหตุการณ์ต่อเนื่อง เห็นหมาป่าเดือนนี้ อาจกลายเป็นการโจมตีเดือนหน้า ปล่อยโรคไว้เดือนนี้ อาจกลายเป็นหลุมศพในฤดูฝน",
    bullets: ["อ่านความเสี่ยงก่อนจบเดือน", "ข่าวลือเปิดเส้นเรื่องใหม่", "บางเหตุการณ์มีผลต่อกันหลายเดือน"]
  },
  {
    title: "แพ้ได้ แต่ความพ่ายแพ้ก็มีเรื่องเล่า",
    icon: "🕯️",
    text: "ถ้าประชากรเหลือศูนย์ ถิ่นฐานจะสิ้นสุดทันที หากอดอาหารต่อเนื่อง ความไว้ใจพัง หรือภัยภายนอกทะลักเข้ามา ค่ายอาจล่มสลายได้เช่นกัน ผู้จากไปจะถูกบันทึกแบบย่อในหน้าหลักและเก็บเต็มในพงศาวดาร",
    bullets: ["ทุกชีวิตมีชื่อ ไม่ใช่แค่ตัวเลข", "Game Over มีหน้าสรุปพงศาวดาร", "เริ่มใหม่ได้ แต่เรื่องราวรอบก่อนจะบอกว่าพังเพราะอะไร"]
  }
];

const buildingData: Record<BuildingKey, { icon: string; title: string; text: string; cost: Partial<Resources>; work: number; capacity?: number; unlock?: (game: GameState) => boolean }> = {
  shelter: { icon: "🛖", title: "ที่พักชั่วคราว", text: "รองรับ 6 คน ลดหนาว ลดฝน ลดโรค และลดความกลัวกลางคืน", cost: { wood: 12, hides: 1 }, work: 22, capacity: 6 },
  campfire: { icon: "🔥", title: "กองไฟกลาง", text: "ให้ความอบอุ่น เป็นที่ประชุม เพิ่มขวัญ และลดโรคจากความชื้น", cost: { wood: 8, stone: 2 }, work: 14 },
  storage: { icon: "🏺", title: "คลังอาหารเล็ก", text: "ลดอาหารเสีย เพิ่มความมั่นคงช่วงฤดูฝนและฤดูหนาว", cost: { wood: 18, stone: 3 }, work: 28 },
  well: { icon: "💧", title: "บ่อน้ำ", text: "น้ำสะอาด ลดโรค เพิ่มสุขาภิบาล และเป็นเงื่อนไขตั้งหมู่บ้าน", cost: { wood: 10, stone: 12 }, work: 40, unlock: (g) => g.researchDone.waterFinding },
  watchPost: { icon: "🏹", title: "หอเฝ้ายาม", text: "ลดสัตว์ป่า โจร และเพิ่มโอกาสเห็นสัญญาณเตือนล่วงหน้า", cost: { wood: 22, tools: 1 }, work: 34, unlock: (g) => g.researchDone.watchRoutine },
  farmPlot: { icon: "🌱", title: "แปลงเพาะปลูก", text: "เพิ่มอาหารฤดูอบอุ่นและทำให้ค่ายเริ่มคิดเรื่องอนาคต", cost: { wood: 12, tools: 1 }, work: 32, unlock: (g) => g.researchDone.basicFarming },
  workshop: { icon: "⚒️", title: "เพิงช่าง", text: "ซ่อมเครื่องมือ เพิ่มผลผลิตไม้/หิน และลดอุบัติเหตุเครื่องมือหัก", cost: { wood: 28, stone: 8, tools: 2 }, work: 50, unlock: (g) => g.researchDone.simpleCraft },
  healerHut: { icon: "🌿", title: "กระท่อมหมอยา", text: "รักษาบาดเจ็บ ลดโรคระบาด ลดการตายจากแผลติดเชื้อ", cost: { wood: 20, herbs: 4 }, work: 36, unlock: (g) => g.researchDone.herbalCare },
  palisade: { icon: "🪵", title: "รั้วไม้รอบค่าย", text: "ลดหมาป่า โจร และช่วยให้เด็กไม่เดินหลงออกจากพื้นที่", cost: { wood: 42, tools: 2 }, work: 62, unlock: (g) => g.researchDone.palisadeCraft },
  graveyard: { icon: "🕯️", title: "ลานฝังศพใต้ต้นโอ๊ก", text: "ลดบาดแผลทางใจหลังความตาย และสร้างความทรงจำร่วม", cost: { stone: 8, wood: 6 }, work: 24 },
  meetingHall: { icon: "⚖️", title: "ศาลาประชุม", text: "ลดความขัดแย้ง เพิ่มกฎร่วม และปลดล็อกเส้นทางชุมชนแรกเริ่ม", cost: { wood: 34, stone: 6 }, work: 54, unlock: (g) => g.stage !== "ค่ายพักแรม" || g.people.filter((p) => p.alive).length >= 14 },
};

const researchData: Record<ResearchKey, { icon: string; title: string; text: string; cost: number; prereq?: ResearchKey[] }> = {
  foodPreservation: { icon: "🏺", title: "การถนอมอาหาร", text: "ลดอาหารเสียและเพิ่มความหมายของคลังอาหาร", cost: 28 },
  stoneTools: { icon: "🪨", title: "เครื่องมือหิน", text: "เพิ่มผลผลิตไม้/หิน ลดเครื่องมือพังจากงานหนัก", cost: 22 },
  woodShelter: { icon: "🛖", title: "ที่พักไม้", text: "ที่พักทนฝนและหนาวดีขึ้น ลดโรคควันและความชื้น", cost: 32, prereq: ["stoneTools"] },
  basicFarming: { icon: "🌱", title: "เพาะปลูกเบื้องต้น", text: "ปลดล็อกแปลงเพาะปลูกและช่วยให้รอดฤดูหนาวระยะยาว", cost: 42, prereq: ["foodPreservation"] },
  herbalCare: { icon: "🌿", title: "สมุนไพรรักษาแผล", text: "ปลดล็อกกระท่อมหมอยา ลดแผลติดเชื้อและไข้ฤดูฝน", cost: 34 },
  watchRoutine: { icon: "🛡️", title: "ระบบเวรยาม", text: "ปลดล็อกหอเฝ้ายาม เพิ่มสัญญาณเตือนก่อนภัยมา", cost: 32 },
  simpleCraft: { icon: "⚒️", title: "งานช่างพื้นฐาน", text: "ปลดล็อกเพิงช่าง ลดอุบัติเหตุจากเครื่องมือเก่า", cost: 46, prereq: ["stoneTools"] },
  waterFinding: { icon: "💧", title: "การหาแหล่งน้ำ", text: "ปลดล็อกบ่อน้ำ ลดโรคน้ำเสีย", cost: 36 },
  sanitation: { icon: "🧼", title: "สุขาภิบาลค่าย", text: "ลดโรคจากคนอยู่แออัด ควัน น้ำสกปรก และอาหารเสีย", cost: 44, prereq: ["waterFinding", "herbalCare"] },
  storyRecords: { icon: "📜", title: "บันทึกความทรงจำ", text: "ทำให้พงศาวดารและความทรงจำส่งผลต่อคนรุ่นต่อไปมากขึ้น", cost: 38 },
  palisadeCraft: { icon: "🪵", title: "รั้วไม้และประตูค่าย", text: "ปลดล็อกรั้วไม้รอบค่าย ลดโจรและสัตว์ป่า", cost: 52, prereq: ["watchRoutine", "simpleCraft"] },
};

function clamp(n: number, min = 0, max = 100) { return Math.max(min, Math.min(max, Math.round(n))); }
function uid(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function seasonOf(month: number): Season { return seasons[(month - 1) % 12]; }
function fmt(n: number) { return Math.round(n).toLocaleString("th-TH"); }
function pct(n: number) { return `${clamp(n)}%`; }
function viewLabel(view: View) { return view === "Chronicle" ? "พงศาวดาร" : view; }
function seasonMood(season: Season) {
  if (season === "ฤดูหนาว") return "ลมหนาวทำให้ทุกการตัดสินใจหนักขึ้นกว่าที่เห็น";
  if (season === "ฤดูฝน") return "ฝนทำให้ดินนุ่ม แต่ก็ทำให้แผลและไข้ไม่ยอมสงบ";
  if (season === "ฤดูร้อน") return "แดดแรงช่วยให้เก็บเกี่ยวได้มากขึ้น หากเสบียงไม่เน่าเสียไปก่อน";
  if (season === "ฤดูใบไม้ร่วง") return "อากาศนิ่งเหมือนเตือนให้ค่ายเตรียมตัวก่อนความหนาวมาเยือน";
  return "ฤดูใบไม้ผลิเปิดทางให้เริ่มต้น แต่ไม่ได้รับประกันว่าทุกชีวิตจะรอด";
}
function choice(id: string, icon: string, title: string, tone: string, hint: string, delta: Delta, story: string[], extra: Partial<EventChoice> = {}): EventChoice {
  return { id, icon, title, tone, hint, delta, story, ...extra };
}
function emptyResearch(): ResearchDone {
  return {
    foodPreservation: false, stoneTools: false, woodShelter: false, basicFarming: false, herbalCare: false,
    watchRoutine: false, simpleCraft: false, waterFinding: false, sanitation: false, storyRecords: false, palisadeCraft: false,
  };
}
function emptyBuildings(): Buildings {
  return { shelter: 0, campfire: 0, storage: 0, well: 0, watchPost: 0, farmPlot: 0, workshop: 0, healerHut: 0, palisade: 0, graveyard: 0, meetingHall: 0 };
}
function baseResources(origin: Origin): Resources {
  const r: Resources = { food: 30, wood: 20, stone: 5, tools: 5, herbs: 2, hides: 1, water: 20, knowledge: 0, fuel: 8, ore: 0 };
  if (origin === "builder") { r.wood += 12; r.tools += 1; }
  if (origin === "hunter") { r.food += 12; r.hides += 2; }
  if (origin === "healer") { r.herbs += 6; }
  if (origin === "keeper") { r.knowledge += 10; }
  return r;
}
function initialPeople(leaderName: string, houseName: string, origin: Origin): Person[] {
  const leaderSkill: SkillKey = origin === "hunter" ? "hunter" : origin === "healer" ? "healer" : origin === "keeper" ? "keeper" : origin === "mediator" ? "guard" : "builder";
  return [
    { id: "leader", name: leaderName, age: 28, kin: `House ${houseName}`, role: "ผู้นำค่าย", skill: leaderSkill, health: 86, morale: 70, fatigue: 0, injured: false, alive: true, traits: ["ผู้ก่อตั้ง"] },
    { id: "tovin", name: "Tovin", age: 34, kin: "ชาวบ้าน", role: "ช่างไม้", skill: "builder", health: 78, morale: 58, fatigue: 0, injured: false, alive: true, traits: ["มือหนัก", "เงียบ"] },
    { id: "kael", name: "Kael", age: 23, kin: "ชาวบ้าน", role: "พราน", skill: "hunter", health: 82, morale: 62, fatigue: 0, injured: false, alive: true, traits: ["ใจร้อน", "อ่านรอยเก่ง"] },
    { id: "elna", name: "Elna", age: 31, kin: "ชาวบ้าน", role: "คนครัว", skill: "farmer", health: 76, morale: 65, fatigue: 0, injured: false, alive: true, traits: ["ใจดี"] },
    { id: "old-ren", name: "Old Ren", age: 67, kin: "ผู้เฒ่า", role: "ผู้รู้สมุนไพร", skill: "elder", health: 54, morale: 60, fatigue: 0, injured: false, alive: true, traits: ["จำเรื่องเก่า"] },
    { id: "mara", name: "Mara", age: 19, kin: "ชาวบ้าน", role: "เวรยามฝึกหัด", skill: "guard", health: 80, morale: 55, fatigue: 0, injured: false, alive: true, traits: ["กล้าหาญ"] },
    { id: "sela", name: "Sela", age: 26, kin: "ชาวบ้าน", role: "ผู้ดูแลเด็ก", skill: "healer", health: 74, morale: 67, fatigue: 0, injured: false, alive: true, traits: ["ละเอียดอ่อน"] },
    { id: "orin", name: "Orin", age: 41, kin: "ชาวบ้าน", role: "คนเก็บหิน", skill: "builder", health: 72, morale: 52, fatigue: 0, injured: false, alive: true, traits: ["อดทน"] },
    { id: "lina", name: "Lina", age: 9, kin: `House ${houseName}`, role: "เด็ก", skill: "child", health: 70, morale: 66, fatigue: 0, injured: false, alive: true, traits: ["ช่างสังเกต"] },
    { id: "pim", name: "Pim", age: 6, kin: "ชาวบ้าน", role: "เด็ก", skill: "child", health: 68, morale: 68, fatigue: 0, injured: false, alive: true, traits: ["รักนิทาน"] },
  ];
}
function adultWorkers(game: GameState) {
  return game.people.filter((p) => p.alive && p.age >= 16 && p.age < 62 && !p.injured && p.health > 28).length;
}
function alivePeople(game: GameState) { return game.people.filter((p) => p.alive); }
function childrenCount(game: GameState) { return alivePeople(game).filter((p) => p.age < 16).length; }
function eldersCount(game: GameState) { return alivePeople(game).filter((p) => p.age >= 62).length; }
function woundedCount(game: GameState) { return alivePeople(game).filter((p) => p.injured || p.health < 45).length; }
function shelterCapacity(game: GameState) {
  const base = game.buildings.shelter * (game.researchDone.woodShelter ? 8 : 6);
  return base + (game.buildings.meetingHall > 0 ? 4 : 0);
}
function laborTotal(labor: Labor) { return Object.values(labor).reduce((a, b) => a + b, 0); }
function normalizeLabor(game: GameState): Labor {
  const available = adultWorkers(game);
  const copy: Labor = { ...game.labor };
  while (laborTotal(copy) > available) {
    const keys = Object.keys(copy) as LaborKey[];
    const key = keys.reduce((a, b) => copy[a] > copy[b] ? a : b);
    copy[key] = Math.max(0, copy[key] - 1);
  }
  return copy;
}
function addLog(game: GameState, title: string, text: string, kind: LogKind = "normal", tags: string[] = []): GameState {
  const log: LogEntry = { id: uid("log"), year: game.year, month: game.month, title, text, kind, tags };
  return { ...game, logs: [log, ...game.logs].slice(0, 240) };
}
function addMemory(game: GameState, mem: Omit<Memory, "id" | "year" | "month">): GameState {
  const memory: Memory = { id: uid("mem"), year: game.year, month: game.month, ...mem };
  return { ...game, memories: [memory, ...game.memories].slice(0, 80) };
}
function changeResources(resources: Resources, delta?: Partial<Resources>): Resources {
  const r = { ...resources };
  if (!delta) return r;
  (Object.keys(delta) as ResourceKey[]).forEach((key) => { r[key] = Math.max(0, Math.round((r[key] ?? 0) + (delta[key] ?? 0))); });
  return r;
}
function changeMetrics(metrics: Metrics, delta?: Partial<Metrics>): Metrics {
  const m = { ...metrics };
  if (!delta) return m;
  (Object.keys(delta) as MetricKey[]).forEach((key) => { m[key] = clamp((m[key] ?? 0) + (delta[key] ?? 0)); });
  return m;
}
function hasCost(game: GameState, cost: Partial<Resources>) {
  return (Object.keys(cost) as ResourceKey[]).every((key) => game.resources[key] >= (cost[key] ?? 0));
}
function payCost(game: GameState, cost: Partial<Resources>): GameState {
  return { ...game, resources: changeResources(game.resources, Object.fromEntries(Object.entries(cost).map(([k, v]) => [k, -(v ?? 0)])) as Partial<Resources>) };
}
function researchUnlocked(game: GameState, id: ResearchKey) {
  const prereq = researchData[id].prereq ?? [];
  return prereq.every((p) => game.researchDone[p]);
}
function buildingUnlocked(game: GameState, id: BuildingKey) {
  const test = buildingData[id].unlock;
  return test ? test(game) : true;
}
function stageเป้าหมายs(game: GameState): Array<{ text: string; done: boolean }> {
  if (game.stage === "ค่ายพักแรม") return [
    { text: "ประชากรยังมีชีวิตอย่างน้อย 8 คน", done: alivePeople(game).length >= 8 },
    { text: "อาหารสำรอง 45+", done: game.resources.food >= 45 },
    { text: "ที่พักรองรับอย่างน้อย 10 คน", done: shelterCapacity(game) >= 10 },
    { text: "กองไฟกลาง 1", done: game.buildings.campfire >= 1 },
    { text: "ความปลอดภัย 35+", done: game.metrics.security >= 35 },
  ];
  if (game.stage === "ชุมชนแรกเริ่ม") return [
    { text: "ประชากร 15+", done: alivePeople(game).length >= 15 },
    { text: "บ่อน้ำ 1", done: game.buildings.well >= 1 },
    { text: "คลังอาหาร 1", done: game.buildings.storage >= 1 },
    { text: "แปลงเพาะปลูก 2", done: game.buildings.farmPlot >= 2 },
    { text: "ความไว้ใจ 50+", done: game.metrics.trust >= 50 },
  ];
  if (game.stage === "หมู่บ้านถาวร") return [
    { text: "ประชากร 30+", done: alivePeople(game).length >= 30 },
    { text: "เพิงช่าง 1", done: game.buildings.workshop >= 1 },
    { text: "หอเฝ้ายามหรือรั้วไม้", done: game.buildings.watchPost >= 1 || game.buildings.palisade >= 1 },
    { text: "ศาลาประชุม 1", done: game.buildings.meetingHall >= 1 },
    { text: "สุขภาพชุมชน 60+", done: game.metrics.health >= 60 },
  ];
  return [
    { text: "เมืองยังยืนอยู่", done: alivePeople(game).length > 0 },
    { text: "พงศาวดารมีบันทึก 50+ รายการ", done: game.logs.length >= 50 },
  ];
}
function maybeAdvanceStage(game: GameState): GameState {
  const allDone = stageเป้าหมายs(game).every((o) => o.done);
  if (!allDone) return game;
  const next: Record<Stage, Stage> = { "ค่ายพักแรม": "ชุมชนแรกเริ่ม", "ชุมชนแรกเริ่ม": "หมู่บ้านถาวร", "หมู่บ้านถาวร": "เมืองเล็ก", "เมืองเล็ก": "เมืองเล็ก" };
  const nextStage = next[game.stage];
  if (nextStage === game.stage) return game;
  let g = { ...game, stage: nextStage, metrics: changeMetrics(game.metrics, { morale: 8, trust: 6, cohesion: 4 }), milestones: [...game.milestones, `stage-${nextStage}`] };
  g = addLog(g, `ก้าวสู่${nextStage}`, `ผู้คนไม่เรียกที่นี่ว่าแค่ค่ายอีกต่อไป เงื่อนไขพื้นฐานถูกเติมเต็ม และชื่อของ House ${g.houseName} เริ่มผูกกับผืนดินนี้อย่างช้า ๆ`, "milestone", ["Stage"]);
  g = addMemory(g, { title: `วันที่กลายเป็น${nextStage}`, text: `จากสิบชีวิตที่ไม่แน่ใจว่าจะรอด กลุ่มคนของ ${g.leaderName} ได้ข้ามเส้นสำคัญของการตั้งถิ่นฐาน`, effect: "+ขวัญกำลังใจถาวร และปลดล็อกเหตุการณ์สังคมที่ซับซ้อนขึ้น", kind: "pride" });
  return g;
}
function riskPreview(game: GameState): Risks {
  const pop = alivePeople(game).length || 1;
  const available = adultWorkers(game) || 1;
  const labor = normalizeLabor(game);
  const shelterShort = Math.max(0, pop - shelterCapacity(game));
  const foodNeed = foodNeedFor(game);
  const season = seasonOf(game.month);
  return {
    food: clamp(20 + (foodNeed > game.resources.food ? 35 : 0) + (game.resources.food < foodNeed * 1.6 ? 18 : 0) - game.buildings.storage * 8 - labor.forage * 3),
    shelter: clamp(16 + shelterShort * 8 + (season === "ฤดูหนาว" ? 18 : 0) + (season === "ฤดูฝน" ? 12 : 0) - game.buildings.campfire * 5),
    disease: clamp(18 + woundedCount(game) * 8 + shelterShort * 4 + (game.buildings.well ? -12 : 10) + (season === "ฤดูฝน" ? 16 : 0) - labor.care * 8 - (game.researchDone.sanitation ? 14 : 0)),
    beast: clamp(18 + (labor.forage >= 4 ? 16 : 0) + (game.metrics.security < 40 ? 18 : 0) - labor.guard * 9 - game.buildings.watchPost * 9 - game.buildings.palisade * 14),
    conflict: clamp(15 + (game.metrics.trust < 45 ? 16 : 0) + (game.metrics.fairness < 45 ? 14 : 0) + (game.resources.food < foodNeed ? 18 : 0) - (game.leaderFocus === "mediate" ? 12 : 0)),
    weather: clamp(12 + (season === "ฤดูหนาว" ? 25 : 0) + (season === "ฤดูฝน" ? 18 : 0) + shelterShort * 4 - game.buildings.shelter * 4 - game.buildings.campfire * 3),
    accident: clamp(10 + labor.build * 6 + labor.stone * 4 + labor.forage * 3 + Math.max(0, laborTotal(labor) - available) * 8 - game.buildings.workshop * 8 - (game.researchDone.stoneTools ? 5 : 0)),
  };
}
function riskLabel(value: number) { return value >= 70 ? "สูงมาก" : value >= 50 ? "สูง" : value >= 30 ? "กลาง" : "ต่ำ"; }

function crisisScore(game: GameState) {
  const risk = riskPreview(game);
  const need = foodNeedFor(game);
  const foodShort = game.resources.food < need ? 24 : game.resources.food < need * 1.5 ? 12 : 0;
  const fuelShort = seasonOf(game.month) === "ฤดูหนาว" && game.resources.fuel < alivePeople(game).length ? 16 : 0;
  const noWorkers = adultWorkers(game) === 0 && alivePeople(game).length > 0 ? 22 : 0;
  const social = game.metrics.trust < 25 ? 18 : game.metrics.trust < 40 ? 8 : 0;
  const threat = game.threat > 80 ? 16 : game.threat > 60 ? 8 : 0;
  return clamp(Math.round((risk.food + risk.disease + risk.beast + risk.conflict + risk.weather) / 8) + foodShort + fuelShort + noWorkers + social + threat);
}
function crisisLevel(game: GameState): CrisisLevel {
  const score = crisisScore(game);
  if (score >= 78) return "ใกล้ล่มสลาย";
  if (score >= 58) return "วิกฤต";
  if (score >= 35) return "น่ากังวล";
  return "มั่นคง";
}
function collapseReasonLines(game: GameState) {
  const need = foodNeedFor(game);
  const lines: string[] = [];
  if (alivePeople(game).length <= 0) lines.push("ไม่มีผู้รอดชีวิตเหลืออยู่");
  if (game.resources.food < need) lines.push(`อาหารมี ${game.resources.food} แต่ต้องใช้ประมาณ ${need} ต่อเดือน`);
  if (adultWorkers(game) <= 0 && alivePeople(game).length > 0) lines.push("ยังมีคนอยู่ แต่ไม่มีแรงงานที่พอจะออกทำงานได้");
  if (game.metrics.trust <= 8 && game.metrics.cohesion <= 18) lines.push("ความไว้ใจต่อผู้นำและความสามัคคีแตกจนแทบไม่เหลือ");
  if (game.threat >= 92 && game.metrics.security <= 18) lines.push("ภัยภายนอกสูงเกินกำลังป้องกันของค่าย");
  if (lines.length === 0) lines.push("วิกฤตหลายอย่างสะสมจนค่ายเริ่มเสียหลัก");
  return lines;
}
function makeGameOver(game: GameState, cause: string, title: string, text: string[]): GameOverState {
  const years = game.year - 1;
  const months = game.month;
  const maxPop = Math.max(alivePeople(game).length, game.people.length);
  return {
    cause,
    title,
    text,
    survivedText: `${years > 0 ? `${years} ปี ` : ""}${months} เดือน`,
    finalStats: [
      { label: "อยู่รอด", value: `${years > 0 ? `${years} ปี ` : ""}${months} เดือน` },
      { label: "ประชากรสุดท้าย", value: `${alivePeople(game).length} คน` },
      { label: "ประชากรสูงสุดที่บันทึก", value: `${maxPop} คน` },
      { label: "ผู้จากไป", value: `${game.casualties.length} คน` },
      { label: "สิ่งก่อสร้าง", value: `${Object.values(game.buildings).reduce((a, b) => a + b, 0)} หลัง/แห่ง` },
      { label: "ความทรงจำ", value: `${game.memories.length} เรื่อง` },
      { label: "สาเหตุการล่มสลาย", value: cause },
    ],
  };
}
function updateCollapseAndGameOver(game: GameState): GameState {
  if (game.gameOver) return game;
  const need = foodNeedFor(game);
  const alive = alivePeople(game).length;
  const workers = adultWorkers(game);
  const hunger = game.resources.food < need ? game.collapse.hungerMonths + 1 : 0;
  const noWorker = alive > 0 && workers === 0 ? game.collapse.noWorkerMonths + 1 : 0;
  const trustCrisis = game.metrics.trust <= 8 && game.metrics.cohesion <= 18 ? game.collapse.trustCrisisMonths + 1 : 0;
  const assault = game.threat >= 92 && game.metrics.security <= 18 ? game.collapse.assaultCrisisMonths + 1 : 0;
  let g: GameState = { ...game, collapse: { hungerMonths: hunger, noWorkerMonths: noWorker, trustCrisisMonths: trustCrisis, assaultCrisisMonths: assault } };
  const lines = collapseReasonLines(g);
  if (alive <= 0) {
    return { ...g, gameOver: makeGameOver(g, "ประชากรสูญสิ้น", "กองไฟสุดท้ายดับลง", ["ไม่มีเสียงคนเหลืออยู่ในค่ายอีกต่อไป เหลือเพียงเถ้าดำ ลมเย็น และรอยเท้าที่ค่อย ๆ ถูกฝนลบออกจากดิน", "ชื่อของตระกูลถูกทิ้งไว้ในพงศาวดารรอบสุดท้าย ราวกับคำถามที่ไม่มีใครเหลือพอจะตอบ", ...lines]) };
  }
  if (hunger >= 4) {
    return { ...g, gameOver: makeGameOver(g, "ความอดอยากต่อเนื่อง", "ฤดูที่ไม่มีใครเหลือแรงร้องขอ", ["ความหิวไม่ได้มาถึงในคืนเดียว มันค่อย ๆ กัดเสียงหัวเราะ กัดความไว้ใจ และกัดความเป็นคนออกไปทีละชิ้น", "เมื่อเสบียงไม่พอหลายเดือนติด ค่ายไม่แตกเพราะศัตรู แตกร้าวเพราะหม้อที่ว่างเปล่า", ...lines]) };
  }
  if (trustCrisis >= 3) {
    return { ...g, gameOver: makeGameOver(g, "ผู้นำถูกขับออก", "คืนที่ทุกคนยืนเงียบหน้ากองไฟ", ["ไม่มีใครตะโกน ไม่มีใครชักดาบ มีเพียงสายตาของผู้คนที่ไม่อาจฝากชีวิตไว้ในมือเดิมได้อีก", `พวกเขาเอ่ยชื่อ ${g.leaderName} เป็นครั้งสุดท้ายในฐานะผู้นำ แล้วขอให้จากไปก่อนรุ่งสาง`, ...lines]) };
  }
  if (assault >= 2) {
    return { ...g, gameOver: makeGameOver(g, "ค่ายแตกจากภัยภายนอก", "ประตูค่ายที่ไม่เคยสร้างเสร็จ", ["เสียงเห่า เสียงตะโกน และเสียงไม้หักรวมกันเป็นคืนเดียวที่ยาวเกินกว่าค่ายเล็ก ๆ จะรับไหว", "เมื่อความปลอดภัยต่ำและภัยภายนอกสูงเกินขีดจำกัด สิ่งที่สร้างมาถูกพัดกระจายไปพร้อมความกลัว", ...lines]) };
  }
  if (noWorker >= 4 && g.resources.food < need * 1.2) {
    return { ...g, gameOver: makeGameOver(g, "ไร้แรงงานและหมดทางรอด", "ค่ายที่ยังมีลมหายใจ แต่ไม่มีมือพอจะยกมันขึ้น", ["ยังมีคนบางคนหายใจอยู่ แต่ไม่มีใครเหลือแรงพอจะออกหาอาหาร ตัดไม้ หรือซ่อมหลังคาที่รั่ว", "ความอยู่รอดไม่ใช่เพียงจำนวนชีวิต แต่คือมือที่ยังสามารถทำงานเพื่อวันพรุ่งนี้", ...lines]) };
  }
  return g;
}

function foodNeedFor(game: GameState) {
  const alive = alivePeople(game);
  return Math.ceil(alive.reduce((sum, p) => sum + (p.age < 16 ? 1 : p.age >= 62 ? 1.4 : 2) + (p.injured ? 0.4 : 0), 0));
}

function populationBreakdown(game: GameState) {
  const alive = alivePeople(game);
  return {
    total: alive.length,
    children: alive.filter((p) => p.age < 16).length,
    teens: alive.filter((p) => p.age >= 12 && p.age < 16).length,
    adults: alive.filter((p) => p.age >= 16 && p.age < 62).length,
    elders: alive.filter((p) => p.age >= 62).length,
    injured: alive.filter((p) => p.injured).length,
    sick: alive.filter((p) => p.health > 0 && p.health < 45).length,
    exhausted: alive.filter((p) => p.fatigue >= 70).length,
    workers: adultWorkers(game),
  };
}
function skillCount(game: GameState, skill: SkillKey) {
  return alivePeople(game).filter((p) => p.skill === skill && p.age >= 16 && p.age < 62 && !p.injured && p.health > 40).length;
}
function qualityStatus(game: GameState) {
  const foodQuality = clamp(42 + game.buildings.storage * 14 + (game.researchDone.foodPreservation ? 18 : 0) - (seasonOf(game.month) === "ฤดูฝน" ? 8 : 0) - (seasonOf(game.month) === "ฤดูร้อน" ? 6 : 0));
  const waterQuality = clamp(38 + game.buildings.well * 28 + (game.researchDone.waterFinding ? 8 : 0) + (game.researchDone.sanitation ? 12 : 0) - (seasonOf(game.month) === "ฤดูฝน" ? 8 : 0));
  const shelterQuality = clamp(28 + game.buildings.shelter * 9 + game.buildings.campfire * 8 + (game.researchDone.woodShelter ? 14 : 0) - Math.max(0, alivePeople(game).length - shelterCapacity(game)) * 4);
  return { foodQuality, waterQuality, shelterQuality };
}
function nextMonthForecast(game: GameState) {
  const next = game.month === 12 ? 1 : game.month + 1;
  const season = seasonOf(next);
  const lines: string[] = [`เดือนหน้าเข้าสู่${season}`];
  if (season === "ฤดูหนาว") lines.push("ต้องเตรียมฟืนและอาหารสำรองมากขึ้น ผลผลิตจากป่าจะลดลง");
  if (season === "ฤดูฝน") lines.push("น้ำหาได้ง่ายขึ้น แต่โรค บ้านรั่ว และอาหารเสียเพิ่มขึ้น");
  if (season === "ฤดูร้อน") lines.push("หาอาหารดีขึ้น แต่เสี่ยงอาหารเสีย แมลง และน้ำลด");
  if (season === "ฤดูใบไม้ผลิ") lines.push("เหมาะกับสำรวจ ซ่อมแซม และเริ่มเพาะปลูก");
  if (season === "ฤดูใบไม้ร่วง") lines.push("เหมาะกับสะสมอาหารและฟืนก่อนฤดูหนาว");
  if (game.threat > 45) lines.push("ภัยภายนอกสูง ควรมีเวรยามหรือรั้วก่อนค่ายดูมั่งคั่งเกินไป");
  if (woundedCount(game) > 0) lines.push("มีผู้ป่วย/บาดเจ็บ ควรจัดคนดูแลเพื่อลดแผลติดเชื้อ");
  return lines;
}
function riskReasons(game: GameState, risk: Risks) {
  const reasons: Record<keyof Risks, string[]> = { food: [], shelter: [], disease: [], beast: [], conflict: [], weather: [], accident: [] };
  const need = foodNeedFor(game);
  const pop = alivePeople(game).length;
  const shortShelter = Math.max(0, pop - shelterCapacity(game));
  if (game.resources.food < need * 1.5) reasons.food.push(`อาหารเหลือ ${game.resources.food} แต่ต้องใช้เดือนละประมาณ ${need}`);
  if (game.labor.forage <= 1) reasons.food.push("คนหาอาหารน้อย");
  if (game.buildings.storage === 0) reasons.food.push("ยังไม่มีคลังอาหาร ทำให้อาหารเสียได้ง่าย");
  if (shortShelter > 0) reasons.shelter.push(`ที่พักขาดสำหรับ ${shortShelter} คน`);
  if (seasonOf(game.month) === "ฤดูหนาว" || seasonOf(game.month) === "ฤดูฝน") reasons.shelter.push(`${seasonOf(game.month)}ทำให้ที่พักมีความหมายต่อชีวิตมากขึ้น`);
  if (woundedCount(game) > 0) reasons.disease.push(`มีผู้บาดเจ็บ/ป่วย ${woundedCount(game)} คน`);
  if (game.buildings.well === 0) reasons.disease.push("ยังไม่มีบ่อน้ำสะอาด");
  if (game.labor.care === 0 && woundedCount(game) > 0) reasons.disease.push("ไม่มีแรงงานดูแลคนป่วย");
  if (game.labor.forage >= 4) reasons.beast.push("ส่งคนเข้าป่าหลายคน");
  if (game.labor.guard === 0) reasons.beast.push("ไม่มีเวรยามเดือนนี้");
  if (game.metrics.security < 40) reasons.beast.push("ความปลอดภัยค่ายต่ำ");
  if (game.resources.food < need) reasons.conflict.push("เสบียงไม่พอ ทำให้เกิดข้อพิพาทง่าย");
  if (game.metrics.fairness < 45) reasons.conflict.push("ความยุติธรรมต่ำ");
  if (game.metrics.trust < 45) reasons.conflict.push("ความไว้ใจต่อผู้นำต่ำ");
  if (seasonOf(game.month) === "ฤดูหนาว") reasons.weather.push("ฤดูหนาวเพิ่มความเสี่ยงหนาวตายและทำให้ฟืนหมดเร็วกว่าปกติ");
  if (seasonOf(game.month) === "ฤดูฝน") reasons.weather.push("ฤดูฝนทำให้งานล่าช้า แผลหายช้า และไข้แพร่ได้ง่าย");
  if (game.labor.build >= 3) reasons.accident.push("งานก่อสร้างหนัก");
  if (game.labor.stone >= 2) reasons.accident.push("เก็บหินมีโอกาสลื่น/ของตก");
  if (game.resources.tools <= 2) reasons.accident.push("เครื่องมือน้อยหรือเก่า");
  (Object.keys(reasons) as Array<keyof Risks>).forEach((key) => {
    if (reasons[key].length === 0) reasons[key].push(risk[key] >= 50 ? "มีปัจจัยเสี่ยงสะสมหลายอย่าง" : "ยังควบคุมได้");
  });
  return reasons;
}
function recommendedLabor(game: GameState): Labor {
  let workers = adultWorkers(game);
  const labor: Labor = { forage: 0, wood: 0, stone: 0, build: 0, guard: 0, care: 0, research: 0 };
  const assign = (key: LaborKey, count: number) => {
    const n = Math.max(0, Math.min(workers, count));
    labor[key] += n;
    workers -= n;
  };
  if (woundedCount(game) > 0) assign("care", Math.min(2, woundedCount(game)));
  if (game.resources.food < foodNeedFor(game) * 2) assign("forage", 3); else assign("forage", 2);
  if (game.resources.fuel < alivePeople(game).length && seasonOf(game.month) === "ฤดูหนาว") assign("wood", 2);
  if (riskPreview(game).beast > 45 || game.threat > 35) assign("guard", 1);
  if (game.construction) assign("build", 2); else if (game.buildings.shelter === 0 || shelterCapacity(game) < alivePeople(game).length) assign("build", 1);
  if (game.resources.wood < 18) assign("wood", 1);
  if (game.resources.stone < 8) assign("stone", 1);
  if (game.activeResearch) assign("research", 1); else if (game.resources.knowledge < 25) assign("research", 1);
  const fallback: LaborKey[] = ["forage", "wood", "build", "guard", "research", "stone", "care"];
  let i = 0;
  while (workers > 0) { labor[fallback[i % fallback.length]] += 1; workers--; i++; }
  return labor;
}
function resourceLedger(game: GameState) {
  const l = normalizeLabor(game);
  const season = seasonOf(game.month);
  const warmFood = season === "ฤดูใบไม้ผลิ" || season === "ฤดูร้อน" || season === "ฤดูใบไม้ร่วง";
  const forageRate = (season === "ฤดูหนาว" ? 3 : season === "ฤดูฝน" ? 4 : 5) + (game.origin === "hunter" ? 1 : 0) + game.buildings.farmPlot * (warmFood ? 1.5 : 0.4) + skillCount(game, "hunter") * 0.35;
  const woodRate = 5 + (game.researchDone.stoneTools ? 1 : 0) + (game.buildings.workshop ? 1.2 : 0) + skillCount(game, "builder") * 0.25;
  const stoneRate = 2.5 + (game.researchDone.stoneTools ? 0.8 : 0) + (game.buildings.workshop ? 0.7 : 0) + skillCount(game, "builder") * 0.15;
  const researchRate = 4 + (game.origin === "keeper" ? 1 : 0) + (game.leaderFocus === "study" ? 2 : 0) + skillCount(game, "keeper") * 0.35;
  const foodProd = Math.round(l.forage * forageRate);
  const woodProd = Math.round(l.wood * woodRate);
  const stoneProd = Math.round(l.stone * stoneRate);
  const knowledgeProd = Math.round(l.research * researchRate + (game.leaderFocus === "study" ? 4 : 0));
  const fuelProd = Math.floor(l.wood * 1.4);
  const foodUse = foodNeedFor(game);
  const waterUse = Math.ceil(alivePeople(game).length * 1.3);
  const fuelUse = season === "ฤดูหนาว" ? Math.ceil(alivePeople(game).length * 0.7) + Math.max(0, alivePeople(game).length - shelterCapacity(game)) : 0;
  return [
    { name: "อาหาร", stock: game.resources.food, produced: foodProd, used: foodUse, net: foodProd - foodUse, note: "อาหารจากป่า/ล่าสัตว์/แปลงปลูก" },
    { name: "น้ำ", stock: game.resources.water, produced: 0, used: waterUse, net: -waterUse, note: game.buildings.well ? "มีบ่อน้ำช่วยคุณภาพน้ำ" : "ยังไม่มีบ่อน้ำ น้ำเสี่ยงปนเปื้อน" },
    { name: "ฟืน", stock: game.resources.fuel, produced: fuelProd, used: fuelUse, net: fuelProd - fuelUse, note: "ใช้มากในฤดูหนาว" },
    { name: "ไม้", stock: game.resources.wood, produced: woodProd, used: 0, net: woodProd, note: "สร้างที่พัก คลัง รั้ว และซ่อม" },
    { name: "หิน", stock: game.resources.stone, produced: stoneProd, used: 0, net: stoneProd, note: "บ่อน้ำ กองไฟ โครงสร้างถาวร" },
    { name: "ความรู้", stock: game.resources.knowledge, produced: knowledgeProd, used: 0, net: knowledgeProd, note: "ใช้ปลดล็อกภูมิปัญญา" },
  ];
}
function categorizeChanges(changes: string[]) {
  const sections: Record<string, string[]> = { "ผลผลิต": [], "บริโภค/สูญเสีย": [], "คนและสุขภาพ": [], "ความก้าวหน้า": [], "เหตุการณ์อื่น": [] };
  changes.forEach((item) => {
    if (item.includes("ผลิต") || item.includes("ไม้ +") || item.includes("หิน +") || item.includes("ความรู้ +") || item.includes("ฟืน +")) sections["ผลผลิต"].push(item);
    else if (item.includes("บริโภค") || item.includes("ใช้") || item.includes("ขาด") || item.includes("เสีย")) sections["บริโภค/สูญเสีย"].push(item);
    else if (item.includes("บาดเจ็บ") || item.includes("โรค") || item.includes("ผู้บาดเจ็บ") || item.includes("ตาย") || item.includes("สุขภาพ")) sections["คนและสุขภาพ"].push(item);
    else if (item.includes("ก่อสร้าง") || item.includes("สร้าง") || item.includes("วิจัย") || item.includes("เสร็จ") || item.includes("ศึกษา")) sections["ความก้าวหน้า"].push(item);
    else sections["เหตุการณ์อื่น"].push(item);
  });
  return Object.entries(sections).filter(([, items]) => items.length > 0);
}
function createInitialGame(setup: { leaderName: string; houseName: string; origin: Origin }): GameState {
  const people = initialPeople(setup.leaderName, setup.houseName, setup.origin);
  let metrics: Metrics = { morale: 48, security: 24, trust: 42, health: 54, cohesion: 44, fairness: 46 };
  if (setup.origin === "healer") metrics.health += 8;
  if (setup.origin === "mediator") { metrics.trust += 7; metrics.fairness += 7; }
  if (setup.origin === "hunter") metrics.security += 4;
  const base: GameState = {
    version: "0.9.7", leaderName: setup.leaderName, houseName: setup.houseName, origin: setup.origin,
    year: 1, month: 1, stage: "ค่ายพักแรม", resources: baseResources(setup.origin), buildings: emptyBuildings(), researchDone: emptyResearch(),
    construction: null, activeResearch: null, labor: { forage: 3, wood: 2, stone: 1, build: 1, guard: 1, care: 0, research: 0 },
    leaderFocus: "workWithPeople", selectedChoiceId: null, currentEventId: "first_night", pendingEvents: [], delayedEvents: [], recentEventIds: [],
    metrics, people, casualties: [], logs: [], memories: [], rumors: [], leaderTraits: ["ผู้ก่อตั้ง"], milestones: [], flags: {}, threat: 0,
    pathScores: { survival: 0, family: 0, knowledge: 0, trade: 0, fortress: 0, faith: 0 },
    collapse: { hungerMonths: 0, noWorkerMonths: 0, trustCrisisMonths: 0, assaultCrisisMonths: 0 }, gameOver: null,
    lastRisk: { food: 0, shelter: 0, disease: 0, beast: 0, conflict: 0, weather: 0, accident: 0 }, summaryModal: null, savedText: "ยังไม่เคยบันทึก",
  };
  return addLog(base, "ค่ายแรกถูกตั้งขึ้น", `${setup.leaderName} แห่ง House ${setup.houseName} พาคนสิบชีวิตตั้งกองไฟแรกบนผืนดินที่ยังไม่มีชื่อ`, "milestone", ["เริ่มเกม"]);
}

const events: GameEvent[] = [
  {
    id: "first_night", title: "คืนแรกบนผืนดินรกร้าง", category: "จุดเริ่มต้น",
    text: "กองไฟแรกยังเล็กเกินกว่าจะขับไล่ความมืดได้ทั้งหมด เด็กสองคนหลับชิดกันใต้ผ้าคลุม คนแก่เฝ้าดูเปลวไฟ ส่วนผู้ใหญ่หลายคนยังไม่ยอมวางมือจากมีดและขวาน",
    weight: () => 0,
    choices: [
      choice("build_fire", "🔥", "ตั้งกฎรอบกองไฟและเวรยามคืนแรก", "วางรากฐาน", "ความปลอดภัยและความเชื่อมั่นดีขึ้น", { resources: { wood: -3 }, metrics: { security: 6, trust: 4, cohesion: 3 }, path: { survival: 2 } }, ["กฎแรกของค่ายไม่ได้ถูกเขียนบนกระดาษ แต่ถูกพูดต่อหน้าไฟ: ใครเฝ้ายาม ใครดูเด็ก ใครเก็บฟืน และใครมีสิทธิ์หยิบอาหารก่อน", "คนสิบชีวิตยังไม่กลายเป็นหมู่บ้าน แต่คืนนั้นพวกเขาเริ่มกลายเป็นกลุ่มเดียวกัน"]),
      choice("share_food", "🍲", "ต้มซุปก้อนแรกให้ทุกคนแบ่งเท่ากัน", "ชุมชน", "ใช้เสบียง แต่เพิ่มกำลังใจและความยุติธรรม", { resources: { food: -5 }, metrics: { morale: 8, fairness: 6, trust: 2 }, path: { family: 2 } }, ["ซุปก้อนแรกเจือจางกว่าที่หลายคนหวัง แต่ชามทุกใบมีส่วนเท่ากัน", "ในวันที่ไม่มีบ้าน ความยุติธรรมกลายเป็นหลังคาชั่วคราวให้หัวใจของคน"]),
      choice("survey", "🧭", "เดินสำรวจขอบค่ายก่อนฟ้ามืด", "เสี่ยงแต่รู้พื้นที่", "ได้ข่าวลือและความรู้ แต่เหนื่อยกว่าเดิม", { resources: { knowledge: 5 }, metrics: { security: 2, health: -1 }, path: { knowledge: 2 } }, ["ผู้นำเดินวนรอบเขตค่ายจนเห็นทางน้ำต่ำ ๆ และรอยสัตว์บนดินชื้น", "สถานที่นี้ยังไม่ใช่บ้าน แต่เริ่มมีแผนที่เล็ก ๆ ในความทรงจำของผู้คน"], { addRumor: { title: "เสียงน้ำหลังเนินตะวันตก", detail: "บางคนได้ยินเสียงน้ำไกล ๆ อาจมีลำธารใกล้ค่าย", danger: "ต่ำ" }, addPending: "clear_stream" }),
    ],
  },
  {
    id: "tracks_near_camp", title: "รอยเท้าหนักใกล้กองเสบียง", category: "สัญญาณเตือน",
    text: "ดินชื้นหลังฝนมีรอยเท้าสัตว์ขนาดใหญ่กดลึกไว้ใกล้มุมเก็บอาหาร ไม่มีใครเห็นตัวมัน แต่ไม่มีใครหัวเราะกับเรื่องนี้เช่นกัน",
    weight: (g) => 7 + (riskPreview(g).beast > 45 ? 12 : 0) + (g.labor.guard === 0 ? 8 : 0),
    choices: [
      choice("set_traps", "🪤", "วางกับดักและเฝ้าคืนต่อไป", "ระวัง", "ใช้ไม้แต่ลดภัยสัตว์ป่า", { resources: { wood: -5, food: 2 }, metrics: { security: 7, morale: 1 }, path: { fortress: 1 } }, ["กับดักหยาบถูกวางรอบกองเสบียง เวรยามเดินช้าลงและฟังเสียงใบไม้มากขึ้น", "เช้าวันต่อมาไม่มีใครตาย และบางครั้งนั่นก็เป็นชัยชนะที่ใหญ่พอ"], { addDelayed: { id: "wolf_howl", months: 2 } }),
      choice("hunt", "🏹", "ส่งพรานตามรอย", "กล้าเสี่ยง", "ได้อาหารและหนัง แต่เสี่ยงบาดเจ็บ", { resources: { food: 12, hides: 2 }, metrics: { security: 2, health: -2 }, casualtyChance: 9, risk: { accident: 8, beast: 10 }, path: { survival: 1 } }, ["พรานเดินหายเข้าไปในแนวไม้พร้อมหอกสั้น เสียงกิ่งไม้หักดังอยู่ไกลเกินกว่าที่ควรจะเป็น", "พวกเขากลับมาพร้อมเนื้อสด แต่รอยขีดบนแขนเตือนว่าป่าไม่ได้ให้สิ่งใดโดยไม่คิดราคา"]),
      choice("move_food", "📦", "ย้ายเสบียงเข้ากลางค่าย", "ป้องกัน", "ไม่เสี่ยงคน แต่เสียเวลาและกำลังใจเล็กน้อย", { metrics: { security: 4, morale: -1, trust: 1 } }, ["อาหารทุกถุงถูกลากมาไว้ใกล้กองไฟกลางค่าย เด็ก ๆ ถูกสั่งห้ามเข้าใกล้ชายป่า", "รอยเท้ายังอยู่ แต่ความประมาทถูกย้ายออกไปก่อน"]),
    ],
  },
  {
    id: "wolf_howl", title: "เสียงหมาป่าหลังแนวไม้", category: "ภัยสัตว์ป่า",
    text: "สามคืนติดกัน เสียงหอนดังจากที่เดิม สัตว์เล็กหายจากกับดัก และเด็ก ๆ เริ่มถามว่าป่าจะเดินเข้ามาในค่ายได้หรือไม่",
    weight: (g) => 5 + (g.metrics.security < 45 ? 13 : 0),
    choices: [
      choice("guard_fire", "🔥", "เพิ่มไฟและเวรยามรอบค่าย", "มั่นคง", "ใช้ฟืนแต่ลดความกลัว", { resources: { fuel: -4, wood: -3 }, metrics: { security: 7, morale: 3 }, path: { fortress: 2 } }, ["กองไฟเล็กถูกจุดเป็นวงเหมือนดาวที่ตกลงบนดิน เวรยามเดินจนรองเท้าเปียกน้ำค้าง", "เสียงหอนยังมีอยู่ แต่ไม่ได้ครอบครองความมืดทั้งหมดอีกต่อไป"]),
      choice("hunt_pack", "🏹", "ออกล่าฝูงหมาป่า", "เด็ดขาด", "อาจยุติภัยเร็ว แต่มีโอกาสตายจริง", { resources: { food: 10, hides: 3 }, metrics: { security: 8, health: -4 }, casualtyChance: 16, path: { survival: 2, fortress: 1 } }, ["พรานกับเวรยามออกจากค่ายก่อนฟ้าสาง พวกเขากลับมาพร้อมหนังหมาป่าและสายตาที่แก่ลงหนึ่งปี", "ค่ายปลอดภัยขึ้น แต่เด็กบางคนยังสะดุ้งทุกครั้งที่หมาในค่ายเห่า"]),
      choice("avoid_forest", "🚧", "ห้ามเด็กและคนหาอาหารเข้าป่าลึก", "ลดเสี่ยง", "อาหารลดลงแต่ลดโอกาสตาย", { resources: { food: -4 }, metrics: { security: 5, trust: 2 }, path: { survival: 1 } }, ["ขอบเขตใหม่ถูกวาดด้วยกิ่งไม้และคำสั่ง คนหาอาหารไม่พอใจ แต่ไม่มีผู้ปกครองคนใดค้าน", "บางเดือน การยอมได้น้อยลงคือวิธีรักษาคนที่เหลืออยู่"]),
    ],
  },
  {
    id: "spoiled_food", title: "กลิ่นเปรี้ยวจากมุมเสบียง", category: "เสบียง",
    text: "ถุงอาหารบางส่วนชื้นเกินไป กลิ่นเปรี้ยวลอยออกมาเมื่อเปิดผ้าคลุม หากยังไม่มีคลังหรือวิธีถนอม อาหารอาจหายไปโดยไม่ถูกกิน",
    weight: (g) => 8 + (g.resources.food > 35 ? 8 : 0) + (g.buildings.storage === 0 ? 9 : 0) + (seasonOf(g.month) === "ฤดูฝน" ? 9 : 0),
    choices: [
      choice("dry_food", "☀️", "คัดแยก ตากแห้ง และจดวิธีเก็บ", "เรียนรู้", "เสียอาหารเล็กน้อยแต่ได้ความรู้", { resources: { food: -3, knowledge: 5 }, metrics: { trust: 2 }, path: { knowledge: 1 } }, ["อาหารเสียถูกแยกออกทีละกำมือ ผู้เฒ่าสอนให้ดูสี กลิ่น และความชื้นของถุง", "เดือนนี้ค่ายเสียอาหารน้อยกว่าที่กลัว และได้บทเรียนที่อาจช่วยให้ฤดูหนาวไม่โหดร้ายเท่าเดิม"]),
      choice("big_soup", "🍲", "ทำซุปใหญ่ก่อนอาหารเสีย", "แบ่งปัน", "ใช้เสบียงมากแต่เพิ่มขวัญกำลังใจ", { resources: { food: -9 }, metrics: { morale: 8, cohesion: 4 }, path: { family: 1 } }, ["หม้อซุปใหญ่ตั้งกลางค่าย กลิ่นควันและรากไม้ต้มทำให้ทุกคนลืมความเหนื่อยมาชั่วครู่", "อาหารหายไปเร็วกว่าที่ควร แต่เสียงหัวเราะรอบกองไฟทำให้เดือนนี้ไม่สิ้นหวัง"]),
      choice("strict_ration", "⚖️", "ประกาศกฎแบ่งเสบียงเข้มงวด", "เข้มงวด", "รักษาอาหารแต่ลดกำลังใจ", { resources: { food: 2 }, metrics: { morale: -5, fairness: 3, trust: -1 }, path: { survival: 1 } }, ["เสบียงถูกนับใหม่ต่อหน้าทุกคน เสียงเมล็ดแห้งในถุงดังเหมือนคำเตือน", "ไม่มีใครอดในเดือนนี้ แต่หลายคนเริ่มมองถ้วยของกันและกันนานขึ้น"]),
    ],
  },
  {
    id: "clear_stream", title: "ลำธารใสหลังเนินตะวันตก", category: "การค้นพบ",
    text: "เสียงน้ำที่เคยเป็นเพียงข่าวลือกลายเป็นลำธารจริง น้ำใส เย็น และไหลผ่านหิน แต่ทางเดินยังรกและอาจมีสัตว์ซ่อนอยู่",
    weight: (g) => 4 + (!g.researchDone.waterFinding ? 8 : 0) + (g.resources.water < 20 ? 8 : 0),
    choices: [
      choice("mark_path", "🧭", "ทำเครื่องหมายเส้นทางน้ำ", "สำรวจ", "เพิ่มน้ำและความรู้เรื่องพื้นที่", { resources: { water: 18, knowledge: 8 }, metrics: { health: 3 }, path: { knowledge: 2 } }, ["รอยมีดถูกขีดบนเปลือกไม้เป็นช่วง ๆ ทางไปน้ำยังไม่ราบ แต่ไม่ใช่ความหวังลอย ๆ อีกต่อไป", "เสียงน้ำไหลกลายเป็นสิ่งที่ทุกคนพูดถึงขณะกลับค่าย"], { setFlag: "stream_found" }),
      choice("guard_path", "🛡️", "จัดเวรยามเส้นทางน้ำ", "ปลอดภัย", "เพิ่มน้ำไม่มากแต่ลดโรคและภัย", { resources: { water: 10 }, metrics: { security: 4, health: 5 }, path: { survival: 1 } }, ["เวรยามเดินตามทางน้ำจนรองเท้าเปื้อนโคลน แต่ไม่มีใครล้มป่วยจากน้ำขุ่นในเดือนนั้น", "บางครั้งสิ่งที่รักษาชุมชนไม่ใช่อาวุธคม แต่เป็นเส้นทางปลอดภัยไปยังน้ำสะอาด"]),
      choice("herbs_bank", "🌿", "ค้นหาสมุนไพรริมลำธาร", "รักษา", "ได้สมุนไพรและปลดล็อกโอกาสรักษา", { resources: { herbs: 4, knowledge: 3 }, metrics: { health: 2 }, path: { knowledge: 1 } }, ["ใบเขียวกลิ่นฉุนขึ้นอยู่ตามหิน ผู้เฒ่าจำได้ว่ามันใช้ลดไข้ได้หากต้มด้วยไฟอ่อน", "ค่ายยังเล็ก แต่เริ่มมีความรู้ที่ไม่ต้องซื้อด้วย Gold"]),
    ],
  },
  {
    id: "broken_tools", title: "ด้ามขวานแตกกลางงาน", category: "แรงงาน",
    text: "ขวานหนึ่งเล่มแตกกลางด้าม เสียมเก่าก็บิ่นจนคนเก็บหินต้องหยุดมือ หากปล่อยไว้ งานไม้และงานหินจะช้าลง และอุบัติเหตุจะใกล้เข้ามา",
    weight: (g) => 7 + (g.resources.tools <= 3 ? 12 : 0) + (g.labor.build + g.labor.wood + g.labor.stone > 5 ? 5 : 0),
    choices: [
      choice("repair_carefully", "⚒️", "ซ่อมอย่างประณีต", "งานช่าง", "ใช้ทรัพยากรน้อยและลดอุบัติเหตุ", { resources: { wood: -4, stone: -1, tools: 1, knowledge: 2 }, metrics: { trust: 1 }, path: { knowledge: 1 } }, ["ช่างในค่ายใช้เวลาทั้งบ่ายผูกด้ามใหม่และลับคมเสียม เสียงโลหะครูดหินดังเหมือนคำสัญญาว่างานพรุ่งนี้จะยังเดินต่อ", "เครื่องมือไม่ได้สวยขึ้น แต่กลับมาอยู่ในมือคนทำงานได้อีกครั้ง"]),
      choice("share_tools", "🤲", "แบ่งใช้เครื่องมือร่วมกัน", "ประคอง", "ไม่เสียทรัพยากรแต่ทำงานช้าลง", { metrics: { trust: 3, morale: -1 }, path: { family: 1 } }, ["คนตัดไม้และคนก่อสร้างตกลงแบ่งขวานกันเป็นรอบ ไม่มีใครพอใจนัก แต่ไม่มีใครแย่งกัน", "ค่ายเรียนรู้ว่าทรัพยากรน้อยไม่น่ากลัวเท่าการไม่ยอมแบ่งปัน"]),
      choice("push_work", "💪", "ฝืนทำงานต่อ", "เสี่ยง", "ได้ไม้เพิ่มแต่มีโอกาสบาดเจ็บ", { resources: { wood: 8, tools: -1 }, metrics: { health: -3 }, casualtyChance: 8, risk: { accident: 15 }, path: { survival: 1 } }, ["คนงานฝืนใช้เสียมบิ่นจนมือถลอก ไม้ถูกลากกลับค่ายมากกว่าที่คาด", "ผลลัพธ์ของเดือนนี้ดูดีบนกองไม้ แต่ไม่ดีบนฝ่ามือของคนทำงาน"]),
    ],
  },
  {
    id: "children_fever", title: "เสียงไอของเด็กในคืนฝน", category: "สุขภาพ",
    text: "เด็กสองคนตัวร้อนหลังฝนตกต่อเนื่อง เสียงไอเล็ก ๆ ในที่พักชั่วคราวทำให้ทั้งค่ายเงียบลงอย่างรวดเร็ว",
    weight: (g) => 6 + (g.metrics.health < 55 ? 12 : 0) + (seasonOf(g.month) === "ฤดูฝน" ? 10 : 0) + (childrenCount(g) > 0 ? 5 : 0),
    choices: [
      choice("use_herbs", "🌿", "ใช้สมุนไพรและจัดคนดูแล", "รักษา", "ใช้สมุนไพรแต่ลดโรคแพร่", { resources: { herbs: -2 }, metrics: { health: 8, morale: 3 }, path: { family: 1 } }, ["สมุนไพรขมถูกต้มจนกลิ่นกระจายไปทั่วที่พัก เด็ก ๆ ร้องไห้ตอนดื่ม แต่ไข้เริ่มลดในรุ่งเช้า", "ชีวิตเล็ก ๆ สองชีวิตทำให้ทุกคนจำได้ว่าพวกเขากำลังสร้างอนาคต ไม่ใช่แค่กองไม้"]),
      choice("warm_fire", "🔥", "เพิ่มไฟและย้ายเด็กใกล้กองกลาง", "ประคอง", "ใช้ฟืนแต่เพิ่มกำลังใจ", { resources: { fuel: -4, wood: -3 }, metrics: { health: 4, morale: 4 }, path: { survival: 1 } }, ["ผ้าห่มถูกแบ่งใหม่ ไฟกลางค่ายถูกเติมจนสว่าง เด็กที่ป่วยนอนฟังผู้ใหญ่เล่าเรื่องเพื่อไม่ให้กลัวความหนาว", "ไม่มีเวทมนตร์ใดเกิดขึ้น มีเพียงความอบอุ่นที่คนสิบชีวิตช่วยกันรักษาไว้"]),
      choice("wait_fever", "⏳", "เฝ้าดูอาการก่อน", "ประหยัด", "ไม่ใช้ทรัพยากรแต่เสี่ยงเสียคน", { metrics: { health: -7, morale: -3 }, casualtyChance: 7, risk: { disease: 18 }, path: { survival: -1 } }, ["ผู้นำเลือกเก็บสมุนไพรไว้ก่อน ทุกคนเข้าใจเหตุผล แต่ไม่มีใครหลับสนิทเมื่อได้ยินเสียงไอในความมืด", "บางครั้งการประหยัดก็มีเสียงของมัน และเสียงนั้นคล้ายเด็กหายใจติดขัดเกินไป"]),
    ],
  },
  {
    id: "ration_argument", title: "ข้อพิพาทหน้าเตาไฟ", category: "สังคม",
    text: "คนตัดไม้กล่าวหาว่าคนเฝ้ายามได้อาหารมากกว่า ข้อถกเถียงเล็ก ๆ หน้าเตาไฟเริ่มลุกลามเป็นความไม่พอใจ",
    weight: (g) => 6 + (g.metrics.morale < 45 ? 12 : 0) + (g.resources.food < foodNeedFor(g) * 1.5 ? 8 : 0),
    choices: [
      choice("public_fair", "⚖️", "จัดสรรอาหารใหม่ต่อหน้าทุกคน", "ยุติธรรม", "เพิ่มความยุติธรรมแต่บางคนไม่พอใจ", { metrics: { fairness: 8, trust: 4, morale: -1 }, path: { family: 1 } }, ["อาหารถูกนับใหม่ทีละส่วน ผู้นำยืนอยู่ตรงนั้นจนถ้วยสุดท้ายถูกส่งถึงมือคนสุดท้าย", "ไม่มีใครได้ทุกอย่างที่ต้องการ แต่ทุกคนเห็นว่ากฎเดียวกันใช้กับทุกคน"]),
      choice("listen_circle", "👂", "เปิดวงพูดคุยหลังมื้อเย็น", "รับฟัง", "เพิ่มขวัญและลดความขัดแย้ง", { metrics: { trust: 4, morale: 4, cohesion: 5 }, path: { family: 2 } }, ["วงสนทนาเริ่มด้วยเสียงแข็ง แต่จบลงด้วยความเงียบที่อ่อนลงกว่าเดิม", "หลายคนไม่ได้ต้องการอาหารเพิ่มเท่ากับต้องการรู้ว่าตนเองยังถูกมองเห็น"]),
      choice("command_silence", "🛡️", "สั่งห้ามโต้เถียงเรื่องเสบียง", "เข้มงวด", "หยุดปัญหาเร็วแต่ลดความไว้ใจ", { metrics: { security: 3, trust: -7, cohesion: -3 }, path: { fortress: 1 } }, ["คำสั่งทำให้เสียงเงียบลงทันที แต่ความเงียบไม่เหมือนความสงบ", "ในค่ายเล็ก ๆ คำสั่งอาจหยุดปากคนได้ แต่หยุดความคิดในใจไม่ได้เสมอไป"]),
    ],
  },
  {
    id: "stranger_arrives", title: "คนแปลกหน้าที่ล้มอยู่ริมทาง", category: "เหตุการณ์ต่อเนื่อง",
    text: "ชายคนหนึ่งล้มอยู่ใกล้ทางเก่า เขามีแผลที่สีข้างและถุงเครื่องมือเก่า เขาบอกว่าหนีโจรมา แต่ดวงตาของเขาหลบมากกว่าคนป่วยทั่วไป",
    weight: (g) => 4 + (g.stage !== "เมืองเล็ก" ? 5 : 2) + (g.metrics.trust > 45 ? 3 : 0),
    choices: [
      choice("treat_stranger", "🤲", "รักษาและรับเขาเข้าค่ายชั่วคราว", "เมตตา", "ได้โอกาสคนใหม่ แต่มีความเสี่ยงซ่อนอยู่", { resources: { herbs: -1, food: -3 }, metrics: { morale: 3, trust: 2 }, population: 1, path: { family: 1 } }, ["เขาถูกพาไปใกล้ไฟและได้รับน้ำอุ่นก่อนถูกถามชื่อ ไม่มีใครไว้ใจทั้งหมด แต่ไม่มีใครปล่อยให้เขาตายใต้ฝน", "บางครั้งประตูที่เปิดออกอาจพาคนดีเข้ามา หรือพาเงาของอดีตเข้าค่ายด้วย"], { addDelayed: { id: "stranger_truth", months: 2 }, setFlag: "helped_stranger" }),
      choice("question_first", "👁️", "สอบถามและค้นถุงก่อนรักษา", "ระแวง", "ได้ข้อมูล แต่ลดภาพผู้นำในสายตาบางคน", { resources: { knowledge: 5 }, metrics: { security: 4, trust: -3 }, path: { survival: 1 } }, ["ถุงเครื่องมือถูกเปิดก่อนแผลของเจ้าของจะถูกล้าง ไม่มีใครพูดอะไร แต่หลายคนเห็นลำดับความสำคัญนั้นชัดเจน", "ข้อมูลที่ได้มีค่า แต่มีบางอย่างในสายตาชาวบ้านที่เสียไปพร้อมกัน"], { addDelayed: { id: "stranger_truth", months: 2 }, setFlag: "suspected_stranger" }),
      choice("send_away", "🚪", "ให้เสบียงเล็กน้อยแล้วส่งต่อ", "ปิดค่าย", "รักษาความปลอดภัยแต่ลดชื่อเสียงความเมตตา", { resources: { food: -2 }, metrics: { security: 3, morale: -2, trust: -2 }, path: { fortress: 1 } }, ["เขาได้รับอาหารแห้งพอเดินต่อ แต่ไม่ได้รับที่นอนในค่าย", "คืนนั้นอาหารยังพอ แต่บางคนสงสัยว่าวันหนึ่งหากเป็นพวกเขาที่เคาะประตู จะมีใครเปิดหรือไม่"], { addTrait: "ผู้ปิดประตู" }),
    ],
  },
  {
    id: "stranger_truth", title: "ความจริงของคนแปลกหน้า", category: "ผลต่อเนื่อง",
    text: "คนแปลกหน้าหายดีพอจะยืนได้ เขามองเพิงช่างที่ยังไม่เสร็จ แล้วสารภาพว่าเคยเป็นช่างหินมาก่อน แต่ไม่ได้เล่าทุกอย่างในวันแรกเพราะกลัวถูกปฏิเสธ",
    condition: (g) => Boolean(g.flags.helped_stranger || g.flags.suspected_stranger),
    weight: () => 0,
    choices: [
      choice("accept_mason", "🪨", "ให้เขาเป็นช่างหินของค่าย", "ให้อภัย", "เพิ่มแรงงานและความรู้ก่อสร้าง", { resources: { stone: 8, knowledge: 8 }, metrics: { trust: 4 }, path: { family: 1, knowledge: 1 } }, ["เขายืนหน้าเพิงช่างและแสดงวิธีวางหินให้ไม่ล้มง่าย เสียงพึมพำของคนที่เคยระแวงเบาลงทีละน้อย", "ค่ายได้แรงงานคนใหม่ แต่ที่สำคัญกว่านั้นคือได้บทเรียนว่าคนเราบางครั้งพกความกลัวมาด้วยมากกว่าความผิด"], { addMemory: { title: "คนแปลกหน้าที่กลายเป็นช่าง", text: "ค่ายเลือกให้อดีตของคนหนึ่งไม่กลืนอนาคตของเขา", effect: "+ความไว้ใจ เมื่อรับคนใหม่ในอนาคต", kind: "lesson" } }),
      choice("probation", "⚖️", "ให้ทำงานภายใต้การเฝ้าดู", "รอบคอบ", "สมดุลระหว่างเมตตาและความปลอดภัย", { resources: { stone: 5, knowledge: 4 }, metrics: { security: 3, trust: 1 }, path: { survival: 1 } }, ["เขาได้รับงานและที่นอน แต่ยังต้องทำงานใกล้เวรยาม ไม่มีใครเรียกสิ่งนั้นว่าคุก และไม่มีใครเรียกมันว่าความไว้ใจเต็มปาก", "บางครั้งความเมตตาที่อยู่ได้นานต้องมีกรอบให้คนไม่กลัวมัน"]),
      choice("banish_mason", "🚪", "ขับไล่เพราะปิดบังความจริง", "แข็งกร้าว", "ปลอดภัยขึ้นแต่เสียโอกาสและความอบอุ่น", { metrics: { security: 5, trust: -5, morale: -3 }, path: { fortress: 1 } }, ["เขาเก็บถุงเครื่องมือเก่าและเดินออกจากค่ายโดยไม่หันกลับมา", "ไม่มีอะไรหายไปจากกองเสบียง แต่บางคนรู้สึกว่าค่ายเล็กลงกว่าก่อน"]),
    ],
  },
  {
    id: "lost_child", title: "เด็กหายในยามเย็น", category: "ครอบครัว",
    text: "เด็กคนหนึ่งไม่กลับจากชายป่าเมื่อแสงสุดท้ายหายไป เสียงเรียกชื่อดังไปทั่วค่าย และทุกงานหยุดลงพร้อมกัน",
    weight: (g) => 3 + (childrenCount(g) > 0 ? 8 : 0) + (g.metrics.security < 45 ? 9 : 0),
    choices: [
      choice("search_all", "🔦", "ระดมทุกคนค้นหา", "เมตตา", "เสียงานทั้งค่ายแต่เพิ่มโอกาสรอด", { resources: { food: -3 }, metrics: { morale: 5, trust: 6 }, path: { family: 2 } }, ["ไม่มีใครถามว่าใครควรออกไป ทุกคนหยิบคบไฟและเดินเรียงกันเข้าไปในเงาไม้", "เมื่อพบเด็กนั่งร้องไห้อยู่ใกล้รากไม้ใหญ่ ทั้งค่ายเหมือนได้หัวใจคืนมาอีกครั้ง"]),
      choice("skilled_search", "🧭", "ให้พรานและยามออกค้นหา", "มีระบบ", "เสี่ยงน้อยกว่าแต่ครอบครัวตึงเครียด", { metrics: { security: 4, trust: 1, morale: -1 }, path: { survival: 1 } }, ["พรานสองคนก้มดูรอยเท้าเล็ก ๆ ข้างดินนิ่ม ส่วนคนอื่นถูกสั่งให้รอใกล้ไฟกลางค่าย", "การค้นหามีระเบียบและได้ผล แต่แม่ของเด็กมองแนวป่าเหมือนทุกวินาทีถูกยืดออกด้วยมีด"]),
      choice("wait_morning", "⏳", "รอจนเช้าเพราะป่ามืดเกินไป", "ปลอดภัยต่อผู้ใหญ่", "ลดความเสี่ยงผู้ใหญ่ แต่บั่นทอนใจอย่างมาก", { metrics: { security: 1, morale: -10, trust: -7 }, casualtyChance: 12, path: { survival: -1 } }, ["ผู้นำเลือกไม่ส่งคนเข้าป่ามืด เสียงร้องไห้ที่กองไฟไม่ได้ดังมาก แต่มันดังพอให้ไม่มีใครหลับจริง ๆ", "บางการตัดสินใจปลอดภัยต่อจำนวนคน แต่ไม่ปลอดภัยต่อสิ่งที่ผู้คนใช้เชื่อในผู้นำ"]),
    ],
  },
  {
    id: "old_ruins", title: "ซากหินใต้รากไม้", category: "ข่าวลือ / สำรวจ",
    text: "ระหว่างเก็บหิน มีคนพบฐานกำแพงเก่าใต้รากไม้หนา อาจเป็นซากบ้าน หรือร่องรอยของคนที่เคยพยายามตั้งถิ่นฐานที่นี่ก่อนเรา",
    weight: (g) => 4 + (g.labor.stone > 1 ? 8 : 0) + (g.leaderFocus === "scout" ? 5 : 0),
    choices: [
      choice("excavate", "⛏️", "ขุดสำรวจอย่างระมัดระวัง", "ความรู้", "ได้หินและความทรงจำเก่า", { resources: { stone: 8, knowledge: 9 }, metrics: { morale: 1 }, path: { knowledge: 2 } }, ["หินแต่ละก้อนถูกขุดขึ้นอย่างช้า ๆ ใต้ดินมีรอยเถ้าเก่าและเศษภาชนะที่แตกไปนานแล้ว", "ค่ายเริ่มรู้ว่าพวกเขาไม่ได้เป็นคนแรกที่หวังกับที่ดินผืนนี้ และคำถามคือจะทำต่างจากคนก่อนอย่างไร"], { addMemory: { title: "ซากหินของผู้มาก่อน", text: "ร่องรอยใต้รากไม้เตือนว่าการตั้งถิ่นฐานอาจล้มเหลวได้ หากคนลืมเรียนรู้จากอดีต", effect: "+ความรู้ และเพิ่มน้ำหนักพงศาวดารสายความทรงจำ", kind: "lesson" } }),
      choice("reuse_stone", "🪨", "รื้อหินไปใช้ก่อสร้าง", "ปฏิบัติ", "ได้หินมากแต่เสียโอกาสเรียนรู้", { resources: { stone: 18 }, metrics: { morale: -1 }, path: { survival: 1 } }, ["หินเก่าถูกยกออกจากรากไม้และกองไว้ใกล้พื้นที่ก่อสร้าง", "ประวัติศาสตร์ถูกย้ายที่อย่างเงียบ ๆ เพื่อให้ปัจจุบันมีหลังคา"]),
      choice("mark_sacred", "🕯️", "ทำเครื่องหมายเป็นพื้นที่ต้องห้ามชั่วคราว", "เคารพ", "เพิ่มวัฒนธรรมและศรัทธา", { resources: { knowledge: 4 }, metrics: { morale: 4, cohesion: 3 }, path: { faith: 3 } }, ["ผู้นำสั่งให้วางกิ่งไม้เป็นวงรอบซากหิน ไม่มีพิธีใหญ่ มีเพียงความเงียบที่คนทั้งค่ายพร้อมใจให้กับผู้ไม่รู้ชื่อ", "บางครั้งการสร้างอนาคตต้องเริ่มจากการไม่เหยียบอดีตแรงเกินไป"]),
    ],
  },
  {
    id: "pregnancy_news", title: "ข่าวเด็กที่จะเกิด", category: "สายเลือด",
    text: "มีข่าวว่าครอบครัวหนึ่งกำลังจะมีลูก คนในค่ายยิ้มมากขึ้น แต่คำถามเรื่องอาหารและที่พักก็หนักขึ้นทันที",
    weight: (g) => 3 + (g.metrics.health > 48 && g.metrics.morale > 48 ? 8 : 0) + (shelterCapacity(g) > alivePeople(g).length ? 5 : 0),
    choices: [
      choice("prepare_birth", "🍼", "กันอาหารและผ้าสะอาดไว้ล่วงหน้า", "อนาคต", "ใช้ทรัพยากรแต่เพิ่มโอกาสคลอดปลอดภัย", { resources: { food: -5, wood: -2 }, metrics: { morale: 5, health: 4 }, path: { family: 3 } }, ["ผ้าสะอาดถูกแยกไว้ใกล้กองไฟ และอาหารส่วนหนึ่งถูกกันไว้สำหรับแม่ที่กำลังอ่อนแรง", "ไม่มีใครรู้ว่าเด็กจะเกิดเมื่อไร แต่ค่ายเริ่มทำตัวเหมือนสถานที่ที่เด็กควรเกิด"], { addDelayed: { id: "birth_event", months: 5 }, setFlag: "prepared_birth" }),
      choice("celebrate", "🎶", "จัดมื้อเล็กเพื่อให้กำลังใจ", "ชุมชน", "เพิ่มขวัญแต่ใช้อาหาร", { resources: { food: -7 }, metrics: { morale: 8, cohesion: 3 }, path: { family: 2 } }, ["คืนนั้นมีเพลงเบา ๆ รอบกองไฟ คนที่ร้องผิดคีย์ที่สุดกลับทำให้ทุกคนหัวเราะมากที่สุด", "เด็กยังไม่เกิด แต่ความหวังเกิดก่อนแล้ว"], { addDelayed: { id: "birth_event", months: 5 } }),
      choice("wait_birth", "📦", "รอดูสถานการณ์ก่อน", "ระวัง", "ประหยัดทรัพยากรแต่ลดความอบอุ่น", { metrics: { morale: -2, trust: -1 }, path: { survival: 1 } }, ["ผู้นำรับรู้ข่าวดีแต่ยังไม่แบ่งทรัพยากรเพิ่ม ทุกคนเข้าใจเหตุผล ทว่าในเรื่องของชีวิตใหม่ เหตุผลไม่เคยอบอุ่นเท่าผ้าห่ม", "ค่ายยังเดินต่อด้วยความระวัง แต่ความระวังอาจดูคล้ายความเย็นชาเมื่อมองจากคนที่กำลังจะเป็นพ่อแม่"], { addDelayed: { id: "birth_event", months: 5 } }),
    ],
  },
  {
    id: "birth_event", title: "เสียงร้องแรกในค่าย", category: "Milestone",
    text: "ก่อนรุ่งสาง เสียงร้องของเด็กแรกเกิดดังขึ้นในที่พักชั่วคราว ทุกคนที่ตื่นอยู่เงียบไปครู่หนึ่ง เหมือนกำลังฟังว่าที่นี่มีอนาคตจริงหรือไม่",
    weight: () => 0,
    choices: [
      choice("name_child", "🍼", "ต้อนรับเด็กเป็นคนของค่าย", "ความหวัง", "เพิ่มประชากรและขวัญกำลังใจ", { population: 1, metrics: { morale: 8, cohesion: 5, health: 2 }, path: { family: 4 } }, ["เด็กถูกห่อด้วยผ้าที่ไม่ได้ใหม่ แต่สะอาดที่สุดเท่าที่ค่ายมี", "ในโลกที่ความตายเดินใกล้กองไฟ การเกิดของเด็กคนหนึ่งทำให้ทุกคนหายใจยาวขึ้น"], { addMemory: { title: "เด็กคนแรกของค่าย", text: "เสียงร้องแรกทำให้ผู้คนเชื่อว่าที่นี่ไม่ได้มีไว้แค่รอด แต่มีไว้ให้คนเกิดและโต", effect: "+ขวัญกำลังใจเมื่อผ่านฤดูยาก", kind: "pride" } }),
      choice("quiet_birth", "🌙", "เก็บข่าวไว้เงียบ ๆ ให้แม่พัก", "ถนอม", "เพิ่มสุขภาพและลดความวุ่นวาย", { population: 1, metrics: { health: 5, morale: 4 }, path: { family: 2 } }, ["ไม่มีเพลง ไม่มีพิธี มีเพียงไฟอ่อนและเสียงกระซิบให้แม่ได้หลับ", "บางความหวังต้องการความเงียบมากกว่าคำอวยพร"]),
    ],
  },
  {
    id: "storm_night", title: "พายุคืนยาว", category: "ภัยธรรมชาติ",
    text: "ลมแรงพัดผ้าใบที่พักจนเสียงดังเหมือนจะฉีก ฝนซึมเข้ากองฟืน และทุกคนรู้ว่าค่ายยังเปราะบางมาก",
    weight: (g) => 5 + (seasonOf(g.month) === "ฤดูฝน" ? 12 : 0) + (shelterCapacity(g) < alivePeople(g).length ? 10 : 0),
    choices: [
      choice("secure_shelter", "🪢", "มัดที่พักและกองฟืนใหม่", "ลงแรง", "เสียไม้แต่ลดความเสียหาย", { resources: { wood: -4 }, metrics: { health: 3, morale: 3 }, path: { survival: 1 } }, ["ผู้ใหญ่หลายคนฝ่าฝนออกไปมัดผ้าใบและลากฟืนขึ้นที่สูง มือสั่นจากความเย็น แต่ไม่มีใครปล่อยเชือกก่อนปมจะแน่น", "พายุยังดังเหมือนเดิม แต่ค่ายไม่กระจัดกระจายไปกับมัน"]),
      choice("gather_fire", "🔥", "รวมทุกคนรอบกองไฟ", "ประคองใจ", "ใช้ฟืนมากแต่เพิ่มขวัญ", { resources: { fuel: -5, wood: -3 }, metrics: { morale: 7, health: 1 }, path: { family: 1 } }, ["ทุกคนเบียดกันใกล้ไฟกลางค่าย เด็กหลับบนตักผู้ใหญ่ที่ไม่ใช่ญาติของตนเอง", "ในคืนที่หลังคาไม่มั่นคง ความเป็นชุมชนกลายเป็นที่พักอีกแบบหนึ่ง"]),
      choice("endure_storm", "🛖", "อดทนจนฟ้าสาง", "เสี่ยง", "ไม่ใช้ทรัพยากรแต่สุขภาพลด", { metrics: { health: -7, morale: -4 }, casualtyChance: 8, risk: { weather: 16 } }, ["ทุกคนรอให้พายุผ่านไป แต่ไม่มีใครรู้ว่าร่างกายจะจำความหนาวคืนนี้ไว้นานแค่ไหน", "รุ่งเช้ามาถึงจริง แต่ไม่ได้มาฟรี"]),
    ],
  },
  {
    id: "dry_wind", title: "ลมแห้งจากเนินตะวันตก", category: "สภาพอากาศ",
    text: "ใบหญ้าเหลืองลงเร็วกว่าปกติ หากฝนยังไม่มา อาหารและน้ำจะกลายเป็นเรื่องหนักในเดือนถัดไป",
    weight: (g) => 5 + (seasonOf(g.month) === "ฤดูร้อน" ? 12 : 0) + (g.resources.water < 18 ? 7 : 0),
    choices: [
      choice("save_water", "💧", "จำกัดการใช้น้ำและเก็บน้ำค้าง", "ประคอง", "ลดน้ำเสียแต่ลดขวัญเล็กน้อย", { resources: { water: 8 }, metrics: { morale: -2, health: 1 }, path: { survival: 1 } }, ["ถ้วยน้ำถูกนับใหม่และใบไม้ใหญ่ถูกวางรับน้ำค้างก่อนรุ่งสาง", "ไม่มีใครชอบการถูกจำกัด แต่ทุกคนรู้ว่าความกระหายไม่เคยต่อรอง"]),
      choice("dig_shallow", "⛏️", "ขุดหลุมน้ำตื้นใกล้ลำธารเก่า", "ลงแรง", "ใช้แรงและเสี่ยงอุบัติเหตุเล็กน้อย", { resources: { water: 14, stone: -2 }, metrics: { health: 2 }, casualtyChance: 5, path: { survival: 1 } }, ["ดินแห้งถูกขุดจนเล็บดำ เมื่อเห็นน้ำซึมขึ้นมาเล็กน้อย คนที่ยืนมองก็เผลอยิ้มเหมือนได้เห็นทอง", "น้ำไม่มาก แต่ในเดือนแห้ง น้ำหยดเดียวก็มีน้ำหนัก"]),
      choice("ignore_wind", "🌬️", "เชื่อว่าฝนจะกลับมาเอง", "ประหยัด", "ไม่เสียอะไรตอนนี้แต่เพิ่มความเสี่ยงเดือนหน้า", { metrics: { trust: -1 }, risk: { food: 10, weather: 12 } }, ["หลายคนมองฟ้าและบอกว่าลมแห้งคงผ่านไปเอง", "บางครั้งธรรมชาติตอบความหวังด้วยความเงียบเท่านั้น"], { addDelayed: { id: "water_sickness", months: 1 } }),
    ],
  },
  {
    id: "water_sickness", title: "ท้องเสียจากน้ำขุ่น", category: "โรค",
    text: "หลังน้ำสะอาดลดลง หลายคนเริ่มปวดท้องและอ่อนแรง น้ำที่เคยดูใช้ได้กลับทิ้งรสโคลนไว้ในปาก",
    weight: (g) => 5 + (g.buildings.well === 0 ? 10 : 0) + (g.metrics.health < 60 ? 10 : 0),
    choices: [
      choice("boil_water", "🔥", "ต้มน้ำทุกครั้งก่อนดื่ม", "สุขาภิบาล", "ใช้ฟืนแต่ลดโรค", { resources: { fuel: -4, wood: -3 }, metrics: { health: 8, morale: 1 }, path: { survival: 1 } }, ["หม้อดินถูกตั้งบนไฟแทบทั้งวัน น้ำร้อนทำให้ต้องรอ แต่ไม่มีใครล้อเรื่องความระวังอีกเมื่อเสียงปวดท้องลดลง", "ค่ายได้เรียนรู้ว่าความสะอาดไม่ได้งามเสมอไป แต่มันช่วยให้คนมีชีวิต"]),
      choice("herbal_tonic", "🌿", "ต้มสมุนไพรแก้อาการ", "รักษา", "ใช้สมุนไพรและเพิ่มสุขภาพ", { resources: { herbs: -2 }, metrics: { health: 7, trust: 2 }, path: { knowledge: 1 } }, ["สมุนไพรสีเข้มถูกต้มจนขมจัด คนป่วยทำหน้าเหมือนกลืนดิน แต่หลายคนลุกได้ในวันรุ่งขึ้น", "ขมในวันนี้ดีกว่าหลุมศพในวันหน้า"]),
      choice("work_through", "💪", "ให้ทุกคนทำงานต่อเท่าที่ไหว", "ฝืน", "รักษาผลผลิตแต่เสี่ยงตายจากอ่อนแรง", { resources: { wood: 4 }, metrics: { health: -9, morale: -3 }, casualtyChance: 11, risk: { disease: 18 } }, ["คนป่วยหลายคนยังลากไม้กลับค่าย ปากซีดแต่มือไม่ยอมว่าง", "ผลงานของเดือนนี้มีมากขึ้น แต่จำนวนคนที่ยืนตรงตอนเย็นน้อยลงอย่างน่ากังวล"]),
    ],
  },
  {
    id: "small_theft", title: "อาหารหายจากถุงกลาง", category: "ความไว้ใจ",
    text: "มีอาหารแห้งหายไปจากมุมเก็บของ ไม่มีร่องรอยสัตว์ บางคนเริ่มมองหน้ากันเองด้วยความสงสัย",
    weight: (g) => 5 + (g.metrics.trust < 48 ? 10 : 0) + (g.resources.food < foodNeedFor(g) * 1.7 ? 8 : 0),
    choices: [
      choice("quiet_investigate", "👁️", "สืบเงียบ ๆ ก่อนกล่าวหา", "รอบคอบ", "รักษาความสงบและอาจพบความจริง", { resources: { knowledge: 2 }, metrics: { trust: 2, security: 2 }, path: { survival: 1 } }, ["ผู้นำไม่ได้ประกาศต่อหน้าไฟกลางค่าย แต่เริ่มถามคำถามสั้น ๆ ในเวลาที่ไม่มีใครตั้งตัว", "บางความจริงไม่ควรถูกลากออกมากลางลาน ถ้ายังไม่รู้ว่ามันเป็นแผลหรือรอยขีดข่วน"]),
      choice("public_count", "⚖️", "นับเสบียงต่อหน้าทุกคน", "โปร่งใส", "ลดข่าวลือแต่ทำให้บรรยากาศตึง", { metrics: { fairness: 6, trust: 2, morale: -2 }, path: { family: 1 } }, ["ถุงอาหารถูกนับทีละใบต่อหน้าทุกคน เสียงเมล็ดแห้งในถุงดังเหมือนค้อนของผู้พิพากษา", "ข่าวลือลดลง แต่ไม่มีใครลืมว่ามันเคยเกิดขึ้น"]),
      choice("punish", "🛡️", "ลงโทษคนที่น่าสงสัยทันที", "แข็งกร้าว", "หยุดความกลัวบางส่วนแต่เสี่ยงอยุติธรรม", { metrics: { security: 4, trust: -8, morale: -3, fairness: -6 }, path: { fortress: 1 } }, ["คำสั่งลงโทษทำให้ค่ายเงียบลงทันที แต่ความเงียบที่ตามมาไม่ได้เหมือนความยุติธรรม", "คนบางคนรู้สึกปลอดภัยขึ้น คนบางคนเริ่มซ่อนความคิดของตนเองลึกกว่าเดิม"]),
    ],
  },
  {
    id: "hunting_accident", title: "หอกลื่นกลางป่า", category: "อุบัติเหตุ",
    text: "คนออกหาอาหารคนหนึ่งลื่นบนดินเปียก หอกเฉียดสีข้างจนเลือดซึมกลับค่าย เหตุเล็ก ๆ นี้เตือนว่าป่าไม่ใช่คลังอาหารที่เปิดฟรี",
    weight: (g) => 5 + (g.labor.forage >= 4 ? 14 : 0) + (riskPreview(g).accident > 45 ? 8 : 0),
    choices: [
      choice("treat_hunter", "🌿", "หยุดงานล่าและรักษาแผล", "ปลอดภัย", "อาหารน้อยลงแต่ลดตายจากแผล", { resources: { food: -5, herbs: -1 }, metrics: { health: 6, trust: 2 }, path: { survival: 1 } }, ["แผลถูกล้างด้วยน้ำต้มและสมุนไพร คนเจ็บกัดฟันไม่ให้ร้องเมื่อผ้าถูกมัดแน่น", "อาหารเดือนนี้น้อยลง แต่ค่ายยังมีคนให้กลับมาล่าในเดือนหน้า"]),
      choice("rotate_hunters", "🔁", "สลับคนล่าและให้พรานสอนเด็กฝึก", "ระยะยาว", "ลดความเสี่ยงอนาคตและเพิ่มความรู้", { resources: { knowledge: 5 }, metrics: { security: 2, morale: 1 }, path: { knowledge: 1 } }, ["พรานอาวุโสสอนให้ดูดินก่อนดูสัตว์ ดูลมก่อนดูรอยเท้า", "ค่ายได้อาหารน้อยลงนิดหน่อย แต่ได้คนที่รู้ว่าความกล้าต่างจากความประมาท"]),
      choice("keep_hunting", "🏹", "ให้ล่าต่อเพราะอาหารใกล้หมด", "จำเป็น", "อาหารเพิ่มแต่เสี่ยงบาดเจ็บ/ตาย", { resources: { food: 12 }, metrics: { health: -5, morale: -1 }, casualtyChance: 13, risk: { accident: 15, beast: 8 }, path: { survival: 1 } }, ["คนเจ็บถูกพากลับ แต่กลุ่มล่ายังเดินต่อเพราะถุงอาหารเบาเกินไป", "ความจำเป็นไม่เคยนุ่มนวล มันเพียงชี้ไปทางป่าแล้วบอกให้เดิน"]),
    ],
  },
  {
    id: "construction_fall", title: "ตกจากโครงที่พัก", category: "อุบัติเหตุก่อสร้าง",
    text: "เสาไม้เปียกลื่น คนงานคนหนึ่งพลาดตกลงมาจากโครงที่พัก เสียงกระแทกทำให้ทุกคนหยุดมือพร้อมกัน",
    weight: (g) => 5 + (g.labor.build >= 3 ? 12 : 0) + (g.resources.tools <= 3 ? 6 : 0),
    choices: [
      choice("stop_build", "🛑", "หยุดงานและตรวจโครงสร้าง", "ปลอดภัย", "งานช้าแต่ลดตายเพิ่ม", { metrics: { health: 5, trust: 3 }, path: { survival: 1 } }, ["ค้อนถูกวางลง โครงไม้ถูกตรวจทีละจุด ไม่มีใครชอบการหยุดงาน แต่ทุกคนเห็นรอยเลือดบนดิน", "บางวันการก้าวช้าลงคือวิธีไม่ทิ้งใครไว้ใต้ซากไม้"]),
      choice("build_scaffold", "🪜", "ทำค้ำยันและทางเดินชั่วคราว", "ลงทุน", "ใช้ไม้แต่ลดอุบัติเหตุ", { resources: { wood: -6 }, metrics: { health: 4, security: 1 }, path: { knowledge: 1 } }, ["ค้ำยันถูกเสริมเข้ากับโครงไม้ เสียงงานกลับมาอีกครั้ง แต่ช้ากว่าและมั่นคงกว่าเดิม", "คนงานเริ่มเข้าใจว่าความเร็วที่ไม่ฆ่าใครคือความเร็วที่แท้จริง"]),
      choice("rush_deadline", "⏱️", "เร่งต่อเพราะฝนกำลังมา", "เสี่ยง", "ก่อสร้างเร็วแต่มีโอกาสเสียคน", { metrics: { health: -6, morale: -2 }, casualtyChance: 15, risk: { accident: 18 }, path: { survival: 1 } }, ["คนงานกลับขึ้นโครงไม้ก่อนมือจะหายสั่น งานคืบหน้าเร็ว แต่ไม่มีเสียงร้องเพลงเหมือนวันก่อน", "เมื่อฝนใกล้มา บางครั้งคนต้องเลือกระหว่างหลังคาที่เร็วกับกระดูกที่ยังไม่หัก"]),
    ],
  },
  {
    id: "rare_eclipse", title: "เงามืดกลางวัน", category: "เหตุการณ์หายาก",
    rare: true,
    text: "กลางวันกลับมืดลงอย่างผิดธรรมชาติ นกหยุดร้อง เด็ก ๆ ร้องไห้ และผู้ใหญ่หลายคนคุกเข่าก่อนจะรู้ตัวว่างอเข่าลงไปแล้ว",
    weight: (g) => 1 + (g.year > 1 ? 1 : 0),
    choices: [
      choice("calm_people", "🕯️", "ยืนกลางลานและบอกให้ทุกคนจับมือกัน", "ผู้นำ", "ลดความกลัวและสร้างความทรงจำสำคัญ", { metrics: { morale: 7, trust: 6, cohesion: 5 }, path: { faith: 2, family: 1 } }, ["ผู้นำยืนกลางลานในแสงประหลาดและบอกให้ทุกคนจับมือกันจนเงาผ่านไป", "ไม่มีใครเข้าใจท้องฟ้า แต่ทุกคนจำได้ว่าในความมืดนั้น พวกเขาไม่ได้ยืนลำพัง"], { addMemory: { title: "วันที่ดวงอาทิตย์หายไป", text: "เงามืดกลางวันกลายเป็นเรื่องเล่าที่เด็กจะขอให้เล่าซ้ำเมื่อโตขึ้น", effect: "+ความสามัคคีเมื่อเกิดภัยธรรมชาติ", kind: "oath" }, addTrait: "ผู้ยืนใต้เงามืด" }),
      choice("ritual_fire", "🔥", "จุดไฟและทำพิธีขอขมา", "ศรัทธา", "เพิ่มศรัทธาแต่ใช้ทรัพยากร", { resources: { fuel: -3, wood: -2 }, metrics: { morale: 6, cohesion: 3 }, path: { faith: 4 } }, ["กองไฟถูกจุดขึ้นแม้กลางวันยังไม่จบ ควันบางลอยขึ้นสู่ฟ้าที่ไม่ตอบคำถาม", "พิธีอาจไม่เปลี่ยนดวงอาทิตย์ แต่เปลี่ยนวิธีที่คนในค่ายมองกันเอง"]),
      choice("study_sky", "📜", "จดบันทึกปรากฏการณ์", "ความรู้", "เพิ่มความรู้แต่คนบางส่วนหวาดกลัว", { resources: { knowledge: 12 }, metrics: { morale: -2, trust: 1 }, path: { knowledge: 4 } }, ["ผู้จดบันทึกเงาและเวลาอย่างละเอียด ขณะคนอื่นกระซิบว่าเขากล้าหรือบ้า", "ไม่ใช่ทุกความกลัวต้องถูกไหว้ บางความกลัวต้องถูกสังเกต"]),
    ],
  },
  {
    id: "meteor_iron", title: "หินดำจากฟ้า", category: "เหตุการณ์หายาก",
    rare: true,
    text: "กลางคืนมีแสงลากผ่านฟ้า เช้าต่อมาพบหินดำร้อนจาง ๆ อยู่ในหลุมตื้น มันหนักกว่าและแข็งกว่าหินทั่วไป",
    weight: (g) => 1 + (g.leaderFocus === "scout" ? 2 : 0),
    choices: [
      choice("keep_ore", "☄️", "เก็บหินดำไว้ศึกษา", "ความรู้", "ได้แร่และความรู้พิเศษ", { resources: { ore: 3, knowledge: 12 }, metrics: { morale: 3 }, path: { knowledge: 4 } }, ["หินดำถูกห่อด้วยผ้าหนาและวางไว้ใกล้กองไฟเหมือนแขกจากโลกที่ไม่มีใครรู้จัก", "บางคนกลัวมัน บางคนอยากตีมันด้วยค้อน และทุกคนรู้ว่ามันไม่ใช่หินธรรมดา"], { addRumor: { title: "แร่แข็งที่ไฟธรรมดาไม่ยอมกิน", detail: "หากมีเพิงช่างและความรู้มากพอ อาจเปลี่ยนหินดำเป็นเครื่องมือที่คมกว่าเดิม", danger: "กลาง" } }),
      choice("sacred_stone", "🕯️", "ตั้งเป็นหินศักดิ์สิทธิ์กลางค่าย", "ศรัทธา", "เพิ่มขวัญและศรัทธา แต่ยังไม่ใช้ประโยชน์", { metrics: { morale: 8, cohesion: 4 }, path: { faith: 4 } }, ["หินดำถูกตั้งไว้กลางลาน เด็ก ๆ เดินอ้อมมันเหมือนมันฟังได้", "บางครั้งสิ่งที่ตกจากฟ้าไม่ต้องถูกเข้าใจทันที มันเพียงต้องทำให้คนเงยหน้ามองอนาคต"]),
      choice("break_stone", "🔨", "ทุบดูว่าข้างในมีอะไร", "เสี่ยง", "อาจได้แร่ แต่เสี่ยงบาดเจ็บ", { resources: { ore: 4 }, metrics: { health: -2 }, casualtyChance: 5, path: { knowledge: 2 } }, ["ค้อนกระแทกหินดำจนประกายไฟกระเด็น คนที่ยืนใกล้ถอยหลังพร้อมกัน", "ด้านในมีเส้นแร่สีเข้มเหมือนคำสัญญาว่ายุคใหม่อาจเริ่มจากเสียงค้อนครั้งเดียว"]),
    ],
  },
  {
    id: "bandit_scouts", title: "เงาคนบนถนนเก่า", category: "ภัยมนุษย์",
    text: "เวรยามเห็นคนสองสามคนยืนมองค่ายจากถนนเก่าแล้วหายไป ไม่มีใครรู้ว่าพวกเขาเป็นพ่อค้า คนหิว หรือโจรที่กำลังนับจำนวนเรา",
    weight: (g) => 3 + (g.threat > 15 ? 10 : 0) + (g.stage !== "ค่ายพักแรม" ? 5 : 0) + (g.metrics.security < 45 ? 8 : 0),
    choices: [
      choice("show_strength", "🛡️", "จุดไฟเวรยามและโชว์หอกบนทางเข้า", "ข่มขวัญ", "ลดภัยโจรแต่ใช้คนและฟืน", { resources: { fuel: -3 }, metrics: { security: 8, morale: 1 }, threat: -6, path: { fortress: 3 } }, ["หอกถูกปักไว้ข้างทางเข้าและเวรยามเดินให้เห็นชัด คนบนถนนไม่กลับมาในคืนนั้น", "ค่ายยังเล็ก แต่เริ่มรู้วิธีดูไม่เหมือนเหยื่อ"]),
      choice("hide_wealth", "📦", "ซ่อนอาหารและเครื่องมือมีค่า", "ระวัง", "ป้องกันการปล้นแต่ลดความไว้ใจเล็กน้อย", { metrics: { security: 5, trust: -1 }, threat: -3, path: { survival: 1 } }, ["ถุงอาหารและเครื่องมือถูกย้ายไปใต้ผ้าเก่า คนในค่ายรู้สึกปลอดภัยขึ้นและอึดอัดขึ้นพร้อมกัน", "ของที่ซ่อนไว้พ้นจากมือโจรได้ แต่ไม่พ้นจากคำถามของคนที่หิว"]),
      choice("send_envoy", "🤝", "ส่งคนไปถามข่าว", "เปิดหน้า", "อาจได้ข้อมูลหรือเสียคน", { resources: { knowledge: 6 }, metrics: { trust: 1, security: -1 }, casualtyChance: 7, path: { trade: 2 } }, ["คนส่งข่าวเดินออกไปพร้อมผ้าขาวเล็ก ๆ ผูกบนไม้ ไม่มีใครหายใจเต็มปอดจนเขากลับมา", "ข่าวที่ได้ไม่แน่นอนนัก แต่ถนนเก่าเริ่มมีชื่อในความคิดของค่าย"]),
    ],
  },
  {
    id: "trader_passes", title: "พ่อค้าเกวียนเดี่ยว", category: "การค้า",
    text: "เกวียนเล็กคันหนึ่งผ่านทางเก่า เจ้าของมีเกลือ เข็ม เหล็กชิ้นเล็ก และข่าวจากถิ่นอื่น แต่ราคาของเขาไม่เคยถูก",
    weight: (g) => 4 + (g.stage !== "ค่ายพักแรม" ? 6 : 0) + (g.metrics.security > 35 ? 3 : 0),
    choices: [
      choice("buy_tools", "🧰", "แลกอาหารกับเครื่องมือ", "ลงทุน", "ลดอาหารแต่เพิ่มเครื่องมือ", { resources: { food: -8, tools: 3 }, metrics: { morale: 1 }, path: { trade: 2 } }, ["ถุงอาหารเปลี่ยนมือและเครื่องมือใหม่วางลงบนพื้นค่าย เสียงโลหะกระทบกันทำให้คนงานมองด้วยแววตาเหมือนเห็นฤดูใหม่", "การค้าครั้งแรกทำให้ค่ายรู้ว่าพวกเขาไม่ได้อยู่คนเดียวในโลก"]),
      choice("buy_salt", "🧂", "แลกไม้กับเกลือถนอมอาหาร", "เสบียง", "ช่วยลดอาหารเสียในอนาคต", { resources: { wood: -8, knowledge: 4 }, metrics: { morale: 2 }, path: { trade: 1, survival: 1 } }, ["เกลือถุงเล็กถูกส่งต่อเหมือนของวิเศษ มันไม่อิ่มท้อง แต่ทำให้อาหารของวันพรุ่งนี้มีโอกาสอยู่ถึงวันมะรืน", "บางสิ่งมีค่ากว่าอาหารทันที เพราะมันซื้อเวลา"]),
      choice("refuse_trade", "🚫", "ไม่แลกอะไรเพราะทรัพยากรน้อย", "ระวัง", "ไม่เสียทรัพยากรแต่พลาดโอกาส", { metrics: { trust: -1 }, path: { survival: 1 } }, ["พ่อค้าพยักหน้าเหมือนเคยเห็นความยากจนหลายแบบ เขาขับเกวียนต่อไป ทิ้งรอยล้อไว้บนถนน", "ค่ายยังมีของเดิมครบ แต่ข่าวจากภายนอกก็เคลื่อนผ่านไปพร้อมเขา"]),
    ],
  },
  {
    id: "first_grave", title: "หลุมศพแรก", category: "ความทรงจำ",
    text: "ความตายในค่ายเล็กไม่ได้เป็นตัวเลข มันเป็นที่นอนว่าง ถ้วยที่ไม่มีเจ้าของ และชื่อที่ไม่มีใครกล้าเรียกดังเกินไป",
    condition: (g) => g.casualties.length > 0 && !Boolean(g.flags.first_grave_event),
    weight: () => 30,
    choices: [
      choice("oak_grave", "🕯️", "ฝังใต้ต้นโอ๊กและกล่าวชื่อผู้จากไป", "ให้เกียรติ", "ลดบาดแผลทางใจและสร้างความทรงจำร่วม", { resources: { stone: -1 }, metrics: { morale: 4, cohesion: 5, trust: 2 }, path: { faith: 2, family: 2 } }, ["ทุกคนยืนล้อมหลุมเล็กใต้ต้นโอ๊ก ชื่อของผู้จากไปถูกกล่าวช้า ๆ ไม่ใช่เพื่อให้ดินจำ แต่เพื่อให้คนที่เหลือไม่ลืม", "หลุมศพแรกทำให้ค่ายรู้ว่าการอยู่รอดต้องมีที่สำหรับความสูญเสียด้วย"], { addMemory: { title: "หลุมศพแรกใต้ต้นโอ๊ก", text: "ผู้คนเรียนรู้ว่าคนตายไม่ควรถูกนับเพียงในจำนวนที่ลดลง", effect: "+ความสามัคคีหลังเหตุสูญเสีย", kind: "loss" }, setFlag: "first_grave_event" }),
      choice("quiet_burial", "🌙", "ฝังเงียบ ๆ เพื่อให้คนอื่นทำงานต่อ", "จำเป็น", "ลดเวลาสูญเสียแต่ขวัญกำลังใจลด", { metrics: { morale: -3, trust: -2 }, path: { survival: 1 } }, ["หลุมถูกขุดเร็วและกลบเร็วกว่าใจของผู้คนจะตามทัน", "งานเดินต่อ แต่บางความเงียบเดินตามกลับมาถึงกองไฟ"], { setFlag: "first_grave_event" }),
    ],
  },
  {
    id: "deer_migration", title: "ฝูงกวางอพยพผ่านลำธาร", category: "เหตุการณ์หายาก",
    rare: true,
    text: "ยามเช้า ฝูงกวางหลายสิบตัวข้ามลำธารไปทางเหนือ ภาพนั้นงดงามจนหลายคนลืมหายใจ และน่าหิวจนบางคนกำหอกแน่น",
    weight: (g) => 2 + (seasonOf(g.month) === "ฤดูใบไม้ร่วง" ? 5 : 0),
    choices: [
      choice("hunt_deer", "🏹", "ล่าบางส่วนอย่างมีขอบเขต", "พอดี", "ได้อาหารมากและไม่ทำลายฝูง", { resources: { food: 22, hides: 4 }, metrics: { morale: 4 }, casualtyChance: 4, path: { survival: 3 } }, ["พรานเลือกกวางแก่สองตัวและปล่อยฝูงใหญ่ผ่านไป เสียงขอบคุณดังเบากว่าเสียงหิว แต่จริงกว่า", "อาหารกองสูงขึ้น และป่ายังมีชีวิตพอให้กลับมาอีกในปีหน้า"]),
      choice("slaughter", "⚔️", "ล่าให้มากที่สุดก่อนฝูงหนี", "โลภ/จำเป็น", "อาหารจำนวนมากแต่เสี่ยงเจ็บและลดความเคารพธรรมชาติ", { resources: { food: 38, hides: 7 }, metrics: { health: -3, cohesion: -2 }, casualtyChance: 12, path: { survival: 2, faith: -2 } }, ["การล่ากลายเป็นความวุ่นวาย เลือดบนหญ้าเยอะเกินกว่าจะเรียกว่าความจำเป็นอย่างสบายใจ", "ค่ายอิ่ม แต่บางคนมองลำธารแล้วรู้สึกว่าบางอย่างถูกเอาไปมากกว่าเนื้อ"]),
      choice("watch_pass", "🕯️", "ปล่อยฝูงผ่านและจดจำเส้นทาง", "เคารพ", "ได้ความรู้และศรัทธา แต่ไม่เพิ่มอาหาร", { resources: { knowledge: 10 }, metrics: { morale: 3, cohesion: 4 }, path: { faith: 4, knowledge: 2 } }, ["ทั้งค่ายยืนดูฝูงกวางผ่านไป ไม่มีใครขว้างหอก", "ภาพนั้นกลายเป็นเรื่องเล่าที่ไม่ทำให้อิ่ม แต่ทำให้คนรู้สึกว่าตนยังเป็นส่วนหนึ่งของโลก ไม่ใช่เจ้าของทั้งหมดของมัน"]),
    ],
  },
  {
    id: "child_fever", title: "เด็กมีไข้ตอนกลางคืน", category: "สุขภาพครอบครัว",
    text: "เด็กคนหนึ่งตัวร้อนและละเมอทั้งคืน เสียงไอเล็ก ๆ ทำให้ผู้ใหญ่หลายคนตื่นมองกองไฟบ่อยกว่าปกติ",
    weight: (g) => 4 + childrenCount(g) * 3 + (riskPreview(g).disease > 45 ? 8 : 0),
    choices: [
      choice("care_child", "🌿", "ให้คนดูแลทั้งคืนและต้มสมุนไพร", "อ่อนโยน", "ใช้แรงและสมุนไพร แต่ลดโอกาสตาย", { resources: { herbs: -1 }, metrics: { health: 7, morale: 3, trust: 2 }, path: { family: 2 } }, ["กองไฟถูกก่อใหม่ให้คงความอุ่นตลอดคืน มือเล็ก ๆ ถูกจับไว้จนเหงื่อเริ่มซึม", "ไม่มีงานใดคืบหน้าในคืนนั้น แต่บางครั้งการรักษาชีวิตหนึ่งคือการสร้างหมู่บ้านทั้งหมู่บ้าน"], { addMemory: { title: "คืนที่ค่ายเฝ้าไข้เด็ก", text: "ผู้คนจำได้ว่าเด็กไม่ได้รอดเพราะสมุนไพรอย่างเดียว แต่รอดเพราะไม่มีใครปล่อยให้ครอบครัวหนึ่งเฝ้ากลัวตามลำพัง", effect: "+ความสามัคคีเมื่อมีเด็กป่วย", kind: "oath" } }),
      choice("ration_medicine", "📦", "เก็บสมุนไพรไว้สำหรับผู้ใหญ่ที่ทำงานได้", "แข็งจริง", "รักษาทรัพยากร แต่ขวัญกำลังใจลด", { metrics: { morale: -7, trust: -5, health: -3 }, risk: { conflict: 10, disease: 8 }, casualtyChance: 4 }, ["สมุนไพรถูกเก็บไว้ในถุงเดิม ไม่มีใครเถียงเสียงดัง แต่สายตาของพ่อแม่เด็กบอกมากกว่าคำพูด", "การเอาตัวรอดอาจถูกต้อง และยังทิ้งรอยแผลไว้ได้พร้อมกัน"]),
      choice("pray_and_rest", "🕯️", "หยุดงานหนักและให้ค่ายพักครึ่งวัน", "ประคองใจ", "ลดความเหนื่อย เพิ่มกำลังใจ แต่ผลิตน้อยลง", { resources: { food: -3 }, metrics: { morale: 5, health: 4, cohesion: 3 }, path: { faith: 1, family: 1 } }, ["เสียงงานเงียบลงครึ่งวัน เด็กนอนใกล้ไฟและผู้ใหญ่ผลัดกันเล่านิทานเบา ๆ", "บางวันค่ายไม่ได้รอดเพราะทำงานมากขึ้น แต่เพราะหยุดพอให้ร่างกายกลับมาสู้ได้"]),
    ],
  },
  {
    id: "tool_breaks", title: "ขวานด้ามสุดท้ายแตกร้าว", category: "เครื่องมือ",
    text: "ขวานเก่าที่ใช้ตัดไม้ตั้งแต่วันแรกมีรอยแตกยาวตลอดด้าม หากยังฝืนใช้ มันอาจหักกลางงานและพาคนเจ็บไปด้วย",
    weight: (g) => 5 + (g.resources.tools <= 3 ? 12 : 0) + (g.labor.wood + g.labor.build >= 4 ? 6 : 0),
    choices: [
      choice("repair_tool", "⚒️", "หยุดซ่อมเครื่องมือก่อนทำงานต่อ", "รอบคอบ", "ใช้ไม้และเวลาบางส่วน แต่ลดอุบัติเหตุ", { resources: { wood: -4 }, metrics: { health: 4, trust: 2 }, path: { knowledge: 1 } }, ["ด้ามขวานถูกถอดออกและเหลาใหม่อย่างช้า ๆ คนงานบ่นเรื่องเวลาที่เสียไป แต่มือของพวกเขายังครบ", "เครื่องมือที่ซ่อมทันเวลาคือบาดแผลที่ไม่ต้องเกิด"]),
      choice("use_until_break", "🪓", "ใช้ต่อจนกว่าจะหัก", "จำเป็น", "ผลผลิตไม่สะดุด แต่เสี่ยงบาดเจ็บ", { resources: { wood: 8, tools: -1 }, metrics: { health: -3 }, casualtyChance: 10, risk: { accident: 15 } }, ["ขวานยังถูกยกขึ้นลง เสียงไม้แตกดังขึ้นพร้อมเสียงด้ามที่ครางเบา ๆ", "คนทำงานรู้ดีว่าของบางอย่างไม่ได้หักทันที แต่มันเตือนก่อนเสมอ"]),
      choice("teach_handles", "📜", "ให้ Tovin สอนทำด้ามเครื่องมือสำรอง", "เรียนรู้", "เพิ่มความรู้และลดปัญหาในอนาคต", { resources: { knowledge: 7, wood: -3 }, metrics: { trust: 2 }, path: { knowledge: 2 } }, ["Tovin วางไม้หลายท่อนให้เด็กหนุ่มดูและสอนว่าด้ามที่ดีต้องยอมงอเล็กน้อยก่อนจะรับแรง", "บทเรียนเล็ก ๆ นี้อาจช่วยมือของใครบางคนในเดือนที่ยังมาไม่ถึง"]),
    ],
  },
  {
    id: "smoke_cough", title: "ควันกองไฟทำให้คนไอ", category: "สุขาภิบาล",
    text: "ฝนทำให้ทุกคนเบียดใกล้ไฟมากขึ้น ควันวนอยู่ใต้ผ้าใบและเด็กกับผู้เฒ่าเริ่มไอติดต่อกันหลายคืน",
    weight: (g) => 4 + (seasonOf(g.month) === "ฤดูฝน" ? 10 : 0) + (g.buildings.campfire === 0 ? 5 : 0) + (g.researchDone.sanitation ? -6 : 0),
    choices: [
      choice("vent_smoke", "🌬️", "เปิดช่องควันและจัดที่นอนใหม่", "สุขาภิบาล", "ใช้เวลาแต่ลดโรค", { metrics: { health: 7, morale: 1 }, path: { survival: 1, knowledge: 1 } }, ["ผ้าใบถูกยกเป็นช่องเล็ก ๆ แม้ฝนสาดเข้ามาบ้าง แต่อากาศเริ่มกลับมาหายใจได้", "ไม่มีใครเรียกการหายใจสะดวกว่าเทคโนโลยี แต่ทุกคนรู้สึกถึงมันทันที"]),
      choice("endure_smoke", "🔥", "ทนควันเพื่อความอุ่น", "จำยอม", "ไม่เสียงาน แต่โรคทางเดินหายใจเพิ่ม", { metrics: { health: -6, morale: -1 }, casualtyChance: 5, risk: { disease: 12 } }, ["คนในค่ายดึงผ้าคลุมขึ้นปิดจมูกและบอกตัวเองว่าความอุ่นสำคัญกว่าอาการไอ", "ควันไม่ฆ่าในคืนเดียว แต่มันรู้จักวิธีอยู่กับคนจนร่างกายอ่อนลง"]),
      choice("build_wind_screen", "🪵", "ทำฉากกันลมรอบกองไฟ", "ปรับปรุง", "ใช้ไม้แต่ช่วยที่พักและสุขภาพ", { resources: { wood: -6 }, metrics: { health: 4 }, path: { survival: 1 } }, ["ฉากไม้เตี้ย ๆ ถูกตั้งรอบกองไฟ ลมยังลอดผ่าน แต่ควันไม่วนเข้าหน้าเหมือนเดิม", "บางสิ่งก่อสร้างเล็กจนไม่มีชื่อ แต่ทำให้กลางคืนยาวน้อยลง"]),
    ],
  },
  {
    id: "stored_food_mites", title: "แมลงในอาหารแห้ง", category: "เสบียง",
    text: "เมื่อเปิดถุงอาหารแห้ง เมล็ดบางส่วนมีแมลงตัวเล็กคลานอยู่ คนครัวพยายามคัดออก แต่ข่าวแพร่ไปเร็วกว่ามือของนาง",
    weight: (g) => 5 + (g.resources.food > 45 && g.buildings.storage === 0 ? 12 : 0) + (seasonOf(g.month) === "ฤดูร้อน" ? 7 : 0),
    choices: [
      choice("sort_food", "🧺", "คัดอาหารเสียออกอย่างจริงจัง", "ปลอดภัย", "เสียอาหารแต่ลดโรค", { resources: { food: -8 }, metrics: { health: 6, trust: 2 }, path: { survival: 1 } }, ["เมล็ดที่ดีและเสียถูกคัดแยกจนมือชา ถุงอาหารเบาลง แต่กลิ่นเหม็นหวานหายไป", "คนหิวอาจเสียดายอาหาร แต่คนป่วยจะเสียดายชีวิตมากกว่า"]),
      choice("eat_anyway", "🍲", "ต้มรวมให้สุกแล้วกินต่อ", "เสี่ยง", "ประหยัดอาหารแต่เพิ่มโรค", { metrics: { health: -7, morale: -2 }, casualtyChance: 6, risk: { disease: 15 } }, ["หม้อซุปเดือดนานกว่าปกติ แต่ไม่มีความร้อนใดต้มความกังวลให้หายไปได้ทั้งหมด", "อาหารไม่ถูกทิ้ง แต่ความไว้ใจในคลังเสบียงเริ่มมีรอยร้าว"]),
      choice("drying_rack", "☀️", "ทำชั้นตากอาหารชั่วคราว", "เรียนรู้", "ใช้ไม้และเพิ่มความรู้การถนอม", { resources: { wood: -5, knowledge: 6 }, metrics: { health: 3 }, path: { knowledge: 2, survival: 1 } }, ["ชั้นไม้หยาบ ๆ ถูกตั้งรับแดด เมล็ดอาหารถูกเกลี่ยบางจนลมผ่านได้", "ค่ายไม่ได้เรียนรู้จากหนังสืออย่างเดียว บางครั้งเรียนจากถุงอาหารที่เกือบเน่า"]),
    ],
  },
  {
    id: "cold_snap_warning", title: "ลมหนาวมาก่อนเวลา", category: "สัญญาณเตือนฤดูกาล",
    text: "ลมจากเนินเหนือเย็นผิดฤดู ใบไม้แห้งปลิวเร็วขึ้นและผู้เฒ่าบอกว่าหนาวปีนี้อาจมาไวกว่าที่คิด",
    weight: (g) => 3 + (g.month >= 8 ? 8 : 0) + (g.resources.fuel < alivePeople(g).length * 2 ? 5 : 0),
    choices: [
      choice("stock_fuel", "🪵", "เร่งสะสมฟืนก่อนหนาว", "เตรียมพร้อม", "เพิ่มฟืนและลดความเสี่ยงหนาว", { resources: { fuel: 16, wood: 4 }, metrics: { security: 1 }, path: { survival: 2 } }, ["ขวานถูกยกขึ้นก่อนฟ้าสาง ฟืนกองใหม่สูงขึ้นทีละชั้นเหมือนกำแพงเล็ก ๆ ต้านความหนาว", "ค่ายยังไม่อุ่นขึ้นวันนี้ แต่เดือนหน้าจะขอบคุณวันนี้"]),
      choice("patch_shelter", "🛖", "ซ่อมที่พักและอุดช่องลม", "ดูแล", "ใช้ไม้แต่เพิ่มคุณภาพที่พัก", { resources: { wood: -7 }, metrics: { health: 5, morale: 2 }, path: { family: 1, survival: 1 } }, ["ช่องลมถูกอุดด้วยเศษไม้ หนังสัตว์ และความอดทน", "ผนังที่แน่นขึ้นทำให้คนพูดน้อยลงตอนกลางคืน เพราะฟันไม่ต้องกระทบกันนัก"]),
      choice("trust_weather", "🌫️", "คิดว่าคงเป็นแค่ลมผ่าน", "ประหยัด", "ไม่เสียทรัพยากรแต่เพิ่มความเสี่ยงฤดูหนาว", { risk: { weather: 18 }, metrics: { trust: -1 } }, ["บางคนหัวเราะว่าผู้เฒ่ากลัวลมเกินไป แล้วลมก็พัดผ่านเหมือนไม่สนใจคำหัวเราะ", "ธรรมชาติไม่เคยรีบพิสูจน์ตัวเอง มันรอให้คนลืมก่อนเสมอ"], { addDelayed: { id: "winter_bite", months: 2 } }),
    ],
  },
  {
    id: "winter_bite", title: "คืนหนาวกัดกระดูก", category: "ผลจากสัญญาณเตือน",
    text: "คืนหนึ่งอากาศเย็นจนลมหายใจกลายเป็นควัน คนที่ไม่มีผ้าคลุมพอเริ่มสั่นจนพูดไม่ชัด",
    weight: (g) => seasonOf(g.month) === "ฤดูหนาว" ? 12 : 4,
    choices: [
      choice("share_blankets", "🧣", "ให้คนแข็งแรงแบ่งผ้าคลุมแก่เด็กและผู้เฒ่า", "เสียสละ", "เพิ่มความสามัคคีและลดตาย", { metrics: { cohesion: 6, morale: 3, health: 3 }, path: { family: 2 } }, ["ผ้าคลุมถูกส่งต่อจากไหล่ที่แข็งแรงกว่าไปยังร่างที่สั่นกว่า", "ไม่มีใครอุ่นพอ แต่ทุกคนหนาวอย่างมีเพื่อน"]),
      choice("burn_extra_wood", "🔥", "เผาไม้เพิ่มทั้งคืน", "อยู่รอด", "ใช้ไม้/ฟืนแต่ลดหนาวตาย", { resources: { wood: -8, fuel: -6 }, metrics: { health: 6, morale: 1 }, path: { survival: 2 } }, ["กองไฟถูกเลี้ยงจนฟ้าสาง ไม้กองหนึ่งหายไป แต่เสียงไอของเด็กเบาลง", "บางครั้งทรัพยากรถูกสร้างมาเพื่อให้มันหายไปแทนชีวิตคน"]),
      choice("save_fuel", "🪵", "ประหยัดฟืนเพราะฤดูหนาวยังยาว", "คำนวณ", "เก็บฟืนแต่เสี่ยงเจ็บ/ตาย", { resources: { fuel: 3 }, metrics: { health: -8, morale: -4 }, casualtyChance: 14, risk: { weather: 18 } }, ["ไฟถูกปล่อยให้เล็กลงเพื่อรักษาฟืนสำหรับคืนถัดไป", "การคิดระยะยาวเป็นสิ่งจำเป็น แต่ร่างกายของคนไม่ใช่บัญชีที่รอได้เสมอ"]),
    ],
  },
  {
    id: "old_map_fragment", title: "แผ่นหนังวาดทางเก่า", category: "ข่าวลือ",
    text: "ระหว่างเก็บไม้พบแผ่นหนังเก่าซุกในโพรงไม้ มีเส้นทางไปยังสัญลักษณ์รูปถ้ำและเครื่องหมายที่ดูเหมือนแหล่งน้ำ",
    weight: (g) => 4 + (g.leaderFocus === "scout" ? 8 : 0) + (g.resources.knowledge > 20 ? 2 : 0),
    choices: [
      choice("follow_map", "🧭", "ส่งคนตามรอยแผนที่", "สำรวจ", "เปิด เหตุการณ์ต่อเนื่อง ถ้ำเก่า", { resources: { knowledge: 4 }, metrics: { security: -1 }, casualtyChance: 5, path: { knowledge: 2 } }, ["แผนที่ถูกกางบนเข่า เส้นเก่าแทบจางหาย แต่พอเทียบกับลำธารและเนินเขา มันยังพอพูดได้", "คนสำรวจออกเดินพร้อมมีด น้ำ และคำสัญญาว่าจะกลับก่อนค่ำ"], { addDelayed: { id: "cave_mouth", months: 1 }, addRumor: { title: "ถ้ำเก่าหลังเนินตะวันออก", detail: "แผนที่เก่าชี้ไปยังปากถ้ำ อาจเป็นที่หลบฝน แหล่งหิน หรือรังสัตว์", danger: "สูง" } }),
      choice("keep_map", "📜", "เก็บแผนที่ไว้ก่อนจนค่ายมั่นคง", "ระวัง", "ได้ความรู้เล็กน้อยและไม่เสี่ยง", { resources: { knowledge: 6 }, metrics: { trust: 1 }, path: { survival: 1 } }, ["แผนที่ถูกห่อไว้ในผ้าแห้ง ยังไม่มีใครเดินตามมัน แต่ทุกคนรู้ว่าขอบโลกของค่ายกว้างขึ้นอีกนิด", "บางข่าวลือควรถูกเก็บไว้จนมีรองเท้าพอสำหรับการตามหา"]),
      choice("dismiss_map", "🚫", "คิดว่าเป็นเรื่องหลอกเด็ก", "ไม่สนใจ", "ไม่เสียอะไร แต่พลาดโอกาส", { metrics: { trust: -1 } }, ["แผ่นหนังถูกวางไว้ข้างกองไฟอย่างไม่ใส่ใจ เส้นทางเก่ายังคงอยู่ แม้ไม่มีใครมองมัน", "โอกาสบางอย่างไม่ตะโกน มันเพียงรอให้คนสังเกต"]),
    ],
  },
  {
    id: "cave_mouth", title: "ปากถ้ำใต้รากไม้", category: "เหตุการณ์ต่อเนื่อง",
    text: "คนสำรวจกลับมาพร้อมโคลนเต็มรองเท้า พวกเขาพบปากถ้ำเล็กใต้รากไม้ใหญ่ กลิ่นอับจากข้างในปนกับกลิ่นสัตว์และหินเย็น",
    weight: () => 0,
    choices: [
      choice("enter_cave", "🕯️", "เข้าไปสำรวจด้วยคบไฟ", "เสี่ยงสูง", "อาจได้หิน แร่ หรือบาดเจ็บ", { resources: { stone: 16, ore: 1, knowledge: 8 }, metrics: { morale: 2 }, casualtyChance: 12, path: { knowledge: 3 } }, ["คบไฟส่องผนังถ้ำที่มีรอยขูดเก่า ไม่รู้ว่าเป็นรอยคนหรือสัตว์", "พวกเขากลับมาพร้อมหินดี แร่ดำเล็กน้อย และความเงียบที่บอกว่าข้างในยังมีอะไรอีกมาก"], { addDelayed: { id: "cave_followup", months: 2 } }),
      choice("mark_and_leave", "🪧", "ทำเครื่องหมายแล้วกลับมาเมื่อพร้อม", "ปลอดภัย", "เก็บข่าวลือไว้ ลดเสี่ยง", { resources: { knowledge: 4 }, metrics: { security: 2 }, path: { survival: 1 } }, ["สัญลักษณ์ถูกสลักไว้บนต้นไม้ คนสำรวจถอยกลับก่อนเงาในถ้ำจะยาวเกินไป", "ความกล้าบางครั้งคือการรู้ว่าวันนี้ยังไม่ใช่วันลงไปลึกกว่าเดิม"]),
      choice("seal_cave", "🪨", "กลบปากถ้ำเพราะกลัวสัตว์ออกมา", "ป้องกัน", "ลดภัยสัตว์แต่เสียโอกาส", { resources: { stone: -2 }, metrics: { security: 5, morale: -1 }, path: { fortress: 1 } }, ["หินถูกกลิ้งมาปิดปากถ้ำจนเหลือเพียงลมเย็นลอดออกมา", "บางประตูถูกปิดเพื่อให้คนหลับได้ แม้ไม่มีใครรู้ว่ามันปิดสมบูรณ์จริงหรือไม่"]),
    ],
  },
  {
    id: "cave_followup", title: "เสียงจากถ้ำเก่า", category: "เหตุการณ์ต่อเนื่อง",
    text: "สองเดือนหลังการสำรวจถ้ำ เด็กคนหนึ่งบอกว่าได้ยินเสียงคล้ายหินตกจากทิศตะวันออก เวรยามบางคนสาบานว่าเห็นตาคู่หนึ่งสะท้อนแสง",
    weight: () => 0,
    choices: [
      choice("organize_expedition", "🛡️", "จัดทีมพร้อมเวรยามไปตรวจ", "มีระเบียบ", "ใช้แรงแต่ปลอดภัยกว่า", { resources: { knowledge: 10, stone: 8 }, metrics: { security: 4 }, casualtyChance: 5, path: { knowledge: 2, fortress: 1 } }, ["คราวนี้พวกเขาไปเป็นทีม มีเชือก คบไฟ และคนเฝ้าปากถ้ำ", "สิ่งที่พบไม่ใช่สัตว์ใหญ่ แต่เป็นทางแคบสู่หินคุณภาพดีและรอยฝีมือมนุษย์เก่ากว่าค่ายมาก"]),
      choice("ignore_cave_sound", "🌙", "ห้ามเด็กเข้าใกล้และไม่ตรวจต่อ", "หลีกเลี่ยง", "ไม่เสี่ยงทันที แต่ข่าวลือยังอยู่", { metrics: { morale: -1 }, risk: { beast: 6 } }, ["คำสั่งห้ามถูกประกาศชัดเจน เด็ก ๆ พยักหน้าอย่างเชื่อฟังเกินไป", "ไม่มีใครเข้าใกล้ถ้ำ แต่เรื่องเล่าของมันเดินเข้าค่ายทุกคืน"]),
      choice("send_young_hunters", "🏹", "ส่งพรานหนุ่มไปเร็ว ๆ", "ประหยัด", "อาจได้ผลเร็วแต่เสี่ยงสูง", { resources: { food: 4, knowledge: 6 }, casualtyChance: 16, risk: { accident: 12, beast: 10 }, path: { survival: 1 } }, ["พรานหนุ่มออกเดินก่อนแสงเช้าจะเต็มฟ้า พวกเขากลับมาพร้อมรอยข่วนและเรื่องที่เล่าไม่ตรงกัน", "ความเร็วทำให้รู้เร็วขึ้น แต่ไม่ได้แปลว่ารู้อย่างปลอดภัย"]),
    ],
  },
  {
    id: "new_family_arrives", title: "ครอบครัวเร่ร่อนขอที่พัก", category: "ประชากร",
    text: "ครอบครัวเล็ก ๆ ห้าคนมาถึงพร้อมเกวียนครึ่งพัง พวกเขามีเด็กสองคน คนแก่หนึ่งคน และมือทำงานได้เพียงสองคู่",
    weight: (g) => 3 + (g.stage !== "ค่ายพักแรม" ? 10 : 0) + (g.metrics.security > 45 ? 5 : 0),
    choices: [
      choice("accept_family", "🏡", "รับพวกเขาเข้าค่าย", "เติบโต", "เพิ่มประชากรแต่เพิ่มภาระอาหาร/ที่พัก", { population: 3, metrics: { morale: 4, trust: 3 }, resources: { food: -6 }, path: { family: 3 } }, ["ค่ายขยับที่นอนให้คนใหม่ เด็กเก่ามองเด็กใหม่ด้วยความสงสัย ก่อนจะเริ่มแบ่งกิ่งไม้เล่นด้วยกัน", "การเติบโตไม่เคยมาเฉพาะแรงงาน มันพาความหิว ความหวัง และเสียงใหม่มาด้วย"]),
      choice("trial_month", "⚖️", "ให้พักหนึ่งเดือนก่อนตัดสิน", "ระวัง", "เพิ่มแรงงานชั่วคราวและลดความเสี่ยง", { population: 1, metrics: { fairness: 3, trust: 1 }, resources: { food: -3 }, path: { survival: 1 } }, ["พวกเขาได้ที่นอนใกล้ขอบค่าย ไม่ใช่กลางลาน แต่ก็ไม่ใช่ป่ามืด", "ความเมตตาที่มีเงื่อนไขยังเป็นความเมตตา หากเงื่อนไขไม่กลืนหัวใจของมัน"]),
      choice("turn_away_family", "🚪", "ปฏิเสธเพราะเสบียงยังไม่พอ", "ป้องกันตนเอง", "รักษาทรัพยากรแต่ลดขวัญ", { metrics: { morale: -5, trust: -2 }, path: { fortress: 1 } }, ["เกวียนครึ่งพังหันกลับไปทางถนนเก่า เด็กคนหนึ่งมองค่ายจนลับตา", "ค่ายรอดอาหารมื้อนี้ แต่บางคนในค่ายจะจำสายตานั้นไปอีกนาน"], { addMemory: { title: "ครอบครัวที่ถูกปฏิเสธ", text: "การปิดประตูช่วยเสบียง แต่ทิ้งคำถามว่าถ้าวันหนึ่งเราเป็นฝ่ายยืนอยู่นอกประตูบ้าง ใครจะเปิดให้", effect: "+ความระแวงและบาดแผลทางศีลธรรม", kind: "trauma" } }),
    ],
  },
  {
    id: "work_quarrel", title: "คนล่ากับคนก่อสร้างทะเลาะเรื่องส่วนแบ่ง", category: "ความขัดแย้งภายใน",
    text: "พรานบอกว่าเขาเสี่ยงชีวิตในป่า ส่วนคนก่อสร้างบอกว่าถ้าไม่มีหลังคา อาหารก็ไม่มีที่กินอย่างปลอดภัย เสียงโต้เถียงดังขึ้นใกล้กองไฟ",
    weight: (g) => 5 + (g.metrics.fairness < 52 ? 10 : 0) + (g.labor.forage >= 3 && g.labor.build >= 2 ? 6 : 0),
    choices: [
      choice("equal_shares", "⚖️", "ยืนยันว่าอาหารแบ่งเท่ากัน", "ยุติธรรม", "เพิ่มความเป็นชุมชนแต่คนเสี่ยงสูงอาจไม่พอใจ", { metrics: { fairness: 7, cohesion: 3, morale: -1 }, path: { family: 1 } }, ["ชามทุกใบยังเท่ากัน ผู้นำย้ำว่าค่ายนี้ไม่มีท้องใดมีค่าน้อยกว่าอีกท้อง", "ความยุติธรรมไม่ได้ทำให้ทุกคนพอใจ แต่มันทำให้กฎยืนได้"]),
      choice("risk_bonus", "🏹", "ให้คนเสี่ยงชีวิตได้ส่วนพิเศษเล็กน้อย", "ตอบแทนความเสี่ยง", "เพิ่มแรงจูงใจแต่ลดความเท่าเทียม", { metrics: { morale: 3, fairness: -4, trust: -1 }, path: { survival: 1 } }, ["พรานได้เนื้อเพิ่มหนึ่งชิ้น คนอื่นมองจานของตนเองเงียบ ๆ", "การตอบแทนความเสี่ยงอาจถูกต้อง แต่ในค่ายเล็ก ความถูกต้องต้องกินข้าวร่วมโต๊ะกับความรู้สึก"]),
      choice("write_ration_rule", "📜", "ตั้งกฎส่วนแบ่งตามงานและความจำเป็น", "ระบบ", "เพิ่มกฎร่วมและลดเหตุซ้ำ", { resources: { knowledge: 3 }, metrics: { fairness: 4, trust: 3, cohesion: 2 }, path: { knowledge: 1 } }, ["กฎส่วนแบ่งถูกพูดซ้ำจนทุกคนจำได้ ใครป่วย ใครเด็ก ใครเสี่ยงงานหนัก ถูกนับไว้ชัดเจน", "เมื่อกฎยุติธรรมพอ คนไม่ต้องเดาใจผู้นำทุกมื้อ"]),
    ],
  },
  {
    id: "domesticate_goat", title: "แพะหลงทางใกล้ค่าย", category: "อาหารระยะยาว",
    text: "แพะตัวหนึ่งเดินวนใกล้ลำธาร ไม่ดุร้ายและไม่ยอมหนีไกล บางคนเสนอให้เชือดกินทันที บางคนเห็นอนาคตที่มีน้ำนม",
    weight: (g) => 3 + (seasonOf(g.month) === "ฤดูใบไม้ผลิ" ? 5 : 0) + (g.stage !== "ค่ายพักแรม" ? 4 : 0),
    choices: [
      choice("keep_goat", "🐐", "จับไว้เลี้ยงและทำคอกเล็ก", "ระยะยาว", "ใช้ไม้/แรง แต่เปิดทางอาหารยั่งยืน", { resources: { wood: -6, food: -2 }, metrics: { morale: 4 }, path: { survival: 2, family: 1 } }, ["แพะถูกผูกไว้ใกล้ที่พัก เด็ก ๆ ตั้งชื่อให้มันก่อนผู้ใหญ่จะตกลงกันเสียอีก", "มันยังไม่ใช่ฝูงสัตว์ แต่เป็นความคิดแรกว่าค่ายไม่จำเป็นต้องไล่ตามอาหารเสมอไป"], { addMemory: { title: "แพะตัวแรกของค่าย", text: "สัตว์ตัวเล็กทำให้คนเริ่มคิดถึงการเลี้ยงดูแทนการไล่ล่า", effect: "+โอกาสปลดล็อกอาหารยั่งยืน", kind: "lesson" } }),
      choice("slaughter_goat", "🍖", "เชือดเป็นอาหารคืนนี้", "ปากท้อง", "อาหารทันทีแต่เสียโอกาสระยะยาว", { resources: { food: 14, hides: 1 }, metrics: { morale: 2 }, path: { survival: 1 } }, ["เนื้อแพะทำให้คืนนั้นอิ่มกว่าหลายคืนที่ผ่านมา เด็กบางคนถามว่าทำไมต้องฆ่ามันหลังเพิ่งตั้งชื่อ", "ความหิวตอบคำถามได้เร็ว แต่ไม่เคยตอบอย่างอ่อนโยน"]),
      choice("release_goat", "🌿", "ปล่อยไปเพราะอาจมีเจ้าของ", "ศีลธรรม", "เพิ่มศรัทธา/ขวัญ แต่ไม่ได้ทรัพยากร", { metrics: { morale: 3, cohesion: 3 }, path: { faith: 2 } }, ["เชือกถูกคลาย แพะเดินออกไปช้า ๆ เหมือนไม่เข้าใจว่ามันเกือบกลายเป็นมื้อเย็น", "บางคนหิวกว่าเดิม แต่หลับง่ายขึ้น"]),
    ],
  },
  {
    id: "spring_flood", title: "น้ำหลากจากลำธาร", category: "ภัยธรรมชาติ",
    text: "ฝนบนเนินสูงทำให้น้ำในลำธารขึ้นเร็วเกินคาด ขอบค่ายเริ่มเป็นโคลนและของเบาบางชิ้นลอยไปกับน้ำ",
    weight: (g) => 4 + (seasonOf(g.month) === "ฤดูฝน" ? 12 : 0) + (g.buildings.well === 0 ? 2 : 0),
    choices: [
      choice("move_supplies", "📦", "ย้ายเสบียงขึ้นที่สูงก่อน", "ป้องกัน", "ลดของเสียแต่ใช้แรง", { resources: { food: -2 }, metrics: { security: 4, trust: 2 }, path: { survival: 1 } }, ["ถุงอาหารและเครื่องมือถูกยกขึ้นกองบนพื้นสูง มือหลายคู่ลื่นโคลนแต่ไม่มีใครหยุด", "น้ำเอาอะไรไปได้น้อยลงเมื่อคนทำงานก่อนมันมาถึง"]),
      choice("dig_channels", "⛏️", "ขุดร่องระบายน้ำรอบที่พัก", "ลงแรง", "ใช้แรงและเสี่ยงเจ็บ แต่ช่วยระยะยาว", { resources: { stone: 2 }, metrics: { health: 2, security: 3 }, casualtyChance: 6, path: { knowledge: 1, survival: 1 } }, ["ร่องน้ำหยาบ ๆ ถูกขุดจนฝนกับเหงื่อแยกไม่ออก", "เมื่อกระแสน้ำเปลี่ยนทาง ทุกคนเข้าใจว่าบางครั้งเราชนะธรรมชาติไม่ได้ แต่เบี่ยงมันได้"]),
      choice("wait_flood", "🌧️", "รอให้น้ำลดเอง", "ประหยัดแรง", "ไม่เสียแรงแต่เสี่ยงของเสียและโรค", { resources: { food: -7, wood: -4 }, metrics: { health: -5, morale: -2 }, risk: { disease: 10, weather: 10 } }, ["คนในค่ายยืนดูน้ำไหลผ่านเหมือนดูใครบางคนหยิบของของตนเองไปโดยไม่ขอ", "น้ำลดในที่สุด แต่กลิ่นโคลนยังอยู่กับที่นอนอีกหลายคืน"]),
    ],
  },
  {
    id: "forest_herbs", title: "พบดงสมุนไพรหลังฝน", category: "ทรัพยากร",
    text: "หลังฝนหยุด Sela พบพืชใบกลิ่นฉุนขึ้นเป็นหย่อมใกล้หินชื้น Old Ren ยืนยันว่ามันใช้ล้างแผลและลดไข้ได้",
    weight: (g) => 4 + (seasonOf(g.month) === "ฤดูฝน" ? 7 : 0) + (g.labor.forage > 0 ? 3 : 0),
    choices: [
      choice("harvest_carefully", "🌿", "เก็บอย่างระวังและเหลือรากไว้", "ยั่งยืน", "ได้สมุนไพรและความรู้", { resources: { herbs: 6, knowledge: 5 }, metrics: { health: 3 }, path: { knowledge: 2 } }, ["ใบถูกตัดเหนือรากและมัดเป็นกำเล็ก ๆ Old Ren ยิ้มบางเหมือนเห็นเพื่อนเก่ากลับมา", "การเก็บไม่หมดคือคำสัญญาว่าปีหน้าจะยังมีให้รักษา"]),
      choice("strip_all", "🧺", "เก็บให้หมดก่อนคนอื่นหรือสัตว์เจอ", "โลภ/จำเป็น", "ได้มากทันทีแต่เสียโอกาสอนาคต", { resources: { herbs: 10 }, metrics: { cohesion: -2 }, path: { survival: 1 } }, ["ดงสมุนไพรถูกเก็บจนดินโล่ง มือของคนเก็บเต็ม แต่สายตาของ Old Ren หนักลง", "สิ่งที่หมดในวันนี้อาจไม่มีให้คนป่วยในวันหน้า"]),
      choice("teach_children", "👧", "ให้เด็กเรียนรู้วิธีจำแนกใบ", "รุ่นต่อไป", "ความรู้เพิ่มและเด็กมีตัวตน", { resources: { herbs: 3, knowledge: 8 }, metrics: { morale: 3 }, path: { family: 1, knowledge: 2 } }, ["เด็ก ๆ ดมใบทีละชนิดและทำหน้าเหยเกเมื่อเจอกลิ่นขม", "วันหนึ่งพวกเขาจะจำได้ว่าความรู้เริ่มจากใบเล็ก ๆ ในมือ ไม่ใช่ตำราใหญ่"]),
    ],
  },
  {
    id: "found_clay", title: "ดินเหนียวริมตลิ่ง", category: "วัสดุ",
    text: "คนเก็บหินพบดินเหนียวเหนียวหนืดริมตลิ่ง มันปั้นเป็นก้อนได้และเมื่อแห้งแล้วแข็งกว่าดินธรรมดา",
    weight: (g) => 3 + (g.labor.stone > 0 ? 4 : 0) + (g.resources.knowledge > 18 ? 2 : 0),
    choices: [
      choice("make_pots", "🏺", "ทดลองทำภาชนะเก็บอาหาร", "ทดลอง", "เพิ่มความรู้และช่วยถนอมอาหาร", { resources: { knowledge: 7 }, metrics: { morale: 2 }, path: { knowledge: 2, survival: 1 } }, ["ดินเหนียวถูกนวดและปั้นเป็นถ้วยเบี้ยว ๆ ใบแรก มันไม่งามนักแต่ตั้งอยู่ได้", "ภาชนะใบแรกทำให้การเก็บของไม่ใช่แค่กองบนพื้นอีกต่อไป"]),
      choice("mud_bricks", "🧱", "ลองตากเป็นอิฐดินดิบ", "ก่อสร้าง", "ช่วยงานก่อสร้างในอนาคต", { resources: { stone: 4, knowledge: 4 }, metrics: { trust: 1 }, path: { survival: 1 } }, ["ก้อนดินถูกเรียงตากแดดเหมือนขนมแข็ง ๆ ของคนยากจน", "ถ้ามันทนฝนได้ ค่ายอาจมีผนังที่ไม่ใช่แค่ไม้และความหวัง"]),
      choice("ignore_clay", "🪨", "ยังไม่มีเวลาทดลอง", "โฟกัส", "ไม่เสียแรงแต่พลาดความรู้", { metrics: { morale: 0 } }, ["ดินเหนียวถูกทิ้งไว้ริมตลิ่งเหมือนเดิม งานเดือนนี้มีมากพอแล้ว", "ไม่ใช่ทุกโอกาสต้องถูกหยิบทันที แต่บางอย่างอาจไม่รอจนเราว่าง"]),
    ],
  }

];

function getEvent(id: string): GameEvent {
  return events.find((e) => e.id === id) ?? events[0];
}
function pickEvent(game: GameState): string {
  const pending = game.pendingEvents.find((id) => {
    const ev = getEvent(id);
    return !ev.condition || ev.condition(game);
  });
  if (pending) return pending;
  const candidates = events.filter((event) => event.id !== "first_night" && (!event.condition || event.condition(game)) && !game.recentEventIds.includes(event.id));
  const weighted = candidates.map((event) => ({ id: event.id, w: Math.max(0, event.weight(game)) })).filter((x) => x.w > 0);
  const total = weighted.reduce((s, x) => s + x.w, 0);
  if (total <= 0) return "tracks_near_camp";
  let roll = Math.random() * total;
  for (const item of weighted) {
    roll -= item.w;
    if (roll <= 0) return item.id;
  }
  return weighted[0]?.id ?? "tracks_near_camp";
}
function addPerson(game: GameState, role = "ผู้มาใหม่", age?: number): GameState {
  const names = ["Narin", "Boran", "Ysa", "Darin", "Mek", "Sorin", "Lora", "Pavel", "Nia", "Kiran", "Mali", "Arun"];
  const picked = names[Math.floor(Math.random() * names.length)] + ` ${alivePeople(game).length + 1}`;
  const newPerson: Person = { id: uid("person"), name: picked, age: age ?? (18 + Math.floor(Math.random() * 25)), kin: "ผู้มาใหม่", role, skill: Math.random() > 0.6 ? "hunter" : Math.random() > 0.5 ? "builder" : "farmer", health: 68 + Math.floor(Math.random() * 18), morale: 50, fatigue: 0, injured: false, alive: true, traits: ["ยังไม่ถูกพิสูจน์"] };
  return { ...game, people: [...game.people, newPerson] };
}
function addChild(game: GameState): GameState {
  const names = ["Mira", "Lina", "Ren", "Toma", "Sana", "Eli", "Pim", "Noa", "Keta"];
  const name = names[Math.floor(Math.random() * names.length)] + ` ${game.year}`;
  const child: Person = { id: uid("child"), name, age: 0, kin: `House ${game.houseName}`, role: "เด็กแรกเกิด", skill: "child", health: 62 + Math.floor(Math.random() * 15), morale: 70, fatigue: 0, injured: false, alive: true, traits: ["เกิดในค่าย"] };
  return { ...game, people: [...game.people, child] };
}
function woundSomeone(game: GameState, cause: string): GameState {
  const targets = game.people.filter((p) => p.alive && !p.injured && p.age >= 16 && p.health > 35);
  if (targets.length === 0) return game;
  const person = targets[Math.floor(Math.random() * targets.length)];
  const people = game.people.map((p) => p.id === person.id ? { ...p, injured: true, health: clamp(p.health - (18 + Math.random() * 18)), fatigue: clamp(p.fatigue + 25) } : p);
  let g = { ...game, people, metrics: changeMetrics(game.metrics, { health: -3, morale: -2 }) };
  g = addLog(g, `${person.name} บาดเจ็บ`, `${person.name} ได้รับบาดเจ็บจาก${cause} ต้องพักงานและอาจแย่ลงหากไม่มีคนดูแล`, "bad", ["บาดเจ็บ", cause]);
  return g;
}
function killSomeone(game: GameState, cause: string): GameState {
  const targets = game.people.filter((p) => p.alive);
  if (targets.length === 0) return game;
  const weighted = targets.flatMap((p) => p.injured || p.health < 35 || p.age >= 62 ? [p, p, p] : [p]);
  const person = weighted[Math.floor(Math.random() * weighted.length)];
  const story = `${person.name} วัย ${person.age} ปีไม่ได้หายไปเป็นเพียงจำนวนประชากรที่ลดลง หากเหลือไว้เป็นที่นอนว่าง ถ้วยที่ไม่มีมือหยิบ และชื่อที่ทุกคนต้องเรียนรู้ว่าจะเอ่ยอย่างไรโดยไม่ให้เจ็บเกินไป`;
  const people = game.people.map((p) => p.id === person.id ? { ...p, alive: false, injured: false, health: 0, cause } : p);
  const casualty: Casualty = { id: uid("dead"), year: game.year, month: game.month, name: person.name, age: person.age, cause, story };
  let g = { ...game, people, casualties: [casualty, ...game.casualties], metrics: changeMetrics(game.metrics, { morale: -10, health: -4, cohesion: -3 }) };
  g = addLog(g, `${person.name} เสียชีวิต`, story + ` สาเหตุ: ${cause}`, "death", ["ผู้จากไป", cause]);
  if (!g.milestones.includes("first_death")) {
    g = { ...g, milestones: [...g.milestones, "first_death"], pendingEvents: ["first_grave", ...g.pendingEvents] };
  }
  return g;
}
function applyChoice(game: GameState, event: GameEvent, selected: EventChoice): GameState {
  let g: GameState = {
    ...game,
    resources: changeResources(game.resources, selected.delta.resources),
    metrics: changeMetrics(game.metrics, selected.delta.metrics),
    threat: clamp(game.threat + (selected.delta.threat ?? 0), 0, 100),
    pathScores: { ...game.pathScores },
    selectedChoiceId: null,
  };
  if (selected.delta.path) {
    (Object.keys(selected.delta.path) as Array<keyof PathScores>).forEach((key) => {
      g.pathScores[key] = Math.max(0, g.pathScores[key] + (selected.delta.path?.[key] ?? 0));
    });
  }
  if (selected.delta.risk) {
    const r = selected.delta.risk;
    const metricDelta: Partial<Metrics> = {};
    if ((r.conflict ?? 0) > 0) { metricDelta.trust = -(r.conflict ?? 0) / 5; metricDelta.cohesion = -(r.conflict ?? 0) / 6; }
    if ((r.disease ?? 0) > 0 || (r.weather ?? 0) > 0) metricDelta.health = -(((r.disease ?? 0) + (r.weather ?? 0)) / 8);
    if ((r.accident ?? 0) > 0) metricDelta.health = (metricDelta.health ?? 0) - (r.accident ?? 0) / 10;
    if ((r.beast ?? 0) > 0) metricDelta.security = -(r.beast ?? 0) / 6;
    if ((r.food ?? 0) > 0) metricDelta.morale = -(r.food ?? 0) / 8;
    g = { ...g, metrics: changeMetrics(g.metrics, metricDelta), threat: clamp(g.threat + ((r.beast ?? 0) + (r.conflict ?? 0)) / 8, 0, 100) };
  }
  if (selected.delta.population && selected.delta.population > 0) {
    for (let i = 0; i < selected.delta.population; i++) g = addPerson(g);
  }
  if (selected.id === "name_child" || selected.id === "quiet_birth") g = addChild(g);
  if (selected.delta.wounded) {
    for (let i = 0; i < selected.delta.wounded; i++) g = woundSomeone(g, event.title);
  }
  if (selected.addMemory) g = addMemory(g, selected.addMemory);
  if (selected.addRumor) g = { ...g, rumors: [{ id: uid("rumor"), discovered: false, ...selected.addRumor }, ...g.rumors].slice(0, 24) };
  if (selected.addPending) g = { ...g, pendingEvents: [...g.pendingEvents, selected.addPending] };
  if (selected.addDelayed) g = { ...g, delayedEvents: [...g.delayedEvents, selected.addDelayed] };
  if (selected.setFlag) g = { ...g, flags: { ...g.flags, [selected.setFlag]: true } };
  if (selected.addTrait && !g.leaderTraits.includes(selected.addTrait)) g = { ...g, leaderTraits: [...g.leaderTraits, selected.addTrait] };
  const text = selected.story.join("\n\n");
  g = addLog(g, `${event.title}: ${selected.title}`, text, event.rare ? "rare" : "normal", [event.category, selected.tone]);
  const chance = selected.delta.casualtyChance ?? 0;
  if (chance > 0 && Math.random() * 100 < chance) {
    g = Math.random() > 0.45 ? woundSomeone(g, selected.title) : killSomeone(g, `${event.title} / ${selected.title}`);
  }
  return g;
}
function resolveProduction(game: GameState): { game: GameState; changes: string[] } {
  let g = { ...game, labor: normalizeLabor(game) };
  const l = g.labor;
  const season = seasonOf(g.month);
  const warmFood = season === "ฤดูใบไม้ผลิ" || season === "ฤดูร้อน" || season === "ฤดูใบไม้ร่วง";
  const forageRate = (season === "ฤดูหนาว" ? 3 : season === "ฤดูฝน" ? 4 : 5) + (g.origin === "hunter" ? 1 : 0) + g.buildings.farmPlot * (warmFood ? 1.5 : 0.4) + skillCount(g, "hunter") * 0.35;
  const woodRate = 5 + (g.researchDone.stoneTools ? 1 : 0) + (g.buildings.workshop ? 1.2 : 0) + skillCount(g, "builder") * 0.25;
  const stoneRate = 2.5 + (g.researchDone.stoneTools ? 0.8 : 0) + (g.buildings.workshop ? 0.7 : 0) + skillCount(g, "builder") * 0.15;
  const researchRate = 4 + (g.origin === "keeper" ? 1 : 0) + (g.leaderFocus === "study" ? 2 : 0) + skillCount(g, "keeper") * 0.35;
  const foodGain = Math.round(l.forage * forageRate);
  const woodGain = Math.round(l.wood * woodRate);
  const stoneGain = Math.round(l.stone * stoneRate);
  const knowledgeGain = Math.round(l.research * researchRate + (g.leaderFocus === "study" ? 4 : 0));
  const fuelGain = Math.floor(l.wood * 1.4);
  g = { ...g, resources: changeResources(g.resources, { food: foodGain, wood: woodGain, stone: stoneGain, knowledge: knowledgeGain, fuel: fuelGain }) };
  const changes = [`ผลิตอาหาร +${foodGain}`, `ไม้ +${woodGain}`, `หิน +${stoneGain}`, `ความรู้ +${knowledgeGain}`, `ฟืน +${fuelGain}`];
  const foodNeed = foodNeedFor(g);
  if (g.resources.food >= foodNeed) {
    g = { ...g, resources: changeResources(g.resources, { food: -foodNeed }), metrics: changeMetrics(g.metrics, { morale: g.resources.food > foodNeed * 2 ? 1 : 0 }) };
    changes.push(`บริโภคอาหาร -${foodNeed}`);
  } else {
    const shortage = foodNeed - g.resources.food;
    g = { ...g, resources: { ...g.resources, food: 0 }, metrics: changeMetrics(g.metrics, { morale: -8 - shortage, health: -6 - shortage, trust: -4 }) };
    changes.push(`อาหารไม่พอ ขาด ${shortage} หน่วย`);
    if (shortage >= 6 || Math.random() * 100 < 18 + shortage * 4) g = killSomeone(g, "อดอาหารและร่างกายอ่อนแรง");
    else g = woundSomeone(g, "อดอาหารจนล้มป่วย");
  }
  const waterNeed = Math.ceil(alivePeople(g).length * 1.3);
  if (g.resources.water >= waterNeed) {
    g = { ...g, resources: changeResources(g.resources, { water: -waterNeed }) };
    changes.push(`ใช้น้ำ -${waterNeed}`);
  } else {
    const shortage = waterNeed - g.resources.water;
    g = { ...g, resources: { ...g.resources, water: 0 }, metrics: changeMetrics(g.metrics, { health: -7 - shortage, morale: -3 }) };
    changes.push(`น้ำไม่พอ ขาด ${shortage} หน่วย`);
  }
  if (season === "ฤดูหนาว") {
    const fuelNeed = Math.ceil(alivePeople(g).length * 0.7) + Math.max(0, alivePeople(g).length - shelterCapacity(g));
    if (g.resources.fuel >= fuelNeed) {
      g = { ...g, resources: changeResources(g.resources, { fuel: -fuelNeed }) };
      changes.push(`ใช้ฟืนกันหนาว -${fuelNeed}`);
    } else {
      const missing = fuelNeed - g.resources.fuel;
      g = { ...g, resources: { ...g.resources, fuel: 0 }, metrics: changeMetrics(g.metrics, { health: -9 - missing, morale: -5 }) };
      changes.push(`ฟืนไม่พอ ขาด ${missing}`);
      if (Math.random() * 100 < 14 + missing * 5) g = killSomeone(g, "หนาวจัดและไม่มีฟืนพอ");
      else g = woundSomeone(g, "หนาวจัดจนป่วย");
    }
  }
  const spoilBase = g.buildings.storage > 0 ? 0.03 : 0.13;
  const spoilResearch = g.researchDone.foodPreservation ? 0.04 : 0;
  const spoilSeason = season === "ฤดูฝน" || season === "ฤดูร้อน" ? 0.05 : 0;
  const excess = Math.max(0, g.resources.food - 35 - g.buildings.storage * 40);
  const spoil = Math.floor(excess * Math.max(0, spoilBase + spoilSeason - spoilResearch));
  if (spoil > 0) {
    g = { ...g, resources: changeResources(g.resources, { food: -spoil }), metrics: changeMetrics(g.metrics, { morale: -1 }) };
    changes.push(`อาหารเสีย -${spoil}`);
  }
  if (g.construction) {
    const data = buildingData[g.construction.id];
    const power = l.build * (6 + (g.origin === "builder" ? 1 : 0) + (g.buildings.workshop ? 1 : 0) + (g.leaderFocus === "workWithPeople" ? 1 : 0));
    const progress = g.construction.progress + Math.round(power);
    if (progress >= data.work) {
      const finishedId = g.construction.id;
      const milestoneKey = `build-${finishedId}`;
      g = { ...g, buildings: { ...g.buildings, [finishedId]: g.buildings[finishedId] + 1 }, construction: null, metrics: changeMetrics(g.metrics, { morale: 4, trust: 2 }) };
      changes.push(`สร้าง ${data.title} เสร็จ`);
      g = addLog(g, `${data.title} เสร็จสมบูรณ์`, `ผู้คนยืนมอง ${data.title} ใหม่เหมือนมองหลักฐานว่าค่ายนี้กำลังกลายเป็นบ้านจริง ๆ`, "milestone", ["ก่อสร้าง"]);
      if (!g.milestones.includes(milestoneKey)) {
        g = { ...g, milestones: [...g.milestones, milestoneKey] };
        g = addMemory(g, { title: `${data.title} หลังแรก`, text: `${data.title} ทำให้ชีวิตประจำวันของค่ายเปลี่ยนไปอย่างจับต้องได้`, effect: "+ขวัญกำลังใจและความไว้ใจเมื่อสร้างสิ่งสำคัญสำเร็จ", kind: "pride" });
      }
    } else {
      g = { ...g, construction: { ...g.construction, progress } };
      changes.push(`งานก่อสร้าง +${Math.round(power)} ความคืบหน้า`);
    }
  }
  if (g.activeResearch) {
    const data = researchData[g.activeResearch.id];
    const power = l.research * (6 + (g.origin === "keeper" ? 1 : 0)) + (g.leaderFocus === "study" ? 5 : 0);
    const progress = g.activeResearch.progress + Math.round(power);
    if (progress >= data.cost) {
      g = { ...g, researchDone: { ...g.researchDone, [g.activeResearch.id]: true }, activeResearch: null, metrics: changeMetrics(g.metrics, { morale: 3 }) };
      changes.push(`วิจัย ${data.title} สำเร็จ`);
      g = addLog(g, `ค้นพบ: ${data.title}`, data.text, "milestone", ["วิจัย"]);
    } else {
      g = { ...g, activeResearch: { ...g.activeResearch, progress } };
      changes.push(`วิจัย +${Math.round(power)} ความคืบหน้า`);
    }
  }
  g = applyLeaderFocus(g, changes);
  return { game: g, changes };
}
function applyLeaderFocus(game: GameState, changes: string[]): GameState {
  const f = game.leaderFocus;
  let g = game;
  if (f === "workWithPeople") { g = { ...g, metrics: changeMetrics(g.metrics, { trust: 3, morale: 2 }), pathScores: { ...g.pathScores, family: g.pathScores.family + 1 } }; changes.push("ผู้นำลงมือกับชาวบ้าน +ความไว้ใจ"); }
  if (f === "study") { g = { ...g, resources: changeResources(g.resources, { knowledge: 5 }) }; changes.push("ผู้นำศึกษาภูมิปัญญา +ความรู้"); }
  if (f === "trainGuard") { g = { ...g, metrics: changeMetrics(g.metrics, { security: 5 }), threat: clamp(g.threat - 2, 0, 100) }; changes.push("ฝึกเวรยาม +ความปลอดภัย"); }
  if (f === "family") { g = { ...g, metrics: changeMetrics(g.metrics, { morale: 3, cohesion: 3 }) }; changes.push("ดูแลครอบครัว +ขวัญกำลังใจ"); }
  if (f === "scout") { g = { ...g, resources: changeResources(g.resources, { knowledge: 3, water: 4 }), threat: clamp(g.threat + 1, 0, 100) }; changes.push("สำรวจพื้นที่ +ข่าวลือ/ความรู้"); if (Math.random() < 0.18) g = { ...g, rumors: [{ id: uid("rumor"), title: "แสงไฟบนเนินไกล", detail: "กลางคืนมีคนเห็นแสงเล็ก ๆ บนเนิน อาจเป็นค่ายอื่นหรือเพียงฟอสฟอรัสในหนองน้ำ", danger: "กลาง", discovered: false }, ...g.rumors] }; }
  if (f === "mediate") { g = { ...g, metrics: changeMetrics(g.metrics, { fairness: 4, trust: 2, cohesion: 2 }) }; changes.push("ไกล่เกลี่ยข้อขัดแย้ง +ความยุติธรรม"); }
  if (f === "rationPlan") { g = { ...g, metrics: changeMetrics(g.metrics, { fairness: 2, morale: -1 }), resources: changeResources(g.resources, { food: 2 }) }; changes.push("วางแผนเสบียง ลดสูญเสียอาหาร"); }
  if (f === "inspectRations") { g = { ...g, metrics: changeMetrics(g.metrics, { fairness: 4, trust: 2, morale: -1 }), resources: changeResources(g.resources, { food: 1 }) }; changes.push("ผู้นำเปิดคลังและนับเสบียงต่อหน้าทุกคน +ความยุติธรรม"); }
  if (f === "leadForage") { g = { ...g, resources: changeResources(g.resources, { food: 7, hides: Math.random() < 0.25 ? 1 : 0 }), metrics: changeMetrics(g.metrics, { trust: 2, health: -1 }), threat: clamp(g.threat + 1, 0, 100) }; changes.push("ผู้นำนำคนออกหาอาหารด้วยตนเอง +อาหาร แต่เพิ่มความเสี่ยงจากป่า"); if (Math.random() < 0.14) { g = woundSomeone(g, "ผู้นำพาคนออกหาอาหารแล้วเกิดอุบัติเหตุในป่า"); changes.push("การออกหาอาหารนำบาดแผลกลับมาด้วย"); } }
  if (f === "boilHerbs") { if (g.resources.herbs < 2 && g.buildings.healerHut === 0) { changes.push("ตั้งใจจะต้มสมุนไพร แต่สมุนไพรไม่พอ จึงช่วยได้เพียงเฝ้าดูอาการ"); } else { const cost = g.resources.herbs >= 2 ? 2 : 0; g = { ...g, resources: changeResources(g.resources, { herbs: -cost }), metrics: changeMetrics(g.metrics, { health: 6, morale: 1 }) }; changes.push(cost ? "ต้มสมุนไพรแจกทั้งค่าย -สมุนไพร +สุขภาพ" : "หมอยาประคองไข้ด้วยความรู้ที่มี +สุขภาพ"); } }
  if (f === "isolateSick") { g = { ...g, metrics: changeMetrics(g.metrics, { health: 5, trust: 1, morale: -1 }) }; changes.push("แยกผู้ป่วยออกจากที่พักรวม ลดโอกาสโรคแพร่"); }
  if (f === "nightPatrol") { g = { ...g, metrics: changeMetrics(g.metrics, { security: 7, morale: -1 }), threat: clamp(g.threat - 5, 0, 100) }; changes.push("ผู้นำเดินเวรยามกลางคืน +ความปลอดภัย"); }
  if (f === "trackBeasts") { g = { ...g, metrics: changeMetrics(g.metrics, { security: 4 }), resources: changeResources(g.resources, { food: 3 }), threat: clamp(g.threat - 3, 0, 100) }; changes.push("ตามรอยสัตว์ก่อนมันกลับมา ลดภัยสัตว์ป่า"); if (Math.random() < 0.12) { g = woundSomeone(g, "ตามรอยสัตว์ในป่าลึก"); changes.push("การตามรอยสัตว์แลกมาด้วยความเสี่ยง"); } }
  if (f === "campRules") { g = { ...g, metrics: changeMetrics(g.metrics, { fairness: 6, cohesion: 2, trust: -1 }) }; changes.push("ตั้งกติกาแบ่งเสบียงอย่างเปิดเผย +ความยุติธรรม"); }
  if (f === "holdCouncil") { g = { ...g, metrics: changeMetrics(g.metrics, { trust: 3, cohesion: 4, fairness: 2 }) }; changes.push("เรียกประชุมรอบกองไฟ +ความสามัคคี"); }
  if (f === "memorial") { g = { ...g, metrics: changeMetrics(g.metrics, { morale: 3, cohesion: 4, trust: 1 }) }; changes.push("กล่าวชื่อผู้จากไปต่อหน้ากองไฟ ลดบาดแผลทางใจ"); if (!g.memories.some((m) => m.title.includes("ชื่อผู้จากไป"))) g = addMemory(g, { title: "ชื่อผู้จากไปไม่ถูกปล่อยให้หายไป", text: "ค่ายเรียนรู้ว่าความตายที่ถูกจดจำยังสามารถกลายเป็นรากให้คนเป็นยืนต่อได้", effect: "+ความสามัคคีหลังเกิดความสูญเสีย", kind: "loss" }); }
  if (f === "firewoodPlan") { g = { ...g, resources: changeResources(g.resources, { fuel: 6, wood: -1 }), metrics: changeMetrics(g.metrics, { health: 2, morale: -1 }) }; changes.push("จัดเวรเก็บฟืนและซ่อมกองไฟ +ฟืน"); }
  if (f === "repairTools") { if (g.resources.wood < 2) { changes.push("อยากซ่อมเครื่องมือ แต่ไม้สำหรับด้ามและลิ่มไม่พอ"); } else { g = { ...g, resources: changeResources(g.resources, { wood: -2, tools: 1 }), metrics: changeMetrics(g.metrics, { security: 1 }) }; changes.push("ซ่อมเครื่องมือที่เริ่มแตกร้าว -ไม้ +เครื่องมือ"); } }
  if (f === "rainShelter") { if (g.resources.wood < 2) { changes.push("อยากซ่อมรอยรั่ว แต่ไม้ไม่พอสำหรับค้ำผ้าและอุดช่องลม"); } else { g = { ...g, resources: changeResources(g.resources, { wood: -2 }), metrics: changeMetrics(g.metrics, { health: 4, morale: 1 }) }; changes.push("ซ่อมรอยรั่วก่อนฝนลงหนัก ลดโรคจากความชื้น"); } }
  if (f === "winterWatch") { if (g.resources.fuel < 2) { changes.push("อยากดูแลเด็กและผู้เฒ่าให้ดีขึ้น แต่ฟืนไม่พอให้ความอบอุ่นเพิ่ม"); } else { g = { ...g, resources: changeResources(g.resources, { fuel: -2 }), metrics: changeMetrics(g.metrics, { health: 4, trust: 2 }) }; changes.push("ตรวจที่นอนเด็กและผู้เฒ่าก่อนค่ำ ลดโอกาสป่วยจากหนาว"); } }
  if (f === "quietRest") { g = { ...g, metrics: changeMetrics(g.metrics, { morale: 4, health: 2 }) }; g = { ...g, people: g.people.map((p) => p.alive ? { ...p, fatigue: clamp(p.fatigue - 18) } : p) }; changes.push("สั่งพักงานหนักหนึ่งคืน ลดความเหนื่อยของคนในค่าย"); }
  return g;
}
function applyRealismRisks(game: GameState, changes: string[]): GameState {
  let g = game;
  const risk = riskPreview(g);
  g = { ...g, lastRisk: risk };
  const roll = (score: number) => Math.random() * 100 < score;
  if (roll(risk.disease * 0.22)) {
    g = Math.random() < 0.2 && risk.disease > 65 ? killSomeone(g, "โรคและแผลติดเชื้อ") : woundSomeone(g, "ไข้และแผลติดเชื้อ");
    changes.push("เกิดผลกระทบจากโรค/แผลติดเชื้อ");
  }
  if (roll(risk.beast * 0.18)) {
    g = Math.random() < 0.25 && risk.beast > 60 ? killSomeone(g, "สัตว์ป่าหรือหมาป่าโจมตี") : woundSomeone(g, "สัตว์ป่าทำร้าย");
    changes.push("ภัยสัตว์ป่าทิ้งรอยไว้ในค่าย");
  }
  if (roll(risk.accident * 0.16)) {
    g = Math.random() < 0.18 && risk.accident > 65 ? killSomeone(g, "อุบัติเหตุระหว่างทำงานหนัก") : woundSomeone(g, "อุบัติเหตุแรงงาน");
    changes.push("มีอุบัติเหตุจากงานหนัก");
  }
  if (roll(risk.conflict * 0.12)) {
    g = { ...g, metrics: changeMetrics(g.metrics, { trust: -4, cohesion: -3, morale: -2 }), pendingEvents: [...g.pendingEvents, "ration_argument"] };
    changes.push("ความขัดแย้งเริ่มก่อตัว");
  }
  if (roll(risk.weather * 0.15)) {
    g = { ...g, metrics: changeMetrics(g.metrics, { health: -3, morale: -2 }) };
    changes.push("สภาพอากาศกัดกร่อนสุขภาพ");
  }
  const healPower = g.labor.care + g.buildings.healerHut * 2 + (g.origin === "healer" ? 1 : 0) + Math.floor(skillCount(g, "healer") / 2);
  if (healPower > 0) {
    let healed = 0;
    const people = g.people.map((p) => {
      if (!p.alive) return p;
      if ((p.injured || p.health < 75) && healed < healPower) {
        healed++;
        const newHealth = clamp(p.health + 14 + g.buildings.healerHut * 4);
        return { ...p, health: newHealth, injured: newHealth < 58 ? p.injured : false, fatigue: clamp(p.fatigue - 20) };
      }
      return p;
    });
    if (healed > 0) { g = { ...g, people, metrics: changeMetrics(g.metrics, { health: 2 }) }; changes.push(`ดูแลผู้บาดเจ็บ ${healed} คน`); }
  }
  const overwork = Math.max(0, laborTotal(g.labor) - adultWorkers(g));
  const people = g.people.map((p) => {
    if (!p.alive) return p;
    const fatigueGain = p.age >= 16 && p.age < 62 && !p.injured ? Math.max(0, laborTotal(g.labor) / Math.max(1, adultWorkers(g)) * 5 + overwork * 5 - g.labor.care) : -6;
    const fatigue = clamp(p.fatigue + fatigueGain - (g.leaderFocus === "family" ? 2 : 0));
    const health = clamp(p.health - (fatigue > 80 ? 3 : fatigue > 60 ? 1 : 0) + (g.labor.care > 0 ? 1 : 0));
    return { ...p, fatigue, health };
  });
  g = { ...g, people };
  return g;
}
function ageYear(game: GameState, changes: string[]): GameState {
  let g = game;
  const people = g.people.map((p) => {
    if (!p.alive) return p;
    const age = p.age + 1;
    const role = age === 16 ? "แรงงานใหม่" : p.role;
    const skill = age === 16 && p.skill === "child" ? "farmer" : p.skill;
    return { ...p, age, role, skill, health: clamp(p.health - (age > 62 ? 3 : age > 50 ? 1 : 0)), morale: clamp(p.morale + 1), fatigue: clamp(p.fatigue - 18) };
  });
  g = { ...g, people };
  const matured = people.filter((p) => p.alive && p.age === 16).length;
  if (matured) changes.push(`เด็กโตเป็นแรงงานใหม่ ${matured} คน`);
  const elders = people.filter((p) => p.alive && p.age >= 68);
  elders.forEach((p) => {
    if (Math.random() * 100 < Math.max(5, p.age - 66) && p.alive) g = killSpecific(g, p.id, "ชราภาพและร่างกายถึงขีดจำกัด");
  });
  if (alivePeople(g).length > 0 && g.metrics.health > 55 && g.metrics.morale > 50 && shelterCapacity(g) >= alivePeople(g).length && Math.random() * 100 < 22) {
    g = addChild(g);
    g = addLog(g, "เด็กคนใหม่ใต้หลังคาที่เพิ่งตั้ง", "เสียงร้องของเด็กคนใหม่ทำให้ปีที่หนักหน่วงมีความหมายขึ้น ราวกับโลกยอมคืนบางอย่างให้แก่ผู้ที่ยังไม่ยอมแพ้", "good", ["เกิด"]);
    changes.push("มีเด็กเกิดใหม่ 1 คน");
  }
  if (g.stage !== "ค่ายพักแรม" && g.metrics.security > 40 && Math.random() * 100 < 20) {
    g = addPerson(g, "ผู้เดินทางขอเข้าร่วม");
    g = addLog(g, "ผู้เดินทางขอฝากชีวิตไว้กับค่าย", "ชื่อของค่ายเริ่มลอยไปถึงถนนเก่า ผู้ไร้บ้านบางคนเริ่มมองแสงไฟของที่นี่เหมือนคำตอบที่ยังไม่แน่ใจ", "good", ["ประชากร"]);
    changes.push("ผู้เดินทางเข้าร่วม 1 คน");
  }
  return g;
}
function killSpecific(game: GameState, personId: string, cause: string): GameState {
  const person = game.people.find((p) => p.id === personId && p.alive);
  if (!person) return game;
  const people = game.people.map((p) => p.id === personId ? { ...p, alive: false, health: 0, injured: false, cause } : p);
  const story = `${person.name} จากไปด้วย${cause} ชื่อของคนผู้นี้ถูกเก็บไว้ในพงศาวดาร เพื่อให้คนรุ่นหลังจำไว้ว่าหมู่บ้านไม่ได้สร้างขึ้นจากไม้ หิน และกำแพงเท่านั้น แต่สร้างขึ้นจากชีวิตที่ยอมอยู่จนถึงวันสุดท้าย`;
  const casualty: Casualty = { id: uid("dead"), year: game.year, month: game.month, name: person.name, age: person.age, cause, story };
  let g = { ...game, people, casualties: [casualty, ...game.casualties], metrics: changeMetrics(game.metrics, { morale: -7, cohesion: -3 }) };
  g = addLog(g, `${person.name} เสียชีวิต`, story, "death", ["ชราภาพ"]);
  if (!g.milestones.includes("first_death")) g = { ...g, milestones: [...g.milestones, "first_death"], pendingEvents: ["first_grave", ...g.pendingEvents] };
  return g;
}
function resolveDelayed(game: GameState): GameState {
  const nextDelayed: DelayedEvent[] = [];
  const ready: string[] = [];
  game.delayedEvents.forEach((d) => {
    const months = d.months - 1;
    if (months <= 0) ready.push(d.id); else nextDelayed.push({ ...d, months });
  });
  return { ...game, delayedEvents: nextDelayed, pendingEvents: [...ready, ...game.pendingEvents] };
}
function advanceMonth(game: GameState): GameState {
  const event = getEvent(game.currentEventId);
  const selected = event.choices.find((c) => c.id === game.selectedChoiceId) ?? event.choices[0];
  let g = applyChoice(game, event, selected);
  const prod = resolveProduction(g);
  g = prod.game;
  const changes = [...prod.changes];
  g = applyRealismRisks(g, changes);
  g = resolveDelayed(g);
  g = maybeAdvanceStage(g);
  let nextMonth = g.month + 1;
  let nextYear = g.year;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
    g = ageYear(g, changes);
    g = addLog(g, `สรุปปีที่ ${g.year}`, `ปีที่ ${g.year} ผ่านไปพร้อมประชากร ${alivePeople(g).length} คน ผู้จากไปสะสม ${g.casualties.length} คน และความทรงจำ ${g.memories.length} เรื่อง`, "milestone", ["สรุปปี"]);
    changes.push(`ขึ้นปีที่ ${nextYear}`);
  }
  const recent = [event.id, ...g.recentEventIds].slice(0, 7);
  let nextBase: GameState = { ...g, year: nextYear, month: nextMonth, recentEventIds: recent, pendingEvents: g.pendingEvents.filter((id) => id !== event.id), currentEventId: "", selectedChoiceId: null, leaderFocus: "workWithPeople", savedText: "กำลังจดบันทึก..." };
  nextBase = updateCollapseAndGameOver(nextBase);
  const nextEventId = nextBase.gameOver ? event.id : pickEvent(nextBase);
  const modal: SummaryModal = {
    title: `เดือนที่ ${game.month} ปีที่ ${game.year} — ${seasonOf(game.month)}`,
    paragraphs: [
      selected.story[0] ?? "เดือนนี้ผ่านไปอย่างเงียบ ๆ เหมือนลมหายใจที่ไม่มีใครกล้ารบกวน",
      `${seasonMood(seasonOf(game.month))} เมื่อไฟกลางค่ายมอดลง เหลือผู้คน ${alivePeople(nextBase).length} ชีวิต อาหาร ${fmt(nextBase.resources.food)} หน่วย และความปลอดภัย ${pct(nextBase.metrics.security)}`,
      nextBase.gameOver ? `พงศาวดารปิดลงด้วยเหตุ: ${nextBase.gameOver.cause}` : nextBase.casualties.length > game.casualties.length ? "ชื่อของผู้จากไปถูกจดไว้ในพงศาวดาร ไม่ใช่เพื่อทำให้ความสูญเสียเบาลง แต่เพื่อไม่ให้ชีวิตหนึ่งชีวิตหายไปเป็นเพียงตัวเลข" : "เดือนนี้ไม่มีหลุมศพใหม่ และสำหรับค่ายเล็ก ๆ ข่าวเพียงเท่านี้ก็หนักแน่นพอจะให้ทุกคนหายใจได้เต็มปอดอีกครั้ง",
    ],
    changes: nextBase.gameOver ? [...changes, `Game Over: ${nextBase.gameOver.cause}`] : changes,
    kind: nextBase.gameOver || nextBase.casualties.length > game.casualties.length ? "death" : changes.some((c) => c.includes("สำเร็จ") || c.includes("เสร็จ")) ? "milestone" : "normal",
  };
  return { ...nextBase, currentEventId: nextEventId, summaryModal: modal };
}

export default function GamePage() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [view, setView] = useState<View>("เมือง");
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    const setupText = window.localStorage.getItem(setupKey);
    if (!setupText) { router.replace("/"); return; }
    const setup = JSON.parse(setupText) as { leaderName: string; houseName: string; origin: Origin };
    const saveText = window.localStorage.getItem(saveKey);
    if (saveText) {
      try {
        const loaded = JSON.parse(saveText) as GameState;
        if (loaded.version === "0.9.7") { setGame({ ...loaded, summaryModal: null, savedText: "เปิดบันทึกเดิมแล้ว" }); return; }
      } catch {}
    }
    setGame(createInitialGame(setup));
  }, [router]);


  useEffect(() => {
    if (!game) return;
    if (game.year === 1 && game.month === 1 && game.logs.length <= 1 && !window.localStorage.getItem(tutorialKey)) {
      setTutorialOpen(true);
      setTutorialStep(0);
    }
  }, [game?.year, game?.month, game?.logs.length]);

  useEffect(() => {
    if (!game) return;
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(saveKey, JSON.stringify({ ...game, summaryModal: null, savedText: "บันทึกแล้ว" }));
      setGame((prev) => prev ? { ...prev, savedText: "บันทึกอัตโนมัติเรียบร้อย" } : prev);
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [game?.year, game?.month, game?.resources, game?.metrics, game?.people, game?.logs.length]);

  const event = useMemo(() => game ? getEvent(game.currentEventId) : events[0], [game]);
  const availableWorkers = game ? adultWorkers(game) : 0;
  const risk = game ? riskPreview(game) : { food: 0, shelter: 0, disease: 0, beast: 0, conflict: 0, weather: 0, accident: 0 };

  if (!game) return <main className="app"><div className="panel pad">กำลังก่อไฟและเปิดบันทึกค่าย...</div></main>;

  function updateGame(fn: (g: GameState) => GameState) { setGame((prev) => prev ? fn(prev) : prev); }
  function adjustLabor(key: LaborKey, amount: number) {
    updateGame((g) => {
      const current = g.labor[key];
      if (amount > 0 && laborTotal(g.labor) >= adultWorkers(g)) return g;
      const labor = { ...g.labor, [key]: Math.max(0, current + amount) };
      return { ...g, labor };
    });
  }
  function startConstruction(id: BuildingKey) {
    updateGame((g) => {
      if (!buildingUnlocked(g, id) || !hasCost(g, buildingData[id].cost)) return g;
      return { ...payCost(g, buildingData[id].cost), construction: { id, progress: 0 } };
    });
  }
  function startResearch(id: ResearchKey) {
    updateGame((g) => {
      if (!researchUnlocked(g, id) || g.researchDone[id]) return g;
      return { ...g, activeResearch: { id, progress: 0 } };
    });
  }
  function endTurn() { updateGame((g) => g.gameOver ? g : advanceMonth(g)); }
  function restartSameSetup() {
    if (!game) return;
    const setup = { leaderName: game.leaderName, houseName: game.houseName, origin: game.origin };
    window.localStorage.setItem(setupKey, JSON.stringify(setup));
    window.localStorage.removeItem(saveKey);
    setGame(createInitialGame(setup));
    setView("เมือง");
  }
  function dismissTutorial() {
    window.localStorage.setItem(tutorialKey, "1");
    setTutorialOpen(false);
  }
  function showTutorialAgain() {
    window.localStorage.removeItem(tutorialKey);
    setTutorialStep(0);
    setTutorialOpen(true);
  }

  function resetGame() {
    window.localStorage.removeItem(saveKey);
    window.localStorage.removeItem(setupKey);
    router.push("/");
  }

  if (game.gameOver) {
    return <GameOverScreen game={game} restartSameSetup={restartSameSetup} resetGame={resetGame} />;
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand"><div className="brand-mark">⌛</div><span>EVOLUTION<br />OF US</span></div>
        <div className="top-stats">
          <span className="pill">ปี {game.year} · เดือน {game.month}</span>
          <span className="pill">{seasonOf(game.month)}</span>
          <span className="pill good">ระยะ: {game.stage}</span>
          <span className="pill">ประชากร {alivePeople(game).length}</span>
          <span className="pill">แรงงาน {availableWorkers}/{alivePeople(game).filter((p) => p.age >= 16 && p.age < 62).length}</span>
          <span className="pill">ตระกูล {game.houseName}</span>
          <span className="pill warn">ภัยภายนอก {pct(game.threat)}</span>
          <span className={crisisLevel(game) === "ใกล้ล่มสลาย" || crisisLevel(game) === "วิกฤต" ? "pill danger-pill" : "pill good"}>วิกฤต: {crisisLevel(game)}</span>
          <span className="pill good">{game.savedText}</span>
        </div>
        <button className="icon-btn" onClick={() => setView("ตั้งค่า")}>⚙️</button>
      </header>

      <section className="shell">
        <aside className="sidebar">
          <ProfilePanel game={game} />
          <เป้าหมายsPanel game={game} />
          <RiskPanel game={game} risk={risk} />
          <ForecastPanel game={game} />
        </aside>

        <section className="main">
          <nav className="view-tabs">
            {views.map((v) => <button key={v} className={view === v ? "active" : ""} onClick={() => setView(v)}>{viewLabel(v)}</button>)}
          </nav>
          {view === "เมือง" && <CityView game={game} adjustLabor={adjustLabor} applyRecommendedLabor={() => updateGame((g) => ({ ...g, labor: recommendedLabor(g) }))} setFocus={(focus) => updateGame((g) => ({ ...g, leaderFocus: focus }))} />}
          {view === "คน" && <PeopleView game={game} />}
          {view === "ก่อสร้าง" && <BuildView game={game} startConstruction={startConstruction} />}
          {view === "วิจัย" && <ResearchView game={game} startResearch={startResearch} />}
          {view === "Chronicle" && <ChronicleView game={game} />}
          {view === "ตั้งค่า" && <SettingsView game={game} resetGame={resetGame} showTutorialAgain={showTutorialAgain} />}
        </section>

        <aside className="event-panel">
          <EventPanel game={game} event={event} selectChoice={(id) => updateGame((g) => ({ ...g, selectedChoiceId: id }))} endTurn={endTurn} />
          <RumorPanel game={game} />
        </aside>
      </section>

      <nav className="bottom-nav">
        {views.map((v) => <button key={v} className={view === v ? "active" : ""} onClick={() => setView(v)}>{viewLabel(v)}</button>)}
        <button onClick={endTurn}>จบเดือนนี้ →</button>
      </nav>

      {tutorialOpen && (
        <TutorialModal
          step={tutorialStep}
          setStep={setTutorialStep}
          close={dismissTutorial}
        />
      )}

      {game.summaryModal && (
        <div className="modal-backdrop">
          <section className="modal">
            <div className="kicker">บทสรุปของเดือน</div>
            <h2 className="summary-title">{game.summaryModal.title}</h2>
            {game.summaryModal.paragraphs.map((p, i) => <p key={`summary-${i}`} style={{ lineHeight: 1.8 }}>{p}</p>)}
            <h3 className="section-title">ผลลัพธ์ที่เกิดขึ้น</h3>
            <div className="result-grid">
              {categorizeChanges(game.summaryModal.changes).map(([title, items]) => (
                <div key={title} className="result-box">
                  <b>{title}</b>
                  {items.map((c, i) => <p key={`${title}-${i}`}>• {c}</p>)}
                </div>
              ))}
            </div>
            <div className="flex" style={{ justifyContent: "flex-end", marginTop: 18 }}>
              <button className="primary" onClick={() => updateGame((g) => ({ ...g, summaryModal: null }))}>เข้าสู่เดือนถัดไป</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}


function TutorialModal({ step, setStep, close }: { step: number; setStep: (value: number) => void; close: () => void }) {
  const item = tutorialSteps[step] ?? tutorialSteps[0];
  const last = step >= tutorialSteps.length - 1;
  return (
    <div className="modal-backdrop tutorial-backdrop">
      <section className="modal tutorial-modal">
        <div className="split">
          <div>
            <div className="kicker">ระบบสอนเล่น · {step + 1}/{tutorialSteps.length}</div>
            <h2 className="summary-title"><span className="tutorial-icon">{item.icon}</span> {item.title}</h2>
          </div>
          <button className="icon-btn" onClick={close} title="ข้ามการสอน">×</button>
        </div>
        <p className="tutorial-text">{item.text}</p>
        <div className="tutorial-bullets">
          {item.bullets.map((b, i) => <div key={`${item.title}-${i}`} className="tutorial-bullet"><span>✓</span>{b}</div>)}
        </div>
        <div className="tutorial-progress">
          {tutorialSteps.map((_, i) => <button key={`dot-${i}`} className={i === step ? "active" : ""} onClick={() => setStep(i)} aria-label={`ไปหน้าสอนเล่น ${i + 1}`} />)}
        </div>
        <div className="split" style={{ marginTop: 18 }}>
          <button className="secondary" onClick={close}>ข้าม / ไม่แสดงอีก</button>
          <div className="flex">
            <button className="secondary" disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))} style={{ opacity: step === 0 ? .5 : 1 }}>ย้อนกลับ</button>
            <button className="primary" onClick={() => last ? close() : setStep(step + 1)}>{last ? "เข้าใจแล้ว เริ่มเอาชีวิตรอด" : "ถัดไป"}</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function GameOverScreen({ game, restartSameSetup, resetGame }: { game: GameState; restartSameSetup: () => void; resetGame: () => void }) {
  const over = game.gameOver;
  if (!over) return null;
  const deathPreview = game.casualties.slice(0, 5);
  const lastLogs = game.logs.slice(0, 8);
  return (
    <main className="app game-over-page">
      <header className="topbar">
        <div className="brand"><div className="brand-mark">⌛</div><span>EVOLUTION<br />OF US</span></div>
        <div className="top-stats">
          <span className="pill danger-pill">Game Over</span>
          <span className="pill">ตระกูล {game.houseName}</span>
          <span className="pill">อยู่รอด {over.survivedText}</span>
          <span className="pill warn">สาเหตุ: {over.cause}</span>
        </div>
      </header>
      <section className="game-over-shell">
        <article className="panel pad game-over-card">
          <div className="kicker">พงศาวดารปิดฉาก</div>
          <h1>{over.title}</h1>
          {over.text.map((line, i) => <p key={`over-line-${i}`}>{line}</p>)}
          <div className="result-grid" style={{ marginTop: 18 }}>
            {over.finalStats.map((stat, i) => <div className="result-box" key={`${stat.label}-${i}`}><b>{stat.label}</b><p>{stat.value}</p></div>)}
          </div>
          <div className="flex" style={{ marginTop: 18, justifyContent: "flex-end" }}>
            <button className="secondary" onClick={resetGame}>กลับหน้าแรก</button>
            <button className="primary" onClick={restartSameSetup}>เริ่มเกมใหม่จากชื่อเดิม</button>
          </div>
        </article>
        <aside className="panel pad">
          <h3 className="section-title">บันทึกผู้จากไปแบบย่อ</h3>
          {deathPreview.length ? deathPreview.map((c, i) => <div className="compact-death" key={`${c.id}-${i}`}><b>{c.name}</b><small>อายุ {c.age} · ปี {c.year} เดือน {c.month}</small><p>{c.cause}</p></div>) : <div className="empty">ไม่มีรายชื่อผู้จากไป</div>}
          {game.casualties.length > 5 && <details className="details-box"><summary>ดูรายชื่อทั้งหมดอีก {game.casualties.length - 5} คน</summary>{game.casualties.slice(5).map((c, i) => <p key={`${c.id}-more-${i}`}>• {c.name} — {c.cause}</p>)}</details>}
          <h3 className="section-title" style={{ marginTop: 18 }}>พงศาวดารก่อนล่มสลาย</h3>
          <div className="timeline compact">{lastLogs.map((l, i) => <div className={`log ${l.kind}`} key={`${l.id}-${i}`}><b>{l.title}</b><small>ปี {l.year} เดือน {l.month}</small><p>{l.text}</p></div>)}</div>
        </aside>
      </section>
    </main>
  );
}

function ProfilePanel({ game }: { game: GameState }) {
  const alive = alivePeople(game).length;
  const cap = shelterCapacity(game);
  return (
    <section className="panel profile">
      <div className="profile-head">
        <div className="kicker">ผู้ก่อตั้ง</div>
        <h2 className="title">{game.leaderName}</h2>
        <div className="muted">ตระกูล {game.houseName} · {game.stage}</div>
        <div className="flex">{game.leaderTraits.slice(0, 4).map((t, i) => <span key={`${t}-${i}`} className="badge green">{t}</span>)}</div>
      </div>
      <div className="stat-list">
        <MiniStat label="ขวัญกำลังใจ" value={game.metrics.morale} />
        <MiniStat label="ความปลอดภัย" value={game.metrics.security} />
        <MiniStat label="ความไว้ใจ" value={game.metrics.trust} />
        <MiniStat label="สุขภาพชุมชน" value={game.metrics.health} />
        <MiniStat label="ความสามัคคี" value={game.metrics.cohesion} />
        <MiniStat label="ความยุติธรรม" value={game.metrics.fairness} />
      </div>
      <table className="report-table" style={{ marginTop: 14 }}>
        <tbody>
          <tr><td>คนมีชีวิต</td><td>{alive}</td></tr>
          <tr><td>เด็ก / ผู้เฒ่า</td><td>{childrenCount(game)} / {eldersCount(game)}</td></tr>
          <tr><td>บาดเจ็บ/ป่วย</td><td>{woundedCount(game)}</td></tr>
          <tr><td>ที่พักรองรับ</td><td>{cap}/{alive}</td></tr>
          <tr><td>ผู้จากไป</td><td>{game.casualties.length}</td></tr>
          <tr><td>ระดับวิกฤต</td><td>{crisisLevel(game)}</td></tr>
        </tbody>
      </table>
    </section>
  );
}
function MiniStat({ label, value }: { label: string; value: number }) {
  const cls = value < 35 ? "fill danger" : value < 55 ? "fill warn" : "fill";
  return <div className="mini-stat"><span>{label}</span><b>{pct(value)}</b><div className="bar"><div className={cls} style={{ width: `${clamp(value)}%` }} /></div></div>;
}
function เป้าหมายsPanel({ game }: { game: GameState }) {
  return <section className="panel pad"><h3 className="section-title">เป้าหมายระยะนี้</h3>{stageเป้าหมายs(game).map((o) => <div className="objective" key={o.text}><span className={o.done ? "check done" : "check"}>{o.done ? "✓" : "•"}</span><span>{o.text}</span></div>)}</section>;
}
function RiskPanel({ game, risk }: { game: GameState; risk: Risks }) {
  const items: Array<[keyof Risks, string]> = [["food", "อาหาร"], ["shelter", "ที่พัก"], ["disease", "โรค"], ["beast", "สัตว์ป่า"], ["conflict", "ขัดแย้ง"], ["weather", "อากาศ"], ["accident", "อุบัติเหตุ"]];
  const reasons = riskReasons(game, risk);
  return <section className="panel pad"><h3 className="section-title">ความเสี่ยงก่อนจบเดือน</h3><div className="stat-list">{items.map(([k, label]) => <div key={k} className="risk-row"><MiniStat label={`${label}: ${riskLabel(risk[k])}`} value={risk[k]} /><small className="muted">{reasons[k].slice(0, 2).join(" · ")}</small></div>)}</div></section>;
}
function ForecastPanel({ game }: { game: GameState }) {
  return <section className="panel pad"><h3 className="section-title">เดือนหน้าอาจเกิดอะไร</h3><div className="timeline compact">{nextMonthForecast(game).map((line, i) => <div key={`${line}-${i}`} className="forecast-line">• {line}</div>)}</div></section>;
}
function CityView({ game, adjustLabor, applyRecommendedLabor, setFocus }: { game: GameState; adjustLabor: (key: LaborKey, amount: number) => void; applyRecommendedLabor: () => void; setFocus: (key: LeaderFocusKey) => void }) {
  const resources = game.resources;
  const laborLeft = adultWorkers(game) - laborTotal(game.labor);
  const quality = qualityStatus(game);
  const pop = populationBreakdown(game);
  return (
    <div>
      <section className="dashboard-grid">
        <div className="panel kpi"><span className="muted">อาหารคงเหลือ</span><b>{fmt(resources.food)}</b><small>ต้องใช้เดือนนี้ประมาณ {fmt(foodNeedFor(game))}</small></div>
        <div className="panel kpi"><span className="muted">น้ำ / ฟืน</span><b>{fmt(resources.water)} / {fmt(resources.fuel)}</b><small>ฤดูหนาวใช้ฟืนมากขึ้น</small></div>
        <div className="panel kpi"><span className="muted">แรงงานจริง</span><b>{pop.workers}/{pop.adults}</b><small>เด็ก {pop.children} · ผู้เฒ่า {pop.elders} · ป่วย/เจ็บ {pop.injured + pop.sick}</small></div>
        <div className="panel kpi"><span className="muted">คุณภาพชีวิต</span><b>{pct(Math.round((quality.foodQuality + quality.waterQuality + quality.shelterQuality) / 3))}</b><small>อาหาร {pct(quality.foodQuality)} · น้ำ {pct(quality.waterQuality)} · ที่พัก {pct(quality.shelterQuality)}</small></div>
      </section>
      <section className="panel pad" style={{ marginBottom: 14 }}>
        <div className="split"><div><h2 className="title">จัดแรงงานรายเดือน</h2><p className="muted">แรงงานว่าง {laborLeft} คน · งานหนักมากเกินไปจะเพิ่มความเหนื่อยและอุบัติเหตุ</p></div><div className="flex"><button className="secondary" onClick={applyRecommendedLabor}>แนะนำการจัดแรงงาน</button><span className="badge green">ใช้แล้ว {laborTotal(game.labor)}/{adultWorkers(game)}</span></div></div>
        <div className="work-grid">
          {laborMeta.map((item) => <div className="work-card" key={item.id}><div className="work-head"><div><b>{item.icon} {item.title}</b><p className="muted small">{item.text}</p></div><div className="counter"><button onClick={() => adjustLabor(item.id, -1)}>-</button><strong>{game.labor[item.id]}</strong><button onClick={() => adjustLabor(item.id, 1)}>+</button></div></div></div>)}
        </div>
      </section>
      <section className="two-col" style={{ marginBottom: 14 }}>
        <div className="panel pad"><h3 className="section-title">บัญชีทรัพยากรเดือนนี้</h3><table className="report-table"><thead><tr><th>รายการ</th><th>คงเหลือ</th><th>ผลิต</th><th>ใช้</th><th>สุทธิ</th></tr></thead><tbody>{resourceLedger(game).map((row) => <tr key={row.name}><td>{row.name}<br /><small className="muted">{row.note}</small></td><td>{fmt(row.stock)}</td><td className="good-text">+{fmt(row.produced)}</td><td className="danger-text">-{fmt(row.used)}</td><td className={row.net >= 0 ? "good-text" : "danger-text"}>{row.net >= 0 ? "+" : ""}{fmt(row.net)}</td></tr>)}</tbody></table></div>
        <div className="panel pad"><h3 className="section-title">คนสำคัญของค่าย</h3>{alivePeople(game).filter((p) => ["leader", "kael", "tovin", "old-ren", "sela"].includes(p.id)).map((p) => <div key={p.id} className="key-villager"><b>{p.name}</b><small>{p.role} · {p.traits.join(" · ")}</small><span>{p.injured ? "บาดเจ็บ" : p.health < 45 ? "ป่วย" : "พร้อม"}</span></div>)}</div>
      </section>
      <section className="panel pad">
        <div className="split">
          <div>
            <h3 className="section-title">การกระทำของผู้นำเดือนนี้</h3>
            <p className="muted small">ตัวเลือกจะเปลี่ยนตามความเสี่ยง ทรัพยากร ฤดูกาล และเหตุการณ์ที่กำลังเกิดขึ้น</p>
          </div>
          <span className="badge green">เลือกได้ 1 อย่าง / เดือน</span>
        </div>
        <div className="choice-grid leader-action-grid">
          {dynamicLeaderActions(game, getEvent(game.currentEventId)).map((focus) => (
            <button
              key={focus.id}
              disabled={Boolean(focus.locked)}
              onClick={() => !focus.locked && setFocus(focus.id)}
              className={`${game.leaderFocus === focus.id ? "choice-card active" : "choice-card"} ${focus.locked ? "locked" : ""}`}
            >
              <span className="choice-icon">{focus.icon}</span>
              <span>
                <b>{focus.title}</b><br />
                <small className="muted">{focus.text}</small><br />
                <small className={focus.locked ? "danger-text" : "context-text"}>{focus.locked ? `ล็อก: ${focus.lockReason}` : focus.reason}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
function PeopleView({ game }: { game: GameState }) {
  return <section className="panel pad"><div className="split"><div><h2 className="title">คนในค่าย</h2><p className="muted">ทุกคนมีชื่อ อายุ สุขภาพ ความเหนื่อย และสถานะจริง คนเหล่านี้บาดเจ็บและเสียชีวิตได้</p></div><span className="badge">มีชีวิต {alivePeople(game).length}</span></div><div className="people-grid">{game.people.map((p) => <PersonCard key={p.id} person={p} />)}</div></section>;
}
function PersonCard({ person }: { person: Person }) {
  const dot = !person.alive || person.health < 35 ? "health-dot bad" : person.health < 60 || person.injured ? "health-dot warn" : "health-dot";
  return <article className={person.alive ? "person-card" : "person-card dead"}><div className="person-top"><div className="flex"><div className="avatar">{person.name.slice(0, 1)}</div><div><b>{person.name}</b><br /><small className="muted">{person.role} · อายุ {person.age}</small></div></div><span className={dot} /></div><div className="deltas">{person.traits.map((t, i) => <span className="badge" key={`${person.id}-${t}-${i}`}>{t}</span>)}{person.injured && <span className="badge red">บาดเจ็บ</span>}{!person.alive && <span className="badge red">เสียชีวิต</span>}</div><table className="report-table" style={{ marginTop: 10 }}><tbody><tr><td>สุขภาพ</td><td>{pct(person.health)}</td></tr><tr><td>กำลังใจ</td><td>{pct(person.morale)}</td></tr><tr><td>ความเหนื่อย</td><td>{pct(person.fatigue)}</td></tr><tr><td>สาเหตุ</td><td>{person.cause ?? "-"}</td></tr></tbody></table></article>;
}
function SettlementGrowthPanel({ game }: { game: GameState }) {
  const steps: Array<{ stage: Stage; title: string; text: string }> = [
    { stage: "ค่ายพักแรม", title: "ค่ายพักแรม", text: "อยู่รอด สร้างที่พัก จุดไฟ และตั้งเวรยาม" },
    { stage: "ชุมชนแรกเริ่ม", title: "ชุมชนแรกเริ่ม", text: "น้ำสะอาด คลังอาหาร แปลงเพาะปลูก และกฎร่วม" },
    { stage: "หมู่บ้านถาวร", title: "หมู่บ้านถาวร", text: "เพิงช่าง ป้อมยาม ศาลาประชุม และคนรุ่นใหม่" },
    { stage: "เมืองเล็ก", title: "เมืองเล็ก", text: "การค้า กฎหมาย ตระกูลรอง และปัญหาสังคมที่ซับซ้อน" },
  ];
  const currentIndex = steps.findIndex((s) => s.stage === game.stage);
  return <div className="panel pad" style={{ boxShadow: "none", marginBottom: 14 }}><h3 className="section-title">เส้นทางการเติบโตของถิ่นฐาน</h3><div className="work-grid">{steps.map((step, index) => <div key={step.stage} className={index === currentIndex ? "work-card active-step" : "work-card"}><b>{index <= currentIndex ? "✓" : "○"} {step.title}</b><p className="muted small">{step.text}</p></div>)}</div></div>;
}
function BuildView({ game, startConstruction }: { game: GameState; startConstruction: (id: BuildingKey) => void }) {
  return <section className="panel pad"><h2 className="title">ก่อสร้าง</h2><p className="muted">เริ่มจากไม่มีอะไร ทุกอาคารลดความเสี่ยงบางประเภทและปลดล็อกชีวิตที่มั่นคงขึ้น</p><SettlementGrowthPanel game={game} />{game.construction && <div className="log good"><b>กำลังก่อสร้าง: {buildingData[game.construction.id].title}</b><div className="bar" style={{ marginTop: 8 }}><div className="fill" style={{ width: `${clamp(game.construction.progress / buildingData[game.construction.id].work * 100)}%` }} /></div></div>}<div className="building-grid" style={{ marginTop: 12 }}>{(Object.keys(buildingData) as BuildingKey[]).map((id) => { const b = buildingData[id]; const unlocked = buildingUnlocked(game, id); const affordable = hasCost(game, b.cost); return <article key={id} className="building-card"><div className="split"><div><b>{b.icon} {b.title}</b><p className="muted small">{b.text}</p></div><span className="badge">มี {game.buildings[id]}</span></div><table className="report-table"><tbody><tr><td>ใช้ทรัพยากร</td><td>{Object.entries(b.cost).map(([k,v]) => `${k} ${v}`).join(" · ")}</td></tr><tr><td>แรงงานที่ต้องใช้</td><td>{b.work}</td></tr><tr><td>สถานะ</td><td>{unlocked ? affordable ? "พร้อมสร้าง" : "ทรัพยากรไม่พอ" : "ยังไม่ปลดล็อก"}</td></tr></tbody></table><button className="primary" disabled={!unlocked || !affordable || Boolean(game.construction)} onClick={() => startConstruction(id)} style={{ width: "100%", marginTop: 10, opacity: !unlocked || !affordable || game.construction ? .55 : 1 }}>เริ่มสร้าง</button></article>; })}</div></section>;
}
function ResearchView({ game, startResearch }: { game: GameState; startResearch: (id: ResearchKey) => void }) {
  return <section className="panel pad"><h2 className="title">ภูมิปัญญาและการวิจัย</h2><p className="muted">งานวิจัยไม่ใช่เวทมนตร์ แต่คือความรู้ที่ลดการสูญเสียซ้ำ ๆ ในโลกจริง</p>{game.activeResearch && <div className="log good"><b>กำลังศึกษา: {researchData[game.activeResearch.id].title}</b><div className="bar" style={{ marginTop: 8 }}><div className="fill" style={{ width: `${clamp(game.activeResearch.progress / researchData[game.activeResearch.id].cost * 100)}%` }} /></div></div>}<div className="building-grid" style={{ marginTop: 12 }}>{(Object.keys(researchData) as ResearchKey[]).map((id) => { const r = researchData[id]; const done = game.researchDone[id]; const unlocked = researchUnlocked(game, id); return <article key={id} className="building-card"><div className="split"><div><b>{r.icon} {r.title}</b><p className="muted small">{r.text}</p></div><span className={done ? "badge green" : "badge"}>{done ? "สำเร็จ" : `${r.cost}`}</span></div><p className="small muted">เงื่อนไขก่อนศึกษา: {r.prereq?.map((p) => researchData[p].title).join(" · ") ?? "ไม่มี"}</p><button className="primary" disabled={done || !unlocked || Boolean(game.activeResearch)} onClick={() => startResearch(id)} style={{ width: "100%", opacity: done || !unlocked || game.activeResearch ? .55 : 1 }}>{done ? "เรียนรู้แล้ว" : unlocked ? "เริ่มศึกษา" : "ยังไม่ปลดล็อก"}</button></article>; })}</div></section>;
}
function ChronicleView({ game }: { game: GameState }) {
  const previewDeaths = game.casualties.slice(0, 5);
  return (
    <section className="panel pad">
      <h2 className="title">พงศาวดารของถิ่นฐาน</h2>
      <p className="muted">บันทึกไม่ได้มีไว้สวยงามอย่างเดียว บางความทรงจำจะกลายเป็นแรงผลัก บางความทรงจำจะกลายเป็นแผลที่คนรุ่นต่อไปต้องแบกรับ</p>
      <div className="two-col">
        <div>
          <h3 className="section-title">ความทรงจำสำคัญ</h3>
          <div className="memory-grid">
            {game.memories.length ? game.memories.map((m, i) => <article key={`${m.id}-${i}`} className="memory-card"><span className="badge green">{m.kind}</span><h3>{m.title}</h3><p className="muted small">ปี {m.year} เดือน {m.month}</p><p>{m.text}</p><small className="muted">ผล: {m.effect}</small></article>) : <div className="empty">ยังไม่มีความทรงจำสำคัญ</div>}
          </div>
        </div>
        <div>
          <h3 className="section-title">ผู้จากไปแบบย่อ</h3>
          {previewDeaths.length ? previewDeaths.map((c, i) => <div key={`${c.id}-${i}`} className="compact-death"><b>{c.name}</b><small>ปี {c.year} เดือน {c.month} · อายุ {c.age}</small><p>{c.cause}</p></div>) : <div className="empty">ยังไม่มีผู้เสียชีวิต</div>}
          {game.casualties.length > 5 && <details className="details-box"><summary>ดูรายชื่อทั้งหมดอีก {game.casualties.length - 5} คน</summary>{game.casualties.slice(5).map((c, i) => <p key={`${c.id}-more-${i}`}>• {c.name} — {c.cause}</p>)}</details>}
        </div>
      </div>
      <h3 className="section-title" style={{ marginTop: 18 }}>บันทึกล่าสุด</h3>
      <div className="timeline">{game.logs.map((l, i) => <div key={`${l.id}-${i}`} className={`log ${l.kind}`}><div className="split"><b>{l.title}</b><small>ปี {l.year} เดือน {l.month}</small></div><p style={{ whiteSpace: "pre-line" }}>{l.text}</p><div className="deltas">{l.tags.map((t, ti) => <span className="badge" key={`${l.id}-${t}-${ti}`}>{t}</span>)}</div></div>)}</div>
    </section>
  );
}
function SettingsView({ game, resetGame, showTutorialAgain }: { game: GameState; resetGame: () => void; showTutorialAgain: () => void }) {
  const exportText = JSON.stringify(game, null, 2);
  return <section className="panel pad"><h2 className="title">ตั้งค่าและตรวจสอบระบบ</h2><div className="two-col"><div className="panel pad" style={{ boxShadow: "none" }}><h3>ลำดับการเล่นที่ตรวจแล้ว</h3><ol><li>เปิดระบบสอนเล่นหลังเริ่มเกมครั้งแรก</li><li>จัดแรงงาน</li><li>เลือกสิ่งก่อสร้างหรือวิจัย</li><li>เลือกการกระทำผู้นำแบบ Dynamic ตามเหตุการณ์</li><li>ตอบเหตุการณ์เดือนนี้</li><li>จบเดือน ระบบคำนวณผลผลิต การบริโภค ความเสี่ยง บาดเจ็บ ตาย ความทรงจำ เหตุการณ์ต่อเนื่อง และเงื่อนไขแพ้</li></ol></div><div className="panel pad" style={{ boxShadow: "none" }}><h3>ระบบความสมจริงที่เปิดใช้งาน</h3><p className="muted">อาหารเสีย, น้ำ, ฟืน, ฤดูกาล, โรค, แผลติดเชื้อ, อุบัติเหตุงาน, ล่าสัตว์, สัตว์ป่า, โจร, ความขัดแย้ง, ความเหนื่อย, การเกิด, ชราภาพ, ผู้ตายรายชื่อจริง, ระดับวิกฤต, การกระทำผู้นำตามสถานการณ์, Tutorial, และ Game Over จากการล่มสลายหลายรูปแบบ</p></div></div><textarea className="input" readOnly rows={10} value={exportText} style={{ marginTop: 14, fontFamily: "ui-monospace, Consolas, monospace" }} /><div className="flex" style={{ marginTop: 14 }}><button className="secondary" onClick={showTutorialAgain}>เปิดระบบสอนเล่นอีกครั้ง</button><button className="danger" onClick={resetGame}>ลบบันทึกเกมและเริ่มใหม่</button></div></section>;
}
function EventPanel({ game, event, selectChoice, endTurn }: { game: GameState; event: GameEvent; selectChoice: (id: string) => void; endTurn: () => void }) {
  const selected = game.selectedChoiceId ?? event.choices[0]?.id;
  return <section className="panel event-card"><div className="kicker">เหตุการณ์ประจำเดือน · {event.category}</div><h2>{event.rare ? "✦ " : ""}{event.title}</h2><p>{event.text}</p><div className="option-list">{event.choices.map((c) => <button key={c.id} className={selected === c.id ? "option active" : "option"} onClick={() => selectChoice(c.id)}><span className="emoji">{c.icon}</span><span><b>{c.title}</b><br /><small className="muted">{c.tone} · {c.hint}</small></span></button>)}</div><button className="primary" onClick={endTurn} style={{ width: "100%", marginTop: 14 }}>ยืนยันและจบเดือน →</button><p className="muted small">ทุกตัวเลือกจะส่งผลต่อทรัพยากร คน ความเสี่ยง พงศาวดารและเหตุการณ์ต่อเนื่อง</p></section>;
}
function RumorPanel({ game }: { game: GameState }) {
  return <section className="panel pad"><h3 className="section-title">ข่าวลือ / สิ่งที่ยังไม่รู้</h3>{game.rumors.length ? <div className="timeline">{game.rumors.slice(0, 4).map((r) => <div key={r.id} className="rumor-card"><b>{r.title}</b><p className="muted small">{r.detail}</p><span className="badge blue">อันตราย: {r.danger}</span></div>)}</div> : <div className="empty">ยังไม่มีข่าวลือใหม่ หากอยากเปิดเส้นทางเรื่องราว ลองให้ผู้นำออกสำรวจพื้นที่</div>}</section>;
}

