import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { MessageSquare, Calendar, ArrowLeft } from "lucide-react";
import { createServerSupabase } from "../../lib/supabase/server";

export default async function InterviewPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  let questions: any[] = [];
  if (user) {
    const { data } = await supabase
      .from("analyses")
      .select("file_name, interview_questions, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) questions = data;
  }

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4"><ArrowLeft className="w-3 h-3" />返回</Link>
      <h1 className="text-2xl font-bold mb-2">面试题库</h1>
      <p className="text-muted-foreground mb-8">根据你的简历自动生成的针对性面试题</p>

      {questions.length === 0 ? (
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-500" />等待分析</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">上传简历并完成分析后，面试题会自动出现在这里</CardContent></Card>
      ) : (
        <div className="space-y-6">
          {questions.map((q: any, qi: number) => {
            const iqs = Array.isArray(q.interview_questions) ? q.interview_questions : [];
            if (iqs.length === 0) return null;
            return (
              <Card key={qi}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {q.file_name || "简历分析"} · {new Date(q.created_at).toLocaleDateString("zh-CN")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {iqs.map((iq: any, i: number) => (
                    <details key={i} className="border rounded-lg p-4" open>
                      <summary className="font-medium cursor-pointer">{i + 1}. {iq.question}</summary>
                      <p className="text-sm text-muted-foreground mt-2 pl-3 border-l-2 border-purple-200">{iq.referenceAnswer}</p>
                    </details>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
