"use client";

import { useMemo, useState } from "react";

type Origin = "builder" | "hunter" | "healer" | "keeper" | "mediator";

type OriginCard = {
  id: Origin;
  icon: string;
  title: string;
  text: string;
  detail: string;
};

const VERSION = "Alpha v0.9.14";
const setupKey = "eou-current-setup";
const saveKey = "eou-current-save";
const legacySetupKeys = ["eou-v0913-setup", "eou-v0912-setup", "eou-v0911-setup", "eou-v0910-setup", "eou-v099-setup", "eou-v098-setup", "eou-v097-setup"];
const legacySaveKeys = ["eou-v0913-save", "eou-v0912-save", "eou-v0911-save", "eou-v0910-save", "eou-v099-save", "eou-v098-save", "eou-v097-save"];

const origins: OriginCard[] = [
  { id: "builder", icon: "🪓", title: "ครอบครัวช่างไม้", text: "ตั้งหลักเร็วขึ้นด้านที่พัก คลัง และโครงสร้างแรก", detail: "เหมาะกับผู้เล่นที่อยากลดแรงกดดันช่วงเดือนแรก" },
  { id: "hunter", icon: "🏹", title: "กลุ่มพรานริมป่า", text: "หาอาหารช่วงต้นดีขึ้น และอ่านสัญญาณของป่าได้ไว", detail: "เหมาะกับการเล่นสายเสี่ยง ได้ผลตอบแทนเร็วแต่ต้องระวังบาดเจ็บ" },
  { id: "healer", icon: "🌿", title: "ผู้รู้สมุนไพร", text: "ประคองโรค แผล และความสูญเสียในช่วงแรกได้ดี", detail: "เหมาะกับผู้เล่นที่อยากให้ค่ายอยู่รอดแบบมั่นคง" },
  { id: "keeper", icon: "📜", title: "ผู้จดจำเรื่องเล่า", text: "ความรู้ พงศาวดาร และข่าวสารเดินหน้าไวกว่า", detail: "เหมาะกับการเล่นระยะยาวและการปลดล็อกระบบใหม่" },
  { id: "mediator", icon: "⚖️", title: "ผู้นำผู้ไกล่เกลี่ย", text: "ลดรอยร้าวเรื่องเสบียง ความยุติธรรม และความเชื่อใจ", detail: "เหมาะกับถิ่นฐานที่โตขึ้นและเริ่มมีความเห็นต่าง" },
];

function clearKeys(keys: string[]) {
  keys.forEach((key) => window.localStorage.removeItem(key));
}

function writeSetup(setup: { leaderName: string; houseName: string; origin: Origin }) {
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
  const canContinue = useMemo(() => (typeof window === "undefined" ? false : hasSave()), []);

  function startGame() {
    const setup = { leaderName: leaderName.trim() || "Elowen", houseName: houseName.trim() || "Vaelen", origin };
    writeSetup(setup);
    clearKeys([saveKey, ...legacySaveKeys]);
    window.location.href = "/game";
  }

  function continueGame() {
    const setup = { leaderName: leaderName.trim() || "Elowen", houseName: houseName.trim() || "Vaelen", origin };
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
          <div className="kicker">{VERSION} · STABILITY REFACTOR FOUNDATION</div>
          <h1>สิบชีวิตกลางผืนดินว่างเปล่า</h1>
          <h2>เกมสร้างถิ่นฐานแบบเทิร์นรายเดือน ที่ทุกเดือนคือการตัดสินใจของคนจริง</h2>
          <p>
            คุณเริ่มจากชาวบ้านสิบคน เสบียงเล็กน้อย และพื้นที่ที่ยังไม่มีชื่อ ทุกการจัดแรงงาน การก่อสร้าง การวิจัย ข่าวลือ พ่อค้า และภัยภายนอกจะค่อย ๆ สร้างเรื่องราวของถิ่นฐานนี้ขึ้นมาเอง
          </p>
          <p>
            เวอร์ชันนี้ปรับฐานระบบให้เสถียรขึ้น: save key กลาง, migrate save เก่า, fallback เข้าเกมได้แม้ setup หาย, และจัดโครง deploy ให้ปลอดภัยขึ้นสำหรับ Vercel
          </p>
          <div className="three-col" style={{ marginTop: 24 }}>
            <div className="panel pad" style={{ boxShadow: "none" }}><b>เล่นเป็นเทิร์น</b><br /><span className="muted small">จัดแรงงาน → เลือกโครงการ → ตอบเหตุการณ์ → จบเดือน</span></div>
            <div className="panel pad" style={{ boxShadow: "none" }}><b>เอาตัวรอดสมจริง</b><br /><span className="muted small">อาหาร น้ำ ฟืน โรค ความเหนื่อย และความไว้ใจมีผลจริง</span></div>
            <div className="panel pad" style={{ boxShadow: "none" }}><b>ทดสอบง่ายขึ้น</b><br /><span className="muted small">Debug, Save, Feedback และ deploy-safe พร้อมสำหรับ Alpha Test</span></div>
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
          <div className="panel pad" style={{ boxShadow: "none", marginTop: 16 }}>
            <b>เริ่มต้นจริง</b>
            <table className="report-table" style={{ marginTop: 12 }}>
              <tbody>
                <tr><td>ประชากร</td><td>10 คน สุ่มชื่อ อายุ บทบาท และสถานะรายบุคคล</td></tr>
                <tr><td>ทรัพยากร</td><td>อาหาร 30 · ไม้ 20 · หิน 5 · เครื่องมือ 5</td></tr>
                <tr><td>เป้าหมายแรก</td><td>รอดปีแรกและตั้งค่ายให้มั่นคง</td></tr>
              </tbody>
            </table>
          </div>
          <button className="primary" onClick={startGame} style={{ width: "100%", marginTop: 16 }}>เริ่มต้นจากศูนย์</button>
          <button className="secondary" onClick={continueGame} disabled={!canContinue} style={{ width: "100%", marginTop: 10, opacity: canContinue ? 1 : .55 }}>เล่นต่อจาก Save</button>
          <p className="muted small">เซฟจะอยู่ใน browser ของผู้เล่นแต่ละคน หากล้าง cache หรือเปลี่ยนอุปกรณ์ save อาจหายได้</p>
        </aside>
      </section>
    </main>
  );
}
