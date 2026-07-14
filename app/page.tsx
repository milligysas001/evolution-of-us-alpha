"use client";

import { useEffect, useState } from "react";
import { GAME_VERSION } from "../config/version.mjs";
import { manualSlotGame, normalizeManualSlots } from "../save/save-manager.mjs";

type Origin = "builder" | "hunter" | "healer" | "keeper" | "mediator";
type Difficulty = "story" | "normal" | "survival" | "ironman";

type OriginCard = {
  id: Origin;
  icon: string;
  title: string;
  text: string;
  detail: string;
};

const VERSION = `รุ่นทดสอบ v${GAME_VERSION}`;
const setupKey = "eou-current-setup";
const saveKey = "eou-current-save";
const saveSlotsKey = "eou-save-slots-v1";
type HomeGameSummary = { leaderName: string; houseName: string; origin: Origin; difficulty?: Difficulty; year: number; month: number; stage: string; people?: Array<{ alive?: boolean }> };
type HomeSaveSlot = { id: string; label: string; updatedAt: string; envelope: unknown; game: HomeGameSummary };
const legacySetupKeys = ["eou-v0913-setup", "eou-v0912-setup", "eou-v0911-setup", "eou-v0910-setup", "eou-v099-setup", "eou-v098-setup", "eou-v097-setup"];
const legacySaveKeys = ["eou-v0913-save", "eou-v0912-save", "eou-v0911-save", "eou-v0910-save", "eou-v099-save", "eou-v098-save", "eou-v097-save"];

const origins: OriginCard[] = [
  { id: "builder", icon: "🪓", title: "ครอบครัวช่างไม้", text: "ตั้งหลักเร็วขึ้นด้านที่พัก คลัง และโครงสร้างแรก", detail: "เหมาะกับผู้เล่นที่อยากลดแรงกดดันช่วงเดือนแรก" },
  { id: "hunter", icon: "🏹", title: "กลุ่มพรานริมป่า", text: "หาอาหารช่วงต้นดีขึ้น และอ่านสัญญาณของป่าได้ไว", detail: "เหมาะกับการเล่นสายเสี่ยง ได้ผลตอบแทนเร็วแต่ต้องระวังบาดเจ็บ" },
  { id: "healer", icon: "🌿", title: "ผู้รู้สมุนไพร", text: "ประคองโรค แผล และความสูญเสียในช่วงแรกได้ดี", detail: "เหมาะกับผู้เล่นที่อยากให้ค่ายอยู่รอดแบบมั่นคง" },
  { id: "keeper", icon: "📜", title: "ผู้จดจำเรื่องเล่า", text: "ความรู้ พงศาวดาร และข่าวสารเดินหน้าไวกว่า", detail: "เหมาะกับการเล่นระยะยาวและการปลดล็อกระบบใหม่" },
  { id: "mediator", icon: "⚖️", title: "ผู้นำผู้ไกล่เกลี่ย", text: "ลดรอยร้าวเรื่องเสบียง ความยุติธรรม และความเชื่อใจ", detail: "เหมาะกับถิ่นฐานที่โตขึ้นและเริ่มมีความเห็นต่าง" },
];

const difficulties: Array<{ id: Difficulty; icon: string; title: string; text: string; reserve: string }> = [
  { id: "story", icon: "📖", title: "เน้นเรื่องราว", text: "เสบียงมากขึ้นและความเสี่ยงเบาลง เหมาะกับการเรียนรู้ระบบ", reserve: "อาหารประมาณ 9 เดือน" },
  { id: "normal", icon: "⚖️", title: "สมดุล", text: "ทรัพยากรและภัยตามมาตรฐาน เหมาะกับการเล่นรอบแรก", reserve: "อาหารประมาณ 6 เดือน" },
  { id: "survival", icon: "🔥", title: "เอาชีวิตรอด", text: "เสบียงน้อยลงและเหตุการณ์อันตรายรุนแรงขึ้น", reserve: "อาหารประมาณ 4 เดือน" },
  { id: "ironman", icon: "🛡️", title: "ท้าทายสูงสุด", text: "ความเสี่ยงสูงสุด แต่ยังใช้ระบบบันทึกตามปกติ เหมาะกับผู้เล่นที่เข้าใจเกมแล้ว", reserve: "อาหารประมาณ 3 เดือน" },
];

function clearKeys(keys: string[]) {
  keys.forEach((key) => window.localStorage.removeItem(key));
}

function writeSetup(setup: { leaderName: string; houseName: string; origin: Origin; difficulty: Difficulty }) {
  window.localStorage.setItem(setupKey, JSON.stringify(setup));
  legacySetupKeys.forEach((key) => window.localStorage.setItem(key, JSON.stringify(setup)));
}

function hasSave() {
  return Boolean(window.localStorage.getItem(saveKey) || legacySaveKeys.some((key) => window.localStorage.getItem(key)));
}

export default function HomePage() {
  const [leaderName, setLeaderName] = useState("Elowen");
  const [houseName, setHouseName] = useState("Vaelen");
  const [origin, setOrigin] = useState<Origin>("builder");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [canContinue, setCanContinue] = useState(false);
  const [manualSlots, setManualSlots] = useState<HomeSaveSlot[]>([]);

  useEffect(() => {
    setCanContinue(hasSave());
    try {
      const parsed = JSON.parse(window.localStorage.getItem(saveSlotsKey) ?? "[]") as unknown[];
      const normalized = normalizeManualSlots(parsed);
      const slots = normalized.valid.flatMap((slot: any) => {
        try { return [{ ...slot, game: manualSlotGame(slot) as HomeGameSummary } as HomeSaveSlot]; } catch { return []; }
      });
      setManualSlots(slots);
    } catch { setManualSlots([]); }
  }, []);

  function startGame() {
    const setup = { leaderName: leaderName.trim() || "Elowen", houseName: houseName.trim() || "Vaelen", origin, difficulty };
    writeSetup(setup);
    clearKeys([saveKey, ...legacySaveKeys]);
    window.location.href = "/game";
  }


  function loadManualSlot(slot: HomeSaveSlot) {
    window.localStorage.setItem(saveKey, JSON.stringify(slot.envelope));
    writeSetup({ leaderName: slot.game.leaderName, houseName: slot.game.houseName, origin: slot.game.origin, difficulty: (slot.game as any).difficulty ?? "normal" });
    window.location.href = "/game";
  }

  function continueGame() {
    const setup = { leaderName: leaderName.trim() || "Elowen", houseName: houseName.trim() || "Vaelen", origin, difficulty };
    writeSetup(setup);
    window.location.href = "/game";
  }

  return (
    <main className="app start-shell">
      <section className="start-card">
        <article className="panel prologue">
          <div className="brand" style={{ paddingLeft: 0, marginBottom: 18 }}>
            <div className="brand-mark">⌛</div>
            <span>EVOLUTION<br />OF US</span>
          </div>
          <div className="kicker">{VERSION} · เกมจำลองการตั้งถิ่นฐาน</div>
          <h1>คืนแรกก่อนถิ่นฐานจะมีชื่อ</h1>
          <h2>ก่อนที่ผู้คนจะเรียกที่นี่ว่า “บ้าน” มีเพียงกองไฟ เสียงลมหายใจ และการตัดสินใจของผู้นำคนหนึ่ง</h2>
          <p>
            คนสิบห้าชีวิตเดินทางมาถึงพื้นที่รกร้างในวันที่ฟ้าเริ่มมืด เด็กบางคนกอดห่อผ้าแน่น ผู้เฒ่ามองหาไม้แห้งสำหรับไฟแรก ส่วนผู้ใหญ่ยืนเงียบ เพราะทุกคนรู้ดีว่าเสบียงที่แบกมานั้นไม่พอสำหรับความผิดพลาดมากนัก
          </p>
          <p>
            คุณไม่ได้รับมอบเมืองที่สร้างเสร็จแล้ว คุณได้รับเพียงชื่อของผู้นำ ชื่อของตระกูล และพื้นหลังของกลุ่มคนที่ยังไม่รู้ว่าพรุ่งนี้จะอยู่รอดหรือไม่ พื้นหลังที่เลือกจะกลายเป็นผลเสริมที่ใช้งานจริงในเกม: ทักษะเริ่มต้น ทรัพยากร ความไว้ใจ และทางรอดของเดือนแรก
          </p>
          <div className="three-col" style={{ marginTop: 24 }}>
            <div className="panel pad" style={{ boxShadow: "none" }}><b>ชื่อที่ถูกจดจำ</b><br /><span className="muted small">ตั้งชื่อผู้นำและตระกูลที่จะกลายเป็นรากของพงศาวดาร</span></div>
            <div className="panel pad" style={{ boxShadow: "none" }}><b>พื้นหลังที่มีผลจริง</b><br /><span className="muted small">ช่าง พราน ผู้รักษา ผู้จดจำ หรือผู้ไกล่เกลี่ย จะส่งผลต่อระบบในเกม</span></div>
            <div className="panel pad" style={{ boxShadow: "none" }}><b>เมืองที่ยังไม่เกิด</b><br /><span className="muted small">จากค่ายเล็ก ๆ สู่ชุมชนที่มีเรื่องเล่า บาดแผล และความหวังของตนเอง</span></div>
          </div>
        </article>

        <aside className="panel setup">
          <h2 className="title">ตั้งค่าตระกูลเริ่มต้น</h2>
          <p className="muted">ตั้งชื่อและเลือกพื้นหลัง จุดเริ่มต้นมีผลต่อทรัพยากร ความเสี่ยง และสายตาที่ชาวบ้านใช้มองผู้นำ</p>
          <label className="label">ชื่อตัวละครผู้นำ
            <input className="input" value={leaderName} onChange={(e) => setLeaderName(e.target.value)} />
          </label>
          <label className="label">ชื่อตระกูล
            <input className="input" value={houseName} onChange={(e) => setHouseName(e.target.value)} />
          </label>
          <h3 className="section-title" style={{ marginTop: 20 }}>พื้นหลังเริ่มต้น</h3>
          <div className="choice-grid">
            {origins.map((item) => (
              <button key={item.id} className={origin === item.id ? "choice-card active" : "choice-card"} onClick={() => setOrigin(item.id)}>
                <span className="choice-icon">{item.icon}</span>
                <span><b>{item.title}</b><br /><small className="muted">{item.text}</small><br /><small>{item.detail}</small></span>
              </button>
            ))}
          </div>
          <h3 className="section-title" style={{ marginTop: 20 }}>ระดับความยาก</h3>
          <div className="difficulty-grid">
            {difficulties.map((item) => (
              <button key={item.id} className={difficulty === item.id ? "choice-card active" : "choice-card"} onClick={() => setDifficulty(item.id)}>
                <span className="choice-icon">{item.icon}</span>
                <span><b>{item.title}</b><br /><small className="muted">{item.text}</small><br /><small>{item.reserve}</small></span>
              </button>
            ))}
          </div>
          <div className="panel pad" style={{ boxShadow: "none", marginTop: 16 }}>
            <b>ข้อมูลเริ่มต้น</b>
            <table className="report-table" style={{ marginTop: 12 }}>
              <tbody>
                <tr><td>ประชากร</td><td>15 คน สุ่มชื่อ อายุ บทบาท ทักษะ และสถานะรายบุคคล</td></tr>
                <tr><td>ทรัพยากร</td><td>ปรับตามระดับความยากที่เลือก และมีวัตถุดิบพื้นฐานสำหรับตั้งค่ายช่วงแรก</td></tr>
                <tr><td>เป้าหมายแรก</td><td>รอดปีแรกและตั้งค่ายให้มั่นคง</td></tr>
              </tbody>
            </table>
          </div>
          <button className="primary" onClick={startGame} style={{ width: "100%", marginTop: 16 }}>เริ่มต้นจากศูนย์</button>
          <button className="secondary" onClick={continueGame} disabled={!canContinue} style={{ width: "100%", marginTop: 10, opacity: canContinue ? 1 : .55 }}>เล่นต่อจากบันทึก</button>
          {manualSlots.length > 0 && <div className="home-save-list"><h3 className="section-title">บันทึกด้วยตนเอง</h3>{manualSlots.map((slot) => { const pop = slot.game.people?.filter((p) => p.alive !== false).length ?? 0; return <button className="home-save-card" key={slot.id} onClick={() => loadManualSlot(slot)}><span><b>{slot.label}</b><small>{slot.game.houseName} · {slot.game.stage}</small></span><span><b>ปี {slot.game.year} เดือน {slot.game.month}</b><small>ประชากร {pop} คน</small></span></button>; })}</div>}
          <p className="muted small">เกมมีระบบบันทึกอัตโนมัติ ตรวจความสมบูรณ์ของไฟล์ บันทึกด้วยตนเอง 3 ช่อง ย้ายบันทึกเก่า รหัสสุ่มประจำเกม และดาวน์โหลดไฟล์บันทึกได้จากหน้าตั้งค่า</p>
        </aside>
      </section>
    </main>
  );
}
