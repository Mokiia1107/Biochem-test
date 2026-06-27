import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  PenLine,
  RotateCcw,
  Award,
  ArrowDownUp,
  Shuffle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { essayQuestions } from '@/data/questions';
import { sci, sciHtml } from '@/lib/sciText';
import { seededShuffle } from '@/lib/utils';
import type { PageRoute, UserAnswer } from '@/types';

interface EssayQuizProps {
  quiz: {
    handleTextSubmit: (qId: number, text: string) => void;
    getUserAnswer: (qId: number) => UserAnswer | undefined;
  };
  onNavigate: (page: PageRoute) => void;
  saveMgr: {
    activeSlot: { name: string } | null;
  };
}

export function EssayQuiz({ quiz, onNavigate, saveMgr }: EssayQuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userText, setUserText] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'reviewed'>('all');
  const [showList, setShowList] = useState(false);
  const [order, setOrder] = useState<'sequential' | 'random'>('sequential');
  const [shuffleSeed, setShuffleSeed] = useState(() => Date.now());

  const orderedBase = useMemo(() => {
    return order === 'random'
      ? seededShuffle(essayQuestions, shuffleSeed)
      : essayQuestions;
  }, [order, shuffleSeed]);

  const questions = useMemo(() => {
    if (filter === 'reviewed') {
      return orderedBase.filter(
        q => quiz.getUserAnswer(q.id)?.status === 'reviewed'
      );
    }
    if (filter === 'unanswered') {
      return orderedBase.filter(q => !quiz.getUserAnswer(q.id));
    }
    return orderedBase;
  }, [filter, orderedBase, quiz]);

  const currentQ = questions[currentIdx] || essayQuestions[0];
  const userAnswer = quiz.getUserAnswer(currentQ.id);

  const total = essayQuestions.length;
  const reviewedCount = essayQuestions.filter(
    q => quiz.getUserAnswer(q.id)?.status === 'reviewed'
  ).length;

  useMemo(() => {
    if (userAnswer?.answer) {
      setUserText(userAnswer.answer);
    } else {
      setUserText('');
    }
    setShowAnswer(false);
  }, [currentQ.id]);

  const handleSubmit = () => {
    if (userText.trim()) {
      quiz.handleTextSubmit(currentQ.id, userText.trim());
      setShowAnswer(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const handleReset = () => {
    if (confirm('确定要重置所有问答题的答题记录吗？')) {
      essayQuestions.forEach(q => {
        quiz.handleTextSubmit(q.id, '');
      });
      setUserText('');
      setShowAnswer(false);
    }
  };

  if (showList) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="sm" onClick={() => setShowList(false)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
            <h2 className="text-xl font-bold text-slate-800">题目列表</h2>
          </div>
          <div className="space-y-2">
            {essayQuestions.map((q, idx) => {
              const ua = quiz.getUserAnswer(q.id);
              let bgClass = 'bg-white border-slate-200 hover:border-amber-300';
              if (ua?.status === 'reviewed') bgClass = 'bg-amber-50 border-amber-300';
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setFilter('all');
                    setCurrentIdx(idx);
                    setShowList(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border text-left transition-all ${bgClass}`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{idx + 1}</Badge>
                    <span className="text-sm font-medium text-slate-800 truncate max-w-md">
                      {q.question}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{q.score}分</Badge>
                    {ua?.status === 'reviewed' && (
                      <Badge className="bg-amber-100 text-amber-700">已练习</Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('home')}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <GraduationCap className="w-4 h-4" />
              问答题
              {saveMgr.activeSlot && (
                <span className="text-slate-400">· {saveMgr.activeSlot.name}</span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowList(true)}>
            <BookOpen className="w-4 h-4 mr-1" />
            列表
          </Button>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-1">
            <span>进度 {reviewedCount}/{total}</span>
            <span className="text-amber-600">{reviewedCount} 已练习</span>
            <span>{total - reviewedCount} 未练习</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${(reviewedCount / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(['all', 'unanswered', 'reviewed'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setCurrentIdx(0); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border'
              }`}
            >
              {f === 'all' && '全部'}
              {f === 'unanswered' && '未练习'}
              {f === 'reviewed' && '已练习'}
            </button>
          ))}

          {/* Order toggle */}
          <div className="flex items-center rounded-full border bg-white p-0.5 ml-1">
            <button
              onClick={() => { setOrder('sequential'); setCurrentIdx(0); }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                order === 'sequential'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              顺序
            </button>
            <button
              onClick={() => { setOrder('random'); setShuffleSeed(Date.now()); setCurrentIdx(0); }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                order === 'random'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              乱序
            </button>
          </div>
          {order === 'random' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShuffleSeed(Date.now()); setCurrentIdx(0); }}
              className="text-slate-400"
            >
              <Shuffle className="w-3.5 h-3.5 mr-1" />
              重新打乱
            </Button>
          )}

          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-400">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            重置
          </Button>
        </div>

        <Card className="mb-4 border-t-4 border-t-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="secondary">
                {essayQuestions.indexOf(currentQ) + 1}/{total}
              </Badge>
              <Badge variant="outline">{currentQ.fromTest}</Badge>
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                <Award className="w-3 h-3 mr-1" />
                {currentQ.score}分
              </Badge>
            </div>
            <h2 className="text-lg font-semibold text-slate-800 leading-relaxed mb-6">
              {sci(currentQ.question)}
            </h2>

            {!showAnswer ? (
              <div className="space-y-3">
                <Textarea
                  value={userText}
                  onChange={e => setUserText(e.target.value)}
                  placeholder="在此输入你的答案要点..."
                  className="min-h-[200px] text-base leading-relaxed resize-none"
                />
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setShowAnswer(true)}
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    直接看答案
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!userText.trim()}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <PenLine className="w-4 h-4 mr-1" />
                    提交并查看答案
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {userText && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-sm font-medium text-slate-600 mb-2">你的答案：</div>
                    <div className="text-slate-800 whitespace-pre-wrap">{userText}</div>
                  </div>
                )}

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-amber-800">标准答案</span>
                  </div>
                  <div
                    className="text-amber-900 leading-relaxed text-sm"
                    dangerouslySetInnerHTML={{
                      __html: sciHtml(currentQ.answer, 'text-amber-700'),
                    }}
                  />
                </div>

                <Button variant="outline" onClick={() => setShowAnswer(false)}>
                  <PenLine className="w-4 h-4 mr-1" />
                  重新作答
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handlePrev} disabled={currentIdx === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            上一题
          </Button>
          <span className="text-sm text-slate-500">
            {currentIdx + 1} / {questions.length}
          </span>
          <Button variant="outline" onClick={handleNext} disabled={currentIdx === questions.length - 1}>
            下一题
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </main>
    </div>
  );
}
