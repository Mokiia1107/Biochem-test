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
  Target,
  Save,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { choiceQuestions } from '@/data/questions';
import { sci, sciHtml } from '@/lib/sciText';
import { seededShuffle } from '@/lib/utils';
import type { PageRoute, UserAnswer } from '@/types';

type ChoiceQuizMode = 'normal' | 'wrong-practice';
type FilterType = 'all' | 'wrong' | 'unanswered';

interface PracticeAnswer {
  selected: number;
  status: 'correct' | 'wrong';
}

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
  mode?: ChoiceQuizMode;
}

export function ChoiceQuiz({ quiz, onNavigate, saveMgr, mode = 'normal' }: ChoiceQuizProps) {
  const isPractice = mode === 'wrong-practice';

  const [currentIdx, setCurrentIdx] = useState(0);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showList, setShowList] = useState(false);
  const [order, setOrder] = useState<'sequential' | 'random'>('sequential');
  const [shuffleSeed, setShuffleSeed] = useState(() => Date.now());
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [optionSeed, setOptionSeed] = useState(() => Date.now());

  // Wrong-practice session state (isolated from original records)
  const [practiceQuestions] = useState(() => {
    if (!isPractice) return [];
    return choiceQuestions.filter(q => quiz.getUserAnswer(q.id)?.status === 'wrong');
  });
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, PracticeAnswer>>({});
  const [practiceExplanation, setPracticeExplanation] = useState<Record<number, boolean>>({});
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  const orderedBase = useMemo(() => {
    const base = isPractice ? practiceQuestions : choiceQuestions;
    return order === 'random' ? seededShuffle(base, shuffleSeed) : base;
  }, [isPractice, practiceQuestions, order, shuffleSeed]);

  const questions = useMemo(() => {
    if (isPractice) return orderedBase;
    if (filter === 'wrong') {
      return orderedBase.filter(q => quiz.getUserAnswer(q.id)?.status === 'wrong');
    }
    if (filter === 'unanswered') {
      return orderedBase.filter(q => !quiz.getUserAnswer(q.id));
    }
    return orderedBase;
  }, [isPractice, filter, orderedBase, quiz]);

  useEffect(() => {
    if (currentIdx >= questions.length) {
      setCurrentIdx(Math.max(0, questions.length - 1));
    }
  }, [questions.length, currentIdx]);

  const currentQ = questions[currentIdx];

  const displayOptions = useMemo(() => {
    if (!currentQ) return [];
    const withIdx = currentQ.options.map((text, originalIdx) => ({ text, originalIdx }));
    if (shuffleOptions) {
      return seededShuffle(withIdx, optionSeed + currentQ.id);
    }
    return withIdx;
  }, [currentQ, shuffleOptions, optionSeed]);

  // Normal mode state
  const userAnswer = currentQ ? quiz.getUserAnswer(currentQ.id) : undefined;
  const hasAnswered =
    userAnswer?.status === 'correct' || userAnswer?.status === 'wrong';
  const isCorrect = userAnswer?.status === 'correct';
  const showExp = currentQ ? quiz.isExplanationVisible(currentQ.id) : false;

  // Practice mode state
  const practiceAnswer = currentQ ? practiceAnswers[currentQ.id] : undefined;
  const hasPracticeAnswered = !!practiceAnswer;
  const practiceIsCorrect = practiceAnswer?.status === 'correct';
  const showPracticeExp = currentQ ? practiceExplanation[currentQ.id] : false;

  // Decide which state to use for rendering
  const activeHasAnswered = isPractice ? hasPracticeAnswered : hasAnswered;
  const activeIsCorrect = isPractice ? practiceIsCorrect : isCorrect;
  const activeShowExp = isPractice ? showPracticeExp : showExp;
  const activeUserAnswer = isPractice
    ? practiceAnswer
      ? { answer: practiceAnswer.selected.toString() }
      : undefined
    : userAnswer;

  const total = choiceQuestions.length;
  const answered = choiceQuestions.filter(q => quiz.getUserAnswer(q.id)).length;
  const correctCount = choiceQuestions.filter(
    q => quiz.getUserAnswer(q.id)?.status === 'correct'
  ).length;
  const wrongCount = choiceQuestions.filter(
    q => quiz.getUserAnswer(q.id)?.status === 'wrong'
  ).length;

  const practiceStats = useMemo(() => {
    const answeredList = Object.values(practiceAnswers);
    return {
      total: practiceQuestions.length,
      answered: answeredList.length,
      correct: answeredList.filter(a => a.status === 'correct').length,
      wrong: answeredList.filter(a => a.status === 'wrong').length,
    };
  }, [practiceAnswers, practiceQuestions.length]);

  const handleOptionClick = (optionIdx: number) => {
    if (!currentQ) return;

    if (isPractice) {
      if (hasPracticeAnswered) return;
      const status: PracticeAnswer['status'] =
        optionIdx === currentQ.correctAnswer ? 'correct' : 'wrong';
      setPracticeAnswers(prev => ({
        ...prev,
        [currentQ.id]: { selected: optionIdx, status },
      }));
      setPracticeExplanation(prev => ({ ...prev, [currentQ.id]: true }));
    } else {
      if (hasAnswered) return;
      quiz.handleChoiceAnswer(currentQ.id, optionIdx, currentQ.correctAnswer);
    }
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

  const handleSavePractice = () => {
    if (!isPractice) return;
    Object.entries(practiceAnswers).forEach(([qIdStr, answer]) => {
      const qId = parseInt(qIdStr, 10);
      const question = choiceQuestions.find(q => q.id === qId);
      if (!question) return;
      if (answer.status === 'correct') {
        quiz.handleChoiceAnswer(qId, answer.selected, question.correctAnswer);
      }
      // wrong answers are not synced, keeping original wrong record unchanged
    });
    setShowFinishDialog(false);
    onNavigate('stats');
  };

  const handleFinishWithoutSave = () => {
    setShowFinishDialog(false);
    onNavigate('home');
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
              {isPractice ? '错题再练' : '选择题'}
              {saveMgr.activeSlot && (
                <span className="text-slate-400">· {saveMgr.activeSlot.name}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isPractice && (
              <Button variant="ghost" size="sm" onClick={() => setShowList(true)}>
                <BookOpen className="w-4 h-4 mr-1" />
                题号
              </Button>
            )}
            {isPractice && (
              <Button variant="ghost" size="sm" onClick={() => setShowFinishDialog(true)}>
                <Save className="w-4 h-4 mr-1" />
                结束练习
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-1">
            {isPractice ? (
              <>
                <span>进度 {practiceStats.answered}/{practiceStats.total}</span>
                <span className="text-emerald-600">{practiceStats.correct} 本次做对</span>
                <span className="text-rose-600">{practiceStats.wrong} 本次做错</span>
              </>
            ) : (
              <>
                <span>进度 {answered}/{total}</span>
                <span className="text-emerald-600">{correctCount} 正确</span>
                <span className="text-rose-600">{wrongCount} 错误</span>
                <span>{total - answered} 未答</span>
              </>
            )}
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{
                width: `${
                  isPractice
                    ? practiceStats.total > 0
                      ? (practiceStats.answered / practiceStats.total) * 100
                      : 0
                    : total > 0
                      ? (answered / total) * 100
                      : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Filter Tabs - only in normal mode */}
        {!isPractice && (
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
        )}

        {/* Practice intro / empty state */}
        {isPractice && questions.length === 0 && (
          <Card className="mb-4 border-emerald-200 bg-emerald-50">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-emerald-800 mb-1">🎉 当前没有错题</h3>
              <p className="text-emerald-600 text-sm mb-4">
                你还没有错题记录，先去刷题吧！
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => onNavigate('home')}>
                  返回首页
                </Button>
                <Button onClick={() => onNavigate('choice')}>
                  开始刷题
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Card */}
        {currentQ && (
          <Card className="mb-4">
            <CardContent className="p-6">
              {/* Question Header */}
              <div className="flex items-start gap-3 mb-6">
                <Badge variant="secondary" className="shrink-0 mt-0.5">
                  {isPractice
                    ? `${currentIdx + 1}/${questions.length}`
                    : `${choiceQuestions.indexOf(currentQ) + 1}/${total}`}
                </Badge>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {currentQ.fromTest}
                    </Badge>
                    {activeHasAnswered && (
                      activeIsCorrect ? (
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
                  const isSelected = activeUserAnswer?.answer === originalIdx.toString();
                  const isCorrectOption = originalIdx === currentQ.correctAnswer;

                  let btnClass = 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50';
                  if (activeHasAnswered) {
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
                      disabled={activeHasAnswered}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${btnClass}`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                        activeHasAnswered && isCorrectOption
                          ? 'bg-emerald-500 text-white'
                          : activeHasAnswered && isSelected && !isCorrectOption
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {optionLabels[displayIdx]}
                      </span>
                      <span className="text-base">{sci(option)}</span>
                      {activeHasAnswered && isCorrectOption && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto shrink-0" />
                      )}
                      {activeHasAnswered && isSelected && !isCorrectOption && (
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
        {currentQ && activeShowExp && (
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

      {/* Finish practice dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              结束错题再练
            </DialogTitle>
            <DialogDescription>本次练习结果统计如下</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-600">{practiceStats.total}</div>
                  <div className="text-xs text-slate-500">错题总数</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">{practiceStats.correct}</div>
                  <div className="text-xs text-slate-500">本次做对</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-rose-600">{practiceStats.wrong}</div>
                  <div className="text-xs text-slate-500">本次做错</div>
                </CardContent>
              </Card>
            </div>
            <p className="text-sm text-slate-500">
              保存结果后，本次做对的错题会从错题本中移除；本次做错的错题仍保留在原记录中。
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleFinishWithoutSave} className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-1" />
              不保存，返回首页
            </Button>
            <Button onClick={handleSavePractice} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-1" />
              保存结果
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
