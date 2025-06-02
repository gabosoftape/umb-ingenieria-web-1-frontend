import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";

interface TurnoFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function TurnoForm({ initialData, onSubmit, onCancel }: TurnoFormProps) {
  const [formData, setFormData] = React.useState({
    portero: initialData?.portero || '',
    puesto: initialData?.puesto || '',
    horario: initialData?.horario || '',
    dias: initialData?.dias || '',
    estado: initialData?.estado || '',
    fechaInicio: initialData?.fechaInicio ? new Date(initialData.fechaInicio).toISOString().split('T')[0] : '',
    fechaFin: initialData?.fechaFin ? new Date(initialData.fechaFin).toISOString().split('T')[0] : '',
    reemplazo: initialData?.reemplazo || '',
    observaciones: initialData?.observaciones || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      fechaInicio: formData.fechaInicio ? new Date(formData.fechaInicio) : null,
      fechaFin: formData.fechaFin ? new Date(formData.fechaFin) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="portero" className="text-right">
            Portero
          </Label>
          <Input
            id="portero"
            value={formData.portero}
            onChange={(e) => setFormData({ ...formData, portero: e.target.value })}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="puesto" className="text-right">
            Puesto
          </Label>
          <Select
            value={formData.puesto}
            onValueChange={(value) => setFormData({ ...formData, puesto: value })}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Seleccione el puesto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada_principal">Entrada Principal</SelectItem>
              <SelectItem value="entrada_vehicular">Entrada Vehicular</SelectItem>
              <SelectItem value="torre_a">Torre A</SelectItem>
              <SelectItem value="torre_b">Torre B</SelectItem>
              <SelectItem value="areas_comunes">Áreas Comunes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="horario" className="text-right">
            Horario
          </Label>
          <Select
            value={formData.horario}
            onValueChange={(value) => setFormData({ ...formData, horario: value })}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Seleccione el horario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6am-2pm">6:00 AM - 2:00 PM</SelectItem>
              <SelectItem value="2pm-10pm">2:00 PM - 10:00 PM</SelectItem>
              <SelectItem value="10pm-6am">10:00 PM - 6:00 AM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="dias" className="text-right">
            Días
          </Label>
          <Input
            id="dias"
            value={formData.dias}
            onChange={(e) => setFormData({ ...formData, dias: e.target.value })}
            placeholder="Ej: Lunes a Viernes"
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
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
              <SelectItem value="vacaciones">Vacaciones</SelectItem>
              <SelectItem value="incapacidad">Incapacidad</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="fechaInicio" className="text-right">
            Fecha Inicio
          </Label>
          <Input
            id="fechaInicio"
            type="date"
            value={formData.fechaInicio}
            onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="fechaFin" className="text-right">
            Fecha Fin
          </Label>
          <Input
            id="fechaFin"
            type="date"
            value={formData.fechaFin}
            onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="reemplazo" className="text-right">
            Reemplazo
          </Label>
          <Input
            id="reemplazo"
            value={formData.reemplazo}
            onChange={(e) => setFormData({ ...formData, reemplazo: e.target.value })}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="observaciones" className="text-right">
            Observaciones
          </Label>
          <Textarea
            id="observaciones"
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
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