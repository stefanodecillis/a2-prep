/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: string;
  category: 'Grammatica' | 'Vocabolario' | 'Lettura' | 'Situazioni' | 'Ascolto' | 'Immagini' | string;
  section: string; // e.g., 'Preposizioni', 'Passato Prossimo', 'Dialoghi'
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string; // Helpful explanation detailing grammatical rules
  difficulty: 'A2';
  context?: string; // Optional context, like reading passage or dialouge context
  imageUrl?: string; // Optional image associated with the question (e.g. nanobanana / scenic)
  optionImages?: string[]; // Optional array of images for options A, B, C (PLIDA-style drawings)
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
