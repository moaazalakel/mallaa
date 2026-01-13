// Using timestamp-based IDs instead of uuid for simplicity
import { GOVERNORATES, ROLES, CASE_STATUS, GENDER, REFERRAL_SOURCES, DISABILITY_TYPES, SCHOOL_TYPES, AUDIT_DECISIONS } from './constants';
import { usersStorage, casesStorage, evaluationsStorage, auditsStorage, activitiesStorage } from './storage';
import { subMonths } from 'date-fns';

// Arabic names for realistic data
const ARABIC_FIRST_NAMES = [
  'محمد', 'أحمد', 'علي', 'خالد', 'سالم', 'حمد', 'ناصر', 'سعيد', 'عبدالله', 'محمود',
  'فاطمة', 'عائشة', 'مريم', 'خديجة', 'زينب', 'أسماء', 'سارة', 'نور', 'ليلى', 'ريم'
];

const ARABIC_LAST_NAMES = [
  'السعيدي', 'البوسعيدي', 'البلوشي', 'الخروصي', 'العبري', 'الغافري', 'المسكري', 'السناني', 'الراشدي', 'الخالدي',
  'المنذري', 'الطائي', 'الشامسي', 'الحارثي', 'الزعابي', 'الرواحي', 'الغيلاني', 'المعولي', 'الخنجري', 'السلطي'
];

// Generate random Arabic name
const generateArabicName = () => {
  const firstName = ARABIC_FIRST_NAMES[Math.floor(Math.random() * ARABIC_FIRST_NAMES.length)];
  const lastName = ARABIC_LAST_NAMES[Math.floor(Math.random() * ARABIC_LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
};

// Generate random date within range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate random number in range
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate users (11 specialists + 1 supervisor)
export const generateUsers = () => {
  const users = [];
  
  // Generate 11 specialists (one per governorate)
  GOVERNORATES.forEach((gov, index) => {
    users.push({
      id: `user_${index + 1}`,
      username: `specialist_${gov.name.toLowerCase().replace(/\s+/g, '_')}`,
      password: '123456',
      role: ROLES.SPECIALIST,
      governorateId: gov.id,
      name: generateArabicName(),
      email: `specialist.${gov.name.toLowerCase().replace(/\s+/g, '_')}@moe.om`,
    });
  });

  // Generate 1 supervisor
  users.push({
    id: 'user_supervisor',
    username: 'supervisor',
    password: '123456',
    role: ROLES.SUPERVISOR,
    governorateId: null,
    name: 'المشرف العام',
    email: 'supervisor@moe.om',
  });

  return users;
};

// Generate cases
export const generateCases = (users) => {
  const cases = [];
  const specialists = users.filter((u) => u.role === ROLES.SPECIALIST);
  const now = new Date();
  
  // Generate more cases with richer variation
  const TOTAL_CASES = 240;
  for (let i = 0; i < TOTAL_CASES; i++) {
    const specialist = specialists[Math.floor(Math.random() * specialists.length)];
    
    // Force ages to be consistent across dashboards: 1–12 فقط (إزالة 13–18)
    // Weighted distribution to ensure presence of (1-4)
    const bucketRand = Math.random();
    let age;
    if (bucketRand < 0.28) age = randomInt(1, 4);
    else if (bucketRand < 0.82) age = randomInt(5, 9);
    else age = randomInt(10, 12);

    const birthYear = now.getFullYear() - age;
    const birthDate = randomDate(new Date(birthYear, 0, 1), new Date(birthYear, 11, 31));

    const diagnosisDate = randomDate(subMonths(now, 12), now);
    const createdAt = randomDate(subMonths(now, 12), now);
    
    // Status distribution with more realistic variation
    const statusRand = Math.random();
    let status;
    if (statusRand < 0.46) {
      status = CASE_STATUS.COMPLETED;
    } else if (statusRand < 0.66) {
      status = CASE_STATUS.PENDING_EVALUATION;
    } else if (statusRand < 0.86) {
      status = CASE_STATUS.PENDING_APPROVAL;
    } else if (statusRand < 0.94) {
      status = CASE_STATUS.EVALUATED;
    } else {
      status = CASE_STATUS.INCOMPLETE;
    }

    const gender = Math.random() > 0.5 ? GENDER.MALE : GENDER.FEMALE;
    const disabilityType =
      status === CASE_STATUS.PENDING_EVALUATION
        ? (Math.random() > 0.65 ? 'غير مصنف' : DISABILITY_TYPES[Math.floor(Math.random() * DISABILITY_TYPES.length)])
        : DISABILITY_TYPES[Math.floor(Math.random() * DISABILITY_TYPES.length)];
    const referralSource = REFERRAL_SOURCES[Math.floor(Math.random() * REFERRAL_SOURCES.length)];
    const schoolType = Math.random() > 0.7 ? SCHOOL_TYPES.PRIVATE : SCHOOL_TYPES.PUBLIC;
    const attachmentsCount =
      status === CASE_STATUS.COMPLETED ? randomInt(6, 7)
      : status === CASE_STATUS.PENDING_APPROVAL ? randomInt(5, 7)
      : status === CASE_STATUS.EVALUATED ? randomInt(4, 7)
      : status === CASE_STATUS.INCOMPLETE ? randomInt(1, 4)
      : randomInt(2, 6);

    cases.push({
      id: `case_${i + 1}`,
      studentName: generateArabicName(),
      gender,
      birthDate: birthDate.toISOString().split('T')[0],
      governorateId: specialist.governorateId,
      diagnosisDate: diagnosisDate.toISOString().split('T')[0],
      civilNumber: `9${randomInt(10000000, 99999999)}`,
      correspondenceNumber: `CORR-${randomInt(1000, 9999)}`,
      school: `مدرسة ${ARABIC_LAST_NAMES[Math.floor(Math.random() * ARABIC_LAST_NAMES.length)]}`,
      caseDescription: `حالة طالب يعاني من ${disabilityType}، يحتاج إلى تقييم شامل ومتابعة مستمرة.`,
      referralSource,
      recommendations: `- وضع خطة تعليمية فردية (IEP)\n- توفير دعم إضافي في الفصل\n- جلسات علاجية أسبوعية\n- متابعة دورية مع ولي الأمر`,
      attachments: {
        count: attachmentsCount,
        required: 7,
      },
      status,
      disabilityType,
      schoolType,
      age,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    });
  }

  return cases;
};

// Generate evaluations
export const generateEvaluations = (cases, users) => {
  const evaluations = [];
  const casesNeedingEvaluation = cases.filter((c) =>
    [CASE_STATUS.COMPLETED, CASE_STATUS.PENDING_APPROVAL, CASE_STATUS.EVALUATED].includes(c.status)
  );
  const specialists = users.filter((u) => u.role === ROLES.SPECIALIST);
  
  // Generate evaluations for cases that reached evaluation stage
  casesNeedingEvaluation.forEach((caseItem) => {
    const evaluationDate = randomDate(new Date(caseItem.createdAt), new Date());
    const specialist = specialists.find((s) => s.governorateId === caseItem.governorateId);

    const needsSessionsProb =
      ['اضطراب التوحد', 'إعاقة ذهنية', 'شلل دماغي', 'متلازمة داون'].includes(caseItem.disabilityType) ? 0.78 : 0.42;
    const needsIndividualSessions = Math.random() < needsSessionsProb ? 'نعم' : 'لا';
    
    evaluations.push({
      id: `eval_${caseItem.id}`,
      caseId: caseItem.id,
      evaluatorName: specialist?.name || generateArabicName(),
      evaluationDate: evaluationDate.toISOString().split('T')[0],
      learningDifficultiesAnswers: {
        reading1: Math.random() > 0.35 ? 'نعم' : 'لا',
        reading2: Math.random() > 0.35 ? 'نعم' : 'لا',
        writing1: Math.random() > 0.35 ? 'نعم' : 'لا',
        writing2: Math.random() > 0.35 ? 'نعم' : 'لا',
        attention1: Math.random() > 0.35 ? 'نعم' : 'لا',
        attention2: Math.random() > 0.35 ? 'نعم' : 'لا',
        attention3: Math.random() > 0.35 ? 'نعم' : 'لا',
      },
      sensoryProcessingAnswers: {
        texture: Math.random() > 0.5 ? 'نعم' : 'لا',
        sounds: Math.random() > 0.5 ? 'نعم' : 'لا',
        lights: Math.random() > 0.5 ? 'نعم' : 'لا',
        movement: Math.random() > 0.5 ? 'نعم' : 'لا',
        activities: Math.random() > 0.5 ? 'نعم' : 'لا',
        smells: Math.random() > 0.5 ? 'نعم' : 'لا',
      },
      adaptiveBehaviorAnswers: {
        phone: Math.random() > 0.4 ? 'نعم' : 'لا',
        selfCare: Math.random() > 0.3 ? 'نعم' : 'لا',
        social: Math.random() > 0.4 ? 'نعم' : 'لا',
        imitation: Math.random() > 0.3 ? 'نعم' : 'لا',
      },
      autismScaleAnswers: {
        eyeContact: ['ولا مرة', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'][randomInt(0, 4)],
        isolation: ['ولا مرة', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'][randomInt(0, 4)],
        observation: ['ولا مرة', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'][randomInt(0, 4)],
      },
      finalDiagnosis: `تشخيص: ${caseItem.disabilityType} - يحتاج إلى برنامج تعليمي متخصص مع دعم إضافي.`,
      needsIndividualSessions,
      diagnosisNotes:
        needsIndividualSessions === 'نعم'
          ? 'تم إجراء التقييم الشامل. النتائج تشير إلى الحاجة لخطة تدخل ودعم متخصص.'
          : 'تم إجراء التقييم الشامل. النتائج تشير إلى إمكانية المتابعة ضمن التعليم الأساسي مع دعم غير مباشر.',
      createdAt: evaluationDate.toISOString(),
    });
  });

  return evaluations;
};

// Generate audits
export const generateAudits = (cases, users) => {
  const audits = [];
  const pendingApprovalCases = cases.filter((c) => c.status === CASE_STATUS.PENDING_APPROVAL);
  const completedOrEvaluated = cases.filter((c) => [CASE_STATUS.COMPLETED, CASE_STATUS.EVALUATED].includes(c.status));
  const specialists = users.filter((u) => u.role === ROLES.SPECIALIST);
  
  // Generate audits for pending approval cases
  pendingApprovalCases.forEach((caseItem) => {
    // Not every pending case has an audit yet (to show "بانتظار التدقيق")
    if (Math.random() > 0.65) return;
    const specialist = specialists.find((s) => s.governorateId === caseItem.governorateId);
    if (!specialist) return;
    
    const submittedAt = randomDate(new Date(caseItem.createdAt), new Date());
    const decisionRand = Math.random();
    let finalDecision;
    if (decisionRand < 0.7) {
      finalDecision = AUDIT_DECISIONS.APPROVED;
    } else if (decisionRand < 0.9) {
      finalDecision = AUDIT_DECISIONS.NEEDS_REVISION;
    } else {
      finalDecision = AUDIT_DECISIONS.REJECTED;
    }

    audits.push({
      id: `audit_${caseItem.id}`,
      caseId: caseItem.id,
      specialistId: specialist.id,
      documentCompletenessScore: randomInt(70, 100),
      diagnosticQualityScore: randomInt(75, 100),
      complianceScore: randomInt(80, 100),
      supervisorNotes: finalDecision === AUDIT_DECISIONS.APPROVED
        ? 'التشخيص دقيق والوثائق مكتملة. موافقة نهائية.'
        : finalDecision === AUDIT_DECISIONS.NEEDS_REVISION
        ? 'يحتاج إلى مراجعة بعض النقاط في التقرير قبل الاعتماد.'
        : 'التشخيص غير مكتمل ويحتاج إلى إعادة التقييم.',
      finalDecision,
      submittedAt: submittedAt.toISOString(),
    });
  });

  // Add some historical audits for completed/evaluated cases (to enrich dashboards)
  completedOrEvaluated.forEach((caseItem) => {
    if (Math.random() > 0.35) return;
    const specialist = specialists.find((s) => s.governorateId === caseItem.governorateId);
    if (!specialist) return;
    const submittedAt = randomDate(new Date(caseItem.createdAt), new Date());
    const decisionRand = Math.random();
    const finalDecision =
      decisionRand < 0.78 ? AUDIT_DECISIONS.APPROVED : decisionRand < 0.9 ? AUDIT_DECISIONS.NEEDS_REVISION : AUDIT_DECISIONS.REJECTED;
    audits.push({
      id: `audit_hist_${caseItem.id}`,
      caseId: caseItem.id,
      specialistId: specialist.id,
      documentCompletenessScore: randomInt(70, 100),
      diagnosticQualityScore: randomInt(70, 100),
      complianceScore: randomInt(75, 100),
      supervisorNotes: 'تدقيق تاريخي لأغراض العرض التجريبي.',
      finalDecision,
      submittedAt: submittedAt.toISOString(),
    });
  });

  return audits;
};

// Generate activities
export const generateActivities = (users) => {
  const activities = [];
  const specialists = users.filter((u) => u.role === ROLES.SPECIALIST);
  const supervisor = users.find((u) => u.role === ROLES.SUPERVISOR);
  const now = new Date();
  
  const activityTitles = [
    'ورشة تدريبية حول استخدام المقاييس التشخيصية',
    'اجتماع فريق التشخيص الشهري',
    'مراجعة الحالات المعلقة',
    'تدريب على برنامج IEP',
    'ورشة حول التعامل مع حالات التوحد',
    'اجتماع مع أولياء الأمور',
    'تقييم أداء الفريق',
    'مراجعة التقارير الشهرية',
  ];

  const activityDescriptions = [
    'تم عقد ورشة تدريبية شاملة حول استخدام المقاييس التشخيصية المعتمدة.',
    'اجتماع دوري لفريق التشخيص لمناقشة الحالات الجديدة والمتابعة.',
    'مراجعة شاملة للحالات المعلقة ووضع خطط المتابعة.',
    'تدريب عملي على إعداد وتنفيذ برامج التعليم الفردي.',
    'ورشة متخصصة حول أفضل الممارسات في التعامل مع حالات اضطراب التوحد.',
    'اجتماع تنسيقي مع أولياء الأمور لمناقشة التقدم والتوصيات.',
    'تقييم شامل لأداء فريق التشخيص وتحديد نقاط القوة والتحسين.',
    'مراجعة وتحليل التقارير الشهرية ووضع التوصيات.',
  ];

  // Generate more activities over 12 months (with some created by supervisor)
  const TOTAL_ACTIVITIES = 140;
  for (let i = 0; i < TOTAL_ACTIVITIES; i++) {
    const creatorIsSupervisor = supervisor && Math.random() < 0.18;
    const specialist = specialists[Math.floor(Math.random() * specialists.length)];
    const activityDate = randomDate(subMonths(now, 6), now);
    const titleIndex = Math.floor(Math.random() * activityTitles.length);

    activities.push({
      id: `activity_${i + 1}`,
      governorateId: specialist.governorateId,
      createdByUserId: creatorIsSupervisor ? supervisor.id : specialist.id,
      role: creatorIsSupervisor ? supervisor.role : specialist.role,
      activityDate: activityDate.toISOString().split('T')[0],
      title: activityTitles[titleIndex],
      description: activityDescriptions[titleIndex],
      createdAt: activityDate.toISOString(),
      updatedAt: activityDate.toISOString(),
    });
  }

  return activities;
};

// Force reset function - call this to regenerate data
export const resetData = () => {
  localStorage.removeItem('mallaa_initialized');
  localStorage.removeItem('mallaa_users');
  localStorage.removeItem('mallaa_cases');
  localStorage.removeItem('mallaa_evaluations');
  localStorage.removeItem('mallaa_audits');
  localStorage.removeItem('mallaa_activities');
  localStorage.removeItem('mallaa_notifications');
  localStorage.removeItem('mallaa_current_user');
  console.log('Data cleared, reloading...');
  window.location.reload();
};

// Main seed function
export const seedData = () => {
  // Check if already initialized
  const initialized = localStorage.getItem('mallaa_initialized');
  
  // Check if data version matches (to force re-seed when structure changes)
  const dataVersion = localStorage.getItem('mallaa_data_version');
  const currentVersion = '2.2'; // Incremented to force re-seed for consistent demo dataset
  
  if (initialized === 'true' && dataVersion === currentVersion) {
    return; // Already seeded with current version
  }
  
  // Clear old data if version mismatch
  if (dataVersion !== currentVersion) {
    localStorage.removeItem('mallaa_users');
    localStorage.removeItem('mallaa_cases');
    localStorage.removeItem('mallaa_evaluations');
    localStorage.removeItem('mallaa_audits');
    localStorage.removeItem('mallaa_activities');
    localStorage.removeItem('mallaa_notifications');
  }

  console.log('Seeding data...');

  // Generate and save users
  const users = generateUsers();
  usersStorage.save(users);
  console.log(`Generated ${users.length} users`);

  // Generate and save cases
  const cases = generateCases(users);
  casesStorage.save(cases);
  console.log(`Generated ${cases.length} cases`);

  // Generate and save evaluations
  const evaluations = generateEvaluations(cases, users);
  evaluationsStorage.save(evaluations);
  console.log(`Generated ${evaluations.length} evaluations`);

  // Generate and save audits
  const audits = generateAudits(cases, users);
  auditsStorage.save(audits);
  console.log(`Generated ${audits.length} audits`);

  // Generate and save activities
  const activities = generateActivities(users);
  activitiesStorage.save(activities);
  console.log(`Generated ${activities.length} activities`);

  // Mark as initialized with version
  localStorage.setItem('mallaa_initialized', 'true');
  localStorage.setItem('mallaa_data_version', currentVersion);
  console.log('Data seeding completed!');
};

// Expose reset function globally for debugging
if (typeof window !== 'undefined') {
  window.resetMallaaData = resetData;
}
