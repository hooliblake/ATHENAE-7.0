import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, ListOrdered, UploadCloud } from 'lucide-react';
import { UNIT_TYPES } from '@/config/constants';
import * as XLSX from 'xlsx';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

const sectionCardVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.5 } },
};

const ProjectRubrosForm = ({ rubros, handleRubroChange, handleRubroUnitChange, addRubro, removeRubro, setRubros }) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const safeRubros = Array.isArray(rubros) ? rubros : [];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length <= 1) {
          toast({ title: "Error de Importación", description: "El archivo Excel está vacío o no tiene datos después de la cabecera.", variant: "destructive" });
          return;
        }
        
        const importedRubros = jsonData.slice(1).map((row, index) => {
          if (row.length < 5) {
            toast({ title: "Error de Fila", description: `La fila ${index + 2} tiene menos de 5 columnas. Se omitirá.`, variant: "warning" });
            return null;
          }
          const [rubroNumber, name, unit, quantity, unitPrice] = row;
          if (!name || !unit || quantity === undefined || unitPrice === undefined) {
             toast({ title: "Dato Faltante", description: `Faltan datos esenciales en la fila ${index + 2} del Excel (Descripción, Unidad, Cantidad o Precio Unitario). Se omitirá.`, variant: "warning" });
            return null;
          }
          return {
            id: uuidv4(),
            rubroNumber: rubroNumber || '',
            name: String(name),
            unit: String(unit).toUpperCase(),
            quantity: String(quantity),
            unitPrice: String(unitPrice),
          };
        }).filter(Boolean);

        if (importedRubros.length > 0) {
          // Correctamente llama a la función 'setRubros' (que es 'setRubrosBatch' del padre)
          // para actualizar el estado en ProjectSetupPage
          setRubros([...safeRubros, ...importedRubros]);
          toast({ title: "Importación Exitosa", description: `${importedRubros.length} rubros importados correctamente.` });
        } else {
          toast({ title: "Sin Datos Válidos", description: "No se encontraron rubros válidos para importar en el archivo.", variant: "warning" });
        }

      } catch (error) {
        console.error("Error importing rubros:", error);
        toast({ title: "Error de Importación", description: "Hubo un problema al procesar el archivo Excel. Verifique el formato.", variant: "destructive" });
      } finally {
        if(fileInputRef.current) {
            fileInputRef.current.value = ""; 
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <motion.div variants={sectionCardVariants} initial="initial" animate="in">
      <Card className="glassmorphic shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><ListOrdered className="mr-3 h-6 w-6 text-primary" />Rubros del Proyecto</CardTitle>
          <CardDescription>Defina los rubros, unidades, cantidades y precios unitarios. Puede agregar manualmente o importar desde Excel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
              <UploadCloud className="mr-2 h-4 w-4" /> Importar Rubros (Excel)
            </Button>
            <Input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".xlsx, .xls"
            />
          </div>

          {safeRubros.map((rubro, index) => (
            <motion.div 
              key={rubro.id} 
              className="p-4 border border-border/50 rounded-lg bg-card/30 shadow-sm space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-1.5">
                  <Label htmlFor={`rubro-number-${index}`} className="text-sm font-medium text-muted-foreground">N° Rubro</Label>
                  <Input
                    id={`rubro-number-${index}`}
                    name="rubroNumber"
                    value={rubro.rubroNumber || ''}
                    onChange={(e) => handleRubroChange(index, e)}
                    placeholder="Ej: 1.1"
                    className="bg-background/70 backdrop-blur-sm"
                  />
                </div>
                <div className="lg:col-span-2 space-y-1.5">
                  <Label htmlFor={`rubro-name-${index}`} className="text-sm font-medium text-muted-foreground">Descripción del Rubro</Label>
                  <Textarea
                    id={`rubro-name-${index}`}
                    name="name"
                    value={rubro.name}
                    onChange={(e) => handleRubroChange(index, e)}
                    placeholder="Ej: Excavación manual"
                    className="bg-background/70 backdrop-blur-sm"
                    rows={1}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`rubro-unit-${index}`} className="text-sm font-medium text-muted-foreground">Unidad</Label>
                  <Select
                    value={rubro.unit}
                    onValueChange={(value) => handleRubroUnitChange(index, value)}
                  >
                    <SelectTrigger id={`rubro-unit-${index}`} className="bg-background/70 backdrop-blur-sm">
                      <SelectValue placeholder="Seleccione unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_TYPES.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`rubro-quantity-${index}`} className="text-sm font-medium text-muted-foreground">Cantidad Contractual</Label>
                  <Input
                    id={`rubro-quantity-${index}`}
                    name="quantity"
                    type="number"
                    value={rubro.quantity}
                    onChange={(e) => handleRubroChange(index, e)}
                    placeholder="Ej: 100"
                    className="bg-background/70 backdrop-blur-sm"
                    step="any"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`rubro-unitPrice-${index}`} className="text-sm font-medium text-muted-foreground">Precio Unitario ($)</Label>
                  <Input
                    id={`rubro-unitPrice-${index}`}
                    name="unitPrice"
                    type="number"
                    value={rubro.unitPrice}
                    onChange={(e) => handleRubroChange(index, e)}
                    placeholder="Ej: 25.50"
                    className="bg-background/70 backdrop-blur-sm"
                    step="any"
                  />
                </div>
                <div className="md:col-start-3 lg:col-start-auto flex justify-end items-end">
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeRubro(index)} className="mt-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          <Button type="button" variant="outline" onClick={addRubro} className="w-full border-dashed border-primary text-primary hover:bg-primary/10">
            <PlusCircle className="mr-2 h-4 w-4" /> Agregar Rubro Manualmente
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProjectRubrosForm;