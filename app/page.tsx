"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Origin = "builder" | "hunter" | "healer" | "keeper" | "mediator";

type OriginCard = {
  id: Origin;
  icon: string;
  title: string;
  text: string;
  detail: string;
};

const origins: OriginCard[] = [
  { id: "builder", icon: "🪓", title: "ครอบครัวช่างไม้", text: "มีไม้เพิ่ม และคนของคุณคุ้นมือกับงานตั้งโครงที่พัก", detail: "เหมาะกับการตั้งหลักให้เร็วขึ้น ที่พักและคลังแรกจะไม่กลายเป็นภาระหนักเกินไป" },
  { id: "hunter", icon: "🏹", title: "กลุ่มพรานริมป่า", text: "อ่านรอยเท้า กลิ่นลม และจังหวะของป่าได้ดีกว่าคนทั่วไป", detail: "อาหารช่วงต้นมั่นคงขึ้น แต่ป่าไม่เคยให้เนื้อโดยไม่เก็บค่าเสี่ยง" },
  { id: "healer", icon: "🌿", title: "ผู้รู้สมุนไพร", text: "มีสมุนไพรตั้งต้นและรู้วิธีประคองไข้กับแผล", detail: "เหมาะกับค่ายที่อยากลดความสูญเสียจากไข้ แผลติดเชื้อ และฤดูฝน" },
  { id: "keeper", icon: "📜", title: "ผู้จดจำเรื่องเก่า", text: "สะสมความรู้และ พงศาวดาร ได้เร็ว", detail: "ภูมิปัญญาเดินหน้าไวขึ้น และความทรงจำสำคัญจะส่งผลต่อคนรุ่นต่อไปได้ชัดกว่า" },
  { id: "mediator", icon: "⚖️", title: "ผู้นำผู้ไกล่เกลี่ย", text: "เข้าใจน้ำหนักของคำพูด และลดรอยร้าวภายในค่ายได้ดี", detail: "เหมาะกับการเล่นระยะยาว เมื่อคนเพิ่มขึ้น ความเห็นต่าง และความยุติธรรมเริ่มสำคัญพอ ๆ กับอาหาร" },
];

export default function HomePage() {
  const router = useRouter();
  const [leaderName, setLeaderName] = useState("Elowen");
  const [houseName, setHouseName] = useState("Vaelen");
  const [origin, setOrigin] = useState<Origin>("builder");

  function startGame() {
    const cleanLeader = leaderName.trim() || "Elowen";
    const cleanHouse = houseName.trim() || "Vaelen";
    window.localStorage.setItem("eou-v0911-setup", JSON.stringify({ leaderName: cleanLeader, houseName: cleanHouse, origin }));
    window.localStorage.removeItem("eou-v0911-save");
    router.push("/game");
  }

  function continueGame() {
    router.push("/game");
  }

  return (
    <main className="app start-shell">
      <section className="start-card">
        <article className="panel prologue">
          <div className="brand" style={{ paddingLeft: 0, marginBottom: 18 }}>
            <div className="brand-mark">⌛</div>
            <span>EVOLUTION<br />OF US</span>
          </div>
          <div className="kicker">ALPHA v0.9.11 · NEWS & ADAPTIVE EDITION</div>
          <h1>สิบชีวิตกลางผืนดินว่างเปล่า</h1>
          <h2>ไม่มีเมือง ไม่มีตำนานสำเร็จรูป มีเพียงคนที่ต้องสร้างคำตอบด้วยมือของตนเอง</h2>
          <p>
            คุณไม่ได้เริ่มต้นด้วยปราสาท ธงชัย หรือแผ่นดินที่มีใครมอบให้ คุณมีเพียงครอบครัวของตนเอง ชาวบ้านสิบคน อาหารไม่กี่ถุง ไม้ หิน เครื่องมือเก่า
            และพื้นที่รกร้างที่ยังไม่เคยยอมรับใครเป็นเจ้าของอย่างแท้จริง
          </p>
          <p>
            ทุกเดือนคือหนึ่งเทิร์นของชีวิตจริง ใครจะออกหาอาหาร ใครจะตัดไม้ ใครจะสร้างที่พัก ใครจะเฝ้ายาม ใครจะดูแลคนป่วย
            และผู้นำจะเลือกเป็นคนแบบใด การตัดสินใจเล็ก ๆ จะทิ้งรอยไว้บนร่างกาย ความทรงจำ ความเชื่อใจ และสายเลือดของคนรุ่นถัดไป
          </p>
          <p>
            ไม่มีเนื้อเรื่องที่บังคับให้คุณเดินตามล่วงหน้า เรื่องราวจะค่อย ๆ เกิดจากสิ่งที่คุณเลือกเอง ชาวบ้านทุกคนมีชื่อ มีอายุ มีแผล มีความเหนื่อย และมีโอกาสจากไปจากความหนาว
            โรค อุบัติเหตุระหว่างล่าสัตว์ งานก่อสร้าง สัตว์ป่า หรือความหิว บางครั้งการรอดชีวิตจึงไม่ได้งดงาม แต่หนักพอจะกลายเป็นพงศาวดาร
          </p>
          <div className="three-col" style={{ marginTop: 24 }}>
            <div className="panel pad" style={{ boxShadow: "none" }}><b>เล่นง่ายขึ้น</b><br /><span className="muted small">จัดแรงงาน → เลือกสร้าง/วิจัย → ตอบเหตุการณ์ → จบเดือน</span></div>
            <div className="panel pad" style={{ boxShadow: "none" }}><b>สมจริงขึ้น</b><br /><span className="muted small">ฤดูกาล โรค อุบัติเหตุ ความเหนื่อย อาหารเสีย ความขัดแย้ง</span></div>
            <div className="panel pad" style={{ boxShadow: "none" }}><b>น่าติดตามขึ้น</b><br /><span className="muted small">เป้าหมาย คาดการณ์ความเสี่ยง ระบบสอนเล่น การกระทำผู้นำแบบเปลี่ยนตามเหตุการณ์ ความทรงจำ หมุดหมายสำคัญ และการเติบโตของถิ่นฐาน</span></div>
          </div>
        </article>

        <aside className="panel setup">
          <h2 className="title">ตั้งค่าตระกูลเริ่มต้น</h2>
          <p className="muted">ตั้งชื่อและเลือกพื้นหลัง จุดเริ่มต้นมีผลจริงต่อทรัพยากร ความเสี่ยง และสายตาที่ชาวบ้านใช้มองผู้นำ</p>
          <label className="label">ชื่อตัวละครผู้นำ
            <input className="input" value={leaderName} onChange={(e: { target: { value: string } }) => setLeaderName(e.target.value)} />
          </label>
          <label className="label">ชื่อตระกูล
            <input className="input" value={houseName} onChange={(e: { target: { value: string } }) => setHouseName(e.target.value)} />
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
                <tr><td>ประชากร</td><td>10 คน มีชื่อและสถานะรายบุคคล</td></tr>
                <tr><td>ทรัพยากร</td><td>อาหาร 30 · ไม้ 20 · หิน 5 · เครื่องมือ 5</td></tr>
                <tr><td>ที่พัก</td><td>ยังไม่มีบ้านถาวร</td></tr>
                <tr><td>เป้าหมายแรก</td><td>รอดปีแรกและตั้งค่ายให้มั่นคง</td></tr>
              </tbody>
            </table>
          </div>
          <button className="primary" onClick={startGame} style={{ width: "100%", marginTop: 16 }}>เริ่มต้นจากศูนย์</button>
          <button className="secondary" onClick={continueGame} style={{ width: "100%", marginTop: 10 }}>เล่นต่อจาก Save</button>
        </aside>
      </section>
    </main>
  );
}
