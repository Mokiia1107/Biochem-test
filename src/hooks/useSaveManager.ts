import { useState, useEffect, useCallback } from 'react';
import type { SaveSlot, SaveManagerState, UserAnswer } from '@/types';

const STORAGE_KEY = 'bio_quiz_saves_v1';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadState(): SaveManagerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return { slots: [], activeSlotId: null };
}

function persistState(state: SaveManagerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useSaveManager() {
  const [state, setState] = useState<SaveManagerState>(loadState);

  useEffect(() => {
    persistState(state);
  }, [state]);

  const createSlot = useCallback((name: string) => {
    const newSlot: SaveSlot = {
      id: generateId(),
      name: name.trim() || `存档 ${new Date().toLocaleString('zh-CN')}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      answers: {},
      currentSection: 'choice',
    };
    setState(prev => ({
      slots: [...prev.slots, newSlot],
      activeSlotId: newSlot.id,
    }));
    return newSlot.id;
  }, []);

  const deleteSlot = useCallback((slotId: string) => {
    setState(prev => {
      const newSlots = prev.slots.filter(s => s.id !== slotId);
      let newActiveId = prev.activeSlotId;
      if (prev.activeSlotId === slotId) {
        newActiveId = newSlots.length > 0 ? newSlots[0].id : null;
      }
      return { slots: newSlots, activeSlotId: newActiveId };
    });
  }, []);

  const renameSlot = useCallback((slotId: string, newName: string) => {
    setState(prev => ({
      ...prev,
      slots: prev.slots.map(s =>
        s.id === slotId ? { ...s, name: newName.trim(), updatedAt: Date.now() } : s
      ),
    }));
  }, []);

  const activateSlot = useCallback((slotId: string) => {
    setState(prev => ({ ...prev, activeSlotId: slotId }));
  }, []);

  const activeSlot = state.slots.find(s => s.id === state.activeSlotId) || null;

  const saveAnswer = useCallback((questionId: number, answer: UserAnswer) => {
    setState(prev => {
      if (!prev.activeSlotId) return prev;
      return {
        ...prev,
        slots: prev.slots.map(s =>
          s.id === prev.activeSlotId
            ? {
                ...s,
                answers: { ...s.answers, [questionId]: answer },
                updatedAt: Date.now(),
              }
            : s
        ),
      };
    });
  }, []);

  const saveSection = useCallback((section: string) => {
    setState(prev => {
      if (!prev.activeSlotId) return prev;
      return {
        ...prev,
        slots: prev.slots.map(s =>
          s.id === prev.activeSlotId
            ? { ...s, currentSection: section, updatedAt: Date.now() }
            : s
        ),
      };
    });
  }, []);

  const getAnswerForQuestion = useCallback(
    (questionId: number): UserAnswer | undefined => {
      return activeSlot?.answers[questionId];
    },
    [activeSlot]
  );

  const getAllAnswers = useCallback((): Record<number, UserAnswer> => {
    return activeSlot?.answers || {};
  }, [activeSlot]);

  const getProgressStats = useCallback(() => {
    const answers = activeSlot?.answers || {};
    const total = Object.values(answers);
    return {
      totalAnswered: total.length,
      correct: total.filter(a => a.status === 'correct').length,
      wrong: total.filter(a => a.status === 'wrong').length,
      reviewed: total.filter(a => a.status === 'reviewed').length,
    };
  }, [activeSlot]);

  return {
    slots: state.slots,
    activeSlotId: state.activeSlotId,
    activeSlot,
    createSlot,
    deleteSlot,
    renameSlot,
    activateSlot,
    saveAnswer,
    saveSection,
    getAnswerForQuestion,
    getAllAnswers,
    getProgressStats,
  };
}
