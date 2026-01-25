// Governorates - Fixed 11 names exactly as specified
export const GOVERNORATES = [
  { id: '1', name: 'مسقط' },
  { id: '2', name: 'ظفار' },
  { id: '3', name: 'مسندم' },
  { id: '4', name: 'البريمي' },
  { id: '5', name: 'الداخلية' },
  { id: '6', name: 'شمال الباطنة' },
  { id: '7', name: 'جنوب الباطنة' },
  { id: '8', name: 'جنوب الشرقية' },
  { id: '9', name: 'شمال الشرقية' },
  { id: '10', name: 'الظاهرة' },
  { id: '11', name: 'الوسطى' },
];

// Roles
export const ROLES = {
  SPECIALIST: 'الأخصائي',
  SUPERVISOR: 'المشرف',
};

// Case Statuses
export const CASE_STATUS = {
  PENDING_EVALUATION: 'قيد التقييم',
  EVALUATED: 'تم التقييم',
  COMPLETED: 'مكتمل',
  INCOMPLETE: 'ناقص',
  PENDING_APPROVAL: 'بانتظار اعتماد المشرف',
};

// Gender
export const GENDER = {
  MALE: 'ذكر',
  FEMALE: 'أنثى',
};

// Referral Sources
export const REFERRAL_SOURCES = [
  'المدارس',
  'دائرة الأشراف التربوي',
  'شؤون الطلبة',
  'دائرة التوجيه المهني والإرشاد الطلابي',
];

// Disability Types
export const DISABILITY_TYPES = [
  'اضطراب التوحد',
  'إعاقة سمعية',
  'إعاقة بصرية',
  'إعاقة ذهنية',
  'متلازمة داون',
  'أخرى',
];

// Education Stages
export const EDUCATION_STAGES = [
  { label: '(1-4)', name: 'المرحلة الابتدائية المبكرة' },
  { label: '(5-9)', name: 'المرحلة الابتدائية المتوسطة' },
  { label: '(10-12)', name: 'المرحلة الثانوية' },
];

// School Types
export const SCHOOL_TYPES = {
  PUBLIC: 'مدارس حكومية',
  PRIVATE: 'مدارس خاصة',
};

// Audit Decisions
export const AUDIT_DECISIONS = {
  APPROVED: 'معتمد',
  REJECTED: 'مرفوض',
  NEEDS_REVISION: 'يحتاج تعديل',
};

// Storage Keys
export const STORAGE_KEYS = {
  USERS: 'mallaa_users',
  CASES: 'mallaa_cases',
  EVALUATIONS: 'mallaa_evaluations',
  AUDITS: 'mallaa_audits',
  ACTIVITIES: 'mallaa_activities',
  CURRENT_USER: 'mallaa_current_user',
  NOTIFICATIONS: 'mallaa_notifications',
  INITIALIZED: 'mallaa_initialized',
};

// Chart Colors
export const CHART_COLORS = {
  blue: '#3B82F6',
  green: '#22C55E',
  yellow: '#F59E0B',
  orange: '#F97316',
  red: '#EF4444',
  purple: '#8B5CF6',
  teal: '#14B8A6',
  pink: '#EC4899',
  indigo: '#6366F1',
  gray: '#6B7280',
};

// Governance KPIs (8 axes)
export const GOVERNANCE_AXES = [
  'جودة التشخيص',
  'دقة التوصيات',
  'سرعة الإنجاز',
  'اكتمال المستندات',
  'رضا المستفيدين',
  'التدريب والتطوير',
  'الالتزام بالمعايير',
  'جودة التقارير',
];
