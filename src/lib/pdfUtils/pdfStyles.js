import React from 'react';

export const PDF_PAGE_WIDTH = 210; 
export const PDF_PAGE_HEIGHT = 297; 
export const PDF_MARGIN = 10;
export const PDF_MAX_LINE_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN * 2;

export const addPageHeader = (pdf, title, subtitle = "") => {
  let yPos = PDF_MARGIN;
  pdf.setFontSize(16);
  pdf.setFont(undefined, 'bold');
  pdf.text(title, PDF_PAGE_WIDTH / 2, yPos, { align: 'center' });
  yPos += 7;
  if (subtitle) {
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(subtitle, PDF_PAGE_WIDTH / 2, yPos, { align: 'center' });
    yPos += 7;
  }
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'normal');
  return yPos; 
};

export const checkAndAddNewPage = (pdf, currentYPos, neededHeight) => {
  if (currentYPos + neededHeight > PDF_PAGE_HEIGHT - PDF_MARGIN) {
    pdf.addPage();
    return PDF_MARGIN; 
  }
  return currentYPos;
};

export const addSectionTitle = (pdf, yPos, title) => {
  yPos = checkAndAddNewPage(pdf, yPos, 10);
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.setFillColor(230, 230, 230);
  pdf.rect(PDF_MARGIN, yPos - 4, PDF_MAX_LINE_WIDTH, 7, 'F');
  pdf.text(title, PDF_MARGIN + 2, yPos);
  yPos += 8;
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  return yPos;
};

export const addTextLines = (pdf, yPos, text, maxWidth = PDF_MAX_LINE_WIDTH) => {
  const lines = pdf.splitTextToSize(text || "", maxWidth);
  for (const line of lines) {
    yPos = checkAndAddNewPage(pdf, yPos, 5);
    pdf.text(line, PDF_MARGIN, yPos);
    yPos += 5;
  }
  return yPos;
};

export const addKeyValueText = (pdf, yPos, key, value) => {
  yPos = checkAndAddNewPage(pdf, yPos, 6);
  pdf.setFont(undefined, 'bold');
  pdf.text(`${key}:`, PDF_MARGIN, yPos);
  pdf.setFont(undefined, 'normal');
  const valueX = PDF_MARGIN + pdf.getTextWidth(`${key}:`) + 2;
  const valueLines = pdf.splitTextToSize(String(value || 'N/A'), PDF_MAX_LINE_WIDTH - (valueX - PDF_MARGIN));
   for (const line of valueLines) {
    if (valueLines.indexOf(line) > 0) yPos +=5; // Add space for multi-line values
    yPos = checkAndAddNewPage(pdf, yPos, 5);
    pdf.text(line, valueX, yPos);
  }
  return yPos + 6;
};