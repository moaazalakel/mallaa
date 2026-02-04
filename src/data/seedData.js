// Using timestamp-based IDs instead of uuid for simplicity
import { GOVERNORATES, ROLES, CASE_STATUS, GENDER, SCHOOL_TYPES, INCLUSION_TYPES } from './constants';
import { usersStorage, casesStorage, auditsStorage, activitiesStorage } from './storage';
import { subMonths } from 'date-fns';

// Deterministic seeded RNG so demo data is stable and "connected"
const hashString = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const mulberry32 = (a) => {
  return () => {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const makeRng = (seed) => mulberry32(hashString(seed));

const randomInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
const pickOne = (rng, list) => list[Math.floor(rng() * list.length)];
const weightedPick = (rng, options) => {
  // options: [{ value, weight }]
  const total = options.reduce((sum, o) => sum + (o.weight || 0), 0);
  if (total <= 0) return options[0]?.value;
  let r = rng() * total;
  for (const o of options) {
    r -= o.weight || 0;
    if (r <= 0) return o.value;
  }
  return options[options.length - 1]?.value;
};

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

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
const generateArabicName = (rng) => {
  const firstName = pickOne(rng, ARABIC_FIRST_NAMES);
  const lastName = pickOne(rng, ARABIC_LAST_NAMES);
  return `${firstName} ${lastName}`;
};

// Generate deterministic date within range (bias can skew towards recent)
const randomDate = (rng, start, end, biasToRecent = 1) => {
  const span = end.getTime() - start.getTime();
  if (span <= 0) return new Date(start);
  // biasToRecent > 1 biases towards end; 1 is uniform
  const r = Math.pow(rng(), 1 / Math.max(1, biasToRecent));
  return new Date(start.getTime() + r * span);
};

// Generate users (11 specialists + 1 supervisor)
export const generateUsers = (rng = makeRng('mallaa|users')) => {
  const users = [];

  // Generate 11 specialists (one per governorate)
  GOVERNORATES.forEach((gov, index) => {
    users.push({
      id: `user_${index + 1}`,
      username: `specialist_${gov.name.toLowerCase().replace(/\s+/g, '_')}`,
      password: '123456',
      role: ROLES.SPECIALIST,
      governorateId: gov.id,
      name: generateArabicName(rng),
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
    name: 'المراجع المركزي',
    email: 'supervisor@moe.om',
  });

  // Generate 1 section head (المسؤول المركزي المباشر)
  users.push({
    id: 'user_section_head',
    username: 'section_head',
    password: '123456',
    role: ROLES.SECTION_HEAD,
    governorateId: null,
    name: 'رئيس القسم',
    email: 'section.head@moe.om',
  });

  return users;
};

// Generate cases
export const generateCases = (users, rng = makeRng('mallaa|cases')) => {
  const cases = [];
  const specialists = users.filter((u) => u.role === ROLES.SPECIALIST);
  const now = new Date();

  // Representative, connected data model:
  // - Each governorate has a deterministic number of cases
  // - Completion rates vary by governorate to create meaningful rankings
  // NOTE: array order matches GOVERNORATES order in constants.
  const casesPerGovernorate = [32, 28, 26, 24, 22, 20, 20, 18, 18, 16, 16]; // total 240
  const completionRatePerGovernorate = [88, 85, 82, 80, 78, 76, 75, 73, 72, 70, 68];

  const baseStart = subMonths(now, 12);
  let caseCounter = 1;

  GOVERNORATES.forEach((gov, idx) => {
    const specialist = specialists.find((s) => s.governorateId === gov.id);
    if (!specialist) return;
    const count = casesPerGovernorate[idx] ?? 18;
    const completionRate = completionRatePerGovernorate[idx] ?? 75;

    // Force ages to be consistent across dashboards: 1–12 فقط (إزالة 13–18)
    // Weighted distribution to ensure presence of (1-4)
    for (let i = 0; i < count; i += 1) {
      const ageBucket = weightedPick(rng, [
        { value: '1-4', weight: 28 },
        { value: '5-9', weight: 54 },
        { value: '10-12', weight: 18 },
      ]);
      const age =
        ageBucket === '1-4'
          ? randomInt(rng, 1, 4)
          : ageBucket === '5-9'
          ? randomInt(rng, 5, 9)
          : randomInt(rng, 10, 12);

      const birthYear = now.getFullYear() - age;
      const birthDate = randomDate(rng, new Date(birthYear, 0, 1), new Date(birthYear, 11, 31), 1);

      // Bias createdAt towards recent so "آخر 6 أشهر" charts look meaningful
      const createdAt = randomDate(rng, baseStart, now, 2.2);

      // diagnosisDate after createdAt (report cycle), correlated with completion
      const isCompleted = rng() * 100 < completionRate;
      const status = isCompleted ? CASE_STATUS.COMPLETED : CASE_STATUS.INCOMPLETE;
      const cycleDays = isCompleted ? randomInt(rng, 7, 28) : randomInt(rng, 18, 45);
      const diagnosisDate = new Date(createdAt.getTime() + cycleDays * 24 * 60 * 60 * 1000);

      const gender = rng() < 0.54 ? GENDER.MALE : GENDER.FEMALE;
      const disabilityType = weightedPick(rng, [
        { value: 'اضطراب التوحد', weight: 28 },
        { value: 'إعاقة ذهنية', weight: 20 },
        { value: 'إعاقة سمعية', weight: 16 },
        { value: 'متلازمة داون', weight: 14 },
        { value: 'إعاقة بصرية', weight: 10 },
        { value: 'أخرى', weight: 12 },
      ]);

      const referralSource = weightedPick(rng, [
        { value: 'المدارس', weight: 42 },
        { value: 'خدمة المراجعين', weight: 18 },
        { value: 'دائرة الإشراف التربوي', weight: 16 },
        { value: 'دائرة التوجيه والإرشاد الطلابي', weight: 14 },
        { value: 'مراكز التأهيل', weight: 10 },
      ]);

      const schoolType = rng() < 0.78 ? SCHOOL_TYPES.PUBLIC : SCHOOL_TYPES.PRIVATE;
      const educationProgram = weightedPick(rng, [
        { value: 'التعليم الأساسي', weight: 52 },
        { value: 'التربية الخاصة', weight: 26 },
        { value: 'البرنامج الفكري', weight: 14 },
        { value: 'البرنامج السمعي', weight: 8 },
      ]);

      const inclusionType = rng() < 0.6 ? INCLUSION_TYPES[0] : INCLUSION_TYPES[1]; // كلي أكثر قليلاً
      const attachmentsCount = status === CASE_STATUS.COMPLETED ? randomInt(rng, 5, 7) : randomInt(rng, 1, 4);

      cases.push({
        id: `case_${caseCounter++}`,
        studentName: generateArabicName(rng),
        gender,
        birthDate: birthDate.toISOString().split('T')[0],
        governorateId: specialist.governorateId,
        diagnosisDate: diagnosisDate.toISOString().split('T')[0],
        civilNumber: `9${randomInt(rng, 10000000, 99999999)}`,
        correspondenceNumber: `CORR-${randomInt(rng, 1000, 9999)}`,
        school: `مدرسة ${pickOne(rng, ARABIC_LAST_NAMES)}`,
        caseDescription: `حالة طالب يعاني من ${disabilityType}، يحتاج إلى تقييم شامل ومتابعة مستمرة.`,
        referralSource,
        educationProgram,
        inclusionType,
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
  });

  return cases;
};

// Generate audits
export const generateAudits = (cases, users, rng = makeRng('mallaa|audits')) => {
  const audits = [];
  const completedCases = cases.filter((c) => c.status === CASE_STATUS.COMPLETED);
  const specialists = users.filter((u) => u.role === ROLES.SPECIALIST);
  const supervisor = users.find((u) => u.role === ROLES.SUPERVISOR);
  const sectionHead = users.find((u) => u.role === ROLES.SECTION_HEAD);
  const now = new Date();

  const axisNoteSamples = [
    'تم تطبيق الإجراءات وفق الضوابط المعتمدة مع توثيق واضح.',
    'يوجد تحسن جيد، ويُنصح بتعزيز جانب التوثيق وتوضيح بعض النتائج.',
    'يحتاج إلى مزيد من الدقة في التحليل وربط النتائج بالأدلة.',
    'التوصيات مناسبة لمسار الطالب، مع ضرورة تدعيمها بأدلة أكثر.',
  ];

  completedCases.forEach((caseItem) => {
    // Not every case has a central review yet (to show "غير محددة")
    if (rng() > 0.62) return;

    const specialist = specialists.find((s) => s.governorateId === caseItem.governorateId);
    if (!specialist) return;

    const start = randomDate(rng, new Date(caseItem.createdAt), now, 1.4);
    const startDate = start.toISOString().split('T')[0];

    const statusRand = rng();
    // distribution: قيد المراجعة / مكتملة / تحتاج متابعة / غير محددة (but when audit exists, we'll use one of first three)
    const reviewStatus = statusRand < 0.45 ? 'قيد المراجعة' : statusRand < 0.82 ? 'مكتملة' : 'تحتاج متابعة';

    const makeAxisNotes = (complete) => {
      const pick = () => axisNoteSamples[randomInt(rng, 0, axisNoteSamples.length - 1)];
      return {
        axis1: complete ? pick() : '',
        axis2: complete ? pick() : '',
        axis3: complete ? pick() : '',
        axis4: complete ? pick() : '',
        axis5: complete ? pick() : '',
        axis6: complete ? pick() : '',
        axis7: complete ? pick() : '',
      };
    };

    const isComplete = reviewStatus === 'مكتملة';
    const professionalAxesNotes = makeAxisNotes(isComplete);
    const generalNotes = isComplete
      ? (rng() < 0.55
          ? 'تمت مراجعة الحالة وتوثيق الملاحظات بشكل موجز.'
          : 'تمت مراجعة الحالة وتوثيق جميع الملاحظات، مع توصيات داعمة للتحسين المستمر.')
      : reviewStatus === 'تحتاج متابعة'
      ? 'تم رصد نقاط تستدعي المتابعة بعد التعديل/التحديث.'
      : '';

    const closeDate =
      reviewStatus === 'مكتملة'
        ? randomDate(rng, start, now, 1.2).toISOString().split('T')[0]
        : '';

    // Scores used across dashboards/lists (connected to attachments + completion)
    const attachmentsCount = Number(caseItem.attachments?.count || 0);
    const baseDoc = clamp(60 + attachmentsCount * 5 + randomInt(rng, -6, 6));
    const baseDiag = clamp(62 + randomInt(rng, 10, 24));
    const baseCompliance = clamp(68 + randomInt(rng, 8, 22));

    const documentCompletenessScore = isComplete ? clamp(baseDoc + 10) : clamp(baseDoc - 8);
    const diagnosticQualityScore = isComplete ? clamp(baseDiag + 8) : clamp(baseDiag - 10);
    const complianceScore = isComplete ? clamp(baseCompliance + 6) : clamp(baseCompliance - 10);

    const finalDecision =
      reviewStatus === 'مكتملة'
        ? (rng() < 0.8 ? 'معتمد' : 'يحتاج تعديل')
        : reviewStatus === 'تحتاج متابعة'
        ? 'يحتاج تعديل'
        : 'يحتاج تعديل';

    const audit = {
      id: `audit_${caseItem.id}`,
      caseId: caseItem.id,
      governorateId: caseItem.governorateId,
      specialistUserId: specialist.id,
      // For backward/forward compatibility across pages that reference different keys:
      specialistId: specialist.id,
      centralReviewerUserId: supervisor?.id || null,
      centralReviewerName: supervisor?.name || 'المراجع المركزي',
      reviewStartDate: startDate,
      reviewCloseDate: closeDate,
      reviewStatus,
      generalNotes,
      professionalAxesNotes,
      documentCompletenessScore,
      diagnosticQualityScore,
      complianceScore,
      finalDecision,
      submittedAt: start.toISOString(),
    };

    // Add a subset of section-head evaluations for reviewer performance
    if (sectionHead && rng() < 0.5) {
      const reviewerPerfComplete = rng() < 0.7;
      audit.reviewerPerformance = {
        adherence: reviewerPerfComplete ? 'جيد' : 'مقبول',
        notesQuality: reviewerPerfComplete ? 'جيد' : '',
        timeliness: reviewerPerfComplete ? 'ممتاز' : '',
        professionalism: reviewerPerfComplete ? 'جيد' : 'مقبول',
        sectionHeadNotes: reviewerPerfComplete
          ? 'أداء المراجع متسق وجودة الملاحظات مناسبة.'
          : 'يوصى باستكمال عناصر التقييم وإضافة ملاحظات أكثر تفصيلاً.',
        evaluatedByUserId: sectionHead.id,
        evaluatedByName: sectionHead.name,
      };
    }

    // Create some follow-up records to test the workflow
    if (reviewStatus === 'تحتاج متابعة' && rng() < 0.65) {
      audit.followUp = {
        reason: 'تم تعديل بيانات الحالة بعد المراجعة، وتستلزم متابعة المراجعة المركزية.',
        updatedAt: randomDate(rng, start, now, 1.2).toISOString(),
        updatedByUserId: specialist.id,
        updatedByName: specialist.name,
      };
    }

    audits.push(audit);
  });

  return audits;
};

// Generate activities
export const generateActivities = (users, rng = makeRng('mallaa|activities')) => {
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

  // Representative and connected: activity counts correlate with case volumes per governorate
  // NOTE: array order matches GOVERNORATES order in constants.
  const activitiesPerGovernorate = [20, 18, 16, 15, 13, 12, 12, 10, 10, 9, 9]; // total 144
  let activityCounter = 1;

  GOVERNORATES.forEach((gov, idx) => {
    const specialist = specialists.find((s) => s.governorateId === gov.id);
    if (!specialist) return;
    const count = activitiesPerGovernorate[idx] ?? 10;

    for (let i = 0; i < count; i += 1) {
      const creatorIsSupervisor = Boolean(supervisor) && rng() < 0.22;
      const activityDate = randomDate(rng, subMonths(now, 6), now, 2.0);
      const titleIndex = randomInt(rng, 0, activityTitles.length - 1);

      activities.push({
        id: `activity_${activityCounter++}`,
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
  });

  return activities;
};

// Force reset function - call this to regenerate data
export const resetData = () => {
  localStorage.removeItem('mallaa_initialized');
  localStorage.removeItem('mallaa_users');
  localStorage.removeItem('mallaa_cases');
  localStorage.removeItem('mallaa_audits');
  localStorage.removeItem('mallaa_activities');
  localStorage.removeItem('mallaa_notifications');
  localStorage.removeItem('mallaa_reports');
  localStorage.removeItem('mallaa_current_user');
  localStorage.removeItem('mallaa_data_version');
  // Backward-compat cleanup (إصدارات قديمة)
  localStorage.removeItem('mallaa_evaluations');
  console.log('Data cleared, reloading...');
  window.location.reload();
};

// Main seed function
export const seedData = () => {
  // Check if already initialized
  const initialized = localStorage.getItem('mallaa_initialized');

  // Check if data version matches (to force re-seed when structure changes)
  const dataVersion = localStorage.getItem('mallaa_data_version');
  const currentVersion = '2.8'; // Representative, deterministic seed data connected across dashboards

  if (initialized === 'true' && dataVersion === currentVersion) {
    return; // Already seeded with current version
  }

  // Clear old data if version mismatch
  if (dataVersion !== currentVersion) {
    localStorage.removeItem('mallaa_users');
    localStorage.removeItem('mallaa_cases');
    localStorage.removeItem('mallaa_audits');
    localStorage.removeItem('mallaa_activities');
    localStorage.removeItem('mallaa_notifications');
    localStorage.removeItem('mallaa_reports');
    // Backward-compat cleanup (إصدارات قديمة)
    localStorage.removeItem('mallaa_evaluations');
  }

  console.log('Seeding data...');

  // Generate and save users
  const users = generateUsers(makeRng(`mallaa|users|${currentVersion}`));
  usersStorage.save(users);
  console.log(`Generated ${users.length} users`);

  // Generate and save cases
  const cases = generateCases(users, makeRng(`mallaa|cases|${currentVersion}`));
  casesStorage.save(cases);
  console.log(`Generated ${cases.length} cases`);

  // Generate and save audits
  const audits = generateAudits(cases, users, makeRng(`mallaa|audits|${currentVersion}`));
  auditsStorage.save(audits);
  console.log(`Generated ${audits.length} audits`);

  // Generate and save activities
  const activities = generateActivities(users, makeRng(`mallaa|activities|${currentVersion}`));
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
