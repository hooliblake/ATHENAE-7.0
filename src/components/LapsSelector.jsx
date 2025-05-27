import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Hash } from 'lucide-react';

export const LapsSelector = ({ laps, setLaps }) => {
  return (
    <div className="space-y-3">
      <Label htmlFor="laps" className="flex items-center text-lg font-medium text-foreground">
        <Hash className="mr-2 h-5 w-5 text-primary" /> Número de Vueltas
      </Label>
      <Select value={laps.toString()} onValueChange={(value) => setLaps(parseInt(value))}>
        <SelectTrigger id="laps" className="w-full text-base py-6 bg-input border-border focus:border-primary focus:ring-primary">
          <SelectValue placeholder="Selecciona número de vueltas" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-primary/50">
          {[...Array(20).keys()].map(i => (
            <SelectItem key={i + 1} value={(i + 1).toString()} className="focus:bg-accent/80 focus:text-accent-foreground">
              {i + 1} Vueltas
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};