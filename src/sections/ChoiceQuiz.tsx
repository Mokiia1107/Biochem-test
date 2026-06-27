import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  RotateCcw,
  HelpCircle,
  GraduationCap,
  ArrowDownUp,
  Shuffle,
  Dices,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { choiceQuestions } from '@/data/questions';
import { sci, sciHtml } from '@/lib/sciText';
import { seededShuffle } from '@/lib/utils';
import type { PageRoute, UserAnswer } from '@/types';

interface ChoiceQuizProps {
  quiz: {
    handleChoiceAnswer: (qId: number, selected: number, correct: number) => void;
    isExplanationVisible: (qId: number) => boolean;
    getUserAnswer: (qId: number) => UserAnswer | undefined;
  };
  onNavigate: (page: PageRoute) => void;
  saveMgr: {
    saveSection: (s: string) => void;
    activeSlot: { name: string } | null;
  };
  initialFilter?: 'all' | 'wrong' | 'unanswered';
}

export function ChoiceQuiz({ quiz, onNavigate, saveMgr, initialFilter }: ChoiceQuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [filter, setFilter] = useState<'all' | 'wrong' | 'unanswered'>(initialFilter ?? 'all');
  const [showList, setShowList] = useState(false);
  const [order, setOrder] = useState<'sequential' | 'random'>('sequential');
  const [shuffleSeed, setShuffleSeed] = useState(() => Date.now());
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [optionSeed, setOptionSeed] = useState(() => Date.now());

  const orderedBase = useMemo(() => {
    return order === 'random'
      ? seededShuffle(choiceQuestions, shuffleSeed)
      : choiceQuestions;
  }, [order, shuffleSeed]);

  const questions = useMemo(() => {
    if (filter === 'wrong') {
      return orderedBase.filter(
        q => quiz.getUserAnswer(q.id)?.status === 'wrong'
      );
    }
    if (filter === 'unanswered') {
      return orderedBase.filter(
        q => !quiz.getUserAnswer(q.id)
      );
    }
    return orderedBase;
  }, [filter, orderedBase, quiz]);

  // Keep current index in bounds when the filtered question list changes
  // (e.g. a wrong question is answered correctly and drops out of the list).
  useEffect(() => {
    if (questions.length === 0) {
      setCurrentIdx(0);
    } else if (currentIdx >= questions.length) {
      setCurrentIdx(questions.length - 1);
    }
  }, [questions.length, currentIdx]);

  const currentQ = questions[currentIdx] || choiceQuestions[0];

  // 选项乱序：每题用 optionSeed + 题目 id 作为种子，
  // 保证同一题在多次渲染中顺序稳定，但「重新打乱」时会变化。
  // displayOptions 中保留每个选项的原始索引，用于答题判定与记录。
  const displayOptions = useMemo(() => {
    const withIdx = currentQ.options.map((text, originalIdx) => ({ text, originalIdx }));
    if (shuffleOptions) {
      return seededShuffle(withIdx, optionSeed + currentQ.id);
    }
    return withIdx;
  }, [currentQ, shuffleOptions, optionSeed]);

  const userAnswer = quiz.getUserAnswer(currentQ.id);
  const hasAnswered = userAnswer?.status === 'correct' || userAnswer?.status === 'wrong';
  const isCorrect = userAnswer?.status === 'correct';
  const showExp = quiz.isExplanationVisible(currentQ.id);

  const total = choiceQuestions.length;
  const answered = choiceQuestions.filter(q => quiz.getUserAnswer(q.id)).length;
  const correctCount = choiceQuestions.filter(
    q => quiz.getUserAnswer(q.id)?.status === 'correct'
  ).length;
  const wrongCount = choiceQuestions.filter(
    q => quiz.getUserAnswer(q.id)?.status === 'wrong'
  ).length;

  const handleOptionClick = (optionIdx: number) => {
    if (hasAnswered) return;
    quiz.handleChoiceAnswer(currentQ.id, optionIdx, currentQ.correctAnswer);
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) setCurrentIdx(prev => prev + 1);
  };

  const handleReset = () => {
    if (confirm('确定要重置所有选择题的答题记录吗？')) {
      choiceQuestions.forEach(q => {
        quiz.handleChoiceAnswer(q.id, -1, q.correctAnswer);
      });
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

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
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {choiceQuestions.map((q, idx) => {
              const ua = quiz.getUserAnswer(q.id);
              let bgClass = 'bg-white border-slate-200 hover:border-indigo-300';
              if (ua?.status === 'correct') bgClass = 'bg-emerald-50 border-emerald-300 text-emerald-700';
              if (ua?.status === 'wrong') bgClass = 'bg-rose-50 border-rose-300 text-rose-700';
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setFilter('all');
                    setCurrentIdx(idx);
                    setShowList(false);
                  }}
                  className={`p-3 rounded-lg border text-center font-medium transition-all ${bgClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-50 border border-emerald-300 rounded" /> 正确</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-50 border border-rose-300 rounded" /> 错误</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-slate-200 rounded" /> 未答</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('home')}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <GraduationCap className="w-4 h-4" />
              {filter === 'wrong' ? '错题再练' : '选择题'}
              {saveMgr.activeSlot && (
                <span className="text-slate-400">· {saveMgr.activeSlot.name}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowList(true)}>
              <BookOpen className="w-4 h-4 mr-1" />
              题号
            </Button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-1">
            <span>进度 {answered}/{total}</span>
            <span className="text-emerald-600">{correctCount} 正确</span>
            <span className="text-rose-600">{wrongCount} 错误</span>
            <span>{total - answered} 未答</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${(answered / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(['all', 'unanswered', 'wrong'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setCurrentIdx(0); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border'
              }`}
            >
              {f === 'all' && '全部'}
              {f === 'unanswered' && '未作答'}
              {f === 'wrong' && '错题'}
            </button>
          ))}

          {/* Order toggle */}
          <div className="flex items-center rounded-full border bg-white p-0.5 ml-1">
            <button
              onClick={() => { setOrder('sequential'); setCurrentIdx(0); }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                order === 'sequential'
                  ? 'bg-indigo-600 text-white'
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
                  ? 'bg-indigo-600 text-white'
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

          {/* Option shuffle toggle */}
          <button
            onClick={() => {
              setShuffleOptions(prev => {
                const next = !prev;
                if (next) setOptionSeed(Date.now());
                return next;
              });
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              shuffleOptions
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            选项乱序
          </button>
          {shuffleOptions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOptionSeed(Date.now())}
              className="text-slate-400"
            >
              <Shuffle className="w-3.5 h-3.5 mr-1" />
              重排选项
            </Button>
          )}

          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-400">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            重置
          </Button>
        </div>

        {/* Empty state for wrong-practice mode */}
        {filter === 'wrong' && questions.length === 0 && (
          <Card className="mb-4 border-emerald-200 bg-emerald-50">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-emerald-800 mb-1">🎉 当前没有错题</h3>
              <p className="text-emerald-600 text-sm mb-4">
                你已经把错题全部攻克，可以去刷全部题目或查看统计。
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => onNavigate('home')}>
                  返回首页
                </Button>
                <Button onClick={() => setFilter('all')}>
                  刷全部题
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Card */}
        {questions.length > 0 && (
          <Card className="mb-4">
          <CardContent className="p-6">
            {/* Question Header */}
            <div className="flex items-start gap-3 mb-6">
              <Badge variant="secondary" className="shrink-0 mt-0.5">
                {choiceQuestions.indexOf(currentQ) + 1}/{total}
              </Badge>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {currentQ.fromTest}
                  </Badge>
                  {hasAnswered && (
                    isCorrect ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        回答正确
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                        <XCircle className="w-3 h-3 mr-1" />
                        回答错误
                      </Badge>
                    )
                  )}
                </div>
                <h3 className="text-lg font-medium text-slate-800 leading-relaxed">
                  {sci(currentQ.question)}
                </h3>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {displayOptions.map(({ text: option, originalIdx }, displayIdx) => {
                const isSelected = userAnswer?.answer === originalIdx.toString();
                const isCorrectOption = originalIdx === currentQ.correctAnswer;

                let btnClass = 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50';
                if (hasAnswered) {
                  if (isCorrectOption) {
                    btnClass = 'border-emerald-400 bg-emerald-50 text-emerald-800';
                  } else if (isSelected && !isCorrectOption) {
                    btnClass = 'border-rose-400 bg-rose-50 text-rose-800';
                  } else {
                    btnClass = 'border-slate-100 text-slate-400';
                  }
                } else if (isSelected) {
                  btnClass = 'border-indigo-400 bg-indigo-50 text-indigo-800';
                }

                return (
                  <button
                    key={originalIdx}
                    onClick={() => handleOptionClick(originalIdx)}
                    disabled={hasAnswered}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${btnClass}`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                      hasAnswered && isCorrectOption
                        ? 'bg-emerald-500 text-white'
                        : hasAnswered && isSelected && !isCorrectOption
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {optionLabels[displayIdx]}
                    </span>
                    <span className="text-base">{sci(option)}</span>
                    {hasAnswered && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto shrink-0" />
                    )}
                    {hasAnswered && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-rose-500 ml-auto shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Explanation Card */}
        {questions.length > 0 && showExp && (
          <Card className="mb-6 border-l-4 border-l-indigo-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-indigo-900">解析</h4>
              </div>
              <div
                className="text-slate-700 leading-relaxed text-sm"
                dangerouslySetInnerHTML={{
                  __html: sciHtml(currentQ.explanation),
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        {questions.length > 0 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIdx === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一题
            </Button>

            <span className="text-sm text-slate-500">
              {currentIdx + 1} / {questions.length}
            </span>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIdx === questions.length - 1}
            >
              下一题
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
