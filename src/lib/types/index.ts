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
  subject: string;
  duration: number;
  total_marks: number;
  negative_marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  created_by: string;
  pdf_id: string;
  status: 'draft' | 'published';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  text: string;
  options: string[];
  correct_answer: number;
  marks: number;
  created_at: string;
  updated_at: string;
}

export interface ExamResponse {
  id: string;
  exam_id: string;
  user_id: string;
  responses: { [key: string]: number };
  total_marks: number;
  submitted_at: string;
  created_at: string;
  updated_at: string;
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
export interface LayoutProps {
  children: React.ReactNode;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export interface CardProps {
  className?: string;
  children: React.ReactNode;
}
