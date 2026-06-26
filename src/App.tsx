import { useState, useEffect } from 'react';
import { useSaveManager } from '@/hooks/useSaveManager';
import { useQuiz } from '@/hooks/useQuiz';
import { HomePage } from '@/sections/HomePage';
import { ChoiceQuiz } from '@/sections/ChoiceQuiz';
import { DefinitionQuiz } from '@/sections/DefinitionQuiz';
import { EssayQuiz } from '@/sections/EssayQuiz';
import { StatsPage } from '@/sections/StatsPage';
import { SaveManagerPage } from '@/sections/SaveManagerPage';
import type { PageRoute } from '@/types';
import './App.css';

function App() {
  const [page, setPage] = useState<PageRoute>('home');
  const saveMgr = useSaveManager();

  useEffect(() => {
    if (saveMgr.activeSlot && saveMgr.activeSlot.currentSection && page === 'home') {
      // keep last section if returning to home
    }
  }, [saveMgr.activeSlot, page]);

  const quiz = useQuiz(saveMgr.saveAnswer, saveMgr.getAnswerForQuestion);

  if (page === 'saves') {
    return (
      <SaveManagerPage
        saveMgr={saveMgr}
        onBack={() => setPage('home')}
      />
    );
  }

  if (page === 'home') {
    return (
      <HomePage
        saveMgr={saveMgr}
        onNavigate={setPage}
      />
    );
  }

  if (!saveMgr.activeSlot) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-slate-800 mb-2">未选择存档</h2>
          <p className="text-slate-500 mb-6">请先创建或选择一个存档开始刷题</p>
          <button
            onClick={() => setPage('saves')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            管理存档
          </button>
        </div>
      </div>
    );
  }

  if (page === 'choice') {
    return (
      <ChoiceQuiz
        quiz={quiz}
        onNavigate={setPage}
        saveMgr={saveMgr}
      />
    );
  }

  if (page === 'definition') {
    return (
      <DefinitionQuiz
        quiz={quiz}
        onNavigate={setPage}
        saveMgr={saveMgr}
      />
    );
  }

  if (page === 'essay') {
    return (
      <EssayQuiz
        quiz={quiz}
        onNavigate={setPage}
        saveMgr={saveMgr}
      />
    );
  }

  if (page === 'stats') {
    return (
      <StatsPage
        saveMgr={saveMgr}
        onNavigate={setPage}
      />
    );
  }

  return null;
}

export default App;
