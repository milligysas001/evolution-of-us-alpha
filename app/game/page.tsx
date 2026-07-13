"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Origin = "builder" | "hunter" | "healer" | "keeper" | "mediator";
type View = "เมือง" | "ทรัพยากร" | "คน" | "แผนที่" | "ก่อสร้าง" | "วิจัย" | "สัตว์เลี้ยง" | "นโยบาย" | "ข่าวสาร" | "พงศาวดาร" | "ตั้งค่า";
type DeviceMode = "desktop" | "tablet" | "mobile";
type Stage = "ค่ายพักแรม" | "ชุมชนแรกเริ่ม" | "หมู่บ้านถาวร" | "เมืองเล็ก" | "เมืองการค้า" | "นครรัฐ" | "อาณาจักร";
type Season = "ฤดูใบไม้ผลิ" | "ฤดูร้อน" | "ฤดูฝน" | "ฤดูใบไม้ร่วง" | "ฤดูหนาว";
type LaborKey = "forage" | "wood" | "stone" | "build" | "guard" | "care" | "research" | "farm" | "water" | "preserve" | "craft" | "herbs" | "feed" | "patrol" | "explore" | "trade" | "teach" | "intel";
type ResourceKey = "food" | "wood" | "stone" | "tools" | "herbs" | "hides" | "water" | "waterReserve" | "knowledge" | "fuel" | "ore" | "gold" | "feed" | "ironOre" | "coal" | "timber" | "bricks" | "textiles" | "salt" | "spices" | "influence" | "steel" | "luxuries" | "warhorses" | "manpower" | "siegeMaterials";
type BuildingKey = "shelter" | "campfire" | "storage" | "well" | "cistern" | "repairShed" | "watchPost" | "farmPlot" | "workshop" | "healerHut" | "animalPen" | "palisade" | "graveyard" | "meetingHall" | "smokeVent" | "dryingRack" | "livestockShed" | "waterTrough" | "crisisBeacon" | "marketSquare" | "caravanPost" | "huntersGuildHall" | "buildersGuildHall" | "merchantsGuildHall" | "sawmill" | "brickKiln" | "senateHouse" | "smeltery" | "castleKeep";
type ResearchKey = "foodPreservation" | "stoneTools" | "woodShelter" | "basicFarming" | "herbalCare" | "watchRoutine" | "simpleCraft" | "waterFinding" | "waterStorage" | "sanitation" | "maintenanceRoutine" | "familyRecords" | "animalQuarantine" | "apprenticeship" | "weatherReading" | "animalKeeping" | "fodderPrep" | "storyRecords" | "palisadeCraft" | "signalNetwork" | "shelterHygiene" | "animalBreeding" | "masonry" | "herbalWorkshop" | "projectPlanning" | "stormPrep" | "crisisDrills" | "campPolicies" | "guildCharters" | "currencyMinting" | "caravanContracts" | "outpostLogistics" | "bureaucracy" | "ironSmelting" | "smelteryOps" | "diplomacyProtocol" | "dynasticSuccession" | "siegeEngineering";
type LeaderFocusKey = string;
type LogKind = "normal" | "good" | "bad" | "death" | "rare" | "milestone";
type MetricKey = "morale" | "security" | "trust" | "health" | "cohesion" | "fairness";
type SkillKey = "hunter" | "builder" | "healer" | "keeper" | "guard" | "farmer" | "child" | "elder";
type TerrainKey = "riverbank" | "forestEdge" | "rockyHollow" | "openMeadow" | "coldHighland" | "marshland";
type LocationKey = "shallowStream" | "deepWoods" | "oldTradeRoad" | "rockyRidge" | "abandonedCamp" | "marshPools" | "huntingGround" | "oldCave";
type LocationStatus = "ข่าวลือ" | "สำรวจบางส่วน" | "รู้เส้นทาง" | "ควบคุมได้";
type LocationProgress = Record<LocationKey, { progress: number; status: LocationStatus; discovered: boolean; outpost: boolean }>;
type LaborAssignments = Partial<Record<LaborKey, string[]>>;
type NoticeKind = "event" | "warning" | "trade" | "threat" | "birth" | "system";
type Notice = { id: string; year: number; month: number; kind: NoticeKind; title: string; text: string; read: boolean; eventId?: string };
type GuildKey = "huntersGuild" | "buildersGuild" | "merchantsGuild";
type GuildState = Record<GuildKey, { level: number; funding: number; activeEdict: string }>;
type FactionKey = "guards" | "farmers" | "merchants" | "builders";
type FactionState = Record<FactionKey, { approval: number; power: number }>;
type OutpostKind = "water" | "wood" | "food" | "mine" | "flax" | "trade";
type Outpost = { id: string; location: LocationKey; name: string; kind: OutpostKind; workers: number; level: number; security: number; monthly: Partial<Resources>; };

type Resources = Record<ResourceKey, number>;
type ResourceHistoryYear = { year: number; stocks: Resources; produced: Partial<Resources>; used: Partial<Resources>; net: Partial<Resources>; population: number; quality: { food: number; water: number; shelter: number; }; };
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
  xp?: SkillXP;
  grief?: number;
  closeKin?: string[];
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
  danger: string;
  discovered: boolean;
};

type Project<T extends string> = { id: T; progress: number } | null;
type AnimalKey = "goats" | "chickens" | "dogs" | "cows" | "pigs";
type AnimalAction = "keep" | "slaughter" | "breed" | "release" | "protect";
type Animals = Record<AnimalKey, number>;
type AnimalState = { animals: Animals; hunger: number; health: number; lastAction: AnimalAction; log: string[]; };
type WeatherKind = "ปกติ" | "ฝนหลงฤดู" | "แล้งจัด" | "หนาวยาว" | "พายุเข้าเร็ว" | "หมอกชื้น";
type WeatherState = { kind: WeatherKind; severity: number; monthsLeft: number; forecast: string; lastYearPattern: string; };
type CampPolicies = { autoFoodShift: boolean; autoMaintenance: boolean; protectChildren: boolean; reserveWater: boolean; rationMode: "เท่าเทียม" | "ให้แรงงานหนักก่อน" | "ประหยัดเสบียง"; };
type EndgameCrisis = { kind: "none" | "long_winter" | "bandit_host" | "great_plague"; yearsUntil: number; warningLevel: number; active: boolean; resolved: boolean; };
type BuildingCondition = Partial<Record<BuildingKey, number>>;
type SkillXP = Partial<Record<LaborKey, number>>;
type DelayedEvent = { id: string; months: number };

type SummaryModal = {
  title: string;
  paragraphs: string[];
  changes: string[];
  kind: LogKind;
} | null;

type GameState = {
  version: string;
  leaderName: string;
  houseName: string;
  origin: Origin;
  year: number;
  month: number;
  stage: Stage;
  resources: Resources;
  resourceHistory: ResourceHistoryYear[];
  buildings: Buildings;
  researchDone: ResearchDone;
  construction: Project<BuildingKey>;
  pausedConstruction: Project<BuildingKey>[];
  activeResearch: Project<ResearchKey>;
  pausedResearch: Project<ResearchKey>[];
  labor: Labor;
  laborAssignments: LaborAssignments;
  terrain: TerrainKey;
  locations: LocationProgress;
  exploreTarget: LocationKey;
  notifications: Notice[];
  leaderFocus: LeaderFocusKey;
  leaderActionSelected: boolean;
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
  animalState: AnimalState;
  animalAction: AnimalAction;
  weather: WeatherState;
  policies: CampPolicies;
  buildingCondition: BuildingCondition;
  crisis: EndgameCrisis;
  guilds: GuildState;
  outposts: Outpost[];
  factions: FactionState;
  leaderAge: number;
  heir: Person | null;
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

const views: View[] = ["เมือง", "ทรัพยากร", "คน", "แผนที่", "ก่อสร้าง", "วิจัย", "สัตว์เลี้ยง", "นโยบาย", "ข่าวสาร", "พงศาวดาร", "ตั้งค่า"];
const terrainData: Record<TerrainKey, { icon: string; title: string; text: string; effects: Partial<Record<ResourceKey, number>>; forage: number; wood: number; stone: number; water: number; disease: number; beast: number; weather: number; tags: string[] }> = {
  riverbank: { icon: "💧", title: "ริมลำธารเก่า", text: "มีน้ำเข้าถึงง่าย ดินชุ่ม และมีพืชริมน้ำ แต่ต้องระวังน้ำปนเปื้อนช่วงฝน", effects: { water: 14, food: 4 }, forage: 0.08, wood: 0, stone: 0, water: 0.25, disease: 8, beast: 1, weather: 0, tags: ["น้ำดี", "เกษตรดี"] },
  forestEdge: { icon: "🌲", title: "ชายป่าหนาทึบ", text: "ไม้และอาหารจากป่ามีมาก เหมาะกับพราน แต่เสียงสัตว์กลางคืนไม่เคยหายไป", effects: { wood: 12, food: 8, hides: 1 }, forage: 0.18, wood: 0.2, stone: -0.05, water: -0.05, disease: 2, beast: 12, weather: 0, tags: ["อาหารป่า", "สัตว์ป่า"] },
  rockyHollow: { icon: "🪨", title: "แอ่งหินใต้เนิน", text: "มีหินและที่กำบังดี เหมาะกับงานก่อสร้าง แต่ดินเพาะปลูกยากและน้ำไกลกว่า", effects: { stone: 12, tools: 1 }, forage: -0.08, wood: -0.05, stone: 0.24, water: -0.12, disease: -2, beast: 2, weather: 4, tags: ["หินมาก", "น้ำไกล"] },
  openMeadow: { icon: "🌾", title: "ทุ่งโล่งลมแรง", text: "มองเห็นศัตรูและสัตว์ได้ไกล เหมาะกับแปลงเพาะปลูกในอนาคต แต่ขาดร่มเงาและฟืน", effects: { food: 6, knowledge: 2 }, forage: 0.03, wood: -0.15, stone: 0, water: 0, disease: -1, beast: -4, weather: 8, tags: ["เกษตร", "เปิดโล่ง"] },
  coldHighland: { icon: "🏔️", title: "เนินสูงอากาศเย็น", text: "ปลอดน้ำขังและมองเห็นไกล แต่ฤดูหนาวรุนแรง ฟืนและที่พักสำคัญกว่าเดิม", effects: { stone: 6, fuel: -2 }, forage: -0.1, wood: 0.05, stone: 0.08, water: -0.08, disease: -4, beast: 0, weather: 14, tags: ["หนาว", "ปลอดน้ำขัง"] },
  marshland: { icon: "🪷", title: "หนองน้ำและดินชื้น", text: "น้ำและสมุนไพรมีมาก แต่ยุง ไข้ และทางเดินเละทำให้การอยู่รอดซับซ้อนขึ้น", effects: { water: 20, herbs: 4 }, forage: 0.05, wood: -0.05, stone: -0.08, water: 0.32, disease: 15, beast: 3, weather: 2, tags: ["น้ำมาก", "โรคสูง"] },
};

const locationData: Record<LocationKey, { icon: string; title: string; text: string; resource: string; risk: string; unlockHint: string; resourceBonus: Partial<Resources>; threat: number; disease: number; beast: number; trade: number; tags: string[] }> = {
  shallowStream: { icon: "💧", title: "ลำธารตื้น", text: "น้ำไหลช้าและมีตลิ่งให้ลงตักได้ง่าย เหมาะกับการตั้งจุดเก็บน้ำ แต่รอยเท้าสัตว์มักปะปนอยู่แถวนั้น", resource: "น้ำและสมุนไพรริมน้ำ", risk: "สัตว์ป่า / น้ำปนเปื้อนหลังฝน", unlockHint: "รู้ข่าวลือทันทีเมื่อเริ่มเกม", resourceBonus: { water: 5, herbs: 1 }, threat: 1, disease: 3, beast: 4, trade: 0, tags: ["น้ำ", "สุขภาพ"] },
  deepWoods: { icon: "🌲", title: "ป่าทึบทางเหนือ", text: "ไม้ อาหารป่า และสมุนไพรซ่อนอยู่ใต้เงาไม้ แต่คนที่เดินลึกเกินไปอาจกลับมาพร้อมบาดแผลหรือไม่กลับมาเลย", resource: "อาหารป่า ไม้ สมุนไพร หนังสัตว์", risk: "หลงป่า / สัตว์ใหญ่", unlockHint: "ต้องสำรวจใกล้ค่ายหรือมีพราน", resourceBonus: { food: 6, wood: 5, herbs: 1, hides: 1 }, threat: 2, disease: 1, beast: 9, trade: 0, tags: ["อาหาร", "ไม้", "เสี่ยงสูง"] },
  oldTradeRoad: { icon: "🛤️", title: "ถนนการค้าเก่า", text: "ร่องล้อเกวียนเก่าพาดผ่านหญ้าสูง เส้นทางนี้อาจพาพ่อค้าเข้ามา หรือพาโจรเข้ามาก่อนพ่อค้า", resource: "พ่อค้า ข่าวสาร ของเก่า", risk: "โจร / คนแปลกหน้า", unlockHint: "เปิดจากข่าวสารหรือสายข่าว", resourceBonus: { gold: 2, knowledge: 2 }, threat: 9, disease: 0, beast: 1, trade: 10, tags: ["พ่อค้า", "โจร", "ข่าวสาร"] },
  rockyRidge: { icon: "🪨", title: "แนวหินหลังเนิน", text: "หินแข็งและแร่ดิบโผล่ตามไหล่เขา เหมาะกับงานก่อสร้าง แต่การแบกหินกลับค่ายทำให้คนล้าและเสี่ยงอุบัติเหตุ", resource: "หินและแร่ดิบ", risk: "อุบัติเหตุ / อากาศเย็น", unlockHint: "สำรวจจากเนินหรือพื้นที่หิน", resourceBonus: { stone: 7, ore: 2 }, threat: 1, disease: 0, beast: 2, trade: 0, tags: ["หิน", "แร่", "อุบัติเหตุ"] },
  abandonedCamp: { icon: "⛺", title: "ซากค่ายร้าง", text: "เสาไม้ผุและเศษผ้าขาดบอกว่ามีคนเคยพยายามอยู่ที่นี่มาก่อน สิ่งที่เหลืออาจเป็นเครื่องมือ หรือโรคที่ยังไม่หมดไป", resource: "เครื่องมือเก่า บันทึก ข่าวลือ", risk: "โรค / ความทรงจำไม่ดี", unlockHint: "มักเปิดจากข่าวลือหรือการสำรวจลึก", resourceBonus: { tools: 1, knowledge: 4 }, threat: 3, disease: 8, beast: 0, trade: 0, tags: ["ของเก่า", "โรค", "พงศาวดาร"] },
  marshPools: { icon: "🪷", title: "บึงตื้นและดินชื้น", text: "น้ำและพืชสมุนไพรมีมาก แต่ยุง ไข้ และเท้าจมโคลนทำให้ทุกก้าวต้องคิด", resource: "น้ำ สมุนไพร หญ้าอาหารสัตว์", risk: "โรค / เดินทางช้า", unlockHint: "เห็นได้จากพื้นที่หนองน้ำหรือข่าวจากคนตักน้ำ", resourceBonus: { water: 6, herbs: 3, feed: 2 }, threat: 1, disease: 10, beast: 3, trade: 0, tags: ["น้ำ", "สมุนไพร", "โรค"] },
  huntingGround: { icon: "🦌", title: "เขตล่าสัตว์", text: "รอยกวางและกระต่ายพาดผ่านพุ่มไม้ ถ้ามีพรานดี ที่นี่จะเป็นครัวสำรองก่อนฤดูหนาว", resource: "อาหารและหนังสัตว์", risk: "สัตว์ป่า / บาดเจ็บจากล่า", unlockHint: "เปิดจากพรานหรือการสำรวจป่า", resourceBonus: { food: 8, hides: 2 }, threat: 2, disease: 0, beast: 7, trade: 0, tags: ["อาหาร", "หนังสัตว์", "พราน"] },
  oldCave: { icon: "🕳️", title: "ถ้ำเก่าหลังผาหิน", text: "ลมเย็นออกจากปากถ้ำพร้อมกลิ่นดินชื้น ข้างในอาจมีแร่ น้ำซึม หรือสิ่งที่ไม่ควรถูกปลุก", resource: "แร่ น้ำซึม ความลับ", risk: "หลงทาง / สัตว์ / อุบัติเหตุ", unlockHint: "ต้องสำรวจแนวหินให้มากพอ", resourceBonus: { ore: 3, stone: 3, knowledge: 3 }, threat: 4, disease: 2, beast: 6, trade: 0, tags: ["แร่", "ความลับ", "เสี่ยงสูง"] },
};

const originData: Record<Origin, { icon: string; title: string; story: string; bonuses: string[]; gameplay: string }> = {
  builder: {
    icon: "🛠️",
    title: "ช่างสร้างถิ่น",
    story: "กลุ่มของคุณมีคนชำนาญไม้ เชือก และงานตั้งค่าย พวกเขาไม่เริ่มด้วยทรัพย์สินมากนัก แต่รู้ว่าจะทำให้หลังคาแรกไม่ถล่มลงมาได้อย่างไร",
    bonuses: ["เริ่มด้วยไม้และเครื่องมือมากขึ้น", "ตัดไม้และก่อสร้างมีประสิทธิภาพดีขึ้น", "งานก่อสร้างก้าวหน้าไวขึ้นเมื่อมีช่างอยู่ในทีม"],
    gameplay: "เหมาะกับการเร่งที่พัก คลัง กองไฟ และสิ่งก่อสร้างช่วงต้น"
  },
  hunter: {
    icon: "🏹",
    title: "กลุ่มพรานริมป่า",
    story: "คนของคุณอ่านรอยเท้า กลิ่นลม และเสียงกิ่งไม้ได้ดีกว่าคนทั่วไป ป่าไม่ใช่ที่ปลอดภัย แต่เป็นครัวแห่งแรกของพวกเขา",
    bonuses: ["เริ่มด้วยอาหารและหนังสัตว์มากขึ้น", "หาอาหารและลาดตระเวนได้ผลดีขึ้น", "ความปลอดภัยเริ่มต้นสูงขึ้นเล็กน้อย"],
    gameplay: "เหมาะกับรอบที่ต้องการอาหารเร็ว แต่ต้องจัดการความเสี่ยงจากป่า"
  },
  healer: {
    icon: "🌿",
    title: "ผู้รู้สมุนไพร",
    story: "พวกเขาพกความรู้เรื่องรากไม้ ใบขม และผ้าพันแผลมาด้วย ไม่อาจหยุดความตายได้ทุกครั้ง แต่ช่วยให้หลายชีวิตไม่จากไปเร็วเกินควร",
    bonuses: ["เริ่มด้วยสมุนไพรมากขึ้น", "สุขภาพชุมชนเริ่มต้นดีกว่า", "งานดูแลคนป่วยและเก็บสมุนไพรมีคุณค่ามากขึ้น"],
    gameplay: "เหมาะกับการเล่นแบบลดความสูญเสียและรับมือโรค/แผลติดเชื้อ"
  },
  keeper: {
    icon: "📜",
    title: "ผู้จดจำเรื่องเล่า",
    story: "คนกลุ่มนี้เชื่อว่าความรู้คือเสบียงอีกชนิดหนึ่ง พวกเขาเริ่มต้นด้วยเรื่องเล่า สูตรจำ และบทเรียนที่ช่วยให้ความผิดพลาดไม่เกิดซ้ำบ่อยนัก",
    bonuses: ["เริ่มด้วยความรู้มากขึ้น", "การวิจัยและสอนเด็กเร็วขึ้น", "ข่าวสารและพงศาวดารมีน้ำหนักต่อระยะยาว"],
    gameplay: "เหมาะกับผู้เล่นที่อยากปลดล็อกระบบใหม่เร็วและวางแผนยาว"
  },
  mediator: {
    icon: "⚖️",
    title: "ผู้นำผู้ไกล่เกลี่ย",
    story: "กลุ่มนี้ไม่แข็งแรงที่สุด ไม่รวยที่สุด แต่รู้วิธีทำให้คนไม่แตกคอกันก่อนสร้างบ้านหลังแรก ความยุติธรรมคือทรัพยากรที่พวกเขาถือมา",
    bonuses: ["ความไว้ใจและความยุติธรรมเริ่มต้นสูงขึ้น", "ลดความเสี่ยงทะเลาะเรื่องเสบียง", "เหมาะกับเหตุการณ์ตัดสินโทษและรับคนใหม่"],
    gameplay: "เหมาะกับการเติบโตแบบรับคนเพิ่มและรักษาความสัมพันธ์ในค่าย"
  }
};

function originInfo(origin: Origin) {
  return originData[origin] ?? originData.builder;
}

const seasons: Season[] = ["ฤดูใบไม้ผลิ", "ฤดูใบไม้ผลิ", "ฤดูร้อน", "ฤดูร้อน", "ฤดูฝน", "ฤดูฝน", "ฤดูฝน", "ฤดูใบไม้ร่วง", "ฤดูใบไม้ร่วง", "ฤดูหนาว", "ฤดูหนาว", "ฤดูหนาว"];
const GAME_VERSION = "0.9.29";
const BUILD_LABEL = "Era Progression · Outposts · Guild Gates";
const BUILD_DATE = "2026-07-13";
const saveKey = "eou-current-save";
const setupKey = "eou-current-setup";
const tutorialKey = "eou-current-tutorial-seen";
const themeKey = "eou-ui-theme";
const legacySaveKeys = ["eou-v0913-save", "eou-v0912-save", "eou-v0911-save", "eou-v0910-save", "eou-v099-save", "eou-v098-save", "eou-v097-save"];
const legacySetupKeys = ["eou-v0913-setup", "eou-v0912-setup", "eou-v0911-setup", "eou-v0910-setup", "eou-v099-setup", "eou-v098-setup", "eou-v097-setup"];
const portableDataVersion = "0.9.16";
const portableDataSummary = {
  version: portableDataVersion,
  purpose: "Portable Data Foundation: data/game/*.json is the source-of-truth draft for future Godot porting.",
  files: [
    "data/game/resources.json",
    "data/game/jobs.json",
    "data/game/buildings.json",
    "data/game/research.json",
    "data/game/events.sample.json",
    "data/game/milestones.json",
    "data/game/threats.json",
    "data/game/merchant.json",
    "data/game/water.json",
    "data/game/animals.json",
    "data/game/locations.json",
    "data/game/exploration_jobs.json",
    "data/game/location_events.json",
    "data/game/travel_risks.json",
    "data/game/outposts.json"
  ],
  godotNotes: "Godot can load these JSON files with FileAccess + JSON.parse_string and map ids to UI nodes/resources."
};

function readFirstStorage(keys: string[]) {
  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}
function defaultSetup(): { leaderName: string; houseName: string; origin: Origin } {
  return { leaderName: "Elowen", houseName: "Vaelen", origin: "builder" };
}

const laborMeta: Array<{ id: LaborKey; icon: string; title: string; text: string; category: string; unlock?: (game: GameState) => boolean; lockedText?: string }> = [
  { id: "forage", icon: "🌾", title: "หาอาหาร / ล่าสัตว์", category: "พื้นฐาน", text: "อาหารมากขึ้น แต่เสี่ยงอุบัติเหตุในป่าและสัตว์ร้าย" },
  { id: "wood", icon: "🪵", title: "ตัดไม้", category: "พื้นฐาน", text: "ใช้สร้างที่พัก คลัง รั้ว ไฟ และซ่อมเครื่องมือ" },
  { id: "stone", icon: "🪨", title: "เก็บหิน", category: "พื้นฐาน", text: "ใช้บ่อน้ำ กองไฟ คลัง และสิ่งก่อสร้างที่คงทน" },
  { id: "build", icon: "🛖", title: "ก่อสร้าง", category: "พื้นฐาน", text: "เร่งโครงการ แต่เสี่ยงลื่น ตก บาดเจ็บเมื่อเครื่องมือไม่ดี" },
  { id: "guard", icon: "🛡️", title: "เฝ้ายาม", category: "พื้นฐาน", text: "ลดสัตว์ป่า โจร และความกลัวตอนกลางคืน" },
  { id: "care", icon: "🌿", title: "ดูแลคนป่วย", category: "สุขภาพ", text: "รักษาผู้บาดเจ็บ ลดโรค ลดโอกาสเสียชีวิตจากแผลติดเชื้อ" },
  { id: "research", icon: "📜", title: "ทดลอง / เรียนรู้", category: "ความรู้", text: "เพิ่มความรู้ วิจัยภูมิปัญญาพื้นฐาน และลดความเสี่ยงระยะยาว" },
  { id: "farm", icon: "🌱", title: "เพาะปลูก", category: "อาหาร", text: "อาหารเสถียรกว่าล่าสัตว์ ผลดีในฤดูอบอุ่น แต่โตช้าในฤดูหนาว", unlock: (game) => game.researchDone.basicFarming || game.buildings.farmPlot > 0, lockedText: "ต้องวิจัยการเพาะปลูกเบื้องต้น หรือมีแปลงปลูก" },
  { id: "water", icon: "💧", title: "ตักน้ำ / ดูแลน้ำสะอาด", category: "พื้นฐาน", text: "งานพื้นฐานตั้งแต่เริ่มเกม: ตักน้ำจากลำธาร เก็บน้ำค้าง และต้มน้ำใช้ในค่าย เมื่อวิจัยหรือมีบ่อน้ำจะมีประสิทธิภาพและปลอดภัยขึ้น" },
  { id: "preserve", icon: "🥫", title: "ถนอมอาหาร", category: "อาหาร", text: "ลดอาหารเสีย เตรียมค่ายก่อนฤดูหนาว ใช้ฟืนเล็กน้อย", unlock: (game) => game.researchDone.foodPreservation || game.buildings.storage > 0, lockedText: "ต้องวิจัยการถนอมอาหาร หรือสร้างคลังอาหาร" },
  { id: "craft", icon: "🛠️", title: "ซ่อม / ผลิตเครื่องมือ", category: "งานช่าง", text: "ซ่อมเครื่องมือพังและผลิตเครื่องมือหยาบ ใช้ไม้กับหิน", unlock: (game) => game.researchDone.simpleCraft || game.buildings.workshop > 0, lockedText: "ต้องวิจัยงานช่างง่าย ๆ หรือสร้างเพิงช่าง" },
  { id: "herbs", icon: "🍃", title: "เก็บสมุนไพร", category: "สุขภาพ", text: "เก็บสมุนไพรพื้นฐานได้ตั้งแต่เริ่มเกม ส่วนการต้มยา/ใช้รักษาอย่างปลอดภัยจะดีขึ้นเมื่อวิจัยสมุนไพรพื้นบ้านหรือมีกระท่อมหมอยา" },
  { id: "feed", icon: "🌿", title: "ตัดหญ้า / ทำอาหารสัตว์", category: "สัตว์เลี้ยง", text: "ผลิตอาหารสัตว์จากหญ้า เศษฟาง และพืชอาหาร เพื่อลดการแย่งอาหารคน", unlock: (game) => game.researchDone.fodderPrep || game.buildings.animalPen > 0, lockedText: "ต้องวิจัยการทำอาหารสัตว์ หรือสร้างคอกสัตว์" },
  { id: "patrol", icon: "🪤", title: "ลาดตระเวน / วางกับดัก", category: "ความปลอดภัย", text: "ลดสัตว์ป่า โจร และภัยภายนอก มีโอกาสได้อาหารเล็กน้อย", unlock: (game) => game.researchDone.watchRoutine || game.buildings.watchPost > 0 || game.buildings.palisade > 0, lockedText: "ต้องมีเวรยามเป็นระบบ ป้อมยาม หรือรั้วไม้" },
  { id: "explore", icon: "🧭", title: "สำรวจพื้นที่รอบค่าย", category: "สำรวจ", text: "ส่งคนออกอ่านทาง น้ำ ป่า ถนนเก่า และร่องรอยภัย ยิ่งสำรวจมากยิ่งเปิดพื้นที่ ข่าวสาร และทรัพยากรใหม่", unlock: (game) => true, lockedText: "" },
  { id: "trade", icon: "🪙", title: "แลกเปลี่ยน / ขายของส่วนเกิน", category: "เศรษฐกิจ", text: "เปลี่ยนอาหาร หนัง สมุนไพร หรือเครื่องมือส่วนเกินเป็นทอง", unlock: (game) => game.stage !== "ค่ายพักแรม" || game.buildings.meetingHall > 0, lockedText: "ต้องพัฒนาเป็นชุมชนแรกเริ่ม หรือมีศาลาประชุม" },
  { id: "teach", icon: "👧", title: "สอนเด็ก / บันทึกความรู้", category: "สังคม", text: "เพิ่มความรู้ ความสามัคคี และทำให้คนรุ่นใหม่เติบโตดีขึ้น", unlock: (game) => game.researchDone.storyRecords || game.buildings.meetingHall > 0, lockedText: "ต้องวิจัยการบันทึกเรื่องเล่า หรือมีศาลาประชุม" },
  { id: "intel", icon: "🕊️", title: "สายข่าว / รับฟังข่าวสาร", category: "ข่าวสาร", text: "รวบรวมข่าวจากพ่อค้า คนเดินทาง และชาวบ้าน เพื่อเปิดเหตุการณ์พิเศษล่วงหน้า", unlock: (game) => game.researchDone.signalNetwork || game.stage === "เมืองเล็ก", lockedText: "ต้องเข้าสู่ระยะเมืองเล็ก หรือเรียนรู้เครือข่ายสายข่าว" },
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

const expandedLeaderFocuses: LeaderAction[] = [
  { id: "waterMarshal", icon: "💧", title: "ตรวจแหล่งน้ำด้วยตนเอง", text: "ลดโรคจากน้ำและเพิ่มน้ำสะอาดเล็กน้อย" },
  { id: "herbWalk", icon: "🌿", title: "พาหมอยาเดินดูพืชรอบค่าย", text: "เพิ่มสมุนไพรและลดความเสี่ยงโรค" },
  { id: "fieldHands", icon: "🌾", title: "ลงแปลงกับคนเพาะปลูก", text: "เพิ่มอาหารจากงานไร่และความไว้ใจ" },
  { id: "woodlineSurvey", icon: "🪓", title: "เดินแนวไม้กับช่างและพราน", text: "เพิ่มไม้ ลดหลงป่า และอ่านทิศลมได้ดีขึ้น" },
  { id: "stoneMeasure", icon: "🪨", title: "วัดแนวหินและฐานราก", text: "ช่วยงานหินและลดโอกาสก่อสร้างผิดพลาด" },
  { id: "toolAudit", icon: "🔧", title: "ตรวจเครื่องมือทุกด้าม", text: "ลดอุบัติเหตุและรักษาเครื่องมือที่เหลือ" },
  { id: "childLessons", icon: "🧒", title: "สอนเด็กให้ช่วยงานอย่างปลอดภัย", text: "เด็กช่วยงานดีขึ้นโดยไม่เสี่ยงเกินไป" },
  { id: "elderCouncil", icon: "🧓", title: "ขอคำจากผู้เฒ่า", text: "เพิ่มความรู้ ความสามัคคี และลดความตื่นตระหนก" },
  { id: "animalLedger", icon: "🐐", title: "นับสัตว์และแบ่งอาหารสัตว์", text: "ลดความหิวของฝูงและป้องกันสัตว์หาย" },
  { id: "smokeWatch", icon: "💨", title: "ตรวจควันในที่พัก", text: "ลดโรคจากควันและช่วยการพักฟื้น" },
  { id: "shelterRounds", icon: "🛖", title: "เดินตรวจที่พักก่อนค่ำ", text: "ลดความหนาวและเพิ่มความรู้สึกปลอดภัย" },
  { id: "marketGreeting", icon: "🪙", title: "ออกต้อนรับพ่อค้าด้วยตนเอง", text: "เพิ่มโอกาสต่อรองและลดความเข้าใจผิดกับคนนอก" },
  { id: "migrantInterview", icon: "🧳", title: "สัมภาษณ์ผู้มาใหม่ทีละคน", text: "รับคนได้เหมาะขึ้น ลดโรคและความขัดแย้ง" },
  { id: "justiceHearing", icon: "⚖️", title: "เปิดวงไต่สวนอย่างเป็นธรรม", text: "ลดข่าวลือเรื่องการลงโทษและเพิ่มความยุติธรรม" },
  { id: "trailMarkers", icon: "🪧", title: "ทำเครื่องหมายเส้นทางสำรวจ", text: "เพิ่มผลสำรวจและลดหลงทาง" },
  { id: "weatherReading", icon: "🌦️", title: "อ่านเมฆ ลม และกลิ่นฝน", text: "ลดความเสียหายจากอากาศและเตรียมฤดูถัดไป" },
  { id: "fireDiscipline", icon: "🔥", title: "จัดวินัยกองไฟและเถ้าร้อน", text: "เพิ่มฟืนที่ใช้คุ้มค่าและลดไฟลาม" },
  { id: "quietMeal", icon: "🍲", title: "นั่งกินมื้อเดียวกับคนที่อ่อนแรง", text: "เพิ่มขวัญคนเปราะบางและลดความโดดเดี่ยว" },
  { id: "nightStories", icon: "📜", title: "เล่าเรื่องก่อนนอนให้ค่ายจำได้", text: "เพิ่มกำลังใจและความทรงจำร่วม" },
  { id: "seedSaving", icon: "🌱", title: "คัดเมล็ดและของกินไว้สำหรับฤดูหน้า", text: "เพิ่มความมั่นคงอาหารระยะยาวแต่ใช้เสบียงบางส่วน" },
  { id: "sicknessLedger", icon: "🩺", title: "จดอาการป่วยทุกคน", text: "ลดโรคซ้ำและช่วยหมอยาเลือกคนดูแล" },
  { id: "watchRotation", icon: "🛡️", title: "จัดเวรยามใหม่ไม่ให้คนเดิมเหนื่อยเกิน", text: "ลดความล้าและเพิ่มความปลอดภัย" },
  { id: "constructionBrief", icon: "🏗️", title: "ประชุมช่างก่อนเริ่มงานใหญ่", text: "เพิ่มความคืบหน้าก่อสร้างและลดอุบัติเหตุ" },
  { id: "researchCircle", icon: "🧪", title: "ตั้งวงเรียนรู้หลังเลิกงาน", text: "เพิ่มความรู้โดยไม่ดึงแรงงานทั้งวัน" },
  { id: "funeralCare", icon: "🕯️", title: "ดูแลครอบครัวผู้สูญเสีย", text: "ลดบาดแผลใจหลังมีคนตาย" },
  { id: "scavengerRules", icon: "🧺", title: "ตั้งกฎเก็บของจากซากเก่า", text: "เพิ่มของใช้แต่ลดโรคและการแย่งชิง" },
  { id: "riverGuard", icon: "🌊", title: "ตั้งคนเฝ้าริมน้ำ", text: "ลดอุบัติเหตุและสัตว์ป่าที่ลงน้ำตอนกลางคืน" },
  { id: "rationKitchen", icon: "🥣", title: "จัดครัวกลางแทนการแบ่งเงียบ ๆ", text: "ลดขโมยเสบียงและเพิ่มความยุติธรรม" },
  { id: "craftMentor", icon: "🪚", title: "ให้ช่างสอนมือใหม่หนึ่งคืน", text: "เพิ่มเครื่องมือและลดของเสียในเดือนถัดไป" },
  { id: "beastFence", icon: "🐺", title: "ตรวจแนวกลิ่นสัตว์และรั้วหยาบ", text: "ลดภัยสัตว์ป่าโดยเฉพาะเมื่อมีสัตว์เลี้ยง" },
  { id: "roadWhisper", icon: "🛤️", title: "ส่งคนฟังข่าวริมทางเก่า", text: "เพิ่มข่าวสารและโอกาสการค้า แต่เปิดตาให้คนนอกเห็นค่าย" },
  { id: "birthSupport", icon: "🍼", title: "กันพื้นที่อบอุ่นให้หญิงตั้งครรภ์และเด็ก", text: "ลดความเสี่ยงครอบครัวและเพิ่มความไว้ใจ" },
  { id: "oreTest", icon: "⛏️", title: "ทดสอบหินสีเข้มจากแนวเขา", text: "เพิ่มโอกาสพบแร่และความรู้ช่าง" },
  { id: "sharedOath", icon: "🤝", title: "ให้ทุกคนกล่าวคำมั่นต่อค่าย", text: "เพิ่มความสามัคคีเมื่อค่ายเริ่มโตและคนใหม่มากขึ้น" },
  { id: "restPlan", icon: "🛌", title: "วางแผนพักเป็นรอบแทนหยุดทั้งค่าย", text: "ลดความล้าโดยเสียผลผลิตน้อยกว่า" },
  { id: "dogTrail", icon: "🐕", title: "ให้สุนัขนำตรวจรอยรอบค่าย", text: "ลดภัยคนแปลกหน้าและสัตว์ป่า" },
  { id: "cowCare", icon: "🐄", title: "ตรวจน้ำและหญ้าของวัว", text: "ลดความหิวสัตว์ใหญ่และเพิ่มผลตอบแทนระยะยาว" },
  { id: "pigWaste", icon: "🐖", title: "จัดที่ทิ้งเศษอาหารไม่ให้หมูป่วย", text: "ลดโรคสัตว์และกลิ่นคอก" },
  { id: "chickenRoost", icon: "🐔", title: "ซ่อมรังไก่ก่อนกลางคืน", text: "ลดไก่หายและเพิ่มอาหารเล็กน้อย" },
  { id: "mapCouncil", icon: "🗺️", title: "กางแผนที่และเลือกเส้นทางเดือนหน้า", text: "เพิ่มผลสำรวจและลดการเดินซ้ำไร้ผล" },
];

function expandedLeaderActionAvailable(id: LeaderFocusKey, game: GameState, event: GameEvent): boolean {
  const risk = riskPreview(game);
  const season = seasonOf(game.month);
  const state = normalizeAnimalState(game.animalState);
  const hasAnimals = animalCount(game) > 0;
  const eventText = `${event.category} ${event.title}`;
  if (["waterMarshal", "riverGuard"].includes(id)) return game.resources.water < foodNeedFor(game) * 2 || risk.disease > 40 || eventText.includes("น้ำ");
  if (["herbWalk", "sicknessLedger"].includes(id)) return game.resources.herbs < 6 || risk.disease > 35 || woundedCount(game) > 0 || eventText.includes("โรค") || eventText.includes("สมุนไพร");
  if (["fieldHands", "seedSaving"].includes(id)) return game.researchDone.basicFarming || game.buildings.farmPlot > 0 || season !== "ฤดูหนาว";
  if (["woodlineSurvey", "stoneMeasure", "toolAudit", "constructionBrief", "craftMentor", "oreTest"].includes(id)) return game.construction !== null || game.resources.tools <= 4 || eventText.includes("ก่อสร้าง") || eventText.includes("เครื่องมือ") || eventText.includes("หิน");
  if (["childLessons", "elderCouncil", "quietMeal", "nightStories", "sharedOath"].includes(id)) return alivePeople(game).some(p => p.age < 15 || p.age >= 60) || game.metrics.morale < 55 || game.metrics.cohesion < 55;
  if (["animalLedger", "beastFence", "dogTrail", "cowCare", "pigWaste", "chickenRoost"].includes(id)) return hasAnimals || eventText.includes("สัตว์");
  if (["smokeWatch", "shelterRounds", "weatherReading", "fireDiscipline"].includes(id)) return game.buildings.shelter > 0 || game.buildings.campfire > 0 || risk.weather > 35 || season === "ฤดูหนาว" || season === "ฤดูฝน";
  if (["marketGreeting"].includes(id)) return eventText.includes("พ่อค้า") || eventText.includes("การค้า") || game.labor.trade > 0;
  if (["migrantInterview", "birthSupport"].includes(id)) return eventText.includes("ผู้ลี้ภัย") || eventText.includes("อพยพ") || eventText.includes("เกิด") || game.people.length > 14;
  if (["justiceHearing", "rationKitchen"].includes(id)) return risk.conflict > 35 || eventText.includes("ขโมย") || eventText.includes("เสบียง") || game.metrics.fairness < 55;
  if (["trailMarkers", "roadWhisper", "mapCouncil", "scavengerRules"].includes(id)) return game.labor.explore > 0 || game.leaderFocus === "scout" || eventText.includes("สำรวจ") || eventText.includes("ถนน") || eventText.includes("ซาก");
  if (["watchRotation"].includes(id)) return risk.beast > 30 || game.threat > 25 || game.metrics.security < 60;
  if (["funeralCare"].includes(id)) return game.casualties.length > 0;
  if (["restPlan"].includes(id)) return alivePeople(game).some(p => p.fatigue > 55) || risk.accident > 35;
  return true;
}


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
  actions.push(...expandedLeaderFocuses.filter((a) => expandedLeaderActionAvailable(a.id, game, event)).map((a, index) => ({ ...a, reason: "ทางเลือกตามสภาพค่ายและเหตุการณ์เดือนนี้", priority: 72 - index * 0.2 })));

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
    title: "เป้าหมายแรก: ผ่านปีแรกให้ได้",
    icon: "🔥",
    text: "คุณนำครอบครัวและชาวบ้านสิบชีวิตมาตั้งถิ่นฐานบนพื้นที่ว่างเปล่า ที่นี่ยังไม่มีบ้านถาวร ไม่มีคลัง และไม่มีเส้นทางค้าขาย มีเพียงกองไฟแรก ผู้คนที่ต้องพึ่งพากัน และการตัดสินใจของคุณ เป้าหมายแรกจึงไม่ใช่ความรุ่งเรือง แต่คือการพาทุกคนผ่านปีแรกให้ได้",
    bullets: ["สร้างที่พักให้พอก่อนอากาศเลวร้าย", "สะสมอาหาร น้ำ และฟืนก่อนฤดูหนาว", "ดูแลผู้บาดเจ็บ เพราะแรงงานหนึ่งคนอาจเปลี่ยนชะตาทั้งค่าย"]
  },
  {
    title: "ทรัพยากรทุกอย่างมีความหมาย",
    icon: "🏺",
    text: "อาหารและน้ำคือการอยู่รอด ไม้คือที่พัก ฟืน และการซ่อมแซม หินทำให้สิ่งปลูกสร้างทนทาน เครื่องมือทำให้งานเร็วขึ้นแต่พังได้ ส่วนความรู้คือสิ่งที่ทำให้ชุมชนไม่พลาดซ้ำในเรื่องเดิม",
    bullets: ["ทรัพยากรถูกผลิตและถูกใช้ทุกเดือน", "ฟืนสำคัญมากเมื่อเข้าสู่ฤดูหนาว", "คลังอาหารและการถนอมอาหารช่วยลดการสูญเสีย"]
  },
  {
    title: "จัดแรงงานให้เหมาะกับเดือนนั้น",
    icon: "🧑‍🌾",
    text: "ทุกเดือนคุณต้องแบ่งแรงงานไปหาอาหาร ตัดไม้ เก็บหิน ก่อสร้าง เฝ้ายาม หรือดูแลคนป่วย การใช้คนเกินกำลังจะทำให้ความเหนื่อยสะสม และเพิ่มโอกาสเกิดอุบัติเหตุ",
    bullets: ["ปุ่มจัดแรงงานแนะนำช่วยวางแผนตามสถานการณ์", "เด็ก ผู้สูงอายุ และคนเจ็บไม่ใช่แรงงานเต็มกำลัง", "ไม่มีเวรยามคือการปล่อยให้ความเสี่ยงเข้ามาใกล้กองไฟ"]
  },
  {
    title: "ผู้นำต้องตอบสนองต่อสถานการณ์จริง",
    icon: "👑",
    text: "การกระทำของผู้นำจะเปลี่ยนตามความเสี่ยงและเหตุการณ์ของเดือนนั้น หากมีโรคจะมีทางเลือกด้านการรักษา หากมีรอยเท้าหมาป่าจะมีทางเลือกด้านการลาดตระเวน หากอาหารต่ำจะมีทางเลือกด้านคลังเสบียงและการหาอาหาร",
    bullets: ["ตัวเลือกบางอย่างต้องมีทรัพยากรหรือสิ่งปลูกสร้างก่อน", "คำสั่งผู้นำส่งผลต่อความไว้ใจ ความปลอดภัย สุขภาพ และพงศาวดาร", "เลือกจากปัญหาของเดือน ไม่ใช่เลือกชุดเดิมทุกครั้ง"]
  },
  {
    title: "เหตุการณ์มีสัญญาณ ไม่ใช่การลงโทษแบบสุ่ม",
    icon: "🌧️",
    text: "เกมจะแสดงสัญญาณล่วงหน้าผ่านความเสี่ยง ฤดูกาล ข่าวลือ และเหตุการณ์ต่อเนื่อง รอยเท้าหมาป่าในเดือนนี้อาจกลายเป็นการโจมตีในเดือนหน้า โรคที่ถูกละเลยอาจกลายเป็นหลุมศพเมื่อฝนมา",
    bullets: ["อ่านความเสี่ยงก่อนจบเดือน", "ข่าวลือเปิดเส้นเรื่องและทรัพยากรใหม่", "บางเหตุการณ์จะต่อยอดไปอีกหลายเดือน"]
  },
  {
    title: "ความพ่ายแพ้ก็เป็นส่วนหนึ่งของพงศาวดาร",
    icon: "🕯️",
    text: "ถ้าประชากรเหลือศูนย์ ถิ่นฐานจะสิ้นสุดทันที หากอดอาหารต่อเนื่อง ความไว้ใจพัง หรือภัยภายนอกเกินควบคุม ค่ายอาจล่มสลายได้เช่นกัน ผู้จากไปจะถูกสรุปแบบย่อในหน้าหลัก และเก็บไว้เต็มในพงศาวดาร",
    bullets: ["ทุกชีวิตมีชื่อและร่องรอย ไม่ใช่เพียงตัวเลข", "Game Over มีหน้าสรุปสาเหตุการล่มสลาย", "การเริ่มใหม่จะสุ่มคนในค่ายชุดใหม่ เพื่อให้แต่ละรอบต่างกัน"]
  }
];

const buildingData: Record<BuildingKey, { icon: string; title: string; text: string; cost: Partial<Resources>; work: number; capacity?: number; unlock?: (game: GameState) => boolean }> = {
  shelter: { icon: "🛖", title: "ที่พักชั่วคราว", text: "รองรับ 6 คน ลดหนาว ลดฝน ลดโรค และลดความกลัวกลางคืน", cost: { wood: 12, hides: 1 }, work: 22, capacity: 6 },
  campfire: { icon: "🔥", title: "กองไฟกลาง", text: "ให้ความอบอุ่น เป็นที่ประชุม เพิ่มขวัญ และลดโรคจากความชื้น", cost: { wood: 8, stone: 2 }, work: 14 },
  storage: { icon: "🏺", title: "คลังอาหารเล็ก", text: "ลดอาหารเสีย เพิ่มความมั่นคงช่วงฤดูฝนและฤดูหนาว", cost: { wood: 18, stone: 3 }, work: 28 },
  well: { icon: "💧", title: "บ่อน้ำ", text: "น้ำสะอาด ลดโรค เพิ่มสุขาภิบาล และเป็นเงื่อนไขตั้งหมู่บ้าน", cost: { wood: 10, stone: 12 }, work: 40, unlock: (g) => g.researchDone.waterFinding },
  cistern: { icon: "🏺", title: "ถังเก็บน้ำฝน", text: "กักเก็บน้ำส่วนเกินในฤดูฝนไว้ใช้ยามแล้งหรือหนาวจัด ลดความผันผวนของน้ำ", cost: { wood: 18, stone: 12, tools: 1 }, work: 42, capacity: 60, unlock: (g) => g.researchDone.waterStorage },
  repairShed: { icon: "🧰", title: "เพิงซ่อมบำรุง", text: "เก็บไม้ หิน และเครื่องมือสำหรับซ่อมโครงสร้าง ลดการเสื่อมของอาคารปลายปี", cost: { wood: 22, stone: 6, tools: 2 }, work: 40, unlock: (g) => g.researchDone.maintenanceRoutine || g.buildings.workshop > 0 },
  watchPost: { icon: "🏹", title: "หอเฝ้ายาม", text: "ลดสัตว์ป่า โจร และเพิ่มโอกาสเห็นสัญญาณเตือนล่วงหน้า", cost: { wood: 22, tools: 1 }, work: 34, unlock: (g) => g.researchDone.watchRoutine },
  farmPlot: { icon: "🌱", title: "แปลงเพาะปลูก", text: "เพิ่มอาหารฤดูอบอุ่นและทำให้ค่ายเริ่มคิดเรื่องอนาคต", cost: { wood: 12, tools: 1 }, work: 32, unlock: (g) => g.researchDone.basicFarming },
  workshop: { icon: "⚒️", title: "เพิงช่าง", text: "ซ่อมเครื่องมือ เพิ่มผลผลิตไม้/หิน และลดอุบัติเหตุเครื่องมือหัก", cost: { wood: 28, stone: 8, tools: 2 }, work: 50, unlock: (g) => g.researchDone.simpleCraft },
  healerHut: { icon: "🌿", title: "กระท่อมหมอยา", text: "รักษาบาดเจ็บ ลดโรคระบาด ลดการตายจากแผลติดเชื้อ", cost: { wood: 20, herbs: 4 }, work: 36, unlock: (g) => g.researchDone.herbalCare },
  animalPen: { icon: "🐐", title: "คอกสัตว์พื้นฐาน", text: "กันสัตว์หนี ลดขโมยและสัตว์ป่าบุก ทำให้การเลี้ยงแพะ/ไก่มีโอกาสออกลูกมากขึ้น", cost: { wood: 24, tools: 1 }, work: 36, unlock: (g) => g.researchDone.animalKeeping },
  palisade: { icon: "🪵", title: "รั้วไม้รอบค่าย", text: "ลดหมาป่า โจร และช่วยให้เด็กไม่เดินหลงออกจากพื้นที่", cost: { wood: 42, tools: 2 }, work: 62, unlock: (g) => g.researchDone.palisadeCraft },
  graveyard: { icon: "🕯️", title: "ลานฝังศพใต้ต้นโอ๊ก", text: "ลดบาดแผลทางใจหลังความตาย และสร้างความทรงจำร่วม", cost: { stone: 8, wood: 6 }, work: 24 },
  meetingHall: { icon: "⚖️", title: "ศาลาประชุม", text: "ลดความขัดแย้ง เพิ่มกฎร่วม และปลดล็อกเส้นทางชุมชนแรกเริ่ม", cost: { wood: 34, stone: 6 }, work: 54, unlock: (g) => g.stage !== "ค่ายพักแรม" || g.people.filter((p) => p.alive).length >= 14 },
  smokeVent: { icon: "🌬️", title: "ช่องระบายควัน", text: "ทำให้ที่พักและกองไฟกลางหายใจได้ดีขึ้น ลดไอ ควันสะสม และโรคทางเดินหายใจ", cost: { wood: 10, stone: 2 }, work: 18, unlock: (g) => g.researchDone.shelterHygiene },
  dryingRack: { icon: "☀️", title: "ชั้นตากอาหารและสมุนไพร", text: "ช่วยถนอมอาหารและสมุนไพร ลดอาหารเสียช่วงฝนและร้อน ทำให้คลังเล็กมีประโยชน์ขึ้น", cost: { wood: 16, tools: 1 }, work: 24, unlock: (g) => g.researchDone.foodPreservation || g.researchDone.shelterHygiene },
  livestockShed: { icon: "🐄", title: "โรงเรือนสัตว์", text: "กันฝน ลม และสัตว์ป่าให้วัว หมู แพะ และไก่ ลดหิวตาย หนี และโรคสัตว์", cost: { wood: 34, stone: 6, tools: 2 }, work: 58, unlock: (g) => g.researchDone.animalBreeding },
  waterTrough: { icon: "🚰", title: "รางน้ำสัตว์", text: "แยกน้ำสัตว์จากน้ำคน ลดโรคและลดการใช้น้ำสูญเปล่าในคอก", cost: { wood: 12, stone: 8 }, work: 26, unlock: (g) => g.researchDone.animalBreeding || g.buildings.well > 0 },
  crisisBeacon: { icon: "🗼", title: "หอเตือนภัย", text: "จุดควันและระฆังเตือนล่วงหน้าสำหรับภัยใหญ่ ลดแรงกระแทกจากวิกฤตปลายเกม", cost: { wood: 34, stone: 18, tools: 2, gold: 4 }, work: 70, unlock: (g) => g.researchDone.crisisDrills || stageRank(g.stage) >= stageRank("เมืองเล็ก") },
  marketSquare: { icon: "🏛️", title: "ลานตลาดถาวร", text: "จุดเปลี่ยนจากค่ายรอดชีวิตสู่เมืองการค้า เปิดคาราวาน ภาษี และการตั้งสมาคม", cost: { wood: 58, stone: 18, tools: 3, gold: 20 }, work: 96, unlock: (g) => g.researchDone.currencyMinting && stageRank(g.stage) >= stageRank("เมืองเล็ก") },
  caravanPost: { icon: "🐪", title: "สถานีคาราวาน", text: "ทำให้เส้นทางการค้าเก่าเริ่มมีความหมายจริง ซื้อเกลือ เครื่องเทศ และส่งข่าวไกลกว่าเดิม", cost: { wood: 42, stone: 16, tools: 2, gold: 18 }, work: 82, unlock: (g) => g.researchDone.caravanContracts },
  huntersGuildHall: { icon: "🏹", title: "สมาคมพรานป่า", text: "ลดการจัดพรานทีละคนในเมืองใหญ่ เปลี่ยนเป็นตั้งงบและโควต้าอาหารระดับเมือง", cost: { timber: 20, bricks: 8, gold: 35, tools: 4 }, work: 110, unlock: (g) => g.researchDone.guildCharters && stageRank(g.stage) >= stageRank("เมืองการค้า") },
  buildersGuildHall: { icon: "🛠️", title: "สมาคมช่างก่อสร้าง", text: "รวมช่างไม้ ช่างหิน และคนซ่อมบำรุงให้ทำงานแบบระบบ ลดภาระจัดคนรายเดือนเมื่อเมืองโต", cost: { timber: 26, bricks: 12, gold: 35, tools: 5 }, work: 120, unlock: (g) => g.researchDone.guildCharters && stageRank(g.stage) >= stageRank("เมืองการค้า") },
  merchantsGuildHall: { icon: "🪙", title: "สมาคมพ่อค้า", text: "ดูแลเส้นทางคาราวานและการซื้อขายทรัพยากรขั้นสูง เช่น เกลือ เครื่องเทศ และผ้าทอ", cost: { timber: 18, bricks: 10, gold: 50, tools: 3 }, work: 105, unlock: (g) => g.researchDone.guildCharters && g.buildings.marketSquare > 0 },
  sawmill: { icon: "🪚", title: "โรงเลื่อย", text: "แปรรูปไม้ธรรมดาเป็นไม้แปรรูป ใช้สร้างอาคารยุคเมืองการค้าให้ทนภัยธรรมชาติมากขึ้น", cost: { wood: 50, stone: 14, tools: 4, gold: 10 }, work: 90, unlock: (g) => stageRank(g.stage) >= stageRank("เมืองการค้า") || g.researchDone.guildCharters },
  brickKiln: { icon: "🧱", title: "เตาเผาอิฐ", text: "แปรหินและดินเป็นอิฐเผา ช่วยให้อาคารเมืองใหญ่ทนฝน หนาว และไฟได้ดีขึ้น", cost: { stone: 42, fuel: 18, tools: 2 }, work: 86, unlock: (g) => g.researchDone.masonry && stageRank(g.stage) >= stageRank("เมืองการค้า") },
  senateHouse: { icon: "👑", title: "สภาเมือง", text: "เปิดระบบนครรัฐ ฝ่ายอำนาจในเมือง และการตัดสินใจที่ไม่ใช่คำสั่งของผู้นำคนเดียวอีกต่อไป", cost: { timber: 40, bricks: 35, gold: 90, influence: 40 }, work: 180, unlock: (g) => g.researchDone.bureaucracy && stageRank(g.stage) >= stageRank("เมืองการค้า") },
  smeltery: { icon: "🏭", title: "โรงถลุง", text: "หลอมแร่เหล็กและถ่านหินเป็นเหล็กกล้า เปิดทางสู่อาวุธ กำแพง และยุคสงครามป้องกันเมือง", cost: { bricks: 32, stone: 30, tools: 6, gold: 45 }, work: 150, unlock: (g) => g.researchDone.ironSmelting },
  castleKeep: { icon: "🏰", title: "ปราการกลาง", text: "หลักฐานว่าเมืองกลายเป็นอำนาจระดับอาณาจักร ลดการล้อมเมืองและเป็นศูนย์กลางการสืบทอด", cost: { steel: 160, bricks: 90, timber: 70, gold: 180, influence: 120 }, work: 320, unlock: (g) => g.researchDone.dynasticSuccession && stageRank(g.stage) >= stageRank("นครรัฐ") },
};

const researchData: Record<ResearchKey, { icon: string; title: string; text: string; cost: number; prereq?: ResearchKey[] }> = {
  foodPreservation: { icon: "🏺", title: "การถนอมอาหาร", text: "ลดอาหารเสียและเพิ่มความหมายของคลังอาหาร", cost: 28 },
  stoneTools: { icon: "🪨", title: "เครื่องมือหิน", text: "เพิ่มผลผลิตไม้/หิน ลดเครื่องมือพังจากงานหนัก", cost: 22 },
  woodShelter: { icon: "🛖", title: "ที่พักไม้", text: "ที่พักทนฝนและหนาวดีขึ้น ลดโรคควันและความชื้น", cost: 32, prereq: ["stoneTools"] },
  basicFarming: { icon: "🌱", title: "เพาะปลูกเบื้องต้น", text: "ปลดล็อกแปลงเพาะปลูกและช่วยให้รอดฤดูหนาวระยะยาว", cost: 42, prereq: ["foodPreservation"] },
  herbalCare: { icon: "🌿", title: "สมุนไพรรักษาแผล", text: "ปลดล็อกกระท่อมหมอยา ลดแผลติดเชื้อและไข้ฤดูฝน", cost: 34 },
  watchRoutine: { icon: "🛡️", title: "ระบบเวรยาม", text: "ปลดล็อกหอเฝ้ายาม เพิ่มสัญญาณเตือนก่อนภัยมา", cost: 32 },
  simpleCraft: { icon: "⚒️", title: "งานช่างพื้นฐาน", text: "ปลดล็อกเพิงช่าง ลดอุบัติเหตุจากเครื่องมือเก่า", cost: 46, prereq: ["stoneTools"] },
  waterFinding: { icon: "💧", title: "การหาแหล่งน้ำ", text: "เพิ่มประสิทธิภาพการตักน้ำ ปลดล็อกบ่อน้ำ และลดโรคน้ำเสีย", cost: 36 },
  waterStorage: { icon: "🏺", title: "การกักเก็บน้ำ", text: "ปลดล็อกถังเก็บน้ำฝน เก็บน้ำส่วนเกินเมื่อมีฝนหรือน้ำเหลือ ช่วยผ่านแล้งและหนาวยาว", cost: 42, prereq: ["waterFinding"] },
  maintenanceRoutine: { icon: "🧰", title: "ซ่อมบำรุงประจำปี", text: "ปลดล็อกเพิงซ่อมบำรุงและนโยบายซ่อมอัตโนมัติ อาคารเสื่อมช้าลงและซ่อมถูกลง", cost: 44, prereq: ["simpleCraft"] },
  familyRecords: { icon: "👪", title: "บันทึกสายสัมพันธ์", text: "ลดผลกระทบจาก Grief และช่วยดูแลครอบครัวผู้สูญเสีย", cost: 38, prereq: ["storyRecords"] },
  animalQuarantine: { icon: "🦠", title: "แยกสัตว์ป่วย", text: "ลดโรคสัตว์และโอกาสแพร่จากคอกสู่คน", cost: 48, prereq: ["animalKeeping", "sanitation"] },
  apprenticeship: { icon: "🎓", title: "ระบบฝึกงาน", text: "คนที่ทำงานเดิมต่อเนื่องจะชำนาญเร็วขึ้น เด็กช่วยงานปลอดภัยขึ้น", cost: 46, prereq: ["storyRecords", "simpleCraft"] },
  weatherReading: { icon: "🌦️", title: "อ่านฟ้าและลม", text: "ลดผลเสียจากสภาพอากาศผันผวน และคาดการณ์พายุ/แล้งได้ดีขึ้น", cost: 40, prereq: ["storyRecords"] },
  sanitation: { icon: "🧼", title: "สุขาภิบาลค่าย", text: "ลดโรคจากคนอยู่แออัด ควัน น้ำสกปรก และอาหารเสีย", cost: 44, prereq: ["waterFinding", "herbalCare"] },
  animalKeeping: { icon: "🐐", title: "การเลี้ยงสัตว์พื้นฐาน", text: "เรียนรู้การผูก เลี้ยง คัดแยกสัตว์ป่วย และสร้างคอกพื้นฐาน ลดสัตว์หนี/หิวตาย", cost: 40, prereq: ["basicFarming"] },
  fodderPrep: { icon: "🌿", title: "การทำอาหารสัตว์", text: "ปลดล็อกทรัพยากรอาหารสัตว์และงานตัดหญ้า/ทำฟาง ลดการแย่งอาหารคน", cost: 46, prereq: ["animalKeeping"] },
  storyRecords: { icon: "📜", title: "บันทึกความทรงจำ", text: "ทำให้พงศาวดารและความทรงจำส่งผลต่อคนรุ่นต่อไปมากขึ้น", cost: 38 },
  palisadeCraft: { icon: "🪵", title: "รั้วไม้และประตูค่าย", text: "ปลดล็อกรั้วไม้รอบค่าย ลดโจรและสัตว์ป่า", cost: 52, prereq: ["watchRoutine", "simpleCraft"] },
  signalNetwork: { icon: "🕊️", title: "เครือข่ายสายข่าว", text: "จัดคนรับฟังข่าวจากพ่อค้า คนเดินทาง และครอบครัวรอบเมือง เพื่อเห็นภัยและโอกาสก่อนเกิดขึ้น", cost: 64, prereq: ["storyRecords", "watchRoutine"] },
  shelterHygiene: { icon: "🌬️", title: "ที่พักปลอดควันและความชื้น", text: "ปลดล็อกช่องระบายควัน ลดโรคจากควัน ฝน และการอยู่รวมกันในที่พักแออัด", cost: 40, prereq: ["woodShelter", "sanitation"] },
  animalBreeding: { icon: "🐄", title: "คัดพันธุ์และโรงเรือนสัตว์", text: "ปลดล็อกโรงเรือนสัตว์และรางน้ำสัตว์ เพิ่มโอกาสออกลูก ลดสัตว์หิว ป่วย หนี และถูกขโมย", cost: 58, prereq: ["animalKeeping", "fodderPrep"] },
  stormPrep: { icon: "🌨️", title: "แผนรับมือฤดูวิปริต", text: "ลดผลกระทบจากพายุเร็ว หนาวยาว และภัยแล้งเมื่อมีเสบียงสำรองพอ", cost: 62, prereq: ["weatherReading", "waterStorage"] },
  crisisDrills: { icon: "🗼", title: "ซ้อมรับภัยใหญ่", text: "เปิดแนวทางรับมือวิกฤตช่วงท้าย ลด Game Over จากพายุหิมะ โจรใหญ่ หรือโรคระบาดใหญ่", cost: 72, prereq: ["stormPrep", "watchRoutine"] },
  masonry: { icon: "🧱", title: "งานหินและฐานราก", text: "เพิ่มความทนทานของสิ่งปลูกสร้าง ลดอุบัติเหตุจากงานหิน และเปิดทางสู่สิ่งก่อสร้างถาวร", cost: 54, prereq: ["stoneTools", "simpleCraft"] },
  herbalWorkshop: { icon: "🧪", title: "การปรุงยาพื้นบ้าน", text: "ทำให้สมุนไพรกลายเป็นการรักษาที่มั่นคงขึ้น เพิ่มผลของงานเก็บสมุนไพรและดูแลคนป่วย", cost: 52, prereq: ["herbalCare", "sanitation"] },
  projectPlanning: { icon: "📐", title: "การวางแผนงานก่อสร้าง", text: "ช่วยให้ทีมก่อสร้างและทีมวิจัยแบ่งแรงงานชัดเจน ลดงานซ้ำ ลดอุบัติเหตุ และเร่งโครงการที่มีคนทำจริง", cost: 60, prereq: ["simpleCraft", "storyRecords"] },
  campPolicies: { icon: "⚙️", title: "ธรรมเนียมบริหารค่าย", text: "ปลดล็อกแท็บนโยบาย ให้ชุมชนเริ่มมีข้อตกลงอัตโนมัติเรื่องเสบียง เด็ก น้ำ และซ่อมบำรุง โดยยังไม่รกตั้งแต่ต้นเกม", cost: 54, prereq: ["storyRecords", "watchRoutine"] },
  guildCharters: { icon: "📜", title: "ใบอนุญาตตั้งสมาคม", text: "เปิดระบบสมาคมอาชีพสำหรับเมืองใหญ่ เพื่อลดการจัดคนทีละคนเมื่อประชากรเกินร้อย", cost: 96, prereq: ["signalNetwork", "campPolicies"] },
  currencyMinting: { icon: "🪙", title: "การผลิตเหรียญและบัญชีตลาด", text: "ทำให้ทองเป็นทรัพย์สินเมืองจริง เปิดลานตลาดถาวรและภาษีการค้า", cost: 88, prereq: ["guildCharters"] },
  caravanContracts: { icon: "🐪", title: "สัญญาคาราวาน", text: "เปิดสถานีคาราวาน เส้นทางซื้อเกลือ เครื่องเทศ และข่าวสารจากภูมิภาค", cost: 100, prereq: ["currencyMinting"] },
  outpostLogistics: { icon: "🗺️", title: "ระบบฐานที่มั่นรอง", text: "เมื่อสำรวจครบ 100% สามารถตั้ง Outpost เพื่อส่งทรัพยากรกลับเมืองรายเดือนได้", cost: 110, prereq: ["caravanContracts", "projectPlanning"] },
  bureaucracy: { icon: "🏛️", title: "ระบบราชการเมือง", text: "เปิดสภาเมืองและฝ่ายอำนาจภายใน เป็นประตูสู่ยุคนครรัฐ", cost: 140, prereq: ["guildCharters", "campPolicies"] },
  ironSmelting: { icon: "⛏️", title: "การถลุงเหล็ก", text: "เปิดโรงถลุง ใช้แร่เหล็กและถ่านหินเพื่อสร้างเหล็กกล้า", cost: 132, prereq: ["masonry", "outpostLogistics"] },
  smelteryOps: { icon: "🏭", title: "การจัดการโรงถลุง", text: "เพิ่มประสิทธิภาพการหลอมเหล็กกล้าและลดอุบัติเหตุจากเตาหลอม", cost: 160, prereq: ["ironSmelting"] },
  diplomacyProtocol: { icon: "🕊️", title: "พิธีการทูตและอิทธิพล", text: "เปิดอิทธิพล การเจรจากับเมืองอื่น และวางรากฐานนครรัฐ/อาณาจักร", cost: 150, prereq: ["bureaucracy"] },
  dynasticSuccession: { icon: "👑", title: "การสืบทอดสายเลือด", text: "เปิดระบบทายาทอย่างเป็นทางการ ผู้นำแก่ลงและเมืองต้องรอดต่อไปแม้ผู้ก่อตั้งจากไป", cost: 190, prereq: ["diplomacyProtocol", "familyRecords"] },
  siegeEngineering: { icon: "🔥", title: "วิศวกรรมสงคราม", text: "เปลี่ยนภัยโจรระดับปลายเกมให้เป็นการล้อมเมือง ต้องใช้เหล็กกล้าและวัสดุป้องกันจริง", cost: 210, prereq: ["ironSmelting", "crisisDrills"] },
};

function clamp(n: number, min = 0, max = 100) { return Math.max(min, Math.min(max, Math.round(n))); }
function uid(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function seasonOf(month: number): Season { return seasons[(month - 1) % 12]; }
function fmt(n: number) { return Math.round(n).toLocaleString("th-TH"); }
function pct(n: number) { return `${clamp(n)}%`; }

function statToneClass(value: number, kind: "goodHigh" | "badHigh" = "goodHigh") {
  if (kind === "badHigh") return value >= 50 ? "danger-text" : "good-text";
  return value >= 50 ? "good-text" : "danger-text";
}
function statToneBadge(value: number, kind: "goodHigh" | "badHigh" = "goodHigh") {
  if (kind === "badHigh") return value >= 50 ? "badge red" : "badge green";
  return value >= 50 ? "badge green" : "badge red";
}
function viewLabel(view: View) {
  const labels: Record<View, string> = {
    "เมือง": "🏕️ เมือง",
    "ทรัพยากร": "📦 ทรัพยากร",
    "คน": "👥 คน",
    "แผนที่": "🧭 แผนที่",
    "ก่อสร้าง": "🛖 ก่อสร้าง",
    "วิจัย": "📜 วิจัย",
    "สัตว์เลี้ยง": "🐐 สัตว์เลี้ยง",
    "นโยบาย": "⚙️ นโยบาย",
    "ข่าวสาร": "🕊️ ข่าวสาร",
    "พงศาวดาร": "📖 พงศาวดาร",
    "ตั้งค่า": "⚙️ ตั้งค่า",
  };
  return labels[view];
}
function detectDeviceMode(): DeviceMode {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  const ua = window.navigator.userAgent;
  const isTabletUA = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua);
  if (width <= 720 || /iPhone|Android.*Mobile|Windows Phone/i.test(ua)) return "mobile";
  if (width <= 1180 || isTabletUA) return "tablet";
  return "desktop";
}
function deviceLabel(mode: DeviceMode) {
  if (mode === "mobile") return "มือถือ";
  if (mode === "tablet") return "แท็บเล็ต";
  return "เดสก์ท็อป";
}
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
    watchRoutine: false, simpleCraft: false, waterFinding: false, waterStorage: false, sanitation: false, maintenanceRoutine: false, familyRecords: false, animalQuarantine: false, apprenticeship: false, weatherReading: false, animalKeeping: false, fodderPrep: false, storyRecords: false, palisadeCraft: false, signalNetwork: false,
    shelterHygiene: false, animalBreeding: false, masonry: false, herbalWorkshop: false, projectPlanning: false, stormPrep: false, crisisDrills: false,
    campPolicies: false, guildCharters: false, currencyMinting: false, caravanContracts: false, outpostLogistics: false, bureaucracy: false, ironSmelting: false, smelteryOps: false, diplomacyProtocol: false, dynasticSuccession: false, siegeEngineering: false,
  };
}
function emptyBuildings(): Buildings {
  return { shelter: 0, campfire: 0, storage: 0, well: 0, cistern: 0, repairShed: 0, watchPost: 0, farmPlot: 0, workshop: 0, healerHut: 0, animalPen: 0, palisade: 0, graveyard: 0, meetingHall: 0, smokeVent: 0, dryingRack: 0, livestockShed: 0, waterTrough: 0, crisisBeacon: 0, marketSquare: 0, caravanPost: 0, huntersGuildHall: 0, buildersGuildHall: 0, merchantsGuildHall: 0, sawmill: 0, brickKiln: 0, senateHouse: 0, smeltery: 0, castleKeep: 0 };
}
function baseResources(origin: Origin): Resources {
  const r: Resources = { food: 30, wood: 20, stone: 5, tools: 5, herbs: 2, hides: 1, water: 20, waterReserve: 0, knowledge: 0, fuel: 8, ore: 0, gold: 0, feed: 0, ironOre: 0, coal: 0, timber: 0, bricks: 0, textiles: 0, salt: 0, spices: 0, influence: 0, steel: 0, luxuries: 0, warhorses: 0, manpower: 0, siegeMaterials: 0 };
  if (origin === "builder") { r.wood += 12; r.tools += 1; }
  if (origin === "hunter") { r.food += 12; r.hides += 2; }
  if (origin === "healer") { r.herbs += 6; }
  if (origin === "keeper") { r.knowledge += 10; }
  return r;
}
function pickFrom<T>(items: T[]): T { return items[Math.floor(Math.random() * items.length)]; }
function shuffle<T>(items: T[]): T[] { return [...items].sort(() => Math.random() - 0.5); }
function initialPeople(leaderName: string, houseName: string, origin: Origin): Person[] {
  const leaderSkill: SkillKey = origin === "hunter" ? "hunter" : origin === "healer" ? "healer" : origin === "keeper" ? "keeper" : origin === "mediator" ? "guard" : "builder";
  const namePool = ["Tovin", "Kael", "Elna", "Mara", "Orin", "Sela", "Narin", "Boran", "Ysa", "Darin", "Mek", "Sorin", "Lora", "Pavel", "Nia", "Kiran", "Mali", "Arun", "Ruen", "Tala", "Nora", "Keta", "Pim", "Lina"];
  const traitPool = ["ใจร้อน", "สุขุม", "มือหนัก", "ช่างสังเกต", "ใจดี", "ไม่ค่อยไว้ใจใคร", "อดทน", "เล่านิทานเก่ง", "กล้าหาญ", "ละเอียดอ่อน", "หัวไว", "ชอบช่วยงาน", "กินจุ", "กินน้อย", "ขยันเป็นพิเศษ", "เรียนรู้ไว", "มือเบา", "รักสัตว์"];
  const adultTemplates: Array<{ role: string; skill: SkillKey; ageMin: number; ageMax: number; traits: string[] }> = [
    { role: "ช่างไม้", skill: "builder", ageMin: 24, ageMax: 46, traits: ["มือหนัก"] },
    { role: "พราน", skill: "hunter", ageMin: 19, ageMax: 39, traits: ["อ่านรอยเก่ง"] },
    { role: "คนครัว", skill: "farmer", ageMin: 23, ageMax: 44, traits: ["ใจดี"] },
    { role: "เวรยามฝึกหัด", skill: "guard", ageMin: 18, ageMax: 34, traits: ["กล้าหาญ"] },
    { role: "ผู้ดูแลเด็ก", skill: "healer", ageMin: 22, ageMax: 42, traits: ["ละเอียดอ่อน"] },
    { role: "คนเก็บหิน", skill: "builder", ageMin: 28, ageMax: 54, traits: ["อดทน"] },
    { role: "คนจดจำเรื่องเก่า", skill: "keeper", ageMin: 25, ageMax: 55, traits: ["ช่างสังเกต"] },
    { role: "ชาวไร่", skill: "farmer", ageMin: 18, ageMax: 48, traits: ["ชอบช่วยงาน"] },
  ];
  const people: Person[] = [
    { id: "leader", name: leaderName, age: 26 + Math.floor(Math.random() * 12), kin: `House ${houseName}`, role: "ผู้นำค่าย", skill: leaderSkill, health: 78 + Math.floor(Math.random() * 12), morale: 65 + Math.floor(Math.random() * 8), fatigue: 0, injured: false, alive: true, traits: ["ผู้ก่อตั้ง", pickFrom(traitPool)] },
  ];
  const shuffledNames = shuffle(namePool.filter((n) => n !== leaderName));
  shuffle(adultTemplates).slice(0, 6).forEach((t, i) => {
    people.push({
      id: uid("villager"), name: shuffledNames[i], age: t.ageMin + Math.floor(Math.random() * (t.ageMax - t.ageMin + 1)), kin: "ชาวบ้าน", role: t.role, skill: t.skill,
      health: 62 + Math.floor(Math.random() * 24), morale: 48 + Math.floor(Math.random() * 22), fatigue: Math.floor(Math.random() * 10), injured: false, alive: true,
      traits: Array.from(new Set([...t.traits, pickFrom(traitPool)])).slice(0, 2),
    });
  });
  const elderName = shuffledNames[7] ?? "Old Ren";
  people.push({ id: uid("elder"), name: elderName, age: 63 + Math.floor(Math.random() * 11), kin: "ผู้เฒ่า", role: "ผู้เฒ่า", skill: "elder", health: 46 + Math.floor(Math.random() * 18), morale: 55 + Math.floor(Math.random() * 12), fatigue: 0, injured: false, alive: true, traits: ["จำเรื่องเก่า", pickFrom(traitPool)] });
  const childNames = shuffle(["Lina", "Pim", "Mira", "Ren", "Toma", "Sana", "Eli", "Noa", "Keta"]);
  people.push({ id: uid("child"), name: childNames[0], age: 6 + Math.floor(Math.random() * 7), kin: `House ${houseName}`, role: "เด็ก", skill: "child", health: 60 + Math.floor(Math.random() * 18), morale: 62 + Math.floor(Math.random() * 12), fatigue: 0, injured: false, alive: true, traits: ["ช่างสังเกต"] });
  people.push({ id: uid("child"), name: childNames[1], age: 4 + Math.floor(Math.random() * 8), kin: "ชาวบ้าน", role: "เด็ก", skill: "child", health: 58 + Math.floor(Math.random() * 18), morale: 62 + Math.floor(Math.random() * 12), fatigue: 0, injured: false, alive: true, traits: ["รักนิทาน"] });
  return people.slice(0, 10);
}
function adultWorkers(game: GameState) {
  return Math.round(workerCapacity(game) * 10) / 10;
}
function workAgeLabel(person: Person) {
  if (person.age < 12) return "เด็กเล็ก";
  if (person.age < 15) return "เด็กช่วยงาน";
  if (person.age < 60) return "แรงงานเต็มวัย";
  return "ผู้สูงอายุ";
}
function helperTraitBoost(person: Person) {
  return person.traits.includes("ขยันเป็นพิเศษ") || person.traits.includes("ชอบช่วยงาน") || person.traits.includes("เรียนรู้ไว") || person.traits.includes("อดทน");
}
function baseWorkFactor(person: Person) {
  if (!person.alive || person.injured || person.health <= 28) return 0;
  if (person.age < 12) return 0;
  if (person.age < 15) return helperTraitBoost(person) ? 0.8 : 0.5;
  if (person.age < 60) return 1;
  return helperTraitBoost(person) ? 0.8 : 0.5;
}
function workerCapacity(game: GameState) {
  return Math.round(alivePeople(game).reduce((sum, p) => sum + baseWorkFactor(p), 0) * 10) / 10;
}
function laborAssignmentLoad(game: GameState, assignments: LaborAssignments = game.laborAssignments ?? {}) {
  const normalized = normalizeLaborAssignments(game, assignments);
  const used = new Set<string>();
  for (const key of Object.keys(emptyLabor()) as LaborKey[]) {
    for (const id of normalized[key] ?? []) used.add(id);
  }
  return Math.round(Array.from(used).reduce((sum, id) => {
    const person = game.people.find((p) => p.id === id);
    return sum + (person ? baseWorkFactor(person) : 0);
  }, 0) * 10) / 10;
}
function eligibleWorkers(game: GameState) {
  return alivePeople(game).filter((p) => baseWorkFactor(p) > 0);
}
function alivePeople(game: GameState) { return game.people.filter((p) => p.alive); }
function childrenCount(game: GameState) { return alivePeople(game).filter((p) => p.age < 16).length; }
function eldersCount(game: GameState) { return alivePeople(game).filter((p) => p.age >= 62).length; }
function woundedCount(game: GameState) { return alivePeople(game).filter((p) => p.injured || p.health < 45).length; }
function shelterCapacity(game: GameState) {
  const base = game.buildings.shelter * (game.researchDone.woodShelter ? 8 : 6);
  return base + (game.buildings.meetingHall > 0 ? 4 : 0);
}
function emptyLabor(): Labor {
  return { forage: 0, wood: 0, stone: 0, build: 0, guard: 0, care: 0, research: 0, farm: 0, water: 0, preserve: 0, craft: 0, herbs: 0, feed: 0, patrol: 0, explore: 0, trade: 0, teach: 0, intel: 0 };
}

function emptyAnimalState(): AnimalState {
  return { animals: { goats: 0, chickens: 0, dogs: 0, cows: 0, pigs: 0 }, hunger: 0, health: 70, lastAction: "keep", log: [] };
}
function normalizeAnimalState(state?: Partial<AnimalState>): AnimalState {
  const base = emptyAnimalState();
  return {
    animals: { goats: Math.max(0, Math.round(state?.animals?.goats ?? 0)), chickens: Math.max(0, Math.round(state?.animals?.chickens ?? 0)), dogs: Math.max(0, Math.round(state?.animals?.dogs ?? 0)), cows: Math.max(0, Math.round((state as any)?.animals?.cows ?? 0)), pigs: Math.max(0, Math.round((state as any)?.animals?.pigs ?? 0)) },
    hunger: clamp(state?.hunger ?? 0),
    health: clamp(state?.health ?? 70),
    lastAction: state?.lastAction ?? "keep",
    log: (state?.log ?? []).slice(0, 20),
  };
}
function animalCount(game: GameState) {
  const a = normalizeAnimalState(game.animalState).animals;
  return a.goats + a.chickens + a.dogs + a.cows + a.pigs;
}
function animalNeed(game: GameState) {
  const a = normalizeAnimalState(game.animalState).animals;
  const base = a.goats * 2 + a.chickens * 0.35 + a.dogs * 1.2 + a.cows * 3.4 + a.pigs * 1.7;
  const shelterSaving = game.buildings.livestockShed > 0 ? 0.9 : 1;
  return Math.ceil(base * shelterSaving);
}
function animalFoodSource(game: GameState) {
  if (game.researchDone.fodderPrep) return "อาหารสัตว์คุณภาพ";
  if (game.buildings.animalPen > 0 || game.resources.feed > 0) return "หญ้า/เศษพืชอาหารหยาบ";
  return "อาหารคน/เศษพืช";
}
function animalSecurityBonus(game: GameState) {
  const a = normalizeAnimalState(game.animalState).animals;
  return Math.min(10, a.dogs * 3 + a.cows * 0.8 + game.buildings.animalPen * 2);
}

function emptyWeatherState(): WeatherState {
  return { kind: "ปกติ", severity: 0, monthsLeft: 0, forecast: "ท้องฟ้ายังอ่านยาก แต่ฤดูกาลเดินตามจังหวะเดิม", lastYearPattern: "ยังไม่มีบันทึกอากาศ" };
}
function normalizeWeatherState(state?: Partial<WeatherState>): WeatherState {
  const base = emptyWeatherState();
  return { kind: state?.kind ?? base.kind, severity: clamp(state?.severity ?? 0), monthsLeft: Math.max(0, Math.round(state?.monthsLeft ?? 0)), forecast: state?.forecast ?? base.forecast, lastYearPattern: state?.lastYearPattern ?? base.lastYearPattern };
}
function emptyPolicies(): CampPolicies {
  return { autoFoodShift: true, autoMaintenance: true, protectChildren: true, reserveWater: true, rationMode: "เท่าเทียม" };
}
function normalizePolicies(p?: Partial<CampPolicies>): CampPolicies {
  return { ...emptyPolicies(), ...(p ?? {}) };
}
function emptyCrisis(): EndgameCrisis {
  return { kind: "none", yearsUntil: 0, warningLevel: 0, active: false, resolved: false };
}
function normalizeCrisis(c?: Partial<EndgameCrisis>): EndgameCrisis {
  return { ...emptyCrisis(), ...(c ?? {}) };
}
function emptyGuilds(): GuildState {
  return {
    huntersGuild: { level: 0, funding: 0, activeEdict: "balanced" },
    buildersGuild: { level: 0, funding: 0, activeEdict: "balanced" },
    merchantsGuild: { level: 0, funding: 0, activeEdict: "balanced" },
  };
}
function normalizeGuilds(guilds?: Partial<GuildState>): GuildState {
  const base = emptyGuilds();
  return {
    huntersGuild: { ...base.huntersGuild, ...(guilds?.huntersGuild ?? {}) },
    buildersGuild: { ...base.buildersGuild, ...(guilds?.buildersGuild ?? {}) },
    merchantsGuild: { ...base.merchantsGuild, ...(guilds?.merchantsGuild ?? {}) },
  };
}
function emptyFactions(): FactionState {
  return { guards: { approval: 55, power: 10 }, farmers: { approval: 55, power: 10 }, merchants: { approval: 50, power: 5 }, builders: { approval: 55, power: 8 } };
}
function normalizeFactions(factions?: Partial<FactionState>): FactionState {
  const base = emptyFactions();
  return {
    guards: { ...base.guards, ...(factions?.guards ?? {}) },
    farmers: { ...base.farmers, ...(factions?.farmers ?? {}) },
    merchants: { ...base.merchants, ...(factions?.merchants ?? {}) },
    builders: { ...base.builders, ...(factions?.builders ?? {}) },
  };
}
function normalizeOutposts(outposts?: Partial<Outpost>[]): Outpost[] {
  return (outposts ?? []).map((o, i) => ({
    id: o.id ?? uid("outpost"),
    location: (o.location ?? "shallowStream") as LocationKey,
    name: o.name ?? "ฐานที่มั่นรอง",
    kind: (o.kind ?? "food") as OutpostKind,
    workers: Math.max(0, Math.round(o.workers ?? 10)),
    level: Math.max(1, Math.round(o.level ?? 1)),
    security: clamp(o.security ?? 55),
    monthly: { ...(o.monthly ?? {}) },
  })).slice(0, 24);
}
function stageRank(stage: Stage) {
  const order: Stage[] = ["ค่ายพักแรม", "ชุมชนแรกเริ่ม", "หมู่บ้านถาวร", "เมืองเล็ก", "เมืองการค้า", "นครรัฐ", "อาณาจักร"];
  return Math.max(0, order.indexOf(stage));
}
function canUsePolicies(game: GameState) {
  return game.researchDone.campPolicies || game.researchDone.projectPlanning || game.buildings.meetingHall > 0;
}
function canUseRegionalSystems(game: GameState) {
  return stageRank(game.stage) >= stageRank("เมืองการค้า") && game.researchDone.outpostLogistics;
}
function canUseKingdomSystems(game: GameState) {
  return stageRank(game.stage) >= stageRank("อาณาจักร");
}
function emptyBuildingCondition(buildings: Buildings = emptyBuildings()): BuildingCondition {
  const result: BuildingCondition = {};
  (Object.keys(buildings) as BuildingKey[]).forEach((key) => { if ((buildings[key] ?? 0) > 0) result[key] = 100; });
  return result;
}
function normalizeBuildingCondition(game: Partial<GameState>): BuildingCondition {
  const buildings = { ...emptyBuildings(), ...(game.buildings ?? {}) } as Buildings;
  const old = (game as any).buildingCondition ?? {};
  const result: BuildingCondition = {};
  (Object.keys(buildings) as BuildingKey[]).forEach((key) => { if ((buildings[key] ?? 0) > 0) result[key] = clamp(old[key] ?? 100); });
  return result;
}
function normalizeAdvancedSystems(game: GameState): GameState {
  return {
    ...game,
    weather: normalizeWeatherState((game as any).weather),
    policies: normalizePolicies((game as any).policies),
    crisis: normalizeCrisis((game as any).crisis),
    guilds: normalizeGuilds((game as any).guilds),
    outposts: normalizeOutposts((game as any).outposts),
    factions: normalizeFactions((game as any).factions),
    leaderAge: Math.max(18, Math.round((game as any).leaderAge ?? game.people?.find((p) => p.id === "leader")?.age ?? 28)),
    heir: ((game as any).heir ?? null) as Person | null,
    buildingCondition: normalizeBuildingCondition(game),
    resources: { ...baseResources(game.origin), ...game.resources },
    researchDone: { ...emptyResearch(), ...game.researchDone },
    buildings: { ...emptyBuildings(), ...game.buildings },
    people: game.people.map((p) => ({ ...p, xp: p.xp ?? {}, grief: p.grief ?? 0, closeKin: p.closeKin ?? [] })),
  };
}
function seasonalWeatherLabel(game: GameState) {
  const w = normalizeWeatherState(game.weather);
  return w.kind === "ปกติ" ? seasonOf(game.month) : `${seasonOf(game.month)} · ${w.kind}`;
}
function weatherProductionFactor(game: GameState, target: "food" | "water" | "wood" | "build" | "research") {
  const w = normalizeWeatherState(game.weather);
  const s = w.severity / 100;
  if (w.kind === "แล้งจัด") return target === "water" ? 1 - s * 0.55 : target === "food" ? 1 - s * 0.25 : 1;
  if (w.kind === "หนาวยาว") return target === "food" ? 1 - s * 0.38 : target === "build" ? 1 - s * 0.12 : 1;
  if (w.kind === "พายุเข้าเร็ว") return target === "wood" || target === "build" ? 1 - s * 0.22 : target === "water" ? 1 + s * 0.18 : 1;
  if (w.kind === "ฝนหลงฤดู") return target === "water" ? 1 + s * 0.25 : target === "food" ? 1 + s * 0.05 : 1;
  if (w.kind === "หมอกชื้น") return target === "research" ? 1 - s * 0.05 : target === "food" ? 1 - s * 0.12 : 1;
  return 1;
}
function chooseNextWeather(game: GameState): WeatherState {
  const old = normalizeWeatherState(game.weather);
  if (old.monthsLeft > 1) return { ...old, monthsLeft: old.monthsLeft - 1, forecast: weatherForecastText({ ...old, monthsLeft: old.monthsLeft - 1 }) };
  const season = seasonOf(game.month);
  const baseChance = 12 + terrainData[game.terrain ?? "riverbank"].weather * 0.35 + (game.researchDone.weatherReading ? -4 : 0) + (game.researchDone.stormPrep ? -3 : 0);
  if (Math.random() * 100 > baseChance) return { ...emptyWeatherState(), lastYearPattern: old.lastYearPattern };
  const pool: WeatherKind[] = season === "ฤดูหนาว" ? ["หนาวยาว", "พายุเข้าเร็ว", "หมอกชื้น"] : season === "ฤดูฝน" ? ["ฝนหลงฤดู", "พายุเข้าเร็ว", "หมอกชื้น"] : season === "ฤดูร้อน" ? ["แล้งจัด", "พายุเข้าเร็ว"] : ["ฝนหลงฤดู", "แล้งจัด", "หมอกชื้น"];
  const kind = pickFrom(pool);
  const severity = 25 + Math.floor(Math.random() * 45) + (game.crisis.active ? 10 : 0);
  const monthsLeft = kind === "หนาวยาว" || kind === "แล้งจัด" ? 2 + Math.floor(Math.random() * 2) : 1;
  const state = { kind, severity: clamp(severity), monthsLeft, forecast: "", lastYearPattern: old.lastYearPattern } as WeatherState;
  return { ...state, forecast: weatherForecastText(state) };
}
function weatherForecastText(w: WeatherState) {
  if (w.kind === "ปกติ") return "ท้องฟ้าสงบพอให้ค่ายอ่านฤดูกาลตามเดิม";
  if (w.kind === "แล้งจัด") return `ลมแห้งกัดริมปาก แหล่งน้ำอาจลดลงอีก ${w.monthsLeft} เดือน`;
  if (w.kind === "หนาวยาว") return `ความหนาวเกาะอยู่กับดินนานกว่าที่ควร ต้องกันฟืนและอาหารไว้`;
  if (w.kind === "พายุเข้าเร็ว") return "ลมเปลี่ยนทิศเร็วผิดปกติ หลังคาและเส้นทางอาจเสียหาย";
  if (w.kind === "ฝนหลงฤดู") return "เมฆฝนเดินผิดฤดู น้ำเพิ่มขึ้น แต่โรคและอาหารเสียก็ขยับตาม";
  return "หมอกชื้นคลุมเช้า แผลและโรคทางเดินหายใจต้องถูกจับตา";
}
function applyWeatherMonth(game: GameState, changes: string[]): GameState {
  const weather = chooseNextWeather(game);
  let g: GameState = { ...game, weather };
  if (weather.kind !== "ปกติ") {
    const severity = Math.ceil(weather.severity / 20);
    if (weather.kind === "แล้งจัด") g = { ...g, metrics: changeMetrics(g.metrics, { health: -severity, morale: -1 }), threat: clamp(g.threat + severity) };
    if (weather.kind === "หนาวยาว") g = { ...g, metrics: changeMetrics(g.metrics, { health: -severity, morale: -severity }), resources: changeResources(g.resources, { fuel: -Math.min(g.resources.fuel, severity) }) };
    if (weather.kind === "พายุเข้าเร็ว") g = { ...g, metrics: changeMetrics(g.metrics, { security: -severity, health: -1 }), resources: changeResources(g.resources, { wood: -Math.min(g.resources.wood, severity) }) };
    if (weather.kind === "ฝนหลงฤดู") g = { ...g, resources: changeResources(g.resources, { water: severity * 2 }), metrics: changeMetrics(g.metrics, { health: -1 }) };
    if (weather.kind === "หมอกชื้น") g = { ...g, metrics: changeMetrics(g.metrics, { health: -severity }) };
    changes.push(`สภาพอากาศพลวัต: ${weather.kind} (${weather.forecast})`);
  }
  return g;
}
function waterStorageCapacity(game: GameState) { return game.buildings.cistern * (buildingData.cistern.capacity ?? 60); }
function applyWaterReserve(game: GameState, changes: string[]): GameState {
  let g = game;
  const cap = waterStorageCapacity(g);
  if (cap <= 0) return g;
  const reserve = g.resources.waterReserve ?? 0;
  if (g.policies.reserveWater && g.resources.water > waterNeedFor(g) * 2.2 && reserve < cap) {
    const moved = Math.min(Math.floor(g.resources.water - waterNeedFor(g) * 1.5), cap - reserve, 12 + g.buildings.cistern * 8);
    if (moved > 0) {
      g = { ...g, resources: changeResources(g.resources, { water: -moved, waterReserve: moved }) };
      changes.push(`เก็บน้ำส่วนเกินเข้าถัง +${moved}`);
    }
  }
  return g;
}
function drawWaterReserve(game: GameState, missing: number, changes: string[]) {
  const draw = Math.min(missing, game.resources.waterReserve ?? 0);
  if (draw <= 0) return game;
  changes.push(`ดึงน้ำสำรองจากถังเก็บน้ำ ${draw} หน่วย`);
  return { ...game, resources: changeResources(game.resources, { water: draw, waterReserve: -draw }) };
}
function buildingEfficiency(game: GameState, key: BuildingKey) {
  const hp = normalizeBuildingCondition(game)[key] ?? ((game.buildings[key] ?? 0) > 0 ? 100 : 0);
  return clamp(hp, 25, 100) / 100;
}
function resolveBuildingMaintenance(game: GameState, changes: string[]): GameState {
  let g = normalizeAdvancedSystems(game);
  const cond = { ...g.buildingCondition };
  const builtKeys = (Object.keys(g.buildings) as BuildingKey[]).filter((k) => (g.buildings[k] ?? 0) > 0);
  if (builtKeys.length === 0) return g;
  const seasonWear = normalizeWeatherState(g.weather).kind === "พายุเข้าเร็ว" ? 9 : seasonOf(g.month) === "ฤดูหนาว" || seasonOf(g.month) === "ฤดูฝน" ? 5 : 3;
  builtKeys.forEach((key) => { cond[key] = clamp((cond[key] ?? 100) - seasonWear + (g.researchDone.maintenanceRoutine ? 1 : 0)); });
  const damaged = builtKeys.filter((key) => (cond[key] ?? 100) < 72);
  if ((g.policies.autoMaintenance || g.labor.build > 0) && damaged.length > 0) {
    const canRepair = damaged.slice(0, Math.max(1, g.buildings.repairShed + Math.floor(g.labor.build / 2)));
    let woodCost = 0, stoneCost = 0, repaired = 0;
    canRepair.forEach((key) => {
      const isStone = ["well", "cistern", "palisade", "healerHut", "crisisBeacon"].includes(key);
      const wc = g.researchDone.maintenanceRoutine ? 1 : 2;
      const sc = isStone ? 1 : 0;
      if (g.resources.wood >= woodCost + wc && g.resources.stone >= stoneCost + sc) { woodCost += wc; stoneCost += sc; cond[key] = clamp((cond[key] ?? 60) + 18 + g.buildings.repairShed * 4); repaired++; }
    });
    if (repaired > 0) {
      g = { ...g, resources: changeResources(g.resources, { wood: -woodCost, stone: -stoneCost }), metrics: changeMetrics(g.metrics, { security: 1 }) };
      changes.push(`ซ่อมบำรุงอาคาร ${repaired} จุด ใช้ไม้ ${woodCost}${stoneCost ? ` หิน ${stoneCost}` : ""}`);
    }
  }
  const critical = builtKeys.filter((key) => (cond[key] ?? 100) < 45);
  if (critical.length) {
    g = { ...g, metrics: changeMetrics(g.metrics, { morale: -2, security: -2, health: -1 }) };
    changes.push(`อาคารชำรุดหนัก ${critical.length} จุด ประสิทธิภาพลดลงและคนเริ่มไม่มั่นใจ`);
  }
  return { ...g, buildingCondition: cond };
}
function applySkillMastery(game: GameState, changes: string[]): GameState {
  const assignments = normalizeLaborAssignments(game);
  const jobByPerson = new Map<string, LaborKey>();
  (Object.keys(assignments) as LaborKey[]).forEach((job) => (assignments[job] ?? []).forEach((id) => jobByPerson.set(id, job)));
  let gained: string[] = [];
  const people = game.people.map((p) => {
    if (!p.alive) return p;
    const job = jobByPerson.get(p.id);
    if (!job) return { ...p, fatigue: clamp(p.fatigue - 2) };
    const xp = { ...(p.xp ?? {}) };
    xp[job] = (xp[job] ?? 0) + (game.researchDone.apprenticeship ? 2 : 1);
    const traits = [...p.traits];
    if ((xp[job] ?? 0) >= 8 && !traits.includes(`ชำนาญ${jobLabel(job)}`)) { traits.push(`ชำนาญ${jobLabel(job)}`); gained.push(`${p.name} ชำนาญ${jobLabel(job)}`); }
    return { ...p, xp, traits: traits.slice(0, 5) };
  });
  if (gained.length) changes.push(`ความชำนาญเพิ่ม: ${gained.slice(0, 3).join(" · ")}${gained.length > 3 ? " ..." : ""}`);
  return { ...game, people };
}
function jobLabel(job: LaborKey) { return laborMeta.find((j) => j.id === job)?.title.split("/")[0].trim() ?? job; }
function masteryBonus(person: Person, job: LaborKey) { return person.traits.includes(`ชำนาญ${jobLabel(job)}`) ? 0.35 : 0; }
function applyGriefToKin(game: GameState, lost: Person, changes?: string[]) {
  const people = game.people.map((p) => {
    if (!p.alive || p.id === lost.id || p.kin !== lost.kin) return p;
    const grief = clamp((p.grief ?? 0) + (p.kin === lost.kin ? 28 : 12));
    const traits = [...p.traits];
    if (grief > 55 && !traits.includes("ไว้ทุกข์")) traits.push("ไว้ทุกข์");
    return { ...p, grief, morale: clamp(p.morale - (game.researchDone.familyRecords ? 8 : 14)), fatigue: clamp(p.fatigue + 10), traits: traits.slice(0, 5) };
  });
  changes?.push(`ครอบครัวของ ${lost.name} เข้าสู่ภาวะไว้ทุกข์ กำลังใจลดลง`);
  return { ...game, people, metrics: changeMetrics(game.metrics, { morale: game.researchDone.familyRecords ? -3 : -6, cohesion: game.researchDone.familyRecords ? -1 : -3 }) };
}
function processGriefRecovery(game: GameState, changes: string[]) {
  let recovered = 0;
  const care = game.labor.care + game.labor.teach + game.buildings.meetingHall + (game.researchDone.familyRecords ? 2 : 0) + (game.leaderFocus === "funeralCare" || game.leaderFocus === "family" ? 2 : 0);
  const people = game.people.map((p) => {
    if (!p.alive || !(p.grief && p.grief > 0)) return p;
    const grief = clamp(p.grief - (4 + care), 0, 100);
    if (p.grief >= 30 && grief < 30) recovered++;
    return { ...p, grief, morale: clamp(p.morale + (grief < p.grief ? 2 : 0)) };
  });
  if (recovered) changes.push(`มีคนผ่านช่วงไว้ทุกข์ได้ ${recovered} คน`);
  return { ...game, people };
}
function applyCampPolicies(game: GameState, changes: string[]): GameState {
  let g = normalizeAdvancedSystems(game);
  const p = normalizePolicies(g.policies);
  if (p.autoFoodShift && g.resources.food < foodNeedFor(g) * 1.5) {
    const free = eligibleWorkers(g).filter((person) => !assignedJobOf(g, person.id)).slice(0, 2);
    if (free.length) {
      const assignments = normalizeLaborAssignments(g);
      assignments.forage = Array.from(new Set([...(assignments.forage ?? []), ...free.map((x) => x.id)]));
      g = { ...g, laborAssignments: assignments, labor: deriveLaborFromAssignments(g, assignments), savedText: "นโยบายเสบียงโยกคนว่างไปหาอาหาร" };
      changes.push(`นโยบายเสบียง: โยกคนว่าง ${free.length} คนไปหาอาหาร`);
    }
  }
  if (p.protectChildren) {
    const assignments = normalizeLaborAssignments(g);
    let removed = 0;
    (Object.keys(assignments) as LaborKey[]).forEach((job) => {
      assignments[job] = (assignments[job] ?? []).filter((id) => { const person = g.people.find((x) => x.id === id); const unsafe = !!person && person.age < 15 && !["teach", "care", "herbs", "preserve"].includes(job); if (unsafe) removed++; return !unsafe; });
    });
    if (removed) { g = { ...g, laborAssignments: assignments, labor: deriveLaborFromAssignments(g, assignments) }; changes.push(`นโยบายคุ้มครองเด็ก: กันเด็กออกจากงานเสี่ยง ${removed} คน`); }
  }
  return g;
}
function maybeCreateEndgameCrisis(game: GameState, changes: string[]): GameState {
  let c = normalizeCrisis(game.crisis);
  if (c.kind !== "none" || game.stage !== "เมืองเล็ก" || game.year < 8) return { ...game, crisis: c };
  if (Math.random() * 100 < 18) {
    const kind = pickFrom(["long_winter", "bandit_host", "great_plague"] as EndgameCrisis["kind"][]);
    c = { kind, yearsUntil: 2 + Math.floor(Math.random() * 3), warningLevel: 1, active: true, resolved: false };
    changes.push(`ข่าวลือภัยใหญ่เริ่มก่อตัว: ${crisisTitle(c)}`);
    return addNotice({ ...game, crisis: c }, { kind: "warning", title: crisisTitle(c), text: crisisWarning(c) });
  }
  return { ...game, crisis: c };
}
function crisisTitle(c: EndgameCrisis) { return c.kind === "long_winter" ? "พายุหิมะร้อยปี" : c.kind === "bandit_host" ? "กองโจรใหญ่รวมกำลัง" : c.kind === "great_plague" ? "เงาโรคใหญ่จากเส้นทางค้า" : "ไม่มีภัยใหญ่"; }
function crisisWarning(c: EndgameCrisis) { return `${crisisTitle(c)} อาจมาถึงในอีก ${c.yearsUntil} ปี ค่ายต้องสะสมเสบียง ซ่อมอาคาร และรักษาความสัมพันธ์ให้มั่นคง`; }
function advanceEndgameCrisis(game: GameState, changes: string[]): GameState {
  let c = normalizeCrisis(game.crisis);
  if (!c.active || c.resolved || c.kind === "none") return { ...game, crisis: c };
  c = { ...c, yearsUntil: c.yearsUntil - 1, warningLevel: c.warningLevel + 1 };
  let g: GameState = { ...game, crisis: c };
  if (c.yearsUntil > 0) {
    g = addNotice(g, { kind: "warning", title: `${crisisTitle(c)} ใกล้เข้ามา`, text: crisisWarning(c) });
    changes.push(`${crisisTitle(c)} เหลืออีก ${c.yearsUntil} ปี`);
    return g;
  }
  const prep = g.buildings.crisisBeacon * 14 + (g.researchDone.crisisDrills ? 18 : 0) + (g.researchDone.stormPrep ? 12 : 0) + g.resources.food / 6 + g.resources.fuel / 4 + (g.resources.waterReserve ?? 0) / 5 + g.metrics.security / 4 + g.metrics.trust / 5;
  if (prep >= 70) {
    c = { ...c, active: false, resolved: true, yearsUntil: 0 };
    g = { ...g, crisis: c, metrics: changeMetrics(g.metrics, { morale: 12, trust: 8, cohesion: 8 }), resources: changeResources(g.resources, { food: -Math.min(g.resources.food, 18), fuel: -Math.min(g.resources.fuel, 12), waterReserve: -Math.min(g.resources.waterReserve ?? 0, 8) }) };
    changes.push(`รอดผ่าน${crisisTitle(c)}ด้วยการเตรียมตัวล่วงหน้า`);
    g = addLog(g, `รอดผ่าน${crisisTitle(c)}`, "ถิ่นฐานไม่ได้รอดเพราะโชคเพียงอย่างเดียว แต่รอดเพราะปีแห่งการเตรียมเสบียง การซ่อมอาคาร และความไว้ใจกัน", "milestone", ["วิกฤตใหญ่"]);
  } else {
    g = { ...g, crisis: c, threat: clamp(g.threat + 25), metrics: changeMetrics(g.metrics, { morale: -18, health: -14, security: -12, trust: -8 }) };
    changes.push(`${crisisTitle(c)} กระแทกถิ่นฐานอย่างรุนแรง การเตรียมตัวยังไม่พอ`);
    if (c.kind === "long_winter") g = { ...g, resources: changeResources(g.resources, { food: -Math.min(g.resources.food, 35), fuel: -Math.min(g.resources.fuel, 30), water: -Math.min(g.resources.water, 12) }) };
    if (c.kind === "bandit_host") g = { ...g, resources: changeResources(g.resources, { food: -Math.min(g.resources.food, 22), gold: -Math.min(g.resources.gold, 8), tools: -Math.min(g.resources.tools, 3) }) };
    if (c.kind === "great_plague") { g = woundSomeone(g, "โรคใหญ่จากเส้นทางค้า"); g = woundSomeone(g, "โรคใหญ่จากเส้นทางค้า"); }
    if (prep < 45 && Math.random() < 0.65) g = killSomeone(g, crisisTitle(c));
  }
  return g;
}

function randomTerrain(): TerrainKey {
  return pickFrom(Object.keys(terrainData) as TerrainKey[]);
}
function applyTerrainResources(resources: Resources, terrain: TerrainKey): Resources {
  return changeResources(resources, terrainData[terrain].effects);
}
const laborSkill: Partial<Record<LaborKey, SkillKey[]>> = {
  forage: ["hunter"], wood: ["builder"], stone: ["builder"], build: ["builder"], guard: ["guard"], patrol: ["guard", "hunter"],
  care: ["healer"], herbs: ["healer"], research: ["keeper"], teach: ["keeper"], intel: ["keeper", "guard"], farm: ["farmer"],
  water: ["farmer", "healer"], preserve: ["farmer", "keeper"], craft: ["builder"], feed: ["farmer"], trade: ["keeper"]
};
function personJobBonus(person: Person, job: LaborKey) {
  let bonus = 1;
  if ((laborSkill[job] ?? []).includes(person.skill)) bonus += 0.35;
  if (person.traits.includes("ขยันเป็นพิเศษ")) bonus += 0.12;
  if (person.traits.includes("เรียนรู้ไว") && (job === "research" || job === "teach" || job === "intel")) bonus += 0.18;
  if (person.traits.includes("มือหนัก") && (job === "wood" || job === "stone" || job === "build")) bonus += 0.18;
  if (person.traits.includes("ช่างสังเกต") && (job === "guard" || job === "patrol" || job === "intel" || job === "forage")) bonus += 0.16;
  if (person.traits.includes("มือเบา") && (job === "care" || job === "herbs")) bonus += 0.1;
  if (person.traits.includes("รักสัตว์") && job === "feed") bonus += 0.25;
  if (person.traits.includes("ใจร้อน") && (job === "guard" || job === "patrol" || job === "forage")) bonus += 0.05;
  if (person.traits.includes("ใจร้อน") && (job === "care" || job === "research")) bonus -= 0.08;
  if (person.health < 45) bonus -= 0.25;
  if (person.fatigue > 70) bonus -= 0.25;
  return Math.max(0.2, bonus);
}
function assignedJobOf(game: GameState, personId: string): LaborKey | null {
  const assignments = game.laborAssignments ?? {};
  for (const key of Object.keys(emptyLabor()) as LaborKey[]) {
    if ((assignments[key] ?? []).includes(personId)) return key;
  }
  return null;
}
function jobHasAdultWorker(game: GameState, job: LaborKey, assignments: LaborAssignments) {
  const ids = assignments[job] ?? [];
  return ids.some((id) => {
    const p = game.people.find((x) => x.id === id);
    return !!p && p.alive && p.age >= 15 && p.age < 60 && !p.injured && p.health > 28;
  });
}
function normalizeLaborAssignments(game: GameState, assignments?: LaborAssignments): LaborAssignments {
  const allowed = new Set(unlockedLaborOptions(game).map((item) => item.id));
  const used = new Set<string>();
  const normalized: LaborAssignments = {};
  for (const key of Object.keys(emptyLabor()) as LaborKey[]) {
    const adultPresent = jobHasAdultWorker(game, key, assignments ?? {});
    normalized[key] = [];
    for (const id of assignments?.[key] ?? []) {
      if (!allowed.has(key) || used.has(id)) continue;
      const person = game.people.find((p) => p.id === id);
      if (!person || baseWorkFactor(person) <= 0) continue;
      if (person.age >= 12 && person.age < 15 && !adultPresent) continue;
      normalized[key]!.push(id);
      used.add(id);
    }
  }
  return normalized;
}
function deriveLaborFromAssignments(game: GameState, assignments: LaborAssignments = game.laborAssignments ?? {}): Labor {
  const labor = emptyLabor();
  const normalized = normalizeLaborAssignments(game, assignments);
  for (const key of Object.keys(emptyLabor()) as LaborKey[]) {
    labor[key] = Math.round((normalized[key] ?? []).reduce((sum, id) => {
      const p = game.people.find((x) => x.id === id);
      return sum + (p ? baseWorkFactor(p) * personJobBonus(p, key) : 0);
    }, 0) * 10) / 10;
  }
  return labor;
}
function foodNeedForPerson(person: Person) {
  let need = person.age < 12 ? 0.75 : person.age < 16 ? 1.15 : person.age < 60 ? 1.65 : 1.05;
  if (person.injured || person.health < 45) need += 0.15;
  if (person.traits.includes("กินจุ")) need += 0.75;
  if (person.traits.includes("กินน้อย")) need -= 0.25;
  return Math.max(0.45, need);
}
function waterNeedFor(game: GameState) {
  const terrain = terrainData[game.terrain ?? "riverbank"];
  const base = alivePeople(game).reduce((sum, p) => sum + (p.age < 12 ? 0.7 : p.age < 16 ? 1 : p.age < 60 ? 1.25 : 0.9), 0);
  return Math.ceil(base + Math.max(0, terrain.disease / 12));
}
function assignmentSummary(game: GameState) {
  return (Object.keys(emptyLabor()) as LaborKey[]).map((key) => ({ key, people: (game.laborAssignments?.[key] ?? []).map((id) => game.people.find((p) => p.id === id)).filter(Boolean) as Person[] })).filter((row) => row.people.length > 0);
}
function assignmentPeople(game: GameState, job: LaborKey): Person[] {
  const ids = normalizeLaborAssignments(game, game.laborAssignments ?? {})[job] ?? [];
  return ids.map((id) => game.people.find((p) => p.id === id)).filter(Boolean) as Person[];
}
function assignmentPeopleForJobs(game: GameState, jobs: LaborKey[]): Person[] {
  const seen = new Set<string>();
  const people: Person[] = [];
  jobs.forEach((job) => {
    assignmentPeople(game, job).forEach((p) => {
      if (!seen.has(p.id)) { seen.add(p.id); people.push(p); }
    });
  });
  return people;
}
function projectCrewStatus(game: GameState, jobs: LaborKey[]) {
  const people = assignmentPeopleForJobs(game, jobs);
  const laborNow = normalizeLabor(game);
  const effective = jobs.reduce((sum, job) => sum + (laborNow[job] ?? 0), 0);
  const labels = jobs.map((job) => laborMeta.find((item) => item.id === job)?.title ?? job).join(" / ");
  return { people, count: people.length, effective: Math.round(effective * 10) / 10, labels };
}
function skillIcon(skill?: SkillKey | string | null) {
  const map: Record<string, string> = {
    hunter: "🏹", builder: "🛠️", healer: "🌿", keeper: "📜", guard: "🛡️", farmer: "🌾", child: "🧒", elder: "🧓"
  };
  return map[String(skill ?? "")] ?? "👤";
}
function crewNameList(people: Person[]) {
  if (!people.length) return "ยังไม่มีคนถูกจัดเข้าหมวดนี้";
  return people.map((p) => `${p.name} ${skillIcon(p.skill)}${p.injured ? " บาดเจ็บ" : p.age < 15 ? " เด็กช่วยงาน" : p.age >= 60 ? " ผู้เฒ่า" : ""}`).join(" · ");
}
function animalWaterNeed(game: GameState) {
  const a = normalizeAnimalState(game.animalState).animals;
  const raw = a.goats * 1.2 + a.chickens * 0.12 + a.dogs * 0.75 + a.cows * 2.6 + a.pigs * 0.9;
  const troughSaving = game.buildings.waterTrough > 0 ? 0.82 : 1;
  return Math.ceil(raw * troughSaving);
}
function animalSystemNote(game: GameState) {
  if (animalCount(game) <= 0) return "ยังไม่มีสัตว์เลี้ยง ระบบสัตว์จะเริ่มมีผลเมื่อพบสัตว์หรือรับสัตว์จากเหตุการณ์";
  const feedText = game.researchDone.fodderPrep
    ? "ใช้อาหารสัตว์คุณภาพเป็นหลัก"
    : game.buildings.animalPen > 0 || game.resources.feed > 0
      ? "มีอาหารหยาบจากคอก/งานตัดหญ้า แต่ยังควรวิจัยอาหารสัตว์เพื่อเลี้ยงระยะยาว"
      : "ยังไม่มีอาหารสัตว์ สัตว์จะแบ่งอาหารคน/เศษพืช";
  const waterText = animalWaterNeed(game) > 0 ? `และใช้น้ำประมาณ ${animalWaterNeed(game)} หน่วย/เดือน` : "";
  return `${feedText} ${waterText} หากขาดอาหารหรือน้ำ สุขภาพสัตว์จะลด หนีง่ายขึ้น และอาจล้มตาย`;
}

function locationMonthlyBonus(game: GameState): Partial<Resources> {
  const locations = normalizeLocations(game.locations);
  const bonus: Partial<Resources> = {};
  const add = (delta: Partial<Resources>) => {
    for (const [key, value] of Object.entries(delta)) bonus[key as keyof Resources] = Math.round(((bonus[key as keyof Resources] ?? 0) + (value ?? 0)) * 10) / 10;
  };
  const has = (key: LocationKey) => locations[key]?.discovered && locations[key]?.progress >= 100;
  if (has("shallowStream")) add({ water: 3, herbs: 1 });
  if (has("deepWoods")) add({ food: 2, wood: 2, herbs: 1 });
  if (has("oldTradeRoad")) add({ gold: 1, knowledge: 1 });
  if (has("rockyRidge")) add({ stone: 2, ore: 1 });
  if (has("abandonedCamp")) add({ tools: 1, knowledge: 1 });
  if (has("marshPools")) add({ water: 2, herbs: 1, feed: 1 });
  if (has("huntingGround")) add({ food: 3, hides: 1 });
  if (has("oldCave")) add({ stone: 1, ore: 1, knowledge: 1 });
  return bonus;
}
function locationMonthlyBonusText(game: GameState) {
  const bonus = locationMonthlyBonus(game);
  const entries = Object.entries(bonus).filter(([, v]) => (v ?? 0) > 0);
  if (!entries.length) return "ยังไม่มีเส้นทางที่สำรวจจนใช้ประโยชน์ประจำเดือนได้";
  const labels: Record<ResourceKey, { icon: string; name: string }> = { food: { icon: "🍲", name: "อาหาร" }, water: { icon: "💧", name: "น้ำ" }, waterReserve: { icon: "🏺", name: "น้ำสำรอง" }, fuel: { icon: "🔥", name: "ฟืน" }, wood: { icon: "🪵", name: "ไม้" }, stone: { icon: "🪨", name: "หิน" }, tools: { icon: "🛠️", name: "เครื่องมือ" }, herbs: { icon: "🌿", name: "สมุนไพร" }, hides: { icon: "🦬", name: "หนังสัตว์" }, gold: { icon: "🪙", name: "ทอง" }, knowledge: { icon: "📜", name: "ความรู้" }, feed: { icon: "🌾", name: "อาหารสัตว์" }, ore: { icon: "⛏️", name: "แร่ดิบ" }, ironOre: { icon: "⛏️", name: "แร่เหล็ก" }, coal: { icon: "⚫", name: "ถ่านหิน" }, timber: { icon: "🪚", name: "ไม้แปรรูป" }, bricks: { icon: "🧱", name: "อิฐเผา" }, textiles: { icon: "🧶", name: "ผ้าทอ" }, salt: { icon: "🧂", name: "เกลือ" }, spices: { icon: "🌶️", name: "เครื่องเทศ" }, influence: { icon: "📜", name: "อิทธิพล" }, steel: { icon: "⚔️", name: "เหล็กกล้า" }, luxuries: { icon: "💎", name: "สินค้าฟุ่มเฟือย" }, warhorses: { icon: "🐎", name: "ม้ารบ" }, manpower: { icon: "🪖", name: "กำลังพล" }, siegeMaterials: { icon: "🔥", name: "วัสดุสงคราม" } };
  return entries.map(([k, v]) => `${labels[k as ResourceKey]?.icon ?? "•"} ${labels[k as ResourceKey]?.name ?? k} +${fmt(v as number)}`).join(" · ");
}

function recommendedAssignments(game: GameState): LaborAssignments {
  const jobs = unlockedLaborOptions(game).map((j) => j.id);
  const desired = recommendedLabor(game);
  const assignments: LaborAssignments = {};
  const candidates = eligibleWorkers(game).sort((a, b) => baseWorkFactor(b) - baseWorkFactor(a));
  for (const job of jobs) assignments[job] = [];
  for (const job of jobs) {
    let need = Math.max(0, Math.ceil(desired[job] ?? 0));
    const ranked = candidates.filter((p) => !assignedJobOf({ ...game, laborAssignments: assignments } as GameState, p.id)).sort((a, b) => personJobBonus(b, job) - personJobBonus(a, job));
    for (const p of ranked) {
      if (need <= 0) break;
      if (p.age >= 12 && p.age < 15 && !(assignments[job] ?? []).some((id) => {
        const adult = game.people.find((x) => x.id === id);
        return !!adult && adult.age >= 15;
      })) continue;
      assignments[job] = [...(assignments[job] ?? []), p.id];
      need -= baseWorkFactor(p);
    }
  }
  return normalizeLaborAssignments(game, assignments);
}
function addNotice(game: GameState, notice: Omit<Notice, "id" | "year" | "month" | "read"> & { read?: boolean }): GameState {
  const item: Notice = { id: uid("notice"), year: game.year, month: game.month, read: notice.read ?? false, ...notice };
  return { ...game, notifications: [item, ...(game.notifications ?? [])].slice(0, 30) };
}
function ensureGameState(game: GameState): GameState {
  const resources = { ...baseResources(game.origin ?? "builder"), ...game.resources } as Resources;
  const buildings = { ...emptyBuildings(), ...game.buildings } as Buildings;
  const researchDone = { ...emptyResearch(), ...game.researchDone } as ResearchDone;
  const terrain = game.terrain ?? randomTerrain();
  const locations = normalizeLocations(game.locations);
  const exploreTarget = (game.exploreTarget ?? "shallowStream") as LocationKey;
  const temp = { ...game, resources, buildings, researchDone, terrain, locations, exploreTarget } as GameState;
  const laborAssignments = normalizeLaborAssignments(temp, game.laborAssignments ?? {});
  const labor = deriveLaborFromAssignments(temp, laborAssignments);
  return {
    ...game,
    version: GAME_VERSION,
    resources,
    resourceHistory: normalizeResourceHistory((game as any).resourceHistory, temp),
    buildings,
    researchDone,
    labor,
    laborAssignments,
    terrain,
    locations,
    exploreTarget,
    notifications: game.notifications ?? [],
    pausedConstruction: game.pausedConstruction ?? [],
    pausedResearch: game.pausedResearch ?? [],
    animalState: normalizeAnimalState(game.animalState),
    animalAction: game.animalAction ?? "keep",
    weather: normalizeWeatherState((game as any).weather),
    policies: normalizePolicies((game as any).policies),
    crisis: normalizeCrisis((game as any).crisis),
    buildingCondition: normalizeBuildingCondition({ ...game, buildings }),
    people: (game.people ?? []).map((person) => ({ ...person, xp: person.xp ?? {}, grief: person.grief ?? 0, closeKin: person.closeKin ?? [] })),
    summaryModal: null,
    savedText: game.savedText ?? "เปิดบันทึกเดิมแล้ว",
  };
}

function laborTotal(labor: Labor) { return Object.values(labor).reduce((a, b) => a + (b ?? 0), 0); }
function unlockedLaborOptions(game: GameState) { return laborMeta.filter((item) => !item.unlock || item.unlock(game)); }
function lockedLaborOptions(game: GameState) { return laborMeta.filter((item) => item.unlock && !item.unlock(game)); }
function normalizeLabor(game: GameState): Labor {
  // v0.9.22: รายชื่อคนที่ถูกจัดงานคือแหล่งข้อมูลหลักเพียงชุดเดียว
  // ค่า labor แบบตัวเลขเก่าจะถูกมองเป็นข้อมูล legacy และไม่ใช้คำนวณผลผลิตอีกต่อไป
  return deriveLaborFromAssignments(game, normalizeLaborAssignments(game, game.laborAssignments ?? {}));
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
  if (id === "signalNetwork" && game.stage !== "เมืองเล็ก") return false;
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
  const next: Record<Stage, Stage> = { "ค่ายพักแรม": "ชุมชนแรกเริ่ม", "ชุมชนแรกเริ่ม": "หมู่บ้านถาวร", "หมู่บ้านถาวร": "เมืองเล็ก", "เมืองเล็ก": "เมืองการค้า", "เมืองการค้า": "นครรัฐ", "นครรัฐ": "อาณาจักร", "อาณาจักร": "อาณาจักร" };
  const nextStage = next[game.stage];
  if (nextStage === game.stage) return game;
  let g = { ...game, stage: nextStage, metrics: changeMetrics(game.metrics, { morale: 10, trust: 7, cohesion: 5 }), milestones: [...game.milestones, `stage-${nextStage}`] };
  const plan = currentStagePlan(g);
  const unlockText = plan.unlocked.join(" · ");
  g = { ...g, pendingEvents: ["merchant_arrival", nextStage === "เมืองเล็ก" ? "bandit_scouts" : "wandering_family", ...g.pendingEvents].filter(Boolean) };
  g = addLog(g, `ก้าวสู่${nextStage}`, `ผู้คนไม่เรียกที่นี่ว่าแค่ค่ายอีกต่อไป เงื่อนไขพื้นฐานถูกเติมเต็ม และชื่อของ House ${g.houseName} เริ่มผูกกับผืนดินนี้อย่างช้า ๆ

สิ่งที่เปิดตามมา: ${unlockText}`, "milestone", ["Stage", "ปลดล็อก"]);
  g = addMemory(g, { title: `วันที่กลายเป็น${nextStage}`, text: `จากสิบชีวิตที่ไม่แน่ใจว่าจะรอด กลุ่มคนของ ${g.leaderName} ได้ข้ามเส้นสำคัญของการตั้งถิ่นฐาน`, effect: `+ขวัญกำลังใจและปลดล็อกระบบใหม่: ${unlockText}`, kind: "pride" });
  return g;
}
function riskPreview(game: GameState): Risks {
  const pop = alivePeople(game).length || 1;
  const available = adultWorkers(game) || 1;
  const labor = normalizeLabor(game);
  const shelterShort = Math.max(0, pop - shelterCapacity(game));
  const foodNeed = foodNeedFor(game);
  const season = seasonOf(game.month);
  const terrain = terrainData[game.terrain ?? "riverbank"];
  const weather = normalizeWeatherState(game.weather);
  const weatherPressure = weather.kind === "ปกติ" ? 0 : Math.ceil(weather.severity / 6);
  const structurePenalty = (Object.values(normalizeBuildingCondition(game)).filter((v) => (v ?? 100) < 55).length) * 4;
  const maintenanceBonus = game.buildings.repairShed * 4 + (game.researchDone.maintenanceRoutine ? 4 : 0);
  return {
    food: clamp(20 + (foodNeed > game.resources.food ? 35 : 0) + (game.resources.food < foodNeed * 1.6 ? 18 : 0) + (weather.kind === "แล้งจัด" || weather.kind === "หนาวยาว" ? weatherPressure : 0) - game.buildings.storage * 8 * buildingEfficiency(game, "storage") - game.buildings.dryingRack * 5 * buildingEfficiency(game, "dryingRack") - labor.forage * 3 - labor.farm * 4 - labor.preserve * 3),
    shelter: clamp(16 + shelterShort * 8 + (season === "ฤดูหนาว" ? 18 : 0) + (season === "ฤดูฝน" ? 12 : 0) + structurePenalty + (weather.kind === "พายุเข้าเร็ว" || weather.kind === "หนาวยาว" ? weatherPressure : 0) - game.buildings.campfire * 5 * buildingEfficiency(game, "campfire") - game.buildings.smokeVent * 5 * buildingEfficiency(game, "smokeVent") - (game.researchDone.shelterHygiene ? 4 : 0) - maintenanceBonus),
    disease: clamp(18 + terrain.disease + woundedCount(game) * 8 + shelterShort * 4 + (game.buildings.well ? -12 : 10) + (season === "ฤดูฝน" ? 16 : 0) + (weather.kind === "หมอกชื้น" || weather.kind === "ฝนหลงฤดู" ? weatherPressure : 0) - labor.care * 8 - game.buildings.smokeVent * 7 * buildingEfficiency(game, "smokeVent") - game.buildings.dryingRack * 4 - game.buildings.healerHut * 4 - (game.researchDone.sanitation ? 14 : 0) - (game.researchDone.herbalWorkshop ? 8 : 0) - (game.researchDone.animalQuarantine ? 5 : 0)),
    beast: clamp(18 + terrain.beast + (labor.forage >= 4 ? 16 : 0) + (game.metrics.security < 40 ? 18 : 0) - labor.guard * 9 - labor.patrol * 5 - game.buildings.watchPost * 9 - game.buildings.palisade * 14 - game.buildings.livestockShed * 4),
    conflict: clamp(15 + (game.metrics.trust < 45 ? 16 : 0) + (game.metrics.fairness < 45 ? 14 : 0) + (game.resources.food < foodNeed ? 18 : 0) - (game.leaderFocus === "mediate" ? 12 : 0) - game.buildings.meetingHall * 4),
    weather: clamp(12 + terrain.weather + weatherPressure + (season === "ฤดูหนาว" ? 25 : 0) + (season === "ฤดูฝน" ? 18 : 0) + shelterShort * 4 - game.buildings.shelter * 4 * buildingEfficiency(game, "shelter") - game.buildings.campfire * 3 * buildingEfficiency(game, "campfire") - game.buildings.smokeVent * 3 - game.buildings.cistern * 2 - (game.researchDone.weatherReading ? 6 : 0) - (game.researchDone.stormPrep ? 8 : 0)),
    accident: clamp(10 + labor.build * 6 + labor.stone * 4 + labor.forage * 3 + labor.craft * 3 + Math.max(0, laborTotal(labor) - available) * 8 - game.buildings.workshop * 8 - (game.researchDone.stoneTools ? 5 : 0) - (game.researchDone.projectPlanning ? 8 : 0) - (game.researchDone.masonry ? 5 : 0)),
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

type StagePlan = {
  stage: Stage;
  title: string;
  goal: string;
  reward: string;
  unlocked: string[];
};

const stagePlans: StagePlan[] = [
  { stage: "ค่ายพักแรม", title: "เอาชีวิตรอดปีแรก", goal: "ตั้งที่พัก กองไฟ เสบียง และความปลอดภัยพื้นฐาน", reward: "ปลดล็อกเส้นทางชุมชนแรกเริ่ม พ่อค้าเร่ และครอบครัวเร่ร่อน", unlocked: ["พ่อค้าเร่", "ข้อพิพาทเสบียง", "การเพาะปลูก", "คลังอาหาร"] },
  { stage: "ชุมชนแรกเริ่ม", title: "เปลี่ยนค่ายให้เป็นบ้าน", goal: "สร้างน้ำสะอาด คลังอาหาร แปลงเพาะปลูก และกฎร่วม", reward: "ปลดล็อกเหตุการณ์สังคม การค้า และภัยมนุษย์ที่ชัดขึ้น", unlocked: ["ราคาตลาด", "ครอบครัวใหม่", "การลาดตระเวน", "ช่างฝีมือ"] },
  { stage: "หมู่บ้านถาวร", title: "สร้างโครงสร้างถาวร", goal: "เพิงช่าง หอเฝ้ายาม ศาลาประชุม และสุขภาพชุมชน", reward: "ปลดล็อกเมืองเล็ก เครือข่ายข่าวสาร และระบบภัยภายนอกเต็มรูปแบบ", unlocked: ["สายข่าว", "คาราวานใหญ่", "โจรสอดแนม", "กฎหมายชุมชน"] },
  { stage: "เมืองเล็ก", title: "รักษาเมืองที่เริ่มมีชื่อ", goal: "เตรียมเปลี่ยนจากการสั่งคนทีละคนสู่เศรษฐกิจและสมาคม", reward: "เปิดเมืองการค้าเมื่อประชากร ทอง ตลาด และสมาคมพร้อม", unlocked: ["ลานตลาดถาวร", "คาราวาน", "ใบอนุญาตสมาคม", "ฐานที่มั่นรอง"] },
  { stage: "เมืองการค้า", title: "เครือข่ายภูมิภาค", goal: "ตั้งสมาคม คาราวาน และฐานที่มั่นรองเพื่อให้ทรัพยากรไหลกลับเมือง", reward: "เปิดนครรัฐและการเมืองภายใน", unlocked: ["สมาคม", "คาราวาน", "Outpost", "สินค้าแปรรูป"] },
  { stage: "นครรัฐ", title: "อำนาจและสภาเมือง", goal: "รักษาฝ่ายอำนาจ สะสมอิทธิพล และเปิดเหล็กกล้า", reward: "เปิดอาณาจักรและระบบสืบทอด", unlocked: ["ฝ่ายอำนาจ", "เหล็กกล้า", "อิทธิพล", "ทายาท"] },
  { stage: "อาณาจักร", title: "พงศาวดารของอำนาจ", goal: "รักษาเมืองขึ้น กองกำลัง และความทรงจำของผู้คน ไม่ให้ชัยชนะกลืนชีวิตเล็ก ๆ", reward: "เล่นระยะยาวด้วยสงคราม วิกฤต และการสืบทอด", unlocked: ["เมืองขึ้น", "สงคราม", "ส่วย", "วิกฤตทวีป"] },
];

function currentStagePlan(game: GameState) {
  return stagePlans.find((p) => p.stage === game.stage) ?? stagePlans[0];
}
function stageProgressPercent(game: GameState) {
  const goals = stageเป้าหมายs(game);
  if (!goals.length) return 0;
  return Math.round(goals.filter((g) => g.done).length / goals.length * 100);
}
function threatTier(game: GameState) {
  const t = game.threat;
  if (t >= 80) return { level: "ระดับ 5", name: "โจรบุกได้ทุกเมื่อ", icon: "🔥", text: "ควรเตรียมเวรยาม รั้วไม้ หรือเจรจาเสียสละเสบียง ก่อนค่ายเสียหายหนัก" };
  if (t >= 60) return { level: "ระดับ 4", name: "พบคนสะกดรอย", icon: "⚠️", text: "ข่าวลือเริ่มกลายเป็นรอยเท้าจริง ควรมีคนเฝ้ายามและสายข่าว" };
  if (t >= 40) return { level: "ระดับ 3", name: "ควันไฟเริ่มดึงดูดสายตา", icon: "👁️", text: "ถิ่นฐานเริ่มมีของมีค่า พ่อค้าและโจรอาจได้ยินชื่อค่าย" };
  if (t >= 20) return { level: "ระดับ 2", name: "ข่าวลือบนถนนเก่า", icon: "🕊️", text: "ยังควบคุมได้ แต่ควรเริ่มมีเวรยามหรือข่าวสารพื้นฐาน" };
  return { level: "ระดับ 1", name: "เงียบสงบชั่วคราว", icon: "🌿", text: "ภัยภายนอกยังต่ำ เหมาะกับการสร้างฐานและสะสมทรัพยากร" };
}
function marketReadiness(game: GameState) {
  const surplusFood = Math.max(0, game.resources.food - foodNeedFor(game) * 3);
  const sellables = [
    { icon: "🍲", label: "อาหารส่วนเกิน", amount: surplusFood, price: Math.floor(surplusFood / 5) },
    { icon: "🦌", label: "หนังสัตว์", amount: game.resources.hides, price: game.resources.hides * 2 },
    { icon: "🍃", label: "สมุนไพร", amount: game.resources.herbs, price: Math.floor(game.resources.herbs * 1.5) },
    { icon: "🛠️", label: "เครื่องมือ", amount: Math.max(0, game.resources.tools - 3), price: Math.max(0, game.resources.tools - 3) * 4 },
  ];
  const totalPotential = sellables.reduce((s, x) => s + x.price, 0);
  return { sellables, totalPotential };
}
function villagerImpact(person: Person) {
  if (!person.alive) return "เหลือไว้เพียงความทรงจำในค่าย";
  if (person.skill === "hunter") return person.injured ? "พรานหลักบาดเจ็บ ทำให้อาหารจากป่าลดความแน่นอน" : "ช่วยให้งานหาอาหารและการอ่านรอยสัตว์น่าเชื่อถือขึ้น";
  if (person.skill === "builder") return person.injured ? "งานก่อสร้างและเครื่องมือจะช้าลง" : "ช่วยให้งานไม้ หิน และก่อสร้างมั่นคงขึ้น";
  if (person.skill === "healer") return person.injured ? "การรักษาอ่อนลงในช่วงที่คนป่วยต้องการมากที่สุด" : "ช่วยลดความเสี่ยงแผลติดเชื้อและโรคในค่าย";
  if (person.skill === "keeper") return "ช่วยให้พงศาวดาร ข่าวลือ และความรู้ไม่สูญหาย";
  if (person.skill === "guard") return "ช่วยประคองความปลอดภัยในคืนที่ค่ายเริ่มมีของให้ปกป้อง";
  if (person.skill === "elder") return "เป็นหลักใจของผู้คน แม้ทำงานหนักได้น้อยลง";
  if (person.skill === "child") return "ยังไม่ใช่แรงงานเต็มกำลัง แต่คือเหตุผลที่ผู้ใหญ่ยอมทนต่อฤดูหนาว";
  return "ช่วยงานพื้นฐานและเป็นส่วนหนึ่งของชุมชน";
}
function debugReport(game: GameState) {
  const report = {
    version: GAME_VERSION,
    leaderName: game.leaderName,
    houseName: game.houseName,
    year: game.year,
    month: game.month,
    stage: game.stage,
    population: alivePeople(game).length,
    workers: adultWorkers(game),
    terrain: game.terrain,
    resources: game.resources,
    laborAssignments: game.laborAssignments,
    metrics: game.metrics,
    threat: game.threat,
    crisis: crisisLevel(game),
    construction: game.construction,
    activeResearch: game.activeResearch,
    currentEventId: game.currentEventId,
    selectedChoiceId: game.selectedChoiceId,
    leaderFocus: game.leaderFocus,
    logs: game.logs.slice(0, 5),
  };
  return JSON.stringify(report, null, 2);
}

type WarningItem = { icon: string; title: string; text: string; severity: "info" | "warn" | "danger" };
type TradeOffer = { id: string; kind: "buy" | "sell"; icon: string; title: string; text: string; disabled?: boolean; disabledReason?: string; preview: string };

function endMonthWarnings(game: GameState): WarningItem[] {
  const risk = riskPreview(game);
  const warnings: WarningItem[] = [];
  const need = foodNeedFor(game);
  if (laborTotal(game.labor) === 0) warnings.push({ icon: "🧑‍🌾", title: "ยังไม่ได้จัดแรงงาน", text: "ถ้าจบเดือนตอนนี้ ค่ายแทบไม่ผลิตอะไรเลย และความเสี่ยงจะไล่ตามเร็วมาก", severity: "danger" });
  if (game.resources.food < need) warnings.push({ icon: "🍲", title: "อาหารไม่พอหลังจบเดือน", text: `มีอาหาร ${fmt(game.resources.food)} แต่ต้องใช้ประมาณ ${fmt(need)} หน่วย`, severity: "danger" });
  if (game.resources.water < waterNeedFor(game)) warnings.push({ icon: "💧", title: "น้ำใช้ไม่พอหลังจบเดือน", text: `มีน้ำ ${fmt(game.resources.water)} แต่ต้องใช้ประมาณ ${fmt(waterNeedFor(game))} หน่วย ควรจัดคนไปตักน้ำ`, severity: "danger" });
  if (seasonOf(game.month) === "ฤดูหนาว" && game.resources.fuel < alivePeople(game).length) warnings.push({ icon: "🪵", title: "ฟืนต่ำในฤดูหนาว", text: "เด็ก ผู้สูงอายุ และผู้ป่วยจะเสี่ยงมากขึ้นหากไม่มีฟืนพอ", severity: "danger" });
  if (game.labor.guard + game.labor.patrol <= 0 && (risk.beast >= 48 || game.threat >= 45)) warnings.push({ icon: "🛡️", title: "ไม่มีคนดูแลความปลอดภัย", text: "ภัยสัตว์ป่า/คนภายนอกสูง แต่ยังไม่มีเวรยามหรือการลาดตระเวน", severity: "warn" });
  if (woundedCount(game) > 0 && game.labor.care + game.labor.herbs <= 0) warnings.push({ icon: "🌿", title: "มีคนป่วยหรือบาดเจ็บแต่ไม่มีคนดูแล", text: "แผลติดเชื้อและโรคอาจเปลี่ยนเป็นการสูญเสียจริง", severity: "warn" });
  if (risk.accident >= 60) warnings.push({ icon: "⚠️", title: "ความเสี่ยงอุบัติเหตุสูง", text: "งานหนัก เครื่องมือพัง หรือแรงงานล้าอาจทำให้มีคนบาดเจ็บ", severity: "warn" });
  if (animalCount(game) > 0 && animalNeed(game) > (game.researchDone.fodderPrep ? game.resources.feed + game.labor.feed * 4 : game.resources.food)) warnings.push({ icon: "🐐", title: "สัตว์เลี้ยงอาจไม่มีอาหารพอ", text: `ต้องใช้ ${fmt(animalNeed(game))} หน่วยจาก${animalFoodSource(game)} หากไม่พอสัตว์อาจหิว หนี หรือตาย`, severity: "warn" });
  if (!game.leaderActionSelected) warnings.push({ icon: "👑", title: "ยังไม่ได้เลือกการกระทำผู้นำ", text: "ต้องเลือกก่อนจบเดือน เพราะผู้นำคือคำตอบหลักของสถานการณ์เดือนนี้", severity: "danger" });
  if (!game.selectedChoiceId) warnings.push({ icon: "✦", title: "ยังไม่ได้ตอบเหตุการณ์", text: "ต้องเลือกวิธีตอบสนองเหตุการณ์ก่อนคำนวณผลลัพธ์", severity: "danger" });
  return warnings.slice(0, 6);
}

function smartGuidance(game: GameState): WarningItem[] {
  const risk = riskPreview(game);
  const advice: WarningItem[] = [];
  const need = foodNeedFor(game);
  if (game.resources.food < need * 2) advice.push({ icon: "🍲", title: "เสริมอาหารก่อน", text: "เพิ่มแรงงานหาอาหาร/เพาะปลูก หรือรอพ่อค้าเพื่อซื้ออาหารฉุกเฉินเมื่อมีทอง", severity: "warn" });
  const nextMonth = game.month + 1 > 12 ? 1 : game.month + 1;
  if (seasonOf(nextMonth) === "ฤดูหนาว" && game.resources.fuel < alivePeople(game).length * 2) advice.push({ icon: "🪵", title: "เตรียมฟืนล่วงหน้า", text: "ใกล้ฤดูหนาว ควรตัดไม้หรือเลือกผู้นำวางแผนฟืนก่อนคนป่วยเพิ่ม", severity: "warn" });
  if (!game.construction) {
    const desired: BuildingKey | null = shelterCapacity(game) < alivePeople(game).length ? "shelter" : game.buildings.storage <= 0 ? "storage" : game.buildings.well <= 0 && game.researchDone.waterFinding ? "well" : null;
    if (desired) advice.push({ icon: buildingData[desired].icon, title: `เริ่มก่อสร้าง: ${buildingData[desired].title}`, text: buildingData[desired].text, severity: "info" });
  }
  if (!game.activeResearch) {
    const desired: ResearchKey | null = !game.researchDone.foodPreservation ? "foodPreservation" : !game.researchDone.waterFinding ? "waterFinding" : !game.researchDone.watchRoutine ? "watchRoutine" : null;
    if (desired) advice.push({ icon: researchData[desired].icon, title: `ศึกษา: ${researchData[desired].title}`, text: researchData[desired].text, severity: "info" });
  }
  if (risk.disease >= 50) advice.push({ icon: "💧", title: "ลดโรคด้วยน้ำและการดูแล", text: "บ่อน้ำ งานดูแลน้ำสะอาด และคนดูแลผู้ป่วยช่วยลดการตายระยะยาว", severity: "warn" });
  if (game.threat >= 55) advice.push({ icon: "🕊️", title: "ภัยภายนอกเริ่มชัด", text: "จัดเวรยาม ลาดตระเวน หรือพัฒนาเครือข่ายสายข่าว เพื่อไม่ให้โจรกลายเป็นเหตุการณ์ฉับพลัน", severity: "warn" });
  if (animalCount(game) > 0 && !game.researchDone.fodderPrep) advice.push({ icon: "🌿", title: "ควรวิจัยอาหารสัตว์", text: "ก่อนมีอาหารสัตว์ แพะและไก่จะแย่งอาหารคนบางส่วน การวิจัยจะทำให้เลี้ยงระยะยาวได้สมจริงขึ้น", severity: "info" });
  if (!advice.length) advice.push({ icon: "🌿", title: "เดือนนี้พอมีพื้นที่หายใจ", text: "ใช้จังหวะนี้สะสมของสำรอง วิจัยพื้นฐาน หรือสร้างสิ่งที่ช่วยลดความเสี่ยงในฤดูหน้า", severity: "info" });
  return advice.slice(0, 5);
}

function threatBreakdown(game: GameState) {
  const risk = riskPreview(game);
  return [
    { icon: "🐺", title: "สัตว์ป่า", value: risk.beast, text: risk.beast >= 55 ? "พบรอยและเสียงใกล้ค่าย ควรมีเวรยามหรือกับดัก" : "ยังอยู่ในระดับควบคุมได้" },
    { icon: "🗡️", title: "โจรและคนภายนอก", value: game.threat, text: game.threat >= 60 ? "ควันไฟและทรัพย์สินเริ่มดึงคนไม่หวังดี" : "ข่าวลือยังไม่กลายเป็นภัยเต็มรูปแบบ" },
    { icon: "🦠", title: "โรคระบาด", value: risk.disease, text: risk.disease >= 55 ? "ผู้บาดเจ็บ/น้ำ/ฝนกำลังเพิ่มโอกาสป่วยหนัก" : "รักษาสุขอนามัยไว้ต่อเนื่อง" },
    { icon: "❄️", title: "ภัยหนาวและอากาศ", value: risk.weather, text: risk.weather >= 55 ? "ที่พักและฟืนคือเรื่องเร่งด่วน" : "สภาพอากาศยังไม่ถึงขั้นกดดันสุด" },
    { icon: "⚖️", title: "ความขัดแย้งในค่าย", value: risk.conflict, text: risk.conflict >= 55 ? "ความยุติธรรม/เสบียงอาจแตกเป็นข้อพิพาท" : "ยังคุยกันได้ก่อนกลายเป็นรอยร้าว" },
  ];
}

function tradeOffers(game: GameState): TradeOffer[] {
  const foodSurplus = Math.max(0, game.resources.food - foodNeedFor(game) * 3);
  const merchantHere = getEvent(game.currentEventId).category.includes("การค้า") || getEvent(game.currentEventId).title.includes("พ่อค้า");
  const marketOpen = merchantHere || game.labor.trade > 0 || game.stage !== "ค่ายพักแรม";
  return [
    { id: "sell_food", kind: "sell", icon: "🍲", title: "ขายอาหารส่วนเกิน 20 หน่วย", text: "เปลี่ยนเสบียงที่เกินความจำเป็นเป็นทอง แต่ไม่ควรขายเมื่อใกล้ฤดูหนาว", disabled: foodSurplus < 20 || !marketOpen, disabledReason: !marketOpen ? "ต้องมีพ่อค้า/งานแลกเปลี่ยน/ชุมชนโตขึ้น" : "อาหารส่วนเกินยังไม่พอ", preview: "+ทอง 6 · -อาหาร 20" },
    { id: "sell_hides", kind: "sell", icon: "🦌", title: "ขายหนังสัตว์ 3 ผืน", text: "หนังสัตว์ขายได้ราคาดีเมื่อพ่อค้ามา แต่เป็นวัสดุช่วยทำที่พักด้วย", disabled: game.resources.hides < 3 || !marketOpen, disabledReason: !marketOpen ? "ยังไม่มีช่องทางค้า" : "หนังสัตว์ไม่พอ", preview: "+ทอง 9 · -หนังสัตว์ 3" },
    { id: "sell_herbs", kind: "sell", icon: "🍃", title: "ขายสมุนไพร 4 กำ", text: "หมอยาจากที่อื่นมักให้ราคาดี แต่การขายมากเกินไปอาจทำให้รักษาคนยาก", disabled: game.resources.herbs < 4 || !marketOpen, disabledReason: !marketOpen ? "ยังไม่มีช่องทางค้า" : "สมุนไพรไม่พอ", preview: "+ทอง 8 · -สมุนไพร 4" },
    { id: "buy_tools", kind: "buy", icon: "🛠️", title: "ซื้อเครื่องมือ 3 ชิ้น", text: "ลดความเสี่ยงงานหนักและช่วยเร่งก่อสร้าง/ผลิต", disabled: game.resources.gold < 10 || !marketOpen, disabledReason: !marketOpen ? "ต้องรอพ่อค้าหรือเปิดการค้า" : "ทองไม่พอ", preview: "-ทอง 10 · +เครื่องมือ 3" },
    { id: "buy_food", kind: "buy", icon: "🥖", title: "ซื้ออาหารฉุกเฉิน 25 หน่วย", text: "แพง แต่ช่วยไม่ให้เดือนวิกฤตกลายเป็นหลุมศพ", disabled: game.resources.gold < 12 || !marketOpen, disabledReason: !marketOpen ? "ต้องรอพ่อค้าหรือเปิดการค้า" : "ทองไม่พอ", preview: "-ทอง 12 · +อาหาร 25" },
    { id: "buy_medicine", kind: "buy", icon: "🧪", title: "ซื้อยาและผ้าพันแผล", text: "ช่วยผู้ป่วยและผู้บาดเจ็บในเดือนที่โรคสูง", disabled: game.resources.gold < 8 || !marketOpen, disabledReason: !marketOpen ? "ต้องรอพ่อค้าหรือเปิดการค้า" : "ทองไม่พอ", preview: "-ทอง 8 · +สมุนไพร 5 · +สุขภาพ" },
    { id: "buy_intel", kind: "buy", icon: "🗺️", title: "ซื้อข่าวสารและแผนที่เส้นทาง", text: "เปิดข่าวลือ ลดความไม่แน่นอน และช่วยเห็นภัยภายนอกก่อนเกิด", disabled: game.resources.gold < 6 || !marketOpen, disabledReason: !marketOpen ? "ต้องรอพ่อค้าหรือเปิดการค้า" : "ทองไม่พอ", preview: "-ทอง 6 · +ข่าวลือ · ลดภัย" },
  ];
}

function applyTradeOffer(game: GameState, offerId: string): GameState {
  const offer = tradeOffers(game).find((o) => o.id === offerId);
  if (!offer || offer.disabled) return { ...game, savedText: offer?.disabledReason ?? "ยังแลกเปลี่ยนไม่ได้" };
  let g = game;
  if (offerId === "sell_food") g = { ...g, resources: changeResources(g.resources, { food: -20, gold: 6 }), pathScores: { ...g.pathScores, trade: g.pathScores.trade + 2 } };
  if (offerId === "sell_hides") g = { ...g, resources: changeResources(g.resources, { hides: -3, gold: 9 }), pathScores: { ...g.pathScores, trade: g.pathScores.trade + 2 } };
  if (offerId === "sell_herbs") g = { ...g, resources: changeResources(g.resources, { herbs: -4, gold: 8 }), pathScores: { ...g.pathScores, trade: g.pathScores.trade + 2 } };
  if (offerId === "buy_tools") g = { ...g, resources: changeResources(g.resources, { gold: -10, tools: 3 }), metrics: changeMetrics(g.metrics, { trust: 1 }) };
  if (offerId === "buy_food") g = { ...g, resources: changeResources(g.resources, { gold: -12, food: 25 }), metrics: changeMetrics(g.metrics, { morale: 2 }) };
  if (offerId === "buy_medicine") g = { ...g, resources: changeResources(g.resources, { gold: -8, herbs: 5 }), metrics: changeMetrics(g.metrics, { health: 4, morale: 1 }) };
  if (offerId === "buy_intel") g = { ...g, resources: changeResources(g.resources, { gold: -6 }), threat: clamp(g.threat - 5, 0, 100), rumors: [{ id: uid("rumor"), title: "ข่าวจากเส้นทางค้า", detail: "พ่อค้าเล่าว่ามีถนนเก่าที่ยังพอใช้ได้ และเตือนว่าควันไฟของค่ายเล็ก ๆ เริ่มเห็นได้จากไกล", danger: "กลาง", discovered: false }, ...g.rumors].slice(0, 28) };
  g = addLog(g, `การค้า: ${offer.title}`, `${offer.text}
ผลลัพธ์: ${offer.preview}`, "good", ["การค้า", offer.kind === "buy" ? "ซื้อ" : "ขาย"]);
  return { ...g, savedText: `ดำเนินการค้าแล้ว: ${offer.title}` };
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
  return Math.ceil(alivePeople(game).reduce((sum, p) => sum + foodNeedForPerson(p), 0));
}

function populationBreakdown(game: GameState) {
  const alive = alivePeople(game);
  return {
    total: alive.length,
    children: alive.filter((p) => p.age < 16).length,
    teens: alive.filter((p) => p.age >= 12 && p.age < 16).length,
    adults: alive.filter((p) => p.age >= 15 && p.age < 60).length,
    elders: alive.filter((p) => p.age >= 60).length,
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
  const foodQuality = clamp(42 + game.buildings.storage * 14 + game.buildings.dryingRack * 10 + (game.researchDone.foodPreservation ? 18 : 0) - (seasonOf(game.month) === "ฤดูฝน" ? 8 : 0) - (seasonOf(game.month) === "ฤดูร้อน" ? 6 : 0));
  const waterQuality = clamp(38 + game.buildings.well * 28 + game.buildings.waterTrough * 4 + (game.researchDone.waterFinding ? 8 : 0) + (game.researchDone.sanitation ? 12 : 0) - (seasonOf(game.month) === "ฤดูฝน" ? 8 : 0));
  const shelterQuality = clamp(28 + game.buildings.shelter * 9 + game.buildings.campfire * 8 + game.buildings.smokeVent * 7 + (game.researchDone.woodShelter ? 14 : 0) + (game.researchDone.shelterHygiene ? 5 : 0) - Math.max(0, alivePeople(game).length - shelterCapacity(game)) * 4);
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
  const labor: Labor = emptyLabor();
  const allowed = new Set(unlockedLaborOptions(game).map((item) => item.id));
  const assign = (key: LaborKey, count: number) => {
    if (!allowed.has(key)) return;
    const n = Math.max(0, Math.min(workers, count));
    labor[key] += n;
    workers -= n;
  };
  if (woundedCount(game) > 0) assign(game.researchDone.herbalCare ? "herbs" : "care", Math.min(2, woundedCount(game)));
  if (game.resources.water < alivePeople(game).length * 2) assign("water", 1);
  if (animalCount(game) > 0 && game.researchDone.fodderPrep && game.resources.feed < animalNeed(game) * 2) assign("feed", 1);
  if (game.resources.food < foodNeedFor(game) * 2) assign("forage", 2); else assign("forage", 1);
  if (game.researchDone.basicFarming || game.buildings.farmPlot > 0) assign("farm", 1);
  if (game.resources.fuel < alivePeople(game).length && seasonOf(game.month) === "ฤดูหนาว") assign("wood", 2);
  if (riskPreview(game).beast > 45 || game.threat > 35) assign(game.researchDone.watchRoutine ? "patrol" : "guard", 1);
  if (game.construction) assign("build", 2); else if (game.buildings.shelter === 0 || shelterCapacity(game) < alivePeople(game).length) assign("build", 1);
  if (game.resources.wood < 18) assign("wood", 1);
  if (game.resources.stone < 8) assign("stone", 1);
  if (game.researchDone.foodPreservation && game.resources.food > foodNeedFor(game) * 2) assign("preserve", 1);
  if ((game.researchDone.simpleCraft || game.buildings.workshop > 0) && game.resources.tools <= 4) assign("craft", 1);
  if (game.activeResearch) assign("research", 1); else if (game.resources.knowledge < 25) assign("research", 1);
  if ((game.stage !== "ค่ายพักแรม" || game.buildings.meetingHall > 0) && game.resources.food > foodNeedFor(game) * 3) assign("trade", 1);
  if (locationDiscoveryCount(game) < 4 || normalizeLocations(game.locations)[bestExploreTarget(game)].progress < 70) assign("explore", 1);
  if ((game.stage === "เมืองเล็ก" || game.researchDone.signalNetwork) && game.rumors.length < 3) assign("intel", 1);
  const fallback: LaborKey[] = ["forage", "water", "explore", "feed", "wood", "farm", "build", "guard", "patrol", "research", "stone", "care", "preserve", "craft", "herbs", "teach", "intel", "trade"];
  let i = 0;
  while (workers > 0) {
    const key = fallback[i % fallback.length];
    if (allowed.has(key)) { labor[key] += 1; workers--; }
    i++;
    if (i > fallback.length * 4) break;
  }
  return labor;
}
function resourceLedger(game: GameState) {
  const l = normalizeLabor(game);
  const season = seasonOf(game.month);
  const warmFood = season === "ฤดูใบไม้ผลิ" || season === "ฤดูร้อน" || season === "ฤดูใบไม้ร่วง";
  const terrain = terrainData[game.terrain ?? "riverbank"];
  const forageRate = ((season === "ฤดูหนาว" ? 3 : season === "ฤดูฝน" ? 4 : 5) + (game.origin === "hunter" ? 1.8 : 0) + skillCount(game, "hunter") * 0.35) * (1 + terrain.forage);
  const farmRate = l.farm ? ((season === "ฤดูหนาว" ? 1 : season === "ฤดูฝน" ? 6 : warmFood ? 7 : 4) + game.buildings.farmPlot * 1.5 + (game.researchDone.basicFarming ? 1 : 0)) : 0;
  const woodRate = (5 + (game.origin === "builder" ? 1.2 : 0) + (game.researchDone.stoneTools ? 1 : 0) + (game.buildings.workshop ? 1.2 : 0) + skillCount(game, "builder") * 0.25) * (1 + terrain.wood);
  const stoneRate = (2.5 + (game.researchDone.stoneTools ? 0.8 : 0) + (game.buildings.workshop ? 0.7 : 0) + skillCount(game, "builder") * 0.15) * (1 + terrain.stone);
  const researchRate = 4 + (game.origin === "keeper" ? 1.8 : 0) + (game.leaderFocus === "study" ? 2 : 0) + skillCount(game, "keeper") * 0.35;
  const foodProd = Math.round(l.forage * forageRate + l.farm * farmRate + l.patrol * 1.5 + (game.leaderFocus === "leadForage" ? Math.max(3, l.forage * 2) : 0));
  const woodProd = Math.round(l.wood * woodRate);
  const stoneProd = Math.round(l.stone * stoneRate);
  const knowledgeProd = Math.round(l.research * researchRate + l.teach * 4 + l.intel * 2 + (game.leaderFocus === "study" ? 4 : 0));
  const waterProd = Math.round(l.water * ((game.buildings.well ? 9 : 5) * (1 + terrain.water)) + (game.researchDone.waterFinding ? 2 : 0));
  const fuelProd = Math.floor(l.wood * 1.4);
  const toolsProd = Math.floor(l.craft * (game.buildings.workshop ? 1.5 : 0.8));
  const toolInputs = l.craft > 0 ? Math.min(game.resources.wood, l.craft * 2) : 0;
  const herbsProd = Math.round(l.herbs * ((game.researchDone.herbalCare ? 3 : 1.4) + (game.origin === "healer" ? 0.8 : 0)) + (game.buildings.healerHut ? 1 : 0));
  const foodUse = foodNeedFor(game);
  const waterUse = waterNeedFor(game) + animalWaterNeed(game);
  const fuelUse = season === "ฤดูหนาว" ? Math.ceil(alivePeople(game).length * 0.7) + Math.max(0, alivePeople(game).length - shelterCapacity(game)) + l.preserve : l.preserve;
  const tradeFood = l.trade ? Math.min(Math.max(0, game.resources.food - foodNeedFor(game) * 2), l.trade * 3) : 0;
  const tradeHides = l.trade ? Math.min(game.resources.hides, l.trade) : 0;
  const tradeHerbs = l.trade ? Math.min(game.resources.herbs, l.trade) : 0;
  const goldProd = Math.round(l.trade * 2 + tradeFood * 0.8 + tradeHides * 2 + tradeHerbs * 1.5);
  return [
    { icon: "🍲", name: "อาหาร", stock: game.resources.food, produced: foodProd, used: foodUse + tradeFood, net: foodProd - foodUse - tradeFood, note: "อาหารจากป่า/ล่าสัตว์/แปลงปลูก" },
    { icon: "💧", name: "น้ำ", stock: game.resources.water, produced: waterProd, used: waterUse, net: waterProd - waterUse, note: game.buildings.well ? "มีบ่อน้ำช่วยคุณภาพน้ำ" : "ยังไม่มีบ่อน้ำ น้ำเสี่ยงปนเปื้อน" },
    { icon: "🏺", name: "น้ำสำรอง", stock: game.resources.waterReserve ?? 0, produced: game.buildings.cistern > 0 && game.policies.reserveWater ? Math.max(0, Math.min(12 + game.buildings.cistern * 8, game.resources.water - waterUse)) : 0, used: 0, net: 0, note: "น้ำสำรองจากถังเก็บน้ำฝน ใช้เมื่อฤดูแล้ง หนาวยาว หรือน้ำหลักไม่พอ" },
    { icon: "🔥", name: "ฟืน", stock: game.resources.fuel, produced: fuelProd, used: fuelUse, net: fuelProd - fuelUse, note: "ใช้มากในฤดูหนาวและการถนอมอาหาร" },
    { icon: "🪵", name: "ไม้", stock: game.resources.wood, produced: woodProd, used: toolInputs, net: woodProd - toolInputs, note: "สร้างที่พัก คลัง รั้ว ซ่อม และผลิตเครื่องมือ" },
    { icon: "🪨", name: "หิน", stock: game.resources.stone, produced: stoneProd, used: 0, net: stoneProd, note: "บ่อน้ำ กองไฟ โครงสร้างถาวร" },
    { icon: "🛠️", name: "เครื่องมือ", stock: game.resources.tools, produced: toolsProd, used: 0, net: toolsProd, note: "ช่วยลดอุบัติเหตุและเพิ่มผลผลิตงานหนัก" },
    { icon: "🍃", name: "สมุนไพร", stock: game.resources.herbs, produced: herbsProd, used: tradeHerbs, net: herbsProd - tradeHerbs, note: "ใช้รักษา แผลติดเชื้อ และโรคระบาด" },
    { icon: "🦌", name: "หนังสัตว์", stock: game.resources.hides, produced: 0, used: tradeHides, net: -tradeHides, note: "ใช้แลกเปลี่ยน ทำเครื่องนุ่งห่ม หรือเก็บเป็นของมีค่า" },
    { icon: "📜", name: "ความรู้", stock: game.resources.knowledge, produced: knowledgeProd, used: 0, net: knowledgeProd, note: "ใช้ปลดล็อกภูมิปัญญา" },
    ...(game.researchDone.fodderPrep || game.resources.feed > 0 || animalCount(game) > 0 ? [{ icon: "🌿", name: "อาหารสัตว์", stock: game.resources.feed, produced: Math.round(l.feed * (game.buildings.animalPen ? 5 : 3)), used: animalNeed(game), net: Math.round(l.feed * (game.buildings.animalPen ? 5 : 3)) - animalNeed(game), note: "ใช้เลี้ยงแพะ ไก่ และสุนัข ลดการแย่งอาหารคน" }] : []),
    { icon: "🪙", name: "ทอง", stock: game.resources.gold, produced: goldProd, used: 0, net: goldProd, note: "ได้จากการแลกเปลี่ยน/ขายของส่วนเกิน ใช้ซื้อเครื่องมือ เมล็ดพันธุ์ หรือจ้างคนในอนาคต" },
    ...(["ironOre","coal","timber","bricks","textiles","salt","spices","influence","steel","luxuries","warhorses","manpower","siegeMaterials"] as ResourceKey[]).filter((key) => (game.resources[key] ?? 0) > 0).map((key) => ({ icon: ({ ironOre:"⛏️", coal:"⚫", timber:"🪚", bricks:"🧱", textiles:"🧶", salt:"🧂", spices:"🌶️", influence:"📜", steel:"⚔️", luxuries:"💎", warhorses:"🐎", manpower:"🪖", siegeMaterials:"🔥" } as Record<string,string>)[key] ?? "•", name: resourceShortLabel(key), stock: game.resources[key] ?? 0, produced: 0, used: 0, net: 0, note: "ทรัพยากรขั้นสูงที่จะมีบทบาทเมื่อเมืองเข้าสู่ยุคเศรษฐกิจ นครรัฐ หรืออาณาจักร" })),
  ];
}

const resourceLabelToKey: Record<string, ResourceKey> = {
  "อาหาร": "food", "น้ำ": "water", "น้ำสำรอง": "waterReserve", "ฟืน": "fuel", "ไม้": "wood", "หิน": "stone", "เครื่องมือ": "tools", "สมุนไพร": "herbs", "หนังสัตว์": "hides", "ความรู้": "knowledge", "อาหารสัตว์": "feed", "ทอง": "gold", "แร่เหล็ก": "ironOre", "ถ่านหิน": "coal", "ไม้แปรรูป": "timber", "อิฐเผา": "bricks", "ผ้าทอ": "textiles", "เกลือ": "salt", "เครื่องเทศ": "spices", "อิทธิพล": "influence", "เหล็กกล้า": "steel", "สินค้าฟุ่มเฟือย": "luxuries", "ม้ารบ": "warhorses", "กำลังพล": "manpower", "วัสดุสงคราม": "siegeMaterials"
};

function blankResourcePartial(): Partial<Resources> { return {}; }
function resourcePartialValue(part: Partial<Resources> | undefined, key: ResourceKey) { return Math.round(part?.[key] ?? 0); }
function makeResourceYearSnapshot(game: GameState, year = game.year): ResourceHistoryYear {
  const produced: Partial<Resources> = blankResourcePartial();
  const used: Partial<Resources> = blankResourcePartial();
  const net: Partial<Resources> = blankResourcePartial();
  resourceLedger(game).forEach((row) => {
    const key = resourceLabelToKey[row.name];
    if (!key) return;
    produced[key] = Math.round(row.produced * 12);
    used[key] = Math.round(row.used * 12);
    net[key] = Math.round(row.net * 12);
  });
  const q = qualityStatus(game);
  return {
    year,
    stocks: { ...game.resources },
    produced,
    used,
    net,
    population: alivePeople(game).length,
    quality: { food: q.foodQuality, water: q.waterQuality, shelter: q.shelterQuality },
  };
}
function normalizeResourceHistory(value: unknown, game: GameState): ResourceHistoryYear[] {
  const current = makeResourceYearSnapshot(game, game.year);
  const list = Array.isArray(value) ? value : [];
  const safe = list
    .filter((item: any) => item && typeof item.year === "number")
    .map((item: any) => ({
      year: item.year,
      stocks: { ...baseResources(game.origin ?? "builder"), ...(item.stocks ?? {}) } as Resources,
      produced: item.produced ?? {},
      used: item.used ?? {},
      net: item.net ?? {},
      population: typeof item.population === "number" ? item.population : alivePeople(game).length,
      quality: item.quality ?? current.quality,
    })) as ResourceHistoryYear[];
  const merged = [...safe.filter((item) => item.year !== current.year), current]
    .sort((a, b) => a.year - b.year)
    .slice(-10);
  return merged;
}
function appendResourceYearHistory(game: GameState): GameState {
  const history = normalizeResourceHistory((game as any).resourceHistory, game)
    .filter((item) => item.year !== game.year);
  return { ...game, resourceHistory: [...history, makeResourceYearSnapshot(game, game.year)].slice(-10) };
}
function resourceTrendPoints(game: GameState): ResourceHistoryYear[] {
  return normalizeResourceHistory((game as any).resourceHistory, game);
}
function resourceDisplayRows(game: GameState) {
  return resourceLedger(game).map((row) => {
    const key = resourceLabelToKey[row.name] ?? "food";
    return { ...row, key };
  });
}

function resolveAnimals(game: GameState): { game: GameState; changes: string[] } {
  let g = game;
  let state = normalizeAnimalState(g.animalState);
  const changes: string[] = [];
  const total = animalCount(g);
  if (total <= 0) return { game: { ...g, animalState: state }, changes };
  const need = animalNeed(g);
  const waterNeed = animalWaterNeed(g);
  let watered = Math.min(g.resources.water, waterNeed);
  if (waterNeed > 0) {
    g = { ...g, resources: changeResources(g.resources, { water: -watered }) };
    changes.push(`ให้น้ำสัตว์ -${watered}`);
    if (watered < waterNeed) {
      const missingWater = waterNeed - watered;
      state = { ...state, hunger: clamp(state.hunger + missingWater * 4), health: clamp(state.health - missingWater * 6) };
      changes.push(`น้ำสัตว์ไม่พอ ขาด ${missingWater} หน่วย สุขภาพฝูงลดลง`);
    }
  }
  let fed = 0;
  const roughFeedMode = !g.researchDone.fodderPrep && (g.buildings.animalPen > 0 || g.resources.feed > 0);
  const feedNeed = roughFeedMode ? Math.ceil(need * 1.25) : need;
  if (g.researchDone.fodderPrep || roughFeedMode) {
    const feedUsed = Math.min(g.resources.feed, feedNeed);
    g = { ...g, resources: changeResources(g.resources, { feed: -feedUsed }) };
    fed += roughFeedMode ? Math.floor(feedUsed / 1.25) : feedUsed;
    if (feedUsed) changes.push(`${g.researchDone.fodderPrep ? "ให้อาหารสัตว์" : "ให้อาหารหยาบจากคอก"} -${feedUsed}`);
    if (fed < need) {
      const foodBackup = Math.min(g.resources.food, need - fed);
      g = { ...g, resources: changeResources(g.resources, { food: -foodBackup }) };
      fed += foodBackup;
      if (foodBackup) changes.push(`อาหารสัตว์ไม่พอ ใช้อาหารคน/เศษพืชเสริม -${foodBackup}`);
    }
  } else {
    fed = Math.min(g.resources.food, need);
    g = { ...g, resources: changeResources(g.resources, { food: -fed }) };
    changes.push(`ยังไม่มีอาหารสัตว์ ใช้อาหารคน/เศษพืชเลี้ยงสัตว์ -${fed}`);
  }
  const shortage = Math.max(0, need - fed);
  if (shortage > 0) {
    state = { ...state, hunger: clamp(state.hunger + shortage * 11), health: clamp(state.health - shortage * 5) };
    changes.push(`สัตว์เลี้ยงหิว ขาดอาหาร ${shortage} หน่วย`);
  } else {
    state = { ...state, hunger: clamp(state.hunger - 14), health: clamp(state.health + 3) };
  }
  const a = { ...state.animals };
  if (g.animalAction === "slaughter") {
    if (a.cows > 0) { a.cows -= 1; g = { ...g, resources: changeResources(g.resources, { food: 32, hides: 2 }), metrics: changeMetrics(g.metrics, { morale: -2 }) }; changes.push("เชือดวัว 1 ตัวเป็นอาหาร +32 และหนัง +2"); }
    else if (a.pigs > 0) { a.pigs -= 1; g = { ...g, resources: changeResources(g.resources, { food: 16, hides: 1 }), metrics: changeMetrics(g.metrics, { morale: -1 }) }; changes.push("เชือดหมู 1 ตัวเป็นอาหาร +16 และหนัง +1"); }
    else if (a.goats > 0) { a.goats -= 1; g = { ...g, resources: changeResources(g.resources, { food: 18, hides: 1 }), metrics: changeMetrics(g.metrics, { morale: -1 }) }; changes.push("เชือดแพะ 1 ตัวเป็นอาหาร +18 และหนัง +1"); }
    else if (a.chickens >= 2) { a.chickens -= 2; g = { ...g, resources: changeResources(g.resources, { food: 8 }), metrics: changeMetrics(g.metrics, { morale: -1 }) }; changes.push("เชือดไก่ 2 ตัวเป็นอาหาร +8"); }
    else changes.push("ตั้งใจจะเชือดสัตว์ แต่ไม่มีสัตว์พอให้ทำอย่างคุ้มค่า");
  }
  if (g.animalAction === "release") {
    if (a.cows > 0) { a.cows -= 1; state = { ...state, hunger: clamp(state.hunger - 10) }; changes.push("ปล่อยวัว 1 ตัว ลดภาระอาหารระยะยาว"); }
    else if (a.pigs > 0) { a.pigs -= 1; state = { ...state, hunger: clamp(state.hunger - 8) }; changes.push("ปล่อยหมู 1 ตัว ลดภาระคอก"); }
    else if (a.goats > 0) { a.goats -= 1; state = { ...state, hunger: clamp(state.hunger - 8) }; changes.push("ปล่อยแพะที่เลี้ยงไม่ไหว 1 ตัว ลดภาระอาหารสัตว์"); }
    else if (a.chickens > 0) { a.chickens -= 1; state = { ...state, hunger: clamp(state.hunger - 4) }; changes.push("ปล่อยไก่ 1 ตัว ลดภาระอาหารสัตว์"); }
  }
  if (g.animalAction === "protect") {
    state = { ...state, health: clamp(state.health + 3), hunger: clamp(state.hunger - 3) };
    g = { ...g, metrics: changeMetrics(g.metrics, { security: 1 }) };
    changes.push("จัดเวรดูคอก ลดโอกาสสัตว์หนีและถูกขโมย");
  }
  const penBonus = g.buildings.animalPen > 0 ? 0.18 : 0;
  const breedChance = (g.animalAction === "breed" ? 0.22 : 0.08) + penBonus + (state.health > 75 && state.hunger < 30 ? 0.08 : 0);
  if (Math.random() < breedChance) {
    if (a.chickens >= 2 && Math.random() < 0.45) { const born = 1 + Math.floor(Math.random() * 3); a.chickens += born; changes.push(`ไก่ออกลูก/ฟักเพิ่ม ${born} ตัว`); }
    else if (a.pigs >= 2 && Math.random() < 0.3) { a.pigs += 1; changes.push("หมูออกลูกเพิ่ม 1 ตัว"); }
    else if (a.goats >= 2 && Math.random() < 0.4) { a.goats += 1; changes.push("แพะออกลูกเพิ่ม 1 ตัว"); }
    else if (a.cows >= 2) { a.cows += 1; changes.push("วัวออกลูกเพิ่ม 1 ตัว"); }
  }
  const theftRisk = Math.max(0.02, (g.threat / 500) - (g.buildings.animalPen > 0 ? 0.04 : 0) - (g.labor.guard + g.labor.patrol) * 0.015 - (g.animalAction === "protect" ? 0.05 : 0));
  const escapeRisk = Math.max(0.02, state.hunger / 450 + (g.buildings.animalPen > 0 ? 0 : 0.05) - (g.animalAction === "protect" ? 0.04 : 0));
  const animalGame = { ...g, animalState: { ...state, animals: a } } as GameState;
  if (Math.random() < theftRisk && animalCount(animalGame) > 0) {
    if (a.cows > 0) { a.cows -= 1; changes.push("มีคนขโมยวัวไป 1 ตัวในคืนมืด"); g = { ...g, threat: clamp(g.threat + 5), metrics: changeMetrics(g.metrics, { security: -5, morale: -3 }) }; }
    else if (a.pigs > 0) { a.pigs -= 1; changes.push("หมูถูกขโมย 1 ตัว"); g = { ...g, threat: clamp(g.threat + 4), metrics: changeMetrics(g.metrics, { security: -3 }) }; }
    else if (a.goats > 0) { a.goats -= 1; changes.push("มีคนขโมยแพะไป 1 ตัวในคืนมืด"); g = { ...g, threat: clamp(g.threat + 4), metrics: changeMetrics(g.metrics, { security: -4, morale: -2 }) }; }
    else if (a.chickens > 0) { const lost = Math.min(a.chickens, 2); a.chickens -= lost; changes.push(`ไก่ถูกขโมย ${lost} ตัว`); g = { ...g, threat: clamp(g.threat + 3), metrics: changeMetrics(g.metrics, { security: -2 }) }; }
  } else if (Math.random() < escapeRisk && animalCount(animalGame) > 0) {
    if (a.chickens > 0 && Math.random() < 0.45) { a.chickens -= 1; changes.push("ไก่หนีออกจากคอกเพราะหิวและรั้วไม่แน่น"); }
    else if (a.pigs > 0 && Math.random() < 0.55) { a.pigs -= 1; changes.push("หมูมุดรั้วหนีออกจากคอก"); }
    else if (a.goats > 0) { a.goats -= 1; changes.push("แพะหลุดเชือกและหายเข้าป่า"); }
    else if (a.cows > 0) { a.cows -= 1; changes.push("วัวแตกตื่นและหลุดออกจากคอก"); }
  }
  if (state.hunger >= 80 || state.health <= 25) {
    if (a.chickens > 0) { a.chickens -= 1; changes.push("ไก่หนึ่งตัวหิว/ป่วยตาย"); }
    else if (a.pigs > 0) { a.pigs -= 1; changes.push("หมูหนึ่งตัวล้มจากความหิวและโรค"); }
    else if (a.goats > 0) { a.goats -= 1; changes.push("แพะหนึ่งตัวล้มตายจากความหิวและโรค"); }
    else if (a.cows > 0) { a.cows -= 1; changes.push("วัวหนึ่งตัวทรุดตายเพราะขาดน้ำและอาหาร"); }
    state = { ...state, hunger: clamp(state.hunger - 20), health: clamp(state.health - 6) };
  }
  const productsFood = Math.floor(a.chickens / 4) + Math.floor(a.goats / 3) + Math.floor(a.pigs / 3);
  const milkFood = Math.floor(a.cows / 2);
  if ((productsFood + milkFood) > 0 && g.animalAction !== "slaughter") {
    g = { ...g, resources: changeResources(g.resources, { food: productsFood + milkFood }) };
    changes.push(`ผลิตจากสัตว์เลี้ยง +อาหาร ${productsFood + milkFood}`);
  }
  if (state.health < 42 && Math.random() * 100 < (g.researchDone.animalQuarantine ? 8 : 22)) {
    changes.push("โรคในคอกสัตว์เริ่มลาม ต้องแยกสัตว์ป่วยและดูแลน้ำ/มูลสัตว์");
    state = { ...state, health: clamp(state.health - 10) };
    if (!g.researchDone.animalQuarantine && Math.random() < 0.35) { g = woundSomeone(g, "โรคจากคอกสัตว์แพร่สู่คน"); changes.push("โรคจากคอกสัตว์ทำให้คนในค่ายล้มป่วย"); }
  }
  state = { ...state, animals: a, lastAction: g.animalAction, log: [`เดือน ${g.month}/${g.year}: ${changes.filter((c) => c.includes("สัตว์") || c.includes("แพะ") || c.includes("ไก่") || c.includes("คอก") || c.includes("วัว") || c.includes("หมู") || c.includes("โรคในคอก")).join(" · ") || "สัตว์เลี้ยงยังคงอยู่ในค่าย"}`, ...state.log].slice(0, 20) };
  return { game: { ...g, animalState: state, animalAction: "keep" }, changes };
}

function categorizeChanges(changes: string[]) {
  const sections: Record<string, string[]> = { "ผลผลิต": [], "บริโภค/สูญเสีย": [], "คนและสุขภาพ": [], "ความก้าวหน้า": [], "เหตุการณ์อื่น": [] };
  changes.forEach((item) => {
    if (item.includes("ผลิต") || item.includes("ไม้ +") || item.includes("หิน +") || item.includes("ความรู้ +") || item.includes("ฟืน +") || item.includes("น้ำ +") || item.includes("ทอง +") || item.includes("เครื่องมือ +") || item.includes("สมุนไพร +")) sections["ผลผลิต"].push(item);
    else if (item.includes("บริโภค") || item.includes("ใช้") || item.includes("ขาด") || item.includes("เสีย")) sections["บริโภค/สูญเสีย"].push(item);
    else if (item.includes("บาดเจ็บ") || item.includes("โรค") || item.includes("ผู้บาดเจ็บ") || item.includes("ตาย") || item.includes("สุขภาพ")) sections["คนและสุขภาพ"].push(item);
    else if (item.includes("ก่อสร้าง") || item.includes("สร้าง") || item.includes("วิจัย") || item.includes("เสร็จ") || item.includes("ศึกษา")) sections["ความก้าวหน้า"].push(item);
    else sections["เหตุการณ์อื่น"].push(item);
  });
  return Object.entries(sections).filter(([, items]) => items.length > 0);
}
function createInitialGame(setup: { leaderName: string; houseName: string; origin: Origin }): GameState {
  const people = initialPeople(setup.leaderName, setup.houseName, setup.origin);
  const terrain = randomTerrain();
  let metrics: Metrics = { morale: 48, security: 24, trust: 42, health: 54, cohesion: 44, fairness: 46 };
  if (setup.origin === "healer") metrics.health += 8;
  if (setup.origin === "mediator") { metrics.trust += 7; metrics.fairness += 7; }
  if (setup.origin === "hunter") metrics.security += 4;
  const base: GameState = {
    version: GAME_VERSION, leaderName: setup.leaderName, houseName: setup.houseName, origin: setup.origin,
    year: 1, month: 1, stage: "ค่ายพักแรม", resources: applyTerrainResources(baseResources(setup.origin), terrain), resourceHistory: [], buildings: emptyBuildings(), researchDone: emptyResearch(),
    construction: null, pausedConstruction: [], activeResearch: null, pausedResearch: [], labor: emptyLabor(), laborAssignments: {}, terrain, notifications: [],
    leaderFocus: "workWithPeople", leaderActionSelected: false, selectedChoiceId: null, currentEventId: "first_night", pendingEvents: [], delayedEvents: [], recentEventIds: [],
    metrics, people, casualties: [], logs: [], memories: [], rumors: [], leaderTraits: ["ผู้ก่อตั้ง"], milestones: [], flags: {}, threat: 0,
    pathScores: { survival: 0, family: 0, knowledge: 0, trade: 0, fortress: 0, faith: 0 },
    collapse: { hungerMonths: 0, noWorkerMonths: 0, trustCrisisMonths: 0, assaultCrisisMonths: 0 }, gameOver: null,
    lastRisk: { food: 0, shelter: 0, disease: 0, beast: 0, conflict: 0, weather: 0, accident: 0 }, locations: emptyLocations(), exploreTarget: "shallowStream", animalState: emptyAnimalState(), animalAction: "keep", weather: emptyWeatherState(), policies: emptyPolicies(), buildingCondition: {}, crisis: emptyCrisis(), guilds: emptyGuilds(), outposts: [], factions: emptyFactions(), leaderAge: people.find((p) => p.id === "leader")?.age ?? 28, heir: null, summaryModal: null, savedText: "ยังไม่เคยบันทึก",
  };
  return addNotice(addLog(base, "ค่ายแรกถูกตั้งขึ้น", `${setup.leaderName} แห่ง House ${setup.houseName} พาคนสิบชีวิตตั้งกองไฟแรกที่${terrainData[terrain].title} — ${terrainData[terrain].text}`, "milestone", ["เริ่มเกม", "พื้นที่เริ่มต้น"]), { kind: "system", title: `พื้นที่เริ่มต้น: ${terrainData[terrain].title}`, text: terrainData[terrain].text });
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
      choice("sell_surplus", "🪙", "ขายหนังสัตว์และสมุนไพรส่วนเกิน", "เพิ่มคลังเมือง", "เปลี่ยนของมีค่าเป็นทองสำหรับซื้อของในอนาคต", { resources: { hides: -1, herbs: -1, gold: 8 }, metrics: { trust: 1 }, path: { trade: 3 } }, ["หนังสัตว์หนึ่งผืนกับสมุนไพรแห้งถูกวางบนผ้า พ่อค้าชั่งน้ำหนักด้วยสายตาและวางเหรียญลงช้า ๆ", "ทองไม่ได้ทำให้อิ่มท้องในคืนนี้ แต่มันทำให้ค่ายเริ่มมีอำนาจเลือกในวันหน้า"]),
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

  ,
  {
    id: "merchant_arrival", title: "เกวียนพ่อค้าใต้ฝุ่นถนน", category: "การค้า",
    text: "เกวียนไม้เก่าแล่นช้าผ่านแนวหญ้า ชายเจ้าของเกวียนมีเกลือ เมล็ดพันธุ์ เครื่องมือ และยาสมุนไพร เขามองค่ายเล็ก ๆ แล้วถามอย่างสุภาพว่า ‘พวกเจ้ามีอะไรพอจะแลกหรือไม่’",
    condition: (g) => g.stage !== "ค่ายพักแรม" || g.resources.hides >= 3 || g.resources.food > foodNeedFor(g) * 3,
    weight: (g) => 3 + (g.stage !== "ค่ายพักแรม" ? 10 : 0) + (g.labor.trade > 0 ? 8 : 0) + (g.resources.gold > 0 ? 2 : 0),
    choices: [
      choice("sell_surplus_food", "🍲", "ขายอาหารส่วนเกินแลกทอง", "ค้าขาย", "เสียอาหารส่วนหนึ่ง แต่ได้ทองไว้ซื้อของจำเป็นในอนาคต", { resources: { food: -20, gold: 8 }, metrics: { trust: -1 }, path: { trade: 3 } }, ["ถุงอาหารแห้งถูกยกขึ้นเกวียน และทองก้อนเล็ก ๆ ถูกวางลงในมือของคนดูแลคลัง", "ไม่ใช่ทุกคนพอใจที่อาหารถูกขายออกไป แต่ทุกคนเห็นว่าถิ่นฐานเริ่มมีทรัพย์สินของเมืองจริง ๆ"], { addMemory: { title: "การค้าครั้งแรก", text: "อาหารส่วนเกินถูกเปลี่ยนเป็นทอง และค่ายเริ่มเข้าใจภาษาของตลาด", effect: "+เส้นทางการค้าและความหมายของทอง", kind: "lesson" } }),
      choice("buy_tools", "🛠️", "ซื้อเครื่องมือใหม่", "ลงทุน", "ใช้ทองเพื่อเพิ่มเครื่องมือและลดอุบัติเหตุงานหนัก", { resources: { gold: -8, tools: 3 }, metrics: { trust: 2 }, path: { survival: 1, trade: 2 } }, ["เครื่องมือใหม่เงาวับเกินกว่าจะเป็นของค่ายยากจน แต่ด้ามที่แน่นและคมที่ตรงทำให้ช่างยิ้มได้", "ทองหายไปจากคลังเมือง แต่ความมั่นใจของแรงงานกลับคืนมา"]),
      choice("buy_medicine", "🌿", "ซื้อยาและสมุนไพรแห้ง", "ระวังโรค", "ใช้ทองแลกความปลอดภัยด้านสุขภาพ", { resources: { gold: -5, herbs: 6 }, metrics: { health: 4 }, path: { survival: 1 } }, ["ถุงสมุนไพรแห้งถูกเก็บไว้เหนือควันไฟ กลิ่นขมของมันทำให้คนป่วยบางคนหลับได้ลึกขึ้น", "บางครั้งการค้าก็ไม่ได้ซื้อความมั่งคั่ง แต่ซื้อคืนพรุ่งนี้ให้คนป่วย"]),
      choice("refuse_trade", "✋", "ยังไม่เปิดการค้า", "ระมัดระวัง", "ไม่เสียทรัพยากร แต่พ่อค้าอาจจำได้ว่าค่ายนี้ยังไม่พร้อม", { metrics: { security: 1 }, threat: -2 }, ["พ่อค้าพยักหน้าอย่างเข้าใจ เขาขับเกวียนออกไปพร้อมฝุ่นถนนและคำอวยพรสั้น ๆ", "ค่ายยังเก็บของไว้ครบ แต่โอกาสบางอย่างก็ล้อเกวียนจากไปพร้อมเขา"]),
    ],
  },
  {
    id: "wandering_family", title: "ครอบครัวเร่ร่อนขอฝากชีวิต", category: "สังคม",
    text: "พ่อ แม่ และเด็กหนึ่งคนยืนอยู่ริมค่ายพร้อมห่อผ้าเปียกฝน พวกเขาไม่ขอทอง ไม่ขอเกียรติ ขอเพียงที่ให้เด็กนอนโดยไม่กลัวกลางคืน",
    condition: (g) => g.stage !== "ค่ายพักแรม" && shelterCapacity(g) >= alivePeople(g).length,
    weight: (g) => 3 + (g.metrics.trust > 50 ? 6 : 0) + (g.metrics.security > 45 ? 5 : 0),
    choices: [
      choice("accept_family", "🏡", "รับเข้าชุมชนและแบ่งงาน", "เปิดประตู", "เพิ่มประชากรและแรงงาน แต่ใช้เสบียงเพิ่ม", { resources: { food: -8 }, population: 2, metrics: { morale: 5, cohesion: 3 }, path: { family: 3 } }, ["ที่นอนใหม่ถูกจัดใกล้กองไฟ เด็กในค่ายมองเด็กผู้มาใหม่เหมือนเห็นอนาคตที่มีเพื่อนเพิ่ม", "คนเพิ่มหมายถึงปากเพิ่ม แต่ก็หมายถึงมือเพิ่ม และบางเดือนมือเพียงคู่เดียวก็ช่วยเปลี่ยนชะตาได้"]),
      choice("trial_month", "🧑‍🌾", "ให้พักหนึ่งเดือนแลกงาน", "ระมัดระวัง", "ได้แรงงานชั่วคราวและลดความเสี่ยงสังคม", { resources: { food: -4, wood: 6 }, metrics: { trust: 2, fairness: 2 }, path: { survival: 1 } }, ["พวกเขาได้รับที่พักหนึ่งเดือนและขวานหนึ่งด้าม คำสัญญาถูกวางไว้ระหว่างสองฝ่ายเหมือนไม้ท่อนแรกของสะพาน", "ค่ายไม่ได้ปิดประตู แต่ก็ยังขอให้ทุกชีวิตพิสูจน์น้ำหนักของตนเอง"]),
      choice("send_away", "🚪", "ให้เสบียงเล็กน้อยแล้วส่งต่อ", "ปิดประตู", "รักษาทรัพยากรและความปลอดภัย แต่เสียชื่อเสียง", { resources: { food: -3 }, metrics: { morale: -3, trust: -2, security: 2 }, path: { survival: 1 } }, ["เสบียงถูกส่งให้พร้อมคำขอโทษที่เบากว่าฝนบนไหล่ของพวกเขา", "เด็กคนนั้นหันกลับมามองกองไฟครั้งหนึ่ง ก่อนความมืดจะกลืนทั้งครอบครัวไป"]),
    ],
  },
  {
    id: "key_villager_dilemma", title: "คนสำคัญขอพักจากงานหนัก", category: "คนในค่าย",
    text: "หนึ่งในคนที่ทุกคนพึ่งพาเริ่มเงียบลงกว่าปกติ มือยังทำงาน แต่สายตาเหมือนคนที่แบกทั้งเดือนที่ผ่านมาไว้บนบ่า",
    weight: (g) => 4 + (alivePeople(g).some((p) => p.fatigue > 75 && p.age >= 16 && p.alive) ? 10 : 0) + (g.metrics.morale < 45 ? 6 : 0),
    choices: [
      choice("let_rest", "🛌", "ให้คนสำคัญพักและแบ่งงานใหม่", "ดูแลคน", "ลดความเหนื่อย แต่ผลผลิตเดือนนี้อาจช้าลง", { metrics: { morale: 5, health: 3, trust: 3 }, path: { family: 2 } }, ["งานบางอย่างถูกย้ายจากบ่าหนึ่งไปยังหลายมือ กองไฟคืนนั้นเงียบขึ้น แต่ไม่ใช่ความเงียบของความกลัว", "การยอมให้คนพักคือการยอมรับว่าคนไม่ใช่เครื่องมือ"]),
      choice("push_harder", "⛏️", "ขอให้อดทนอีกเดือน", "เร่งงาน", "งานเดินต่อ แต่เพิ่มความเสี่ยงบาดเจ็บและเสียความไว้ใจ", { metrics: { trust: -4, health: -2 }, casualtyChance: 8, risk: { accident: 10, conflict: 6 }, path: { survival: 1 } }, ["คำว่า ‘อีกเดือนเดียว’ ถูกพูดด้วยน้ำเสียงที่พยายามนุ่ม แต่ทุกคนรู้ว่าฤดูยากไม่เคยมีแค่เดือนเดียว", "งานเดินต่อ แต่รอยร้าวในใจคนทำงานก็เดินตามไปด้วย"]),
      choice("honor_publicly", "🕯️", "กล่าวขอบคุณต่อหน้าชุมชน", "ยอมรับคุณค่า", "เพิ่มกำลังใจและความทรงจำ แต่ไม่ได้ลดงานโดยตรง", { metrics: { morale: 6, cohesion: 3 }, path: { family: 1 } }, ["ชื่อของคนผู้นั้นถูกกล่าวต่อหน้ากองไฟ ไม่ใช่ในฐานะมือทำงาน แต่ในฐานะคนที่ค่ายยังมีวันนี้เพราะเขา", "บางครั้งคำขอบคุณไม่ซ่อมแผลบนมือ แต่ช่วยให้คนยังยกมือนั้นขึ้นอีกครั้ง"], { addMemory: { title: "ชื่อที่ถูกกล่าวต่อหน้ากองไฟ", text: "ชุมชนเรียนรู้ว่าคนสำคัญควรถูกเห็นก่อนวันที่เขาล้มลง", effect: "+ขวัญกำลังใจเมื่อคนในค่ายได้รับการยอมรับ", kind: "pride" } }),
    ],
  }
,
  {
    id: "merchant_price_surge", title: "พ่อค้าขึ้นราคาก่อนฤดูหนาว", category: "การค้า",
    text: "พ่อค้าเร่บอกว่าถนนทางเหนือเริ่มมีหิมะและโจรดักปล้น ของจำเป็นจึงแพงขึ้น แต่เขายังยอมรับหนังสัตว์กับสมุนไพรเป็นค่าของ",
    condition: (g) => g.stage !== "ค่ายพักแรม" || g.resources.gold > 0,
    weight: (g) => (seasonOf(g.month) === "ฤดูหนาว" ? 12 : 5) + (g.resources.gold > 5 ? 5 : 0),
    choices: [
      choice("buy_food_expensive", "🥖", "ซื้ออาหารฉุกเฉินแม้ราคาแพง", "เอาชีวิตรอด", "ใช้ทองเพื่อกันอดอาหาร", { resources: { gold: -8, food: 15 }, metrics: { morale: 2 }, path: { survival: 2 } }, ["ทองที่สะสมไว้ถูกวางลงบนผ้า พ่อค้าไม่ได้ต่อรองมากนัก เพราะเขารู้ว่าคนหิวไม่มีเวลาต่อราคา", "อาหารที่ได้ไม่มาก แต่พอให้หม้อซุปเดือดต่ออีกหลายคืน"]),
      choice("sell_herbs_high", "🍃", "ขายสมุนไพรในราคาดี", "การค้า", "ได้ทอง แต่ลดของรักษา", { resources: { herbs: -3, gold: 9 }, metrics: { trust: 1 }, path: { trade: 3 } }, ["สมุนไพรแห้งถูกมัดเป็นกำเล็ก ๆ พ่อค้ารับไปด้วยสีหน้าพอใจ", "ค่ายมีทองมากขึ้น แต่หมอยามองถุงยาที่เบาลงอย่างเงียบ ๆ"]),
      choice("learn_route", "🗺️", "ซื้อข่าวเส้นทางแทนของใช้", "ข้อมูล", "ใช้ทองเล็กน้อย ลดภัยและเปิดข่าวลือ", { resources: { gold: -4, knowledge: 4 }, metrics: { security: 2 }, threat: -4, path: { knowledge: 2 } }, ["แผนที่หยาบบนหนังเก่าดูเหมือนรอยขีดข่วนมากกว่าทางเดิน แต่บางครั้งรอยขีดก็ช่วยให้คนไม่ตาย", "เวรยามเริ่มรู้ว่าควันไฟของค่ายมองเห็นได้จากเนินใด"]),
    ],
  },
  {
    id: "winter_raider_warning", title: "ข่าวลือโจรหน้าหนาว", category: "ภัยมนุษย์",
    text: "คนเดินทางกระซิบว่าโจรป่าจะออกหาเสบียงก่อนหิมะหนา พวกเขาไม่โจมตีค่ายที่แข็งแรง แต่ชอบค่ายที่มีอาหารและเวรยามน้อย",
    weight: (g) => (seasonOf(g.month) === "ฤดูใบไม้ร่วง" || seasonOf(g.month) === "ฤดูหนาว" ? 14 : 4) + (g.threat > 45 ? 9 : 0),
    choices: [
      choice("hide_supplies", "📦", "ซ่อนเสบียงและเครื่องมือสำคัญ", "ป้องกัน", "ลดความเสียหายจากโจร แต่ใช้แรงและทำให้คนกังวล", { metrics: { security: 4, morale: -1 }, threat: -5, path: { fortress: 2 } }, ["ถุงอาหารบางส่วนถูกย้ายไปใต้พื้นไม้และหลังกองหิน ไม่มีใครพูดเสียงดังเรื่องที่ซ่อน", "การซ่อนของทำให้ค่ายดูยากจนลง และบางครั้งความยากจนก็เป็นเกราะที่ดี"]),
      choice("train_all", "🛡️", "ฝึกทุกคนให้รู้จุดหลบภัย", "ระเบียบ", "เพิ่มความปลอดภัยและลดความตื่นตระหนก", { metrics: { security: 6, cohesion: 3 }, resources: { wood: -2 }, threat: -3, path: { fortress: 3 } }, ["เด็ก ๆ ถูกสอนให้วิ่งไปหลังเนิน ส่วนผู้ใหญ่จำเสียงเคาะไม้สามครั้งเป็นสัญญาณภัย", "ความกลัวไม่ได้หายไป แต่ความกลัวที่มีแผนย่อมเบากว่าความกลัวที่ไร้ทางออก"]),
      choice("ignore_raider_rumor", "🚫", "ไม่ทำอะไรจนกว่าจะเห็นภัยจริง", "ประหยัดแรง", "ไม่เสียทรัพยากร แต่ภัยเพิ่ม", { metrics: { trust: -2 }, threat: 8, risk: { conflict: 3 } }, ["บางคนโล่งใจที่ไม่ต้องเพิ่มงาน แต่บางคนกลับนอนไม่เต็มตา", "ข่าวลือถูกปล่อยให้ไหลผ่านค่ายเหมือนลมเย็นที่ไม่มีใครปิดช่องผนัง"]),
    ],
  },
  {
    id: "gifted_child", title: "เด็กคนหนึ่งจำตัวเลขเสบียงได้หมด", category: "คนในค่าย",
    text: "เด็กที่ปกติช่วยขนฟืนกลับท่องจำนวนอาหาร น้ำ และเครื่องมือได้อย่างแม่นยำ ผู้จดจำในค่ายบอกว่าเด็กคนนี้อาจเหมาะกับการเรียนรู้มากกว่างานแบกของ",
    weight: (g) => childrenCount(g) > 0 ? 8 + (g.researchDone.storyRecords ? 6 : 0) : 0,
    choices: [
      choice("teach_child", "📜", "ให้ผู้จดจำสอนเด็กคนนี้", "อนาคต", "เพิ่มความรู้และความหวังระยะยาว", { resources: { knowledge: 8 }, metrics: { morale: 3, cohesion: 2 }, path: { knowledge: 3 } }, ["เด็กคนนั้นนั่งข้างผู้จดจำและลากเส้นบนดินแทนตัวเลขในคลัง", "บางครั้งอนาคตไม่ได้เริ่มจากบ้านหลังใหญ่ แต่เริ่มจากเด็กคนหนึ่งที่จำได้ว่าเมื่อวานเรามีอะไรเหลืออยู่บ้าง"]),
      choice("keep_child_chores", "🪵", "ให้เด็กช่วยงานเบาตามเดิม", "จำเป็น", "ได้ฟืนและไม่เสียแรงสอน", { resources: { fuel: 3 }, metrics: { trust: -1 }, path: { survival: 1 } }, ["เด็กยังถือฟืนเล็ก ๆ กลับมาที่กองไฟเหมือนเดิม", "บางครั้งความอยู่รอดวันนี้บังคับให้ความหวังวันหน้ารออยู่หลังควันไฟ"]),
      choice("record_child_name", "🕯️", "บันทึกชื่อเด็กไว้ในพงศาวดาร", "ความทรงจำ", "เพิ่มความหวังและเปิดความทรงจำ", { metrics: { morale: 2, cohesion: 2 }, path: { family: 2 } }, ["ชื่อของเด็กถูกเขียนลงในบันทึกแรก ๆ ของค่าย", "การถูกจดจำก่อนโตเป็นผู้ใหญ่ ทำให้เด็กคนนั้นนั่งตัวตรงขึ้นเล็กน้อยในคืนถัดมา"], { addMemory: { title: "เด็กที่จำคลังได้", text: "ค่ายเริ่มมองเด็กไม่ใช่แค่ปากท้อง แต่เป็นความสามารถที่ยังรอเวลาเติบโต", effect: "+ขวัญกำลังใจเมื่อมีงานสอนเด็ก", kind: "pride" } }),
    ],
  }
,
  {
    id: "supply_theft", title: "เสบียงหายจากคลังกลางคืน", category: "อาชญากรรม / ความยุติธรรม",
    text: "เช้าตรู่ คนดูแลคลังพบถุงอาหารฉีกออกและรอยเท้าเล็ก ๆ วนอยู่หลังที่พัก ไม่มีศัตรูบุก ไม่มีสัตว์ป่า มีเพียงคำถามหนัก ๆ ว่าใครในค่ายเป็นคนหยิบเสบียงไป",
    condition: (g) => g.resources.food > foodNeedFor(g) * 0.8 && alivePeople(g).length >= 8,
    weight: (g) => 4 + (g.metrics.fairness < 50 ? 10 : 0) + (g.metrics.trust < 45 ? 8 : 0) + (g.resources.food < foodNeedFor(g) * 1.5 ? 6 : 0),
    choices: [
      choice("investigate_theft", "🔎", "ตรวจคลังและสอบถามอย่างเป็นธรรม", "ยุติธรรม", "ใช้เวลาและความอดทน แต่ลดการลงโทษผิดคน", { resources: { food: -3 }, metrics: { fairness: 6, trust: 3, security: 2 }, path: { knowledge: 1 } }, ["ผู้นำให้ทุกคนพูดต่อหน้ากองไฟทีละคน ไม่มีการตะคอก ไม่มีการลากตัวใครออกมากลางลาน", "สุดท้ายพบว่าเสบียงบางส่วนถูกเด็กสองคนหยิบไปให้ผู้ป่วยที่กลัวถูกตัดส่วนแบ่ง ความผิดยังเป็นความผิด แต่สาเหตุของมันทำให้กฎต้องถูกเขียนใหม่"], { addMemory: { title: "คดีเสบียงคืนฝน", text: "ผู้นำเลือกค้นหาความจริงก่อนลงโทษ และค่ายได้เรียนรู้ว่าความหิวมักซ่อนอยู่หลังการขโมย", effect: "+ความยุติธรรมและความไว้ใจ", kind: "lesson" } }),
      choice("confine_thief", "⛓️", "ขังผู้ต้องสงสัยและให้ทำงานชดใช้", "เข้มงวด", "ลดการขโมยซ้ำ แต่ทำให้คนบางส่วนกลัวผู้นำ", { metrics: { security: 7, fairness: -2, trust: -3 }, threat: -2, path: { fortress: 2 } }, ["ผู้ต้องสงสัยถูกให้อยู่ใกล้กองไฟและถูกห้ามแตะคลัง เสียงซุบซิบลดลง แต่สายตาหลายคู่เริ่มหลบผู้นำ", "ค่ายปลอดภัยขึ้นในทางหนึ่ง และแข็งกระด้างขึ้นอีกทางหนึ่ง"]),
      choice("exile_thief", "🚪", "เนรเทศเพื่อให้เป็นตัวอย่าง", "เด็ดขาด", "ทรัพยากรปลอดภัยขึ้น แต่ความเมตตาของค่ายถูกตั้งคำถาม", { resources: { food: 2 }, metrics: { security: 9, morale: -6, cohesion: -5, fairness: -4 }, threat: -4, path: { fortress: 3 } }, ["คนผู้นั้นถูกส่งออกนอกค่ายพร้อมถุงอาหารเล็กน้อย ไม่มีใครส่งเสียงเชียร์ ไม่มีใครกล้าคัดค้าน", "คืนนี้เสบียงปลอดภัยขึ้น แต่บางคนตื่นขึ้นมากลางดึกเพราะนึกถึงเงาคนที่หายไปในป่า"], { addMemory: { title: "การเนรเทศครั้งแรก", text: "บทลงโทษหนักช่วยหยุดความกลัวเรื่องคลัง แต่ทิ้งคำถามว่าความอยู่รอดควรแลกด้วยอะไร", effect: "+ความปลอดภัย -ขวัญกำลังใจ", kind: "trauma" } }),
      choice("forgive_and_reform", "🤝", "ให้อภัยแต่ตั้งกฎแบ่งเสบียงใหม่", "เมตตา", "ฟื้นความไว้ใจ แต่ถ้าค่ายยังหิวอาจถูกมองว่าอ่อนแอ", { resources: { food: -5, knowledge: 3 }, metrics: { trust: 6, morale: 3, fairness: 4, security: -2 }, path: { family: 2 } }, ["ผู้นำไม่ลบความผิด แต่ไม่ทำให้คนผิดหายไปจากค่าย กฎใหม่ถูกตั้งขึ้น: เด็ก ผู้ป่วย และคนทำงานหนักจะมีส่วนแบ่งที่ชัดเจน", "บางคนมองว่านี่คือความอ่อนแอ บางคนมองว่านี่คือเหตุผลที่ยังเรียกที่นี่ว่าบ้าน"]),
    ],
  },
  {
    id: "migrant_group", title: "กลุ่มผู้ลี้ภัยมาถึงริมค่าย", category: "อพยพ / คัดเลือกคนเข้าเมือง",
    text: "ผู้คนเปียกฝนกลุ่มหนึ่งยืนรออยู่นอกแนวค่าย บางคนถือเครื่องมือ บางคนจูงเด็ก บางคนไอจนต้องพิงไหล่คนข้าง ๆ พวกเขาขอไม่มาก ขอเพียงโอกาสให้ชีวิตเดินต่อ",
    condition: (g) => g.stage !== "ค่ายพักแรม" || g.metrics.trust >= 55,
    weight: (g) => 5 + (g.stage !== "ค่ายพักแรม" ? 9 : 0) + (g.metrics.morale > 50 ? 4 : 0) + (shelterCapacity(g) > alivePeople(g).length ? 5 : 0),
    choices: [
      choice("accept_selected_migrants", "✅", "รับเฉพาะรายชื่อที่เลือก", "คัดทีละคน", "เลือกจากหน้าต่างรายชื่อ ค่าอาหาร น้ำ และความเสี่ยงจะคำนวณจากตัวคนจริง", { metrics: { trust: 1, fairness: 1 }, path: { survival: 1, family: 1 } }, ["ผู้นำไม่ตอบด้วยคำว่าทั้งหมดหรือไม่มีใคร แต่เดินดูใบหน้าและถามชื่อทีละคน", "บางประตูเปิด บางประตูยังปิด และทุกชื่อที่เลือกจะกลายเป็นภาระกับความหวังของค่าย"]),
      choice("accept_skilled_migrants", "🧰", "คัดรับเฉพาะคนมีทักษะและสุขภาพพร้อม", "คัดเลือก", "เพิ่มแรงงานคุณภาพ แต่สร้างบาดแผลให้คนที่ถูกปฏิเสธ", { metrics: { security: 2, fairness: -2, morale: 1 }, path: { survival: 2 } }, ["ผู้มีเครื่องมือและแรงพอทำงานถูกเชิญเข้ามา คนที่เหลือได้รับเสบียงเล็กน้อยก่อนเดินต่อ", "ถิ่นฐานได้มือใหม่ที่จำเป็น แต่เสียงเด็กที่ต้องเดินจากไปยังค้างอยู่ในความทรงจำของบางคน"]),
      choice("accept_all_migrants", "🏡", "รับทุกคนเข้ามาในค่าย", "เมตตาใหญ่", "ประชากรเพิ่มมาก แต่ภาระอาหาร น้ำ และที่พักจะหนักขึ้นทันที", { metrics: { morale: 6, trust: 5, security: -3 }, risk: { disease: 5, conflict: 5 }, path: { family: 4 } }, ["ที่นอนใหม่ถูกปูจนแนวค่ายดูแคบลงในคืนเดียว หม้อซุปถูกเติมน้ำมากกว่าเดิม แต่ไม่มีใครถูกทิ้งไว้ใต้ฝน", "ค่ายเติบโตขึ้นอย่างรวดเร็ว และทุกการเติบโตย่อมพาทั้งมือใหม่ ปากใหม่ เรื่องใหม่ และปัญหาใหม่เข้ามาด้วย"]),
      choice("accept_children_healer", "🌿", "รับเด็กและผู้รักษาไว้ก่อน", "คุ้มครอง", "เพิ่มภาระระยะสั้น แต่ได้ความหวังและการรักษา", { resources: { herbs: 2 }, metrics: { health: 4, morale: 4, fairness: 3 }, path: { family: 3 } }, ["เด็กถูกพาไปใกล้กองไฟ ส่วนผู้รักษาช่วยตรวจแผลคนในค่ายทันที", "มือทำงานอาจเพิ่มไม่มาก แต่ความหมายของคำว่าเมืองเริ่มเปลี่ยน: ไม่ใช่ที่ที่รับเฉพาะคนแข็งแรงเท่านั้น"]),
      choice("turn_migrants_away", "🚫", "ปฏิเสธและให้เสบียงเดินทางต่อ", "ป้องกันตนเอง", "รักษาทรัพยากร แต่ลดชื่อเสียงและความเชื่อใจ", { resources: { food: -3 }, metrics: { morale: -4, trust: -3, fairness: -2, security: 2 }, threat: 2, path: { fortress: 1 } }, ["ถุงอาหารเล็ก ๆ ถูกส่งออกไปแทนคำว่าเชิญเข้ามา ไม่มีใครในค่ายพูดมากนักหลังจากนั้น", "บางครั้งการปกป้องคนของเรา คือการทำให้คนอื่นต้องเดินต่อไปในความมืด"]),
    ],
  },
  {
    id: "stray_goats_found", title: "แพะหลงเข้ามาใกล้ค่าย", category: "สัตว์เลี้ยง",
    text: "รอยเท้าเล็ก ๆ ปรากฏใกล้ลำธาร ก่อนที่คนตักน้ำจะพบแพะสองตัวผอม ๆ กำลังเล็มหญ้าริมพุ่มไม้ มันอาจเป็นโอกาสเริ่มเลี้ยงสัตว์ หรือเป็นภาระอาหารใหม่ของค่าย",
    condition: (g) => animalCount(g) === 0 && (g.researchDone.animalKeeping || g.stage !== "ค่ายพักแรม" || g.month >= 3),
    weight: (g) => animalCount(g) === 0 ? 10 + (g.researchDone.animalKeeping ? 12 : 0) : 0,
    choices: [
      choice("keep_goats", "🐐", "จับมาเลี้ยงอย่างระมัดระวัง", "โอกาส", "ได้แพะ 2 ตัว แต่ต้องเตรียมอาหารและคอกในอนาคต", { metrics: { morale: 2 }, path: { survival: 2 } }, ["เชือกหยาบถูกถักจากเศษเส้นใย แพะสองตัวถูกพามาใกล้กองไฟ เด็ก ๆ ดีใจ แต่ผู้ใหญ่รู้ดีว่าทุกปากที่เพิ่มขึ้นไม่ได้มีเพียงคนเท่านั้น" ]),
      choice("hunt_goats", "🍖", "ฆ่าเพื่อทำเป็นอาหารทันที", "เอาตัวรอด", "ได้อาหารมากทันที แต่พลาดโอกาสเลี้ยงระยะยาว", { resources: { food: 24, hides: 1 }, metrics: { morale: -1 }, path: { survival: 2 } }, ["แพะไม่กลายเป็นฝูงแรกของค่าย แต่กลายเป็นหม้ออาหารที่ช่วยให้เด็ก ๆ อิ่มในคืนนั้น บางคนไม่พูดถึงมันอีก" ]),
      choice("let_go", "🌿", "ปล่อยมันไป", "เมตตา", "ไม่เพิ่มภาระอาหาร แต่ไม่ได้ทรัพยากร", { metrics: { morale: 1, cohesion: 1 }, path: { family: 1 } }, ["แพะสองตัวหายกลับเข้าแนวหญ้า ไม่มีใครได้อาหารเพิ่ม แต่เด็กบางคนยิ้มเมื่อเห็นมันยังวิ่งได้" ]),
    ],
  },
  {
    id: "animal_thief", title: "รอยเท้าคนนอกใกล้คอกสัตว์", category: "สัตว์เลี้ยง / ภัยภายนอก",
    text: "เช้านี้มีรอยเท้าคนไม่คุ้นใกล้บริเวณที่ผูกสัตว์ไว้ เชือกเส้นหนึ่งถูกคลายออกอย่างตั้งใจ ไม่ใช่ฝีมือสัตว์ป่า",
    condition: (g) => animalCount(g) > 0,
    weight: (g) => animalCount(g) > 0 ? 6 + Math.floor(g.threat / 10) - g.buildings.animalPen * 4 : 0,
    choices: [
      choice("guard_animals", "🛡️", "เพิ่มเวรยามรอบคอก", "ป้องกัน", "ลดโอกาสสัตว์ถูกขโมย แต่กินแรงงานและความเหนื่อย", { metrics: { security: 5, morale: -1 }, threat: -4, path: { fortress: 2 } }, ["คืนต่อมาเวรยามยืนใกล้คอกมากขึ้น เสียงไก่และแพะกลายเป็นเสียงที่ต้องปกป้องเหมือนคลังอาหาร" ]),
      choice("move_animals", "🐐", "ย้ายสัตว์เข้ามาใกล้ที่พัก", "เสี่ยงน้อยลง", "ลดขโมยแต่เพิ่มกลิ่น โรค และความรำคาญ", { metrics: { security: 3, health: -2, morale: -1 }, threat: -2 }, ["สัตว์ถูกย้ายเข้ามาใกล้คนมากขึ้น กลิ่นและเสียงทำให้หลายคนบ่น แต่ไม่มีใครอยากตื่นมาแล้วพบเชือกว่างเปล่า" ]),
      choice("ignore_tracks", "👁️", "เชื่อว่าเป็นแค่คนผ่านทาง", "ประหยัดแรง", "ไม่เสียแรงงาน แต่เพิ่มความเสี่ยงถูกขโมย", { metrics: { security: -4 }, threat: 5, risk: { conflict: 6 } }, ["รอยเท้าถูกปล่อยให้ฝุ่นกลบ บางคนพยักหน้า บางคนเก็บมีดไว้ใกล้ตัวมากขึ้น" ]),
    ],
  }

,

  {
    id: "wild_chickens_near_grain", title: "ไก่ป่าคุ้ยเศษเมล็ดใกล้ค่าย", category: "สัตว์เลี้ยง / โอกาส",
    text: "เช้าวันหนึ่ง เด็ก ๆ เห็นไก่ป่ากลุ่มเล็กคุ้ยเศษอาหารใกล้คลัง พวกมันยังไม่ใช่ของค่าย แต่ถ้าจับอย่างใจเย็น อาจกลายเป็นอาหารระยะยาวได้",
    condition: (g) => g.researchDone.animalKeeping || g.buildings.animalPen > 0 || normalizeLocations(g.locations).huntingGround.progress >= 45,
    weight: (g) => 4 + (animalCount(g) === 0 ? 10 : 0) + (g.resources.food > foodNeedFor(g) ? 3 : 0),
    choices: [
      choice("take_wild_chickens", "🐔", "จับอย่างใจเย็นและทำรังชั่วคราว", "เลี้ยงระยะยาว", "ได้ไก่ 3 ตัว แต่ต้องเริ่มคิดเรื่องอาหารสัตว์", { resources: { food: -2, wood: -2 }, metrics: { morale: 2 }, path: { survival: 1 } }, ["คนในค่ายใช้ตะกร้าเก่าและเศษผ้าล้อมไก่อย่างไม่รีบ", "มันไม่ใช่ชัยชนะใหญ่ แต่เสียงไก่ในคอกทำให้เช้าวันถัดไปฟังดูเหมือนถิ่นฐานมากขึ้น"]),
      choice("eat_chickens_now", "🍗", "จับมาทำอาหารทันที", "เอาตัวรอด", "ได้อาหารทันทีแต่เสียโอกาสสร้างฝูง", { resources: { food: 10 }, metrics: { morale: 1 }, path: { survival: 1 } }, ["ไก่ป่าถูกจับและลงหม้อก่อนฟ้ามืด ทุกคนอิ่มขึ้นในคืนนี้", "แต่พรุ่งนี้ค่ายยังไม่มีเสียงไก่ ไม่มีไข่ และไม่มีฝูงที่จะโตต่อ"]),
      choice("leave_chickens", "🌿", "ปล่อยให้มันกลับมาเองอีกครั้ง", "ระวัง", "ไม่เสี่ยงแรงงาน แต่ได้เพียงข่าวลือ", { metrics: { trust: 1 }, path: { faith: 1 } }, ["เด็ก ๆ ถูกห้ามไล่จับ พวกเขานั่งดูไก่คุ้ยดินอยู่ไกล ๆ", "บางโอกาสไม่จำเป็นต้องถูกคว้าในวันแรก มันอาจกลับมาเมื่อค่ายพร้อมกว่า"], { addPending: "wild_chickens_near_grain" }),
    ],
  },
  {
    id: "thin_cow_on_old_road", title: "วัวผอมบนถนนเก่า", category: "สัตว์เลี้ยง / ทางค้า",
    text: "ใกล้ถนนการค้าเก่า มีวัวผอมตัวหนึ่งเดินลากเชือกขาดตามหญ้าแห้ง มันอ่อนแรงและกินมาก แต่ถ้ารอด อาจเป็นจุดเริ่มของฝูงใหญ่ในอนาคต",
    condition: (g) => normalizeLocations(g.locations).oldTradeRoad.discovered || g.stage !== "ค่ายพักแรม",
    weight: (g) => 3 + (normalizeLocations(g.locations).oldTradeRoad.progress >= 40 ? 7 : 0) + (g.researchDone.animalKeeping ? 5 : -2),
    choices: [
      choice("rescue_cow", "🐄", "รับวัวไว้และแบ่งน้ำให้มัน", "ลงทุนอนาคต", "เพิ่มวัว 1 ตัว แต่ใช้อาหารและน้ำทันที", { resources: { water: -4, food: -4 }, metrics: { morale: 3, health: -1 }, path: { family: 1, survival: 1 } }, ["วัวถูกพากลับค่ายอย่างช้า ๆ เด็กบางคนตั้งชื่อให้มันก่อนผู้ใหญ่จะตกลงกันเสียอีก", "ภาระใหม่เดินเข้าค่ายพร้อมความหวังใหม่ และทั้งสองอย่างกินอาหารเหมือนกัน"]),
      choice("trade_for_rope", "🪙", "ขายเชือกและหนังเก่าที่ติดมากับมัน", "ระยะสั้น", "ได้ทองเล็กน้อยแต่ปล่อยวัวไป", { resources: { gold: 5 }, metrics: { morale: -1 }, path: { trade: 1 } }, ["เชือกเก่าและปลอกคอหนังถูกเก็บไว้ ส่วนวัวถูกปล่อยให้เดินต่อ", "ทองกระทบมือเบา ๆ แต่เสียงหายใจของสัตว์ผอมยังตามบางคนกลับถึงกองไฟ"]),
      choice("drive_away_cow", "🚧", "ไล่ออกไปเพราะค่ายยังไม่พร้อม", "ป้องกันภาระ", "ลดภาระอาหาร แต่ความเมตตาถูกทดสอบ", { metrics: { trust: -1, fairness: -1 }, path: { survival: 1 } }, ["คนในค่ายตีไม้กับพื้นให้วัวเดินห่างออกไป", "ไม่มีใครอดเพราะมันในเดือนนี้ แต่หลายคนรู้ว่าการปฏิเสธภาระก็ทิ้งน้ำหนักไว้ในใจ"]),
    ],
  },
  {
    id: "piglets_in_marsh", title: "ลูกหมูหลงในบึงตื้น", category: "สัตว์เลี้ยง / บึง",
    text: "คนเก็บสมุนไพรได้ยินเสียงร้องแหลมจากกอหญ้าชื้น ลูกหมูสองตัวติดโคลนอยู่ไม่ไกล พวกมันเลี้ยงง่ายกว่าวัว แต่ถ้าอาหารขาด พวกมันจะกลายเป็นปัญหาเร็วมาก",
    condition: (g) => normalizeLocations(g.locations).marshPools.discovered || g.researchDone.animalKeeping,
    weight: (g) => 4 + (normalizeLocations(g.locations).marshPools.progress >= 30 ? 8 : 0),
    choices: [
      choice("accept_piglets", "🐖", "ช่วยลูกหมูและทำคอกเล็ก", "เลี้ยงระยะกลาง", "เพิ่มหมู 2 ตัว ใช้ไม้และอาหารเล็กน้อย", { resources: { wood: -3, food: -3 }, metrics: { morale: 2 }, path: { survival: 1 } }, ["ลูกหมูถูกล้างโคลนด้วยน้ำที่มีน้อยเกินกว่าจะทำอย่างสบายใจ", "เสียงร้องของมันรบกวนค่ายทั้งคืน แต่รุ่งเช้าเด็ก ๆ ยิ้มเมื่อเห็นมันยังมีชีวิต"]),
      choice("slaughter_piglets", "🍖", "ใช้เป็นอาหารทันที", "จำเป็น", "ได้อาหารทันที แต่เสียโอกาสขยายฝูง", { resources: { food: 8 }, metrics: { morale: -1 }, path: { survival: 1 } }, ["ไม่มีใครพูดมากตอนหม้อถูกตั้ง เด็ก ๆ ถูกพาไปอีกด้านของกองไฟ", "อาหารเพิ่มขึ้น แต่ความเงียบหลังกินเสร็จอยู่กับค่ายนานกว่ากลิ่นซุป"]),
      choice("leave_marsh", "🪷", "ปล่อยไว้และถอยจากบึง", "ปลอดภัย", "ไม่รับภาระและลดโรคเล็กน้อย", { metrics: { health: 1 }, path: { survival: 1 } }, ["คนเก็บสมุนไพรเดินกลับโดยไม่อุ้มอะไรมา นอกจากเรื่องเล่าที่ทำให้ค่ายรู้ว่าบึงมีชีวิตมากกว่าที่เห็น", "บางครั้งการไม่แตะต้อง คือวิธีลดโรคที่ดีที่สุด"]),
    ],
  },
  {
    id: "guard_dog_at_night", title: "สุนัขเร่ร่อนเฝ้าขอบค่าย", category: "สัตว์เลี้ยง / ความปลอดภัย",
    text: "กลางดึก สุนัขผอมตัวหนึ่งเห่าใส่เงาในพุ่มไม้ก่อนวิ่งวนรอบค่าย มันอาจกินอาหารเพิ่ม แต่จมูกและเสียงเห่าของมันมีค่ามากในคืนมืด",
    condition: (g) => g.metrics.security < 55 || g.threat > 35 || normalizeLocations(g.locations).deepWoods.discovered,
    weight: (g) => 5 + (normalizeAnimalState(g.animalState).animals.dogs === 0 ? 6 : 0) + (g.threat > 40 ? 6 : 0),
    choices: [
      choice("keep_guard_dog", "🐕", "ให้อาหารและรับไว้เฝ้าค่าย", "ป้องกัน", "เพิ่มสุนัข 1 ตัวและความปลอดภัย แต่ต้องเลี้ยงต่อ", { resources: { food: -2 }, metrics: { security: 4, morale: 1 }, path: { fortress: 1 } }, ["สุนัขกินอย่างระแวงอยู่ข้างกองไฟ ก่อนจะนอนหันหน้าไปทางป่า", "ไม่มีใครแต่งตั้งมันเป็นเวรยาม แต่คืนนั้นหลายคนหลับลึกขึ้น"]),
      choice("drive_dog", "🚧", "ไล่มันออกไปเพราะอาหารไม่พอ", "ประหยัด", "ไม่เสียอาหาร แต่ลดโอกาสเตือนภัย", { metrics: { morale: -1, security: -1 }, path: { survival: 1 } }, ["ไม้ถูกเคาะกับพื้นจนสุนัขถอยห่าง มันยังมองกองไฟอยู่ครู่หนึ่งก่อนหายไปในหญ้า", "อาหารยังอยู่เท่าเดิม แต่ความมืดดูเงียบผิดปกติ"]),
      choice("follow_bark", "🧭", "ตามเสียงเห่าดูว่าเจออะไร", "เสี่ยง", "อาจได้เบาะแสภัย แต่เสี่ยงบาดเจ็บ", { resources: { knowledge: 5 }, metrics: { security: 2 }, casualtyChance: 6, risk: { beast: 8, accident: 5 }, path: { knowledge: 1 } }, ["คนสองคนตามสุนัขไปจนเห็นรอยเท้าคนแปลกหน้าข้างพุ่มไม้", "เสียงเห่าไม่ได้เป็นแค่เสียงสัตว์ มันเป็นข่าวสารที่มีฟันและจมูก"]),
    ],
  },
  {
    id: "restless_livestock", title: "ฝูงสัตว์กระวนกระวายในคืนชื้น", category: "สัตว์เลี้ยง / โรค",
    text: "สัตว์ในคอกไม่ยอมนอน ไก่เกาะรวมกัน แพะถูเชือกจนหนังแดง และกลิ่นชื้นในคอกทำให้คนเลี้ยงสัตว์ขมวดคิ้ว",
    condition: (g) => animalCount(g) > 0,
    weight: (g) => 5 + (normalizeAnimalState(g.animalState).hunger > 45 ? 8 : 0) + (seasonOf(g.month) === "ฤดูฝน" ? 8 : 0) + (g.buildings.livestockShed > 0 ? -4 : 0),
    choices: [
      choice("clean_pen", "🧹", "ทำความสะอาดคอกและย้ายฟางเปียก", "ดูแล", "ใช้แรงและฟืนเล็กน้อย ลดโรคสัตว์", { resources: { fuel: -2 }, metrics: { health: 3, morale: 1 }, path: { survival: 1 } }, ["ฟางเปียกถูกลากออกนอกค่าย มือของคนเลี้ยงเหม็นและเหนื่อย แต่สัตว์เริ่มสงบลง", "คอกที่สะอาดไม่ได้ทำให้ฝูงโตทันที แต่มันป้องกันความตายที่มักมาเงียบ ๆ"]),
      choice("ignore_pen", "🌧️", "ปล่อยไว้เพราะคนมีงานมากกว่า", "เสี่ยง", "ประหยัดแรง แต่เพิ่มโรคสัตว์และกลิ่นคอก", { metrics: { health: -3, morale: -1 }, risk: { disease: 10 } }, ["คนเลี้ยงสัตว์มองคอกแล้วเดินต่อไปยังงานที่ดูเร่งกว่า", "ปัญหาบางอย่างไม่ตะโกนทันที มันสะสมกลิ่นก่อนสะสมศพ"]),
      choice("build_dry_corner", "🪵", "กั้นมุมแห้งชั่วคราวในคอก", "ปรับปรุง", "ใช้ไม้แต่ลดปัญหาซ้ำ", { resources: { wood: -5, knowledge: 2 }, metrics: { health: 2 }, path: { knowledge: 1 } }, ["ไม้สั้น ๆ ถูกตอกเป็นมุมยกพื้น สัตว์ตัวเล็กเริ่มแย่งกันนอนตรงที่แห้งกว่า", "นี่ไม่ใช่โรงเรือนที่ดี แต่เป็นบทแรกของการเลี้ยงสัตว์อย่างจริงจัง"]),
    ],
  },
  {
    id: "research_crossroad", title: "ความรู้สองทางบนโต๊ะเดียว", category: "วิจัย / การตัดสินใจ",
    text: "ผู้จดจำและช่างไม้เถียงกันเบา ๆ ว่าเดือนนี้ควรเรียนรู้เรื่องบ้านที่แห้งขึ้น หรือเครื่องมือที่ปลอดภัยขึ้น คนทั้งค่ายรอฟังว่าผู้นำจะให้ความสำคัญกับอะไร",
    condition: (g) => g.activeResearch !== null || g.labor.research > 0 || g.resources.knowledge >= 20,
    weight: (g) => 4 + (g.labor.research > 0 ? 5 : 0) + (g.researchDone.projectPlanning ? -3 : 0),
    choices: [
      choice("focus_shelter_notes", "🛖", "ให้จดบทเรียนเรื่องที่พักและควัน", "สุขภาพ", "เพิ่มความรู้และลดโรคเล็กน้อย", { resources: { knowledge: 8 }, metrics: { health: 2 }, path: { knowledge: 2 } }, ["ผู้เฒ่าวาดภาพควันวนใต้ผ้าใบด้วยกิ่งถ่านบนหินแบน", "ไม่มีใครเรียกมันว่าตำรา แต่ค่ายเริ่มมีความรู้ที่ส่งต่อได้"]),
      choice("focus_tools_notes", "⚒️", "ให้ช่างสอนเรื่องแรง เครื่องมือ และฐานราก", "งานช่าง", "เพิ่มความรู้และลดอุบัติเหตุ", { resources: { knowledge: 7 }, metrics: { trust: 1 }, risk: { accident: -6 }, path: { knowledge: 2 } }, ["ช่างไม้สอนว่าของที่หักมักเตือนก่อนเสมอ ถ้ามีคนฟังเป็น", "บทเรียนนั้นอาจช่วยให้เดือนหน้าไม่มีมือใครถูกด้ามขวานบาด"]),
      choice("let_people_rest_study", "🛌", "พักงานหนักครึ่งวันเพื่อให้คนเรียนรู้จริง", "ช้าแต่ลึก", "ลดความล้าแต่ผลผลิตบางอย่างไม่พุ่ง", { metrics: { morale: 3, health: 2 }, resources: { knowledge: 5 }, path: { family: 1, knowledge: 1 } }, ["เสียงงานเบาลงครึ่งวัน แต่เสียงถามตอบดังขึ้นแทน", "ความรู้ที่เข้าใจจริงมักต้องแลกกับเวลาที่ดูเหมือนเสียไป"]),
    ],
  },
  {
    id: "unfinished_frame_creaks", title: "โครงสร้างที่ยังไม่เสร็จส่งเสียงลั่น", category: "ก่อสร้าง / อุบัติเหตุ",
    text: "โครงไม้ของงานที่กำลังสร้างลั่นเบา ๆ ตอนลมแรง ช่างไม้บอกว่ายังไม่อันตรายถ้าหยุดแก้ตอนนี้ แต่ถ้าฝืนเร่งงาน อาจมีคนเจ็บ",
    condition: (g) => g.construction !== null,
    weight: (g) => 6 + (g.labor.build >= 2 ? 5 : 0) + (riskPreview(g).accident > 45 ? 8 : 0),
    choices: [
      choice("brace_frame", "🪵", "ค้ำโครงสร้างก่อนทำต่อ", "ปลอดภัย", "ใช้ไม้และเวลาบางส่วน ลดอุบัติเหตุ", { resources: { wood: -4 }, metrics: { health: 3, trust: 2 }, risk: { accident: -8 }, path: { survival: 1 } }, ["ไม้ค้ำถูกตั้งเพิ่มทั้งที่ไม่มีใครอยากเสียเวลา", "เมื่อโครงเงียบลง คนทำงานก็เริ่มหายใจเต็มปอดอีกครั้ง"]),
      choice("rush_frame", "💪", "เร่งให้เสร็จก่อนลมแรงกว่าเดิม", "เสี่ยง", "งานเดินเร็วขึ้น แต่เสี่ยงบาดเจ็บ", { metrics: { trust: -2 }, resources: { wood: 2 }, casualtyChance: 10, risk: { accident: 14 }, path: { survival: 1 } }, ["ค้อนดังถี่ขึ้นเหมือนจะเอาชนะลมให้ได้", "บางครั้งงานก้าวหน้าเพราะคนยอมเสี่ยง แต่ความเสี่ยงไม่ได้หายไปเพียงเพราะงานดูใกล้เสร็จ"]),
      choice("pause_frame", "⏸️", "หยุดงานนี้หนึ่งเดือนแล้วโยกคนไปงานจำเป็น", "ยืดหยุ่น", "ลดอุบัติเหตุและความล้า แต่โครงการไม่เดินเร็ว", { metrics: { health: 2, morale: 1 }, path: { family: 1 } }, ["ช่างไม้ถอนหายใจแต่ยอมวางค้อน คนหาอาหารยิ้มเพราะได้มือเพิ่ม", "โครงสร้างรอได้ในบางเดือน แต่ท้องคนรอไม่ได้เสมอไป"]),
    ],
  },

];


type ExtraEventSeed = {
  id: string;
  icon: string;
  title: string;
  category: string;
  text: string;
  condition?: (g: GameState) => boolean;
  weight?: (g: GameState) => number;
  resources?: Partial<Resources>;
  risk?: Partial<Risks>;
  metrics?: Partial<Metrics>;
  path?: Partial<PathScores>;
  threat?: number;
  chainTo?: string;
  rare?: boolean;
};

function extraEvent(seed: ExtraEventSeed): GameEvent {
  const resourceDelta = seed.resources ?? {};
  const metricDelta = seed.metrics ?? {};
  const riskDelta = seed.risk ?? {};
  const pathDelta = seed.path ?? {};
  return {
    id: seed.id,
    title: seed.title,
    category: seed.category,
    text: seed.text,
    rare: seed.rare,
    condition: seed.condition,
    weight: seed.weight ?? (() => 5),
    choices: [
      choice(`${seed.id}_careful`, seed.icon, "รับมืออย่างระมัดระวัง", "รอบคอบ", "ลดความเสี่ยง แต่ใช้เวลาและทรัพยากรบางส่วน", {
        resources: scaleResources(resourceDelta, 0.6),
        metrics: changeLike(metricDelta, 0.8),
        risk: invertRisk(riskDelta, 0.5),
        path: pathDelta,
        threat: seed.threat ?? 0,
      }, [
        "ผู้นำไม่ได้รีบเอาชนะเหตุการณ์ตรงหน้า แต่ให้คนในค่ายหยุดมองรายละเอียดที่มักถูกละเลย",
        "ผลลัพธ์อาจไม่หวือหวา ทว่าความเสียหายที่ไม่เกิดขึ้นก็เป็นชัยชนะชนิดหนึ่ง",
      ], seed.chainTo ? { addPending: seed.chainTo } : {}),
      choice(`${seed.id}_practical`, "🧰", "ใช้แรงงานแก้ปัญหาทันที", "ปฏิบัติ", "ได้ผลเร็ว แต่เพิ่มความล้าและอุบัติเหตุเล็กน้อย", {
        resources: resourceDelta,
        metrics: { ...metricDelta, morale: (metricDelta.morale ?? 0) + 1 },
        risk: { ...riskDelta, accident: (riskDelta.accident ?? 0) + 3 },
        path: { ...pathDelta, survival: (pathDelta.survival ?? 0) + 1 },
        threat: seed.threat ?? 0,
      }, [
        "คนที่ยังมีกำลังถูกเรียกออกมา งานจึงเดินหน้าโดยไม่รอให้ความกลัวตั้งราก",
        "แต่ทุกก้าวที่เร่งขึ้น ทิ้งรอยเหนื่อยไว้บนไหล่ของคนทำงานเสมอ",
      ], seed.chainTo ? { addPending: seed.chainTo } : {}),
      choice(`${seed.id}_community`, "🤝", "ให้ชุมชนร่วมตัดสินใจ", "ร่วมมือ", "เพิ่มความไว้ใจและลดความขัดแย้ง แต่อาจไม่แก้ทรัพยากรทันที", {
        resources: scaleResources(resourceDelta, 0.35),
        metrics: { trust: 3, cohesion: 3, fairness: 2, ...(metricDelta ?? {}) },
        risk: { conflict: -5 },
        path: { family: 1, ...(pathDelta ?? {}) },
        threat: seed.threat ? Math.round(seed.threat * 0.4) : 0,
      }, [
        "เรื่องนี้ถูกเล่าต่อหน้าคนทั้งค่าย ไม่ใช่ในเงาของที่พักผู้นำ",
        "บางคนยังไม่เห็นด้วย แต่การได้พูดทำให้ความไม่เห็นด้วยไม่กลายเป็นพิษเงียบ",
      ], seed.chainTo ? { addPending: seed.chainTo } : {}),
    ],
  };
}

function scaleResources(delta: Partial<Resources>, factor: number): Partial<Resources> {
  const out: Partial<Resources> = {};
  (Object.keys(delta) as ResourceKey[]).forEach((k) => { out[k] = Math.round((delta[k] ?? 0) * factor); });
  return out;
}
function changeLike<T extends string>(delta: Partial<Record<T, number>>, factor: number): Partial<Record<T, number>> {
  const out: Partial<Record<T, number>> = {};
  (Object.keys(delta) as T[]).forEach((k) => { out[k] = Math.round((delta[k] ?? 0) * factor); });
  return out;
}
function invertRisk(delta: Partial<Risks>, factor: number): Partial<Risks> {
  const out: Partial<Risks> = {};
  (Object.keys(delta) as Array<keyof Risks>).forEach((k) => { out[k] = -Math.round(Math.abs(delta[k] ?? 0) * factor); });
  return out;
}

const survivalEventSeeds: ExtraEventSeed[] = [
  { id: "food_mold_in_sack", icon: "🍞", title: "กลิ่นเปรี้ยวในถุงเสบียง", category: "อาหาร / คลัง", text: "ถุงอาหารใบหนึ่งมีกลิ่นเปรี้ยว เด็กที่วิ่งผ่านเป็นคนได้กลิ่นก่อนผู้ใหญ่ หากปล่อยไว้ อาหารดีอาจปนเสียทั้งกอง", resources: { food: -4, knowledge: 2 }, risk: { food: 8, disease: 4 }, weight: (g) => 5 + (g.buildings.storage ? -2 : 8) },
  { id: "water_skin_leak", icon: "💧", title: "ถุงน้ำรั่วระหว่างขนกลับค่าย", category: "น้ำ / งานประจำวัน", text: "คนตักน้ำกลับมาพร้อมถุงหนังที่เปียกกว่าปกติ น้ำหายไปก่อนถึงค่ายครึ่งหนึ่ง และทุกคนเริ่มมองหาใครสักคนให้รับผิด", resources: { water: -5, hides: -1 }, risk: { conflict: 5 }, weight: (g) => 6 + (g.resources.water < foodNeedFor(g) * 2 ? 8 : 0) },
  { id: "wet_firewood_smokes", icon: "🔥", title: "ฟืนเปียกทำให้ควันขัง", category: "ฟืน / สุขภาพ", text: "ฟืนที่เก็บมาเปียกข้างใน ควันหนาเกาะที่พักจนเด็กไอและผู้เฒ่าต้องออกไปนั่งกลางลม", resources: { fuel: -3 }, metrics: { health: -2 }, risk: { disease: 6, weather: 5 }, weight: (g) => 6 + (seasonOf(g.month) === "ฤดูฝน" ? 8 : 0) },
  { id: "tool_handle_splits", icon: "🛠️", title: "ด้ามขวานแตกระหว่างผ่าฟืน", category: "เครื่องมือ / อุบัติเหตุ", text: "เสียงไม้แตกดังแหลมกว่าปกติ ด้ามขวานหนึ่งอันร้าวยาว หากฝืนใช้ต่อ มือของคนตัดไม้อาจไม่รอด", resources: { tools: -1, wood: 1 }, risk: { accident: 9 }, weight: (g) => 5 + (g.resources.tools <= 3 ? 8 : 0) },
  { id: "child_near_stream", icon: "🧒", title: "เด็กเล็กเดินตามเสียงน้ำ", category: "ครอบครัว / น้ำ", text: "เด็กคนหนึ่งหายจากกองไฟไปไม่นาน ก่อนมีคนเห็นรอยเท้าเล็ก ๆ ไปทางลำธาร เรื่องนี้ทำให้ทุกคนรู้ว่าค่ายยังไม่มีขอบเขตที่ปลอดภัย", metrics: { morale: -1, security: 2 }, risk: { accident: 10 }, weight: (g) => alivePeople(g).some(p=>p.age<12) ? 10 : 1 },
  { id: "old_cough_returns", icon: "🩺", title: "ไอเก่ากลับมาในที่พักรวม", category: "โรค / ที่พัก", text: "เสียงไอเดิมกลับมาอีกครั้งในที่พักรวม คราวนี้คนข้าง ๆ เริ่มหันหน้าหนี ก่อนจะมีใครกล้าพูดว่าโรคอาจอยู่ใกล้กว่าที่คิด", metrics: { health: -3 }, risk: { disease: 12 }, weight: (g) => 5 + (g.buildings.shelter < Math.ceil(alivePeople(g).length/5) ? 10 : 0) },
  { id: "quiet_theft_hint", icon: "⚖️", title: "รอยนิ้วในถุงธัญพืช", category: "อาชญากรรม / เสบียง", text: "ถุงธัญพืชที่ผูกไว้ถูกคลายออกเล็กน้อย ไม่มีใครเห็นขโมย แต่ทุกคนเห็นว่าปมเชือกไม่เหมือนเดิม", resources: { food: -3 }, metrics: { trust: -2 }, risk: { conflict: 10 }, chainTo: "supply_theft", weight: (g) => 4 + (g.metrics.fairness < 55 ? 8 : 0) },
  { id: "ashes_spread_by_wind", icon: "🌬️", title: "ลมแรงพัดเถ้าร้อนไปใกล้ที่พัก", category: "อากาศ / ไฟ", text: "เถ้าร้อนถูกลมพัดข้ามพื้นดินแห้งเกินไป ไฟยังไม่ลาม แต่กลิ่นไหม้ทำให้คนเฝ้ากองไฟหน้าซีด", resources: { fuel: -1 }, risk: { accident: 12, weather: 6 }, weight: (g) => 5 + (terrainData[g.terrain].weather > 5 ? 6 : 0) },
  { id: "sore_backs_after_build", icon: "🏗️", title: "หลังของแรงงานก่อสร้างเริ่มรับไม่ไหว", category: "แรงงาน / ก่อสร้าง", text: "คนที่ยกไม้และหินมาหลายวันเริ่มนั่งเงียบหลังเลิกงาน ไม่มีใครป่วยชัดเจน แต่ความเหนื่อยกำลังยืมร่างของวันหน้า", metrics: { health: -1, morale: -1 }, risk: { accident: 8 }, weight: (g) => g.labor.build > 1 ? 10 : 2 },
  { id: "strange_tracks_by_storage", icon: "🐾", title: "รอยเท้าเล็กใกล้คลัง", category: "สัตว์ป่า / คลัง", text: "รอยเท้าเล็ก ๆ วนอยู่ใกล้คลังอาหาร อาจเป็นสัตว์ตัวเล็ก หรือสัญญาณว่ากลิ่นอาหารของค่ายเริ่มเรียกแขกกลางคืน", resources: { food: -2 }, risk: { beast: 8, food: 3 }, weight: (g) => g.buildings.storage > 0 ? 8 : 4 },
  { id: "elder_falls_on_mud", icon: "🧓", title: "ผู้เฒ่าลื่นบนทางโคลน", category: "อุบัติเหตุ / ผู้สูงอายุ", text: "ฝนทิ้งทางเดินเป็นโคลน ผู้เฒ่าคนหนึ่งล้มใกล้กองฟืน ไม่มีแผลใหญ่ แต่ทุกคนเห็นว่าทางเดินในค่ายก็เป็นภัยได้", metrics: { health: -2 }, risk: { accident: 10 }, weight: (g) => alivePeople(g).some(p=>p.age>=60) ? 9 : 2 },
  { id: "sleeping_space_argument", icon: "🛖", title: "ที่นอนแคบทำให้คำพูดสั้นลง", category: "ที่พัก / ข้อพิพาท", text: "คืนหนึ่งมีคนสองครอบครัวเถียงกันเรื่องที่นอนใกล้กองไฟ ใคร ๆ ก็รู้ว่าพวกเขาไม่ได้โกรธกันเพราะผ้าห่มผืนเดียว", metrics: { morale: -2, trust: -2 }, risk: { shelter: 8, conflict: 8 }, weight: (g) => riskPreview(g).shelter > 40 ? 12 : 3 },
  { id: "bad_water_taste", icon: "💧", title: "น้ำมีรสฝาดหลังฝนตก", category: "น้ำ / โรค", text: "น้ำที่ตักจากทางเดิมมีรสฝาดและกลิ่นดินแรงกว่าปกติ คนตักน้ำไม่แน่ใจว่าควรทิ้งหรือเก็บไว้ให้เดือด", resources: { water: -2 }, metrics: { health: -1 }, risk: { disease: 10 }, weight: (g) => seasonOf(g.month)==="ฤดูฝน" ? 11 : 4 },
  { id: "berry_patch_dispute", icon: "🫐", title: "พุ่มเบอร์รี่ที่ทุกคนอยากเป็นเจ้าของ", category: "อาหาร / ความยุติธรรม", text: "คนหาอาหารพบพุ่มเบอร์รี่ใกล้ค่าย เด็กอยากกินทันที พรานอยากเก็บไว้ทำเสบียง และผู้ป่วยต้องการของหวานพยุงแรง", resources: { food: 5 }, metrics: { fairness: -1 }, risk: { conflict: 5 }, weight: (g) => seasonOf(g.month)!=="ฤดูหนาว" ? 8 : 1 },
  { id: "cold_floor_children", icon: "🧣", title: "พื้นเย็นเกินไปสำหรับเด็ก", category: "ฤดูหนาว / ครอบครัว", text: "เด็ก ๆ ตื่นพร้อมปลายมือเย็นและไม่อยากลุกจากผ้าห่ม ผู้ใหญ่รู้ทันทีว่าฟืนอย่างเดียวไม่พอถ้าที่นอนยังแตะพื้นเย็น", resources: { fuel: -2 }, metrics: { health: -3 }, risk: { weather: 12 }, weight: (g) => seasonOf(g.month)==="ฤดูหนาว" ? 12 : 1 },
  { id: "hunter_returns_empty", icon: "🏹", title: "พรานกลับมามือเปล่า", category: "อาหาร / ป่า", text: "พรานกลับมาพร้อมรอยข่วนบนแขนและไม่มีเนื้อสัตว์ เสียงในค่ายเงียบลงทันที เพราะทุกคนรู้ว่าอาหารไม่ได้เกิดจากความตั้งใจอย่างเดียว", resources: { food: -3 }, metrics: { morale: -2 }, risk: { beast: 6 }, weight: (g) => g.labor.forage > 0 ? 8 : 2 },
  { id: "first_rust_on_blade", icon: "⚒️", title: "สนิมแรกบนคมมีด", category: "เครื่องมือ / ความชื้น", text: "คมมีดที่ใช้แล่เนื้อเริ่มมีจุดสนิมเล็ก ๆ ฝนและเหงื่อกำลังบอกว่าของใช้ก็ต้องได้รับการดูแลเหมือนคน", resources: { tools: -1, knowledge: 2 }, risk: { accident: 4 }, weight: (g) => seasonOf(g.month)==="ฤดูฝน" ? 9 : 4 },
  { id: "night_fear_spreads", icon: "🌙", title: "ข่าวลือกลางคืนเดินเร็วกว่าคน", category: "ข่าวลือ / ความกลัว", text: "คนหนึ่งบอกว่าได้ยินเสียงนอกค่าย อีกคนยืนยันว่าเห็นเงา เรื่องเดียวกันโตขึ้นทุกครั้งที่ถูกเล่าต่อในความมืด", metrics: { morale: -2, security: -1 }, risk: { conflict: 4, beast: 4 }, weight: (g) => g.metrics.security < 55 ? 9 : 3 },
  { id: "too_many_tasks", icon: "📋", title: "งานมากกว่ามือที่มี", category: "แรงงาน / การจัดการ", text: "รายชื่องานบนหินแบนยาวกว่ารายชื่อคนว่าง งานที่จำเป็นเริ่มแย่งแรงกันเองก่อนที่ภัยข้างนอกจะมาถึง", metrics: { morale: -1 }, risk: { accident: 8, conflict: 5 }, weight: (g) => workerCapacity(g) < Object.values(g.labor).reduce((a,b)=>a+b,0) ? 10 : 4 },
  { id: "smoke_sparks_memory", icon: "🔥", title: "ประกายไฟเตือนความทรงจำเก่า", category: "จิตใจ / กองไฟ", text: "ประกายไฟหนึ่งกระเด็นใส่ผ้าห่มเก่า ไม่มีไฟไหม้ แต่ผู้รอดชีวิตบางคนเงียบไปทั้งคืนเหมือนเห็นบ้านเก่าลุกไหม้อีกครั้ง", metrics: { morale: -2 }, risk: { accident: 4 }, weight: (g) => g.memories.some(m=>m.kind==="trauma") ? 8 : 3 },
  { id: "loose_rope_on_load", icon: "🪢", title: "เชือกมัดฟืนเริ่มลุ่ย", category: "งานไม้ / อุบัติเหตุ", text: "เชือกที่มัดฟืนเริ่มลุ่ย คนแบกมองมันแล้วรู้ว่าถ้าขาดกลางทาง ทั้งฟืนทั้งเท้าอาจเสียหาย", resources: { wood: 2, hides: -1 }, risk: { accident: 6 }, weight: (g) => g.labor.wood > 0 ? 8 : 2 },
  { id: "herb_wrong_leaf", icon: "🌿", title: "ใบสมุนไพรที่คล้ายกันเกินไป", category: "สมุนไพร / ความรู้", text: "ใบสองชนิดวางอยู่ข้างกัน คล้ายกันจนคนเก็บมือใหม่แยกไม่ออก หมอยารู้ว่าความต่างเล็ก ๆ อาจเป็นความต่างระหว่างยาและพิษ", resources: { herbs: 3, knowledge: 2 }, risk: { disease: 4 }, weight: (g) => g.labor.herbs > 0 ? 10 : 3 },
  { id: "muddy_storage_floor", icon: "🏺", title: "พื้นคลังเริ่มชื้น", category: "คลัง / ฝน", text: "ใต้กองเสบียงมีรอยชื้นเป็นวงเล็ก ๆ ถ้าไม่ยกของขึ้นตอนนี้ ความชื้นจะทำงานแทนศัตรูอย่างเงียบ ๆ", resources: { food: -2, wood: -1 }, risk: { food: 7, disease: 3 }, weight: (g) => g.buildings.storage > 0 && seasonOf(g.month)==="ฤดูฝน" ? 12 : 3 },
  { id: "newcomer_old_grudge", icon: "🧳", title: "ผู้มาใหม่รู้จักชื่อที่ไม่ควรรู้", category: "คนใหม่ / ความไว้ใจ", text: "ผู้มาใหม่คนหนึ่งเอ่ยชื่อกลุ่มที่บางคนในค่ายเคยหนีมา ความเงียบที่ตามมาหนักกว่าคำถามหลายข้อ", metrics: { trust: -2 }, risk: { conflict: 8 }, weight: (g) => g.people.length > 14 ? 7 : 2 },
  { id: "trail_food_missing", icon: "🥾", title: "เสบียงเดินทางหายไประหว่างสำรวจ", category: "สำรวจ / เสบียง", text: "ถุงอาหารของคนสำรวจเบากว่าที่ควรเมื่อกลับถึงค่าย อาจเป็นรูที่ก้นถุง อาจเป็นมือใครบางคน หรืออาจเป็นป่าที่กินทุกอย่าง", resources: { food: -4 }, risk: { conflict: 5, accident: 5 }, weight: (g) => g.labor.explore > 0 ? 9 : 1 },
  { id: "old_song_returns", icon: "🎶", title: "เพลงเก่ากลับมารอบกองไฟ", category: "กำลังใจ / วัฒนธรรม", text: "มีคนเริ่มร้องเพลงที่เคยคิดว่าลืมไปแล้ว เสียงแรกสั่น แต่เสียงที่สองตามมา และค่ายฟังดูเป็นบ้านขึ้นเล็กน้อย", metrics: { morale: 5, cohesion: 2 }, resources: { knowledge: 2 }, weight: (g) => g.metrics.morale < 65 ? 8 : 3 },
  { id: "animal_smell_near_food", icon: "🐐", title: "กลิ่นคอกลอยถึงคลังอาหาร", category: "สัตว์เลี้ยง / สุขอนามัย", text: "ลมพัดกลิ่นคอกจากฝั่งสัตว์ไปถึงคลังอาหาร หมอยาขมวดคิ้วก่อนจะพูดว่าอาหารและมูลสัตว์ไม่ควรจำกลิ่นกันได้", metrics: { health: -2 }, risk: { disease: 8 }, weight: (g) => animalCount(g)>0 && g.buildings.livestockShed===0 ? 10 : 1 },
  { id: "small_victory_shared", icon: "🌤️", title: "เช้าที่ทุกคนตื่นครบ", category: "กำลังใจ / ความหวัง", text: "ไม่มีศพ ไม่มีไข้ใหม่ ไม่มีเสียงร้องขอความช่วยเหลือ เช้าธรรมดาเช่นนี้ทำให้บางคนรู้ว่าการอยู่รอดอาจมีหน้าตาเงียบ ๆ", metrics: { morale: 4, cohesion: 2 }, weight: (g) => riskPreview(g).food < 35 && riskPreview(g).disease < 35 ? 6 : 1 },
  { id: "argument_over_tools", icon: "🛠️", title: "เครื่องมือดีมีไม่พอสำหรับทุกมือ", category: "เครื่องมือ / ความยุติธรรม", text: "ช่างไม้และคนตัดฟืนต่างต้องการเครื่องมือที่ยังคมที่สุดในเดือนเดียวกัน การแบ่งของใช้เริ่มเป็นการเมืองขนาดเล็ก", metrics: { fairness: -2 }, risk: { conflict: 7, accident: 4 }, weight: (g) => g.resources.tools < 4 ? 9 : 2 },
  { id: "salt_craving", icon: "🧂", title: "ร่างกายเริ่มเรียกหาเกลือ", category: "อาหาร / สุขภาพ", text: "อาหารยังพอ แต่หลายคนเริ่มอ่อนแรงและบ่นถึงรสเค็มที่หายไป เสบียงไม่ใช่แค่จำนวน แต่เป็นสิ่งที่ร่างกายต้องการจริง ๆ", metrics: { health: -2, morale: -1 }, risk: { disease: 4 }, weight: (g) => g.year > 1 && g.labor.trade === 0 ? 6 : 2 },
  { id: "stone_chips_in_eye", icon: "🪨", title: "เศษหินกระเด็นเฉียดตา", category: "งานหิน / อุบัติเหตุ", text: "คนเก็บหินสะดุ้งเมื่อเศษหินกระเด็นเฉียดตา ทุกคนเห็นเพียงเสี้ยวเดียวว่าการสร้างอนาคตอาจทำลายสายตาของคนหนึ่งได้", metrics: { health: -1 }, risk: { accident: 10 }, weight: (g) => g.labor.stone > 0 ? 9 : 1 },
  { id: "family_hides_food", icon: "🏡", title: "ครอบครัวหนึ่งซ่อนอาหารไว้ใต้ที่นอน", category: "ครอบครัว / เสบียง", text: "อาหารแห้งถูกพบใต้ที่นอนของครอบครัวที่มีเด็กเล็ก พวกเขาไม่ได้ปฏิเสธ เพียงถามกลับว่าใครจะรับผิดชอบถ้าเด็กหิว", resources: { food: -3 }, metrics: { fairness: -3, trust: -2 }, risk: { conflict: 12 }, weight: (g) => g.resources.food < foodNeedFor(g) * 3 ? 8 : 2 },
  { id: "fireflies_at_marsh", icon: "✨", title: "แสงเล็ก ๆ เหนือบึง", category: "ข่าวลือ / บึง", text: "กลางคืนมีแสงกระพริบเหนือบึง เด็กบอกว่าเป็นดาวตกใกล้ดิน ผู้เฒ่าบอกว่ามันอาจพาไปยังน้ำหรือโรคอย่างใดอย่างหนึ่ง", resources: { knowledge: 3 }, risk: { disease: 4 }, weight: (g) => normalizeLocations(g.locations).marshPools.discovered ? 8 : 2 },
  { id: "broken_sleep_after_howl", icon: "🐺", title: "เสียงหอนทำให้คนหลับไม่สนิท", category: "สัตว์ป่า / ความล้า", text: "เสียงหอนยาวลากผ่านป่ามืด ไม่มีอะไรบุกค่าย แต่เช้าถัดมาคนหลายคนทำงานช้าลงเพราะหลับไม่เต็มตา", metrics: { morale: -1, security: -1 }, risk: { beast: 7, accident: 5 }, weight: (g) => riskPreview(g).beast > 35 ? 10 : 3 },
  { id: "rain_barrel_idea", icon: "🌧️", title: "เด็กเสนอให้รองน้ำฝน", category: "น้ำ / ความรู้", text: "เด็กคนหนึ่งวางถ้วยแตกไว้ใต้ชายผ้าใบและพบว่าน้ำฝนเต็มถ้วยก่อนเช้า ผู้ใหญ่หัวเราะก่อนจะเริ่มคิดจริงจัง", resources: { water: 4, knowledge: 3 }, metrics: { morale: 1 }, weight: (g) => seasonOf(g.month)==="ฤดูฝน" ? 9 : 3 },
  { id: "too_quiet_road", icon: "🛤️", title: "ถนนเก่าเงียบเกินไป", category: "ถนน / ข่าวสาร", text: "คนฟังข่าวริมทางกลับมาพร้อมคำเดียว: เงียบ เงียบเกินกว่าถนนที่ควรมีพ่อค้า บางครั้งความไม่มีข่าวคือข่าวที่ดังที่สุด", resources: { knowledge: 4 }, threat: 4, risk: { conflict: 4 }, weight: (g) => normalizeLocations(g.locations).oldTradeRoad.discovered ? 8 : 2 },
];

const animalKindsForEvents: Array<{ key: AnimalKey; name: string; icon: string; condition: (g: GameState)=>boolean }> = [
  { key: "goats", name: "แพะ", icon: "🐐", condition: (g)=>normalizeAnimalState(g.animalState).animals.goats>0 },
  { key: "chickens", name: "ไก่", icon: "🐔", condition: (g)=>normalizeAnimalState(g.animalState).animals.chickens>0 },
  { key: "dogs", name: "สุนัข", icon: "🐕", condition: (g)=>normalizeAnimalState(g.animalState).animals.dogs>0 },
  { key: "cows", name: "วัว", icon: "🐄", condition: (g)=>normalizeAnimalState(g.animalState).animals.cows>0 },
  { key: "pigs", name: "หมู", icon: "🐖", condition: (g)=>normalizeAnimalState(g.animalState).animals.pigs>0 },
];
const animalIssues = [
  { suffix: "หิวเกินกว่าจะนิ่ง", cat: "สัตว์เลี้ยง / อาหาร", text: "มันเริ่มส่งเสียงและเบียดกันใกล้รางอาหาร บอกให้คนรู้ว่าอาหารสัตว์ไม่ใช่ของฟุ่มเฟือย", res: { feed: -2, food: -2 } as Partial<Resources>, risk: { disease: 4 } as Partial<Risks> },
  { suffix: "น้ำในรางขุ่น", cat: "สัตว์เลี้ยง / น้ำ", text: "น้ำที่วางไว้เริ่มขุ่นและมีกลิ่นดิน หากปล่อยไว้ ฝูงอาจป่วยก่อนคนจะรู้ตัว", res: { water: -2 } as Partial<Resources>, risk: { disease: 6 } as Partial<Risks> },
  { suffix: "เชือกผูกเริ่มกัดผิว", cat: "สัตว์เลี้ยง / คอก", text: "รอยแดงบนผิวสัตว์ทำให้คนเลี้ยงรู้ว่าเครื่องผูกที่หยาบเกินไปก็ทำร้ายทรัพย์สินมีชีวิตได้", res: { hides: -1, knowledge: 2 } as Partial<Resources>, risk: { accident: 5 } as Partial<Risks> },
  { suffix: "หายไปจากคอกชั่วครู่", cat: "สัตว์เลี้ยง / ความปลอดภัย", text: "มีช่วงหนึ่งที่ไม่มีใครเห็นมันในคอก หัวใจของคนเลี้ยงสัตว์ตกไปอยู่ที่พื้นก่อนจะพบรอยใหม่ข้างรั้ว", res: {} as Partial<Resources>, risk: { beast: 6, conflict: 3 } as Partial<Risks> },
  { suffix: "ป่วยเงียบ ๆ", cat: "สัตว์เลี้ยง / โรค", text: "มันกินน้อยลงและยืนนิ่งกว่าปกติ อาการเล็ก ๆ เช่นนี้มักเป็นจุดเริ่มของโรคทั้งคอก", res: { herbs: -1 } as Partial<Resources>, risk: { disease: 9 } as Partial<Risks> },
  { suffix: "ทำให้เด็กยิ้ม", cat: "สัตว์เลี้ยง / กำลังใจ", text: "เด็ก ๆ หัวเราะเมื่อมันทำท่าประหลาด เสียงหัวเราะนั้นเล็ก แต่กองไฟที่เหนื่อยล้าต้องการมัน", res: { food: -1 } as Partial<Resources>, metrics: { morale: 3 } as Partial<Metrics> },
  { suffix: "กลิ่นดึงสัตว์ป่า", cat: "สัตว์เลี้ยง / ภัยนอกค่าย", text: "กลิ่นคอกลอยไปไกลกว่าที่คิด พรานบอกว่าจมูกของสัตว์ป่ามาถึงก่อนเท้าของมันเสมอ", res: {} as Partial<Resources>, risk: { beast: 10 } as Partial<Risks> },
];
function buildAnimalEvents(): GameEvent[] {
  const out: GameEvent[] = [];
  animalKindsForEvents.forEach((animal) => {
    animalIssues.forEach((issue, index) => {
      out.push(extraEvent({
        id: `animal_${animal.key}_${index}`,
        icon: animal.icon,
        title: `${animal.name}${issue.suffix}`,
        category: issue.cat,
        text: `${animal.name}${issue.text}`,
        condition: animal.condition,
        weight: (g) => 3 + (animal.condition(g) ? 7 : 0) + (normalizeAnimalState(g.animalState).hunger > 55 ? 4 : 0) + (normalizeAnimalState(g.animalState).health < 55 ? 4 : 0),
        resources: issue.res,
        metrics: issue.metrics ?? { morale: -1 },
        risk: issue.risk,
        path: { survival: 1 },
      }));
    });
  });
  return out;
}

const exploreFinds = [
  { key: "fresh_signs", title: "ร่องรอยสดบนดิน", res: { knowledge: 4 }, risk: { beast: 5 }, path: { knowledge: 1 } },
  { key: "hidden_water", title: "แอ่งน้ำที่ถูกหญ้าบัง", res: { water: 6, knowledge: 2 }, risk: { disease: 3 }, path: { survival: 1 } },
  { key: "fallen_tree", title: "ไม้ล้มที่ใช้ได้", res: { wood: 6 }, risk: { accident: 4 }, path: { survival: 1 } },
  { key: "old_marks", title: "รอยสลักเก่าบนหิน", res: { knowledge: 5, stone: 2 }, risk: { conflict: 2 }, path: { knowledge: 1 } },
  { key: "animal_crossing", title: "ทางเดินสัตว์", res: { food: 3, hides: 1 }, risk: { beast: 8 }, path: { survival: 1 } },
  { key: "stranger_smoke", title: "ควันไฟของคนอื่น", res: { knowledge: 5 }, risk: { conflict: 8 }, path: { trade: 1 } },
  { key: "safe_bend", title: "จุดพักที่ลมไม่แรง", res: { knowledge: 3, fuel: 2 }, risk: { weather: -4 }, path: { family: 1 } },
];
function buildExplorationEvents(): GameEvent[] {
  const locs = Object.entries(locationData) as Array<[LocationKey, typeof locationData[LocationKey]]>;
  const out: GameEvent[] = [];
  locs.forEach(([key, loc]) => {
    exploreFinds.forEach((find) => {
      out.push(extraEvent({
        id: `explore_${key}_${find.key}`,
        icon: loc.icon,
        title: `${loc.title}: ${find.title}`,
        category: `สำรวจ / ${loc.title}`,
        text: `คนสำรวจกลับจาก${loc.title}พร้อมเรื่องเล่าใหม่: ${loc.text} ครั้งนี้พวกเขาพบ${find.title.toLowerCase()} ซึ่งอาจเปลี่ยนการใช้พื้นที่นี้ในเดือนต่อไป`,
        condition: (g) => normalizeLocations(g.locations)[key].discovered || g.exploreTarget === key || (g.labor.explore ?? 0) > 0,
        weight: (g) => 2 + (g.exploreTarget === key ? 10 : 0) + Math.floor(normalizeLocations(g.locations)[key].progress / 25),
        resources: find.res as Partial<Resources>,
        risk: find.risk as Partial<Risks>,
        path: find.path as Partial<PathScores>,
      }));
    });
  });
  return out;
}

const familyMoments = [
  { key: "child_question", title: "คำถามของเด็ก", res: { knowledge: 2 }, metrics: { morale: 2, cohesion: 1 } },
  { key: "old_story", title: "เรื่องเล่าของผู้เฒ่า", res: { knowledge: 4 }, metrics: { cohesion: 2 } },
  { key: "shared_blanket", title: "ผ้าห่มที่ถูกแบ่ง", res: { fuel: -1 }, metrics: { morale: 3, trust: 1 } },
  { key: "jealous_ration", title: "สายตาเมื่ออาหารไม่เท่ากัน", res: { food: -1 }, metrics: { fairness: -2, trust: -1 }, risk: { conflict: 6 } },
  { key: "new_friendship", title: "มิตรภาพที่เกิดจากงานหนัก", res: {}, metrics: { morale: 2, cohesion: 3 } },
];
const socialGroups = ["ครอบครัวคนตัดไม้", "เด็กใกล้กองไฟ", "ผู้เฒ่าข้างที่พัก", "คนป่วยที่ยังอยากช่วย", "พรานที่กลับค่ำ", "ช่างที่มือแตก", "คนใหม่ที่ยังไม่กล้าพูด", "เวรยามกลางคืน", "หญิงตั้งครรภ์", "เด็กวัยช่วยงาน", "คนทำครัว", "คนเฝ้าสัตว์"];
function buildFamilyEvents(): GameEvent[] {
  const out: GameEvent[] = [];
  socialGroups.forEach((group, gi) => {
    familyMoments.forEach((moment) => {
      out.push(extraEvent({
        id: `family_${gi}_${moment.key}`,
        icon: "🏡",
        title: `${group}: ${moment.title}`,
        category: "คนในค่าย / ครอบครัว",
        text: `${group}ทำให้ค่ายต้องหยุดมองเรื่องเล็กที่ไม่เล็กสำหรับคนมีชีวิต ${moment.title}กลายเป็นสิ่งที่ผู้คนพูดถึงหลังมื้อค่ำ`,
        condition: (g) => alivePeople(g).length >= 8,
        weight: (g) => 3 + (g.metrics.morale < 60 ? 5 : 0) + (g.people.length > 14 ? 3 : 0),
        resources: moment.res as Partial<Resources>,
        metrics: moment.metrics as Partial<Metrics>,
        risk: (moment as any).risk ?? {},
        path: { family: 1 },
      }));
    });
  });
  return out;
}

const chainThemes = [
  ["stranger_child", "เด็กหลงทางที่จำชื่อตัวเองไม่ได้", "เด็กคนหนึ่งยืนอยู่ริมค่ายโดยไม่ร้องไห้ เขามองกองไฟเหมือนเคยเห็นมันมาก่อน", "เด็กเริ่มจำทางกลับบ้าน"],
  ["buried_cache", "ห่อผ้าใต้รากไม้", "พรานสะดุดรากไม้ที่มีผ้าฝังอยู่ใต้ดิน กลิ่นเก่าของมันไม่เหมือนของชาวค่าย", "เจ้าของห่อผ้าปรากฏตัว"],
  ["old_debt", "หนี้เก่าของผู้มาใหม่", "คนที่เพิ่งเข้าค่ายหลบตาเมื่อเห็นรอยสลักบนด้ามมีดของพ่อค้า", "เจ้าหนี้เดินทางถึงค่าย"],
  ["sick_herb", "สมุนไพรที่ช่วยคนหนึ่งแต่ทำร้ายอีกคน", "หมอยาพบว่ายาต้มชุดเดียวกันทำให้คนป่วยคนหนึ่งดีขึ้น แต่อีกคนหน้าซีดลง", "สูตรยาถูกแก้ใหม่"],
  ["wolf_pair", "หมาป่าสองตัวที่ไม่ล่า", "พรานเห็นหมาป่าสองตัวเฝ้ามองค่าย แต่พวกมันไม่บุก เพียงเดินวนเหมือนรออะไรบางอย่าง", "หมาป่ากลับมาพร้อมฝูง"],
  ["merchant_seal", "ตราประทับบนเหรียญแปลก", "ทองเหรียญหนึ่งมีตราที่ไม่มีใครในค่ายรู้จัก พ่อค้าบางคนอาจให้ค่ามันมากกว่าทองทั่วไป", "ตราประทับถูกจำได้"],
  ["cave_voice", "เสียงสะท้อนในถ้ำเก่า", "คนสำรวจถ้ำได้ยินเสียงเหมือนคนตอบกลับ ทั้งที่ไม่มีใครอยู่ในนั้น", "สิ่งที่อยู่ในถ้ำถูกพบ"],
  ["river_bones", "กระดูกริมตลิ่ง", "น้ำลดจนเห็นกระดูกเก่าติดรากไม้ ไม่ชัดว่าเป็นสัตว์หรือคน", "ชื่อของกระดูกริมตลิ่ง"],
  ["shared_dream", "ความฝันเดียวกันของเด็กสองคน", "เด็กสองคนตื่นมาเล่าภาพเดียวกัน: ไฟสูง น้ำดำ และเสียงล้อเกวียน", "ความฝันชี้ทาง"],
  ["broken_oath", "คำมั่นที่มีคนไม่ยอมกล่าว", "ในคืนที่ทุกคนกล่าวคำมั่น มีคนหนึ่งเงียบจนคนข้าง ๆ หันมามอง", "คนเงียบเผยเหตุผล"],
  ["lost_dog", "สุนัขหายตอนรุ่งสาง", "รอยเท้าสุนัขหายไปทางชายป่า และมีรอยเท้าคนทับอยู่ข้าง ๆ", "สุนัขกลับมาพร้อมข่าว"],
  ["black_stone", "หินดำที่ไม่เหมือนหินอื่น", "หินสีดำหนักผิดปกติถูกพบใกล้แนวเขา ช่างบอกว่ามันควรลองเผา", "กลิ่นโลหะจากหินดำ"],
  ["marsh_fever", "ไข้จากหมอกบึง", "คนเก็บสมุนไพรกลับจากบึงพร้อมหนาวสั่น ทั้งที่เสื้อยังเปียกเหงื่อ", "ไข้บึงเผยแหล่งน้ำสกปรก"],
  ["grain_sprout", "เมล็ดงอกในมุมคลัง", "อาหารที่คิดว่าเก็บไว้กินเริ่มงอกเป็นต้นอ่อนในมุมชื้นของคลัง", "ต้นอ่อนกลายเป็นบทเรียน"],
  ["quiet_couple", "สองคนเริ่มแบ่งอาหารให้กัน", "มีคนเห็นสองคนแบ่งอาหารกันเงียบ ๆ หลายคืนติด เรื่องเล็กนี้อาจกลายเป็นครอบครัวใหม่", "ข่าวครอบครัวใหม่"],
  ["road_tax", "คนแปลกหน้าเรียกค่าผ่านทาง", "ชายติดอาวุธสองคนบอกว่าถนนเก่าไม่ว่างเปล่าอีกต่อไป และทุกค่ายต้องจ่ายเพื่ออยู่เงียบ", "เจ้าของถนนปลอมกลับมา"],
  ["smoke_signal", "ควันสามเส้นจากไกล", "ควันสามเส้นขึ้นจากแนวป่า ไม่เหมือนไฟธรรมดาและไม่เหมือนไฟของคนหลงทาง", "คำตอบจากควันสามเส้น"],
  ["hidden_spring", "เสียงน้ำใต้หิน", "ตอนกลางคืนมีคนได้ยินเสียงน้ำไหลใต้แนวหิน ทั้งที่พื้นแห้งสนิท", "น้ำใต้หินเปิดทาง"],
  ["tool_mark", "รอยช่างบนเครื่องมือเก่า", "เครื่องมือเก่าที่เก็บได้มีรอยช่างเฉพาะตัว เหมือนเคยเป็นของชุมชนที่มีระเบียบมาก่อน", "เจ้าของรอยช่าง"],
  ["child_map", "แผนที่ของเด็ก", "เด็กคนหนึ่งวาดทางเดินในดินเล่น แต่เส้นที่วาดกลับตรงกับทางที่พรานเพิ่งพบ", "แผนที่เด็กพาไปถูกทาง"],
  ["beehive", "รังผึ้งในไม้ล้ม", "ไม้ล้มต้นหนึ่งมีเสียงผึ้งเต็มโพรง น้ำหวานอยู่ใกล้ แต่เหล็กในก็อยู่ใกล้เช่นกัน", "ผึ้งเลือกค่าย"],
  ["old_prayer", "คำภาวนาเก่าบนแผ่นไม้", "แผ่นไม้เก่ามีคำภาวนาถูกขูดไว้ คนอ่านออกไม่หมดแต่สัมผัสได้ว่ามันเคยสำคัญ", "คำภาวนาถูกอ่านครบ"],
  ["iron_smell", "กลิ่นเหล็กในน้ำฝน", "น้ำฝนที่ขังในรอยหินมีกลิ่นเหล็กจาง ๆ ช่างบอกว่าน้ำกำลังเล่าเรื่องของดิน", "สายแร่ใต้ฝน"],
  ["bitter_milk", "น้ำนมรสขม", "วัวที่เพิ่งรับมาให้น้ำนมน้อยและรสขม คนเลี้ยงรู้ว่ามันอาจกินพืชผิดชนิด", "พืชขมถูกพบ"],
  ["missing_knife", "มีดเล็กหายจากครัว", "มีดครัวเล็กหายไป ไม่มีอาหารหาย แต่มีดที่หายไปอันตรายกว่าอาหารในบางคืน", "มีดเล็กถูกพบ"],
  ["forest_lullaby", "เพลงกล่อมจากชายป่า", "เวรยามได้ยินเสียงเหมือนเพลงกล่อมเด็กจากชายป่า ไม่มีใครในค่ายร้องเพลงนั้น", "เจ้าของเพลงกล่อม"],
  ["white_deer", "กวางสีซีดที่ไม่หนี", "พรานเห็นกวางสีซีดยืนนิ่งกลางแสงเช้า มันไม่หนี ไม่เข้าใกล้ และทิ้งรอยเท้าไว้ทางลำธาร", "รอยกวางพาไปพบน้ำ"],
  ["old_well", "ปากบ่อใต้ใบไม้", "ใบไม้แห้งยุบตัวเป็นวง กลิ่นเย็นจากข้างล่างบอกว่ามีช่องว่างใต้ดิน", "บ่อเก่าถูกเปิด"],
  ["runaway_goat", "แพะหนีแต่กลับมาอ้วนขึ้น", "แพะตัวหนึ่งหายไปสองคืนแล้วกลับมาพร้อมท้องแน่น มันอาจพบแหล่งหญ้าที่คนยังไม่รู้", "แพะพาไปทุ่งหญ้า"],
  ["red_thread", "ด้ายแดงบนกิ่งไม้", "ด้ายแดงเส้นเล็กผูกอยู่กับกิ่งไม้ระหว่างทางสำรวจ ไม่มีลมใดผูกมันเองได้", "คนผูกด้ายแดง"],
  ["grave_flower", "ดอกไม้ขึ้นบนหลุมศพแรก", "ดอกไม้เล็ก ๆ ขึ้นบนหลุมศพแรกโดยไม่มีใครปลูก เด็ก ๆ เริ่มเอาน้ำไปวางให้มัน", "หลุมศพกลายเป็นที่รวมใจ"],
  ["cracked_bell", "กระดิ่งแตกในซากค่าย", "กระดิ่งแตกถูกพบในซากค่ายเก่า แม้มันดังไม่เต็มเสียง แต่เสียงแหบของมันทำให้ทุกคนเงียบ", "กระดิ่งถูกแขวนใหม่"],
  ["distant_horn", "เสียงเขาสัตว์ไกล ๆ", "เสียงเขาสัตว์ดังมาจากถนนเก่าในยามเช้า ไม่รู้ว่าเป็นพ่อค้า นักล่า หรือคนที่ต้องการให้ค่ายหันไปมอง", "เจ้าของเสียงเขา"],
  ["rain_omen", "ฝนตกทั้งที่ฟ้าใส", "ฝนสั้น ๆ ตกลงกลางแดดจนทุกคนหยุดงานมองฟ้า ผู้เฒ่าบอกว่าธรรมชาติบางครั้งเตือนก่อนพูด", "ฝนประหลาดทิ้งร่องรอย"],
  ["bread_sharing", "ขนมปังก้อนเดียวแบ่งเกินจำนวน", "มีก้อนขนมปังเก่าเพียงก้อนเดียว แต่คนที่แบ่งกลับทำให้ทุกคนได้ชิ้นเล็ก ๆ เหมือนเป็นพิธีมากกว่าอาหาร", "พิธีแบ่งขนมปัง"],
];
function buildChainEvents(): GameEvent[] {
  const out: GameEvent[] = [];
  chainThemes.forEach(([key, title, intro, follow], index) => {
    const followId = `chain_${key}_follow`;
    out.push(extraEvent({
      id: `chain_${key}_start`, icon: "✦", title, category: "เหตุการณ์ต่อเนื่อง / จุดเริ่ม", text: intro,
      weight: (g) => 2 + (g.year > 1 ? 2 : 0) + (g.labor.explore > 0 ? 3 : 0),
      resources: { knowledge: 3 }, metrics: { morale: index % 3 === 0 ? 1 : 0 }, risk: { conflict: index % 4 === 0 ? 5 : 0, beast: index % 5 === 0 ? 5 : 0 }, path: { knowledge: 1 }, chainTo: followId, rare: index % 7 === 0,
    }));
    out.push(extraEvent({
      id: followId, icon: "◈", title: follow, category: "เหตุการณ์ต่อเนื่อง / ผลสะท้อน", text: `${follow}เกิดขึ้นหลังจากเรื่องก่อนหน้า ผู้คนจึงเข้าใจว่าบางการตัดสินใจไม่ได้จบในเดือนเดียว แต่มันเดินตามค่ายมาอย่างเงียบ ๆ`,
      condition: (g) => g.pendingEvents.includes(followId),
      weight: () => 50,
      resources: { knowledge: 4, food: index % 2 === 0 ? 3 : 0, water: index % 3 === 0 ? 3 : 0, gold: index % 6 === 0 ? 2 : 0 },
      metrics: { trust: 2, morale: 2 }, risk: { conflict: -3, disease: index % 5 === 0 ? 4 : 0 }, path: { knowledge: 1, family: 1 }, rare: index % 7 === 0,
    }));
  });
  return out;
}

function buildExpandedContentEvents(): GameEvent[] {
  return [
    ...survivalEventSeeds.map(extraEvent),
    ...buildAnimalEvents(),
    ...buildExplorationEvents(),
    ...buildFamilyEvents(),
    ...buildChainEvents(),
  ];
}
const expandedContentEvents: GameEvent[] = buildExpandedContentEvents();
const allEvents: GameEvent[] = [...events, ...expandedContentEvents];


function getEvent(id: string): GameEvent {
  return allEvents.find((e) => e.id === id) ?? allEvents[0];
}
function pickEvent(game: GameState): string {
  const pending = game.pendingEvents.find((id) => {
    const ev = getEvent(id);
    return !ev.condition || ev.condition(game);
  });
  if (pending) return pending;
  const candidates = allEvents.filter((event) => event.id !== "first_night" && (!event.condition || event.condition(game)) && !game.recentEventIds.includes(event.id));
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

function makeNewcomer(game: GameState, index = 0, source = "ผู้มาตั้งถิ่นฐานประจำปี"): Person {
  const names = ["Narin", "Boran", "Ysa", "Darin", "Mek", "Sorin", "Lora", "Pavel", "Nia", "Kiran", "Mali", "Arun", "Tala", "Keta", "Ruen", "Noa", "Sana", "Elna", "Tovin", "Mara", "Orin", "Sela"];
  const templates: Array<{ role: string; skill: SkillKey; traits: string[]; ageMin: number; ageMax: number }> = [
    { role: "พรานเร่", skill: "hunter", traits: ["อ่านรอยเก่ง", "ช่างสังเกต"], ageMin: 16, ageMax: 48 },
    { role: "ช่างไม้พเนจร", skill: "builder", traits: ["มือหนัก", "อดทน"], ageMin: 18, ageMax: 55 },
    { role: "ผู้รู้สมุนไพร", skill: "healer", traits: ["มือเบา", "ละเอียดอ่อน"], ageMin: 20, ageMax: 58 },
    { role: "ผู้จดจำเส้นทาง", skill: "keeper", traits: ["ช่างสังเกต", "เรียนรู้ไว"], ageMin: 18, ageMax: 60 },
    { role: "เวรยามไร้สังกัด", skill: "guard", traits: ["กล้าหาญ", "ไม่ค่อยไว้ใจใคร"], ageMin: 17, ageMax: 50 },
    { role: "ชาวไร่พลัดถิ่น", skill: "farmer", traits: ["ชอบช่วยงาน", "สุขุม"], ageMin: 15, ageMax: 62 },
  ];
  const childTraits = ["เกิดไกลบ้าน", "รักนิทาน", "ช่างสังเกต", "เรียนรู้ไว"];
  const elderTraits = ["จำเรื่องเก่า", "สุขุม", "กินน้อย", "เล่านิทานเก่ง"];
  const roll = Math.random();
  let role = "ผู้มาใหม่";
  let skill: SkillKey = "farmer";
  let age = 18;
  let traits: string[] = [];
  if (roll < 0.18) {
    role = "เด็กผู้ติดตาม";
    skill = "child";
    age = 3 + Math.floor(Math.random() * 9);
    traits = [pickFrom(childTraits)];
  } else if (roll < 0.30) {
    role = "เด็กช่วยงาน";
    skill = "child";
    age = 12 + Math.floor(Math.random() * 3);
    traits = [pickFrom(childTraits), "ชอบช่วยงาน"];
  } else if (roll > 0.88) {
    role = "ผู้เฒ่าผู้เดินทาง";
    skill = "elder";
    age = 60 + Math.floor(Math.random() * 15);
    traits = [pickFrom(elderTraits)];
  } else {
    const template = pickFrom(templates);
    role = template.role;
    skill = template.skill;
    age = template.ageMin + Math.floor(Math.random() * (template.ageMax - template.ageMin + 1));
    traits = Array.from(new Set([pickFrom(template.traits), Math.random() > 0.72 ? pickFrom(["กินจุ", "กินน้อย", "ขยันเป็นพิเศษ", "ใจร้อน", "ใจดี", "รักสัตว์"]) : "ยังไม่ถูกพิสูจน์"]));
  }
  const used = new Set(game.people.map((p) => p.name));
  let name = pickFrom(names);
  if (used.has(name)) name = `${name} ${game.year}-${index + 1}`;
  const fragile = age < 15 || age >= 60;
  return {
    id: uid("annual"), name, age, kin: source, role, skill,
    health: clamp((fragile ? 52 : 64) + Math.floor(Math.random() * 24)),
    morale: clamp(44 + Math.floor(Math.random() * 28)), fatigue: fragile ? 8 : 4,
    injured: Math.random() < (fragile ? 0.08 : 0.04), alive: true,
    traits: traits.slice(0, 2),
  };
}

function addAnnualSettlers(game: GameState, changes: string[]): GameState {
  const count = 1 + Math.floor(Math.random() * 10);
  const newcomers: Person[] = [];
  let shadowGame = game;
  for (let i = 0; i < count; i++) {
    const person = makeNewcomer(shadowGame, i, "ผู้มาตั้งถิ่นฐานประจำปี");
    newcomers.push(person);
    shadowGame = { ...shadowGame, people: [...shadowGame.people, person] };
  }
  const workers = newcomers.filter((p) => baseWorkFactor(p) > 0).length;
  const children = newcomers.filter((p) => p.age < 15).length;
  const elders = newcomers.filter((p) => p.age >= 60).length;
  const sick = newcomers.filter((p) => p.injured || p.health < 45).length;
  const firstNightFood = count;
  const firstNightWater = Math.ceil(count * 0.7);
  const shelterPressure = Math.max(0, alivePeople(shadowGame).length - shelterCapacity(game));
  let g: GameState = {
    ...game,
    people: [...game.people, ...newcomers],
    resources: changeResources(game.resources, { food: -firstNightFood, water: -firstNightWater }),
    metrics: changeMetrics(game.metrics, {
      morale: count <= 4 ? 2 : 1,
      trust: count > 7 ? -2 : 1,
      health: shelterPressure > 0 ? -Math.min(6, shelterPressure) : 0,
      cohesion: count > 6 ? -2 : 1,
    }),
    threat: clamp(game.threat + Math.max(0, Math.floor(count / 4) - 1)),
  };
  const preview = newcomers.slice(0, 4).map((p) => `${p.name}(${p.age})`).join(", ");
  g = addLog(g, `ผู้มาตั้งถิ่นฐานประจำปี ${count} คน`, `ปลายปีมีคนเดินทางตามแสงไฟของ ${g.houseName} เข้ามาเพิ่ม ${count} ชีวิต รายชื่อแรกที่ถูกจดไว้คือ ${preview}${count > 4 ? " และคนอื่น ๆ" : ""} การต้อนรับใช้เสบียงคืนแรก ${firstNightFood} อาหาร และ ${firstNightWater} น้ำ`, "milestone", ["ประชากร", "ประจำปี"]);
  g = addNotice(g, { kind: "system", title: `ผู้มาตั้งถิ่นฐานประจำปี ${count} คน`, text: `เพิ่มแรงงานพร้อมทำงาน ${workers} คน เด็ก ${children} คน ผู้สูงอายุ ${elders} คน และผู้เจ็บป่วย ${sick} คน ระบบนี้แยกจากเหตุการณ์ผู้อพยพสุ่ม` });
  changes.push(`ผู้มาตั้งถิ่นฐานประจำปี +${count} คน`);
  if (children || elders || sick) changes.push(`ผู้เปราะบางที่ต้องดูแลเพิ่ม: เด็ก ${children} · ผู้เฒ่า ${elders} · ป่วย/เจ็บ ${sick}`);
  if (shelterPressure > 0) changes.push(`ที่พักเริ่มตึงตัวเกินความจุ ${shelterPressure} คน`);
  const animalState = normalizeAnimalState(g.animalState);
  const broughtAnimals: string[] = [];
  if (Math.random() < 0.22) {
    const pigs = 1 + Math.floor(Math.random() * 2);
    animalState.animals.pigs += pigs;
    broughtAnimals.push(`หมู ${pigs} ตัว`);
  }
  if (Math.random() < 0.14) {
    animalState.animals.cows += 1;
    broughtAnimals.push("วัว 1 ตัว");
  }
  if (broughtAnimals.length) {
    g = { ...g, animalState: { ...animalState, log: [`ครอบครัวผู้มาตั้งถิ่นฐานพาสัตว์มาด้วย: ${broughtAnimals.join(" · ")}`, ...animalState.log].slice(0, 20) } };
    changes.push(`ผู้มาตั้งถิ่นฐานพาสัตว์มาด้วย: ${broughtAnimals.join(" · ")}`);
  }
  return g;
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
  g = applyGriefToKin(g, person);
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
  if (event.id === "migrant_group") {
    g = addMigrantsByChoice(g, selected.id);
  } else if (selected.delta.population && selected.delta.population > 0) {
    for (let i = 0; i < selected.delta.population; i++) g = addPerson(g);
  }
  if (selected.id === "name_child" || selected.id === "quiet_birth") g = addChild(g);
  if (selected.id === "keep_goats") {
    const state = normalizeAnimalState(g.animalState);
    g = { ...g, animalState: { ...state, animals: { ...state.animals, goats: state.animals.goats + 2 }, log: ["พบแพะหลง 2 ตัวและเริ่มเลี้ยงเป็นฝูงแรก", ...state.log].slice(0, 20) } };
  }

  if (selected.id === "take_wild_chickens") {
    const state = normalizeAnimalState(g.animalState);
    g = { ...g, animalState: { ...state, animals: { ...state.animals, chickens: state.animals.chickens + 3 }, log: ["จับไก่ป่าได้ 3 ตัวและเริ่มทำรังหยาบ ๆ ให้มัน", ...state.log].slice(0, 20) } };
  }
  if (selected.id === "buy_cow_pair" || selected.id === "rescue_cow") {
    const state = normalizeAnimalState(g.animalState);
    g = { ...g, animalState: { ...state, animals: { ...state.animals, cows: state.animals.cows + (selected.id === "buy_cow_pair" ? 2 : 1) }, log: [selected.id === "buy_cow_pair" ? "ซื้อวัว 2 ตัวเข้าคอก เป็นภาระใหญ่แต่เป็นอนาคตของนม หนัง และแรงงาน" : "รับวัวผอมหนึ่งตัวไว้ดูแลในค่าย", ...state.log].slice(0, 20) } };
  }
  if (selected.id === "accept_piglets") {
    const state = normalizeAnimalState(g.animalState);
    g = { ...g, animalState: { ...state, animals: { ...state.animals, pigs: state.animals.pigs + 2 }, log: ["รับลูกหมู 2 ตัวไว้เลี้ยง เศษอาหารเริ่มมีความหมายใหม่", ...state.log].slice(0, 20) } };
  }
  if (selected.id === "keep_guard_dog") {
    const state = normalizeAnimalState(g.animalState);
    g = { ...g, animalState: { ...state, animals: { ...state.animals, dogs: state.animals.dogs + 1 }, log: ["สุนัขเฝ้าค่ายตัวหนึ่งเริ่มจำกลิ่นคนในค่ายได้", ...state.log].slice(0, 20) }, metrics: changeMetrics(g.metrics, { security: 2 }) };
  }

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
function outpostYieldText(outpost: Outpost) {
  return Object.entries(outpost.monthly).filter(([, v]) => (v ?? 0) > 0).map(([k, v]) => `${resourceShortLabel(k as ResourceKey)} +${fmt(v ?? 0)}`).join(" · ");
}
function resourceShortLabel(key: ResourceKey) {
  const labels: Record<ResourceKey, string> = { food: "อาหาร", water: "น้ำ", waterReserve: "น้ำสำรอง", fuel: "ฟืน", wood: "ไม้", stone: "หิน", tools: "เครื่องมือ", herbs: "สมุนไพร", hides: "หนังสัตว์", knowledge: "ความรู้", feed: "อาหารสัตว์", ore: "แร่ดิบ", gold: "ทอง", ironOre: "แร่เหล็ก", coal: "ถ่านหิน", timber: "ไม้แปรรูป", bricks: "อิฐเผา", textiles: "ผ้าทอ", salt: "เกลือ", spices: "เครื่องเทศ", influence: "อิทธิพล", steel: "เหล็กกล้า", luxuries: "ฟุ่มเฟือย", warhorses: "ม้ารบ", manpower: "กำลังพล", siegeMaterials: "วัสดุสงคราม" };
  return labels[key] ?? key;
}
function macroLocationKind(location: LocationKey): OutpostKind {
  if (location === "oldCave" || location === "rockyRidge") return "mine";
  if (location === "shallowStream" || location === "marshPools") return "water";
  if (location === "deepWoods") return "wood";
  if (location === "oldTradeRoad") return "trade";
  return "food";
}
function outpostMonthlyFor(location: LocationKey): Partial<Resources> {
  if (location === "oldCave" || location === "rockyRidge") return { ironOre: 8, coal: location === "oldCave" ? 4 : 2, stone: 3 };
  if (location === "deepWoods") return { wood: 6, timber: 3, food: 2 };
  if (location === "shallowStream") return { water: 8, herbs: 2, waterReserve: 2 };
  if (location === "marshPools") return { water: 5, herbs: 4, feed: 3 };
  if (location === "huntingGround") return { food: 8, hides: 2 };
  if (location === "oldTradeRoad") return { gold: 4, salt: 2, spices: 1, influence: 2 };
  if (location === "abandonedCamp") return { tools: 1, knowledge: 4 };
  return { food: 4 };
}
function canEstablishOutpost(game: GameState, location: LocationKey) {
  const loc = normalizeLocations(game.locations)[location];
  return canUseRegionalSystems(game) && loc.discovered && loc.progress >= 100 && !normalizeOutposts(game.outposts).some((o) => o.location === location);
}
function outpostCost(location: LocationKey): Partial<Resources> {
  const kind = macroLocationKind(location);
  if (kind === "mine") return { wood: 45, stone: 25, tools: 4, gold: 25, food: 18, water: 12 };
  if (kind === "trade") return { wood: 35, stone: 15, tools: 2, gold: 40, food: 14, water: 10 };
  return { wood: 28, stone: 10, tools: 2, gold: 18, food: 12, water: 8 };
}
function establishOutpost(game: GameState, location: LocationKey): GameState {
  if (!canEstablishOutpost(game, location) || !hasCost(game, outpostCost(location))) return { ...game, savedText: "ยังตั้งฐานที่มั่นรองไม่ได้ ต้องสำรวจครบ มีวิจัย และมีเสบียงพอ" };
  const data = locationData[location];
  const outpost: Outpost = { id: uid("outpost"), location, name: `ฐาน${data.title}`, kind: macroLocationKind(location), workers: 10 + Math.floor(alivePeople(game).length / 50), level: 1, security: 58, monthly: outpostMonthlyFor(location) };
  let g = payCost(game, outpostCost(location));
  g = { ...g, outposts: [...normalizeOutposts(g.outposts), outpost], locations: { ...normalizeLocations(g.locations), [location]: { ...normalizeLocations(g.locations)[location], outpost: true } }, metrics: changeMetrics(g.metrics, { morale: 3, trust: 2 }), savedText: `ตั้ง${outpost.name}แล้ว` };
  g = addLog(g, `ตั้ง${outpost.name}`, `พื้นที่${data.title}ไม่ได้เป็นแค่เส้นทางสำรวจอีกต่อไป แต่กลายเป็นฐานที่มั่นรองที่ส่งทรัพยากรกลับเมืองทุกเดือน: ${outpostYieldText(outpost)}`, "milestone", ["Outpost", data.title]);
  return g;
}
function resolveMacroSystems(game: GameState, changes: string[]): GameState {
  let g = { ...game, guilds: normalizeGuilds(game.guilds), outposts: normalizeOutposts(game.outposts), factions: normalizeFactions(game.factions) };
  if (g.outposts.length) {
    const total: Partial<Resources> = {};
    for (const o of g.outposts) {
      for (const [key, value] of Object.entries(o.monthly)) total[key as ResourceKey] = (total[key as ResourceKey] ?? 0) + (value ?? 0) * o.level;
      if (o.security < 35 && Math.random() < 0.12) {
        g = { ...g, threat: clamp(g.threat + 4), metrics: changeMetrics(g.metrics, { security: -2 }) };
        changes.push(`${o.name} รายงานภัยบนเส้นทางส่งเสบียง`);
      }
    }
    g = { ...g, resources: changeResources(g.resources, total) };
    changes.push(`ฐานที่มั่นรองส่งทรัพยากรกลับเมือง: ${Object.entries(total).filter(([,v]) => (v ?? 0) > 0).map(([k,v]) => `${resourceShortLabel(k as ResourceKey)} +${fmt(v ?? 0)}`).join(" · ")}`);
  }
  if (stageRank(g.stage) >= stageRank("เมืองการค้า")) {
    const guilds = normalizeGuilds(g.guilds);
    const hunterLevel = Math.max(guilds.huntersGuild.level, g.buildings.huntersGuildHall);
    const builderLevel = Math.max(guilds.buildersGuild.level, g.buildings.buildersGuildHall);
    const merchantLevel = Math.max(guilds.merchantsGuild.level, g.buildings.merchantsGuildHall);
    const macro: Partial<Resources> = {};
    if (hunterLevel > 0) { macro.food = (macro.food ?? 0) + hunterLevel * 18; macro.hides = (macro.hides ?? 0) + hunterLevel; }
    if (builderLevel > 0) { macro.timber = (macro.timber ?? 0) + builderLevel * 5; macro.bricks = (macro.bricks ?? 0) + builderLevel * 3; }
    if (merchantLevel > 0 && g.resources.gold >= 8 * merchantLevel) { macro.salt = (macro.salt ?? 0) + merchantLevel * 2; macro.spices = (macro.spices ?? 0) + merchantLevel; macro.influence = (macro.influence ?? 0) + merchantLevel * 2; g = { ...g, resources: changeResources(g.resources, { gold: -8 * merchantLevel }) }; }
    if (Object.keys(macro).length) { g = { ...g, resources: changeResources(g.resources, macro) }; changes.push(`สมาคมเมืองจัดผลผลิตมหภาค: ${Object.entries(macro).map(([k,v]) => `${resourceShortLabel(k as ResourceKey)} +${fmt(v ?? 0)}`).join(" · ")}`); }
  }
  if (g.buildings.sawmill > 0 && g.resources.wood >= 10) { const make = Math.min(8 * g.buildings.sawmill, Math.floor(g.resources.wood / 5)); g = { ...g, resources: changeResources(g.resources, { wood: -make * 5, timber: make }) }; changes.push(`โรงเลื่อยแปรไม้เป็นไม้แปรรูป +${make}`); }
  if (g.buildings.brickKiln > 0 && g.resources.stone >= 8 && g.resources.fuel >= 4) { const make = Math.min(6 * g.buildings.brickKiln, Math.floor(g.resources.stone / 4), Math.floor(g.resources.fuel / 2)); g = { ...g, resources: changeResources(g.resources, { stone: -make * 4, fuel: -make * 2, bricks: make }) }; changes.push(`เตาเผาผลิตอิฐเผา +${make}`); }
  if (g.buildings.smeltery > 0 && g.resources.ironOre >= 3 && g.resources.coal >= 2) { const make = Math.min(10 * g.buildings.smeltery, Math.floor(g.resources.ironOre / 3), Math.floor(g.resources.coal / 2)); g = { ...g, resources: changeResources(g.resources, { ironOre: -make * 3, coal: -make * 2, steel: make }) }; changes.push(`โรงถลุงผลิตเหล็กกล้า +${make}`); }
  return g;
}
function resolveProduction(game: GameState): { game: GameState; changes: string[] } {
  let g = { ...game, labor: normalizeLabor(game) };
  const l = g.labor;
  const season = seasonOf(g.month);
  const warmFood = season === "ฤดูใบไม้ผลิ" || season === "ฤดูร้อน" || season === "ฤดูใบไม้ร่วง";
  const terrain = terrainData[g.terrain ?? "riverbank"];
  const forageRate = ((season === "ฤดูหนาว" ? 3 : season === "ฤดูฝน" ? 4 : 5) + (g.origin === "hunter" ? 1 : 0) + skillCount(g, "hunter") * 0.35) * (1 + terrain.forage) * weatherProductionFactor(g, "food");
  const farmRate = l.farm ? ((season === "ฤดูหนาว" ? 1 : season === "ฤดูฝน" ? 6 : warmFood ? 7 : 4) + g.buildings.farmPlot * 1.5 + (g.researchDone.basicFarming ? 1 : 0)) * weatherProductionFactor(g, "food") : 0;
  const woodRate = (5 + (g.researchDone.stoneTools ? 1 : 0) + (g.buildings.workshop ? 1.2 : 0) + skillCount(g, "builder") * 0.25) * (1 + terrain.wood) * weatherProductionFactor(g, "wood");
  const stoneRate = (2.5 + (g.researchDone.stoneTools ? 0.8 : 0) + (g.buildings.workshop ? 0.7 : 0) + skillCount(g, "builder") * 0.15) * (1 + terrain.stone);
  const researchRate = (4 + (g.origin === "keeper" ? 1 : 0) + (g.leaderFocus === "study" ? 2 : 0) + skillCount(g, "keeper") * 0.35) * weatherProductionFactor(g, "research");
  const foodGain = Math.round(l.forage * forageRate + l.farm * farmRate + l.patrol * 1.5 + (g.leaderFocus === "leadForage" ? Math.max(3, l.forage * 2) : 0));
  const woodGain = Math.round(l.wood * woodRate);
  const stoneGain = Math.round(l.stone * stoneRate);
  const knowledgeGain = Math.round(l.research * (researchRate + (g.researchDone.projectPlanning ? 0.8 : 0)) + l.teach * 4 + l.intel * 2 + (g.leaderFocus === "study" ? 4 : 0));
  const waterGain = Math.round(l.water * ((g.buildings.well ? 9 : 5) * (1 + terrain.water)) * weatherProductionFactor(g, "water") + (g.researchDone.waterFinding ? 2 : 0) + (g.buildings.waterTrough > 0 ? 1 : 0) + (g.buildings.cistern > 0 && season === "ฤดูฝน" ? 2 : 0));
  const fuelGain = Math.floor(l.wood * 1.4);
  const toolsGain = Math.floor(l.craft * (g.buildings.workshop ? 1.5 : 0.8));
  const toolWoodCost = l.craft > 0 ? Math.min(g.resources.wood, l.craft * 2) : 0;
  const herbsGain = Math.round(l.herbs * (g.researchDone.herbalWorkshop ? 4 : g.researchDone.herbalCare ? 3 : 2) + (g.buildings.healerHut ? 1 : 0) + (g.researchDone.herbalWorkshop && l.care > 0 ? 1 : 0));
  const tradeFood = l.trade ? Math.min(Math.max(0, g.resources.food - foodNeedFor(g) * 2), l.trade * 3) : 0;
  const tradeHides = l.trade ? Math.min(g.resources.hides, l.trade) : 0;
  const tradeHerbs = l.trade ? Math.min(g.resources.herbs, l.trade) : 0;
  const goldGain = Math.round(l.trade * 2 + tradeFood * 0.8 + tradeHides * 2 + tradeHerbs * 1.5);
  const feedGain = Math.round(l.feed * (g.buildings.livestockShed ? 6 : g.buildings.animalPen ? 5 : 3) + (g.researchDone.fodderPrep && g.labor.farm > 0 ? 1 : 0) + (g.researchDone.animalBreeding ? 1 : 0));
  const routeBonus = locationMonthlyBonus(g);
  g = { ...g, resources: changeResources(g.resources, { food: foodGain - tradeFood + (routeBonus.food ?? 0), wood: woodGain - toolWoodCost + (routeBonus.wood ?? 0), stone: stoneGain + (routeBonus.stone ?? 0), knowledge: knowledgeGain + (routeBonus.knowledge ?? 0), water: waterGain + (routeBonus.water ?? 0), fuel: fuelGain + (routeBonus.fuel ?? 0), tools: toolsGain + (routeBonus.tools ?? 0), herbs: herbsGain - tradeHerbs + (routeBonus.herbs ?? 0), hides: -tradeHides + (routeBonus.hides ?? 0), gold: goldGain + (routeBonus.gold ?? 0), feed: feedGain + (routeBonus.feed ?? 0), ore: (routeBonus.ore ?? 0), waterReserve: 0 }) };
  if (l.patrol > 0) g = { ...g, metrics: changeMetrics(g.metrics, { security: Math.min(5, l.patrol * 2) }), threat: clamp(g.threat - l.patrol * 3, 0, 100) };
  if (l.water > 0) g = { ...g, metrics: changeMetrics(g.metrics, { health: Math.min(4, l.water) }) };
  if (l.herbs > 0) g = { ...g, metrics: changeMetrics(g.metrics, { health: Math.min(4, l.herbs) }) };
  if (l.teach > 0) g = { ...g, metrics: changeMetrics(g.metrics, { cohesion: Math.min(4, l.teach * 2), morale: Math.min(3, l.teach) }) };
  const changes = [`ผลิตอาหาร +${foodGain}`, `ไม้ +${woodGain}`, `หิน +${stoneGain}`, `ความรู้ +${knowledgeGain}`, `น้ำ +${waterGain}`, `ฟืน +${fuelGain}`];
  g = applyWaterReserve(g, changes);
  if (feedGain) changes.push(`อาหารสัตว์ +${feedGain}`);
  if (Object.keys(routeBonus).length) changes.push(`เส้นทางที่สำรวจแล้วส่งทรัพยากรกลับค่าย: ${locationMonthlyBonusText(g)}`);
  g = resolveMacroSystems(g, changes);
  if (l.intel > 0) {
    g = { ...g, metrics: changeMetrics(g.metrics, { security: Math.min(3, l.intel), trust: Math.min(2, l.intel) }), threat: clamp(g.threat - l.intel, 0, 100) };
    const newsPool: Array<Omit<Rumor, "id" | "discovered">> = [
      { title: "คาราวานบนถนนเก่า", detail: "คนเดินทางพูดถึงพ่อค้าที่อาจผ่านใกล้ถิ่นฐาน หากมีของส่วนเกิน อาจเปลี่ยนเป็นทองหรือเครื่องมือได้", danger: "ต่ำ" },
      { title: "กลุ่มโจรในป่าสน", detail: "มีข่าวว่าคนถืออาวุธเดินตามรอยควันไฟของชุมชนเล็ก ๆ การเฝ้ายามจะสำคัญขึ้น", danger: "สูง" },
      { title: "ราคาสมุนไพรดีขึ้น", detail: "หมอยาจากทางใต้ต้องการสมุนไพรแห้ง หากมีเก็บไว้มากพอ อาจใช้แลกของได้", danger: "ต่ำ" },
      { title: "ครอบครัวเร่ร่อนมองหาที่พัก", detail: "คนไร้ถิ่นฐานบางกลุ่มกำลังมองหาที่ปลอดภัย การรับเข้ามาอาจเพิ่มแรงงานและความเสี่ยงพร้อมกัน", danger: "กลาง" },
    ];
    if (Math.random() < Math.min(0.75, 0.28 * l.intel) && g.rumors.length < 24) {
      const rumor = pickFrom(newsPool);
      g = { ...g, rumors: [{ id: uid("rumor"), discovered: false, ...rumor }, ...g.rumors].slice(0, 24) };
      changes.push(`สายข่าวได้เบาะแสใหม่: ${rumor.title}`);
    } else {
      changes.push("สายข่าวช่วยกรองข่าวลือและลดความไม่แน่นอนของถิ่นฐาน");
    }
  }
  if (toolsGain) changes.push(`เครื่องมือ +${toolsGain}`);
  if (herbsGain) changes.push(`สมุนไพร +${herbsGain}`);
  if (goldGain) changes.push(`ทอง +${goldGain} จากการแลกเปลี่ยนของส่วนเกิน`);
  if (toolWoodCost) changes.push(`ใช้ไม้ซ่อม/ผลิตเครื่องมือ -${toolWoodCost}`);
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
  const waterNeed = waterNeedFor(g);
  if (g.resources.water < waterNeed && (g.resources.waterReserve ?? 0) > 0) g = drawWaterReserve(g, waterNeed - g.resources.water, changes);
  if (g.resources.water >= waterNeed) {
    g = { ...g, resources: changeResources(g.resources, { water: -waterNeed }) };
    changes.push(`ใช้น้ำ -${waterNeed}`);
  } else {
    const shortage = waterNeed - g.resources.water;
    g = { ...g, resources: { ...g.resources, water: 0 }, metrics: changeMetrics(g.metrics, { health: -7 - shortage, morale: -3 }) };
    changes.push(`น้ำไม่พอ ขาด ${shortage} หน่วย`);
  }
  if (animalCount(g) > 0) {
    const animalResult = resolveAnimals(g);
    g = animalResult.game;
    changes.push(...animalResult.changes);
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
  const spoilResearch = (g.researchDone.foodPreservation ? 0.04 : 0) + l.preserve * 0.025;
  const spoilSeason = season === "ฤดูฝน" || season === "ฤดูร้อน" ? 0.05 : 0;
  const excess = Math.max(0, g.resources.food - 35 - g.buildings.storage * 40);
  const spoil = Math.floor(excess * Math.max(0, spoilBase + spoilSeason - spoilResearch));
  if (spoil > 0) {
    g = { ...g, resources: changeResources(g.resources, { food: -spoil }), metrics: changeMetrics(g.metrics, { morale: -1 }) };
    changes.push(`อาหารเสีย -${spoil}`);
  }
  if (l.preserve > 0) {
    const preserveFuel = Math.min(g.resources.fuel, l.preserve);
    g = { ...g, resources: changeResources(g.resources, { fuel: -preserveFuel }), metrics: changeMetrics(g.metrics, { trust: 1 }) };
    if (preserveFuel) changes.push(`ถนอมอาหาร ใช้ฟืน -${preserveFuel}`);
  }
  if (g.construction) {
    const data = buildingData[g.construction.id];
    const power = l.build * (6 + (g.origin === "builder" ? 1 : 0) + (g.buildings.workshop ? 1 : 0) + (g.researchDone.projectPlanning ? 1.2 : 0) + (g.researchDone.masonry ? 0.8 : 0) + (g.leaderFocus === "workWithPeople" ? 1 : 0));
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
    const power = (l.research + Math.floor(l.teach * 0.6)) * (6 + (g.origin === "keeper" ? 1 : 0)) + (g.leaderFocus === "study" ? 5 : 0);
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

function applyExpandedLeaderFocus(game: GameState, f: LeaderFocusKey, changes: string[]): GameState {
  let g = game;
  const state = normalizeAnimalState(g.animalState);
  const effectMap: Record<string, { resources?: Partial<Resources>; metrics?: Partial<Metrics>; threat?: number; fatigue?: number; animalHunger?: number; animalHealth?: number; note: string; woundChance?: number; rumor?: Omit<Rumor, "id" | "discovered"> }> = {
    waterMarshal: { resources: { water: 6 }, metrics: { health: 3 }, note: "ผู้นำตรวจแหล่งน้ำด้วยตนเอง น้ำสะอาดถูกแยกจากน้ำเสี่ยงชัดเจนขึ้น" },
    herbWalk: { resources: { herbs: 4, knowledge: 2 }, metrics: { health: 2 }, note: "หมอยาเดินดูพืชกับผู้นำ สมุนไพรที่เคยมองข้ามถูกจดจำ" },
    fieldHands: { resources: { food: 5 }, metrics: { trust: 2 }, note: "ผู้นำลงแปลงกับคนเพาะปลูก มือเปื้อนดินช่วยให้คำสั่งมีน้ำหนักขึ้น" },
    woodlineSurvey: { resources: { wood: 5, knowledge: 1 }, metrics: { security: 1 }, note: "แนวไม้ถูกอ่านใหม่ เส้นทางตัดไม้ปลอดภัยขึ้น" },
    stoneMeasure: { resources: { stone: 4, knowledge: 2 }, metrics: { health: 1 }, note: "ฐานรากถูกวัดก่อนยกของหนัก งานหินเริ่มมีระเบียบ" },
    toolAudit: { resources: { tools: 1, wood: -1 }, metrics: { health: 2 }, note: "เครื่องมือที่แตกร้าวถูกแยกซ่อมก่อนทำให้มือใครบาด" },
    childLessons: { resources: { knowledge: 3 }, metrics: { morale: 2, health: 1 }, note: "เด็ก ๆ ได้เรียนรู้ว่าจะช่วยงานอย่างไรโดยไม่เอาตัวไปเสี่ยงเกินวัย" },
    elderCouncil: { resources: { knowledge: 4 }, metrics: { cohesion: 3, trust: 1 }, note: "คำของผู้เฒ่าทำให้คนหนุ่มสาวเห็นว่าความช้าไม่ใช่ความอ่อนแอเสมอไป" },
    animalLedger: { animalHunger: -10, animalHealth: 5, metrics: { morale: 1 }, note: "จำนวนสัตว์และอาหารสัตว์ถูกนับชัดเจน ความหิวของฝูงลดลง" },
    smokeWatch: { metrics: { health: 4 }, resources: { fuel: -1 }, note: "ควันในที่พักถูกจัดทางออก ผู้คนตื่นมาพร้อมคอที่แสบน้อยลง" },
    shelterRounds: { metrics: { morale: 2, health: 2 }, fatigue: -4, note: "ที่นอนและรอยรั่วถูกตรวจทีละจุด การพักฟื้นดีขึ้น" },
    marketGreeting: { resources: { gold: 3, knowledge: 2 }, metrics: { trust: 1 }, note: "พ่อค้าถูกต้อนรับอย่างระวัง คำพูดดี ๆ แปรเป็นราคาที่ไม่โหดนัก" },
    migrantInterview: { metrics: { fairness: 3, trust: 2 }, resources: { knowledge: 2 }, note: "ผู้มาใหม่ถูกถามชื่อ ฝีมือ และบาดแผลก่อนตัดสินใจรับเข้าเส้นกองไฟ" },
    justiceHearing: { metrics: { fairness: 6, trust: 2, morale: -1 }, note: "วงไต่สวนเปิดขึ้นต่อหน้าคนทั้งค่าย โทษจึงไม่ใช่เพียงอารมณ์ของผู้มีอำนาจ" },
    trailMarkers: { resources: { knowledge: 3, wood: -1 }, metrics: { security: 2 }, note: "รอยขีดและหลักไม้ทำให้เส้นทางไม่กลืนคนสำรวจง่ายเหมือนก่อน" },
    weatherReading: { metrics: { health: 2 }, resources: { fuel: 2 }, note: "ทิศลมและกลิ่นฝนถูกอ่านก่อนค่ำ ค่ายเตรียมตัวก่อนฟ้าเปลี่ยน" },
    fireDiscipline: { resources: { fuel: 4 }, metrics: { health: 1 }, note: "กองไฟถูกจัดเป็นเวลา เถ้าร้อนและฟืนถูกใช้คุ้มขึ้น" },
    quietMeal: { resources: { food: -2 }, metrics: { morale: 5, trust: 2 }, fatigue: -3, note: "มื้อเงียบ ๆ ร่วมกับคนอ่อนแรงทำให้บางคนรู้ว่าตนยังถูกมองเห็น" },
    nightStories: { resources: { knowledge: 3 }, metrics: { morale: 4, cohesion: 2 }, note: "เรื่องเล่าก่อนนอนทำให้เด็กหลับและผู้ใหญ่จำได้ว่าตนรอดมาเพื่ออะไร" },
    seedSaving: { resources: { food: -3, knowledge: 3 }, metrics: { trust: 1 }, note: "เมล็ดและอาหารบางส่วนถูกกันไว้สำหรับวันข้างหน้า ท้องวันนี้เบาลงเพื่อฤดูหน้า" },
    sicknessLedger: { resources: { knowledge: 2 }, metrics: { health: 5 }, note: "อาการป่วยถูกจดชื่อ ไม่ปล่อยให้ไข้ของแต่ละคนปะปนเป็นความกลัวก้อนเดียว" },
    watchRotation: { metrics: { security: 5, morale: 1 }, fatigue: -5, threat: -2, note: "เวรยามถูกหมุนใหม่ คนเดิมไม่ต้องแบกความมืดทุกคืน" },
    constructionBrief: { resources: { knowledge: 2 }, metrics: { health: 2, trust: 1 }, note: "ช่างและแรงงานรู้ก่อนว่าอะไรต้องยก อะไรต้องค้ำ อุบัติเหตุจึงถอยห่าง" },
    researchCircle: { resources: { knowledge: 6 }, metrics: { morale: 1 }, note: "วงเรียนรู้หลังเลิกงานทำให้ความรู้ไม่อยู่แต่ในมือผู้จดจำ" },
    funeralCare: { metrics: { morale: 4, cohesion: 4, trust: 1 }, note: "ครอบครัวผู้สูญเสียถูกนั่งเคียงข้าง ชื่อของคนตายไม่ถูกปล่อยให้เย็นไปลำพัง" },
    scavengerRules: { resources: { tools: 1, knowledge: 2 }, metrics: { fairness: 2 }, note: "ของจากซากเก่าถูกนับก่อนแบ่ง ลดมือไวและลดโรคจากของสกปรก" },
    riverGuard: { resources: { water: 3 }, metrics: { security: 2, health: 1 }, note: "ริมลำธารถูกเฝ้าในเวลาที่สัตว์ลงน้ำและเด็กชอบเล่นไกลตา" },
    rationKitchen: { resources: { food: 2 }, metrics: { fairness: 4, cohesion: 1 }, note: "ครัวกลางทำให้ถ้วยอาหารผ่านสายตาหลายคน ความลับในหม้อจึงน้อยลง" },
    craftMentor: { resources: { tools: 1, knowledge: 2 }, metrics: { morale: 1 }, note: "ช่างสอนมือใหม่ให้ฟังเสียงไม้และโลหะก่อนมันแตก" },
    beastFence: { metrics: { security: 4 }, threat: -3, resources: { wood: -1 }, note: "แนวกลิ่นสัตว์และรั้วหยาบถูกตรวจใหม่ เงาในป่าถอยไปอีกนิด" },
    roadWhisper: { resources: { knowledge: 5, gold: 1 }, threat: 1, note: "ข่าวริมถนนเก่าถูกเก็บกลับมา แต่ควันไฟของค่ายก็ถูกคนอื่นเห็นเช่นกัน", rumor: { title: "เสียงล้อบนถนนเก่า", detail: "มีคาราวานหรือคนเร่ร่อนผ่านถนนใกล้ค่ายมากกว่าที่คิด", danger: "กลาง" } },
    birthSupport: { resources: { food: -2, fuel: -1 }, metrics: { health: 4, trust: 2 }, note: "พื้นที่อบอุ่นถูกกันไว้ให้แม่ เด็ก และคนที่กำลังจะคลอดความหวังใหม่" },
    oreTest: { resources: { ore: 1, knowledge: 3 }, metrics: { morale: 1 }, note: "หินสีเข้มถูกทุบและเผาลอง กลิ่นโลหะจาง ๆ ทำให้ช่างเงียบลงด้วยความคิด" },
    sharedOath: { metrics: { cohesion: 6, trust: 2, morale: 2 }, note: "คำมั่นถูกกล่าวรอบกองไฟ คนใหม่และคนเก่าเริ่มมีคำว่าเราเหมือนกัน" },
    restPlan: { metrics: { health: 3, morale: 2 }, fatigue: -10, note: "การพักถูกแบ่งเป็นรอบ งานไม่หยุดทั้งค่าย แต่ร่างกายคนไม่ถูกใช้จนหมด" },
    dogTrail: { metrics: { security: 4 }, threat: -2, note: "สุนัขนำคนเฝ้ารอยรอบค่าย กลิ่นแปลกที่คนไม่เห็นถูกพบก่อนรุ่งสาง" },
    cowCare: { animalHunger: -8, animalHealth: 4, resources: { water: -1 }, note: "วัวได้หญ้าและน้ำตามเวลา สัตว์ใหญ่ที่รอดวันนี้อาจเป็นกำลังของวันหน้า" },
    pigWaste: { animalHealth: 5, metrics: { health: 2 }, note: "เศษอาหารและโคลนถูกแยกจากที่นอนหมู กลิ่นคอกลดลงพร้อมโอกาสโรค" },
    chickenRoost: { resources: { food: 2, wood: -1 }, animalHealth: 2, note: "รังไก่ถูกยกให้พ้นพื้นชื้น เช้าวันถัดมามีไข่และขนน้อยลงที่หายไป" },
    mapCouncil: { resources: { knowledge: 4 }, metrics: { security: 1 }, note: "แผนที่หยาบถูกกาง คนสำรวจรู้ว่าตนจะไปทำไม ไม่ใช่เพียงเดินออกไปเสี่ยง" },
  };
  const effect = effectMap[f];
  if (!effect) return g;
  if (effect.resources) g = { ...g, resources: changeResources(g.resources, effect.resources) };
  if (effect.metrics) g = { ...g, metrics: changeMetrics(g.metrics, effect.metrics) };
  if (typeof effect.threat === "number") g = { ...g, threat: clamp(g.threat + effect.threat, 0, 100) };
  if (typeof effect.fatigue === "number") { const fatigueDelta = effect.fatigue; g = { ...g, people: g.people.map(p => p.alive ? { ...p, fatigue: clamp(p.fatigue + fatigueDelta) } : p) }; }
  if (typeof effect.animalHunger === "number" || typeof effect.animalHealth === "number") {
    const st = normalizeAnimalState(g.animalState);
    g = { ...g, animalState: { ...st, hunger: clamp(st.hunger + (effect.animalHunger ?? 0)), health: clamp(st.health + (effect.animalHealth ?? 0)), log: [effect.note, ...st.log].slice(0, 20) } };
  }
  if (effect.rumor) g = { ...g, rumors: [{ id: uid("rumor"), discovered: false, ...effect.rumor }, ...g.rumors].slice(0, 24) };
  if (effect.woundChance && Math.random() * 100 < effect.woundChance) g = woundSomeone(g, effect.note);
  changes.push(effect.note);
  return g;
}

function applyLeaderFocus(game: GameState, changes: string[]): GameState {
  const f = game.leaderFocus;
  let g = game;
  g = applyExpandedLeaderFocus(g, f, changes);
  if (f === "workWithPeople") { g = { ...g, metrics: changeMetrics(g.metrics, { trust: 3, morale: 2 }), pathScores: { ...g.pathScores, family: g.pathScores.family + 1 } }; changes.push("ผู้นำลงมือกับชาวบ้าน +ความไว้ใจ"); }
  if (f === "study") { g = { ...g, resources: changeResources(g.resources, { knowledge: 5 }) }; changes.push("ผู้นำศึกษาภูมิปัญญา +ความรู้"); }
  if (f === "trainGuard") { g = { ...g, metrics: changeMetrics(g.metrics, { security: 5 }), threat: clamp(g.threat - 2, 0, 100) }; changes.push("ฝึกเวรยาม +ความปลอดภัย"); }
  if (f === "family") { g = { ...g, metrics: changeMetrics(g.metrics, { morale: 3, cohesion: 3 }) }; changes.push("ดูแลครอบครัว +ขวัญกำลังใจ"); }
  if (f === "scout") { g = { ...g, resources: changeResources(g.resources, { knowledge: 3, water: 4 }), threat: clamp(g.threat + 1, 0, 100) }; changes.push("สำรวจพื้นที่ +ข่าวลือ/ความรู้"); if (Math.random() < 0.18) g = { ...g, rumors: [{ id: uid("rumor"), title: "แสงไฟบนเนินไกล", detail: "กลางคืนมีคนเห็นแสงเล็ก ๆ บนเนิน อาจเป็นค่ายอื่นหรือเพียงฟอสฟอรัสในหนองน้ำ", danger: "กลาง", discovered: false }, ...g.rumors] }; }
  if (f === "mediate") { g = { ...g, metrics: changeMetrics(g.metrics, { fairness: 4, trust: 2, cohesion: 2 }) }; changes.push("ไกล่เกลี่ยข้อขัดแย้ง +ความยุติธรรม"); }
  if (f === "rationPlan") { g = { ...g, metrics: changeMetrics(g.metrics, { fairness: 2, morale: -1 }), resources: changeResources(g.resources, { food: 2 }) }; changes.push("วางแผนเสบียง ลดสูญเสียอาหาร"); }
  if (f === "inspectRations") { g = { ...g, metrics: changeMetrics(g.metrics, { fairness: 4, trust: 2, morale: -1 }), resources: changeResources(g.resources, { food: 1 }) }; changes.push("ผู้นำเปิดคลังและนับเสบียงต่อหน้าทุกคน +ความยุติธรรม"); }
  if (f === "leadForage") { g = { ...g, resources: changeResources(g.resources, { food: 7, hides: Math.random() < 0.25 ? 1 : 0 }), metrics: changeMetrics(g.metrics, { trust: 2, health: -1 }), threat: clamp(g.threat + 1, 0, 100) }; changes.push("ผู้นำนำคนออกหาอาหารด้วยตนเอง บัฟงานหาอาหารของเดือนนี้และเพิ่มอาหารโดยตรง แต่เพิ่มความเสี่ยงจากป่า"); if (Math.random() < 0.14) { g = woundSomeone(g, "ผู้นำพาคนออกหาอาหารแล้วเกิดอุบัติเหตุในป่า"); changes.push("การออกหาอาหารนำบาดแผลกลับมาด้วย"); } }
  if (f === "boilHerbs") { if (g.resources.herbs < 2 && g.buildings.healerHut === 0) { changes.push("ตั้งใจจะต้มสมุนไพร แต่สมุนไพรไม่พอ จึงช่วยได้เพียงเฝ้าดูอาการ"); } else { const cost = g.resources.herbs >= 2 ? 2 : 0; g = { ...g, resources: changeResources(g.resources, { herbs: -cost }), metrics: changeMetrics(g.metrics, { health: 6, morale: 1 }) }; changes.push(cost ? "ต้มสมุนไพรแจกทั้งค่าย -สมุนไพร +สุขภาพ" : "หมอยาประคองไข้ด้วยความรู้ที่มี +สุขภาพ"); } }
  if (f === "isolateSick") { g = { ...g, metrics: changeMetrics(g.metrics, { health: 5, trust: 1, morale: -1 }) }; changes.push("แยกผู้ป่วยออกจากที่พักรวม ลดโอกาสโรคแพร่"); }
  if (f === "nightPatrol") { g = { ...g, metrics: changeMetrics(g.metrics, { security: 7, morale: -1 }), threat: clamp(g.threat - 5, 0, 100) }; changes.push("ผู้นำเดินเวรยามกลางคืน +ความปลอดภัย"); }
  if (f === "trackBeasts") { g = { ...g, metrics: changeMetrics(g.metrics, { security: 4 }), resources: changeResources(g.resources, { food: 3 }), threat: clamp(g.threat - 3, 0, 100) }; changes.push("ตามรอยสัตว์ก่อนมันกลับมา ลดภัยสัตว์ป่า"); if (Math.random() < 0.12) { g = woundSomeone(g, "ตามรอยสัตว์ในป่าลึก"); changes.push("การตามรอยสัตว์แลกมาด้วยความเสี่ยง"); } }
  if (f === "animalCare") {
    const state = normalizeAnimalState(g.animalState);
    g = { ...g, animalState: { ...state, hunger: clamp(state.hunger - 12), health: clamp(state.health + 8), log: [`ผู้นำตรวจคอกด้วยตนเอง ลดความตื่นกลัวและความหิวของสัตว์`, ...state.log].slice(0, 20) }, metrics: changeMetrics(g.metrics, { morale: 1, security: 1 }) };
    changes.push("ผู้นำตรวจคอกและดูแลสัตว์เลี้ยง ลดโอกาสสัตว์หนี/ป่วย");
  }
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
  const healPower = g.labor.care + Math.floor(g.labor.herbs * 0.8) + g.buildings.healerHut * 2 + (g.origin === "healer" ? 1 : 0) + Math.floor(skillCount(g, "healer") / 2);
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
  const restRecovery = 6 + g.buildings.shelter * 2 + g.buildings.campfire * 2 + g.buildings.meetingHall + g.buildings.smokeVent * 2 + (g.researchDone.woodShelter ? 2 : 0) + (g.researchDone.shelterHygiene ? 2 : 0);
  const workBuffer = Math.min(6, g.buildings.shelter + g.buildings.campfire + g.buildings.smokeVent + (g.researchDone.projectPlanning ? 2 : 0));
  const people = g.people.map((p) => {
    if (!p.alive) return p;
    const assignedJob = assignedJobOf(g, p.id);
    const baseFactor = baseWorkFactor(p);
    const rawFatigueGain = baseFactor > 0 && assignedJob ? Math.max(0, 5 + personJobBonus(p, assignedJob) * 2 + overwork * 5 - g.labor.care - Math.floor(g.labor.teach * 0.5) - workBuffer * 0.55) : -restRecovery;
    const fatigue = clamp(p.fatigue + rawFatigueGain - (g.leaderFocus === "family" ? 2 : 0) - (g.leaderFocus === "quietRest" ? 4 : 0));
    const fatigueHealthCost = fatigue > 88 ? 6 : fatigue > 75 ? 3 : fatigue > 60 ? 1 : 0;
    const health = clamp(p.health - fatigueHealthCost + (g.labor.care > 0 ? 1 : 0));
    return { ...p, fatigue, health, injured: health < 35 ? true : p.injured };
  });
  g = { ...g, people };
  const exhausted = alivePeople(g).filter((p) => p.fatigue >= 85 && p.health < 70 && !p.injured);
  if (exhausted.length && Math.random() * 100 < Math.min(35, exhausted.length * 8 + risk.disease * 0.08)) {
    const target = pickFrom(exhausted);
    g = { ...g, people: g.people.map((p) => p.id === target.id ? { ...p, injured: true, health: clamp(p.health - 8), cause: "ความเหนื่อยสะสมทำให้ล้มป่วย" } : p), metrics: changeMetrics(g.metrics, { health: -3, morale: -1 }) };
    changes.push(`${target.name} ล้มป่วยจากความเหนื่อยสะสม`);
  }
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
  g = addAnnualSettlers(g, changes);
  const fertileAdults = alivePeople(g).filter((p) => p.age >= 18 && p.age <= 42 && !p.injured && p.health > 45);
  const birthChance = Math.max(0, 4 + Math.min(8, fertileAdults.length) + Math.floor((g.metrics.morale + g.metrics.health + g.metrics.cohesion - 150) / 18));
  if (fertileAdults.length >= 2 && alivePeople(g).length < shelterCapacity(g) + 6 && Math.random() * 100 < birthChance) {
    g = addChild(g);
    g = addNotice(g, { kind: "birth", title: "เสียงร้องแรกเกิดในค่าย", text: "ครอบครัวหนึ่งมีเด็กเกิดใหม่ ความหวังเพิ่มขึ้นพร้อมภาระอาหาร น้ำ และการปกป้องที่มากขึ้น" });
    changes.push("มีเด็กเกิดใหม่ในค่าย +ประชากร แต่เพิ่มภาระดูแลระยะยาว");
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
  g = applyGriefToKin(g, person);
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
  let g = applyChoice(normalizeAdvancedSystems(game), event, selected);
  const earlyChanges: string[] = [];
  g = applyCampPolicies(g, earlyChanges);
  g = applyWeatherMonth(g, earlyChanges);
  const prod = resolveProduction(g);
  g = prod.game;
  const changes = [...earlyChanges, ...prod.changes];
  g = resolveExploration(g, changes);
  g = applyRealismRisks(g, changes);
  g = applySkillMastery(g, changes);
  g = processGriefRecovery(g, changes);
  g = resolveDelayed(g);
  g = maybeAdvanceStage(g);
  let nextMonth = g.month + 1;
  let nextYear = g.year;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
    g = ageYear(g, changes);
    g = resolveBuildingMaintenance(g, changes);
    g = maybeCreateEndgameCrisis(g, changes);
    g = advanceEndgameCrisis(g, changes);
    g = addLog(g, `สรุปปีที่ ${g.year}`, `ปีที่ ${g.year} ผ่านไปพร้อมประชากร ${alivePeople(g).length} คน ผู้จากไปสะสม ${g.casualties.length} คน และความทรงจำ ${g.memories.length} เรื่อง`, "milestone", ["สรุปปี"]);
    g = appendResourceYearHistory(g);
    changes.push(`ขึ้นปีที่ ${nextYear}`);
  }
  const recent = [event.id, ...g.recentEventIds].slice(0, 7);
  let nextBase: GameState = { ...g, year: nextYear, month: nextMonth, recentEventIds: recent, pendingEvents: g.pendingEvents.filter((id) => id !== event.id), currentEventId: "", selectedChoiceId: null, leaderFocus: "workWithPeople", leaderActionSelected: false, savedText: "กำลังจดบันทึก..." };
  nextBase = updateCollapseAndGameOver(nextBase);
  const nextEventId = nextBase.gameOver ? event.id : pickEvent(nextBase);
  if (!nextBase.gameOver) {
    const nextEvent = getEvent(nextEventId);
    if (isPriorityEvent(nextEvent)) {
      const kind: NoticeKind = nextEvent.category.includes("พ่อค้า") || nextEvent.category.includes("การค้า") ? "trade" : nextEvent.category.includes("ภัย") || nextEvent.category.includes("โจร") || nextEvent.category.includes("สัตว์") ? "threat" : "event";
      nextBase = addNotice(nextBase, { kind, title: nextEvent.title, text: nextEvent.text, eventId: nextEventId });
    }
  }
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
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [eventPopupOpen, setEventPopupOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Event ประจำเดือนและการกระทำผู้นำจะไม่เด้งกลางจออัตโนมัติ เพื่อให้ flow เงียบและไม่รบกวนการเล่น
    // เหตุการณ์สำคัญยังถูกเก็บในกระดิ่ง และผู้เล่นเปิดอ่าน/ตัดสินใจจาก panel ได้เอง
    if (!game) return;
    setEventPopupOpen(false);
  }, [game?.currentEventId]);

  useEffect(() => {
    const syncDeviceMode = () => setDeviceMode(detectDeviceMode());
    syncDeviceMode();
    window.addEventListener("resize", syncDeviceMode);
    window.addEventListener("orientationchange", syncDeviceMode);
    return () => {
      window.removeEventListener("resize", syncDeviceMode);
      window.removeEventListener("orientationchange", syncDeviceMode);
    };
  }, []);


  useEffect(() => {
    const saved = window.localStorage.getItem(themeKey);
    setTheme(saved === "dark" ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeKey, theme);
  }, [theme]);

  useEffect(() => {
    let setup = defaultSetup();
    const setupText = readFirstStorage([setupKey, ...legacySetupKeys]);
    if (setupText) {
      try {
        const parsed = JSON.parse(setupText) as Partial<{ leaderName: string; houseName: string; origin: Origin }>;
        setup = {
          leaderName: parsed.leaderName || setup.leaderName,
          houseName: parsed.houseName || setup.houseName,
          origin: parsed.origin || setup.origin,
        };
      } catch {}
    }
    window.localStorage.setItem(setupKey, JSON.stringify(setup));

    const saveText = readFirstStorage([saveKey, ...legacySaveKeys]);
    if (saveText) {
      try {
        const loaded = JSON.parse(saveText) as GameState;
        const migrated: GameState = ensureGameState({
          ...loaded,
          leaderActionSelected: loaded.leaderActionSelected ?? false,
          selectedChoiceId: loaded.selectedChoiceId ?? null,
          currentEventId: loaded.currentEventId || "first_night",
          pendingEvents: loaded.pendingEvents || [],
          delayedEvents: loaded.delayedEvents || [],
          recentEventIds: loaded.recentEventIds || [],
          rumors: loaded.rumors || [],
          savedText: "เปิดบันทึกเดิมแล้ว · migrated",
        } as GameState);
        window.localStorage.setItem(saveKey, JSON.stringify(migrated));
        setGame(normalizeAdvancedSystems(migrated));
        return;
      } catch {}
    }

    setGame(normalizeAdvancedSystems(createInitialGame(setup)));
  }, []);


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

  const event = useMemo(() => game ? getEvent(game.currentEventId) : allEvents[0], [game]);
  useEffect(() => {
    // ไม่เปิดหน้าต่างเหตุการณ์อัตโนมัติ ยกเว้นผู้เล่นกดอ่านเอง เพื่อให้ flow เงียบและไม่รบกวนการวางแผน
    if (!game?.currentEventId) return;
    setEventPopupOpen(false);
  }, [game?.currentEventId, game?.year, game?.month]);
  const availableWorkers = game ? adultWorkers(game) : 0;
  const risk = game ? riskPreview(game) : { food: 0, shelter: 0, disease: 0, beast: 0, conflict: 0, weather: 0, accident: 0 };

  if (!game) return <main className={`app device-${deviceMode} theme-${theme}`}><div className="panel pad">กำลังก่อไฟและเปิดบันทึกค่าย...</div></main>;

  function updateGame(fn: (g: GameState) => GameState) { setGame((prev) => prev ? fn(prev) : prev); }
  function adjustLabor(key: LaborKey, amount: number) {
    updateGame((g) => {
      const current = g.labor[key] ?? 0;
      const allowed = new Set(unlockedLaborOptions(g).map((item) => item.id));
      if (!allowed.has(key)) return g;
      if (amount > 0 && laborTotal(g.labor) >= adultWorkers(g)) return { ...g, savedText: "แรงงานเต็มแล้ว" };
      const labor = { ...normalizeLabor(g), [key]: Math.max(0, current + amount) };
      return { ...g, labor };
    });
  }
  function assignPersonLabor(personId: string, job: LaborKey | "") {
    updateGame((g) => {
      const nextAssignments: LaborAssignments = {};
      for (const key of Object.keys(emptyLabor()) as LaborKey[]) {
        nextAssignments[key] = (g.laborAssignments?.[key] ?? []).filter((id) => id !== personId);
      }
      if (job) {
        const allowed = new Set(unlockedLaborOptions(g).map((item) => item.id));
        const person = g.people.find((p) => p.id === personId);
        if (!allowed.has(job) || !person || baseWorkFactor(person) <= 0) return { ...g, savedText: "คนนี้ยังไม่พร้อมทำงานนั้น" };
        nextAssignments[job] = [...(nextAssignments[job] ?? []), personId];
      }
      const normalizedAssignments = normalizeLaborAssignments(g, nextAssignments);
      const labor = deriveLaborFromAssignments(g, normalizedAssignments);
      return { ...g, laborAssignments: normalizedAssignments, labor, savedText: job ? "จัดแรงงานรายบุคคลแล้ว" : "พักคนงานแล้ว" };
    });
  }
  function setMigrantSelection(ids: string[]) {
    updateGame((g) => ({ ...g, flags: { ...g.flags, migrantSelectedIds: ids.join(",") }, savedText: ids.length ? `เลือกผู้มาใหม่ ${ids.length} คนไว้พิจารณา` : "ล้างรายชื่อผู้มาใหม่ที่เลือกแล้ว" }));
  }
  function jumpToPeopleFor(job?: LaborKey) {
    setView("คน");
    updateGame((g) => ({ ...g, savedText: job ? `เปิดแท็บคนแล้ว ลองกรองหรือจัดคนไปงาน ${laborMeta.find((item) => item.id === job)?.title ?? job}` : "เปิดแท็บคนแล้ว" }));
  }
  function startConstruction(id: BuildingKey) {
    updateGame((g) => {
      if (!buildingUnlocked(g, id)) return g;
      const paused = g.pausedConstruction ?? [];
      const saved = paused.find((p) => p?.id === id) ?? null;
      let next: GameState = g;
      if (g.construction && g.construction.id !== id) next = { ...next, pausedConstruction: [g.construction, ...paused.filter((p) => p?.id !== g.construction?.id)] };
      if (saved) return { ...next, construction: saved, pausedConstruction: (next.pausedConstruction ?? []).filter((p) => p?.id !== id), savedText: `กลับมาทำ ${buildingData[id].title} ต่อ` };
      if (!hasCost(next, buildingData[id].cost)) return { ...next, savedText: "ทรัพยากรไม่พอสำหรับเริ่มก่อสร้าง" };
      return { ...payCost(next, buildingData[id].cost), construction: { id, progress: 0 }, savedText: g.construction ? `พักงานเดิมแล้วเริ่ม ${buildingData[id].title}` : `เริ่มก่อสร้าง ${buildingData[id].title}` };
    });
  }
  function pauseConstruction() {
    updateGame((g) => g.construction ? { ...g, pausedConstruction: [g.construction, ...(g.pausedConstruction ?? []).filter((p) => p?.id !== g.construction?.id)], construction: null, savedText: "พักงานก่อสร้างไว้ก่อน เพื่อโยกแรงงานไปงานเร่งด่วน" } : g);
  }
  function cancelConstruction(id?: BuildingKey) {
    updateGame((g) => {
      const target = id ? ((g.construction?.id === id ? g.construction : null) ?? (g.pausedConstruction ?? []).find((p) => p?.id === id) ?? null) : g.construction;
      if (!target) return g;
      const cost = buildingData[target.id].cost;
      const refund = Object.fromEntries(Object.entries(cost).map(([k, v]) => [k, Math.floor((v ?? 0) * 0.5)])) as Partial<Resources>;
      return { ...g, resources: changeResources(g.resources, refund), construction: g.construction?.id === target.id ? null : g.construction, pausedConstruction: (g.pausedConstruction ?? []).filter((p) => p?.id !== target.id), savedText: `ยกเลิก ${buildingData[target.id].title} และคืนทรัพยากรบางส่วน` };
    });
  }
  function startResearch(id: ResearchKey) {
    updateGame((g) => {
      if (!researchUnlocked(g, id) || g.researchDone[id]) return g;
      const paused = g.pausedResearch ?? [];
      const saved = paused.find((p) => p?.id === id) ?? null;
      let next: GameState = g;
      if (g.activeResearch && g.activeResearch.id !== id) next = { ...next, pausedResearch: [g.activeResearch, ...paused.filter((p) => p?.id !== g.activeResearch?.id)] };
      if (saved) return { ...next, activeResearch: saved, pausedResearch: (next.pausedResearch ?? []).filter((p) => p?.id !== id), savedText: `กลับมาศึกษา ${researchData[id].title} ต่อ` };
      return { ...next, activeResearch: { id, progress: 0 }, savedText: g.activeResearch ? `พักงานวิจัยเดิมแล้วเริ่ม ${researchData[id].title}` : `เริ่มศึกษา ${researchData[id].title}` };
    });
  }
  function pauseResearch() {
    updateGame((g) => g.activeResearch ? { ...g, pausedResearch: [g.activeResearch, ...(g.pausedResearch ?? []).filter((p) => p?.id !== g.activeResearch?.id)], activeResearch: null, savedText: "พักงานวิจัยไว้ก่อน เพื่อโยกแรงงานไปเรื่องเร่งด่วน" } : g);
  }
  function cancelResearch(id?: ResearchKey) {
    updateGame((g) => {
      const target = id ? ((g.activeResearch?.id === id ? g.activeResearch : null) ?? (g.pausedResearch ?? []).find((p) => p?.id === id) ?? null) : g.activeResearch;
      if (!target) return g;
      return { ...g, activeResearch: g.activeResearch?.id === target.id ? null : g.activeResearch, pausedResearch: (g.pausedResearch ?? []).filter((p) => p?.id !== target.id), savedText: `ยกเลิกการศึกษา ${researchData[target.id].title} ความคืบหน้าส่วนนั้นจะหายไป` };
    });
  }
  function endTurn() { updateGame((g) => {
    const normalizedAssignments = normalizeLaborAssignments(g, g.laborAssignments ?? {});
    const labor = deriveLaborFromAssignments(g, normalizedAssignments);
    const used = laborAssignmentLoad(g, normalizedAssignments);
    const available = workerCapacity(g);
    if (used > available + 0.01) return { ...g, savedText: `จัดคนเกินกำลังจริง ${Math.round((used - available) * 10) / 10} หน่วย กรุณาพักบางคนก่อนจบเดือน` };
    if (!g.leaderActionSelected) return { ...g, savedText: "ต้องเลือกการกระทำของผู้นำก่อนจบเดือน" };
    if (!g.selectedChoiceId) return { ...g, savedText: "ต้องเลือกวิธีตอบสนองเหตุการณ์ก่อนจบเดือน" };
    if (g.currentEventId === "migrant_group" && g.selectedChoiceId === "accept_selected_migrants" && selectedMigrantIds(g).length === 0) return { ...g, savedText: "ต้องติ๊กเลือกผู้มาใหม่อย่างน้อย 1 คน หรือเลือกวิธีรับแบบอื่น" };
    return g.gameOver ? g : advanceMonth({ ...g, laborAssignments: normalizedAssignments, labor });
  }); }
  function restartSameSetup() {
    if (!game) return;
    const setup = { leaderName: game.leaderName, houseName: game.houseName, origin: game.origin };
    window.localStorage.setItem(setupKey, JSON.stringify(setup));
    window.localStorage.removeItem(saveKey);
    legacySaveKeys.forEach((key) => window.localStorage.removeItem(key));
    setGame(normalizeAdvancedSystems(createInitialGame(setup)));
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
    legacySaveKeys.forEach((key) => window.localStorage.removeItem(key));
    window.localStorage.removeItem(setupKey);
    legacySetupKeys.forEach((key) => window.localStorage.removeItem(key));
    router.push("/");
  }

  if (game.gameOver) {
    return <GameOverScreen game={game} restartSameSetup={restartSameSetup} resetGame={resetGame} />;
  }

  const visibleViews = views.filter((v) => v !== "นโยบาย" || canUsePolicies(game));
  const safeView = visibleViews.includes(view) ? view : "เมือง";

  return (
    <main className={`app device-${deviceMode} theme-${theme}`}>
      <header className="topbar">
        <div className="brand"><div className="brand-mark">⌛</div><span>EVOLUTION<br />OF US</span></div>
        <div className="top-stats">
          <span className="pill">ปี {game.year} · เดือน {game.month}</span>
          <span className={normalizeWeatherState(game.weather).kind === "ปกติ" ? "pill" : "pill warn"}>{seasonalWeatherLabel(game)}</span>
          <span className="pill good">ระยะ: {game.stage}</span>
          <span className="pill">แผนที่ {locationDiscoveryCount(game)}/8 · เป้าหมาย {locationData[bestExploreTarget(game)].title}</span>
          <span className="pill">ประชากร {alivePeople(game).length}</span>
          <span className="pill">ใช้คน {laborAssignmentLoad(game).toFixed(1)}/{workerCapacity(game).toFixed(1)} · ผลผลิต {laborTotal(game.labor).toFixed(1)}</span>
          <span className="pill">ตระกูล {game.houseName}</span>
          <span className="pill warn">ภัยภายนอก {pct(game.threat)}</span>
          <span className="pill gold-pill">คลังเมือง 🪙 {fmt(game.resources.gold)}</span>
          <span className={crisisLevel(game) === "ใกล้ล่มสลาย" || crisisLevel(game) === "วิกฤต" ? "pill danger-pill" : "pill good"}>วิกฤต: {crisisLevel(game)}</span>
          <span className="pill">Alpha v{GAME_VERSION}</span>
          <span className="pill">มุมมอง: {deviceLabel(deviceMode)}</span>
          <span className="pill good">{game.savedText}</span>
        </div>
        <button className="icon-btn notice-btn" onClick={() => setNoticeOpen(true)}>🔔{(game.notifications ?? []).filter((n) => !n.read && isImportantNotice(n)).length > 0 && <span>{(game.notifications ?? []).filter((n) => !n.read && isImportantNotice(n)).length}</span>}</button>
        <button className="icon-btn" onClick={() => setView("ตั้งค่า")}>⚙️</button>
      </header>

      <section className="shell">
        <aside className="sidebar">
          <ProfilePanel game={game} />
          <ResourceMiniPanel game={game} />
          <เป้าหมายsPanel game={game} />
          <RiskPanel game={game} risk={risk} />
          <ForecastPanel game={game} />
        </aside>

        <section className="main">
          <nav className="view-tabs">
            {visibleViews.map((v) => <button key={v} className={safeView === v ? "active" : ""} onClick={() => setView(v)}>{viewLabel(v)}</button>)}
          </nav>
          {safeView === "เมือง" && <CityView game={game} />}
          {safeView === "ทรัพยากร" && <ResourcesView game={game} />}
          {safeView === "คน" && <PeopleView game={game} assignPersonLabor={assignPersonLabor} applyRecommendedAssignments={() => updateGame((g) => { const laborAssignments = recommendedAssignments(g); return { ...g, laborAssignments, labor: deriveLaborFromAssignments(g, laborAssignments), savedText: "จัดแรงงานตามความถนัดแล้ว" }; })} />}
          {safeView === "แผนที่" && <MapView game={game} setExploreTarget={(target) => updateGame((g) => ({ ...g, exploreTarget: target, savedText: `เลือกเส้นทางสำรวจ: ${locationData[target].title}` }))} establishOutpost={(target) => updateGame((g) => establishOutpost(g, target))} />}
          {safeView === "ก่อสร้าง" && <BuildView game={game} startConstruction={startConstruction} pauseConstruction={pauseConstruction} cancelConstruction={cancelConstruction} jumpToPeopleFor={jumpToPeopleFor} />}
          {safeView === "วิจัย" && <ResearchView game={game} startResearch={startResearch} pauseResearch={pauseResearch} cancelResearch={cancelResearch} jumpToPeopleFor={jumpToPeopleFor} />}
          {safeView === "สัตว์เลี้ยง" && <AnimalsView game={game} setAnimalAction={(action) => updateGame((g) => ({ ...g, animalAction: action, savedText: `ตั้งแผนสัตว์เลี้ยง: ${animalActionLabel(action)}` }))} />}
          {safeView === "นโยบาย" && <PoliciesView game={game} updatePolicies={(patch) => updateGame((g) => ({ ...g, policies: { ...normalizePolicies(g.policies), ...patch }, savedText: "ปรับนโยบายค่ายแล้ว" }))} />}
          {safeView === "ข่าวสาร" && <NewsView game={game} applyTrade={(offerId) => updateGame((g) => applyTradeOffer(g, offerId))} />}
          {safeView === "พงศาวดาร" && <ChronicleView game={game} />}
          {safeView === "ตั้งค่า" && <SettingsView game={game} resetGame={resetGame} showTutorialAgain={showTutorialAgain} theme={theme} setTheme={setTheme} />}
        </section>

        <aside className="event-panel">
          <button className="primary" style={{ width: "100%", marginBottom: 12 }} onClick={() => setEventPopupOpen(true)}>อ่าน/ตัดสินใจเหตุการณ์เดือนนี้</button><EventPanel game={game} event={event} setFocus={(focus) => updateGame((g) => ({ ...g, leaderFocus: focus, leaderActionSelected: true }))} selectChoice={(id) => updateGame((g) => ({ ...g, selectedChoiceId: id }))} setMigrantSelection={setMigrantSelection} endTurn={endTurn} />
        </aside>
      </section>

      <nav className="bottom-nav">
        {visibleViews.map((v) => <button key={v} className={safeView === v ? "active" : ""} onClick={() => setView(v)}>{viewLabel(v)}</button>)}
        <button onClick={endTurn}>จบเดือนนี้ →</button>
      </nav>

      {tutorialOpen && (
        <TutorialModal
          step={tutorialStep}
          setStep={setTutorialStep}
          close={dismissTutorial}
        />
      )}

      {eventPopupOpen && (
        <div className="modal-backdrop">
          <section className="modal event-modal">
            <div className="split">
              <div><div className="kicker">แจ้งเตือนเหตุการณ์สำคัญ</div><h2 className="summary-title">{event.title}</h2></div>
              <button className="secondary" onClick={() => setEventPopupOpen(false)}>ย่อไว้ก่อน</button>
            </div>
            <p style={{ lineHeight: 1.8 }}>{event.text}</p>
            <EventPanel game={game} event={event} setFocus={(focus) => updateGame((g) => ({ ...g, leaderFocus: focus, leaderActionSelected: true }))} selectChoice={(id) => updateGame((g) => ({ ...g, selectedChoiceId: id }))} setMigrantSelection={setMigrantSelection} endTurn={endTurn} />
          </section>
        </div>
      )}

      {noticeOpen && (
        <div className="modal-backdrop">
          <section className="modal notice-modal">
            <div className="split"><h2 className="summary-title">ศูนย์แจ้งเตือน</h2><button className="secondary" onClick={() => setNoticeOpen(false)}>ปิด</button></div>
            {(game.notifications ?? []).filter(isImportantNotice).length === 0 ? <p className="muted">ยังไม่มีแจ้งเตือนสำคัญ</p> : <div className="timeline">{(game.notifications ?? []).filter(isImportantNotice).map((n) => <div key={n.id} className="log"><b>{n.kind === "trade" ? "🪙" : n.kind === "threat" ? "⚠️" : n.kind === "birth" ? "👶" : n.kind === "event" ? "✦" : "🔔"} {n.title}</b><small>ปี {n.year} เดือน {n.month}</small><p>{n.text}</p></div>)}</div>}
          </section>
        </div>
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
  const plan = currentStagePlan(game);
  const progress = stageProgressPercent(game);
  return (
    <section className="panel pad">
      <div className="split">
        <div>
          <div className="kicker">เป้าหมายระยะนี้</div>
          <h3 className="section-title">{plan.title}</h3>
          <p className="muted small">{plan.goal}</p>
        </div>
        <span className="badge green">{progress}%</span>
      </div>
      <div className="bar" style={{ margin: "10px 0 12px" }}><div className="fill" style={{ width: `${progress}%` }} /></div>
      {stageเป้าหมายs(game).map((o) => <div className="objective" key={o.text}><span className={o.done ? "check done" : "check"}>{o.done ? "✓" : "•"}</span><span>{o.text}</span></div>)}
      <details className="details-box compact-details"><summary>รางวัลเมื่อผ่านระยะนี้</summary><p>{plan.reward}</p><div className="deltas">{plan.unlocked.map((u) => <span key={u} className="badge blue">{u}</span>)}</div></details>
    </section>
  );
}
function RiskPanel({ game, risk }: { game: GameState; risk: Risks }) {
  const items: Array<[keyof Risks, string]> = [["food", "อาหาร"], ["shelter", "ที่พัก"], ["disease", "โรค"], ["beast", "สัตว์ป่า"], ["conflict", "ขัดแย้ง"], ["weather", "อากาศ"], ["accident", "อุบัติเหตุ"]];
  const reasons = riskReasons(game, risk);
  const fillClass = (value: number) => value >= 70 ? "fill danger-deep" : value >= 50 ? "fill danger" : value >= 30 ? "fill warn" : "fill";
  const toneClass = (value: number) => value >= 70 ? "danger-text" : value >= 50 ? "danger-text" : value >= 30 ? "warn-text" : "good-text";
  return <section className="panel pad"><h3 className="section-title">ความเสี่ยงก่อนจบเดือน</h3><div className="stat-list">{items.map(([k, label]) => <div key={k} className="risk-row"><div className="mini-stat"><span>{label}: <b className={toneClass(risk[k])}>{riskLabel(risk[k])}</b></span><b className={toneClass(risk[k])}>{pct(risk[k])}</b><div className="bar"><div className={fillClass(risk[k])} style={{ width: `${clamp(risk[k])}%` }} /></div></div><small className="muted">{reasons[k].slice(0, 2).join(" · ")}</small></div>)}</div></section>;
}
function ForecastPanel({ game }: { game: GameState }) {
  const tier = threatTier(game);
  return (
    <section className="panel pad">
      <h3 className="section-title">เดือนหน้าอาจเกิดอะไร</h3>
      <div className="timeline compact">{nextMonthForecast(game).map((line, i) => <div key={`${line}-${i}`} className="forecast-line">• {line}</div>)}</div>
      <div className="threat-mini"><b>{tier.icon} {tier.level}: {tier.name}</b><small>{tier.text}</small></div>
    </section>
  );
}

function ResourceMiniPanel({ game }: { game: GameState }) {
  const rows = resourceLedger(game).filter((row) => row.stock > 0 || Math.abs(row.net) > 0 || ["อาหาร", "น้ำ", "ฟืน", "ไม้", "หิน", "เครื่องมือ", "ทอง"].includes(row.name));
  return (
    <section className="panel pad resource-mini-panel">
      <div className="split">
        <div>
          <div className="kicker">บัญชีทรัพยากร</div>
          <h3 className="section-title">คงเหลือ +/− เดือนนี้</h3>
        </div>
        <span className="badge">แบบย่อ</span>
      </div>
      <div className="resource-flow-list">
        {rows.map((row) => (
          <div className="resource-flow-row" key={row.name} title={row.note}>
            <span><b>{row.icon} {row.name}</b><small>{fmt(row.stock)} {row.net >= 0 ? "+" : ""}{fmt(row.net)}</small></span>
            <strong className={row.net >= 0 ? "good-text" : "danger-text"}>{row.net >= 0 ? "+" : ""}{fmt(row.net)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResourceFlowCards({ game }: { game: GameState }) {
  return <ResourceLedgerDetailed game={game} compact />;
}

function ResourcesView({ game }: { game: GameState }) {
  const quality = qualityStatus(game);
  const history = resourceTrendPoints(game);
  const foodNeed = foodNeedFor(game);
  const waterNeed = waterNeedFor(game);
  return (
    <div>
      <section className="dashboard-grid resource-kpi-grid">
        <div className="panel kpi"><span className="muted">อาหาร / เดือนนี้</span><b>{fmt(game.resources.food)} <small className={resourceLedger(game)[0].net >= 0 ? "good-text" : "danger-text"}>{resourceLedger(game)[0].net >= 0 ? "+" : ""}{fmt(resourceLedger(game)[0].net)}</small></b><small>ต้องใช้ประมาณ {fmt(foodNeed)} ต่อเดือน</small></div>
        <div className="panel kpi"><span className="muted">น้ำ / เดือนนี้</span><b>{fmt(game.resources.water)} <small className={resourceLedger(game)[1].net >= 0 ? "good-text" : "danger-text"}>{resourceLedger(game)[1].net >= 0 ? "+" : ""}{fmt(resourceLedger(game)[1].net)}</small></b><small>คนและสัตว์ต้องใช้น้ำรวม {fmt(waterNeed)} ต่อเดือน</small></div>
        <div className="panel kpi"><span className="muted">ทรัพย์สินเมือง</span><b>🪙 {fmt(game.resources.gold)}</b><small>ทองมาจากการค้า/ขายส่วนเกิน ใช้ซื้อของฉุกเฉิน</small></div>
        <div className="panel kpi"><span className="muted">คุณภาพชีวิต</span><b>{pct(Math.round((quality.foodQuality + quality.waterQuality + quality.shelterQuality) / 3))}</b><small>อาหาร {pct(quality.foodQuality)} · น้ำ {pct(quality.waterQuality)} · ที่พัก {pct(quality.shelterQuality)}</small></div>
      </section>
      <ResourceLedgerDetailed game={game} />
      <ResourceHistoryChart game={game} history={history} />
      <ResourceNotesPanel game={game} />
    </div>
  );
}

function ResourceLedgerDetailed({ game, compact = false }: { game: GameState; compact?: boolean }) {
  const rows = resourceDisplayRows(game).filter((row) => row.stock > 0 || Math.abs(row.net) > 0 || ["อาหาร", "น้ำ", "น้ำสำรอง", "ฟืน", "ไม้", "หิน", "เครื่องมือ", "สมุนไพร", "ทอง"].includes(row.name));
  return (
    <section className="panel pad resource-flow-cards resource-ledger-section" style={{ marginBottom: 14 }}>
      <div className="split"><div><h3 className="section-title">บัญชีทรัพยากรประจำเดือน</h3><p className="muted small">อ่านจาก “คงเหลือ / ผลิต / ใช้ / สุทธิ” เพื่อเห็นทันทีว่าค่ายกำลังสะสมหรือขาดทุนทรัพยากรใด</p></div><span className="badge green">คงเหลือ / สุทธิเดือนนี้</span></div>
      <div className={compact ? "resource-card-grid" : "resource-detail-grid"}>
        {rows.map((row) => <article key={row.name} className="resource-card resource-detail-card"><b>{row.icon} {row.name}</b><span>{fmt(row.stock)} <em className={row.net >= 0 ? "good-text" : "danger-text"}>{row.net >= 0 ? "+" : ""}{fmt(row.net)}</em></span><small className="muted">ผลิต +{fmt(row.produced)} · ใช้ -{fmt(row.used)}</small>{!compact && <p className="muted small">{row.note}</p>}</article>)}
      </div>
    </section>
  );
}

function ResourceHistoryChart({ game, history }: { game: GameState; history: ResourceHistoryYear[] }) {
  const rows: Array<{ key: ResourceKey; icon: string; label: string; color: string }> = [
    { key: "food", icon: "🍲", label: "อาหาร", color: "#c84d45" },
    { key: "water", icon: "💧", label: "น้ำ", color: "#4d8fd4" },
    { key: "waterReserve", icon: "🏺", label: "น้ำสำรอง", color: "#6da9a9" },
    { key: "fuel", icon: "🔥", label: "ฟืน", color: "#e58f2c" },
    { key: "wood", icon: "🪵", label: "ไม้", color: "#7f6a52" },
    { key: "stone", icon: "🪨", label: "หิน", color: "#8f98a6" },
    { key: "gold", icon: "🪙", label: "ทอง", color: "#c9a33d" },
    ...(stageRank(game.stage) >= stageRank("เมืองการค้า") ? [
      { key: "ironOre" as ResourceKey, icon: "⛏️", label: "แร่เหล็ก", color: "#7b8794" },
      { key: "timber" as ResourceKey, icon: "🪚", label: "ไม้แปรรูป", color: "#9b7a4a" },
      { key: "steel" as ResourceKey, icon: "⚔️", label: "เหล็กกล้า", color: "#9aa4b2" },
    ] : []),
  ];
  const points = history.length ? history : [makeResourceYearSnapshot(game)];
  const maxValue = Math.max(1, ...points.flatMap((p) => rows.map((row) => p.stocks[row.key] ?? 0)));
  const width = 760;
  const height = 280;
  const padding = { top: 18, right: 16, bottom: 34, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const xAt = (i: number) => padding.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const yAt = (value: number) => padding.top + innerH - (Math.max(0, value) / maxValue) * innerH;
  return (
    <section className="panel pad resource-history-section" style={{ marginBottom: 14 }}>
      <div className="split"><div><h3 className="section-title">กราฟย้อนหลังรายปี</h3><p className="muted small">เก็บสูงสุด 10 ปีล่าสุด หากเกิน 10 ปี ระบบจะตัดปีเก่าที่สุดออกอัตโนมัติ</p></div><span className="badge blue">{points.length}/10 ปี</span></div>
      <div className="history-line-wrap">
        <svg viewBox={`0 0 ${width} ${height}`} className="history-line-chart" role="img" aria-label="กราฟย้อนหลังทรัพยากรรายปี">
          {[0, .25, .5, .75, 1].map((tick) => {
            const y = padding.top + innerH - innerH * tick;
            const value = Math.round(maxValue * tick);
            return <g key={`tick-${tick}`}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} className="chart-grid" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="chart-label">{value}</text>
            </g>;
          })}
          {rows.map((row) => {
            const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i)} ${yAt(p.stocks[row.key] ?? 0)}`).join(" ");
            return <g key={row.key}>
              <path d={d} fill="none" stroke={row.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              {points.map((p, i) => <circle key={`${row.key}-${p.year}`} cx={xAt(i)} cy={yAt(p.stocks[row.key] ?? 0)} r="3.5" fill={row.color}><title>{`ปี ${p.year} • ${row.label} ${fmt(p.stocks[row.key] ?? 0)}`}</title></circle>)}
            </g>;
          })}
          {points.map((p, i) => <text key={`year-${p.year}`} x={xAt(i)} y={height - 8} textAnchor="middle" className="chart-label">{p.year}</text>)}
        </svg>
      </div>
      <div className="line-legend">
        {rows.map((row) => <span key={row.key} className="line-legend-item"><i style={{ background: row.color }} />{row.icon} {row.label}</span>)}
      </div>
      <p className="muted small">เส้นแต่ละสีแสดง “คงเหลือปลายปี” ของทรัพยากรหลัก ช่วยดูแนวโน้มระยะยาวของชุมชนได้ในหน้าเดียว</p>
    </section>
  );
}

function ResourceNotesPanel({ game }: { game: GameState }) {
  const rows = resourceLedger(game);
  const negative = rows.filter((r) => r.net < 0).slice(0, 4);
  const positive = rows.filter((r) => r.net > 0).slice(0, 4);
  return (
    <section className="two-col" style={{ marginBottom: 14 }}>
      <div className="panel pad"><h3 className="section-title">สิ่งที่ควรจับตา</h3>{negative.length ? negative.map((r) => <p key={r.name} className="muted small">• {r.icon} <b>{r.name}</b> กำลังลดลงสุทธิ {fmt(Math.abs(r.net))} ต่อเดือน — {r.note}</p>) : <p className="muted small">เดือนนี้ยังไม่มีทรัพยากรหลักที่ติดลบชัดเจน ค่ายมีเวลาจัดลำดับงานต่อไป</p>}</div>
      <div className="panel pad"><h3 className="section-title">จุดแข็งของเดือนนี้</h3>{positive.length ? positive.map((r) => <p key={r.name} className="muted small">• {r.icon} <b>{r.name}</b> เพิ่มสุทธิ +{fmt(r.net)} — ใช้ส่วนเกินนี้วางแผนก่อสร้าง วิจัย หรือแลกเปลี่ยน</p>) : <p className="muted small">ผลผลิตยังไม่พอสะสม ควรจัดคนให้ตรงกับงานสำคัญก่อนจบเดือน</p>}</div>
    </section>
  );
}

function OriginBuffPanel({ game }: { game: GameState }) {
  const origin = originInfo(game.origin);
  return (
    <section className="panel pad origin-panel" style={{ marginBottom: 14 }}>
      <div className="split">
        <div><div className="kicker">พื้นหลังเริ่มต้น</div><h3 className="section-title">{origin.icon} {origin.title}</h3></div>
        <span className="badge green">บัฟมีผลในระบบจริง</span>
      </div>
      <p className="muted small">{origin.gameplay}</p>
      <div className="deltas">{origin.bonuses.map((b) => <span key={b} className="badge blue">{b}</span>)}</div>
    </section>
  );
}


function migrantSeed(game: GameState) { return game.year * 97 + game.month * 53 + alivePeople(game).length * 11 + game.resources.food; }
function buildMigrantCandidates(game: GameState): Person[] {
  const seed = migrantSeed(game);
  const count = Math.max(1, Math.min(10, (seed % 10) + 1));
  const names = ["Nalan", "Tira", "Sovan", "Keth", "Mali", "Arun", "Lysa", "Ren", "Daro", "Pim", "Noa", "Yen", "Kavi", "Sira"];
  const roles: Array<{ skill: SkillKey; role: string; trait: string }> = [
    { skill: "farmer", role: "ชาวไร่เร่ร่อน", trait: "คุ้นงานดิน" },
    { skill: "builder", role: "ช่างซ่อมเกวียน", trait: "มือไม้มั่นคง" },
    { skill: "hunter", role: "พรานหลงทาง", trait: "อ่านรอยเท้า" },
    { skill: "healer", role: "ผู้ต้มยา", trait: "รู้สมุนไพร" },
    { skill: "keeper", role: "ผู้จดจำเรื่องเก่า", trait: "จำเก่ง" },
    { skill: "guard", role: "อดีตเวรยาม", trait: "ระวังภัย" },
  ];
  return Array.from({ length: count }).map((_, i) => {
    const child = i % 5 === 0;
    const elder = !child && i % 7 === 0;
    const age = child ? 5 + ((seed + i * 7) % 10) : elder ? 60 + ((seed + i * 3) % 18) : 15 + ((seed + i * 9) % 42);
    const base = roles[(seed + i * 5) % roles.length];
    const skill: SkillKey = age < 12 ? "child" : age >= 60 ? "elder" : base.skill;
    const role = age < 12 ? "เด็กผู้ลี้ภัย" : age >= 60 ? "ผู้เฒ่าไร้บ้าน" : base.role;
    const health = 35 + ((seed + i * 13) % 58);
    const traits = [age < 12 ? "ต้องดูแล" : age >= 60 ? "มีประสบการณ์" : base.trait, health < 45 ? "อ่อนแรง" : "ยังมีแรงเดิน"];
    return { id: `migrant-${seed}-${i}`, name: `${names[(seed + i * 2) % names.length]} ${i + 1}`, age, kin: "ผู้มาใหม่", role, skill, health, morale: 44 + ((seed + i * 11) % 26), fatigue: 20 + ((seed + i * 5) % 35), injured: health < 40, alive: true, traits };
  });
}
function selectedMigrantIds(game: GameState): string[] {
  const raw = String(game.flags?.migrantSelectedIds ?? "");
  return raw.split(",").map((item) => item.trim()).filter(Boolean);
}
function migrantImpact(people: Person[]) {
  const food = Math.ceil(people.reduce((sum, p) => sum + foodNeedForPerson(p) * 1.4, 0));
  const water = Math.ceil(people.reduce((sum, p) => sum + (p.age < 12 ? 0.8 : p.age >= 60 ? 0.9 : 1.2), 0));
  const sick = people.filter((p) => p.injured || p.health < 45).length;
  const children = people.filter((p) => p.age < 15).length;
  const elders = people.filter((p) => p.age >= 60).length;
  const workers = people.filter((p) => p.age >= 15 && p.age < 60 && !p.injured && p.health >= 45).length;
  return {
    food,
    water,
    sick,
    children,
    elders,
    workers,
    healthDelta: sick ? -Math.min(8, sick * 2) : 0,
    conflictRisk: Math.max(0, people.length - workers - 2),
  };
}
function migrantsForChoice(game: GameState, choiceId: string): Person[] {
  const candidates = buildMigrantCandidates(game);
  if (choiceId === "accept_selected_migrants") {
    const ids = new Set(selectedMigrantIds(game));
    return candidates.filter((p) => ids.has(p.id));
  }
  if (choiceId === "accept_all_migrants") return candidates;
  if (choiceId === "accept_skilled_migrants") {
    const picked = candidates.filter((p) => p.age >= 15 && p.age < 60 && p.health >= 48 && !["child", "elder"].includes(p.skill)).slice(0, 5);
    return picked.length ? picked : candidates.filter((p) => p.age >= 15).slice(0, 2);
  }
  if (choiceId === "accept_children_healer") {
    const picked = candidates.filter((p) => p.age < 15 || p.skill === "healer").slice(0, 5);
    return picked.length ? picked : candidates.slice(0, Math.min(3, candidates.length));
  }
  return [];
}
function addMigrantsByChoice(game: GameState, choiceId: string): GameState {
  const chosen = migrantsForChoice(game, choiceId);
  const incoming = chosen.map((p) => ({ ...p, id: uid("migrant"), kin: `เข้าร่วม House ${game.houseName}`, traits: [...p.traits, "ผู้มาใหม่"] }));
  if (!incoming.length) return game;
  const impact = migrantImpact(incoming);
  let g: GameState = {
    ...game,
    people: [...game.people, ...incoming],
    resources: changeResources(game.resources, { food: -impact.food, water: -impact.water }),
    metrics: changeMetrics(game.metrics, { health: impact.healthDelta, trust: choiceId === "accept_all_migrants" ? 2 : 0, fairness: choiceId === "accept_selected_migrants" ? 1 : 0, security: -Math.min(4, Math.floor(incoming.length / 3)) }),
    flags: { ...game.flags, migrantSelectedIds: "" },
  };
  if (impact.conflictRisk > 0) g = { ...g, threat: clamp(g.threat + impact.conflictRisk, 0, 100), metrics: changeMetrics(g.metrics, { cohesion: -impact.conflictRisk }) };
  g = addNotice(g, { kind: "event", title: `รับผู้มาใหม่ ${incoming.length} คน`, text: `ใช้เสบียงต้อนรับ อาหาร -${impact.food} น้ำ -${impact.water} · แรงงานพร้อม ${impact.workers} คน เด็ก ${impact.children} ผู้เฒ่า ${impact.elders} ป่วย/เจ็บ ${impact.sick}` });
  g = addLog(g, "รายชื่อผู้มาใหม่", incoming.map((p) => `• ${p.name} — ${p.role}, อายุ ${p.age}, สุขภาพ ${p.health}%`).join("\n"), "good", ["อพยพ", "คนเข้าเมือง"]);
  return g;
}

function skillLabel(skill: SkillKey) {
  const labels: Record<SkillKey, string> = { hunter: "พราน", builder: "ช่าง", healer: "ผู้รักษา", keeper: "ผู้จดจำ", guard: "เวรยาม", farmer: "แรงงาน/ชาวไร่", child: "เด็ก", elder: "ผู้เฒ่า" };
  return labels[skill] ?? skill;
}

function MigrantPreview({ game, event, setMigrantSelection, selectChoice }: { game: GameState; event: GameEvent; setMigrantSelection: (ids: string[]) => void; selectChoice: (id: string) => void }) {
  if (event.id !== "migrant_group") return null;
  const migrants = buildMigrantCandidates(game);
  const customIds = selectedMigrantIds(game);
  const choiceId = game.selectedChoiceId ?? "";
  const selectedIds = new Set(choiceId === "accept_selected_migrants" ? customIds : migrantsForChoice(game, choiceId).map((p) => p.id));
  const selectedPeople = migrants.filter((p) => selectedIds.has(p.id));
  const impact = migrantImpact(selectedPeople);
  const toggle = (id: string) => {
    const next = new Set(choiceId === "accept_selected_migrants" ? customIds : Array.from(selectedIds));
    if (next.has(id)) next.delete(id); else next.add(id);
    const ids = Array.from(next);
    setMigrantSelection(ids);
    selectChoice("accept_selected_migrants");
  };
  return (
    <div className="migrant-preview selection-window">
      <div className="split"><div><h3 className="section-title">หน้าต่างคัดเลือกผู้มาใหม่</h3><p className="muted small">เลือกทีละคนได้โดยตรง ค่ายจะรับเฉพาะรายชื่อที่ติ๊กไว้ หากใช้ปุ่มรับทั้งหมด/คัดตามกลุ่ม ระบบจะคำนวณรายชื่อและภาระจากตัวคนจริงเช่นกัน</p></div><span className="badge">เลือก {selectedPeople.length}/{migrants.length} คน</span></div>
      <div className="migrant-impact-strip"><span className="badge red">🍲 อาหาร -{impact.food}</span><span className="badge blue">💧 น้ำ -{impact.water}</span><span className="badge green">💪 แรงงานพร้อม {impact.workers}</span><span className="badge">🧒 เด็ก {impact.children}</span><span className="badge">🧓 ผู้เฒ่า {impact.elders}</span>{impact.sick > 0 && <span className="badge red">🤒 ต้องดูแล {impact.sick}</span>}</div>
      <div className="migrant-grid">
        {migrants.map((p) => {
          const selected = selectedIds.has(p.id);
          return <label className={selected ? "migrant-card selected" : "migrant-card"} key={p.id}><input type="checkbox" checked={selected} onChange={() => toggle(p.id)} /><b>{selected ? "✅" : "▫️"} {p.name}</b><small>{skillIcon(p.skill)} {skillLabel(p.skill)} · อายุ {p.age} · สุขภาพ {p.health}%</small><span className={p.health < 45 ? "badge red" : p.age < 12 ? "badge blue" : "badge green"}>{p.health < 45 ? "ต้องดูแล" : p.age < 12 ? "เด็ก" : p.age >= 60 ? "ผู้เฒ่า" : "พร้อมช่วยงาน"}</span><em>{p.traits.join(" · ")}</em></label>;
        })}
      </div>
      <p className="muted small">ถ้าเลือกเอง ให้กดตัวเลือก “รับเฉพาะรายชื่อที่เลือก” ก่อนจบเดือน การเลือกคนเข้ามาคือการเพิ่มทั้งแรงงาน ปากท้อง ความเสี่ยง และเรื่องเล่าใหม่ให้ค่าย</p>
    </div>
  );
}

function TheftJusticeNote({ event }: { event: GameEvent }) {
  if (event.id !== "supply_theft") return null;
  return <div className="justice-note"><b>⚖️ ระบบบทลงโทษ</b><p>คดีขโมยเสบียงไม่ใช่แค่เสียอาหาร แต่ส่งผลต่อความยุติธรรม ความไว้ใจ ความปลอดภัย และภาพจำของผู้นำระยะยาว</p></div>;
}

function TerrainPanel({ game }: { game: GameState }) {
  const terrain = terrainData[game.terrain ?? "riverbank"];
  return (
    <section className="panel pad terrain-panel" style={{ marginBottom: 14 }}>
      <div className="split">
        <div>
          <h3 className="section-title">{terrain.icon} พื้นที่ตั้งถิ่นฐาน: {terrain.title}</h3>
          <p className="muted">{terrain.text}</p>
        </div>
        <span className="badge green">สุ่มทุกครั้งเมื่อเริ่มเกมใหม่</span>
      </div>
      <div className="terrain-tags">
        {terrain.tags.map((tag) => <span className="badge" key={tag}>{tag}</span>)}
        <span className="badge">อาหาร {terrain.forage >= 0 ? "+" : ""}{Math.round(terrain.forage * 100)}%</span>
        <span className="badge">ไม้ {terrain.wood >= 0 ? "+" : ""}{Math.round(terrain.wood * 100)}%</span>
        <span className="badge">หิน {terrain.stone >= 0 ? "+" : ""}{Math.round(terrain.stone * 100)}%</span>
        <span className="badge">น้ำ {terrain.water >= 0 ? "+" : ""}{Math.round(terrain.water * 100)}%</span>
      </div>
    </section>
  );
}
function CityView({ game }: { game: GameState }) {
  const resources = game.resources;
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
      <OriginBuffPanel game={game} />
      <ActiveProjectsPanel game={game} />
      <GuidancePanel game={game} />
      <EndWarningPanel game={game} />
      <TerrainPanel game={game} />
      <section className="two-col" style={{ marginBottom: 14 }}>
        <div className="panel pad"><h3 className="section-title">คนสำคัญของค่าย</h3>{keyVillagers(game).map((p) => <div key={p.id} className="key-villager"><b>{p.name}</b><small>{p.role} · {p.traits.join(" · ")}</small><p className="muted small">{villagerImpact(p)}</p><span>{p.injured ? "บาดเจ็บ" : p.health < 45 ? "ป่วย" : "พร้อม"}</span></div>)}</div>
        <div className="panel pad"><h3 className="section-title">ผลจากพื้นหลังและพื้นที่</h3><p className="muted small">{originInfo(game.origin).story}</p><div className="terrain-tags">{terrainData[game.terrain].tags.map((tag) => <span className="badge" key={tag}>{tag}</span>)}</div></div>
      </section>
    </div>
  );
}
function GuidancePanel({ game }: { game: GameState }) {
  const items = smartGuidance(game);
  return <section className="panel pad guidance-panel" style={{ marginBottom: 14 }}><div className="split"><div><h3 className="section-title">คำแนะนำเดือนนี้</h3><p className="muted small">ระบบจะชี้เฉพาะเรื่องสำคัญ ไม่เปิดเผยทุกคำตอบ เพื่อให้การตัดสินใจยังเป็นของผู้เล่น</p></div><span className="badge green">Smart Guidance</span></div><div className="guidance-grid">{items.map((a, i) => <article key={`${a.title}-${i}`} className={`guidance-card ${a.severity}`}><b>{a.icon} {a.title}</b><small>{a.text}</small></article>)}</div></section>;
}
function EndWarningPanel({ game }: { game: GameState }) {
  const items = endMonthWarnings(game);
  if (!items.length) return null;
  return <section className="panel pad warning-panel" style={{ marginBottom: 14 }}><div className="split"><h3 className="section-title">คำเตือนก่อนจบเดือน</h3><span className="badge red">ควรตรวจสอบ</span></div><div className="guidance-grid">{items.map((w, i) => <article key={`${w.title}-${i}`} className={`warning-card ${w.severity}`}><b>{w.icon} {w.title}</b><small>{w.text}</small></article>)}</div></section>;
}
function personStatusEmoji(person: Person) {
  if (!person.alive) return "💀";
  if (person.injured) return "🩹";
  if (person.health < 45) return "🤒";
  if (person.age < 12) return "🧒";
  if (person.age < 15) return "👦";
  if (person.age >= 60) return "🧓";
  if (person.fatigue > 70) return "😓";
  return "✅";
}
function personSkillEmoji(person: Person) {
  const map: Record<SkillKey, string> = { hunter: "🏹", builder: "🛠️", healer: "🌿", keeper: "📜", guard: "🛡️", farmer: "🌾", child: "🧒", elder: "🧓" };
  return map[person.skill] ?? "👤";
}
function traitEmoji(trait: string) {
  if (trait.includes("กินจุ")) return "🍽️";
  if (trait.includes("กินน้อย")) return "🥣";
  if (trait.includes("ขยัน") || trait.includes("อดทน")) return "💪";
  if (trait.includes("เรียนรู้") || trait.includes("สังเกต")) return "👁️";
  if (trait.includes("สัตว์")) return "🐾";
  if (trait.includes("กล้า")) return "🛡️";
  if (trait.includes("ใจดี") || trait.includes("ละเอียด")) return "🤲";
  return "•";
}

function MapView({ game, setExploreTarget, establishOutpost }: { game: GameState; setExploreTarget: (target: LocationKey) => void; establishOutpost: (target: LocationKey) => void }) {
  const locations = normalizeLocations(game.locations);
  const target = bestExploreTarget(game);
  const discovered = (Object.keys(locationData) as LocationKey[]).filter((key) => locations[key].discovered);
  const hidden = (Object.keys(locationData) as LocationKey[]).filter((key) => !locations[key].discovered);
  return (
    <section className="panel pad map-view">
      <div className="split">
        <div>
          <h2 className="title">แผนที่รอบถิ่นฐาน</h2>
          <p className="muted">โลกไม่ได้จบที่แนวค่าย การสำรวจจะค่อย ๆ เปิดแหล่งน้ำ ป่า เส้นทางค้า ถ้ำ และซากค่ายร้าง พื้นที่ที่รู้ทางแล้วจะกลายเป็นเส้นเลือดใหม่ของชุมชน ทั้งทรัพยากร ข่าวสาร และภัยที่เดินตามเส้นทางเข้ามา</p>
        </div>
        <span className="badge green">เป้าหมายสำรวจ: {locationData[target].title}</span>
      </div>
      <div className="map-summary-grid">
        <div className="map-summary"><b>พื้นที่รู้จัก</b><span>{discovered.length}/{Object.keys(locationData).length}</span></div>
        <div className="map-summary"><b>แรงงานสำรวจ</b><span>{(normalizeLabor(game).explore ?? 0).toFixed(1)}</span></div>
        <div className="map-summary"><b>ข่าวที่เปิดทาง</b><span>{game.rumors.length}</span></div>
        <div className="map-summary"><b>ภัยจากเส้นทาง</b><span>{pct(game.threat)}</span></div>
      </div>
      <div className="system-link-note">
        <b>เมื่อสำรวจสำเร็จจะเกิดอะไรขึ้น?</b>
        <p className="muted small">พื้นที่ที่สำรวจครบ 100% จะเริ่มส่งทรัพยากรกลับเข้าค่ายทุกเดือนอย่างถาวร และบางพื้นที่จะเพิ่มโอกาสพ่อค้า ข่าวสาร วัตถุดิบ หรือความเสี่ยงเฉพาะทาง</p>
        <small className="muted">ผลประโยชน์ประจำเดือนตอนนี้: {locationMonthlyBonusText(game)}</small>
      </div>
      <div className="location-grid">
        {(Object.keys(locationData) as LocationKey[]).map((key) => {
          const data = locationData[key];
          const loc = locations[key];
          const active = key === target;
          return (
            <article className={active ? "location-card active" : "location-card"} key={key}>
              <div className="split"><h3>{data.icon} {loc.discovered ? data.title : "พื้นที่ยังไม่ยืนยัน"}</h3><span className="badge">{locationProgressText(loc)}</span></div>
              <p className="muted small">{loc.discovered ? data.text : data.unlockHint}</p>
              <div className="bar"><div className="fill" style={{ width: `${loc.progress}%` }} /></div>
              {loc.discovered && <div className="deltas"><span className="badge blue">ทรัพยากร: {data.resource}</span><span className="badge red">เสี่ยง: {data.risk}</span>{data.tags.map((tag) => <span className="badge" key={`${key}-${tag}`}>{tag}</span>)}</div>}
              <div className="location-actions"><button className={active ? "primary" : "secondary"} onClick={() => setExploreTarget(key)}>{active ? "กำลังสำรวจ" : "ตั้งเป็นเป้าหมายสำรวจ"}</button>{canEstablishOutpost(game, key) && <button className="secondary" onClick={() => establishOutpost(key)}>ตั้ง Outpost</button>}</div>
            </article>
          );
        })}
      </div>
      {hidden.length > 0 && <p className="muted small">ยังมีพื้นที่ที่รู้เพียงข่าวลืออีก {hidden.length} แห่ง การส่งคนสำรวจหรือใช้สายข่าวจะค่อย ๆ เปิดเส้นทางเหล่านี้</p>}
    </section>
  );
}

function LaborAssignmentPanel({ game, assignPersonLabor, applyRecommendedAssignments }: { game: GameState; assignPersonLabor: (personId: string, job: LaborKey | "") => void; applyRecommendedAssignments: () => void }) {
  const [skillFilter, setSkillFilter] = useState<SkillKey | "all" | "free" | "sick" | "assigned">("all");
  const jobs = unlockedLaborOptions(game);
  const assignments = normalizeLaborAssignments(game, game.laborAssignments ?? {});
  const labor = deriveLaborFromAssignments(game, assignments);
  const capacity = workerCapacity(game);
  const used = laborAssignmentLoad(game, assignments);
  const output = laborTotal(labor);
  const workers = eligibleWorkers(game);
  const filters: Array<{ id: SkillKey | "all" | "free" | "sick" | "assigned"; label: string }> = [
    { id: "all", label: "ทั้งหมด" },
    { id: "free", label: "🟢 คนว่าง" },
    { id: "assigned", label: "📌 มีงานแล้ว" },
    { id: "sick", label: "🤒 ป่วย/เจ็บ" },
    { id: "hunter", label: "🏹 อาหาร/ป่า" },
    { id: "builder", label: "🛠️ ไม้/ก่อสร้าง" },
    { id: "healer", label: "🌿 สุขภาพ" },
    { id: "keeper", label: "📜 วิจัย/ข่าว" },
    { id: "guard", label: "🛡️ ป้องกัน" },
    { id: "farmer", label: "🌾 น้ำ/เกษตร" },
    { id: "child", label: "🧒 เด็กช่วยงาน" },
    { id: "elder", label: "🧓 ผู้เฒ่า" },
  ];
  const visibleWorkers = workers.filter((person) => {
    if (skillFilter === "all") return true;
    if (skillFilter === "free") return !assignedJobOf(game, person.id);
    if (skillFilter === "assigned") return Boolean(assignedJobOf(game, person.id));
    if (skillFilter === "sick") return person.injured || person.health < 45;
    return person.skill === skillFilter || (skillFilter === "child" && person.age < 15) || (skillFilter === "elder" && person.age >= 60);
  });
  return (
    <section className="panel pad labor-named-panel" style={{ boxShadow: "none", margin: "12px 0" }}>
      <div className="split">
        <div>
          <h3 className="section-title">จัดแรงงานรายบุคคล</h3>
          <p className="muted small">เลือกคนลงงานจากรายชื่อย่อ สถานะ อายุ passive และความถนัดจะถูกนำไปคำนวณผลผลิตจริง เด็กช่วยงานได้เมื่อมีผู้ใหญ่ทำงานเดียวกัน ส่วนผู้สูงอายุยังช่วยได้แต่กำลังลดลง</p>
        </div>
        <div className="flex"><button className="secondary" onClick={applyRecommendedAssignments}>จัดตามความถนัด</button><span className="badge green">ใช้คน {used.toFixed(1)}/{capacity.toFixed(1)}</span><span className="badge blue">ผลผลิต {output.toFixed(1)}</span></div>
      </div>
      <div className="filter-strip compact-filter">
        {filters.map((f) => <button key={f.id} className={skillFilter === f.id ? "active" : ""} onClick={() => setSkillFilter(f.id)}>{f.label}</button>)}
      </div>
      <div className="assignment-list">
        {visibleWorkers.map((person) => {
          const current = assignedJobOf(game, person.id) ?? "";
          const factor = baseWorkFactor(person);
          const currentJob = current ? laborMeta.find((j) => j.id === current) : null;
          return (
            <article className="assignment-row" key={`assign-${person.id}`}>
              <div className="person-line">
                <b>{personStatusEmoji(person)} {personSkillEmoji(person)} {person.name}</b>
                <small className="muted">{person.role} · อายุ {person.age} · {workAgeLabel(person)} · กำลัง {factor}</small>
              </div>
              <div className="trait-line">
                {person.traits.slice(0, 4).map((tr) => <span className="badge" key={`${person.id}-${tr}`}>{traitEmoji(tr)} {tr}</span>)}
                {person.fatigue > 65 && <span className="badge red">😓 ล้า</span>}
                {person.health < 45 && <span className="badge red">🤒 สุขภาพต่ำ</span>}
                {currentJob && <span className="badge green">ทำอยู่: {currentJob.icon} {currentJob.title}</span>}
              </div>
              <select value={current} onChange={(e) => assignPersonLabor(person.id, e.target.value as LaborKey | "")} className="labor-select compact-select">
                <option value="">พัก / ไม่ลงงาน</option>
                {jobs.map((job) => <option key={job.id} value={job.id}>{job.icon} {job.title} · {Math.round(baseWorkFactor(person) * personJobBonus(person, job.id) * 100)}%</option>)}
              </select>
            </article>
          );
        })}
      </div>
      <details className="details-box" style={{ marginTop: 12 }}>
        <summary>สรุปงานที่มีคนทำอยู่</summary>
        <div className="work-grid" style={{ marginTop: 12 }}>
          {jobs.filter((job) => (assignments[job.id] ?? []).length > 0).map((job) => (
            <div className="work-card" key={`job-summary-${job.id}`}>
              <b>{job.icon} {job.title}</b>
              <p className="muted small">{(assignments[job.id] ?? []).map((id) => game.people.find((p) => p.id === id)?.name).filter(Boolean).join(" · ")}</p>
              <span className="badge green">ผลผลิตจริง {fmt(labor[job.id] ?? 0)}</span>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
function PeopleView({ game, assignPersonLabor, applyRecommendedAssignments }: { game: GameState; assignPersonLabor: (personId: string, job: LaborKey | "") => void; applyRecommendedAssignments: () => void }) {
  const keys = keyVillagers(game);
  return (
    <section className="panel pad">
      <div className="split"><div><h2 className="title">คนในค่าย</h2><p className="muted">ทุกคนมีชื่อ อายุ สุขภาพ ความเหนื่อย และสถานะจริง คนสำคัญจะมีผลต่อการล่า ก่อสร้าง รักษา เวรยาม ข่าวสาร และพงศาวดาร</p></div><span className="badge">มีชีวิต {alivePeople(game).length}</span></div>
      <LaborAssignmentPanel game={game} assignPersonLabor={assignPersonLabor} applyRecommendedAssignments={applyRecommendedAssignments} />
      <section className="panel pad" style={{ boxShadow: "none", margin: "12px 0" }}><h3 className="section-title">คนสำคัญของรอบนี้</h3><div className="work-grid">{keys.map((p) => <div className="key-villager" key={`key-${p.id}`}><b>{p.name}</b><small>{p.role} · {p.traits.join(" · ")}</small><p className="muted small">{villagerImpact(p)}</p><span>{p.injured ? "บาดเจ็บ" : p.health < 45 ? "ป่วย" : "พร้อม"}</span></div>)}</div></section>
      <details className="details-box" style={{ marginTop: 12 }}><summary>ดูรายละเอียดรายคนทั้งหมด</summary><div className="people-grid">{game.people.map((p) => <PersonCard key={p.id} person={p} />)}</div></details>
    </section>
  );
}
function PersonCard({ person }: { person: Person; key?: string }) {
  const dot = !person.alive || person.health < 35 ? "health-dot bad" : person.health < 60 || person.injured ? "health-dot warn" : "health-dot";
  return <article className={person.alive ? "person-card" : "person-card dead"}><div className="person-top"><div className="flex"><div className="avatar">{person.name.slice(0, 1)}</div><div><b>{person.name}</b><br /><small className="muted">{person.role} · อายุ {person.age}</small></div></div><span className={dot} /></div><div className="deltas">{person.traits.map((t, i) => <span className="badge" key={`${person.id}-${t}-${i}`}>{t}</span>)}{person.injured && <span className="badge red">บาดเจ็บ</span>}{!person.alive && <span className="badge red">เสียชีวิต</span>}</div><table className="report-table" style={{ marginTop: 10 }}><tbody><tr><td>สุขภาพ</td><td><span className={statToneClass(person.health)}>{pct(person.health)}</span></td></tr><tr><td>กำลังใจ</td><td><span className={statToneClass(person.morale)}>{pct(person.morale)}</span></td></tr><tr><td>ความเหนื่อย</td><td><span className={statToneClass(person.fatigue, "badHigh")}>{pct(person.fatigue)}</span></td></tr><tr><td>อาหาร/เดือน</td><td>{foodNeedForPerson(person).toFixed(1)}</td></tr><tr><td>วัยทำงาน</td><td>{workAgeLabel(person)} · แรงงาน {baseWorkFactor(person)}</td></tr><tr><td>สาเหตุ</td><td>{person.cause ?? "-"}</td></tr></tbody></table></article>;
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
function ProjectView({ game }: { game: GameState }) {
  return <ActiveProjectsPanel game={game} />;
}
function ProjectCrewCard({ game, title, jobs, hint }: { game: GameState; title: string; jobs: LaborKey[]; hint: string }) {
  const crew = projectCrewStatus(game, jobs);
  return <div className="crew-status-card">
    <div className="split"><b>{title}</b><span className="badge green">{crew.count} คน · ผลจริง {crew.effective}</span></div>
    <small className="muted">งานที่นับ: {crew.labels}</small>
    <p className="small">{crewNameList(crew.people)}</p>
    <small className="muted">{hint}</small>
  </div>;
}
function BuildView({ game, startConstruction, pauseConstruction, cancelConstruction, jumpToPeopleFor }: { game: GameState; startConstruction: (id: BuildingKey) => void; pauseConstruction: () => void; cancelConstruction: (id?: BuildingKey) => void; jumpToPeopleFor: (job?: LaborKey) => void }) {
  const monthsLeft = game.construction ? Math.max(1, Math.ceil(Math.max(0, buildingData[game.construction.id].work - game.construction.progress) / Math.max(1, game.labor.build * 10))) : 0;
  return <section className="panel pad"><h2 className="title">ก่อสร้าง</h2><p className="muted">งานก่อสร้างสามารถพักไว้เพื่อโยกคนไปเรื่องเร่งด่วนได้ ความคืบหน้าจะถูกเก็บไว้ ส่วนการยกเลิกจะคืนทรัพยากรเพียงบางส่วนตามความสมจริง</p><ProjectCrewCard game={game} title="สถานะทีมก่อสร้างเดือนนี้" jobs={["build"]} hint="ถ้าต้องการเร่งงาน ให้ไปแท็บคนแล้วจัดคนเข้าหมวดก่อสร้าง โดยช่างไม้/ผู้มีมือหนักจะช่วยให้ความคืบหน้าสูงกว่า" /><button className="secondary" onClick={() => jumpToPeopleFor("build")} style={{ margin: "8px 0 12px" }}>ไปจัดทีมก่อสร้างที่แท็บคน</button><SettlementGrowthPanel game={game} />{game.construction && <div className="log good"><b>กำลังก่อสร้าง: {buildingData[game.construction.id].title}</b><small className="muted">คาดว่าเหลือประมาณ {monthsLeft} เดือน หากทีมก่อสร้างยังมีกำลังเท่าเดิม</small><div className="bar" style={{ marginTop: 8 }}><div className="fill" style={{ width: `${clamp(game.construction.progress / buildingData[game.construction.id].work * 100)}%` }} /></div><div className="flex" style={{ marginTop: 10 }}><button className="secondary" onClick={pauseConstruction}>พักงานนี้ไว้ก่อน</button><button className="danger" onClick={() => cancelConstruction()}>ยกเลิกและคืนบางส่วน</button></div></div>}{(game.pausedConstruction ?? []).length > 0 && <div className="panel pad" style={{ boxShadow: "none", marginTop: 10 }}><h3 className="section-title">งานก่อสร้างที่พักไว้</h3><div className="work-grid">{(game.pausedConstruction ?? []).map((p) => p && <div className="work-card" key={`paused-build-${p.id}`}><b>{buildingData[p.id].icon} {buildingData[p.id].title}</b><small className="muted">คืบหน้า {p.progress}/{buildingData[p.id].work}</small><div className="bar"><div className="fill" style={{ width: `${clamp(p.progress / buildingData[p.id].work * 100)}%` }} /></div><div className="flex"><button className="secondary" onClick={() => startConstruction(p.id)}>กลับมาทำต่อ</button><button className="danger" onClick={() => cancelConstruction(p.id)}>ยกเลิก</button></div></div>)}</div></div>}<div className="building-grid" style={{ marginTop: 12 }}>{(Object.keys(buildingData) as BuildingKey[]).map((id) => { const b = buildingData[id]; const unlocked = buildingUnlocked(game, id); const already = game.construction?.id === id; const paused = (game.pausedConstruction ?? []).some((p) => p?.id === id); const affordable = hasCost(game, b.cost) || paused || already; return <article key={id} className="building-card"><div className="split"><div><b>{b.icon} {b.title}</b><p className="muted small">{b.text}</p></div><span className="badge">มี {game.buildings[id]}</span></div><table className="report-table"><tbody><tr><td>ใช้ทรัพยากร</td><td>{Object.entries(b.cost).map(([k,v]) => `${k} ${v}`).join(" · ")}</td></tr><tr><td>แรงงานที่ต้องใช้</td><td>{b.work}</td></tr><tr><td>สถานะ</td><td>{already ? "กำลังทำอยู่" : paused ? "พักไว้ กลับมาทำต่อได้" : unlocked ? affordable ? "พร้อมสร้าง" : "ทรัพยากรไม่พอ" : "ยังไม่ปลดล็อก"}</td></tr></tbody></table><button className="primary" disabled={!unlocked || !affordable || already} onClick={() => startConstruction(id)} style={{ width: "100%", marginTop: 10, opacity: !unlocked || !affordable || already ? .55 : 1 }}>{already ? "กำลังทำอยู่" : paused ? "กลับมาทำต่อ" : game.construction ? "พักงานเดิมแล้วเริ่มงานนี้" : "เริ่มสร้าง"}</button></article>; })}</div></section>;
}

function ResearchView({ game, startResearch, pauseResearch, cancelResearch, jumpToPeopleFor }: { game: GameState; startResearch: (id: ResearchKey) => void; pauseResearch: () => void; cancelResearch: (id?: ResearchKey) => void; jumpToPeopleFor: (job?: LaborKey) => void }) {
  const monthsLeft = game.activeResearch ? Math.max(1, Math.ceil(Math.max(0, researchData[game.activeResearch.id].cost - game.activeResearch.progress) / Math.max(1, game.labor.research * 8 + game.labor.teach * 4 + 2))) : 0;
  return <section className="panel pad"><h2 className="title">ภูมิปัญญาและการวิจัย</h2><p className="muted">งานวิจัยสามารถพักไว้เพื่อรับมือเหตุเร่งด่วนได้ การสลับหัวข้อจะเก็บความคืบหน้าเดิมไว้ เหมาะกับช่วงที่ต้องโยกคนไปหาอาหาร น้ำ หรือดูแลผู้ป่วยก่อน</p><ProjectCrewCard game={game} title="สถานะทีมความรู้เดือนนี้" jobs={["research", "teach"]} hint="แรงงานทดลอง/เรียนรู้เป็นกำลังหลัก ส่วนการสอนเด็กช่วยต่อยอดความรู้และเพิ่มความสามัคคี ผู้จดจำ/เรียนรู้ไวจะเร่งงานนี้ได้ดี" /><button className="secondary" onClick={() => jumpToPeopleFor("research")} style={{ margin: "8px 0 12px" }}>ไปจัดทีมวิจัยที่แท็บคน</button>{game.activeResearch && <div className="log good"><b>กำลังศึกษา: {researchData[game.activeResearch.id].title}</b><small className="muted">คาดว่าเหลือประมาณ {monthsLeft} เดือน หากทีมความรู้ยังมีกำลังเท่าเดิม</small><div className="bar" style={{ marginTop: 8 }}><div className="fill" style={{ width: `${clamp(game.activeResearch.progress / researchData[game.activeResearch.id].cost * 100)}%` }} /></div><div className="flex" style={{ marginTop: 10 }}><button className="secondary" onClick={pauseResearch}>พักงานวิจัยนี้</button><button className="danger" onClick={() => cancelResearch()}>ยกเลิกหัวข้อนี้</button></div></div>}{(game.pausedResearch ?? []).length > 0 && <div className="panel pad" style={{ boxShadow: "none", marginTop: 10 }}><h3 className="section-title">งานวิจัยที่พักไว้</h3><div className="work-grid">{(game.pausedResearch ?? []).map((p) => p && <div className="work-card" key={`paused-research-${p.id}`}><b>{researchData[p.id].icon} {researchData[p.id].title}</b><small className="muted">คืบหน้า {p.progress}/{researchData[p.id].cost}</small><div className="bar"><div className="fill" style={{ width: `${clamp(p.progress / researchData[p.id].cost * 100)}%` }} /></div><div className="flex"><button className="secondary" onClick={() => startResearch(p.id)}>กลับมาศึกษาต่อ</button><button className="danger" onClick={() => cancelResearch(p.id)}>ยกเลิก</button></div></div>)}</div></div>}<div className="building-grid" style={{ marginTop: 12 }}>{(Object.keys(researchData) as ResearchKey[]).map((id) => { const r = researchData[id]; const done = game.researchDone[id]; const unlocked = researchUnlocked(game, id); const already = game.activeResearch?.id === id; const paused = (game.pausedResearch ?? []).some((p) => p?.id === id); return <article key={id} className="building-card"><div className="split"><div><b>{r.icon} {r.title}</b><p className="muted small">{r.text}</p></div><span className={done ? "badge green" : "badge"}>{done ? "สำเร็จ" : `${r.cost}`}</span></div><p className="small muted">เงื่อนไขก่อนศึกษา: {r.prereq?.map((p) => researchData[p].title).join(" · ") ?? "ไม่มี"}</p><button className="primary" disabled={done || !unlocked || already} onClick={() => startResearch(id)} style={{ width: "100%", opacity: done || !unlocked || already ? .55 : 1 }}>{done ? "เรียนรู้แล้ว" : already ? "กำลังศึกษา" : paused ? "กลับมาศึกษาต่อ" : game.activeResearch ? "พักหัวข้อเดิมแล้วเริ่มหัวข้อนี้" : unlocked ? "เริ่มศึกษา" : "ยังไม่ปลดล็อก"}</button></article>; })}</div></section>;
}


function animalActionLabel(action: AnimalAction) {
  const labels: Record<AnimalAction, string> = { keep: "เลี้ยงตามปกติ", slaughter: "ฆ่าเพื่อเป็นอาหาร", breed: "เลี้ยงต่อเพื่อขยายฝูง", release: "ปล่อยสัตว์ที่เลี้ยงไม่ไหว", protect: "เฝ้าคอกเป็นพิเศษ" };
  return labels[action];
}
function AnimalsView({ game, setAnimalAction }: { game: GameState; setAnimalAction: (action: AnimalAction) => void }) {
  const state = normalizeAnimalState(game.animalState);
  const total = animalCount(game);
  const needs = animalNeed(game);
  const feedUnlocked = game.researchDone.fodderPrep;
  const actionCards: Array<{ id: AnimalAction; icon: string; title: string; text: string; disabled?: boolean }> = [
    { id: "keep", icon: "🐐", title: "เลี้ยงตามปกติ", text: "รักษาฝูงไว้โดยไม่เร่งเชือดหรือขยาย เหมาะกับช่วงทรัพยากรนิ่ง", disabled: total <= 0 },
    { id: "breed", icon: "🥚", title: "เลี้ยงต่อเพื่อออกลูก", text: "เพิ่มโอกาสได้ลูกแพะ ไก่ หมู หรือวัว แต่ต้องมีอาหาร น้ำ และสุขภาพสัตว์ดี", disabled: total <= 1 },
    { id: "slaughter", icon: "🍖", title: "ฆ่าสัตว์เพื่อเป็นอาหาร", text: "แปลงสัตว์เป็นอาหารทันที เหมาะเมื่อคนเริ่มอด แต่ลดฐานฝูงระยะยาว", disabled: total <= 0 },
    { id: "release", icon: "🌿", title: "ปล่อยสัตว์ที่เลี้ยงไม่ไหว", text: "ลดภาระอาหารสัตว์โดยไม่ฆ่า เหมาะเมื่ออาหารใกล้หมด", disabled: total <= 0 },
    { id: "protect", icon: "🛡️", title: "เฝ้าคอกเป็นพิเศษ", text: "ลดโอกาสถูกขโมยหรือสัตว์หนี โดยเฉพาะเมื่อภัยภายนอกสูง", disabled: total <= 0 },
  ];
  return <section className="panel pad"><div className="split"><div><h2 className="title">สัตว์เลี้ยงและฝูงอาหาร</h2><p className="muted">สัตว์ไม่ใช่ตัวเลขนิ่ง ๆ พวกมันกินอาหาร หนีได้ ถูกขโมยได้ ป่วยหรือตายได้ แต่ถ้าเลี้ยงดีจะเป็นอาหาร นม ไข่ หนัง และความมั่นคงระยะยาวของถิ่นฐาน</p></div><span className="badge green">แผนเดือนนี้: {animalActionLabel(game.animalAction ?? "keep")}</span></div><div className="dashboard-grid"><div className="panel kpi"><span className="muted">🐐 แพะ</span><b>{state.animals.goats}</b><small>ให้เนื้อ หนัง และมีโอกาสออกลูก</small></div><div className="panel kpi"><span className="muted">🐔 ไก่</span><b>{state.animals.chickens}</b><small>เพิ่มอาหารเล็กน้อยและออกลูกง่ายกว่า</small></div><div className="panel kpi"><span className="muted">🐄 วัว</span><b>{state.animals.cows}</b><small>กินมาก แต่ให้เนื้อ นม และหนัง</small></div><div className="panel kpi"><span className="muted">🐖 หมู</span><b>{state.animals.pigs}</b><small>แปรเป็นอาหารได้ดีและขยายฝูงได้</small></div><div className="panel kpi"><span className="muted">🐕 สุนัข</span><b>{state.animals.dogs}</b><small>ช่วยเตือนภัยและเฝ้าค่าย แต่กินอาหาร</small></div><div className="panel kpi"><span className="muted">ความหิว / สุขภาพ</span><b>{pct(state.hunger)} / {pct(state.health)}</b><small>ต้องใช้ {needs} หน่วยจาก{animalFoodSource(game)} · น้ำ {animalWaterNeed(game)}</small></div></div><div className="two-col" style={{ marginTop: 14 }}><div className="panel pad" style={{ boxShadow: "none" }}><h3 className="section-title">ระบบอาหารสัตว์และน้ำ</h3><table className="report-table"><tbody><tr><td>สถานะอาหารสัตว์</td><td>{feedUnlocked ? "วิจัยแล้ว แสดงในทรัพยากรและผลิตได้จากงานตัดหญ้า" : game.buildings.animalPen > 0 ? "มีอาหารหยาบจากคอก/ตัดหญ้าได้ แต่ยังควรวิจัยอาหารสัตว์" : "ยังไม่วิจัย สัตว์จะกินอาหารคน/เศษพืชก่อน"}</td></tr><tr><td>งานที่เกี่ยวข้อง</td><td>{feedUnlocked || game.buildings.animalPen > 0 ? "ตัดหญ้า / ทำอาหารสัตว์" : "สร้างคอกหรือวิจัยอาหารสัตว์ก่อน"}</td></tr><tr><td>คอกสัตว์</td><td>{game.buildings.animalPen > 0 ? `มี ${game.buildings.animalPen} หลัง ลดหนี/ขโมย` : "ยังไม่มี ควรวิจัยการเลี้ยงสัตว์พื้นฐาน"}</td></tr><tr><td>น้ำสัตว์</td><td>{animalWaterNeed(game)} หน่วย/เดือน หากน้ำไม่พอสุขภาพฝูงจะลด</td></tr></tbody></table></div><div className="panel pad" style={{ boxShadow: "none" }}><h3 className="section-title">ความเสี่ยงสมจริง</h3><ul className="muted"><li>อาหารไม่พอ → ความหิวสัตว์เพิ่ม และมีโอกาสสัตว์หิวตาย</li><li>ไม่มีคอก/เวรยาม → สัตว์หนีหรือถูกขโมยง่ายขึ้น</li><li>เลือกขยายฝูง → ได้ผลดีระยะยาว แต่กินอาหารมากขึ้น</li><li>เลือกฆ่าเพื่ออาหาร → ช่วยวิกฤตทันที แต่ทำลายอนาคตของฝูง</li></ul></div></div><h3 className="section-title" style={{ marginTop: 16 }}>เลือกแผนสัตว์เลี้ยงเดือนนี้</h3>{total <= 0 && <div className="empty dimmed">ยังไม่มีสัตว์เลี้ยงในค่าย แผนสัตว์เลี้ยงจะเปิดใช้เมื่อพบหรือรับสัตว์จากเหตุการณ์ สำรวจพื้นที่รอบค่าย หรือพ่อค้านำสัตว์เข้ามา</div>}<div className="work-grid">{actionCards.map((a) => <button key={a.id} className={game.animalAction === a.id ? "work-card active-step" : "work-card"} disabled={a.disabled} onClick={() => setAnimalAction(a.id)} style={{ textAlign: "left", opacity: a.disabled ? .55 : 1 }}><b>{a.icon} {a.title}</b><p className="muted small">{a.text}</p></button>)}</div><h3 className="section-title" style={{ marginTop: 16 }}>บันทึกสัตว์ล่าสุด</h3>{state.log.length ? <div className="timeline compact">{state.log.slice(0, 8).map((l, i) => <div className="log" key={`animal-log-${i}`}>{l}</div>)}</div> : <div className="empty">ยังไม่มีสัตว์เลี้ยงในค่าย ลองสำรวจหรือรอเหตุการณ์พบสัตว์หลง</div>}</section>;
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

function PoliciesView({ game, updatePolicies }: { game: GameState; updatePolicies: (patch: Partial<CampPolicies>) => void }) {
  if (!canUsePolicies(game)) return <section className="panel pad"><h2 className="title">นโยบายยังไม่พร้อม</h2><p className="muted">ค่ายยังต้องพึ่งคำสั่งรายเดือนของผู้นำโดยตรง วิจัย “ธรรมเนียมบริหารค่าย” หรือสร้างศาลาประชุมก่อน ระบบนโยบายจึงจะเปิดให้ใช้</p></section>;
  const policies = normalizePolicies(game.policies);
  const damaged = Object.entries(normalizeBuildingCondition(game)).filter(([, hp]) => (hp ?? 100) < 72).length;
  const crisis = normalizeCrisis(game.crisis);
  const toggle = (key: keyof CampPolicies) => {
    const current = policies[key];
    if (typeof current === "boolean") updatePolicies({ [key]: !current } as Partial<CampPolicies>);
  };
  return (
    <section className="panel pad">
      <div className="split"><div><h2 className="title">นโยบายค่าย</h2><p className="muted">เมื่อคนเริ่มมากขึ้น ค่ายต้องมีธรรมเนียมที่ทำงานแทนคำสั่งรายเดือนบางส่วน นโยบายเหล่านี้จะช่วยให้ระบบอาหาร น้ำ เด็ก และซ่อมบำรุงเชื่อมกันโดยอัตโนมัติ</p></div><span className="badge green">ระบบอัตโนมัติ</span></div>
      <div className="work-grid">
        <button className={policies.autoFoodShift ? "work-card active-step" : "work-card"} onClick={() => toggle("autoFoodShift")}><b>🌾 นโยบายเสบียงฉุกเฉิน</b><p className="muted small">ถ้าอาหารต่ำกว่า 1.5 เท่าของความต้องการ ระบบจะโยกคนว่างบางส่วนไปหาอาหาร</p></button>
        <button className={policies.autoMaintenance ? "work-card active-step" : "work-card"} onClick={() => toggle("autoMaintenance")}><b>🧰 ซ่อมบำรุงอัตโนมัติ</b><p className="muted small">ช่างจะใช้ไม้/หินเล็กน้อยเพื่อรักษาอาคารที่เริ่มเสื่อม โดยเฉพาะเมื่อมีเพิงซ่อมบำรุง</p></button>
        <button className={policies.protectChildren ? "work-card active-step" : "work-card"} onClick={() => toggle("protectChildren")}><b>🧒 คุ้มครองเด็กช่วยงาน</b><p className="muted small">เด็ก 12–14 ช่วยงานได้ แต่ระบบจะกันออกจากงานเสี่ยง เช่น ล่า ตัดไม้ ก่อสร้างหนัก และลาดตระเวน</p></button>
        <button className={policies.reserveWater ? "work-card active-step" : "work-card"} onClick={() => toggle("reserveWater")}><b>🏺 สำรองน้ำส่วนเกิน</b><p className="muted small">ถ้ามีถังเก็บน้ำและน้ำเหลือมาก ระบบจะย้ายน้ำบางส่วนเข้าคลังน้ำสำรอง</p></button>
      </div>
      <div className="two-col" style={{ marginTop: 14 }}>
        <div className="panel pad" style={{ boxShadow: "none" }}><h3 className="section-title">สถานะโครงสร้าง</h3><p className="muted">อาคารที่ชำรุด: {damaged} จุด</p><div className="timeline compact">{Object.entries(normalizeBuildingCondition(game)).slice(0, 8).map(([key, hp]) => <div className="log" key={key}><b>{buildingData[key as BuildingKey]?.icon} {buildingData[key as BuildingKey]?.title ?? key}</b><small>ความสมบูรณ์ {pct(hp ?? 100)}</small></div>)}</div></div>
        <div className="panel pad" style={{ boxShadow: "none" }}><h3 className="section-title">ภัยใหญ่ระยะยาว</h3><p>{crisis.kind === "none" ? "ยังไม่มีเงาภัยใหญ่ชัดเจน" : crisisWarning(crisis)}</p><p className="muted">หอเตือนภัย การซ้อมรับภัยใหญ่ เสบียง น้ำสำรอง ความปลอดภัย และความไว้ใจ จะช่วยให้ผ่านเหตุการณ์ระดับปลายเกมได้</p></div>
      </div>
    </section>
  );
}

function SettingsView({ game, resetGame, showTutorialAgain, theme, setTheme }: { game: GameState; resetGame: () => void; showTutorialAgain: () => void; theme: "light" | "dark"; setTheme: (theme: "light" | "dark") => void }) {
  const [importText, setImportText] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [devCode, setDevCode] = useState("");
  const [devUnlocked, setDevUnlocked] = useState(false);
  const exportText = JSON.stringify(game, null, 2);
  const compactDebug = debugReport(game);
  const copyText = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
  };
  const importSave = () => {
    try {
      const parsed = JSON.parse(importText) as GameState;
      if (!parsed || !parsed.version || !parsed.leaderName || !parsed.houseName) throw new Error("Invalid save");
      window.localStorage.setItem(saveKey, JSON.stringify({ ...parsed, summaryModal: null, savedText: "นำเข้าเซฟแล้ว" }));
      setImportMessage("นำเข้าเซฟสำเร็จ กำลังโหลดใหม่...");
      window.setTimeout(() => window.location.reload(), 450);
    } catch {
      setImportMessage("นำเข้าไม่ได้: รูปแบบ JSON ไม่ถูกต้องหรือไม่ใช่เซฟของเกมนี้");
    }
  };
  const mailBody = encodeURIComponent(`Feedback Evolution of Us Alpha v${GAME_VERSION}\n\nวาง Debug Report หรือความเห็นตรงนี้:\n\n${compactDebug}`);
  return (
    <section className="panel pad">
      <h2 className="title">ตั้งค่า</h2>
      <div className="dashboard-grid">
        <div className="panel kpi"><span className="muted">เวอร์ชันเกม</span><b>Alpha v{GAME_VERSION}</b><small>{BUILD_LABEL} · {BUILD_DATE}</small></div>
        <div className="panel kpi"><span className="muted">เซฟเกม</span><b>Local Save</b><small>บันทึกอยู่ใน browser เครื่องนี้</small></div>
        <div className="panel kpi"><span className="muted">คลังเมือง</span><b>{fmt(game.resources.gold)} 🪙</b><small>ทรัพย์สินเมือง</small></div>
        <div className="panel kpi"><span className="muted">พื้นหลัง</span><b>{originInfo(game.origin).icon} {originInfo(game.origin).title}</b><small>บัฟมีผลกับระบบจริง</small></div>
      </div>

      <div className="two-col" style={{ marginTop: 14 }}>
        <div className="panel pad" style={{ boxShadow: "none" }}>
          <h3>การเล่นและบันทึก</h3>
          <p className="muted">ใช้เมื่อต้องการเริ่มรอบใหม่ หรือเปิดระบบสอนเล่นอีกครั้ง</p>
          <div className="flex"><button className="secondary" onClick={showTutorialAgain}>เปิดระบบสอนเล่นอีกครั้ง</button><button className="danger" onClick={resetGame}>ลบบันทึกเกมและกลับหน้าแรก</button></div>
        </div>
        <div className="panel pad" style={{ boxShadow: "none" }}>
          <h3>โหมดแสดงผล</h3>
          <p className="muted">เลือกโทนหน้าจอสำหรับอ่านข้อมูลยาว ๆ ตอนกลางวันหรือกลางคืน การตั้งค่านี้ไม่กระทบเซฟเกม</p>
          <div className="theme-toggle" role="group" aria-label="เลือกธีม">
            <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>☀️ Light</button>
            <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>🌙 Dark</button>
          </div>
          <small className="muted">ตอนนี้ใช้: {theme === "dark" ? "Dark Mode" : "Light Mode"}</small>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 14 }}>
        <div className="panel pad" style={{ boxShadow: "none" }}>
          <h3>ผู้มาตั้งถิ่นฐานประจำปี</h3>
          <p className="muted">ทุกสิ้นปีจะมีคนเดินทางเข้ามา 1–10 คนแบบสุ่ม แยกจากเหตุการณ์ผู้อพยพที่ยังเกิดเป็น Event ให้ตัดสินใจได้เหมือนเดิม</p>
          <table className="report-table"><tbody><tr><td>ช่วงจำนวน</td><td>1–10 คน/ปี</td></tr><tr><td>ผลที่ตามมา</td><td>เพิ่มแรงงานและครอบครัว แต่เพิ่มภาระอาหาร น้ำ และที่พัก</td></tr><tr><td>บันทึก</td><td>ขึ้นในพงศาวดารและกระดิ่งระบบ</td></tr></tbody></table>
        </div>
        <div className="panel pad" style={{ boxShadow: "none" }}>
          <h3>Feedback ผู้เล่น</h3>
          <p className="muted">หากต้องการส่งความเห็น สามารถกดอีเมลได้ทันที ส่วนเครื่องมือภายในจะถูกซ่อนไว้เพื่อไม่ให้รบกวนการเล่นปกติ</p>
          <a className="secondary link-btn" href={`mailto:milligysas@gmail.com?subject=Evolution%20of%20Us%20Alpha%20Feedback&body=${mailBody}`}>ส่ง Feedback ทางอีเมล</a>
        </div>
      </div>

      <details className="details-box dev-tools-box" style={{ marginTop: 16 }}>
        <summary>เครื่องมือพิเศษ</summary>
        {!devUnlocked ? <div className="dev-lock"><p className="muted small">พื้นที่นี้เป็นส่วนเสริมสำหรับตรวจข้อมูลภายใน ใส่รหัสหากต้องการเปิดใช้งาน</p><div className="flex"><input className="input" placeholder="รหัสผู้พัฒนา" value={devCode} onChange={(e) => setDevCode(e.target.value)} /><button className="primary" onClick={() => setDevUnlocked(devCode.trim() === "248655")}>ปลดล็อก</button></div>{devCode && devCode.trim() !== "248655" && <small className="danger-text">รหัสไม่ถูกต้อง</small>}</div> : <div><div className="flex"><button className="secondary" onClick={() => copyText(compactDebug)}>คัดลอกรายงานภายใน</button><button className="secondary" onClick={() => copyText(exportText)}>คัดลอกข้อมูลเซฟ</button><button className="secondary" onClick={() => copyText(JSON.stringify(portableDataSummary, null, 2))}>คัดลอกชุดข้อมูลระบบ</button><button className="secondary" onClick={() => setDevUnlocked(false)}>ล็อกอีกครั้ง</button></div><textarea className="input" readOnly rows={8} value={compactDebug} style={{ marginTop: 8, fontFamily: "ui-monospace, Consolas, monospace" }} /><details className="details-box" style={{ marginTop: 10 }}><summary>Export / Import Save JSON</summary><textarea className="input" readOnly rows={8} value={exportText} style={{ marginTop: 8, fontFamily: "ui-monospace, Consolas, monospace" }} /><textarea className="input" rows={6} placeholder="วาง Save JSON ที่ต้องการนำเข้า" value={importText} onChange={(e) => setImportText(e.target.value)} style={{ marginTop: 10, fontFamily: "ui-monospace, Consolas, monospace" }} /><div className="flex" style={{ marginTop: 8 }}><button className="secondary" onClick={importSave}>Import Save</button><span className="muted small">{importMessage}</span></div></details></div>}
      </details>
    </section>
  );
}

function estimateBuildMonths(game: GameState): number | null {
  if (!game.construction) return null;
  const data = buildingData[game.construction.id];
  const l = normalizeLabor(game);
  const power = Math.max(1, l.build * (6 + (game.origin === "builder" ? 1 : 0) + (game.buildings.workshop ? 1 : 0) + (game.leaderFocus === "workWithPeople" ? 1 : 0)));
  return Math.max(1, Math.ceil((data.work - game.construction.progress) / power));
}
function estimateResearchMonths(game: GameState): number | null {
  if (!game.activeResearch) return null;
  const data = researchData[game.activeResearch.id];
  const l = normalizeLabor(game);
  const power = Math.max(1, (l.research + Math.floor(l.teach * 0.6)) * (6 + (game.origin === "keeper" ? 1 : 0)) + (game.leaderFocus === "study" ? 5 : 0));
  return Math.max(1, Math.ceil((data.cost - game.activeResearch.progress) / power));
}
function keyVillagers(game: GameState): Person[] {
  const alive = alivePeople(game);
  const leader = alive.find((p) => p.id === "leader");
  const picked = alive
    .filter((p) => p.id !== "leader" && p.age >= 16)
    .sort((a, b) => (b.skill === "healer" ? 2 : 0) + (b.skill === "hunter" ? 2 : 0) + b.health - ((a.skill === "healer" ? 2 : 0) + (a.skill === "hunter" ? 2 : 0) + a.health))
    .slice(0, 4);
  return leader ? [leader, ...picked] : picked;
}
function specialEventLabel(event: GameEvent): { icon: string; title: string; text: string } | null {
  if (event.category.includes("การค้า") || event.title.includes("พ่อค้า")) return { icon: "🪙", title: "เหตุการณ์พิเศษ: พ่อค้ามาถึง", text: "คาราวานไม่ได้มาทุกเดือน การค้าครั้งนี้อาจเปลี่ยนทางรอดของค่ายได้" };
  if (event.category.includes("อพยพ") || event.title.includes("อพยพ") || event.title.includes("ผู้ลี้ภัย")) return { icon: "🧳", title: "เหตุการณ์สำคัญ: ผู้คนมาถึงแนวค่าย", text: "การรับหรือปฏิเสธใครสักคนจะกลายเป็นความทรงจำของชุมชน" };
  if (event.category.includes("อาชญากรรม") || event.title.includes("ขโมย") || event.title.includes("เสบียง")) return { icon: "⚖️", title: "เหตุการณ์สำคัญ: ความยุติธรรมถูกทดสอบ", text: "การลงโทษที่เลือกจะสร้างกฎเงียบให้คนทั้งค่ายจดจำ" };
  if (event.category.includes("ภัยมนุษย์") || event.title.includes("โจร") || event.title.includes("บุก")) return { icon: "⚠️", title: "เหตุการณ์สำคัญ: ภัยจากคนภายนอก", text: "เตรียมคน ปกปิดทรัพย์สิน หรือเปิดเจรจาให้เหมาะกับกำลังของค่าย" };
  if (event.category.includes("สัตว์") && (event.title.includes("ขโมย") || event.title.includes("หนี") || event.title.includes("ตาย"))) return { icon: "🐐", title: "เหตุการณ์สำคัญ: ฝูงสัตว์กำลังเสี่ยง", text: "สัตว์เลี้ยงคืออาหารในอนาคต แต่ก็เป็นภาระที่ต้องปกป้อง" };
  if (event.rare) return { icon: "✦", title: "เหตุการณ์หายาก", text: "เหตุการณ์นี้ไม่เกิดบ่อย และอาจกลายเป็นความทรงจำสำคัญของถิ่นฐาน" };
  return null;
}
function isPriorityEvent(event: GameEvent): boolean {
  return Boolean(specialEventLabel(event));
}
function isImportantNotice(notice: Notice): boolean {
  if (notice.kind === "trade" || notice.kind === "threat" || notice.kind === "birth" || notice.kind === "warning") return true;
  if (notice.eventId) return isPriorityEvent(getEvent(notice.eventId));
  return notice.title.includes("พ่อค้า") || notice.title.includes("โจร") || notice.title.includes("ขโมย") || notice.title.includes("อพยพ") || notice.title.includes("เกิด") || notice.title.includes("เสียชีวิต");
}
function ActiveProjectsPanel({ game }: { game: GameState }) {
  const buildMonths = estimateBuildMonths(game);
  const researchMonths = estimateResearchMonths(game);
  if (!game.construction && !game.activeResearch) {
    return <section className="panel pad project-strip"><h3 className="section-title">งานที่กำลังดำเนินการ</h3><div className="empty compact-empty">ยังไม่มีโครงการก่อสร้างหรือการวิจัยที่กำลังทำอยู่</div></section>;
  }
  return (
    <section className="panel pad project-strip">
      <h3 className="section-title">งานที่กำลังดำเนินการ</h3>
      <div className="project-grid">
        {game.construction && <div className="project-card"><b>{buildingData[game.construction.id].icon} กำลังก่อสร้าง: {buildingData[game.construction.id].title}</b><div className="bar"><div className="fill" style={{ width: `${clamp(game.construction.progress / buildingData[game.construction.id].work * 100)}%` }} /></div><small>คืบหน้า {game.construction.progress}/{buildingData[game.construction.id].work} · คาดว่าเหลือ {buildMonths} เดือน</small></div>}
        {game.activeResearch && <div className="project-card"><b>{researchData[game.activeResearch.id].icon} กำลังศึกษา: {researchData[game.activeResearch.id].title}</b><div className="bar"><div className="fill" style={{ width: `${clamp(game.activeResearch.progress / researchData[game.activeResearch.id].cost * 100)}%` }} /></div><small>คืบหน้า {game.activeResearch.progress}/{researchData[game.activeResearch.id].cost} · คาดว่าเหลือ {researchMonths} เดือน</small></div>}
      </div>
    </section>
  );
}
function EventPanel({ game, event, setFocus, selectChoice, setMigrantSelection, endTurn }: { game: GameState; event: GameEvent; setFocus: (key: LeaderFocusKey) => void; selectChoice: (id: string) => void; setMigrantSelection: (ids: string[]) => void; endTurn: () => void }) {
  const laborOver = false; // ระบบรายชื่อคนกันการใช้คนซ้ำตั้งแต่ต้น จึงไม่ต้องเตือนแรงงานเกินแบบตัวเลขเก่า
  const actionMissing = !game.leaderActionSelected;
  const eventMissing = !game.selectedChoiceId;
  const blocked = actionMissing || eventMissing;
  const special = specialEventLabel(event);
  return (
    <section className={special ? "panel event-card special-event" : "panel event-card"}>
      {special && <div className="special-banner"><span>{special.icon}</span><b>{special.title}</b><small>{special.text}</small></div>}
      <div className="kicker">รอบการตัดสินใจ · เดือน {game.month}/12</div>
      <h2>เลือกสิ่งที่จะทำก่อนจบเดือน</h2>
      <p className="muted">เลือกการนำของผู้นำและคำตอบของเหตุการณ์เดือนนี้ให้ครบ การตัดสินใจจะสะสมเป็นผลผลิต ความเสี่ยง ความไว้ใจ และพงศาวดารของถิ่นฐาน</p>

      <div className="decision-block">
        <div className="split"><h3 className="section-title">1) การกระทำของผู้นำ</h3><span className={game.leaderActionSelected ? "badge green" : "badge"}>{game.leaderActionSelected ? "เลือกแล้ว" : "ยังไม่เลือก"}</span></div>
        <div className="option-list leader-actions-in-event">
          {dynamicLeaderActions(game, event).map((focus) => (
            <button
              key={focus.id}
              disabled={Boolean(focus.locked)}
              onClick={() => !focus.locked && setFocus(focus.id)}
              className={`${game.leaderActionSelected && game.leaderFocus === focus.id ? "option active" : "option"} ${focus.locked ? "locked" : ""}`}
            >
              <span className="emoji">{focus.icon}</span>
              <span><b>{focus.title}</b><br /><small className="muted">{focus.text}</small><br /><small className={focus.locked ? "danger-text" : "context-text"}>{focus.locked ? `ล็อก: ${focus.lockReason}` : focus.reason}</small></span>
            </button>
          ))}
        </div>
      </div>

      <div className="decision-block">
        <div className="split"><h3 className="section-title">2) เหตุการณ์ประจำเดือน · {event.category}</h3><span className={game.selectedChoiceId ? "badge green" : "badge"}>{game.selectedChoiceId ? "เลือกแล้ว" : "ยังไม่เลือก"}</span></div>
        <h2>{event.rare ? "✦ " : ""}{event.title}</h2>
        <p>{event.text}</p>
        <MigrantPreview game={game} event={event} setMigrantSelection={setMigrantSelection} selectChoice={selectChoice} />
        <TheftJusticeNote event={event} />
        <div className="option-list">{event.choices.map((c) => <button key={c.id} className={game.selectedChoiceId === c.id ? "option active" : "option"} onClick={() => selectChoice(c.id)}><span className="emoji">{c.icon}</span><span><b>{c.title}</b><br /><small className="muted">{c.tone} · {c.hint}</small></span></button>)}</div>
      </div>

      {laborOver && <p className="danger-text small">จัดคนเกินกำลังจริง {Math.round((laborAssignmentLoad(game) - workerCapacity(game)) * 10) / 10} หน่วย กรุณาพักบางคนก่อนจบเดือน</p>}
      <div className="mini-warning-list">{endMonthWarnings(game).slice(0, 4).map((w, i) => <span key={`${w.title}-${i}`} className={w.severity === "danger" ? "badge red" : "badge"}>{w.icon} {w.title}</span>)}</div>
      {actionMissing && <p className="danger-text small">ยังไม่ได้เลือกการกระทำของผู้นำ</p>}
      {eventMissing && <p className="danger-text small">ยังไม่ได้เลือกวิธีตอบสนองเหตุการณ์</p>}
      <button className="primary" disabled={blocked} onClick={endTurn} style={{ width: "100%", marginTop: 14, opacity: blocked ? .55 : 1 }}>ยืนยันและจบเดือน →</button>
      <p className="muted small">การตัดสินใจไม่ได้หายไปพร้อมเดือนนี้ บางอย่างจะกลับมาในรูปของความไว้ใจ ข่าวลือ ความกลัว หรือความทรงจำของคนรุ่นต่อไป</p>
    </section>
  );
}


function MerchantEconomyPanel({ game }: { game: GameState }) {
  const market = marketReadiness(game);
  const canTrade = game.stage !== "ค่ายพักแรม" || game.labor.trade > 0 || game.rumors.some((r) => r.title.includes("คาราวาน"));
  const buy = [
    { icon: "🛠️", title: "เครื่องมือ", cost: 9, value: "ลดอุบัติเหตุและเร่งงานไม้/หิน" },
    { icon: "🌱", title: "เมล็ดพันธุ์", cost: 6, value: "ช่วยเปิดทางสู่การเพาะปลูกและอาหารเสถียร" },
    { icon: "🍃", title: "ยา/สมุนไพร", cost: 5, value: "ช่วยคนป่วยและลดแผลติดเชื้อ" },
    { icon: "🍲", title: "อาหารฉุกเฉิน", cost: 10, value: "ใช้เมื่อค่ายใกล้อดอาหาร" },
  ];
  return (
    <section className="panel pad" style={{ boxShadow: "none" }}>
      <div className="split"><h3 className="section-title">ระบบเศรษฐกิจและพ่อค้า</h3><span className={canTrade ? "badge green" : "badge"}>{canTrade ? "เริ่มค้าขายได้" : "รอพ่อค้าหรือชุมชนโตขึ้น"}</span></div>
      <p className="muted small">ทองเป็นทรัพย์สินของเมือง ได้จากการขายของส่วนเกินหรือเหตุการณ์พ่อค้า และใช้ซื้อของที่ช่วยให้รอดในเดือนยาก</p>
      <div className="market-grid">
        {market.sellables.map((item) => <div key={item.label} className="market-card"><b>{item.icon} {item.label}</b><small>มี {fmt(item.amount)} · มูลค่าประมาณ 🪙 {fmt(item.price)}</small></div>)}
      </div>
      <div className="market-grid" style={{ marginTop: 10 }}>
        {buy.map((item) => <div key={item.title} className="market-card"><b>{item.icon} {item.title}</b><small>ราคา 🪙 {item.cost} · {item.value}</small></div>)}
      </div>
      <details className="details-box"><summary>วิธีใช้ระบบนี้</summary><p>เมื่อเหตุการณ์พ่อค้ามาถึง จะมีตัวเลือกซื้อ/ขายจริงในแผงเหตุการณ์ประจำเดือน หากไม่มีพ่อค้า งาน “แลกเปลี่ยน / ขายของส่วนเกิน” จะค่อย ๆ สร้างทองจากของที่เก็บไว้ได้</p></details>
    </section>
  );
}
function ThreatSystemPanel({ game }: { game: GameState }) {
  const tier = threatTier(game);
  const steps = [
    { value: 20, label: "ข่าวลือ" },
    { value: 40, label: "ถูกจับตา" },
    { value: 60, label: "สอดแนม" },
    { value: 80, label: "พร้อมบุก" },
  ];
  return (
    <section className="panel pad" style={{ boxShadow: "none" }}>
      <div className="split"><h3 className="section-title">ภัยคุกคามภายนอก</h3><span className="badge red">{pct(game.threat)}</span></div>
      <div className="threat-card"><b>{tier.icon} {tier.level} · {tier.name}</b><p className="muted small">{tier.text}</p><div className="bar"><div className={game.threat >= 60 ? "fill danger" : game.threat >= 35 ? "fill warn" : "fill"} style={{ width: `${clamp(game.threat)}%` }} /></div></div>
      <div className="milestone-row">{steps.map((s) => <span key={s.label} className={game.threat >= s.value ? "badge green" : "badge"}>{s.value}% {s.label}</span>)}</div>
      <p className="muted small">ลดได้ด้วยเวรยาม ลาดตระเวน รั้วไม้ สายข่าว หรือการเจรจาในเหตุการณ์พิเศษ</p>
    </section>
  );
}

function MarketPanel({ game, applyTrade }: { game: GameState; applyTrade: (offerId: string) => void }) {
  const offers = tradeOffers(game);
  return <section className="panel pad" style={{ boxShadow: "none" }}><div className="split"><div><h3 className="section-title">ตลาดและพ่อค้า</h3><p className="muted small">ทองใช้ซื้อทางรอดในเดือนยาก และได้จากการขายของส่วนเกินเมื่อมีช่องทางค้า</p></div><span className="badge green">🪙 {fmt(game.resources.gold)}</span></div><div className="market-grid expanded-market">{offers.map((o) => <article key={o.id} className={`market-card ${o.disabled ? "locked" : ""}`}><b>{o.icon} {o.title}</b><small>{o.text}</small><div className="split" style={{ marginTop: 8 }}><span className="badge">{o.preview}</span><button className="secondary" disabled={o.disabled} onClick={() => applyTrade(o.id)} style={{ opacity: o.disabled ? .55 : 1 }}>{o.kind === "buy" ? "ซื้อ" : "ขาย"}</button></div>{o.disabled && <small className="danger-text">{o.disabledReason}</small>}</article>)}</div></section>;
}
function ThreatMatrixPanel({ game }: { game: GameState }) {
  return <section className="panel pad" style={{ boxShadow: "none" }}><h3 className="section-title">แผนภาพภัยคุกคาม</h3><div className="threat-matrix">{threatBreakdown(game).map((t) => <article key={t.title} className="threat-box"><div className="split"><b>{t.icon} {t.title}</b><span className={t.value >= 65 ? "badge red" : t.value >= 45 ? "badge" : "badge green"}>{pct(t.value)}</span></div><div className="bar"><div className={t.value >= 65 ? "fill danger" : t.value >= 45 ? "fill warn" : "fill"} style={{ width: `${clamp(t.value)}%` }} /></div><small>{t.text}</small></article>)}</div></section>;
}
function NewsView({ game, applyTrade }: { game: GameState; applyTrade: (offerId: string) => void }) {
  const intelUnlocked = game.stage === "เมืองเล็ก" || game.researchDone.signalNetwork;
  const specialHints = [
    { icon: "🪙", title: "คาราวานและพ่อค้า", text: "เมื่อพ่อค้ามาถึง จะมีกรอบเหตุการณ์พิเศษให้ซื้อ ขาย หรือแลกเปลี่ยนของส่วนเกินเป็นทอง" },
    { icon: "⚠️", title: "ภัยจากโจรและคนเร่ร่อน", text: "ข่าวล่วงหน้าช่วยให้เตรียมเวรยาม ซ่อนเสบียง หรือเลือกเจรจาก่อนเกิดความเสียหาย" },
    { icon: "🌲", title: "ร่องรอยในป่า", text: "การสำรวจและสายข่าวจะเปิดข่าวลือเกี่ยวกับลำธาร ถ้ำ ซากเก่า และทรัพยากรที่ยังไม่รู้จัก" },
  ];
  return (
    <div>
      <section className="panel pad" style={{ marginBottom: 14 }}>
        <div className="split">
          <div>
            <h2 className="title">ข่าวสาร การค้า และภัยภายนอก</h2>
            <p className="muted">ศูนย์รวมข่าวลือ เครือข่ายสายข่าว พ่อค้า และสัญญาณภัย เพื่อให้ผู้เล่นเห็นโอกาสและอันตรายก่อนมันกลายเป็นเหตุการณ์ใหญ่</p>
          </div>
          <span className={intelUnlocked ? "badge green" : "badge"}>{intelUnlocked ? "เปิดระบบสายข่าวแล้ว" : "สายข่าวยังไม่ปลดล็อก"}</span>
        </div>
        <div className="dashboard-grid" style={{ marginTop: 12 }}>
          <div className="panel kpi"><span className="muted">ข่าวลือที่มี</span><b>{game.rumors.length}</b><small>เกิดจากการสำรวจ เหตุการณ์ และงานสายข่าว</small></div>
          <div className="panel kpi"><span className="muted">ภัยภายนอก</span><b>{pct(game.threat)}</b><small>{threatTier(game).name}</small></div>
          <div className="panel kpi"><span className="muted">คลังเมือง</span><b>🪙 {fmt(game.resources.gold)}</b><small>ใช้ซื้อเครื่องมือ อาหาร ยา และข้อมูล</small></div>
          <div className="panel kpi"><span className="muted">มูลค่าขายโดยประมาณ</span><b>🪙 {fmt(marketReadiness(game).totalPotential)}</b><small>จากอาหารส่วนเกิน หนัง สมุนไพร และเครื่องมือ</small></div>
        </div>
      </section>

      <section className="two-col" style={{ marginBottom: 14 }}>
        <MarketPanel game={game} applyTrade={applyTrade} />
        <ThreatMatrixPanel game={game} />
      </section>

      <section className="two-col" style={{ marginTop: 14 }}>
        <div className="panel pad" style={{ boxShadow: "none" }}>
          <h3 className="section-title">ข่าวลือที่บันทึกไว้</h3>
          {game.rumors.length ? <div className="timeline">{game.rumors.map((r) => <div key={r.id} className="rumor-card"><b>{r.title}</b><p className="muted small">{r.detail}</p><div className="deltas"><span className="badge blue">อันตราย: {r.danger}</span><span className="badge">{r.discovered ? "ตรวจสอบแล้ว" : "ยังไม่ยืนยัน"}</span></div></div>)}</div> : <div className="empty">ยังไม่มีข่าวลือใหม่ ลองให้ผู้นำออกสำรวจ หรือปลดล็อกงานสายข่าวเมื่อถิ่นฐานเติบโตขึ้น</div>}
        </div>
        <div className="panel pad" style={{ boxShadow: "none" }}>
          <h3 className="section-title">เหตุการณ์พิเศษที่ควรจับตา</h3>
          <div className="timeline">{specialHints.map((h) => <div key={h.title} className="rumor-card"><b>{h.icon} {h.title}</b><p className="muted small">{h.text}</p></div>)}</div>
          <details className="details-box" open><summary>การเรียนรู้สายข่าว</summary><p>เมื่อเข้าสู่ระยะเมืองเล็ก หรือเรียนรู้ “เครือข่ายสายข่าว” จะสามารถจัดแรงงานไปฟังข่าวจากพ่อค้า คนเดินทาง และครอบครัวรอบถิ่นฐาน เพื่อเพิ่มโอกาสเห็นเหตุการณ์ก่อนเกิดขึ้น</p></details>
        </div>
      </section>

      <section className="two-col" style={{ marginTop: 14 }}>
        <MerchantEconomyPanel game={game} />
        <ThreatSystemPanel game={game} />
      </section>
    </div>
  );
}

function RumorPanel({ game }: { game: GameState }) {
  return <section className="panel pad"><h3 className="section-title">ข่าวลือ / สิ่งที่ยังไม่รู้</h3>{game.rumors.length ? <div className="timeline">{game.rumors.slice(0, 4).map((r) => <div key={r.id} className="rumor-card"><b>{r.title}</b><p className="muted small">{r.detail}</p><span className="badge blue">อันตราย: {r.danger}</span></div>)}</div> : <div className="empty">ยังไม่มีข่าวลือใหม่ หากอยากเปิดเส้นทางเรื่องราว ลองให้ผู้นำออกสำรวจพื้นที่</div>}</section>;
}
function emptyLocations(): LocationProgress {
  return {
    shallowStream: { progress: 20, status: "ข่าวลือ", discovered: true, outpost: false },
    deepWoods: { progress: 10, status: "ข่าวลือ", discovered: true, outpost: false },
    oldTradeRoad: { progress: 0, status: "ข่าวลือ", discovered: false, outpost: false },
    rockyRidge: { progress: 0, status: "ข่าวลือ", discovered: false, outpost: false },
    abandonedCamp: { progress: 0, status: "ข่าวลือ", discovered: false, outpost: false },
    marshPools: { progress: 0, status: "ข่าวลือ", discovered: false, outpost: false },
    huntingGround: { progress: 0, status: "ข่าวลือ", discovered: false, outpost: false },
    oldCave: { progress: 0, status: "ข่าวลือ", discovered: false, outpost: false },
  };
}
function normalizeLocations(locations?: Partial<LocationProgress>): LocationProgress {
  const base = emptyLocations();
  (Object.keys(base) as LocationKey[]).forEach((key) => {
    const src = locations?.[key];
    if (src) base[key] = { progress: clamp(src.progress ?? 0), status: src.status ?? locationStatusFromProgress(src.progress ?? 0), discovered: !!src.discovered || (src.progress ?? 0) > 0, outpost: !!src.outpost };
  });
  return base;
}
function locationStatusFromProgress(progress: number): LocationStatus {
  if (progress >= 100) return "ควบคุมได้";
  if (progress >= 70) return "รู้เส้นทาง";
  if (progress >= 30) return "สำรวจบางส่วน";
  return "ข่าวลือ";
}
function locationDiscoveryCount(game: GameState) {
  return (Object.keys(locationData) as LocationKey[]).filter((key) => (game.locations ?? emptyLocations())[key]?.discovered).length;
}
function locationProgressText(item: { progress: number; status: LocationStatus; discovered: boolean }) {
  if (!item.discovered) return "ยังไม่ยืนยัน";
  return `${item.status} · ${Math.round(item.progress)}%`;
}
function bestExploreTarget(game: GameState): LocationKey {
  const locations = normalizeLocations(game.locations);
  const target = game.exploreTarget ?? "shallowStream";
  if (locations[target]) return target;
  return "shallowStream";
}
function resolveExploration(game: GameState, changes: string[]): GameState {
  let g = { ...game, locations: normalizeLocations(game.locations) };
  const l = normalizeLabor(g);
  const explorePower = (l.explore ?? 0) + (g.leaderFocus === "scout" ? 0.8 : 0) + (g.labor.intel ?? 0) * 0.25;
  if (explorePower <= 0) return g;
  const target = bestExploreTarget(g);
  const before = g.locations[target];
  const data = locationData[target];
  const gain = Math.max(6, Math.round(explorePower * (8 + skillCount(g, "hunter") * 0.35 + skillCount(g, "keeper") * 0.25)));
  const progress = clamp((before.progress ?? 0) + gain);
  const newlyDiscovered = !before.discovered;
  const newStatus = locationStatusFromProgress(progress);
  g = { ...g, locations: { ...g.locations, [target]: { ...before, progress, status: newStatus, discovered: true } } };
  if (newlyDiscovered) {
    g = addNotice(g, { kind: "event", title: `พบพื้นที่ใหม่: ${data.title}`, text: data.text });
    g = addLog(g, `พบพื้นที่ใหม่: ${data.title}`, `${data.icon} ${data.text}`, "good", ["สำรวจ", data.title]);
    changes.push(`พบพื้นที่ใหม่: ${data.title}`);
  } else {
    changes.push(`สำรวจ${data.title} +${gain}%`);
  }
  if (before.status !== newStatus && progress >= 30) {
    g = addLog(g, `${data.title}: ${newStatus}`, `คนสำรวจเริ่มเข้าใจพื้นที่นี้ดีขึ้น — ${data.resource} แต่ยังมีความเสี่ยงเรื่อง${data.risk}`, "normal", ["แผนที่", newStatus]);
    if (newStatus === "สำรวจบางส่วน") g = { ...g, resources: changeResources(g.resources, data.resourceBonus), metrics: changeMetrics(g.metrics, { trust: 1 }) };
    if (newStatus === "รู้เส้นทาง") {
      g = { ...g, threat: clamp(g.threat + data.threat / 4 - (g.labor.patrol ?? 0), 0, 100), metrics: changeMetrics(g.metrics, { security: 1, morale: 1 }) };
      g = addNotice(g, { kind: data.trade > 0 ? "trade" : data.beast > 6 ? "threat" : "event", title: `เส้นทางเริ่มชัด: ${data.title}`, text: `พื้นที่นี้เปิดทางให้${data.resource} แต่ต้องระวัง${data.risk}` });
    }
    if (newStatus === "ควบคุมได้") {
      g = { ...g, resources: changeResources(g.resources, data.resourceBonus), metrics: changeMetrics(g.metrics, { cohesion: 2, security: data.beast > 6 ? 1 : 0 }) };
      changes.push(`${data.title} ถูกควบคุมเป็นเส้นทางปลอดภัยมากขึ้น`);
    }
  }
  const travelRisk = Math.max(0, data.beast + data.threat + data.disease - (g.labor.guard ?? 0) * 3 - (g.labor.patrol ?? 0) * 4 - (g.researchDone.watchRoutine ? 3 : 0));
  if (Math.random() * 100 < Math.min(28, travelRisk)) {
    g = Math.random() > 0.45 ? woundSomeone(g, `การสำรวจ${data.title}`) : addLog(g, `เกือบเกิดเหตุที่${data.title}`, `คนสำรวจกลับมาช้าพร้อมเรื่องเล่าว่า${data.risk}ไม่ใช่แค่ข่าวลือ`, "bad", ["สำรวจ", "เสี่ยง"]);
    changes.push(`การสำรวจ${data.title}เกิดความเสี่ยง`);
  }
  if (progress >= 60 && data.trade > 0 && !g.pendingEvents.includes("merchant_arrival")) g = { ...g, pendingEvents: ["merchant_arrival", ...g.pendingEvents] };
  if (progress >= 55 && data.threat >= 7 && !g.pendingEvents.includes("winter_raider_warning")) g = { ...g, pendingEvents: ["winter_raider_warning", ...g.pendingEvents] };
  if (progress >= 45 && data.beast >= 7 && !g.pendingEvents.includes("tracks_near_camp")) g = { ...g, pendingEvents: ["tracks_near_camp", ...g.pendingEvents] };
  if (progress >= 45 && target === "huntingGround" && !g.pendingEvents.includes("wild_chickens_near_grain")) g = { ...g, pendingEvents: ["wild_chickens_near_grain", ...g.pendingEvents] };
  if (progress >= 40 && target === "oldTradeRoad" && !g.pendingEvents.includes("thin_cow_on_old_road")) g = { ...g, pendingEvents: ["thin_cow_on_old_road", ...g.pendingEvents] };
  if (progress >= 35 && target === "marshPools" && !g.pendingEvents.includes("piglets_in_marsh")) g = { ...g, pendingEvents: ["piglets_in_marsh", ...g.pendingEvents] };
  if (progress >= 55 && target === "deepWoods" && !g.pendingEvents.includes("guard_dog_at_night")) g = { ...g, pendingEvents: ["guard_dog_at_night", ...g.pendingEvents] };
  return g;
}

