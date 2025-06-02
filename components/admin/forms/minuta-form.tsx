import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";

interface MinutaFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function MinutaForm({ initialData, onSubmit, onCancel }: MinutaFormProps) {
  const [formData, setFormData] = React.useState({
    tipo: initialData?.tipo || '',
    descripcion: initialData?.descripcion || '',
    ubicacion: initialData?.ubicacion || '',
    involucrados: initialData?.involucrados?.join(', ') || '',
    prioridad: initialData?.prioridad || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      involucrados: formData.involucrados.split(',').map(i => i.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="tipo" className="text-right">
            Tipo
          </Label>
          <Select
            value={formData.tipo}
            onValueChange={(value) => setFormData({ ...formData, tipo: value })}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Seleccione el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ingreso">Ingreso</SelectItem>
              <SelectItem value="salida">Salida</SelectItem>
              <SelectItem value="incidente">Incidente</SelectItem>
              <SelectItem value="ronda">Ronda</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="descripcion" className="text-right">
            Descripción
          </Label>
          <Textarea
            id="descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="ubicacion" className="text-right">
            Ubicación
          </Label>
          <Input
            id="ubicacion"
            value={formData.ubicacion}
            onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="involucrados" className="text-right">
            Involucrados
          </Label>
          <Input
            id="involucrados"
            value={formData.involucrados}
            onChange={(e) => setFormData({ ...formData, involucrados: e.target.value })}
            placeholder="Separados por comas"
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="prioridad" className="text-right">
            Prioridad
          </Label>
          <Select
            value={formData.prioridad}
            onValueChange={(value) => setFormData({ ...formData, prioridad: value })}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Seleccione la prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baja">Baja</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </DialogFooter>
    </form>
  );
} 