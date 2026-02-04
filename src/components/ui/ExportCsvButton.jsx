import Button from './Button';

const escapeCsvCell = (value) => {
  const s = value === null || value === undefined ? '' : String(value);
  return `"${s.replace(/"/g, '""')}"`;
};

const buildCsv = (header, rows) => {
  const lines = [
    header.map(escapeCsvCell).join(','),
    ...rows.map((r) => r.map(escapeCsvCell).join(',')),
  ];
  // Add UTF-8 BOM so Excel renders Arabic correctly
  return `\uFEFF${lines.join('\n')}`;
};

const ExportCsvButton = ({
  fileName = 'export.csv',
  header = [],
  rows = [],
  className = '',
  label = 'تحميل Excel (CSV)',
}) => {
  const disabled = !header?.length;

  const onClick = () => {
    const csv = buildCsv(header, rows || []);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={onClick}
      disabled={disabled}
      title={disabled ? 'لا توجد بيانات للتصدير' : undefined}
    >
      {label}
    </Button>
  );
};

export default ExportCsvButton;

