'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import JsonViewer from '../workflow/JsonViewer';

interface Node {
  id: string;
  name: string;
  type: string;
  position?: [number, number];
  parameters?: any;
  [key: string]: any;
}

interface TemplateVisualizerProps {
  nodes: Node[];
  onNodeEdit?: (node: Node, index: number) => void;
}

export const TemplateVisualizer: React.FC<TemplateVisualizerProps> = ({ nodes, onNodeEdit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [selectedJson, setSelectedJson] = useState<{title: string, data: any} | null>(null);
  const [paramsModalOpen, setParamsModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nodesRendered, setNodesRendered] = useState(false);
  const [renderedNodes, setRenderedNodes] = useState<Node[]>([]);

  // Calcular dimensiones del canvas basado en las posiciones de los nodos
  const calculateCanvasDimensions = useCallback(() => {
    if (!nodes || nodes.length === 0) return { width: 800, height: 600 };

    // Para el visualizador de templates, los nodos se posicionan secuencialmente
    const nodeWidth = 250;
    const nodeHeight = 150;
    const nodeMargin = 50;
    
    const totalWidth = nodes.length * (nodeWidth + nodeMargin);
    const totalHeight = nodeHeight + nodeMargin * 2;

    return {
      width: totalWidth,
      height: totalHeight,
      offsetX: 0,
      offsetY: 0,
      centerX: totalWidth / 2,
      centerY: totalHeight / 2
    };
  }, [nodes]);

  // Función para centrar todos los nodos en la vista
  const centerNodes = useCallback(() => {
    const dimensions = calculateCanvasDimensions();
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Calcular la escala óptima para que todos los nodos sean visibles
      const scaleX = containerWidth / dimensions.width;
      const scaleY = containerHeight / dimensions.height;
      const newScale = Math.min(scaleX, scaleY, 1) * 0.8; // 80% del tamaño máximo para dejar más margen
      
      setScale(newScale);
      // Ajustar la posición para centrar los nodos
      setPosition({ 
        x: -dimensions.centerX * newScale + containerWidth / 2, 
        y: -dimensions.centerY * newScale + containerHeight / 2 
      });
    }
  }, [calculateCanvasDimensions]);

  // Centrar los nodos cuando cambia el array de nodos
  useEffect(() => {
    centerNodes();
  }, [centerNodes, nodes.length]);

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
    };

    return typeColors[type] || '#9C27B0';
  };

  // Funciones para zoom y pan
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.2));
  };

  const handleReset = () => {
    centerNodes();
  };

  // Manejo de eventos para arrastrar el canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Solo click izquierdo
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

  // Manejo del zoom con la rueda del ratón
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Calcular la posición del cursor relativa al contenedor
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calcular la posición del cursor en el espacio del canvas
    const canvasX = (mouseX - position.x) / scale;
    const canvasY = (mouseY - position.y) / scale;
    
    // Aplicar zoom
    const newScale = e.deltaY < 0
      ? Math.min(scale + 0.05, 2) // Zoom in
      : Math.max(scale - 0.05, 0.2); // Zoom out
    
    // Calcular el nuevo desplazamiento para mantener el punto bajo el cursor
    const newPositionX = mouseX - canvasX * newScale;
    const newPositionY = mouseY - canvasY * newScale;
    
    setScale(newScale);
    setPosition({ x: newPositionX, y: newPositionY });
  };

  // Mostrar detalles del nodo en un modal
  const handleViewNodeDetails = (node: Node) => {
    setSelectedNode(node);
    setParamsModalOpen(true);
  };

  // Mostrar JSON del nodo en un modal
  const handleViewNodeJson = (node: Node) => {
    setSelectedJson({
      title: `JSON de ${node.name || 'Nodo'}`,
      data: node
    });
    setJsonModalOpen(true);
  };

  // Renderizado por lotes para mejorar el rendimiento con muchos nodos
  useEffect(() => {
    if (!nodes || nodes.length === 0) {
      setIsLoading(false);
      setNodesRendered(true);
      setRenderedNodes([]);
      return;
    }

    setIsLoading(true);
    setNodesRendered(false);

    // Renderizar por lotes para mejorar el rendimiento
    const batchSize = 10; // Número de nodos a renderizar por lote
    let currentBatch = 0;

    const renderBatch = () => {
      const start = currentBatch * batchSize;
      const end = Math.min(start + batchSize, nodes.length);
      const batch = nodes.slice(0, end);

      setRenderedNodes(batch);
      currentBatch++;

      if (end < nodes.length) {
        // Programar el siguiente lote
        setTimeout(renderBatch, 10);
      } else {
        // Todos los nodos han sido renderizados
        setIsLoading(false);
        setNodesRendered(true);
      }
    };

    // Iniciar el renderizado por lotes
    renderBatch();
  }, [nodes]);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
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
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
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
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <Maximize2 size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Centrar nodos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div>
          <span className="text-sm text-gray-500">
            {renderedNodes.length} nodos mostrados
          </span>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative border rounded-md overflow-hidden bg-gray-50 h-[500px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Cargando nodos...</p>
            </div>
          </div>
        )}

        <div
          className="absolute transition-transform duration-100"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          {renderedNodes.map((node, index) => {
            // Calcular posición secuencial para los nodos
            const nodeWidth = 250;
            const nodeHeight = 150;
            const nodeMargin = 50;
            const xPos = index * (nodeWidth + nodeMargin);
            const yPos = 50; // Todos en la misma fila

            return (
              <div
                key={node.id || index}
                ref={(el) => {
                  if (el) nodeRefs.current.set(node.id, el);
                }}
                className="absolute rounded-md shadow-md bg-white border overflow-hidden"
                style={{
                  width: `${nodeWidth}px`,
                  height: `${nodeHeight}px`,
                  left: `${xPos}px`,
                  top: `${yPos}px`,
                  borderColor: getNodeColor(node.type),
                  borderLeftWidth: '4px',
                }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div 
                  className="p-3 font-medium text-sm truncate border-b"
                  style={{ backgroundColor: `${getNodeColor(node.type)}20` }}
                >
                  {node.name || `Nodo ${index + 1}`}
                </div>
                <div className="p-3 text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500">Tipo: {node.type.split('.').pop()}</span>
                    <div className="flex space-x-1">
                      <button 
                        className="p-1 hover:bg-gray-100 rounded"
                        onClick={() => handleViewNodeDetails(node)}
                        title="Ver detalles"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>
                      <button 
                        className="p-1 hover:bg-gray-100 rounded"
                        onClick={() => handleViewNodeJson(node)}
                        title="Ver JSON"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="16 18 22 12 16 6"></polyline>
                          <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                      </button>
                      {onNodeEdit && (
                        <button 
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={() => onNodeEdit(node, index)}
                          title="Editar nodo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  {node.parameters && node.parameters.url && (
                    <div className="truncate text-xs mb-1">
                      <span className="font-medium">URL:</span> {node.parameters.url}
                    </div>
                  )}
                  {node.parameters && node.parameters.method && (
                    <div className="truncate text-xs">
                      <span className="font-medium">Método:</span> {node.parameters.method}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal para ver JSON del nodo */}
      <Dialog open={jsonModalOpen} onOpenChange={setJsonModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedJson?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedJson && (
              <JsonViewer data={selectedJson.data} />
            )}
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Cerrar
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para ver detalles del nodo */}
      <Dialog open={paramsModalOpen} onOpenChange={setParamsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Detalles del nodo: {selectedNode?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedNode && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">ID</h3>
                  <div className="text-sm bg-gray-50 p-2 rounded">{selectedNode.id}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Tipo</h3>
                  <div className="text-sm bg-gray-50 p-2 rounded">{selectedNode.type}</div>
                </div>
                {selectedNode.parameters && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Parámetros</h3>
                    <div className="text-sm bg-gray-50 p-2 rounded overflow-auto max-h-60">
                      <JsonViewer data={selectedNode.parameters} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Cerrar
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
