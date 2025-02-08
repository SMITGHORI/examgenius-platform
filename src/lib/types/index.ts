// Auth Types
export interface User {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

// Exam Types
export interface Exam {
  id: string;
  title: string;
  description?: string;
  duration: number;
  total_marks: number;
  pdf_id?: string;
  created_by: string;
  status: 'draft' | 'published';
  subject?: string;
  created_at: string;
  updated_at: string;
  attempts_count?: number | null;
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  marks: number;
  explanation?: string | null;
  page_number?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ExamData {
  id?: string;
  title: string;
  description?: string;
  duration: number;
  total_marks: number;
  subject?: string;
  pdf_id?: string;
  negative_marks?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questions?: ExamQuestion[];
  numberOfQuestions?: number;
  marks_per_question?: number;
}

export interface ExamQuestion extends Question {
  userAnswer?: string;
}

export interface PDFUploadProps {
  onUploadComplete: (uploadedPdfId: string) => void;
}

export interface CreateExamProps {
  onConfigComplete: (data: ExamData) => void;
  pdfId: string;
}

// Add formatDate utility function
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Route Constants
export const ROUTES = {
  HOME: "/",
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  CREATE_EXAM: "/create",
  TAKE_EXAM: "/take-exam",
  MY_EXAMS: "/my-exams",
  PROFILE: "/profile",
  RESULTS: "/results",
  UPLOAD_PDF: "/upload-pdf"
} as const;

export interface FileInputProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}
