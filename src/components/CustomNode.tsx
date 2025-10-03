import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export const CustomNode = memo(({ data }: NodeProps) => {
  const nodeData = data as { 
    label: string; 
    description?: string;
    category?: string;
    type?: string;
  };
  
  // Color mapping based on category (NotebookLM-style)
  const getCategoryStyles = () => {
    switch (nodeData.category) {
      case 'study':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-blue-200 dark:shadow-blue-900';
      case 'job':
        return 'border-green-500 bg-green-50 dark:bg-green-950/30 shadow-green-200 dark:shadow-green-900';
      case 'note':
        return 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-purple-200 dark:shadow-purple-900';
      default:
        return 'border-border bg-card';
    }
  };

  const isParentNode = nodeData.type === 'topic' && 
    (nodeData.label?.includes('Study') || 
     nodeData.label?.includes('Jobs') || 
     nodeData.label?.includes('Notes'));
  
  return (
    <div className={`px-6 py-4 shadow-lg hover:shadow-xl rounded-xl border-2 transition-all duration-200 min-w-[200px] max-w-[300px] ${getCategoryStyles()} ${isParentNode ? 'min-w-[280px] scale-105' : ''}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-primary" />
      
      <div className="flex flex-col gap-2">
        <div className={`font-semibold text-foreground ${isParentNode ? 'text-xl' : 'text-lg'}`}>
          {nodeData.label}
        </div>
        {nodeData.description && (
          <div className="text-sm text-muted-foreground">
            {nodeData.description}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-primary" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
