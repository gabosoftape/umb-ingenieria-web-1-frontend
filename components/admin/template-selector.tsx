import React, { useEffect, useState } from 'react';
import { TemplateResponseModel, BlogsService } from '@/services/blogs.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplateSelectorProps {
  accountId: number;
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TemplateSelector({ accountId, value, onChange, disabled = false }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateResponseModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Asegurar que el valor es siempre una cadena
  const selectedValue = value || "";

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("TemplateSelector: Cargando templates con accountId:", accountId);
        // Si no hay accountId, intenta cargar todos los templates
        const templatesData = await BlogsService.getTemplates(accountId);
        console.log("TemplateSelector: Templates cargados:", templatesData);
        
        setTemplates(templatesData);
        
        // Si hay un valor seleccionado, verificar que esté en la lista
        if (value && templatesData.length > 0) {
          const templateExists = templatesData.some(t => t.id === value);
          if (!templateExists) {
            console.warn(`Template con ID ${value} no encontrado en la lista de templates`);
          }
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('No se pudieron cargar los templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [accountId]);

  const handleValueChange = (newValue: string) => {
    console.log("TemplateSelector: Seleccionado nuevo template:", newValue);
    const selectedTemplate = templates.find(t => t.id === newValue);
    console.log("TemplateSelector: Datos del template seleccionado:", selectedTemplate);
    onChange(newValue);
  };

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        {error}
        <div className="mt-1 text-xs text-gray-500">
          {templates.length > 0 ? `${templates.length} templates cargados a pesar del error` : 'No se cargaron templates'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Select
        value={selectedValue}
        onValueChange={handleValueChange}
        disabled={disabled || templates.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar template" />
        </SelectTrigger>
        <SelectContent>
          {templates.length === 0 ? (
            <SelectItem value="no-templates" disabled>
              No hay templates disponibles
            </SelectItem>
          ) : (
            templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name || template.id}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {value && (
        <div className="mt-1 text-xs text-gray-500">
          Template ID: {value}
        </div>
      )}
    </div>
  );
} 