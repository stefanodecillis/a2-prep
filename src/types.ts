/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PrefetturaSection = 'ascolto' | 'lettura' | 'scrittura';

export interface Question {
  id: string;
  category: 'Grammatica' | 'Vocabolario' | 'Lettura' | 'Situazioni' | 'Ascolto' | 'Immagini' | 'TempiVerbali' | string;
  section: string; // e.g., 'Preposizioni', 'Passato Prossimo', 'Dialoghi'; for TempiVerbali: '<tenseId>:<stepKind>'
  prefetturaSection?: PrefetturaSection; // bucket for the official Prefettura A2 simulation
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'A2';
  context?: string;
  imageUrl?: string;
  audioUrl?: string;
  optionImages?: string[];
  verbInfinitive?: string; // for TempiVerbali items: the infinitive the item is about (used for weak-verb tracking)
}

export interface QuizSession {
  id: string;
  mode: 'exam' | 'practice';
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<string, number>; // questionId -> selectedOptionIndex
  savedExplanations: Record<string, string>; // questionId -> AI explanation
  startTime: number;
  endTime?: number;
  isCompleted: boolean;
}

export interface CategoryStats {
  category: string;
  total: number;
  correct: number;
}

export interface StudyCard {
  id: string;
  title: string;
  grammarTopic: string;
  explanation: string;
  examples: {
    italian: string;
    english: string;
    explanation?: string;
  }[];
  tips: string[];
}
