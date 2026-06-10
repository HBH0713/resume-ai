"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Plus, Trash2, Download } from "lucide-react";

interface ResumeData {
  name: string; title: string; email: string; phone: string; location: string;
  summary: string;
  experience: { company: string; role: string; dates: string; bullets: string }[];
  education: { school: string; degree: string; year: string }[];
  skills: string;
  projects: { name: string; desc: string; tech: string }[];
}

const emptyData: ResumeData = {
  name: "", title: "", email: "", phone: "", location: "",
  summary: "",
  experience: [{ company: "", role: "", dates: "", bullets: "" }],
  education: [{ school: "", degree: "", year: "" }],
  skills: "",
  projects: [{ name: "", desc: "", tech: "" }],
};

export default function BuilderPage() {
  const [data, setData] = useState<ResumeData>(emptyData);
  const [tab, setTab] = useState("info");

  const update = (key: keyof ResumeData, val: any) => setData({ ...data, [key]: val });

  const addExp = () => update("experience", [...data.experience, { company: "", role: "", dates: "", bullets: "" }]);
  const addEdu = () => update("education", [...data.education, { school: "", degree: "", year: "" }]);
  const addProj = () => update("projects", [...data.projects, { name: "", desc: "", tech: "" }]);

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{font-family:'Segoe UI',sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#1a1a1a;line-height:1.6}
      h1{margin:0;font-size:28px} h2{font-size:14px;color:#555;margin:2px 0 16px}
      h3{border-bottom:2px solid #2563eb;padding-bottom:4px;font-size:16px;margin:20px 0 8px}
      .exp{margin-bottom:12px} .exp-title{font-weight:600} .exp-meta{color:#666;font-size:13px}
      ul{margin:4px 0;padding-left:20px} li{font-size:14px;margin:2px 0}
      .skills{display:flex;flex-wrap:wrap;gap:6px}.skill{background:#eef2ff;color:#1e40af;padding:2px 10px;border-radius:12px;font-size:13px}
      @media print{body{margin:0;padding:20px}}
    </style></head><body>
      <h1>${data.name || "你的姓名"}</h1>
      <h2>${[data.title, data.email, data.phone, data.location].filter(Boolean).join(" · ")}</h2>
      ${data.summary ? `<p style="font-size:14px">${data.summary}</p>` : ""}
      ${data.experience.some(e => e.company) ? `<h3>工作经历</h3>${data.experience.filter(e => e.company).map(e => `<div class="exp"><div class="exp-title">${e.role} — ${e.company}</div><div class="exp-meta">${e.dates}</div><ul>${e.bullets.split("\n").filter(Boolean).map(b => `<li>${b}</li>`).join("")}</ul></div>`).join("")}` : ""}
      ${data.education.some(e => e.school) ? `<h3>教育背景</h3>${data.education.filter(e => e.school).map(e => `<div class="exp"><div class="exp-title">${e.school}</div><div class="exp-meta">${e.degree} · ${e.year}</div></div>`).join("")}` : ""}
      ${data.skills ? `<h3>技能</h3><div class="skills">${data.skills.split(/[,，]/).filter(Boolean).map(s => `<span class="skill">${s.trim()}</span>`).join("")}</div>` : ""}
      ${data.projects.some(p => p.name) ? `<h3>项目经验</h3>${data.projects.filter(p => p.name).map(p => `<div class="exp"><div class="exp-title">${p.name}</div><div class="exp-meta">${p.tech}</div><p style="font-size:14px">${p.desc}</p></div>`).join("")}` : ""}
      <script>window.print();setTimeout(()=>window.close(),500)</script>
    </body></html>`);
    w.document.close();
  };

  const inputStyle = "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelStyle = "text-xs font-medium text-slate-600 mb-1 block";

  return (
    <div className="flex h-[calc(100vh-0px)]">
      {/* Left: Form */}
      <div className="w-[480px] overflow-y-auto p-6 border-r bg-white">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">编辑简历</h1>
          <Button onClick={handlePrint} size="sm"><Download className="w-4 h-4 mr-1" />导出 PDF</Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "info", label: "基本信息" },
            { key: "exp", label: "经历" },
            { key: "edu", label: "教育" },
            { key: "skills", label: "技能" },
            { key: "proj", label: "项目" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === key ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-slate-100"}`}>{label}</button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "info" && (
          <div className="space-y-3">
            <div><label className={labelStyle}>姓名</label><input className={inputStyle} value={data.name} onChange={e => update("name", e.target.value)} placeholder="张三" /></div>
            <div><label className={labelStyle}>职位</label><input className={inputStyle} value={data.title} onChange={e => update("title", e.target.value)} placeholder="前端开发工程师" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelStyle}>邮箱</label><input className={inputStyle} value={data.email} onChange={e => update("email", e.target.value)} placeholder="zhang@example.com" /></div>
              <div><label className={labelStyle}>电话</label><input className={inputStyle} value={data.phone} onChange={e => update("phone", e.target.value)} placeholder="138xxxx" /></div>
            </div>
            <div><label className={labelStyle}>城市</label><input className={inputStyle} value={data.location} onChange={e => update("location", e.target.value)} placeholder="北京" /></div>
            <div><label className={labelStyle}>个人总结</label><textarea className={inputStyle} rows={3} value={data.summary} onChange={e => update("summary", e.target.value)} placeholder="2-3 句自我描述..." /></div>
          </div>
        )}

        {tab === "exp" && (
          <div className="space-y-4">
            {data.experience.map((exp, i) => (
              <Card key={i}><CardContent className="p-3 space-y-2">
                <div className="flex justify-between items-center"><span className="text-sm font-medium text-slate-500">经历 #{i + 1}</span>
                  {data.experience.length > 1 && <button onClick={() => update("experience", data.experience.filter((_, j) => j !== i))}><Trash2 className="w-3 h-3 text-red-400" /></button>}
                </div>
                <input className={inputStyle} value={exp.company} onChange={e => { const n = [...data.experience]; n[i] = { ...n[i], company: e.target.value }; update("experience", n); }} placeholder="公司名称" />
                <div className="grid grid-cols-2 gap-2">
                  <input className={inputStyle} value={exp.role} onChange={e => { const n = [...data.experience]; n[i] = { ...n[i], role: e.target.value }; update("experience", n); }} placeholder="职位" />
                  <input className={inputStyle} value={exp.dates} onChange={e => { const n = [...data.experience]; n[i] = { ...n[i], dates: e.target.value }; update("experience", n); }} placeholder="2020 - 2023" />
                </div>
                <textarea className={inputStyle} rows={3} value={exp.bullets} onChange={e => { const n = [...data.experience]; n[i] = { ...n[i], bullets: e.target.value }; update("experience", n); }} placeholder="每行一个工作亮点..." />
              </CardContent></Card>
            ))}
            <Button variant="outline" size="sm" onClick={addExp} className="w-full"><Plus className="w-3 h-3 mr-1" />添加经历</Button>
          </div>
        )}

        {tab === "edu" && (
          <div className="space-y-3">
            {data.education.map((edu, i) => (
              <Card key={i}><CardContent className="p-3 space-y-2">
                <input className={inputStyle} value={edu.school} onChange={e => { const n = [...data.education]; n[i] = { ...n[i], school: e.target.value }; update("education", n); }} placeholder="学校名称" />
                <div className="grid grid-cols-2 gap-2">
                  <input className={inputStyle} value={edu.degree} onChange={e => { const n = [...data.education]; n[i] = { ...n[i], degree: e.target.value }; update("education", n); }} placeholder="学历/专业" />
                  <input className={inputStyle} value={edu.year} onChange={e => { const n = [...data.education]; n[i] = { ...n[i], year: e.target.value }; update("education", n); }} placeholder="毕业年份" />
                </div>
              </CardContent></Card>
            ))}
            <Button variant="outline" size="sm" onClick={addEdu} className="w-full"><Plus className="w-3 h-3 mr-1" />添加教育</Button>
          </div>
        )}

        {tab === "skills" && (
          <div><label className={labelStyle}>技能（逗号分隔）</label>
            <textarea className={inputStyle} rows={3} value={data.skills} onChange={e => update("skills", e.target.value)}
              placeholder="Python, React, TypeScript, Docker, PostgreSQL..." /></div>
        )}

        {tab === "proj" && (
          <div className="space-y-3">
            {data.projects.map((p, i) => (
              <Card key={i}><CardContent className="p-3 space-y-2">
                <input className={inputStyle} value={p.name} onChange={e => { const n = [...data.projects]; n[i] = { ...n[i], name: e.target.value }; update("projects", n); }} placeholder="项目名称" />
                <input className={inputStyle} value={p.tech} onChange={e => { const n = [...data.projects]; n[i] = { ...n[i], tech: e.target.value }; update("projects", n); }} placeholder="技术栈: React, Node.js" />
                <textarea className={inputStyle} rows={2} value={p.desc} onChange={e => { const n = [...data.projects]; n[i] = { ...n[i], desc: e.target.value }; update("projects", n); }} placeholder="项目描述..." />
              </CardContent></Card>
            ))}
            <Button variant="outline" size="sm" onClick={addProj} className="w-full"><Plus className="w-3 h-3 mr-1" />添加项目</Button>
          </div>
        )}
      </div>

      {/* Right: Preview */}
      <div className="flex-1 bg-slate-100 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto bg-white shadow-lg min-h-[297mm] p-12" style={{ fontFamily: "'Segoe UI', sans-serif", color: "#1a1a1a", lineHeight: 1.6 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{data.name || "你的姓名"}</h1>
          <p style={{ fontSize: 14, color: "#555", margin: "4px 0 20px" }}>
            {[data.title, data.email, data.phone, data.location].filter(Boolean).join(" · ")}
          </p>

          {data.summary && <p style={{ fontSize: 14, marginBottom: 20 }}>{data.summary}</p>}

          {data.experience.some(e => e.company) && (
            <div style={{ marginBottom: 20 }}>
              <h3 className="section-title">工作经历</h3>
              {data.experience.filter(e => e.company).map((e, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{e.role || "职位"} — {e.company}</div>
                  <div style={{ color: "#666", fontSize: 13, marginBottom: 4 }}>{e.dates}</div>
                  {e.bullets && <ul style={{ margin: "4px 0", paddingLeft: 20 }}>{e.bullets.split("\n").filter(Boolean).map((b, j) => <li key={j} style={{ fontSize: 13, margin: "2px 0" }}>{b}</li>)}</ul>}
                </div>
              ))}
            </div>
          )}

          {data.education.some(e => e.school) && (
            <div style={{ marginBottom: 20 }}>
              <h3 className="section-title">教育背景</h3>
              {data.education.filter(e => e.school).map((e, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{e.school}</div>
                  <div style={{ color: "#666", fontSize: 13 }}>{e.degree}{e.degree && e.year ? " · " : ""}{e.year}</div>
                </div>
              ))}
            </div>
          )}

          {data.skills && (
            <div style={{ marginBottom: 20 }}>
              <h3 className="section-title">技能</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {data.skills.split(/[,，]/).filter(Boolean).map((s, i) => (
                  <span key={i} style={{ background: "#eef2ff", color: "#1e40af", padding: "2px 12px", borderRadius: 12, fontSize: 13 }}>{s.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {data.projects.some(p => p.name) && (
            <div>
              <h3 className="section-title">项目经验</h3>
              {data.projects.filter(p => p.name).map((p, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  <div style={{ color: "#666", fontSize: 13 }}>{p.tech}</div>
                  {p.desc && <p style={{ fontSize: 13, marginTop: 2 }}>{p.desc}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .section-title {
          border-bottom: 2px solid #2563eb;
          padding-bottom: 4px;
          font-size: 15px;
          font-weight: 700;
          margin: 20px 0 10px;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
}
