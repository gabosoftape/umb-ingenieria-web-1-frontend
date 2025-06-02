import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogsService } from '@/services/blogs.service';
import { ZoomIn, ZoomOut, Maximize2, List, Grid, Edit2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TemplateNodeViewerProps {
  templateId: string | null;
  nodes?: string;
  onNodesChange?: (nodes: string) => void;
}

interface Node {
  id: string;
  name: string;
  type: string;
  position?: {
    x: number;
    y: number;
  };
  parameters?: any;
  [key: string]: any;
}

type ViewMode = 'grid' | 'list';

type WhatsAppMessageType = 
  | 'text' 
  | 'image' 
  | 'video' 
  | 'document' 
  | 'audio'
  | 'button'
  | 'catalog_message'
  | 'list'
  | 'product'
  | 'product_list'
  | 'flow';

export const WHATSAPP_MESSAGE_TYPES: Record<WhatsAppMessageType, {
  name: string;
  description: string;
  color: string;
}> = {
  text: {
    name: 'Mensaje de Texto',
    description: 'Envía un mensaje de texto simple',
    color: '#25D366'
  },
  image: {
    name: 'Mensaje de Imagen',
    description: 'Envía una imagen con texto opcional',
    color: '#128C7E'
  },
  video: {
    name: 'Mensaje de Video',
    description: 'Envía un video con texto opcional',
    color: '#075E54'
  },
  document: {
    name: 'Mensaje de Documento',
    description: 'Envía un documento con texto opcional',
    color: '#34B7F1'
  },
  audio: {
    name: 'Mensaje de Audio',
    description: 'Envía un mensaje de voz',
    color: '#1DA1F2'
  },
  button: {
    name: 'Botones de Respuesta',
    description: 'Envía mensaje con botones interactivos',
    color: '#FF6B6B'
  },
  catalog_message: {
    name: 'Mensaje de Catálogo',
    description: 'Envía un mensaje con catálogo de productos',
    color: '#4ECDC4'
  },
  list: {
    name: 'Mensaje de Lista',
    description: 'Envía un mensaje con lista de opciones',
    color: '#FFD93D'
  },
  product: {
    name: 'Mensaje de Producto',
    description: 'Envía información de un producto específico',
    color: '#95E1D3'
  },
  product_list: {
    name: 'Lista de Productos',
    description: 'Envía una lista de productos',
    color: '#FCE38A'
  },
  flow: {
    name: 'Mensaje de Flow',
    description: 'Envía un mensaje con flujo interactivo',
    color: '#E84A5F'
  }
};

interface Button {
  id: string;
  title: string;
}

interface ListRow {
  id: string;
  title: string;
  description?: string;
}

interface ListSection {
  title: string;
  rows: ListRow[];
}

interface NodeEditorProps {
  node: Node;
  onSave: (updatedNode: Node) => void;
  onClose: () => void;
}

const NodeEditor: React.FC<NodeEditorProps> = ({ node, onSave, onClose }) => {
  const [editedNode, setEditedNode] = useState<Node>({ ...node });
  
  // Parsear el contenido del nodo
  const parseNodeContent = () => {
    try {
      const jsonBody = JSON.parse(node.parameters?.jsonBody?.replace('=', '') || '{}');
      return jsonBody;
    } catch (e) {
      console.error('Error parsing node content:', e);
      return {};
    }
  };

  const nodeContent = parseNodeContent();
  const isInteractive = nodeContent.type === 'interactive';
  const interactiveContent = isInteractive ? nodeContent.interactive : null;
  
  const [messageType, setMessageType] = useState<WhatsAppMessageType>(
    isInteractive ? interactiveContent?.type as WhatsAppMessageType : nodeContent.type as WhatsAppMessageType || 'text'
  );

  const [headerText, setHeaderText] = useState<string>(
    isInteractive ? interactiveContent?.header?.text || '' : ''
  );

  const [bodyText, setBodyText] = useState<string>(
    isInteractive ? interactiveContent?.body?.text || '' : nodeContent.text?.body || ''
  );

  const [footerText, setFooterText] = useState<string>(
    isInteractive ? interactiveContent?.footer?.text || '' : ''
  );

  // Estados para botones
  const [buttons, setButtons] = useState<Button[]>(() => {
    if (isInteractive && interactiveContent?.action?.buttons) {
      return interactiveContent.action.buttons.map((b: any) => ({
        id: b.reply?.id || '',
        title: b.reply?.title || ''
      }));
    }
    return [];
  });

  // Estados para listas
  const [listButtonText, setListButtonText] = useState<string>(
    isInteractive && interactiveContent?.action?.button ? 
    interactiveContent.action.button : ''
  );

  const [sections, setSections] = useState<ListSection[]>(
    isInteractive && interactiveContent?.action?.sections ? 
    interactiveContent.action.sections : [{ title: '', rows: [] }]
  );

  // Funciones para manejar botones
  const addButton = () => {
    if (buttons.length < 3) {
      setButtons([...buttons, { id: '', title: '' }]);
    }
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const updateButton = (index: number, field: keyof Button, value: string) => {
    const newButtons = [...buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setButtons(newButtons);
  };

  // Funciones para manejar secciones de lista
  const addSection = () => {
    if (sections.length < 10) {
      setSections([...sections, { title: '', rows: [] }]);
    }
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const updateSectionTitle = (index: number, title: string) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], title };
    setSections(newSections);
  };

  const addRow = (sectionIndex: number) => {
    const section = sections[sectionIndex];
    if (section.rows.length < 10) {
      const newSections = [...sections];
      newSections[sectionIndex].rows.push({ id: '', title: '', description: '' });
      setSections(newSections);
    }
  };

  const removeRow = (sectionIndex: number, rowIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].rows = newSections[sectionIndex].rows.filter((_, i) => i !== rowIndex);
    setSections(newSections);
  };

  const updateRow = (sectionIndex: number, rowIndex: number, field: keyof ListRow, value: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].rows[rowIndex] = {
      ...newSections[sectionIndex].rows[rowIndex],
      [field]: value
    };
    setSections(newSections);
  };

  const handleSave = () => {
    const updatedNode = { ...editedNode };
    
    if (updatedNode.parameters) {
      let newContent: any = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: "{{ $('Workflow Input Trigger').all()[0].json.contacts[0].wa_id }}"
      };

      if (messageType === 'text') {
        newContent.type = 'text';
        newContent.text = {
          body: bodyText
        };
      } else {
        newContent.type = 'interactive';
        newContent.interactive = {
          type: messageType,
          header: headerText ? {
            type: 'text',
            text: headerText
          } : undefined,
          body: {
            text: bodyText
          },
          footer: footerText ? {
            text: footerText
          } : undefined,
          action: {}
        };

        switch (messageType) {
          case 'button':
            newContent.interactive.action.buttons = buttons.map(button => ({
              type: 'reply',
              reply: {
                id: button.id,
                title: button.title
              }
            }));
            break;
          case 'list':
            newContent.interactive.action.button = listButtonText;
            newContent.interactive.action.sections = sections.map(section => ({
              title: section.title,
              rows: section.rows.map(row => ({
                id: row.id,
                title: row.title,
                description: row.description
              }))
            }));
            break;
        }
      }

      updatedNode.parameters.jsonBody = `=${JSON.stringify(newContent, null, 2)}`;
    }

    onSave(updatedNode);
  };

  const renderFieldsByType = () => {
    return (
      <>
        <div className="grid gap-2">
          <Label htmlFor="headerText">Encabezado (máx. 60 caracteres)</Label>
          <Input
            id="headerText"
            value={headerText}
            onChange={(e) => setHeaderText(e.target.value.slice(0, 60))}
            placeholder="Texto del encabezado..."
            maxLength={60}
          />
        </div>

        <div className="grid gap-2 mt-4">
          <Label htmlFor="bodyText">Cuerpo del Mensaje (máx. 1024 caracteres)</Label>
          <Textarea
            id="bodyText"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value.slice(0, 1024))}
            placeholder="Escribe el contenido del mensaje..."
            className="min-h-[100px]"
            maxLength={1024}
          />
        </div>

        <div className="grid gap-2 mt-4">
          <Label htmlFor="footerText">Pie de Página (máx. 60 caracteres)</Label>
          <Input
            id="footerText"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value.slice(0, 60))}
            placeholder="Texto del pie de página..."
            maxLength={60}
          />
        </div>

        {messageType === 'button' && (
          <div className="grid gap-4 mt-4">
            <div className="flex justify-between items-center">
              <Label>Botones (máx. 3)</Label>
              {buttons.length < 3 && (
                <Button type="button" variant="outline" size="sm" onClick={addButton}>
                  Añadir Botón
                </Button>
              )}
            </div>
            {buttons.map((button, index) => (
              <div key={index} className="grid gap-2 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <Label>Botón {index + 1}</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeButton(index)}
                  >
                    Eliminar
                  </Button>
                </div>
                <Input
                  placeholder="ID del botón (máx. 256 caracteres)"
                  value={button.id}
                  onChange={(e) => updateButton(index, 'id', e.target.value.slice(0, 256))}
                  maxLength={256}
                />
                <Input
                  placeholder="Título del botón (máx. 20 caracteres)"
                  value={button.title}
                  onChange={(e) => updateButton(index, 'title', e.target.value.slice(0, 20))}
                  maxLength={20}
                />
              </div>
            ))}
          </div>
        )}

        {messageType === 'list' && (
          <div className="grid gap-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="listButtonText">Texto del Botón (máx. 20 caracteres)</Label>
              <Input
                id="listButtonText"
                value={listButtonText}
                onChange={(e) => setListButtonText(e.target.value.slice(0, 20))}
                placeholder="Ver opciones"
                maxLength={20}
              />
            </div>

            <div className="flex justify-between items-center">
              <Label>Secciones (máx. 10)</Label>
              {sections.length < 10 && (
                <Button type="button" variant="outline" size="sm" onClick={addSection}>
                  Añadir Sección
                </Button>
              )}
            </div>

            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="grid gap-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <Label>Sección {sectionIndex + 1}</Label>
                  {sections.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeSection(sectionIndex)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>

                <Input
                  placeholder="Título de la sección (máx. 24 caracteres)"
                  value={section.title}
                  onChange={(e) => updateSectionTitle(sectionIndex, e.target.value.slice(0, 24))}
                  maxLength={24}
                />

                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label>Opciones (máx. 10 por sección)</Label>
                    {section.rows.length < 10 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addRow(sectionIndex)}
                      >
                        Añadir Opción
                      </Button>
                    )}
                  </div>

                  {section.rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid gap-2 p-3 border rounded-md">
                      <div className="flex justify-between items-center">
                        <Label>Opción {rowIndex + 1}</Label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeRow(sectionIndex, rowIndex)}
                        >
                          Eliminar
                        </Button>
                      </div>
                      <Input
                        placeholder="ID de la opción (máx. 200 caracteres)"
                        value={row.id}
                        onChange={(e) => updateRow(sectionIndex, rowIndex, 'id', e.target.value.slice(0, 200))}
                        maxLength={200}
                      />
                      <Input
                        placeholder="Título de la opción (máx. 24 caracteres)"
                        value={row.title}
                        onChange={(e) => updateRow(sectionIndex, rowIndex, 'title', e.target.value.slice(0, 24))}
                        maxLength={24}
                      />
                      <Input
                        placeholder="Descripción (máx. 72 caracteres)"
                        value={row.description || ''}
                        onChange={(e) => updateRow(sectionIndex, rowIndex, 'description', e.target.value.slice(0, 72))}
                        maxLength={72}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent style={{ width: '70vw', maxWidth: '70vw' }} className="h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Editar Nodo de WhatsApp</DialogTitle>
          <div className="text-sm text-gray-500">
            Tipo actual: {WHATSAPP_MESSAGE_TYPES[messageType].name}
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="messageType">Cambiar Tipo de Mensaje</Label>
            <Select
              value={messageType}
              onValueChange={(value) => setMessageType(value as WhatsAppMessageType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WHATSAPP_MESSAGE_TYPES).map(([type, info]) => (
                  <SelectItem key={type} value={type}>
                    {info.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderFieldsByType()}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const TemplateNodeViewer: React.FC<TemplateNodeViewerProps> = ({ 
  templateId, 
  nodes: propNodes,
  onNodesChange 
}) => {
  const [templateNodes, setTemplateNodes] = useState<string>('');
  const [parsedNodes, setParsedNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [debugInfo, setDebugInfo] = useState<string>('No template selected');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<Node | null>(null);

  // Determinar el color del nodo según su tipo
  const getNodeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'n8n-nodes-base.httpRequest': '#5096F3',
      'n8n-nodes-base.function': '#607D8B',
      'n8n-nodes-base.set': '#4CAF50',
      'n8n-nodes-base.if': '#FF9800',
      'n8n-nodes-base.switch': '#FF5722',
      'n8n-nodes-base.webhook': '#03A9F4',
      'n8n-nodes-base.emailSend': '#00BCD4',
      'n8n-nodes-base.googleSheets': '#0F9D58',
      'n8n-nodes-base.noOp': '#9E9E9E',
      'n8n-nodes-base.wait': '#795548',
      'trigger': '#E91E63',
      'action': '#3F51B5',
      'helper': '#8BC34A',
      'default': '#9C27B0'
    };

    return typeColors[type] || typeColors.default;
  };

  // Funciones para zoom y pan
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setScale(prev => Math.max(prev - 0.1, 0.2));
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Cambiar entre vista de lista y cuadrícula
  const toggleViewMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  // Manejo de eventos para arrastrar el canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = (e.clientX - dragStart.x);
    const dy = (e.clientY - dragStart.y);
    
    setPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Obtener tipo abreviado del nodo para mostrar en UI
  const getShortNodeType = (type: string) => {
    const parts = type.split(/[\.-]/);
    return parts[parts.length - 1] || type;
  };

  // Determinar si un nodo es de WhatsApp
  const isWhatsAppNode = (node: Node): boolean => {
    return node.type === 'n8n-nodes-base.httpRequest' && 
           node.parameters?.url?.includes('graph.facebook.com') &&
           node.parameters?.url?.includes('messages');
  };

  // Obtener el tipo de mensaje de WhatsApp
  const getWhatsAppMessageType = (node: Node): WhatsAppMessageType => {
    if (!isWhatsAppNode(node)) return 'text';
    
    try {
      const jsonBody = JSON.parse(node.parameters?.jsonBody?.replace('=', '') || '{}');
      if (jsonBody.type === 'interactive') {
        return jsonBody.interactive.type as WhatsAppMessageType;
      }
      return jsonBody.type as WhatsAppMessageType;
    } catch (e) {
      console.error('Error parsing WhatsApp message type:', e);
      return 'text';
    }
  };

  // Cambiar el tipo de mensaje de WhatsApp
  const handleMessageTypeChange = (nodeId: string, newType: string) => {
    const updatedNodes = parsedNodes.map(node => {
      if (node.id === nodeId) {
        const updatedNode = { ...node };
        if (updatedNode.parameters?.body) {
          updatedNode.parameters.body.type = newType;
        }
        return updatedNode;
      }
      return node;
    });

    setParsedNodes(updatedNodes);
    if (onNodesChange) {
      onNodesChange(JSON.stringify(updatedNodes));
    }
    setEditingNodeId(null);
  };

  useEffect(() => {
    const fetchTemplateNodes = async () => {
      if (templateId) {
        setLoading(true);
        try {
          const response = await BlogsService.getTemplateById(templateId);
          if (response.status === 200 && response.data) {
            setTemplateNodes(response.data.nodes || '');
            try {
              const parsed = JSON.parse(response.data.nodes || '[]');
              setParsedNodes(parsed);
            } catch (e) {
              console.error('Error parsing nodes:', e);
              setParsedNodes([]);
            }
          }
        } catch (error) {
          console.error('Error fetching template nodes:', error);
          setError('Error al cargar los nodos del template');
        } finally {
          setLoading(false);
        }
      }
    };

    if (templateId) {
      fetchTemplateNodes();
    }
  }, [templateId]);

  // Procesar los nodos del prop si están disponibles
  useEffect(() => {
    if (propNodes) {
      try {
        const parsed = JSON.parse(propNodes);
        setParsedNodes(parsed);
      } catch (e) {
        console.error('Error parsing prop nodes:', e);
        setParsedNodes([]);
      }
    }
  }, [propNodes]);

  const handleNodeEdit = (node: Node) => {
    setEditingNode(node);
  };

  const handleNodeSave = (updatedNode: Node) => {
    const updatedNodes = parsedNodes.map(node => 
      node.id === updatedNode.id ? updatedNode : node
    );
    setParsedNodes(updatedNodes);
    if (onNodesChange) {
      onNodesChange(JSON.stringify(updatedNodes));
    }
    setEditingNode(null);
  };

  const renderNodeContent = (node: Node, index: number) => {
    const isWhatsApp = isWhatsAppNode(node);
    const messageType = isWhatsApp ? getWhatsAppMessageType(node) : 'text';
    const nodeColor = isWhatsApp ? WHATSAPP_MESSAGE_TYPES[messageType].color : getNodeColor(node.type);
    const shortType = isWhatsApp ? WHATSAPP_MESSAGE_TYPES[messageType].name : getShortNodeType(node.type);

    return (
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-800 truncate" title={node.name}>
            {node.name}
          </h3>
          <div className="flex items-center space-x-2">
            {isWhatsApp && onNodesChange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNodeEdit(node);
                }}
                type="button"
              >
                <Edit2 size={16} />
              </Button>
            )}
            <span 
              className="text-xs px-2 py-1 rounded-full" 
              style={{ backgroundColor: `${nodeColor}20`, color: nodeColor }}
            >
              {shortType}
            </span>
          </div>
        </div>
        
        {node.parameters && (
          <div className="mt-2 text-xs text-gray-600">
            <div className="flex flex-wrap gap-1">
              {Object.entries(node.parameters).slice(0, 3).map(([key, value]) => (
                <span key={key} className="px-1.5 py-0.5 bg-gray-100 rounded truncate" title={key}>
                  {key}
                </span>
              ))}
              {Object.keys(node.parameters).length > 3 && (
                <span className="px-1.5 py-0.5 bg-gray-100 rounded opacity-70">
                  +{Object.keys(node.parameters).length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="h-[500px] overflow-hidden">
        <CardHeader>
          <CardTitle>Cargando template</CardTitle>
          <div className="h-4 mt-1">
            <Skeleton className="h-4 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 h-[500px] overflow-hidden">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">{debugInfo}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!templateId && !propNodes) {
    return (
      <Card className="h-[500px] overflow-hidden">
        <CardHeader>
          <CardTitle>Vista de Nodos</CardTitle>
          <CardDescription>
            Seleccione un template para ver sus nodos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">No hay nodos disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-[500px] overflow-hidden">
        <CardHeader className="sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Nodos del Flow</CardTitle>
              <CardDescription>Total de nodos: {parsedNodes.length}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleViewMode}
                      type="button"
                    >
                      {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cambiar a vista de {viewMode === 'grid' ? 'lista' : 'cuadrícula'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {viewMode === 'grid' && (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleZoomIn}
                          type="button"
                        >
                          <ZoomIn size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Acercar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleZoomOut}
                          type="button"
                        >
                          <ZoomOut size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Alejar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleReset}
                          type="button"
                        >
                          <Maximize2 size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Restablecer vista</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className={`p-0 h-[calc(100%-60px)] ${viewMode === 'list' ? 'overflow-auto' : 'overflow-hidden'}`}>
          {viewMode === 'grid' ? (
            <div 
              ref={containerRef}
              className="w-full h-full bg-gray-50 overflow-hidden cursor-grab"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div 
                className="relative w-full h-full"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  transformOrigin: '0 0',
                  transition: isDragging ? 'none' : 'transform 0.1s'
                }}
              >
                {parsedNodes.map((node: Node, index: number) => {
                  const xPos = 50 + (index * 300);
                  const yPos = 50 + (index % 2) * 50;
                  const isWhatsApp = isWhatsAppNode(node);
                  const messageType = isWhatsApp ? getWhatsAppMessageType(node) : 'text';
                  const nodeColor = isWhatsApp ? WHATSAPP_MESSAGE_TYPES[messageType].color : getNodeColor(node.type);
                  
                  return (
                    <div
                      key={node.id}
                      className="absolute rounded-lg shadow-lg border border-gray-200 bg-white"
                      style={{
                        width: '250px',
                        left: `${xPos}px`,
                        top: `${yPos}px`,
                        borderTop: `4px solid ${nodeColor}`,
                      }}
                    >
                      {renderNodeContent(node, index)}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="space-y-3">
                {parsedNodes.map((node: Node, index: number) => (
                  <div 
                    key={node.id} 
                    className="p-3 border rounded-md shadow-sm bg-white hover:bg-gray-50 transition-colors"
                    style={{ 
                      borderLeft: `4px solid ${isWhatsAppNode(node) 
                        ? WHATSAPP_MESSAGE_TYPES[getWhatsAppMessageType(node)].color 
                        : getNodeColor(node.type)}` 
                    }}
                  >
                    {renderNodeContent(node, index)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {editingNode && (
        <NodeEditor
          node={editingNode}
          onSave={handleNodeSave}
          onClose={() => setEditingNode(null)}
        />
      )}
    </>
  );
}; 