"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import Select from 'react-select'
import { CreateLeadsDto, Lead, LeadsService } from "@/services/leads.service";
import { Stage, StageService } from "@/services/stage.service";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/auth.context";

interface CreateLeadProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onLeadCreated?: () => void;
}
interface Option {
  value: string;
  label: string;
  image?: string;
}
type Inputs = {
  name: string;
  description: string;
  type: string;
  stage_id: number;
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

const CreateLead = ({ open, setOpen, onLeadCreated }: CreateLeadProps) => {
  const t = useTranslations("CRMApp");
  const { user } = useAuth();
  const { toast } = useToast();
  const { account } = useAuth();
  const [loading, setLoading] = useState(false);
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
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Inputs>()
  
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      setLoading(true);
      
      const leadData: CreateLeadsDto = {
        name: data.name,
        description: data.description,
        type: data.type,
        stage_id: parseInt(data.stage_id.toString()),
        user_id: user?.id || "", // Esto debería venir del usuario autenticado
        account_id: 1, // Esto debería venir del usuario autenticado
        active: true
      };
      
      await LeadsService.createLeads(leadData as Lead, account.id!);
      
      toast({
        title: "Éxito",
        description: "Lead creado correctamente",
        variant: "default",
      });
      
      reset();
      setOpen(false);
      
      // Notificar al componente padre que se ha creado un nuevo lead
      if (onLeadCreated) {
        onLeadCreated();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al crear el lead",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createLead")}</DialogTitle>
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

export default CreateLead;
