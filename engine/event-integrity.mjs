const DEFAULT_RESOURCE_KEYS = new Set(["food","wood","stone","tools","herbs","hides","water","waterReserve","knowledge","fuel","ore","gold","feed","ironOre","coal","timber","bricks","textiles","salt","spices","influence","steel","luxuries","warhorses","manpower","siegeMaterials"]);
const DEFAULT_METRIC_KEYS = new Set(["morale","security","trust","health","cohesion","fairness"]);
const DEFAULT_PATH_KEYS = new Set(["survival","family","knowledge","trade","fortress","faith"]);
const DEFAULT_RISK_KEYS = new Set(["food","shelter","disease","beast","conflict","weather","accident"]);
const GENERIC_CHOICE_TITLES = [
  "รับมืออย่างระมัดระวัง",
  "ใช้แรงงานแก้ปัญหาทันที",
  "ให้ชุมชนร่วมตัดสินใจ",
  "ตรวจสอบอย่างรอบคอบ",
  "แก้ปัญหาอย่างระมัดระวัง",
];

export function validateEventCollection(events, options = {}) {
  const issues = [];
  if (!Array.isArray(events)) return { ok: false, issues: [{ severity: "error", path: "events", message: "ข้อมูลเหตุการณ์ต้องเป็น array" }], stats: {} };
  const ids = new Set();
  const choiceIds = new Map();
  const eventById = new Map();
  const resources = new Set(options.resourceKeys || DEFAULT_RESOURCE_KEYS);
  const metrics = new Set(options.metricKeys || DEFAULT_METRIC_KEYS);
  const paths = new Set(options.pathKeys || DEFAULT_PATH_KEYS);
  const risks = new Set(options.riskKeys || DEFAULT_RISK_KEYS);
  for (const event of events) if (event?.id) eventById.set(String(event.id), event);

  events.forEach((event, index) => {
    const path = `events[${index}]`;
    if (!event || typeof event !== "object") return issues.push(issue("error", path, "เหตุการณ์ต้องเป็น object"));
    const id = String(event.id || "");
    if (!id) issues.push(issue("error", `${path}.id`, "ไม่มีรหัสเหตุการณ์"));
    else if (ids.has(id)) issues.push(issue("error", `${path}.id`, `รหัสเหตุการณ์ซ้ำ: ${id}`));
    else ids.add(id);
    if (!String(event.title || "").trim()) issues.push(issue("error", `${path}.title`, "ไม่มีชื่อเหตุการณ์"));
    if (!String(event.text || event.description || "").trim()) issues.push(issue("warning", `${path}.text`, "ไม่มีคำบรรยายเหตุการณ์"));
    if (typeof event.weight !== "function" && !Number.isFinite(Number(event.weight))) issues.push(issue("warning", `${path}.weight`, "ไม่มีน้ำหนักเหตุการณ์ที่ตรวจสอบได้"));
    if (!Array.isArray(event.choices) || event.choices.length === 0) {
      issues.push(issue("error", `${path}.choices`, "เหตุการณ์ไม่มีทางเลือก"));
      return;
    }
    const localChoiceIds = new Set();
    const effectSignatures = new Map();
    event.choices.forEach((choice, choiceIndex) => {
      const choicePath = `${path}.choices[${choiceIndex}]`;
      const choiceId = String(choice?.id || "");
      if (!choiceId) issues.push(issue("error", `${choicePath}.id`, "ไม่มีรหัสทางเลือก"));
      if (localChoiceIds.has(choiceId)) issues.push(issue("error", `${choicePath}.id`, `รหัสทางเลือกซ้ำในเหตุการณ์: ${choiceId}`));
      localChoiceIds.add(choiceId);
      const owner = choiceIds.get(choiceId);
      if (owner && options.requireGlobalChoiceIds) issues.push(issue("warning", `${choicePath}.id`, `รหัสทางเลือกซ้ำกับเหตุการณ์ ${owner}`));
      else if (choiceId) choiceIds.set(choiceId, id);
      const title = String(choice?.title || "").trim();
      if (!title) issues.push(issue("error", `${choicePath}.title`, "ไม่มีข้อความทางเลือก"));
      if (GENERIC_CHOICE_TITLES.some((generic) => title === generic)) issues.push(issue("warning", `${choicePath}.title`, `ข้อความกว้างเกินไปและไม่บอกการกระทำ: ${title}`));
      if (!String(choice?.hint || "").trim()) issues.push(issue("warning", `${choicePath}.hint`, "ไม่มีคำอธิบายว่าทางเลือกช่วยอย่างไร"));
      if (!Array.isArray(choice?.story) || !choice.story.some((line) => String(line).trim())) issues.push(issue("warning", `${choicePath}.story`, "ไม่มีผลเชิงเรื่องเล่าหลังเลือก"));
      if (!choiceHasEffect(choice)) issues.push(issue("warning", choicePath, "ทางเลือกไม่มีผลลัพธ์ที่ตรวจพบ"));
      validateDeltaKeys(choice?.delta, choicePath, issues, { resources, metrics, paths, risks });
      validateFollowUp(choice, choicePath, eventById, issues);
      const signature = effectSignature(choice);
      if (signature !== "empty") {
        const previous = effectSignatures.get(signature);
        if (previous != null) issues.push(issue("warning", choicePath, `ผลลัพธ์เหมือนทางเลือกข้อ ${previous + 1} มากเกินไป`));
        else effectSignatures.set(signature, choiceIndex);
      }
      semanticChoiceCheck(event, choice, choicePath, issues);
    });
  });

  const errors = issues.filter((item) => item.severity === "error").length;
  const warnings = issues.filter((item) => item.severity === "warning").length;
  return {
    ok: errors === 0,
    issues,
    stats: {
      events: events.length,
      choices: events.reduce((sum, event) => sum + (Array.isArray(event?.choices) ? event.choices.length : 0), 0),
      errors,
      warnings,
    },
  };
}

function validateFollowUp(choice, path, eventById, issues) {
  const delayedId = choice?.addDelayed?.id;
  if (delayedId && !eventById.has(String(delayedId))) issues.push(issue("error", `${path}.addDelayed.id`, `อ้างเหตุการณ์ต่อเนื่องที่ไม่มีอยู่: ${delayedId}`));
  const pendingId = choice?.addPending;
  if (pendingId && !eventById.has(String(pendingId))) issues.push(issue("error", `${path}.addPending`, `อ้างเหตุการณ์คิวถัดไปที่ไม่มีอยู่: ${pendingId}`));
  if (choice?.addDelayed && (!Number.isInteger(choice.addDelayed.months) || choice.addDelayed.months < 1)) issues.push(issue("error", `${path}.addDelayed.months`, "ผลล่าช้าต้องกำหนดอย่างน้อย 1 เดือน"));
}

function validateDeltaKeys(delta, path, issues, known) {
  if (!delta || typeof delta !== "object") return;
  const groups = [
    ["resources", known.resources],
    ["metrics", known.metrics],
    ["path", known.paths],
    ["risk", known.risks],
  ];
  for (const [group, keys] of groups) {
    const values = delta[group];
    if (values == null) continue;
    if (!values || typeof values !== "object" || Array.isArray(values)) {
      issues.push(issue("error", `${path}.delta.${group}`, "ผลลัพธ์หมวดนี้ต้องเป็น object"));
      continue;
    }
    for (const [key, value] of Object.entries(values)) {
      if (!keys.has(key)) issues.push(issue("error", `${path}.delta.${group}.${key}`, `อ้างรหัสที่ไม่มีในระบบ: ${key}`));
      if (!Number.isFinite(Number(value))) issues.push(issue("error", `${path}.delta.${group}.${key}`, "ค่าผลลัพธ์ต้องเป็นตัวเลข"));
    }
  }
  for (const key of ["threat","population","wounded","casualtyChance"]) {
    if (key in delta && !Number.isFinite(Number(delta[key]))) issues.push(issue("error", `${path}.delta.${key}`, "ค่าผลลัพธ์ต้องเป็นตัวเลข"));
  }
}

function semanticChoiceCheck(event, choice, path, issues) {
  const text = `${event?.title || ""} ${event?.text || ""} ${choice?.title || ""} ${choice?.hint || ""}`;
  const resources = choice?.delta?.resources || {};
  const checks = [
    [/สมุนไพร|รักษา|บาดแผล/, "herbs"],
    [/อาหาร|เสบียง|ล่า|เก็บของป่า/, "food"],
    [/ไม้|ฟืน|ซ่อมที่พัก/, "wood"],
    [/ทอง|เหรียญ|ภาษี/, "gold"],
  ];
  for (const [pattern, key] of checks) {
    if (pattern.test(text) && key in resources) return;
  }
  const title = String(choice?.title || "");
  const explicitCost = /จ่าย|เสียสละ|มอบ(?:อาหาร|ทอง|ของ|เสบียง|ทรัพยากร)|(?:^|\s)ใช้(?:อาหาร|ไม้|หิน|ทอง|สมุนไพร|ฟืน|เครื่องมือ|เสบียง|ทรัพยากร|อิทธิพล|น้ำ)|แลก(?:อาหาร|ของ|ทอง|ทรัพยากร)/.test(title);
  const delta = choice?.delta || {};
  const hasCostOrRisk = Object.values(delta.resources || {}).some((value) => Number(value) < 0)
    || Object.values(delta.metrics || {}).some((value) => Number(value) < 0)
    || Object.values(delta.path || {}).some((value) => Number(value) < 0)
    || Object.values(delta.risk || {}).some((value) => Number(value) > 0)
    || Number(delta.threat || 0) > 0
    || Number(delta.casualtyChance || 0) > 0
    || Number(delta.population || 0) < 0;
  if (explicitCost && !hasCostOrRisk) {
    issues.push(issue("warning", path, "ข้อความบอกว่ามีต้นทุน แต่ไม่พบค่าที่ถูกหักหรือความเสี่ยง"));
  }
}

function effectSignature(choice) {
  const payload = {
    delta: normalizeObject(choice?.delta),
    addPending: choice?.addPending || null,
    addDelayed: choice?.addDelayed || null,
    setFlag: choice?.setFlag || null,
    addTrait: choice?.addTrait || null,
  };
  if (!choiceHasEffect(choice)) return "empty";
  return JSON.stringify(payload);
}

function normalizeObject(value) {
  if (Array.isArray(value)) return value.map(normalizeObject);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value).sort().reduce((out, key) => { out[key] = normalizeObject(value[key]); return out; }, {});
}

export function choiceHasEffect(choice) {
  if (!choice || typeof choice !== "object") return false;
  const delta = choice.delta && typeof choice.delta === "object" ? choice.delta : {};
  const deltaHasValue = Object.values(delta).some((value) => {
    if (Number.isFinite(value)) return Number(value) !== 0;
    if (value && typeof value === "object") return Object.values(value).some((nested) => Number.isFinite(nested) && Number(nested) !== 0);
    return false;
  });
  return deltaHasValue || Boolean(choice.addMemory || choice.addRumor || choice.addPending || choice.addDelayed || choice.setFlag || choice.addTrait);
}

export function formatEventIntegrityIssues(report, limit = 20) {
  if (!report?.issues?.length) return "ไม่พบปัญหา Event";
  return report.issues.slice(0, limit).map((item) => `${item.severity === "error" ? "ผิดพลาด" : "คำเตือน"} ${item.path}: ${item.message}`).join("\n");
}

function issue(severity, path, message) { return { severity, path, message }; }
