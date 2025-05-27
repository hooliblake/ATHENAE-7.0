import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '$0.00';
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const ProjectRubrosTable = ({ rubros }) => {
  return (
    <Card className="glassmorphic">
      <CardHeader>
        <CardTitle>Detalle de Rubros</CardTitle>
        <CardDescription>Avance y valores por cada rubro del proyecto.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[8%]">N° Rubro</TableHead>
              <TableHead className="w-[25%]">Descripción</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Cant. Contr.</TableHead>
              <TableHead>P. Unitario</TableHead>
              <TableHead>Monto Contr.</TableHead>
              <TableHead>Cant. Ejec.</TableHead>
              <TableHead>Valor Ejec.</TableHead>
              <TableHead className="text-right">Avance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rubros.map(rubro => (
              <TableRow key={rubro.id}>
                <TableCell className="font-medium">{rubro.rubroNumber || '-'}</TableCell>
                <TableCell className="font-medium">{rubro.name}</TableCell>
                <TableCell>{rubro.unit}</TableCell>
                <TableCell>{parseFloat(rubro.quantity).toFixed(2)}</TableCell>
                <TableCell>{formatCurrency(rubro.unitPrice)}</TableCell>
                <TableCell>{formatCurrency(rubro.contractAmount)}</TableCell>
                <TableCell>{(rubro.quantities?.accumulated || 0).toFixed(2)}</TableCell>
                <TableCell>{formatCurrency(rubro.values?.accumulated || 0)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    <span className="mr-2 text-sm">{(rubro.progressPercentage || 0).toFixed(2)}%</span>
                    <div className="w-20 bg-muted rounded-full h-2.5 dark:bg-muted/50 shadow-inner">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${rubro.progressPercentage || 0}%` }}></div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProjectRubrosTable;