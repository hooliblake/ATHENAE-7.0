import jsPDF from 'jspdf';
import { loadImage } from '@/lib/pdfUtils/imageUtils';
import { 
  PDF_MARGIN, 
  PDF_MAX_LINE_WIDTH,
  addPageHeader, 
  checkAndAddNewPage,
  addSectionTitle,
  addTextLines,
  addKeyValueText
} from '@/lib/pdfUtils/pdfStyles';

export const exportWorkLogToPDF = async (project, rubrosMap, toast) => {
  if (!project || !project.dailyLogs || project.dailyLogs.length === 0) {
    toast({ title: "Sin Datos", description: "No hay registros diarios para exportar.", variant: "warning" });
    return;
  }

  toast({ title: "Generando PDF del Libro de Obra...", description: "Esto puede tomar unos momentos." });

  const pdf = new jsPDF('p', 'mm', 'a4');
  let yPos = addPageHeader(pdf, `Libro de Obra: ${project.projectName}`);
  
  pdf.setFontSize(10);
  yPos = addKeyValueText(pdf, yPos, "Contratista", project.contractor);
  yPos = addKeyValueText(pdf, yPos, "Fecha de Inicio", project.startDate);
  yPos += 4; 

  for (const log of project.dailyLogs.sort((a,b) => new Date(a.date) - new Date(b.date))) {
    yPos = checkAndAddNewPage(pdf, yPos, 40); 
    yPos = addSectionTitle(pdf, yPos, `Fecha: ${log.date}`);

    if (log.observations) {
      yPos = checkAndAddNewPage(pdf, yPos, 10);
      pdf.setFont(undefined, 'bold');
      pdf.text("Novedades/Observaciones:", PDF_MARGIN, yPos);
      yPos += 5;
      pdf.setFont(undefined, 'normal');
      yPos = addTextLines(pdf, yPos, log.observations);
    }
    
    if (log.personnel) {
        yPos = checkAndAddNewPage(pdf, yPos, 10);
        pdf.setFont(undefined, 'bold');
        pdf.text("Personal:", PDF_MARGIN, yPos);
        yPos += 5;
        pdf.setFont(undefined, 'normal');
        yPos = addTextLines(pdf, yPos, log.personnel);
    }

    if (log.machinery) {
        yPos = checkAndAddNewPage(pdf, yPos, 10);
        pdf.setFont(undefined, 'bold');
        pdf.text("Maquinaria:", PDF_MARGIN, yPos);
        yPos +=5;
        pdf.setFont(undefined, 'normal');
        yPos = addTextLines(pdf, yPos, log.machinery);
    }

    if (log.rubrosUpdate && log.rubrosUpdate.length > 0) {
      yPos = checkAndAddNewPage(pdf, yPos, 10);
      pdf.setFont(undefined, 'bold');
      pdf.text("Avance de Rubros:", PDF_MARGIN, yPos);
      yPos += 6;
      pdf.setFont(undefined, 'normal');

      for (const ru of log.rubrosUpdate) {
        if (ru.quantityExecutedToday && parseFloat(ru.quantityExecutedToday) > 0) {
          const rubroDetails = rubrosMap[ru.rubroId];
          const rubroName = rubroDetails?.name || 'Rubro Desconocido';
          const rubroUnit = rubroDetails?.unit || '';
          
          yPos = checkAndAddNewPage(pdf, yPos, 5);
          pdf.text(`- ${rubroName}: ${ru.quantityExecutedToday} ${rubroUnit}`, PDF_MARGIN + 5, yPos);
          yPos += 5;

          if (ru.photos && ru.photos.length > 0) {
            yPos += 2; 
            for (const photo of ru.photos) {
              if (photo.url) {
                try {
                  const imgData = await loadImage(photo.url);
                  const imgWidth = 40; 
                  const imgHeight = (imgData.height * imgWidth) / imgData.width;
                  yPos = checkAndAddNewPage(pdf, yPos, imgHeight + 5);
                  pdf.addImage(imgData, 'JPEG', PDF_MARGIN + 10, yPos, imgWidth, imgHeight);
                  yPos += imgHeight + 2;
                  if (photo.comment) {
                    yPos = checkAndAddNewPage(pdf, yPos, 5);
                    pdf.setFontSize(8);
                    pdf.text(`Comentario: ${photo.comment}`, PDF_MARGIN + 10, yPos);
                    yPos += 5;
                    pdf.setFontSize(10);
                  }
                } catch (error) {
                  yPos = checkAndAddNewPage(pdf, yPos, 5);
                  pdf.text("[Error al cargar imagen]", PDF_MARGIN + 10, yPos);
                  yPos += 5;
                }
              }
            }
            yPos += 3;
          }
        }
      }
    }
    yPos += 5; 
    const pageHeight = pdf.internal.pageSize.getHeight();
    if(yPos + 5 < pageHeight - PDF_MARGIN) { 
        pdf.setDrawColor(200, 200, 200);
        pdf.line(PDF_MARGIN, yPos, pdf.internal.pageSize.getWidth() - PDF_MARGIN, yPos);
        yPos += 5;
    }
  }

  pdf.save(`${project.projectName.replace(/ /g, "_")}_Libro_Obra.pdf`);
  toast({ title: "PDF Generado", description: "El libro de obra ha sido exportado a PDF.", variant: "success" });
};


export const exportPhotoAnnexToPDF = async (project, rubrosMap, toast) => {
  if (!project || !project.dailyLogs || project.dailyLogs.length === 0) {
    toast({ title: "Sin Datos", description: "No hay registros diarios con fotos para exportar.", variant: "warning" });
    return;
  }

  const photosByRubro = {};
  project.dailyLogs.forEach(log => {
    (log.rubrosUpdate || []).forEach(ru => {
      if (ru.photos && ru.photos.length > 0) {
        if (!photosByRubro[ru.rubroId]) {
          photosByRubro[ru.rubroId] = [];
        }
        ru.photos.forEach(photo => {
          if (photo.url) { 
            photosByRubro[ru.rubroId].push({
              url: photo.url, // Asegurarse de que la URL se está pasando
              comment: photo.comment,
              date: log.date,
              rubroName: rubrosMap[ru.rubroId]?.name || 'Rubro Desconocido',
              rubroNumber: rubrosMap[ru.rubroId]?.rubroNumber || ''
            });
          }
        });
      }
    });
  });

  if (Object.keys(photosByRubro).length === 0) {
    toast({ title: "Sin Fotos", description: "No hay fotografías asociadas a los rubros para exportar o las fotos no tienen URL.", variant: "warning" });
    return;
  }
  
  toast({ title: "Generando Anexo Fotográfico PDF...", description: "Esto puede tomar unos momentos." });

  const pdf = new jsPDF('p', 'mm', 'a4');
  let yPos = addPageHeader(pdf, "Anexo Fotográfico", project.projectName);
  yPos += 5;

  const photosPerPage = 4; // 2x2 grid
  const photoAreaWidth = PDF_MAX_LINE_WIDTH;
  const photoMargin = PDF_MARGIN / 2;
  const photoSize = (photoAreaWidth - photoMargin) / 2; // Width for one photo in a 2-column layout

  for (const rubroId in photosByRubro) {
    const rubroPhotos = photosByRubro[rubroId];
    if (rubroPhotos.length === 0) continue;

    const rubroName = rubroPhotos[0].rubroName;
    const rubroNumber = rubroPhotos[0].rubroNumber;

    yPos = checkAndAddNewPage(pdf, yPos, 30, true); 
    yPos = addSectionTitle(pdf, yPos, `Rubro: ${rubroNumber ? rubroNumber + ' - ' : ''}${rubroName}`);
    
    for (let i = 0; i < rubroPhotos.length; i += photosPerPage) {
      const pagePhotos = rubroPhotos.slice(i, i + photosPerPage);
      if (i > 0) { 
        pdf.addPage();
        yPos = PDF_MARGIN;
        yPos = addSectionTitle(pdf, yPos, `Rubro: ${rubroNumber ? rubroNumber + ' - ' : ''}${rubroName} (Continuación)`);
      }

      let currentX = PDF_MARGIN;
      let currentY = yPos;
      let maxHeightInRow = 0; // Max height for current row of 2 photos

      for (let j = 0; j < pagePhotos.length; j++) {
        const photo = pagePhotos[j];
        
        if (j > 0 && j % 2 === 0) { // New row for photos 3 and 4 on the page
          currentX = PDF_MARGIN;
          currentY += maxHeightInRow + photoMargin + 15; // +15 for text space below images
          maxHeightInRow = 0;
        }
        
        yPos = checkAndAddNewPage(pdf, currentY, photoSize + 20); // +20 for text
        if (yPos === PDF_MARGIN && currentY > PDF_MARGIN) { // If new page was added
             currentY = yPos; // Reset currentY for the new page
             // Re-add rubro title if it's a new page within the same rubro's photo set
             if (i > 0 || j > 0) { // Check if not the very first photo of the rubro
                yPos = addSectionTitle(pdf, yPos, `Rubro: ${rubroNumber ? rubroNumber + ' - ' : ''}${rubroName} (Continuación)`);
                currentY = yPos;
             }
        }


        if (photo.url) {
          try {
            const imgData = await loadImage(photo.url);
            let imgHeight = photoSize;
            let imgWidth = photoSize;

            const aspectRatio = imgData.width / imgData.height;
            if (aspectRatio > 1) { // Landscape
              imgHeight = photoSize / aspectRatio;
            } else { // Portrait or square
              imgWidth = photoSize * aspectRatio;
            }
            
            maxHeightInRow = Math.max(maxHeightInRow, imgHeight);

            pdf.addImage(imgData, 'JPEG', currentX, currentY, imgWidth, imgHeight);
            
            pdf.setFontSize(8);
            pdf.setFont(undefined, 'normal');
            const textY = currentY + imgHeight + 4;
            pdf.text(`Fecha: ${photo.date}`, currentX, textY);
            if (photo.comment) {
              const commentLines = pdf.splitTextToSize(photo.comment, imgWidth);
               let commentY = textY + 4;
              for(const line of commentLines){
                if(commentY > pdf.internal.pageSize.getHeight() - PDF_MARGIN - 4) { // check if comment overflows page
                    pdf.addPage();
                    currentY = PDF_MARGIN;
                    commentY = PDF_MARGIN;
                    // Optionally re-add headers/titles
                }
                pdf.text(line, currentX, commentY);
                commentY += 4;
              }
            }
          } catch (error) {
            pdf.text("[Error img]", currentX, currentY + photoSize / 2);
            maxHeightInRow = Math.max(maxHeightInRow, photoSize / 2); // Smaller placeholder for error
          }
        } else {
           pdf.text("[No img URL]", currentX, currentY + photoSize / 2);
           maxHeightInRow = Math.max(maxHeightInRow, photoSize / 2);
        }
        currentX += photoSize + photoMargin;
      }
      yPos = currentY + maxHeightInRow + photoMargin + 15; 
    }
  }

  pdf.save(`${project.projectName.replace(/ /g, "_")}_Anexo_Fotografico.pdf`);
  toast({ title: "Anexo Fotográfico PDF Generado", description: "El anexo fotográfico ha sido exportado.", variant: "success" });
};