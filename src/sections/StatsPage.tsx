import { ArrowLeft, CheckCircle2, XCircle, HelpCircle, BookOpen, Award, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { choiceQuestions, definitionQuestions, essayQuestions } from '@/data/questions';
import { exportWrongQuestions } from '@/lib/exportWrongQuestions';
import type { PageRoute, UserAnswer } from '@/types';

interface StatsPageProps {
  saveMgr: {
    getAllAnswers: () => Record<number, UserAnswer>;
    activeSlot: { name: string } | null;
  };
  onNavigate: (page: PageRoute) => void;
}

export function StatsPage({ saveMgr, onNavigate }: StatsPageProps) {
  const answers = saveMgr.getAllAnswers();

  const choiceStats = {
    total: choiceQuestions.length,
    answered: choiceQuestions.filter(q => answers[q.id]).length,
    correct: choiceQuestions.filter(q => answers[q.id]?.status === 'correct').length,
    wrong: choiceQuestions.filter(q => answers[q.id]?.status === 'wrong').length,
  };

  const defStats = {
    total: definitionQuestions.length,
    reviewed: definitionQuestions.filter(q => answers[q.id]?.status === 'reviewed').length,
  };

  const essayStats = {
    total: essayQuestions.length,
    reviewed: essayQuestions.filter(q => answers[q.id]?.status === 'reviewed').length,
  };

  const totalQuestions = choiceStats.total + defStats.total + essayStats.total;
  const totalAnswered = choiceStats.answered + defStats.reviewed + essayStats.reviewed;
  const totalCorrect = choiceStats.correct;

  const accuracy = choiceStats.answered > 0
    ? Math.round((choiceStats.correct / choiceStats.answered) * 100)
    : 0;

  const wrongQuestions = choiceQuestions.filter(q => answers[q.id]?.status === 'wrong');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => onNavigate('home')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-slate-800">学习统计</h1>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-3xl font-bold text-indigo-600">{totalAnswered}</div>
              <div className="text-sm text-slate-500">已作答 / {totalQuestions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-3xl font-bold text-emerald-600">{totalCorrect}</div>
              <div className="text-sm text-slate-500">正确</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-3xl font-bold text-rose-600">{choiceStats.wrong}</div>
              <div className="text-sm text-slate-500">错误</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="text-3xl font-bold text-amber-600">{accuracy}%</div>
              <div className="text-sm text-slate-500">正确率</div>
            </CardContent>
          </Card>
        </div>

        {/* Section Progress */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                选择题
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-700 mb-1">
                {choiceStats.answered}/{choiceStats.total}
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(choiceStats.answered / choiceStats.total) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {choiceStats.correct} 正确
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-rose-500" />
                  {choiceStats.wrong} 错误
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                名词解释
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700 mb-1">
                {defStats.reviewed}/{defStats.total}
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(defStats.reviewed / defStats.total) * 100}%` }}
                />
              </div>
              <div className="text-xs text-slate-500">
                {defStats.total - defStats.reviewed} 题待练习
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                问答题
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700 mb-1">
                {essayStats.reviewed}/{essayStats.total}
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(essayStats.reviewed / essayStats.total) * 100}%` }}
                />
              </div>
              <div className="text-xs text-slate-500">
                {essayStats.total - essayStats.reviewed} 题待练习
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wrong Answers Review */}
        {wrongQuestions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  错题回顾（{wrongQuestions.length}题）
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportWrongQuestions(wrongQuestions, answers, saveMgr.activeSlot?.name)
                  }
                >
                  <Download className="w-4 h-4 mr-1" />
                  导出错题
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wrongQuestions.map(q => (
                  <div key={q.id} className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-800 text-sm mb-1">{q.question}</p>
                        <p className="text-xs text-rose-600 mb-1">
                          你选择了：{q.options[parseInt(answers[q.id]?.answer || '0')]}
                        </p>
                        <p className="text-xs text-emerald-600">
                          正确答案：{q.options[q.correctAnswer]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => onNavigate('choice-wrong')}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                去刷错题
              </Button>
            </CardContent>
          </Card>
        )}

        {wrongQuestions.length === 0 && choiceStats.answered > 0 && (
          <Card className="mb-6 bg-emerald-50 border-emerald-200">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-emerald-800 mb-1">太棒了！</h3>
              <p className="text-emerald-600 text-sm">你还没有错题，继续保持！</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
