import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app center-page">
      <section className="panel pad narrow">
        <h1>ไม่พบหน้านี้</h1>
        <p className="muted">กลับไปเริ่มต้นแคมเปญ Evolution of Us</p>
        <Link className="primary link-btn" href="/">กลับหน้าแรก</Link>
      </section>
    </main>
  );
}
