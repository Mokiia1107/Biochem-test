// 题目类型枚举
export type QuestionType = 'choice' | 'definition' | 'essay';

// 答题状态
export type AnswerStatus = 'unanswered' | 'correct' | 'wrong' | 'reviewed';

// 选择题数据结构
export interface ChoiceQuestion {
  id: number;
  type: 'choice';
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  explanation: string;
  fromTest: string; // "试卷一" | "试卷二"
}

// 名词解释数据结构
export interface DefinitionQuestion {
  id: number;
  type: 'definition';
  term: string;
  answer: string;
  fromTest: string;
}

// 问答题数据结构
export interface EssayQuestion {
  id: number;
  type: 'essay';
  question: string;
  score: number;
  answer: string;
  fromTest: string;
}

export type Question = ChoiceQuestion | DefinitionQuestion | EssayQuestion;

// 用户答题记录
export interface UserAnswer {
  questionId: number;
  answer: string; // 选择题存选项索引，主观题存用户输入
  status: AnswerStatus;
  timestamp: number;
}

// 存档数据结构
export interface SaveSlot {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  answers: Record<number, UserAnswer>; // questionId -> UserAnswer
  currentSection: string;
}

// 存档管理器状态
export interface SaveManagerState {
  slots: SaveSlot[];
  activeSlotId: string | null;
}

// 页面路由
export type PageRoute = 'home' | 'choice' | 'definition' | 'essay' | 'stats' | 'saves';
