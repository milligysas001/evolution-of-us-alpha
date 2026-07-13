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

const VERSION = "Alpha v0.9.18";
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
          <div className="kicker">{VERSION} · REALISTIC SETTLEMENT ALPHA</div>
          <h1>คืนแรกก่อนถิ่นฐานจะมีชื่อ</h1>
          <h2>ก่อนที่ผู้คนจะเรียกที่นี่ว่า “บ้าน” มีเพียงกองไฟ เสียงลมหายใจ และการตัดสินใจของผู้นำคนหนึ่ง</h2>
          <p>
            คนสิบชีวิตเดินทางมาถึงพื้นที่รกร้างในวันที่ฟ้าเริ่มมืด เด็กบางคนกอดห่อผ้าแน่น ผู้เฒ่ามองหาไม้แห้งสำหรับไฟแรก ส่วนผู้ใหญ่ยืนเงียบ เพราะทุกคนรู้ดีว่าเสบียงที่แบกมานั้นไม่พอสำหรับความผิดพลาดมากนัก
          </p>
          <p>
            คุณไม่ได้รับมอบเมืองที่สร้างเสร็จแล้ว คุณได้รับเพียงชื่อของผู้นำ ชื่อของตระกูล และพื้นหลังของกลุ่มคนที่ยังไม่รู้ว่าพรุ่งนี้จะอยู่รอดหรือไม่ พื้นหลังที่เลือกจะกลายเป็นบัฟจริงในเกม: ทักษะเริ่มต้น ทรัพยากร ความไว้ใจ และทางรอดของเดือนแรก
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
