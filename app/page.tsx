"use client";

import { useMemo, useState } from "react";

const VERSION = "Alpha v0.9.13";

const SETUP_KEYS = [
  "eou-v0913-setup",
  "eou-v0912-setup",
  "eou-v0911-setup",
  "eou-v0910-setup",
  "eou-v099-setup",
  "eou-v098-setup",
  "eou-v097-setup"
];

const SAVE_KEYS = [
  "eou-v0913-save",
  "eou-v0912-save",
  "eou-v0911-save",
  "eou-v0910-save",
  "eou-v099-save",
  "eou-v098-save",
  "eou-v097-save"
];

const origins = [
  {
    id: "builder",
    icon: "🛠️",
    title: "ช่างสร้างถิ่น",
    desc: "เหมาะกับการสร้างที่พัก คลัง และโครงสร้างแรกของค่าย",
    bonus: "เริ่มต้นมั่นคงขึ้นด้านไม้และงานก่อสร้าง"
  },
  {
    id: "hunter",
    icon: "🏹",
    title: "กลุ่มพรานริมป่า",
    desc: "ถนัดหาอาหาร อ่านรอยเท้า และอยู่กับความเสี่ยงของป่า",
    bonus: "หาอาหารช่วงต้นดีขึ้น แต่ต้องระวังบาดเจ็บ"
  },
  {
    id: "healer",
    icon: "🌿",
    title: "ผู้รู้สมุนไพร",
    desc: "ดูแลแผล ไข้ และโรคเล็ก ๆ ในค่ายได้ดีกว่า",
    bonus: "เหมาะกับรอบที่อยากลดความสูญเสียจากโรค"
  },
  {
    id: "keeper",
    icon: "📜",
    title: "ผู้จดจำเรื่องเล่า",
    desc: "เก็บความรู้ ถ่ายทอดภูมิปัญญา และบันทึกพงศาวดาร",
    bonus: "วิจัยและข่าวสารระยะยาวดีขึ้น"
  },
  {
    id: "mediator",
    icon: "⚖️",
    title: "ผู้นำผู้ไกล่เกลี่ย",
    desc: "จัดการความขัดแย้ง การแบ่งเสบียง และความเชื่อใจ",
    bonus: "เหมาะกับค่ายที่ต้องการความสามัคคี"
  }
];

function writeSetup(setup: { leaderName: string; houseName: string; origin: string }) {
  for (const key of SETUP_KEYS) {
    window.localStorage.setItem(key, JSON.stringify(setup));
  }
}

function clearSaves() {
  for (const key of SAVE_KEYS) {
    window.localStorage.removeItem(key);
  }
}

export default function HomePage() {
  const [leaderName, setLeaderName] = useState("Elowen");
  const [houseName, setHouseName] = useState("Vaelen");
  const [origin, setOrigin] = useState("builder");

  const selectedOrigin = useMemo(
    () => origins.find((item) => item.id === origin) ?? origins[0],
    [origin]
  );

  function startNewGame() {
    const setup = {
      leaderName: leaderName.trim() || "Elowen",
      houseName: houseName.trim() || "Vaelen",
      origin
    };

    writeSetup(setup);
    clearSaves();

    window.location.href = "/game";
  }

  function continueGame() {
    const setup = {
      leaderName: leaderName.trim() || "Elowen",
      houseName: houseName.trim() || "Vaelen",
      origin
    };

    writeSetup(setup);
    window.location.href = "/game";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(255,255,255,.75), transparent 32%), linear-gradient(135deg, #efe4cf, #f7f0df 55%, #e0cfad)",
        color: "#123f35",
        padding: "28px",
        fontFamily:
          "ui-serif, Georgia, Cambria, 'Times New Roman', 'Noto Serif Thai', serif"
      }}
    >
      <section
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(340px, .9fr)",
          gap: 24
        }}
      >
        <div
          style={{
            background: "rgba(255, 251, 239, .82)",
            border: "1px solid rgba(129, 97, 45, .22)",
            borderRadius: 28,
            padding: 32,
            boxShadow: "0 18px 50px rgba(77, 55, 20, .12)"
          }}
        >
          <div style={{ fontSize: 14, letterSpacing: 2, fontWeight: 800 }}>
            EVOLUTION OF US
          </div>
          <div style={{ marginTop: 6, color: "#8a6a2c", fontWeight: 700 }}>
            ZERO START · GUIDED SURVIVAL EDITION · {VERSION}
          </div>

          <h1
            style={{
              fontSize: "clamp(34px, 6vw, 72px)",
              lineHeight: 1.04,
              margin: "48px 0 24px",
              color: "#0f4b3d"
            }}
          >
            เริ่มต้นจากศูนย์
            <br />
            และสร้างถิ่นฐานด้วยมือของคุณ
          </h1>

          <p style={{ fontSize: 20, lineHeight: 1.9, color: "#5f503e" }}>
            ไม่มีเมืองใหญ่ ไม่มีตำนานที่บังคับให้เดินตามล่วงหน้า
            มีเพียงครอบครัวหนึ่ง ชาวบ้านสิบชีวิต เสบียงเล็กน้อย
            และพื้นที่รกร้างที่อาจกลายเป็นบ้าน หรือกลายเป็นพงศาวดารของผู้ล้มเหลว
          </p>

          <p style={{ fontSize: 18, lineHeight: 1.85, color: "#5f503e" }}>
            ทุกเดือนคือหนึ่งเทิร์นของชีวิตจริง ใครจะออกหาอาหาร ใครจะตัดไม้
            ใครจะดูแลคนป่วย ใครจะยืนเฝ้ายาม และผู้นำจะเลือกเป็นคนแบบใด
            การตัดสินใจเล็ก ๆ จะกลายเป็นความทรงจำ ความเชื่อใจ
            ความสูญเสีย และสายเลือดของคนรุ่นถัดไป
          </p>

          <div
            style={{
              marginTop: 34,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 14
            }}
          >
            {[
              ["เล่นง่ายขึ้น", "จัดแรงงาน → เลือกโครงการ → ตอบเหตุการณ์ → จบเดือน"],
              ["สมจริงขึ้น", "อาหาร โรค ความเหนื่อย ภัยนอกค่าย และความสัมพันธ์มีผลจริง"],
              ["น่าติดตามขึ้น", "ข่าวสาร พ่อค้า ภัยคุกคาม และเป้าหมายถิ่นฐาน"]
            ].map(([title, body]) => (
              <div
                key={title}
                style={{
                  background: "rgba(255,255,255,.55)",
                  border: "1px solid rgba(129, 97, 45, .2)",
                  borderRadius: 18,
                  padding: 18
                }}
              >
                <b style={{ fontSize: 18 }}>{title}</b>
                <p style={{ margin: "8px 0 0", color: "#6f614d", lineHeight: 1.6 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside
          style={{
            background: "rgba(255, 251, 239, .9)",
            border: "1px solid rgba(129, 97, 45, .22)",
            borderRadius: 28,
            padding: 28,
            boxShadow: "0 18px 50px rgba(77, 55, 20, .12)"
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 30 }}>ตั้งค่าการเริ่มต้น</h2>

          <label style={{ display: "block", fontWeight: 800, marginBottom: 8 }}>
            ชื่อผู้นำ
          </label>
          <input
            value={leaderName}
            onChange={(event) => setLeaderName(event.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid rgba(129, 97, 45, .25)",
              background: "#fffaf0",
              fontSize: 17,
              marginBottom: 18
            }}
          />

          <label style={{ display: "block", fontWeight: 800, marginBottom: 8 }}>
            ชื่อ House / ตระกูล
          </label>
          <input
            value={houseName}
            onChange={(event) => setHouseName(event.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px solid rgba(129, 97, 45, .25)",
              background: "#fffaf0",
              fontSize: 17,
              marginBottom: 18
            }}
          />

          <div style={{ fontWeight: 900, margin: "6px 0 12px" }}>
            พื้นหลังของกลุ่มผู้ตั้งถิ่นฐาน
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {origins.map((item) => {
              const active = item.id === origin;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOrigin(item.id)}
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    borderRadius: 18,
                    padding: 16,
                    border: active
                      ? "2px solid #1d6b55"
                      : "1px solid rgba(129, 97, 45, .24)",
                    background: active ? "rgba(39, 111, 86, .1)" : "#fffaf0",
                    color: "#143f35"
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <div>
                      <b style={{ fontSize: 18 }}>{item.title}</b>
                      <div style={{ color: "#6b5b47", marginTop: 4 }}>
                        {item.desc}
                      </div>
                      {active && (
                        <div style={{ color: "#1d6b55", marginTop: 6, fontWeight: 800 }}>
                          {item.bonus}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 18,
              border: "1px solid rgba(129, 97, 45, .18)",
              borderRadius: 18,
              overflow: "hidden",
              background: "rgba(255,255,255,.55)"
            }}
          >
            {[
              ["ประชากร", "10 คน มีชื่อและสถานะรายบุคคล"],
              ["ทรัพยากร", "อาหาร 30 · ไม้ 20 · หิน 5 · เครื่องมือ 5"],
              ["ที่พัก", "ยังไม่มีบ้านถาวร"],
              ["เป้าหมายแรก", "รอดปีแรกและตั้งค่ายให้มั่นคง"]
            ].map(([a, b]) => (
              <div
                key={a}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr",
                  gap: 12,
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(129, 97, 45, .14)"
                }}
              >
                <b>{a}</b>
                <span style={{ color: "#5f503e" }}>{b}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={startNewGame}
            style={{
              width: "100%",
              marginTop: 20,
              border: 0,
              borderRadius: 16,
              padding: "16px 18px",
              background: "#1d6b55",
              color: "white",
              fontSize: 20,
              fontWeight: 900,
              cursor: "pointer"
            }}
          >
            เริ่มต้นจากศูนย์ →
          </button>

          <button
            type="button"
            onClick={continueGame}
            style={{
              width: "100%",
              marginTop: 12,
              border: "1px solid rgba(129, 97, 45, .25)",
              borderRadius: 16,
              padding: "14px 18px",
              background: "#fffaf0",
              color: "#1d6b55",
              fontSize: 17,
              fontWeight: 900,
              cursor: "pointer"
            }}
          >
            เล่นต่อจาก Save
          </button>

          <p style={{ color: "#7c6b55", fontSize: 14, lineHeight: 1.6 }}>
            เซฟจะถูกเก็บไว้ใน browser ของผู้เล่นแต่ละคน หากล้าง cache หรือเปลี่ยนอุปกรณ์
            save อาจหายได้
          </p>
        </aside>
      </section>
    </main>
  );
}
