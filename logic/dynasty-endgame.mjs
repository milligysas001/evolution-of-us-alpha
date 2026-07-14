export const VICTORY_PATHS = {
  enduring: {
    key: "enduring",
    icon: "🌾",
    title: "นครแห่งความอยู่รอด",
    description: "ผ่านภัยใหญ่และสร้างเสบียงที่ทำให้คนรุ่นต่อไปไม่ต้องเริ่มจากความหิว",
  },
  trade: {
    key: "trade",
    icon: "🪙",
    title: "ศูนย์กลางการค้า",
    description: "เชื่อมเมืองด้วยตลาด คาราวาน และสนธิสัญญาที่สร้างความมั่งคั่งอย่างต่อเนื่อง",
  },
  peace: {
    key: "peace",
    icon: "🕊️",
    title: "สหพันธ์แห่งสันติ",
    description: "สร้างพันธมิตรกับเมืองรอบข้างและยุติความขัดแย้งโดยไม่ให้สงครามกลืนอนาคต",
  },
  knowledge: {
    key: "knowledge",
    icon: "📚",
    title: "นครแห่งความรู้",
    description: "รักษาความรู้ วิจัยภูมิปัญญาหลัก และส่งต่อบทเรียนให้คนหลายรุ่น",
  },
  legacy: {
    key: "legacy",
    icon: "👑",
    title: "ตระกูลยืนยาว",
    description: "สืบทอดผู้นำหลายรุ่นโดยเมืองยังมั่นคงและประชากรเติบโต",
  },
  guardian: {
    key: "guardian",
    icon: "🛡️",
    title: "อาณาจักรผู้พิทักษ์",
    description: "สร้างเมืองที่ปลอดภัย กองกำลังมีวินัย และป้องกันผู้คนโดยไม่ปล่อยให้ความกลัวครอบงำ",
  },
};

const STAGES = ["ค่ายพักแรม", "ชุมชนแรกเริ่ม", "หมู่บ้านถาวร", "เมืองเล็ก", "เมืองการค้า", "นครรัฐ", "อาณาจักร"];
const stageRank = (stage) => Math.max(0, STAGES.indexOf(stage));
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
const alivePeople = (game) => (game.people ?? []).filter((person) => person?.alive !== false);
const researchCount = (game) => Object.values(game.researchDone ?? {}).filter(Boolean).length;
const treatyCount = (game) => (game.neighbors ?? []).filter((city) => city?.tradeTreaty && !city?.atWar).length;
const allianceCount = (game) => (game.neighbors ?? []).filter((city) => city?.alliance && !city?.atWar).length;
const currentLeader = (game) => alivePeople(game).find((person) => person.id === game.dynasty?.currentLeaderId) ?? alivePeople(game).find((person) => person.id === "leader") ?? null;

export function emptyDynastyState(game = {}) {
  const leader = (game.people ?? []).find((person) => person?.id === "leader") ?? null;
  return {
    founderName: String(game.leaderName || leader?.name || "ผู้ก่อตั้ง"),
    generation: 1,
    currentLeaderId: leader?.id || "leader",
    designatedHeirId: null,
    successionHistory: [],
    familyMilestones: [],
    lastSuccession: "ผู้ก่อตั้งยังนำตระกูลอยู่",
  };
}

export function normalizeDynastyState(game = {}) {
  const base = emptyDynastyState(game);
  const old = game.dynasty && typeof game.dynasty === "object" ? game.dynasty : {};
  const aliveIds = new Set(alivePeople(game).map((person) => person.id));
  const currentLeaderId = aliveIds.has(old.currentLeaderId) ? old.currentLeaderId : aliveIds.has("leader") ? "leader" : alivePeople(game)[0]?.id ?? "leader";
  const designatedHeirId = aliveIds.has(old.designatedHeirId) ? old.designatedHeirId : null;
  return {
    ...base,
    ...old,
    founderName: String(old.founderName || base.founderName),
    generation: Math.max(1, Math.round(old.generation || 1)),
    currentLeaderId,
    designatedHeirId,
    successionHistory: Array.isArray(old.successionHistory) ? old.successionHistory.slice(0, 24) : [],
    familyMilestones: Array.isArray(old.familyMilestones) ? old.familyMilestones.slice(0, 60) : [],
    lastSuccession: String(old.lastSuccession || base.lastSuccession),
  };
}

export function emptyVictoryState() {
  return {
    chosenPath: null,
    completedPaths: [],
    achievedAt: null,
    ending: null,
    lastEvaluation: {},
  };
}

export function normalizeVictoryState(game = {}) {
  const base = emptyVictoryState();
  const old = game.victory && typeof game.victory === "object" ? game.victory : {};
  const chosenPath = Object.hasOwn(VICTORY_PATHS, old.chosenPath) ? old.chosenPath : null;
  return {
    ...base,
    ...old,
    chosenPath,
    completedPaths: Array.isArray(old.completedPaths) ? old.completedPaths.filter((key) => Object.hasOwn(VICTORY_PATHS, key)) : [],
    achievedAt: old.achievedAt && typeof old.achievedAt === "object" ? old.achievedAt : null,
    ending: old.ending && typeof old.ending === "object" ? old.ending : null,
    lastEvaluation: old.lastEvaluation && typeof old.lastEvaluation === "object" ? old.lastEvaluation : {},
  };
}

function foodMonths(game) {
  const need = alivePeople(game).reduce((sum, person) => {
    const age = Number(person.age || 0);
    return sum + (age < 8 ? 0.55 : age <= 15 ? 0.8 : age >= 65 ? 0.85 : 1);
  }, 0);
  return need > 0 ? Number(game.resources?.food || 0) / need : 0;
}

function militaryPowerApprox(game) {
  const military = game.military ?? {};
  return Math.round((military.soldiers || 0) * (0.65 + (military.readiness || 0) / 100 + (military.equipment || 0) / 140) + (game.metrics?.security || 0) / 4 + (game.buildings?.palisade || 0) * 5 + (game.buildings?.barracks || 0) * 12);
}

export function victoryProgress(game = {}) {
  const dynasty = normalizeDynastyState(game);
  const population = alivePeople(game).length;
  const noWar = !(game.neighbors ?? []).some((city) => city?.atWar);
  const averageRelation = (game.neighbors ?? []).length
    ? (game.neighbors ?? []).reduce((sum, city) => sum + Number(city?.relation || 0), 0) / (game.neighbors ?? []).length
    : 0;
  const progress = {
    enduring: {
      current: Math.min(100, Math.round((game.crisis?.resolved ? 38 : 0) + Math.min(34, foodMonths(game) / 24 * 34) + Math.min(28, stageRank(game.stage) / 5 * 28))),
      complete: !!game.crisis?.resolved && foodMonths(game) >= 24 && stageRank(game.stage) >= stageRank("เมืองเล็ก"),
      details: [`ผ่านภัยใหญ่ ${game.crisis?.resolved ? "แล้ว" : "ยัง"}`, `เสบียงอาหาร ${foodMonths(game).toFixed(1)}/24 เดือน`, `ระดับเมือง ${game.stage || "ค่ายพักแรม"}`],
    },
    trade: {
      current: Math.min(100, Math.round(Math.min(35, treatyCount(game) / 3 * 35) + Math.min(25, Number(game.resources?.gold || 0) / 120 * 25) + Math.min(20, stageRank(game.stage) / 4 * 20) + ((game.buildings?.marketSquare || game.buildings?.caravanPost) ? 20 : 0))),
      complete: treatyCount(game) >= 3 && Number(game.resources?.gold || 0) >= 120 && stageRank(game.stage) >= stageRank("เมืองการค้า") && !!(game.buildings?.marketSquare || game.buildings?.caravanPost),
      details: [`สนธิสัญญาการค้า ${treatyCount(game)}/3`, `ทอง ${Math.round(game.resources?.gold || 0)}/120`, `ตลาดหรือสถานีคาราวาน ${game.buildings?.marketSquare || game.buildings?.caravanPost ? "พร้อม" : "ยังไม่มี"}`],
    },
    peace: {
      current: Math.min(100, Math.round(Math.min(38, allianceCount(game) / 2 * 38) + Math.min(22, (game.neighbors ?? []).length / 3 * 22) + (noWar ? 20 : 0) + Math.min(20, Math.max(0, averageRelation) / 70 * 20))),
      complete: allianceCount(game) >= 2 && (game.neighbors ?? []).length >= 3 && noWar && averageRelation >= 45,
      details: [`พันธมิตร ${allianceCount(game)}/2`, `รู้จักเมือง ${(game.neighbors ?? []).length}/3`, `สงคราม ${noWar ? "ไม่มี" : "ยังมี"}`, `สัมพันธ์เฉลี่ย ${Math.round(averageRelation)}`],
    },
    knowledge: {
      current: Math.min(100, Math.round(Math.min(50, researchCount(game) / 34 * 50) + Math.min(25, Number(game.resources?.knowledge || 0) / 180 * 25) + Math.min(25, stageRank(game.stage) / 5 * 25))),
      complete: researchCount(game) >= 34 && Number(game.resources?.knowledge || 0) >= 180 && stageRank(game.stage) >= stageRank("นครรัฐ"),
      details: [`วิจัยสำเร็จ ${researchCount(game)}/34`, `ความรู้ ${Math.round(game.resources?.knowledge || 0)}/180`, `ระดับเมือง ${game.stage || "ค่ายพักแรม"}`],
    },
    legacy: {
      current: Math.min(100, Math.round(Math.min(50, dynasty.generation / 3 * 50) + Math.min(30, population / 120 * 30) + ((game.researchDone?.dynasticSuccession && game.researchDone?.familyRecords) ? 20 : 0))),
      complete: dynasty.generation >= 3 && population >= 120 && !!game.researchDone?.dynasticSuccession && !!game.researchDone?.familyRecords,
      details: [`ผู้นำรุ่นที่ ${dynasty.generation}/3`, `ประชากร ${population}/120`, `กฎหมายสืบทอด ${game.researchDone?.dynasticSuccession ? "พร้อม" : "ยังไม่พร้อม"}`],
    },
    guardian: {
      current: Math.min(100, Math.round(Math.min(45, militaryPowerApprox(game) / 160 * 45) + Math.min(25, Number(game.metrics?.security || 0) / 85 * 25) + Math.min(20, stageRank(game.stage) / 5 * 20) + (noWar ? 10 : 0))),
      complete: militaryPowerApprox(game) >= 160 && Number(game.metrics?.security || 0) >= 85 && stageRank(game.stage) >= stageRank("นครรัฐ") && noWar,
      details: [`พลังป้องกัน ${militaryPowerApprox(game)}/160`, `ความปลอดภัย ${Math.round(game.metrics?.security || 0)}/85`, `ชายแดน ${noWar ? "สงบ" : "มีสงคราม"}`],
    },
  };
  return progress;
}

export function chooseVictoryPath(game, key) {
  if (!Object.hasOwn(VICTORY_PATHS, key)) return game;
  return { ...game, victory: { ...normalizeVictoryState(game), chosenPath: key } };
}

export function createEndingChronicle(game, key) {
  const path = VICTORY_PATHS[key];
  const dynasty = normalizeDynastyState(game);
  const leader = currentLeader({ ...game, dynasty });
  const importantLogs = (game.logs ?? []).filter((entry) => ["milestone", "rare", "death"].includes(entry.kind)).slice(0, 12);
  const fallen = (game.casualties ?? []).slice(0, 12);
  return {
    path: key,
    title: path.title,
    subtitle: `ตระกูล ${game.houseName} · ผู้นำรุ่นที่ ${dynasty.generation}`,
    achievedYear: Number(game.year || 1),
    achievedMonth: Number(game.month || 1),
    leaderName: leader?.name || game.leaderName || "ผู้นำไร้นาม",
    population: alivePeople(game).length,
    stage: game.stage || "ค่ายพักแรม",
    paragraphs: [
      `จากกองไฟแรก ตระกูล ${game.houseName} เดินทางมาถึง ${path.title} ภายใต้การนำของ ${leader?.name || game.leaderName}.`,
      path.description,
      `พงศาวดารบันทึกผู้คนที่ยังมีชีวิต ${alivePeople(game).length} คน ผู้จากไป ${(game.casualties ?? []).length} คน และการสืบทอด ${Math.max(0, dynasty.generation - 1)} ครั้ง.`,
    ],
    highlights: importantLogs.map((entry) => ({ title: entry.title, year: entry.year, month: entry.month, text: entry.text })),
    fallen: fallen.map((person) => ({ name: person.name, age: person.age, cause: person.cause })),
  };
}

export function evaluateVictory(game) {
  const victory = normalizeVictoryState(game);
  const progress = victoryProgress(game);
  const chosen = victory.chosenPath;
  if (!chosen || !progress[chosen]?.complete || victory.completedPaths.includes(chosen)) {
    return { ...game, victory: { ...victory, lastEvaluation: progress } };
  }
  const ending = createEndingChronicle(game, chosen);
  return {
    ...game,
    victory: {
      ...victory,
      completedPaths: [...victory.completedPaths, chosen],
      achievedAt: { year: game.year, month: game.month, path: chosen },
      ending,
      lastEvaluation: progress,
    },
  };
}

export function heirCandidates(game) {
  const dynasty = normalizeDynastyState(game);
  const leader = alivePeople(game).find((person) => person.id === dynasty.currentLeaderId) ?? null;
  return alivePeople(game)
    .filter((person) => person.id !== dynasty.currentLeaderId && Number(person.age || 0) >= 16)
    .map((person) => {
      const blood = person.houseName === game.houseName || String(person.kin || "").includes(game.houseName) || (person.parentIds ?? []).includes(dynasty.currentLeaderId) || (leader?.childrenIds ?? []).includes(person.id);
      const score = (blood ? 40 : 0) + clamp(person.health) * 0.22 + clamp(person.morale) * 0.18 + Math.min(20, Number(person.age || 0) / 3) + ((person.traits ?? []).includes("เรียนรู้ไว") ? 8 : 0) + ((person.traits ?? []).includes("สุขุม") ? 6 : 0);
      return { person, blood, score: Math.round(score) };
    })
    .sort((a, b) => b.score - a.score || a.person.age - b.person.age);
}
