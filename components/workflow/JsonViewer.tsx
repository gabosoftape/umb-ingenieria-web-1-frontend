'use client';

import React, { useState } from 'react';

interface JsonViewerProps {
  data: any;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const toggleExpand = (path: string) => {
    const newExpandedPaths = new Set(expandedPaths);
    if (expandedPaths.has(path)) {
      newExpandedPaths.delete(path);
    } else {
      newExpandedPaths.add(path);
    }
    setExpandedPaths(newExpandedPaths);
  };

  // Función recursiva para renderizar el JSON con formato
  const renderJson = (obj: any, depth = 0, path = ''): JSX.Element => {
    const indent = '  '.repeat(depth);
    
    if (obj === null) {
      return <span className="text-gray-500">null</span>;
    }
    
    if (typeof obj === 'undefined') {
      return <span className="text-gray-500">undefined</span>;
    }
    
    if (typeof obj === 'boolean') {
      return <span className="text-orange-600">{String(obj)}</span>;
    }
    
    if (typeof obj === 'number') {
      return <span className="text-blue-600">{obj}</span>;
    }
    
    if (typeof obj === 'string') {
      return <span className="text-green-600">"{obj}"</span>;
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return <span>[]</span>;
      }
      
      const isExpanded = expandedPaths.has(path);
      
      if (!isExpanded) {
        return (
          <span>
            <span 
              className="cursor-pointer text-gray-500 hover:text-gray-800"
              onClick={() => toggleExpand(path)}
            >
              [Array({obj.length})] &darr;
            </span>
          </span>
        );
      }
      
      return (
        <span>
          <span 
            className="cursor-pointer text-gray-500 hover:text-gray-800"
            onClick={() => toggleExpand(path)}
          >
            [&uarr;
          </span>
          <div className="pl-4">
            {obj.map((item, index) => (
              <div key={index}>
                {renderJson(item, depth + 1, `${path}.${index}`)}
                {index < obj.length - 1 && <span className="text-gray-500">,</span>}
              </div>
            ))}
          </div>
          {indent}]
        </span>
      );
    }
    
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      
      if (keys.length === 0) {
        return <span>{'{}'}</span>;
      }
      
      const isExpanded = expandedPaths.has(path);
      
      if (!isExpanded) {
        return (
          <span>
            <span 
              className="cursor-pointer text-gray-500 hover:text-gray-800"
              onClick={() => toggleExpand(path)}
            >
              {'{'}{ keys.join(', ') }{'}'}  &darr;
            </span>
          </span>
        );
      }
      
      return (
        <span>
          <span 
            className="cursor-pointer text-gray-500 hover:text-gray-800"
            onClick={() => toggleExpand(path)}
          >
            {'{'}&uarr;
          </span>
          <div className="pl-4">
            {keys.map((key, index) => (
              <div key={key}>
                <span className="text-purple-600">"{key}"</span>: {renderJson(obj[key], depth + 1, `${path}.${key}`)}
                {index < keys.length - 1 && <span className="text-gray-500">,</span>}
              </div>
            ))}
          </div>
          {indent}{'}'}
        </span>
      );
    }
    
    return <span>{String(obj)}</span>;
  };

  return (
    <div className="font-mono text-sm bg-gray-50 p-4 rounded-md overflow-auto max-h-[60vh]">
      {renderJson(data, 0, 'root')}
    </div>
  );
};

export default JsonViewer;
