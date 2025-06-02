import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";

interface EventoFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function EventoForm({ initialData, onSubmit, onCancel }: EventoFormProps) {
  const [formData, setFormData] = React.useState({
    titulo: initialData?.titulo || '',
    tipo: initialData?.tipo || '',
    organizador: initialData?.organizador || '',
    ubicacion: initialData?.ubicacion || '',
    fechaInicio: initialData?.fechaInicio ? new Date(initialData.fechaInicio).toISOString().slice(0, 16) : '',
    fechaFin: initialData?.fechaFin ? new Date(initialData.fechaFin).toISOString().slice(0, 16) : '',
    estado: initialData?.estado || '',
    capacidad: initialData?.capacidad || '',
    asistentes: initialData?.asistentes || '',
    descripcion: initialData?.descripcion || '',
    requisitos: initialData?.requisitos || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      fechaInicio: formData.fechaInicio ? new Date(formData.fechaInicio) : null,
      fechaFin: formData.fechaFin ? new Date(formData.fechaFin) : null,
      capacidad: parseInt(formData.capacidad) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="titulo" className="text-right">
            Título
          </Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            className="col-span-3"
          />
        </div>

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
              <SelectItem value="reunion">Reunión</SelectItem>
              <SelectItem value="asamblea">Asamblea</SelectItem>
              <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="organizador" className="text-right">
            Organizador
          </Label>
          <Input
            id="organizador"
            value={formData.organizador}
            onChange={(e) => setFormData({ ...formData, organizador: e.target.value })}
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
          <Label htmlFor="fechaInicio" className="text-right">
            Fecha y Hora Inicio
          </Label>
          <Input
            id="fechaInicio"
            type="datetime-local"
            value={formData.fechaInicio}
            onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="fechaFin" className="text-right">
            Fecha y Hora Fin
          </Label>
          <Input
            id="fechaFin"
            type="datetime-local"
            value={formData.fechaFin}
            onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="estado" className="text-right">
            Estado
          </Label>
          <Select
            value={formData.estado}
            onValueChange={(value) => setFormData({ ...formData, estado: value })}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Seleccione el estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="programado">Programado</SelectItem>
              <SelectItem value="en_curso">En Curso</SelectItem>
              <SelectItem value="finalizado">Finalizado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="capacidad" className="text-right">
            Capacidad
          </Label>
          <Input
            id="capacidad"
            type="number"
            value={formData.capacidad}
            onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="asistentes" className="text-right">
            Asistentes
          </Label>
          <Input
            id="asistentes"
            value={formData.asistentes}
            onChange={(e) => setFormData({ ...formData, asistentes: e.target.value })}
            placeholder="Separados por comas"
            className="col-span-3"
          />
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
          <Label htmlFor="requisitos" className="text-right">
            Requisitos
          </Label>
          <Textarea
            id="requisitos"
            value={formData.requisitos}
            onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
            className="col-span-3"
          />
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