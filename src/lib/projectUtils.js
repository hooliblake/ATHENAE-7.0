import { PROJECT_STATUSES } from '@/config/constants';

export const calculateOverallProgress = (rubros) => {
  if (!rubros || rubros.length === 0) return 0;

  const totalContractAmount = rubros.reduce((sum, rubro) => {
    const quantity = parseFloat(rubro.quantity) || 0;
    const unitPrice = parseFloat(rubro.unitPrice) || 0;
    return sum + quantity * unitPrice;
  }, 0);

  if (totalContractAmount === 0) return 0;

  const totalExecutedAmount = rubros.reduce((sum, rubro) => {
    const executedQuantity = parseFloat(rubro.executedQuantity) || 0;
    const unitPrice = parseFloat(rubro.unitPrice) || 0;
    return sum + executedQuantity * unitPrice;
  }, 0);
  
  return (totalExecutedAmount / totalContractAmount) * 100;
};

export const getProjectStatusLabel = (statusId) => {
  const status = PROJECT_STATUSES.find(s => s.id === statusId);
  return status ? status.label : "No definido";
};