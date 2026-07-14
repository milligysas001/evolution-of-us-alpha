export function validateWorldSystems(game) {
  const issues = [];
  const animals = game?.animalState?.animals || {};
  for (const [key, count] of Object.entries(animals)) {
    if (!Number.isFinite(Number(count)) || Number(count) < 0) issues.push(issue("animal", key, "จำนวนสัตว์ต้องไม่ติดลบ"));
  }
  const locations = game?.locations || {};
  for (const [key, location] of Object.entries(locations)) {
    if (!location || typeof location !== "object") issues.push(issue("exploration", key, "ข้อมูลพื้นที่ไม่ถูกต้อง"));
    else if (Number(location.progress || 0) < 0 || Number(location.progress || 0) > 100) issues.push(issue("exploration", key, "ความคืบหน้าต้องอยู่ระหว่าง 0–100"));
  }
  const neighborIds = new Set();
  for (const city of Array.isArray(game?.neighbors) ? game.neighbors : []) {
    if (!city?.id) issues.push(issue("neighbor", "unknown", "เมืองข้างเคียงไม่มี ID"));
    else if (neighborIds.has(city.id)) issues.push(issue("neighbor", city.id, "เมืองข้างเคียง ID ซ้ำ"));
    else neighborIds.add(city.id);
    if (city?.alliance && city?.atWar) issues.push(issue("neighbor", city.id, "เมืองเดียวกันไม่ควรเป็นพันธมิตรและอยู่ในสงครามพร้อมกัน"));
  }
  const military = game?.military || {};
  if (Number(military.soldiers || 0) < 0) issues.push(issue("military", "soldiers", "จำนวนทหารต้องไม่ติดลบ"));
  if (Number(military.soldiers || 0) > alivePopulation(game)) issues.push(issue("military", "soldiers", "จำนวนทหารมากกว่าประชากรที่มีชีวิต"));
  return { ok: issues.length === 0, issues };
}

export function alivePopulation(game) {
  return Array.isArray(game?.people) ? game.people.filter((person) => person?.alive !== false).length : 0;
}

function issue(system, key, message) { return { system, key, message, severity: "error" }; }
