import React from "react";

const features = [
  { icon: "fa-shield", title: "Verified Listings", desc: "Every listing is vetted before publishing." },
  { icon: "fa-user-check", title: "Trusted Agents", desc: "Experienced local agents to guide you." },
  { icon: "fa-dollar-sign", title: "Fair Pricing", desc: "Market-driven prices & transparent fees." },
  { icon: "fa-balance-scale", title: "Title Checks", desc: "Legal verification for smooth transfer." },
];

export default function WhyChooseUs() {
  return (
    <section style={{ marginTop: 18 }}>
      <h3 style={{ color: "#184f16", marginBottom: 12 }}>Why choose 4Sale?</h3>
      <div style={{ display:"grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        {features.map((f, i) => (
          <div key={i} style={{ background:"#fff", padding:12, borderRadius:10, boxShadow: "0 8px 22px rgba(0,0,0,0.03)" }}>
            <div style={{ fontSize: 20, color:"#084003", marginBottom:8 }}>
              <i className={`fa ${f.icon}`} />
            </div>
            <div style={{ fontWeight:800 }}>{f.title}</div>
            <div style={{ color:"#6b8b6b", marginTop:6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
