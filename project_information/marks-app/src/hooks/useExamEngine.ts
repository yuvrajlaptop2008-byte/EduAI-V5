import { useState, useEffect, useCallback, useMemo } from "react";
import { Question, QuestionPaletteStatus } from "../types/exam";

interface UseExamEngineProps {
  testId: string;
  durationMinutes: number;
  questions: Question[];
  onAutoSubmit: (answers: Record<string, string | null>) => void;
}

export function useExamEngine({
  testId,
  durationMinutes,
  questions,
  onAutoSubmit,
}: UseExamEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({ "0": true });
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);

  const currentQuestion = questions[currentIndex];

  // Load from localStorage cache if available
  useEffect(() => {
    const cached = localStorage.getItem(`exam_${testId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.marked) setMarkedForReview(parsed.marked);
        if (parsed.visited) setVisited(parsed.visited);
      } catch (e) {
        console.warn("Failed to parse cached exam state", e);
      }
    }
  }, [testId]);

  // Synchronized countdown timer
  useEffect(() => {
    if (secondsRemaining <= 0) {
      onAutoSubmit(answers);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onAutoSubmit(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, answers, onAutoSubmit]);

  // Auto-save to localStorage
  const persistState = useCallback(() => {
    localStorage.setItem(
      `exam_${testId}`,
      JSON.stringify({ answers, marked: markedForReview, visited })
    );
  }, [testId, answers, markedForReview, visited]);

  useEffect(() => {
    persistState();
  }, [persistState]);

  // Actions
  const selectOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [String(currentQuestion.id)]: String(optionIndex) }));
  };

  const clearResponse = () => {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[String(currentQuestion.id)];
      return copy;
    });
  };

  const toggleMarkForReview = () => {
    if (!currentQuestion) return;
    const qId = String(currentQuestion.id);
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const navigateToQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    setCurrentIndex(index);
    setVisited((prev) => ({ ...prev, [String(index)]: true }));
  };

  // Compute question status for palette
  const getQuestionStatus = useCallback(
    (index: number): QuestionPaletteStatus => {
      const q = questions[index];
      if (!q) return "not_visited";
      const qId = String(q.id);
      const isAnswered = answers[qId] !== undefined && answers[qId] !== null;
      const isMarked = !!markedForReview[qId];
      const isVisited = !!visited[String(index)];

      if (isAnswered && isMarked) return "ans_marked_review";
      if (isMarked) return "marked_review";
      if (isAnswered) return "answered";
      if (isVisited) return "not_answered";
      return "not_visited";
    },
    [questions, answers, markedForReview, visited]
  );

  return {
    currentIndex,
    currentQuestion,
    answers,
    secondsRemaining,
    selectOption,
    clearResponse,
    toggleMarkForReview,
    navigateToQuestion,
    getQuestionStatus,
  };
}
