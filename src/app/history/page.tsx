import { Card, CardContent } from "../../components/ui/card";
import { TrendingUp, Calendar, ArrowLeft } from "lucide-react";
import { getAnalyses } from "../../lib/db";
import { createServerSupabase } from "../../lib/supabase/server";
import Link from "next/link";

export default async function HistoryPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const analyses = user ? await getAnalyses(user.id) : [];

  return (
    <div className="p-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4"><ArrowLeft className="w-3 h-3" />返回</Link>
      <h1 className="text-2xl font-bold mb-2">历史记录</h1>
      <p className="text-muted-foreground mb-8">所有简历分析记录，点击查看详情</p>
      {analyses.length === 0 ? (
        <Card><CardContent className="p-6 text-muted-foreground text-sm">上传简历并完成分析后，记录会出现在这里。</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {analyses.map((a: any) => (
            <Link key={a.id} href={`/history/${a.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">{a.score || "-"}</span>
                    </div>
                    <div>
                      <p className="font-medium">{a.file_name || "未命名"}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(a.created_at).toLocaleDateString("zh-CN")}</span>
                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{a.keywords?.slice(0, 4).join(", ") || "-"}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-blue-600">查看详情 →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
