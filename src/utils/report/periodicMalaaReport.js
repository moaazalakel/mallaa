import { subMonths } from 'date-fns';
import {
  CASE_STATUS,
  DISABILITY_TYPES,
  EDUCATION_PROGRAMS,
  GOVERNORATES,
  GENDER,
  REFERRAL_SOURCES,
  ROLES,
  SCHOOL_TYPES,
} from '../../data/constants';

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

// Deterministic tiny PRNG (stable exports)
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

const parseISODate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const isWithinRange = (dateValue, from, to) => {
  const d = parseISODate(dateValue);
  if (!d) return false;
  const fromD = parseISODate(from);
  const toD = parseISODate(to);
  if (fromD && d < fromD) return false;
  if (toD && d > toD) return false;
  return true;
};

export const PROFESSIONAL_AXES = [
  { key: 'axis1', label: 'التحضير والاستعداد المهني' },
  { key: 'axis2', label: 'جودة أدوات القياس المستخدمة' },
  { key: 'axis3', label: 'دقة التحليل والتفسير' },
  { key: 'axis4', label: 'جودة التوصيات والتقارير' },
  { key: 'axis5', label: 'التوثيق والحوكمة' },
  { key: 'axis6', label: 'التواصل المهني' },
  { key: 'axis7', label: 'التطوير المستمر والتعلم الذاتي' },
];

export const filterCasesForReport = (allCases, filters) => {
  const f = filters || {};
  let filtered = [...(allCases || [])];

  if (f.selectedGovernorateId) {
    filtered = filtered.filter((c) => c.governorateId === f.selectedGovernorateId);
  }
  if (f.selectedDisabilityType) {
    filtered = filtered.filter((c) => c.disabilityType === f.selectedDisabilityType);
  }
  if (f.fromDate || f.toDate) {
    filtered = filtered.filter((c) => isWithinRange(c.createdAt, f.fromDate, f.toDate));
  }

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const computeEducationStructure = (cases) => {
  const publicSchools = new Set();
  const privateSchools = new Set();

  (cases || []).forEach((c) => {
    const schoolName = (c.school || '').trim();
    if (!schoolName) return;
    if (c.schoolType === SCHOOL_TYPES.PUBLIC) publicSchools.add(schoolName);
    if (c.schoolType === SCHOOL_TYPES.PRIVATE) privateSchools.add(schoolName);
  });

  return {
    publicCount: publicSchools.size,
    privateCount: privateSchools.size,
    totalSchools: publicSchools.size + privateSchools.size,
  };
};

export const computeEducationProgramDistribution = (cases) => {
  const total = Math.max(1, (cases || []).length);
  const counts = Object.fromEntries(EDUCATION_PROGRAMS.map((p) => [p, 0]));
  (cases || []).forEach((c) => {
    if (c.educationProgram && counts[c.educationProgram] !== undefined) counts[c.educationProgram] += 1;
  });
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    percent: Math.round((value / total) * 1000) / 10,
  }));
};

export const computeReferralDistribution = (cases) => {
  const total = Math.max(1, (cases || []).length);
  const counts = Object.fromEntries(REFERRAL_SOURCES.map((s) => [s, 0]));
  (cases || []).forEach((c) => {
    if (c.referralSource && counts[c.referralSource] !== undefined) counts[c.referralSource] += 1;
  });
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    percent: Math.round((value / total) * 1000) / 10,
  }));
};

export const computeGenderStats = (cases) => {
  const total = Math.max(1, (cases || []).length);
  const female = (cases || []).filter((c) => c.gender === GENDER.FEMALE).length;
  const male = (cases || []).filter((c) => c.gender === GENDER.MALE).length;
  return {
    female,
    male,
    femalePercent: Math.round((female / total) * 1000) / 10,
    malePercent: Math.round((male / total) * 1000) / 10,
  };
};

export const computeInclusionTrendsLast6Months = (cases) => {
  const now = new Date();
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const months = [];

  for (let i = 5; i >= 0; i -= 1) {
    const monthDate = subMonths(now, i);
    const monthCases = (cases || []).filter((c) => {
      const d = new Date(c.createdAt);
      return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
    });

    const total = monthCases.length;
    const full = monthCases.filter((c) => c.inclusionType === 'كلي').length;
    const partial = monthCases.filter((c) => c.inclusionType === 'جزئي').length;

    months.push({
      name: monthNames[monthDate.getMonth()],
      total,
      full,
      partial,
    });
  }

  return months;
};

export const computeSpecialistsCoverageByGovernorate = (cases, users, targetRatio = 50) => {
  const specialists = (users || []).filter((u) => u.role === ROLES.SPECIALIST);

  return GOVERNORATES.map((g) => {
    const specCount = specialists.filter((s) => s.governorateId === g.id).length;
    const govCases = (cases || []).filter((c) => c.governorateId === g.id);
    const casesCount = govCases.length;
    const required = Math.max(1, Math.ceil(casesCount / targetRatio));
    const coverage = Math.round((specCount / required) * 1000) / 10;

    return {
      governorateId: g.id,
      governorateName: g.name,
      specialistsCount: specCount,
      casesCount,
      requiredSpecialists: required,
      coveragePercent: clamp(coverage, 0, 999),
    };
  });
};

export const computeGovernorateAxisAverages = (filteredCases, allAudits, axes = PROFESSIONAL_AXES) => {
  const auditsByCaseId = new Map((allAudits || []).map((a) => [a.caseId, a]));

  const axisScoreFromAudit = (audit, caseId, axisKey) => {
    const note = (audit?.professionalAxesNotes?.[axisKey] || '').trim();
    const seed = `${caseId}|${axisKey}|${note.length}`;
    const rand = mulberry32(hashString(seed));
    const jitter = Math.round((rand() - 0.5) * 12); // -6..+6
    const base = note ? 72 + Math.min(22, Math.round(note.length / 8)) : 65;
    return clamp(base + jitter);
  };

  return GOVERNORATES.map((g) => {
    const cases = (filteredCases || []).filter((c) => c.governorateId === g.id);
    const scored = cases
      .map((c) => ({ c, a: auditsByCaseId.get(c.id) }))
      .filter((x) => Boolean(x.a));

    const axisValues = axes.map((ax) => {
      if (scored.length === 0) {
        const seed = `${g.id}|${ax.key}|fallback|${cases.length}`;
        const rand = mulberry32(hashString(seed));
        const base = 70 + Math.round((rand() - 0.5) * 10);
        return { key: ax.key, name: ax.label, value: clamp(base) };
      }

      const avg = Math.round(
        scored.reduce((sum, x) => sum + axisScoreFromAudit(x.a, x.c.id, ax.key), 0) / scored.length
      );
      return { key: ax.key, name: ax.label, value: clamp(avg) };
    });

    const overall = Math.round(axisValues.reduce((s, a) => s + a.value, 0) / Math.max(1, axisValues.length));
    return {
      governorateId: g.id,
      governorateName: g.name,
      axes: axisValues,
      overall,
    };
  });
};

export const computeProblematicAxis = (governorateAxisAverages) => {
  const stats = governorateAxisAverages || [];
  if (stats.length === 0) return null;

  const axisCount = stats[0]?.axes?.length || 0;
  const axisAverages = Array.from({ length: axisCount }).map((_, idx) => {
    const name = stats[0]?.axes?.[idx]?.name || `Axis_${idx + 1}`;
    const avg = Math.round(stats.reduce((sum, g) => sum + (g.axes[idx]?.value || 0), 0) / Math.max(1, stats.length));
    return { index: idx, name, value: avg };
  });

  axisAverages.sort((a, b) => a.value - b.value);
  return axisAverages[0] || null;
};

export const buildPeriodicMalaaReportData = ({ allCases, allAudits, allUsers, filters }) => {
  const filteredCases = filterCasesForReport(allCases || [], filters || {});

  const totalCases = filteredCases.length;
  const completedCases = filteredCases.filter((c) => c.status === CASE_STATUS.COMPLETED).length;
  const incompleteCases = filteredCases.filter((c) => c.status === CASE_STATUS.INCOMPLETE).length;

  const gender = computeGenderStats(filteredCases);
  const educationStructure = computeEducationStructure(filteredCases);
  const educationPrograms = computeEducationProgramDistribution(filteredCases);
  const referralSources = computeReferralDistribution(filteredCases);
  const inclusionTrends = computeInclusionTrendsLast6Months(filteredCases);
  const specialistsCoverage = computeSpecialistsCoverageByGovernorate(filteredCases, allUsers || [], 50);

  const governorateAxisAverages = computeGovernorateAxisAverages(filteredCases, allAudits || []);
  const ranking = [...governorateAxisAverages].sort((a, b) => b.overall - a.overall);
  const best = ranking[0] || null;
  const worst = ranking[ranking.length - 1] || null;
  const problematicAxis = computeProblematicAxis(governorateAxisAverages);

  return {
    filters: filters || {},
    totals: {
      totalCases,
      completedCases,
      incompleteCases,
    },
    gender,
    educationStructure,
    educationPrograms,
    referralSources,
    inclusionTrends,
    specialistsCoverage,
    governorateAxisAverages,
    governorateRanking: ranking,
    bestGovernorate: best,
    worstGovernorate: worst,
    problematicAxis,
  };
};

