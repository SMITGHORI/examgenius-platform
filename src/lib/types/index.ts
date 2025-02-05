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
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  marks: number;
  explanation?: string;
  page_number?: number;
  created_at: string;
  updated_at: string;
}

export interface ExamQuestion extends Question {
  userAnswer?: string;
}

export interface Submission {
  id: string;
  exam_id: string;
  user_id: string;
  score: number;
  responses: any[];
  submitted_at: string;
  created_at: string;
  updated_at: string;
  exam?: {
    title: string;
    total_marks: number;
  };
}

// PDF Types
export interface PDF {
  id: string;
  title: string;
  file_name: string;
  storage_path: string;
  size: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

// Component Props Types
export interface CreateExamProps {
  onConfigComplete: (data: ExamData) => void;
  pdfId: string;
}

export interface PDFUploadProps {
  onUploadComplete: (uploadedPdfId: string) => void;
}

export interface ExamData {
  id?: string;
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  subject?: string;
  questions?: Question[];
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