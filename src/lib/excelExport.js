import * as XLSX from 'xlsx';

const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const formatNumber = (value, decimals = 2) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '';
  return num.toFixed(decimals);
};


export const exportProjectReportsToExcel = (project, toast) => {
  if (!project) {
    toast({ title: "Error", description: "No hay datos del proyecto para exportar.", variant: "destructive" });
    return;
  }

  const rubrosWithCalculations = (project.rubros || []).map(rubro => {
    const quantity = parseFloat(rubro.quantity) || 0;
    const unitPrice = parseFloat(rubro.unitPrice) || 0;
    const contractAmount = quantity * unitPrice;
    
    let executedQuantityAccumulated = 0;
    (project.dailyLogs || []).forEach(log => {
        const rubroUpdate = log.rubrosUpdate?.find(ru => ru.rubroId === rubro.id);
        if (rubroUpdate) {
            executedQuantityAccumulated += parseFloat(rubroUpdate.quantityExecutedToday || 0);
        }
    });
    
    const executedValueAccumulated = executedQuantityAccumulated * unitPrice;
    const progressPercentage = contractAmount > 0 ? (executedValueAccumulated / contractAmount) * 100 : 0;

    return {
      ...rubro,
      contractAmount,
      quantities: {
        previous: 0, 
        thisPeriod: executedQuantityAccumulated, 
        accumulated: executedQuantityAccumulated,
        incrementDecrement: 0 
      },
      values: {
        previous: 0, 
        thisPeriod: executedValueAccumulated, 
        accumulated: executedValueAccumulated,
        incrementDecrement: 0 
      },
      progressPercentage
    };
  });

  const overallProgress = project.rubros && project.rubros.length > 0 ? 
    rubrosWithCalculations.reduce((sum, r) => sum + r.values.accumulated, 0) / 
    rubrosWithCalculations.reduce((sum, r) => sum + r.contractAmount, 0) * 100 
    : 0;


  const mainSheetHeader = [
    "ITEM", "N° RUBRO", "DESCRIPCIÓN", "UNIDAD", 
    "CANTIDAD CONTRACTUAL", "PRECIO UNITARIO", "MONTO CONTRACTUAL",
    "CANTIDADES - PREVIO", "CANTIDADES - ESTE PERIODO", "CANTIDADES - ACUMULADO", "CANTIDADES - INCREMENTO/DECREMENTO",
    "VALORES - PREVIO", "VALORES - ESTE PERIODO", "VALORES - ACUMULADO", "VALORES - INCREMENTO/DECREMENTO",
    "% AVANCE"
  ];
  
  const mainSheetData = [
    ["GOBIERNO AUTONOMO DESCENTRALIZADO MUNICIPAL DE SHUSHUFINDI"],
    ["DEPARTAMENTO DE OBRAS PUBLICAS"],
    ["JEFATURA DE FISCALIZACION"],
    [`CONSTRUCCIÓN DEL ${project.projectName}`],
    [`CÓDIGO DEL PROCESO: ${project.contractNumber || 'N/A'}`],
    ["APOYO DE FACTURA - VALORES"],
    [],
    ["PROYECTO:", project.projectName],
    ["UBICACIÓN:", project.location],
    ["PROVINCIA:", project.province || 'N/A'], 
    ["CONTRATISTA:", project.contractor],
    ["FECHA INICIO:", project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'],
    ["FECHA TERMINACION:", project.endDateContractual ? new Date(project.endDateContractual).toLocaleDateString() : 'N/A'],
    ["MONTO DEL CONTRATO:", formatCurrency(project.rubros.reduce((sum, r) => sum + (parseFloat(r.quantity) * parseFloat(r.unitPrice)), 0))],
    ["ANTICIPO DEL CONTRATO 50%:", formatCurrency(project.rubros.reduce((sum, r) => sum + (parseFloat(r.quantity) * parseFloat(r.unitPrice)), 0) / 2)],
    [],
    mainSheetHeader
  ];

  let itemCounter = 0;
  rubrosWithCalculations.sort((a, b) => {
    const numA = String(a.rubroNumber || '').split('.').map(Number);
    const numB = String(b.rubroNumber || '').split('.').map(Number);
    for (let i = 0; i < Math.max(numA.length, numB.length); i++) {
      const valA = numA[i] || 0;
      const valB = numB[i] || 0;
      if (valA < valB) return -1;
      if (valA > valB) return 1;
    }
    return 0;
  }).forEach(rubro => {
    itemCounter++;
    mainSheetData.push([
      itemCounter,
      rubro.rubroNumber || '-',
      rubro.name,
      rubro.unit,
      formatNumber(rubro.quantity),
      formatCurrency(rubro.unitPrice),
      formatCurrency(rubro.contractAmount),
      formatNumber(rubro.quantities.previous),
      formatNumber(rubro.quantities.thisPeriod),
      formatNumber(rubro.quantities.accumulated),
      formatNumber(rubro.quantities.incrementDecrement),
      formatCurrency(rubro.values.previous),
      formatCurrency(rubro.values.thisPeriod),
      formatCurrency(rubro.values.accumulated),
      formatCurrency(rubro.values.incrementDecrement),
      `${formatNumber(rubro.progressPercentage)}%`
    ]);
  });
  
  mainSheetData.push([]);
  mainSheetData.push(["PROGRESO GENERAL DEL PROYECTO:", `${formatNumber(overallProgress)}%`]);


  const mainWorksheet = XLSX.utils.aoa_to_sheet(mainSheetData);
  
  const colWidths = [
    {wch:5}, {wch:8}, {wch:40}, {wch:8}, {wch:12}, {wch:12}, {wch:15}, 
    {wch:12}, {wch:12}, {wch:12}, {wch:15},
    {wch:12}, {wch:12}, {wch:12}, {wch:15},
    {wch:10}
  ];
  mainWorksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, mainWorksheet, "Planilla Principal");

  rubrosWithCalculations.forEach(rubro => {
    const rubroSheetData = [
      ["ANEXO PLANILLA - DETALLE DE RUBRO"],
      [],
      ["PROYECTO:", project.projectName],
      ["RUBRO:", `${rubro.rubroNumber || ''} ${rubro.name}`],
      ["UNIDAD:", rubro.unit],
      ["CANTIDAD CONTRATADA:", formatNumber(rubro.quantity)],
      ["PRECIO UNITARIO:", formatCurrency(rubro.unitPrice)],
      ["MONTO CONTRACTUAL:", formatCurrency(rubro.contractAmount)],
      [],
      ["DETALLES DE AVANCE DIARIO"],
      ["Fecha", "Cantidad Ejecutada Hoy", "Valor Ejecutado Hoy", "Fotos (Nombres/IDs)"],
    ];
    
    (project.dailyLogs || []).sort((a,b) => new Date(a.date) - new Date(b.date)).forEach(log => {
      const rubroUpdateInLog = log.rubrosUpdate.find(ru => ru.rubroId === rubro.id);
      if (rubroUpdateInLog && parseFloat(rubroUpdateInLog.quantityExecutedToday || 0) > 0) {
        const quantityToday = parseFloat(rubroUpdateInLog.quantityExecutedToday);
        const valueToday = quantityToday * parseFloat(rubro.unitPrice);
        rubroSheetData.push([
          log.date ? new Date(log.date).toLocaleDateString() : 'N/A',
          formatNumber(quantityToday),
          formatCurrency(valueToday),
          rubroUpdateInLog.photos ? rubroUpdateInLog.photos.map(p => p.name || p.id).join(', ') : 'N/A'
        ]);
      }
    });

    rubroSheetData.push([]);
    rubroSheetData.push(["TOTAL CANTIDAD EJECUTADA:", formatNumber(rubro.quantities.accumulated)]);
    rubroSheetData.push(["TOTAL VALOR EJECUTADO:", formatCurrency(rubro.values.accumulated)]);
    rubroSheetData.push(["PORCENTAJE DE AVANCE:", `${formatNumber(rubro.progressPercentage)}%`]);

    const rubroWorksheet = XLSX.utils.aoa_to_sheet(rubroSheetData);
    rubroWorksheet['!cols'] = [ {wch:15}, {wch:20}, {wch:20}, {wch:30} ];
    XLSX.utils.book_append_sheet(workbook, rubroWorksheet, `Rubro ${String(rubro.rubroNumber || rubro.name).substring(0,20)}`);
  });
  
  const obraLogSheetData = [
    ["LIBRO DE OBRA"],
    [],
    ["PROYECTO:", project.projectName],
    [],
    ["Fecha", "Novedades / Observaciones", "Personal", "Maquinaria", "Condiciones Climáticas", "Trabajo Realizado"]
  ];
  (project.dailyLogs || []).sort((a,b) => new Date(a.date) - new Date(b.date)).forEach(log => {
    obraLogSheetData.push([
      log.date ? new Date(log.date).toLocaleDateString() : 'N/A',
      log.observations,
      log.personnel,
      log.machinery,
      log.weather,
      log.workPerformed
    ]);
  });
  const obraLogWorksheet = XLSX.utils.aoa_to_sheet(obraLogSheetData);
  obraLogWorksheet['!cols'] = [ {wch:15}, {wch:50}, {wch:30}, {wch:30}, {wch:20}, {wch:20} ];
  XLSX.utils.book_append_sheet(workbook, obraLogWorksheet, "Libro de Obra");

  const photoLogSheetData = [
    ["ANEXO FOTOGRÁFICO"],
    [],
    ["PROYECTO:", project.projectName],
    [],
    ["Fecha del Registro", "Rubro Asociado", "Nombre Foto / ID", "Comentario Foto"]
  ];
  (project.dailyLogs || []).sort((a,b) => new Date(a.date) - new Date(b.date)).forEach(log => {
    (log.rubrosUpdate || []).forEach(ru => {
      if (ru.photos && ru.photos.length > 0) {
        const rubroDetails = project.rubros.find(r => r.id === ru.rubroId);
        const rubroIdentifier = rubroDetails ? `${rubroDetails.rubroNumber || ''} ${rubroDetails.name}` : "Rubro Desconocido";
        ru.photos.forEach(photo => {
          photoLogSheetData.push([
            log.date ? new Date(log.date).toLocaleDateString() : 'N/A',
            rubroIdentifier,
            photo.name || photo.id,
            photo.comment || ""
          ]);
        });
      }
    });
  });
  const photoLogWorksheet = XLSX.utils.aoa_to_sheet(photoLogSheetData);
  photoLogWorksheet['!cols'] = [ {wch:20}, {wch:30}, {wch:30}, {wch:40} ];
  XLSX.utils.book_append_sheet(workbook, photoLogWorksheet, "Anexo Fotográfico");

  XLSX.writeFile(workbook, `${project.projectName.replace(/ /g,"_")}_Reporte_Completo.xlsx`);
  toast({ title: "Exportación Exitosa", description: "El reporte completo del proyecto ha sido generado en Excel.", variant: "success" });
};