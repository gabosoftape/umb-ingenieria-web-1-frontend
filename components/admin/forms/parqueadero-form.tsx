import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ParqueaderoFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ParqueaderoForm({ initialData, onSubmit, onCancel }: ParqueaderoFormProps) {
  const [formData, setFormData] = React.useState({
    numero: initialData?.numero || '',
    tipo: initialData?.tipo || '',
    estado: initialData?.estado || '',
    asignadoA: initialData?.asignadoA || '',
    apartamento: initialData?.apartamento || '',
    vehiculo: {
      tipo: initialData?.vehiculo?.tipo || '',
      placa: initialData?.vehiculo?.placa || '',
      marca: initialData?.vehiculo?.marca || '',
      modelo: initialData?.vehiculo?.modelo || '',
    },
    observaciones: initialData?.observaciones || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="numero" className="text-right">
            Número
          </Label>
          <Input
            id="numero"
            value={formData.numero}
            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
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
              <SelectItem value="residente">Residente</SelectItem>
              <SelectItem value="visitante">Visitante</SelectItem>
              <SelectItem value="comercial">Comercial</SelectItem>
            </SelectContent>
          </Select>
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
              <SelectItem value="ocupado">Ocupado</SelectItem>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="asignadoA" className="text-right">
            Asignado A
          </Label>
          <Input
            id="asignadoA"
            value={formData.asignadoA}
            onChange={(e) => setFormData({ ...formData, asignadoA: e.target.value })}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="apartamento" className="text-right">
            Apartamento
          </Label>
          <Input
            id="apartamento"
            value={formData.apartamento}
            onChange={(e) => setFormData({ ...formData, apartamento: e.target.value })}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="vehiculoTipo" className="text-right">
            Tipo Vehículo
          </Label>
          <Select
            value={formData.vehiculo.tipo}
            onValueChange={(value) => setFormData({
              ...formData,
              vehiculo: { ...formData.vehiculo, tipo: value }
            })}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Seleccione el tipo de vehículo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="carro">Carro</SelectItem>
              <SelectItem value="moto">Moto</SelectItem>
              <SelectItem value="bicicleta">Bicicleta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="placa" className="text-right">
            Placa
          </Label>
          <Input
            id="placa"
            value={formData.vehiculo.placa}
            onChange={(e) => setFormData({
              ...formData,
              vehiculo: { ...formData.vehiculo, placa: e.target.value }
            })}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="marca" className="text-right">
            Marca
          </Label>
          <Input
            id="marca"
            value={formData.vehiculo.marca}
            onChange={(e) => setFormData({
              ...formData,
              vehiculo: { ...formData.vehiculo, marca: e.target.value }
            })}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="modelo" className="text-right">
            Modelo
          </Label>
          <Input
            id="modelo"
            value={formData.vehiculo.modelo}
            onChange={(e) => setFormData({
              ...formData,
              vehiculo: { ...formData.vehiculo, modelo: e.target.value }
            })}
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