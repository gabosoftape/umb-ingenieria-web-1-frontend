"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import Select, { MultiValue } from 'react-select'
import { EditLeadsDto, Lead, LeadsService } from "@/services/leads.service";
import { Stage, StageService } from "@/services/stage.service";
import { useAuth } from "@/contexts/auth.context";
import { useToast } from "@/components/ui/use-toast";


interface Option {
  value: string;
  label: string;
  image?: string;
}

const typeOptions: Option[] = [
  {
    value: "cliente",
    label: "Cliente",
  },
  {
    value: "prospecto",
    label: "Prospecto",
  },
  {
    value: "oportunidad",
    label: "Oportunidad",
  },
];


interface EditLeadProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  lead: Lead;
  onLeadUpdated?: () => void;
}


const EditLead = ({ open, setOpen, lead, onLeadUpdated }: EditLeadProps) => {
  const {user} = useAuth();
  const { toast } = useToast();
  const { account } = useAuth();

  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Lead>({
    defaultValues: {
      name: lead.name,
      description: lead.description,
      type: lead.type,
      stage_id: lead.stage_id,
    },
  })
  
  const onSubmit: SubmitHandler<Lead> = async (data) => {
    try {
      setLoading(true);
      
      const leadData: EditLeadsDto = {
        id: lead.id,
        name: data.name,
        description: data.description,
        type: data.type,
        stage_id: parseInt(data.stage_id.toString()),
        user_id: user?.id || "", // Esto debería venir del usuario autenticado
        account_id: 1, // Esto debería venir del usuario autenticado
        active: true
      };
      
      await LeadsService.updateLeads(leadData, account.id!);
      
      toast({
        title: "Éxito",
        description: "Lead actualizado correctamente",
        variant: "default",
      });
      
      reset();
      setOpen(false);
      
      // Notificar al componente padre que se ha creado un nuevo lead
      if (onLeadUpdated) {
        onLeadUpdated();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el lead",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }


  const [stages, setStages] = useState<Stage[]>([]);

  const fetchStages = async () => {
    try {
      const stagesData = await StageService.getStages();
      setStages(stagesData);
    } catch (error) {
      console.error("Error al cargar las etapas:", error);
    }
  };
  // Cargar las etapas al abrir el modal
  useEffect(() => {
    if (open) {
      fetchStages();
    }
  }, [open]);
  
  const stageOptions = stages.map(stage => ({
    value: stage.id.toString(),
    label: stage.name
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nombre del Lead</Label>
            <Input
              id="name"
              placeholder="Nombre del lead"
              {...register("name", { required: "El nombre es obligatorio" })}
              color={errors.name ? "destructive" : "default"}
            />
            {errors.name && <p className="text-destructive text-sm font-medium">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="type">Tipo</Label>
            <Controller
              name="type"
              control={control}
              rules={{ required: "El tipo es obligatorio" }}
              render={({ field }) => (
                <Select
                  className="react-select"
                  classNamePrefix="select"
                  options={typeOptions}
                  value={typeOptions.find(option => option.value === field.value)}
                  onChange={(option) => field.onChange(option?.value)}
                  placeholder="Selecciona un tipo"
                />
              )}
            />
            {errors.type && <p className="text-destructive text-sm font-medium">{errors.type.message}</p>}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="stage_id">Etapa</Label>
            <Controller
              name="stage_id"
              control={control}
              rules={{ required: "La etapa es obligatoria" }}
              render={({ field }) => (
                <Select
                  className="react-select"
                  classNamePrefix="select"
                  options={stageOptions}
                  value={stageOptions.find(option => option.value === field.value?.toString())}
                  onChange={(option) => field.onChange(option?.value)}
                  placeholder="Selecciona una etapa"
                  isDisabled={stageOptions.length === 0}
                />
              )}
            />
            {errors.stage_id && <p className="text-destructive text-sm font-medium">{errors.stage_id.message}</p>}
            {stageOptions.length === 0 && <p className="text-amber-500 text-sm">No hay etapas disponibles. Crea una etapa primero.</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción del lead"
              {...register("description")}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={loading || stageOptions.length === 0}
            >
              {loading ? "Creando..." : "Crear Lead"}
            </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
};

export default EditLead;
