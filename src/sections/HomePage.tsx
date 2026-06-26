import { useState } from 'react';
import {
  BookOpen,
  ListChecks,
  PenTool,
  Save,
  BarChart3,
  ChevronRight,
  Dna,
  Beaker,
  Microscope,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { PageRoute } from '@/types';
import { choiceQuestions, definitionQuestions, essayQuestions } from '@/data/questions';

interface HomePageProps {
  saveMgr: {
    slots: Array<{ id: string; name: string; updatedAt: number }>;
    activeSlotId: string | null;
    activeSlot: { name: string; answers: Record<number, unknown> } | null;
    createSlot: (name: string) => string;
    activateSlot: (id: string) => void;
  };
  onNavigate: (page: PageRoute) => void;
}

export function HomePage({ saveMgr, onNavigate }: HomePageProps) {
  const [newSlotName, setNewSlotName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const totalChoice = choiceQuestions.length;
  const totalDef = definitionQuestions.length;
  const totalEssay = essayQuestions.length;

  const answeredCount = saveMgr.activeSlot
    ? Object.keys(saveMgr.activeSlot.answers).length
    : 0;
  const totalQuestions = totalChoice + totalDef + totalEssay;

  const handleCreate = () => {
    if (newSlotName.trim()) {
      saveMgr.createSlot(newSlotName.trim());
      setNewSlotName('');
      setShowCreate(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Dna className="w-8 h-8" />
            <h1 className="text-2xl font-bold">生化刷题神器</h1>
          </div>
          <p className="text-indigo-100 text-sm">
            生物化学与分子生物学 · 综合题库（{totalQuestions}题）
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Save Slot Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Save className="w-5 h-5 text-indigo-600" />
              答题档案
            </CardTitle>
          </CardHeader>
          <CardContent>
            {saveMgr.activeSlot ? (
              <div className="flex items-center justify-between mb-4 p-3 bg-indigo-50 rounded-lg">
                <div>
                  <div className="font-medium text-indigo-900">
                    当前档案：{saveMgr.activeSlot.name}
                  </div>
                  <div className="text-sm text-indigo-600 mt-1">
                    已作答 {answeredCount} / {totalQuestions} 题
                    {totalQuestions > 0 && (
                      <span className="ml-2">
                        （{Math.round((answeredCount / totalQuestions) * 100)}%）
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => onNavigate('saves')}>
                  管理档案
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500 mb-4">
                <p>尚未创建答题档案，请创建后开始刷题</p>
              </div>
            )}

            {!showCreate ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreate(true)}
                >
                  + 新建档案
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onNavigate('saves')}
                >
                  加载档案
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="输入档案名称..."
                  value={newSlotName}
                  onChange={e => setNewSlotName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  autoFocus
                />
                <Button onClick={handleCreate}>创建</Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>
                  取消
                </Button>
              </div>
            )}

            {saveMgr.slots.length > 0 && !saveMgr.activeSlot && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium text-slate-700">选择已有档案：</div>
                {saveMgr.slots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => saveMgr.activateSlot(slot.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors text-left"
                  >
                    <span className="font-medium text-slate-800">{slot.name}</span>
                    <Badge variant="secondary">
                      {new Date(slot.updatedAt).toLocaleDateString('zh-CN')}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {saveMgr.activeSlot && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="text-2xl font-bold text-indigo-600">{totalChoice}</div>
                <div className="text-sm text-slate-500">选择题</div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="text-2xl font-bold text-emerald-600">{totalDef}</div>
                <div className="text-sm text-slate-500">名词解释</div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="text-2xl font-bold text-amber-600">{totalEssay}</div>
                <div className="text-sm text-slate-500">问答题</div>
              </CardContent>
            </Card>
            <Card className="bg-white cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('stats')}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-rose-600">{answeredCount}</div>
                    <div className="text-sm text-slate-500">已作答</div>
                  </div>
                  <BarChart3 className="w-6 h-6 text-rose-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Cards */}
        {saveMgr.activeSlot && (
          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={() => onNavigate('choice')}
              className="group relative overflow-hidden rounded-2xl bg-white border-2 border-indigo-100 hover:border-indigo-300 transition-all p-6 text-left hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ListChecks className="w-24 h-24 text-indigo-600" />
              </div>
              <div className="relative">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <ListChecks className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">选择题</h3>
                <p className="text-sm text-slate-500 mb-3">点击作答，即时判错查看解析</p>
                <div className="flex items-center text-indigo-600 text-sm font-medium">
                  开始刷题
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('definition')}
              className="group relative overflow-hidden rounded-2xl bg-white border-2 border-emerald-100 hover:border-emerald-300 transition-all p-6 text-left hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BookOpen className="w-24 h-24 text-emerald-600" />
              </div>
              <div className="relative">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">名词解释</h3>
                <p className="text-sm text-slate-500 mb-3">输入答案，对比标准解析</p>
                <div className="flex items-center text-emerald-600 text-sm font-medium">
                  开始练习
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('essay')}
              className="group relative overflow-hidden rounded-2xl bg-white border-2 border-amber-100 hover:border-amber-300 transition-all p-6 text-left hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <PenTool className="w-24 h-24 text-amber-600" />
              </div>
              <div className="relative">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <PenTool className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">问答题</h3>
                <p className="text-sm text-slate-500 mb-3">输入答案，对比标准答案</p>
                <div className="flex items-center text-amber-600 text-sm font-medium">
                  开始练习
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Study Tips */}
        <Card className="bg-slate-800 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
                <Microscope className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">学习建议</h3>
                <ul className="text-sm text-slate-300 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <Beaker className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
                    选择题建议先独立作答，再看解析加深记忆
                  </li>
                  <li className="flex items-start gap-2">
                    <Beaker className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
                    名词解释尝试用自己的话描述，再对比标准答案查漏补缺
                  </li>
                  <li className="flex items-start gap-2">
                    <Beaker className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
                    问答题建议先自己组织答题要点，再对照完整答案完善
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 py-4">
          <p>生化刷题神器 · 覆盖生物化学与分子生物学核心考点</p>
          <p className="mt-1">答题数据保存在本地浏览器中，不会上传至服务器</p>
        </footer>
      </main>
    </div>
  );
}
