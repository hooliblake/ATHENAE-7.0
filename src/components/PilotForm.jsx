import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Users, Trash2 } from 'lucide-react';

export const PilotForm = ({ pilot, index, onPilotChange, onRemovePilot, canRemove }) => {
  return (
    <div className="p-6 border border-border/70 rounded-lg bg-card/80 space-y-5 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <Label className="text-xl font-semibold flex items-center text-primary">
          <Users className="mr-2 h-6 w-6" /> Piloto {index + 1}
        </Label>
        {canRemove && (
          <Button variant="ghost" size="icon" onClick={() => onRemovePilot(pilot.id)} className="text-destructive hover:text-destructive/80">
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="space-y-1">
        <Label htmlFor={`pilot-name-${pilot.id}`} className="text-sm text-muted-foreground">Nombre Completo</Label>
        <Input
          id={`pilot-name-${pilot.id}`}
          placeholder="Ej: Juan Pérez"
          value={pilot.name}
          onChange={(e) => onPilotChange(pilot.id, 'name', e.target.value)}
          className="text-base py-5 bg-input border-border focus:border-primary focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor={`pilot-id-${pilot.id}`} className="text-sm text-muted-foreground">Identificación (Cédula/Pasaporte)</Label>
          <Input
            id={`pilot-id-${pilot.id}`}
            placeholder="Ej: 123456789"
            value={pilot.identification}
            onChange={(e) => onPilotChange(pilot.id, 'identification', e.target.value)}
            className="text-base py-5 bg-input border-border focus:border-primary focus:ring-primary"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`pilot-age-${pilot.id}`} className="text-sm text-muted-foreground">Edad</Label>
          <Input
            id={`pilot-age-${pilot.id}`}
            type="number"
            placeholder="Ej: 25"
            value={pilot.age}
            onChange={(e) => onPilotChange(pilot.id, 'age', e.target.value)}
            className="text-base py-5 bg-input border-border focus:border-primary focus:ring-primary"
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor={`pilot-phone-${pilot.id}`} className="text-sm text-muted-foreground">Número de Celular</Label>
        <Input
          id={`pilot-phone-${pilot.id}`}
          type="tel"
          placeholder="Ej: 3001234567"
          value={pilot.phone}
          onChange={(e) => onPilotChange(pilot.id, 'phone', e.target.value)}
          className="text-base py-5 bg-input border-border focus:border-primary focus:ring-primary"
        />
      </div>

      <div className="items-top flex space-x-3 mt-3 pt-3 border-t border-border/50">
        <Checkbox
          id={`terms-${pilot.id}`}
          checked={pilot.agreed}
          onCheckedChange={(checked) => onPilotChange(pilot.id, 'agreed', checked)}
          className="mt-1 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor={`terms-${pilot.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
          >
            Acepto el acuerdo de responsabilidad
          </label>
          <p className="text-xs text-muted-foreground">
            Declaro que entiendo los riesgos y libero de responsabilidad al establecimiento.
            (La firma digital se implementaría aquí en un escenario real).
          </p>
        </div>
      </div>
    </div>
  );
};