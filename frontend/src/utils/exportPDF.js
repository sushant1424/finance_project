import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportElementToPDF(element, filename = 'finsight-report.pdf', options = {}) {
  if (!element) throw new Error('No element provided for PDF export');

  const { title = 'FinSight Report', dateRange = '' } = options;
  const canvas = await html2canvas(element, {
    backgroundColor: '#09090b',
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 14;

  pdf.setFontSize(18);
  pdf.setTextColor(250, 250, 250);
  pdf.text(title, margin, margin);

  if (dateRange) {
    pdf.setFontSize(10);
    pdf.setTextColor(113, 113, 122);
    pdf.text(dateRange, margin, margin + 7);
  }

  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const startY = dateRange ? margin + 14 : margin + 10;
  let yOffset = startY;
  let remainingHeight = imgHeight;
  let sourceY = 0;
  const sliceHeight = ((pageHeight - startY - margin) * canvas.width) / imgWidth;

  while (remainingHeight > 0) {
    const pageSlice = document.createElement('canvas');
    pageSlice.width = canvas.width;
    pageSlice.height = Math.min(sliceHeight, canvas.height - sourceY);
    const ctx = pageSlice.getContext('2d');
    ctx.drawImage(canvas, 0, sourceY, canvas.width, pageSlice.height, 0, 0, canvas.width, pageSlice.height);

    const sliceData = pageSlice.toDataURL('image/png');
    const sliceDisplayHeight = (pageSlice.height * imgWidth) / canvas.width;

    if (sourceY > 0) pdf.addPage();
    pdf.addImage(sliceData, 'PNG', margin, yOffset, imgWidth, sliceDisplayHeight);

    sourceY += pageSlice.height;
    remainingHeight -= sliceDisplayHeight;
    yOffset = margin;
  }

  pdf.save(filename);
  return filename;
}
