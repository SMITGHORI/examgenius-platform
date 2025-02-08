
export const APP_NAME = 'ExamGenius';

export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/signin',
  SIGN_UP: '/signup',
  CREATE_EXAM: '/create',
  MY_EXAMS: '/my-exams',
  TAKE_EXAM: '/take-exam',
  PROFILE: '/profile',
  RESULTS: '/results',
  UPLOAD_PDF: '/upload'
} as const;

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'History',
  'Geography',
  'Economics',
  'Other',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const EXAM_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
} as const;
