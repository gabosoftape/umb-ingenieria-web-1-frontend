import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CreateStageDto, StageService } from "@/services/stage.service";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth.context";

interface AddStageProps {
  onStageAdded?: () => void;
}

const AddStage = ({ onStageAdded }: AddStageProps) => {
  const t = useTranslations("CRMApp");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const {account} = useAuth();
  const [formData, setFormData] = useState<CreateStageDto>({
    name: "",
    requirements: "",
    is_won: false,
    sequence: 0,
    account_id: 1 // Este valor se sobreescribe en el servicio
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_won: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await StageService.createStage(formData, account.id!);
      toast({
        title: "Éxito",
        description: "Etapa creada correctamente",
        variant: "default",
      });
      setOpen(false);
      setFormData({
        name: "",
        requirements: "",
        is_won: false,
        sequence: 0,
        account_id: 1
      });
      if (onStageAdded) onStageAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al crear la etapa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 me-1" />
          {t("addStage")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear nueva etapa</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label htmlFor="name">Nombre de la etapa</Label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre de la etapa" 
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="requirements">Requisitos</Label>
            <Textarea 
              id="requirements" 
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Requisitos para esta etapa" 
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sequence">Secuencia</Label>
            <Input 
              id="sequence" 
              name="sequence"
              type="number"
              value={formData.sequence.toString()}
              onChange={(e) => setFormData(prev => ({ ...prev, sequence: parseInt(e.target.value) || 0 }))}
              placeholder="Orden de la etapa" 
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="is_won" 
              checked={formData.is_won}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="is_won">Etapa ganadora</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : t("addStage")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStage;