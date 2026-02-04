import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

const font = 'Arial';

// Direction helpers:
// - RLM: force right-to-left context
// - LRM: force left-to-right context (useful for pure numbers/latin)
const RLM = '\u200F';
const LRM = '\u200E';

const isMostlyLatinOrNumeric = (s) => /^[0-9A-Za-z%:().,\s/+\\-]+$/.test(String(s || '').trim());

const dirText = (text) => {
  const s = text ?? '';
  if (s === '') return '';
  return isMostlyLatinOrNumeric(s) ? `${LRM}${s}${LRM}` : `${RLM}${s}${RLM}`;
};

// Fix common RTL issues in narrative text (NOT tables):
// - Ensure percentages don't jump in RTL: "73%" -> "73٪", "72.5%" -> "72٫5٪"
// - Ensure parentheses content direction is stable in RTL paragraphs
const normalizeParagraphText = (input) => {
  let s = String(input ?? '');
  if (!s) return s;

  // Normalize decimal dot between digits to Arabic decimal separator
  s = s.replace(/(\d)\.(\d)/g, '$1٫$2');

  // Normalize percent sign after numbers
  s = s.replace(/(\d+(?:[٫]\d+)?)\s*%/g, '$1٪');

  // As requested: swap all parentheses characters.
  // This counteracts Word's RTL mirroring in many Arabic documents.
  s = s.replace(/[()]/g, (ch) => (ch === '(' ? ')' : '('));

  return s;
};

const arabicIndicNumber = (n) => {
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(n)
    .split('')
    .map((ch) => (ch >= '0' && ch <= '9' ? map[Number(ch)] : ch))
    .join('');
};

const sectionTitle = (n, ar) => `${arabicIndicNumber(n)}. ${ar}`;

const p = (text, opts = {}) => {
  const {
    bold = false,
    size = 22, // docx half-points (22 = 11pt)
    heading,
    spacingAfter = 120,
    keepNext = false,
  } = opts;

  return new Paragraph({
    heading,
    alignment: AlignmentType.RIGHT,
    spacing: { after: spacingAfter },
    keepNext,
    children: [
      new TextRun({
        text: dirText(normalizeParagraphText(text ?? '')),
        bold,
        size,
        font,
      }),
    ],
  });
};

const multilineParagraphs = (text, opts = {}) => {
  const lines = String(text || '').split('\n');
  return lines.map((line) => p(line, { ...opts, spacingAfter: 60 }));
};

const tableCell = (text, { bold = false, widthPct, shading, align = AlignmentType.RIGHT } = {}) => {
  return new TableCell({
    shading: shading ? { fill: shading } : undefined,
    width: widthPct ? { size: widthPct, type: WidthType.PERCENTAGE } : undefined,
    margins: { top: 120, bottom: 120, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text: dirText(text ?? ''),
            bold,
            font,
            size: 22,
          }),
        ],
      }),
    ],
  });
};

const simpleTable = ({ headers, rows }) => {
  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((h) => tableCell(h, { bold: true, shading: 'EEF2FF' })),
  });

  const bodyRows = (rows || []).map(
    (r) =>
      new TableRow({
        cantSplit: true,
        children: r.map((cell) => tableCell(cell)),
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'D1D5DB' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E5E7EB' },
    },
  });
};

export const generatePeriodicMalaaDocx = async ({ meta, periodLabel, reportData, sections, selectedGovName }) => {
  const title = meta?.title || 'التقرير الإحصائي الدوري لأداء الملاءة والخدمات التعليمية';

  const headerInfoTable = simpleTable({
    headers: ['البند', 'القيمة'],
    rows: [
      ['الفترة المشمولة', periodLabel || '—'],
      ['تاريخ الإعداد', meta?.preparedDate || '—'],
      ['المحافظة', selectedGovName || 'جميع المحافظات'],
      ['نوع الإعاقة', meta?.selectedDisabilityType || 'جميع أنواع الإعاقة'],
      ['الفترة الزمنية', meta?.fromDate || meta?.toDate ? `${meta?.fromDate || '—'} إلى ${meta?.toDate || '—'}` : '—'],
    ],
  });

  const infrastructureTable = simpleTable({
    headers: ['المؤشر', 'القيمة', 'ملاحظة'],
    rows: [
      ['إجمالي الحالات المسجلة', String(reportData?.totals?.totalCases ?? 0), 'يمثل العدد الكلي للطلبة الذين خضعوا للتشخيص والتصنيف.'],
      ['نسبة الإناث من الطلبة', `${reportData?.gender?.female ?? 0} (${reportData?.gender?.femalePercent ?? 0}%)`, 'يستدعي توفر خدمات إناث متخصصة حسب الاحتياج.'],
      ['إجمالي المدارس الحكومية', String(reportData?.educationStructure?.publicCount ?? 0), 'أساس الدمج.'],
      ['إجمالي المدارس الخاصة', String(reportData?.educationStructure?.privateCount ?? 0), 'مدارس دمج وخاصة.'],
    ],
  });

  const specialistsCoverageTable = simpleTable({
    headers: ['المحافظة', 'عدد الأخصائيين', 'عدد الحالات', 'التغطية (1:50)'],
    rows: (reportData?.specialistsCoverage || []).map((r) => [
      r.governorateName,
      String(r.specialistsCount ?? 0),
      String(r.casesCount ?? 0),
      `${r.coveragePercent ?? 0}%`,
    ]),
  });

  const educationProgramsTable = simpleTable({
    headers: ['برنامج التعليم', 'العدد', 'النسبة'],
    rows: (reportData?.educationPrograms || []).map((x) => [
      x.name,
      String(x.value ?? 0),
      `${x.percent ?? 0}%`,
    ]),
  });

  const inclusionTrendsTable = simpleTable({
    headers: ['الشهر', 'الإجمالي', 'الدمج الكلي', 'الدمج الجزئي'],
    rows: (reportData?.inclusionTrends || []).map((m) => [
      m.name,
      String(m.total ?? 0),
      String(m.full ?? 0),
      String(m.partial ?? 0),
    ]),
  });

  const governorateRankingTable = simpleTable({
    headers: ['الترتيب', 'المحافظة', 'المتوسط الكلي'],
    rows: (reportData?.governorateRanking || []).map((g, idx) => [
      String(idx + 1),
      g.governorateName,
      `${g.overall ?? 0}%`,
    ]),
  });

  const referralSourcesTable = simpleTable({
    headers: ['مصدر الإحالة', 'العدد', 'النسبة'],
    rows: (reportData?.referralSources || []).map((x) => [
      x.name,
      String(x.value ?? 0),
      `${x.percent ?? 0}%`,
    ]),
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          p(title, { heading: HeadingLevel.TITLE, bold: true, size: 34, spacingAfter: 160 }),
          headerInfoTable,
          p('', { spacingAfter: 120 }),

          p(sectionTitle(1, 'الملخص التنفيذي'), { heading: HeadingLevel.HEADING_1, bold: true, size: 28 }),
          ...multilineParagraphs(sections?.executiveSummary || ''),

          p(sectionTitle(2, 'منهجية التقرير ونطاق البيانات'), { heading: HeadingLevel.HEADING_1, bold: true, size: 28 }),
          ...multilineParagraphs(sections?.methodology || ''),

          p(sectionTitle(3, 'تحليل البنية التحتية والموارد البشرية'), { heading: HeadingLevel.HEADING_1, bold: true, size: 28 }),
          ...multilineParagraphs(sections?.infrastructureNotes || ''),
          p('جدول المؤشرات الأساسية', { heading: HeadingLevel.HEADING_2, bold: true, size: 24, keepNext: true }),
          infrastructureTable,
          p('توزيع الأخصائيين وتغطية الحالات (مقابل 1:50)', { heading: HeadingLevel.HEADING_2, bold: true, size: 24, keepNext: true }),
          specialistsCoverageTable,

          p(sectionTitle(4, 'تحليل برامج التعليم ونوع الدمج'), { heading: HeadingLevel.HEADING_1, bold: true, size: 28 }),
          ...multilineParagraphs(sections?.educationNotes || ''),
          p('أ. توزيع الحالات حسب البرنامج التعليمي', { heading: HeadingLevel.HEADING_2, bold: true, size: 24, keepNext: true }),
          educationProgramsTable,
          p('ب. اتجاه الحالات الجديدة حسب نوع الدمج (آخر 6 أشهر)', { heading: HeadingLevel.HEADING_2, bold: true, size: 24, keepNext: true }),
          inclusionTrendsTable,

          p(sectionTitle(5, 'تحليل أداء الملاءة للمحافظات (المعايير)'), { heading: HeadingLevel.HEADING_1, bold: true, size: 28 }),
          ...multilineParagraphs(sections?.performanceNotes || ''),
          p('الترتيب العام للمحافظات (المتوسط الكلي)', { heading: HeadingLevel.HEADING_2, bold: true, size: 24, keepNext: true }),
          governorateRankingTable,

          p(sectionTitle(6, 'تحليل مصادر الإحالة'), { heading: HeadingLevel.HEADING_1, bold: true, size: 28 }),
          ...multilineParagraphs(sections?.referralNotes || ''),
          referralSourcesTable,

          p(sectionTitle(7, 'التوصيات المقترحة'), { heading: HeadingLevel.HEADING_1, bold: true, size: 28 }),
          ...multilineParagraphs(sections?.recommendations || ''),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
};

