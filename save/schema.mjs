const VALID_ORIGINS = new Set(["builder", "hunter", "healer", "keeper", "mediator"]);
const VALID_STAGES = new Set(["ค่ายพักแรม", "ชุมชนแรกเริ่ม", "หมู่บ้านถาวร", "เมืองเล็ก", "เมืองการค้า", "นครรัฐ", "อาณาจักร"]);
const RESOURCE_KEYS = ["food","wood","stone","tools","herbs","hides","water","waterReserve","knowledge","fuel","ore","gold","feed","ironOre","coal","timber","bricks","textiles","salt","spices","influence","steel","luxuries","warhorses","manpower","siegeMaterials"];
const METRIC_KEYS = ["morale","security","trust","health","cohesion","fairness"];

export function validateGameSave(value, options = {}) {
  const issues = [];
  const strict = options.strict === true;
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, issues: [issue("$", "ต้องเป็น object ของบันทึกเกม", "error")] };

  requiredString(value, "leaderName", issues);
  requiredString(value, "houseName", issues);
  if (!VALID_ORIGINS.has(value.origin)) issues.push(issue("origin", "ชนิดผู้นำไม่ถูกต้อง", "error"));
  if (!VALID_STAGES.has(value.stage)) issues.push(issue("stage", "ยุคของเมืองไม่ถูกต้อง", "error"));
  integerRange(value.year, 1, 100000, "year", issues);
  integerRange(value.month, 1, 12, "month", issues);
  integerRange(value.schemaVersion ?? 0, 0, 999, "schemaVersion", issues, strict ? "error" : "warning");

  validateNumberRecord(value.resources, RESOURCE_KEYS, "resources", issues, { min: 0, max: 1e12, requireAll: strict });
  validateNumberRecord(value.metrics, METRIC_KEYS, "metrics", issues, { min: 0, max: 100, requireAll: true });

  if (!Array.isArray(value.people) || value.people.length === 0) {
    issues.push(issue("people", "ต้องมีข้อมูลประชากรอย่างน้อย 1 คน", "error"));
  } else {
    const ids = new Set();
    value.people.forEach((person, index) => {
      const path = `people[${index}]`;
      if (!person || typeof person !== "object") return issues.push(issue(path, "ข้อมูลบุคคลต้องเป็น object", "error"));
      requiredString(person, "id", issues, path);
      requiredString(person, "name", issues, path);
      integerRange(person.age, 0, 150, `${path}.age`, issues);
      finiteRange(person.health, 0, 100, `${path}.health`, issues);
      finiteRange(person.morale, 0, 100, `${path}.morale`, issues);
      finiteRange(person.fatigue, 0, 100, `${path}.fatigue`, issues);
      if (typeof person.alive !== "boolean") issues.push(issue(`${path}.alive`, "alive ต้องเป็น boolean", "error"));
      if (typeof person.id === "string") {
        if (ids.has(person.id)) issues.push(issue(`${path}.id`, `ID ซ้ำ: ${person.id}`, "error"));
        ids.add(person.id);
      }
    });
  }

  if (!value.rng || typeof value.rng !== "object") {
    issues.push(issue("rng", "ไม่มีสถานะระบบสุ่มแบบ Seed", strict ? "error" : "warning"));
  } else {
    requiredString(value.rng, "seed", issues, "rng");
    integerRange(value.rng.state, 0, 0xffffffff, "rng.state", issues);
    integerRange(value.rng.calls, 0, Number.MAX_SAFE_INTEGER, "rng.calls", issues);
  }

  for (const key of ["buildings","researchDone","labor","flags","locations","buildingCondition"]) {
    if (!value[key] || typeof value[key] !== "object" || Array.isArray(value[key])) issues.push(issue(key, `${key} ต้องเป็น object`, strict ? "error" : "warning"));
  }
  for (const key of ["logs","casualties","memories","rumors","notifications","pendingEvents","delayedEvents","recentEventIds","neighbors","outposts"]) {
    if (!Array.isArray(value[key])) issues.push(issue(key, `${key} ต้องเป็น array`, strict ? "error" : "warning"));
  }

  return { ok: !issues.some((item) => item.severity === "error"), issues };
}

export function assertValidGameSave(value, options = {}) {
  const result = validateGameSave(value, options);
  if (!result.ok) {
    const message = result.issues.filter((item) => item.severity === "error").slice(0, 8).map((item) => `${item.path}: ${item.message}`).join("; ");
    throw new Error(`Invalid game save: ${message}`);
  }
  return value;
}

export function formatValidationIssues(issues) {
  if (!Array.isArray(issues) || issues.length === 0) return "ไม่พบปัญหา";
  return issues.map((item) => `${item.severity === "error" ? "ผิดพลาด" : "คำเตือน"} ${item.path}: ${item.message}`).join("\n");
}

export function validateContentCollection(items, kind = "content") {
  const issues = [];
  if (!Array.isArray(items)) return { ok: false, issues: [issue(kind, "ข้อมูลต้องเป็น array", "error")] };
  const ids = new Set();
  items.forEach((item, index) => {
    const path = `${kind}[${index}]`;
    if (!item || typeof item !== "object") return issues.push(issue(path, "รายการต้องเป็น object", "error"));
    requiredString(item, "id", issues, path);
    if (typeof item.id === "string") {
      if (ids.has(item.id)) issues.push(issue(`${path}.id`, `ID ซ้ำ: ${item.id}`, "error"));
      ids.add(item.id);
    }
    if ("title" in item) requiredString(item, "title", issues, path);
  });
  return { ok: !issues.some((item) => item.severity === "error"), issues };
}

function validateNumberRecord(record, keys, path, issues, config) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    issues.push(issue(path, "ต้องเป็น object", "error"));
    return;
  }
  for (const key of keys) {
    if (!(key in record)) {
      if (config.requireAll) issues.push(issue(`${path}.${key}`, "ไม่มีค่านี้", "error"));
      continue;
    }
    finiteRange(record[key], config.min, config.max, `${path}.${key}`, issues);
  }
}

function requiredString(object, key, issues, prefix = "") {
  const path = prefix ? `${prefix}.${key}` : key;
  if (typeof object?.[key] !== "string" || !object[key].trim()) issues.push(issue(path, "ต้องเป็นข้อความที่ไม่ว่าง", "error"));
}
function integerRange(value, min, max, path, issues, severity = "error") {
  if (!Number.isInteger(value) || value < min || value > max) issues.push(issue(path, `ต้องเป็นจำนวนเต็มระหว่าง ${min}–${max}`, severity));
}
function finiteRange(value, min, max, path, issues, severity = "error") {
  if (!Number.isFinite(value) || value < min || value > max) issues.push(issue(path, `ต้องเป็นตัวเลขระหว่าง ${min}–${max}`, severity));
}
function issue(path, message, severity) { return { path, message, severity }; }
