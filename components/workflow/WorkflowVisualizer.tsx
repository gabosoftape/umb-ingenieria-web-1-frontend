'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Workflow, Node, Connections } from '@/services/workflows.service';
import { ZoomIn, ZoomOut, Maximize2, Move, Network, NetworkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import JsonViewer from './JsonViewer';

interface WorkflowVisualizerProps {
  workflow: Workflow;
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ workflow }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
  const [nodeFilter, setNodeFilter] = useState<'all' | 'httpRequest'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [nodesRendered, setNodesRendered] = useState(false);
  const [renderedNodes, setRenderedNodes] = useState<Node[]>([]);
  const [showConnections, setShowConnections] = useState(true);

  // Calcular dimensiones del canvas basado en las posiciones de los nodos
  const calculateCanvasDimensions = () => {
    if (!workflow.nodes || workflow.nodes.length === 0) return { width: 800, height: 600 };

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    workflow.nodes.forEach(node => {
      if (node.position && Array.isArray(node.position) && node.position.length >= 2) {
        const [x, y] = node.position;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + 200); // Ancho aproximado del nodo
        maxY = Math.max(maxY, y + 100); // Alto aproximado del nodo
      }
    });

    // Si no hay posiciones válidas, usar dimensiones predeterminadas
    if (minX === Infinity) return { width: 800, height: 600 };

    // Agregar padding
    const padding = 200; // Aumentado para dar más espacio alrededor
    return {
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
      offsetX: minX - padding,
      offsetY: minY - padding,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    };
  };

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
      
      // Calcular posición para centrar basado en las dimensiones reales
      const centerX = (dimensions.centerX || 0) - (dimensions.offsetX || 0);
      const centerY = (dimensions.centerY || 0) - (dimensions.offsetY || 0);
      
      setScale(newScale);
      // Ajustar la posición para centrar los nodos
      setPosition({ 
        x: -centerX * newScale + containerWidth / 2, 
        y: -centerY * newScale + containerHeight / 2 
      });
    }
  }, [workflow.nodes]);

  // Centrar los nodos cuando cambia el workflow
  useEffect(() => {
    centerNodes();
  }, [centerNodes, workflow.id]);

  // Dibujar conexiones entre nodos
  const drawConnections = useCallback(() => {
    if (!canvasRef.current || !workflow.connections) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Procesar todas las conexiones
    Object.entries(workflow.connections).forEach(([sourceName, targets]) => {
      if (typeof targets !== 'object' || targets === null) return;
      
      // Buscar el nodo fuente por nombre
      const sourceNode = workflow.nodes?.find(n => n.name === sourceName);
      if (!sourceNode) return;
      
      // Obtener el elemento DOM del nodo fuente
      const sourceElement = nodeRefs.current.get(sourceNode.id);
      if (!sourceElement) return;
      
      // Para cada tipo de salida del nodo fuente
      Object.entries(targets).forEach(([outputType, connections]) => {
        if (!Array.isArray(connections)) return;
        
        // Para cada conexión de este tipo
        connections.forEach((connectionArray: any) => {
          if (!Array.isArray(connectionArray)) return;
          
          connectionArray.forEach((conn: any) => {
            if (!conn || typeof conn !== 'object' || !conn.node) return;
            
            // Buscar el nodo destino
            const targetNode = workflow.nodes?.find(n => n.name === conn.node);
            if (!targetNode) return;
            
            // Obtener el elemento DOM del nodo destino
            const targetElement = nodeRefs.current.get(targetNode.id);
            if (!targetElement) return;
            
            // Calcular posiciones
            const sourceRect = sourceElement.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            const canvasRect = canvasRef.current!.getBoundingClientRect();
            
            // Puntos de inicio y fin relativos al canvas
            const start = {
              x: (sourceRect.left + sourceRect.width / 2) - canvasRect.left,
              y: (sourceRect.bottom) - canvasRect.top
            };

            const end = {
              x: (targetRect.left + targetRect.width / 2) - canvasRect.left,
              y: (targetRect.top) - canvasRect.top
            };

            // Dibujar línea curva
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            const controlPoint1 = { x: start.x, y: start.y + (end.y - start.y) / 2 };
            const controlPoint2 = { x: end.x, y: start.y + (end.y - start.y) / 2 };
            ctx.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, end.x, end.y);
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Dibujar flecha en el destino
            const arrowSize = 8;
            const angle = Math.atan2(end.y - controlPoint2.y, end.x - controlPoint2.x);
            ctx.beginPath();
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(end.x - arrowSize * Math.cos(angle - Math.PI / 6), end.y - arrowSize * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(end.x - arrowSize * Math.cos(angle + Math.PI / 6), end.y - arrowSize * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = '#64748b';
            ctx.fill();
          });
        });
      });
    });
  }, [workflow.connections, workflow.nodes, nodeRefs]);

  // Efecto para dibujar conexiones después de renderizar los nodos
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Asegurarse de que el canvas tenga el tamaño correcto
    const updateCanvasSize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = containerRect.width;
      canvasRef.current.height = containerRect.height;
    };

    // Actualizar tamaño y dibujar conexiones
    updateCanvasSize();
    
    // Usar requestAnimationFrame para asegurar que los nodos estén renderizados
    requestAnimationFrame(() => {
      if (showConnections) {
        drawConnections();
      }
    });

    // Redimensionar el canvas cuando cambia el tamaño de la ventana
    const handleResize = () => {
      updateCanvasSize();
      if (showConnections) {
        drawConnections();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawConnections, renderedNodes, scale, position, showConnections]);

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
      'ai_languageModel': '#9C27B0',
      'ai_tool': '#673AB7',
      'ai_memory': '#3F51B5',
      'ai_outputParser': '#E91E63',
    };

    return typeColors[type] || '#9C27B0';
  };

  // Funciones para zoom y pan
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.2)); // Permitir un mayor alejamiento (20% en lugar de 50%)
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Manejo de eventos para arrastrar el canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Solo click izquierdo
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = (e.clientX - dragStart.x) / scale;
    const dy = (e.clientY - dragStart.y) / scale;
    
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
    const canvasX = (mouseX - position.x * scale) / scale;
    const canvasY = (mouseY - position.y * scale) / scale;
    
    // Aplicar zoom
    const newScale = e.deltaY < 0
      ? Math.min(scale + 0.05, 2) // Zoom in
      : Math.max(scale - 0.05, 0.2); // Zoom out
    
    // Calcular el nuevo desplazamiento para mantener el punto bajo el cursor
    const newPositionX = (mouseX - canvasX * newScale) / newScale;
    const newPositionY = (mouseY - canvasY * newScale) / newScale;
    
    setScale(newScale);
    setPosition({ x: newPositionX, y: newPositionY });
  };

  const dimensions = calculateCanvasDimensions();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setNodesRendered(true);
    }
  }, [isLoading]);

  // Renderizado por lotes para mejorar el rendimiento con muchos nodos
  useEffect(() => {
    if (!workflow.nodes || workflow.nodes.length === 0) {
      setIsLoading(false);
      setNodesRendered(true);
      setRenderedNodes([]);
      return;
    }

    setIsLoading(true);
    setNodesRendered(false);

    // Filtrar los nodos según el filtro actual
    const filteredNodes = workflow.nodes.filter(node => 
      nodeFilter === 'all' || node.type === 'n8n-nodes-base.httpRequest'
    );

    // Renderizar por lotes para mejorar el rendimiento
    const batchSize = 10; // Número de nodos a renderizar por lote
    let currentBatch = 0;

    const renderBatch = () => {
      const start = currentBatch * batchSize;
      const end = Math.min(start + batchSize, filteredNodes.length);
      const batch = filteredNodes.slice(0, end);

      setRenderedNodes(batch);
      currentBatch++;

      if (end < filteredNodes.length) {
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
  }, [workflow.nodes, nodeFilter]);

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
                <p>Restablecer vista</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={centerNodes}>
                  <Move size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Centrar todos los nodos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowConnections(!showConnections)}
                  className={showConnections ? "bg-blue-100 text-blue-700" : ""}
                >
                  {showConnections ? <Network size={16} /> : <NetworkIcon size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showConnections ? "Ocultar" : "Mostrar"} conexiones</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant={nodeFilter === 'all' ? "default" : "outline"} 
            size="sm"
            onClick={() => setNodeFilter('all')}
            className={nodeFilter === 'all' ? "bg-blue-600 text-white" : ""}
          >
            Todos los nodos
          </Button>
          <Button 
            variant={nodeFilter === 'httpRequest' ? "default" : "outline"} 
            size="sm"
            onClick={() => setNodeFilter('httpRequest')}
            className={nodeFilter === 'httpRequest' ? "bg-blue-600 text-white" : ""}
          >
            Solo HTTP Request
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          {Math.round(scale * 100)}% | 
          {nodeFilter === 'all' 
            ? workflow.nodes?.length || 0 
            : workflow.nodes?.filter(node => node.type === 'n8n-nodes-base.httpRequest').length || 0} nodos
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative border rounded-md overflow-hidden bg-gray-50 cursor-grab active:cursor-grabbing"
        style={{ height: '600px', touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
          style={{ opacity: showConnections ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
        />
        <div 
          className="absolute"
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          <div
            className="absolute"
            style={{
              width: dimensions.width,
              height: dimensions.height,
              transform: `translate(${position.x}px, ${position.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            {isLoading ? (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : nodesRendered ? (
              renderedNodes.map((node, index) => {
                // Obtener posición del nodo
                const nodePosition = node.position && Array.isArray(node.position) && node.position.length >= 2
                  ? { x: node.position[0] - (dimensions.offsetX || 0), y: node.position[1] - (dimensions.offsetY || 0) }
                  : { x: 100 + index * 220, y: 100 }; // Posición por defecto si no hay datos

                return (
                  <div
                    key={node.id}
                    ref={(el) => {
                      if (el) nodeRefs.current.set(node.id, el);
                    }}
                    className="absolute rounded-md shadow-md bg-white border-t-4 overflow-hidden hover:shadow-lg transition-shadow"
                    style={{
                      left: `${nodePosition.x}px`,
                      top: `${nodePosition.y}px`,
                      width: '200px',
                      height: 'auto',
                      borderTopColor: getNodeColor(node.type),
                      zIndex: hoveredNode?.id === node.id ? 10 : 2
                    }}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => {
                      // Solo ocultar si no estamos sobre la tarjeta
                      if (!isHoveringCard) {
                        setHoveredNode(null);
                      }
                    }}
                  >
                    <div className="p-3">
                      <div className="font-bold text-sm truncate">{node.name}</div>
                      <div className="text-xs text-gray-500 truncate">{node.type}</div>
                    </div>
                    <div className="bg-gray-100 p-2 text-xs">
                      {node.parameters && Object.keys(node.parameters).length > 0 && (
                        <div className="truncate">
                          {Object.keys(node.parameters).slice(0, 2).map(key => (
                            <div key={key} className="truncate">
                              <span className="font-semibold">{key}:</span> {JSON.stringify(node.parameters[key as keyof typeof node.parameters]).substring(0, 20)}
                              {JSON.stringify(node.parameters[key as keyof typeof node.parameters]).length > 20 ? '...' : ''}
                            </div>
                          ))}
                          {Object.keys(node.parameters).length > 2 && (
                            <div className="text-gray-500">+{Object.keys(node.parameters).length - 2} más...</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500">
                No hay nodos que mostrar
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tooltip detallado al hacer hover sobre un nodo */}
      {hoveredNode && (
        <div
          className="absolute bg-white p-3 rounded-md shadow-lg z-50 max-w-xs border border-gray-200"
          style={{
            left: '20px',
            bottom: '20px',
          }}
          onMouseEnter={() => setIsHoveringCard(true)}
          onMouseLeave={() => {
            setIsHoveringCard(false);
            setHoveredNode(null);
          }}
        >
          <h4 className="font-bold text-sm mb-1">{hoveredNode.name}</h4>
          <div className="text-xs mb-2">
            <span className="inline-block px-2 py-1 rounded-full text-white text-xs" style={{ backgroundColor: getNodeColor(hoveredNode.type) }}>
              {hoveredNode.type}
            </span>
          </div>
          
          {/* Conexiones del nodo */}
          <div className="text-xs mb-2">
            <div className="font-semibold mb-1">Conexiones:</div>
            <div className="bg-gray-50 p-2 rounded max-h-24 overflow-y-auto">
              {/* Conexiones salientes */}
              {(() => {
                // Verificamos si el nodo actual tiene conexiones salientes
                const nodeName = hoveredNode.name;
                const connections = workflow.connections[nodeName];
                
                if (connections) {
                  return (
                    <div>
                      <div className="font-medium text-green-700">Salientes:</div>
                      <ul className="list-disc list-inside">
                        {Object.entries(connections).map(([outputType, conns]) => {
                          if (!Array.isArray(conns)) return null;
                          return conns.map((connectionArray: any, arrayIdx: number) => {
                            if (!Array.isArray(connectionArray)) return null;
                            return connectionArray.map((conn: any, idx: number) => (
                              <li key={`${outputType}-${arrayIdx}-${idx}`} className="ml-2">
                                <span className="text-blue-600">{conn.node}</span>
                                <span className="text-gray-500"> ({outputType})</span>
                              </li>
                            ));
                          });
                        })}
                      </ul>
                    </div>
                  );
                } else {
                  return <div className="text-gray-500">No hay conexiones salientes</div>;
                }
              })()}
              
              {/* Conexiones entrantes */}
              {(() => {
                const entrantes: {source: string, type: string}[] = [];
                
                Object.entries(workflow.connections).forEach(([sourceName, targets]) => {
                  if (sourceName === hoveredNode.name || !targets) return; // Saltamos las propias
                  
                  Object.entries(targets).forEach(([type, connections]) => {
                    if (!Array.isArray(connections)) return;
                    
                    connections.forEach((connectionArray: any) => {
                      if (!Array.isArray(connectionArray)) return;
                      
                      connectionArray.forEach((conn: any) => {
                        if (conn && typeof conn === 'object' && conn.node === hoveredNode.name) {
                          entrantes.push({source: sourceName, type});
                        }
                      });
                    });
                  });
                });
                
                return entrantes.length > 0 ? (
                  <div className="mt-2">
                    <div className="font-medium text-orange-700">Entrantes:</div>
                    <ul className="list-disc list-inside">
                      {entrantes.map((conn, idx) => (
                        <li key={idx} className="ml-2">
                          <span className="text-blue-600">{conn.source}</span>
                          <span className="text-gray-500"> ({conn.type})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-gray-500 mt-2">No hay conexiones entrantes</div>
                );
              })()}
            </div>
          </div>
          
          {/* Parámetros del nodo */}
          {hoveredNode.parameters && Object.keys(hoveredNode.parameters).length > 0 && (
            <div className="text-xs">
              <div className="font-semibold mb-1 flex justify-between items-center">
                <span>Parámetros:</span>
                <button 
                  onClick={() => {
                    setSelectedNode(hoveredNode);
                    setParamsModalOpen(true);
                  }}
                  className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-0.5 rounded"
                >
                  Ver todos
                </button>
              </div>
              
              <div className="bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                {Object.entries(hoveredNode.parameters).map(([key, value]) => {
                  // Verificar si es un campo JSON (especialmente jsonBody)
                  const isJsonValue = key === 'jsonBody' || (
                    typeof value === 'string' && 
                    value.trim().startsWith('{') && 
                    value.trim().endsWith('}')
                  );
                  
                  // Intentar parsear el JSON si es necesario
                  let formattedValue = value;
                  let isValidJson = false;
                  
                  if (isJsonValue && typeof value === 'string') {
                    try {
                      formattedValue = JSON.parse(value);
                      isValidJson = true;
                    } catch (e) {
                      // Si no es un JSON válido, mostrar como string
                      isValidJson = false;
                    }
                  }
                  
                  return (
                    <div key={key} className="mb-2 border-b border-gray-200 pb-2">
                      <div className="font-medium mb-1 flex justify-between items-center">
                        <span>{key}:</span>
                        {isValidJson && (
                          <button 
                            onClick={() => {
                              setSelectedJson({title: key, data: formattedValue});
                              setJsonModalOpen(true);
                            }}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-0.5 rounded"
                          >
                            Ver JSON
                          </button>
                        )}
                      </div>
                      
                      {isValidJson ? (
                        <div className="pl-2 border-l-2 border-blue-200">
                          {typeof formattedValue === 'object' ? (
                            Object.entries(formattedValue).slice(0, 3).map(([jsonKey, jsonValue]) => (
                              <div key={jsonKey} className="truncate">
                                <span className="font-medium text-blue-600">{jsonKey}:</span> 
                                <span className="text-gray-600">
                                  {typeof jsonValue === 'object' 
                                    ? jsonValue === null
                                      ? 'null'
                                      : Array.isArray(jsonValue)
                                        ? `[Array(${jsonValue.length})]`
                                        : `{${Object.keys(jsonValue).join(', ')}}`
                                    : String(jsonValue).substring(0, 40) + (String(jsonValue).length > 40 ? '...' : '')}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-600 truncate">{String(formattedValue).substring(0, 100)}</div>
                          )}
                          {typeof formattedValue === 'object' && Object.keys(formattedValue).length > 3 && (
                            <div className="text-gray-500 mt-1">+{Object.keys(formattedValue).length - 3} más...</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-600 truncate">
                          {String(value).substring(0, 100)}
                          {String(value).length > 100 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      {jsonModalOpen && selectedJson && (
        <Dialog open={jsonModalOpen} onOpenChange={(open) => setJsonModalOpen(open)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Contenido JSON:</span> 
                <span className="font-normal text-gray-600">{selectedJson.title}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto">
              <JsonViewer data={selectedJson.data} />
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {paramsModalOpen && selectedNode && (
        <Dialog open={paramsModalOpen} onOpenChange={(open) => setParamsModalOpen(open)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Parámetros del nodo:</span> 
                <span className="font-normal text-gray-600">{selectedNode.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto p-4">
              {Object.entries(selectedNode.parameters).map(([key, value]) => {
                // Verificar si es un campo JSON (especialmente jsonBody)
                const isJsonValue = key === 'jsonBody' || (
                  typeof value === 'string' && 
                  value.trim().startsWith('{') && 
                  value.trim().endsWith('}')
                );
                
                // Intentar parsear el JSON si es necesario
                let formattedValue = value;
                let isValidJson = false;
                
                if (isJsonValue && typeof value === 'string') {
                  try {
                    formattedValue = JSON.parse(value);
                    isValidJson = true;
                  } catch (e) {
                    // Si no es un JSON válido, mostrar como string
                    isValidJson = false;
                  }
                }
                
                return (
                  <div key={key} className="mb-4 border-b border-gray-200 pb-4">
                    <div className="font-medium mb-2 flex justify-between items-center">
                      <span className="text-lg">{key}:</span>
                      {isValidJson && (
                        <button 
                          onClick={() => {
                            setSelectedJson({title: key, data: formattedValue});
                            setJsonModalOpen(true);
                          }}
                          className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                        >
                          Ver JSON
                        </button>
                      )}
                    </div>
                    
                    {isValidJson ? (
                      <div className="pl-4 border-l-2 border-blue-200">
                        {typeof formattedValue === 'object' ? (
                          Object.entries(formattedValue).map(([jsonKey, jsonValue]) => (
                            <div key={jsonKey} className="mb-2">
                              <span className="font-medium text-blue-600">{jsonKey}:</span> 
                              <span className="text-gray-600 ml-2">
                                {typeof jsonValue === 'object' 
                                  ? jsonValue === null
                                    ? 'null'
                                    : Array.isArray(jsonValue)
                                      ? `[Array(${jsonValue.length})]`
                                      : `{${Object.keys(jsonValue).join(', ')}}`
                                  : String(jsonValue).substring(0, 60) + (String(jsonValue).length > 60 ? '...' : '')}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-600">{String(formattedValue)}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-600 whitespace-pre-wrap break-words">
                        {String(value)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
