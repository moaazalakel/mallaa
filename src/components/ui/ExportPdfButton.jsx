import { useCallback, useState } from 'react';
import Button from './Button';

// High-quality "Save as PDF" via browser print dialog (keeps RTL + SVG charts).
// User selects "Save as PDF" in the print dialog.
const exportElementToPdf = async ({ element, fileName }) => {
  if (!element) return;

  const title = (fileName || 'dashboard.pdf').replace(/\.pdf$/i, '');
  const prevTitle = document.title;
  document.title = title;

  // Print in the SAME tab (more reliable than new tab in Chrome/Edge).
  const sandbox = document.createElement('div');
  sandbox.id = '__print_sandbox__';
  sandbox.dir = 'rtl';
  sandbox.style.position = 'fixed';
  sandbox.style.left = '0';
  sandbox.style.top = '0';
  sandbox.style.width = '100%';
  sandbox.style.background = '#fff';
  sandbox.style.zIndex = '2147483647';

  const cloned = element.cloneNode(true);
  sandbox.appendChild(cloned);
  document.body.appendChild(sandbox);

  const styleTag = document.createElement('style');
  styleTag.setAttribute('data-print-style', 'true');
  styleTag.textContent = `
    @page { size: A4; margin: 10mm; }
    @media print {
      html, body { background: #fff !important; direction: rtl; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body * { visibility: hidden !important; }
      #__print_sandbox__, #__print_sandbox__ * { visibility: visible !important; }
      #__print_sandbox__ { position: static !important; }
      .no-print { display: none !important; }
      .sticky { position: static !important; }
      * { box-shadow: none !important; }
    }
  `;
  document.head.appendChild(styleTag);

  await new Promise((r) => setTimeout(r, 300));

  const cleanup = () => {
    window.removeEventListener('afterprint', cleanup);
    try { sandbox.remove(); } catch { /* noop */ }
    try { styleTag.remove(); } catch { /* noop */ }
    document.title = prevTitle;
  };

  window.addEventListener('afterprint', cleanup);
  window.print();
  // Fallback cleanup in case afterprint doesn't fire
  setTimeout(cleanup, 4000);
};

const ExportPdfButton = ({ targetRef, fileName = 'dashboard.pdf', className = '' }) => {
  const [loading, setLoading] = useState(false);

  const onExport = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      await exportElementToPdf({ element: targetRef?.current, fileName });
    } finally {
      setLoading(false);
    }
  }, [fileName, loading, targetRef]);

  return (
    <Button
      type="button"
      variant="outline"
      className={`no-print ${className}`}
      disabled={loading}
      onClick={onExport}
      title="تصدير الصفحة الحالية كملف PDF"
    >
      {loading ? 'جاري التحضير...' : 'حفظ PDF'}
    </Button>
  );
};

export default ExportPdfButton;

