import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerSupabase } from "../../../lib/supabase/server";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "sk-placeholder",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请上传 PDF 文件" }, { status: 400 });
    }

    // Call Python FastAPI for PDF text extraction via raw HTTP (bypass Windows proxy)
    let pdfText = "";
    try {
      const http = await import("http");
      const arrayBuf = await file.arrayBuffer();
      const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
      const hdr = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${file.name}"\r\nContent-Type: application/pdf\r\n\r\n`;
      const ftr = `\r\n--${boundary}--\r\n`;
      const body = Buffer.concat([Buffer.from(hdr), Buffer.from(arrayBuf), Buffer.from(ftr)]);

      const pyData: any = await new Promise((resolve, reject) => {
        const r = http.request({
          hostname: "127.0.0.1", port: 8000, path: "/api/extract-pdf", method: "POST",
          headers: { "Content-Type": `multipart/form-data; boundary=${boundary}`, "Content-Length": String(body.length) },
        }, (res) => { let d = ""; res.on("data", (c: any) => d += c); res.on("end", () => { try { resolve(JSON.parse(d)); } catch { reject(new Error(d)); } }); });
        r.on("error", reject); r.write(body); r.end();
      });

      if (pyData.detail) return NextResponse.json({ error: pyData.detail }, { status: 400 });
      pdfText = (pyData.text || "").slice(0, 5000);
    } catch (e: any) {
      return NextResponse.json({ error: `Python 服务连接失败: ${e.message}` }, { status: 500 });
    }

    if (!pdfText.trim()) {
      return NextResponse.json({ error: "PDF 内容为空" }, { status: 400 });
    }

    // AI Analysis
    const prompt = `你是资深 HR 和简历优化专家。仔细阅读以下简历，必须输出完整 JSON，每个字段都不能是空数组：

{
  "score": 0-100,
  "strengths": ["亮点1", "亮点2", "亮点3"],
  "weaknesses": ["问题1", "问题2", "问题3"],
  "suggestions": [
    {"section": "个人信息/工作经历/项目经验/技能", "original": "原文摘要(20字内)", "improved": "优化后版本", "reason": "为什么改"}
  ],
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "interviewQuestions": [
    {"question": "面试题", "referenceAnswer": "参考回答要点"}
  ]
}

请确保 strengths 至少 3 个、weaknesses 至少 3 个、suggestions 至少 2 个、keywords 至少 3 个、interviewQuestions 至少 2 个。

简历内容：
${pdfText}`;

    const completion = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 3000,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const analysis = JSON.parse(raw);

    const result = { text: pdfText.slice(0, 500), ...analysis };

    // Save to DB if user is logged in
    try {
      const supabase = await createServerSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("analyses").insert({
          user_id: user.id,
          file_name: file.name,
          score: analysis.score || 0,
          strengths: analysis.strengths || [],
          weaknesses: analysis.weaknesses || [],
          keywords: analysis.keywords || [],
          suggestions: analysis.suggestions || [],
          interview_questions: analysis.interviewQuestions || [],
        });
      }
    } catch (e) { console.error("Save failed:", e); }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error.message || "分析失败，请重试" },
      { status: 500 }
    );
  }
}
