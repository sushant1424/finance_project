import { useCallback, useRef, useState } from 'react';
import { exportElementToPDF } from '@/utils/exportPDF';
import toast from 'react-hot-toast';

export function usePDF() {
  const ref = useRef(null);
  const [exporting, setExporting] = useState(false);

  const exportPDF = useCallback(async (filename, options = {}) => {
    if (!ref.current) {
      toast.error('Nothing to export');
      return null;
    }
    setExporting(true);
    try {
      const saved = await exportElementToPDF(ref.current, filename, options);
      toast.success('PDF exported');
      return saved;
    } catch (err) {
      toast.error(err.message || 'Export failed');
      return null;
    } finally {
      setExporting(false);
    }
  }, []);

  return { ref, exporting, exportPDF };
}

export default usePDF;
