import { useState, useCallback } from 'react';
import type { UserAnswer, AnswerStatus } from '@/types';

export function useQuiz(
  saveAnswer: (qId: number, answer: UserAnswer) => void,
  getAnswer: (qId: number) => UserAnswer | undefined
) {
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  const handleChoiceAnswer = useCallback(
    (questionId: number, selectedOption: number, correctAnswer: number) => {
      const status: AnswerStatus = selectedOption === correctAnswer ? 'correct' : 'wrong';
      const answer: UserAnswer = {
        questionId,
        answer: selectedOption.toString(),
        status,
        timestamp: Date.now(),
      };
      saveAnswer(questionId, answer);
      setShowExplanation(prev => ({ ...prev, [questionId]: true }));
    },
    [saveAnswer]
  );

  const handleReview = useCallback(
    (questionId: number) => {
      const answer: UserAnswer = {
        questionId,
        answer: '',
        status: 'reviewed',
        timestamp: Date.now(),
      };
      saveAnswer(questionId, answer);
      setShowExplanation(prev => ({ ...prev, [questionId]: true }));
    },
    [saveAnswer]
  );

  const handleTextSubmit = useCallback(
    (questionId: number, userText: string) => {
      const status: AnswerStatus = userText.trim().length > 0 ? 'reviewed' : 'unanswered';
      const answer: UserAnswer = {
        questionId,
        answer: userText,
        status,
        timestamp: Date.now(),
      };
      saveAnswer(questionId, answer);
    },
    [saveAnswer]
  );

  const isExplanationVisible = useCallback(
    (questionId: number) => !!showExplanation[questionId],
    [showExplanation]
  );

  const getUserAnswer = useCallback(
    (questionId: number) => getAnswer(questionId),
    [getAnswer]
  );

  return {
    handleChoiceAnswer,
    handleReview,
    handleTextSubmit,
    isExplanationVisible,
    getUserAnswer,
    showExplanation,
  };
}
