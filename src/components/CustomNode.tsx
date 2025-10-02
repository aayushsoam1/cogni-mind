import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export const CustomNode = memo(({ data }: NodeProps) => {
  const nodeData = data as { label: string; description?: string };
  
  return (
    <div className="px-6 py-4 shadow-node hover:shadow-node-hover rounded-xl bg-card border-2 border-border transition-all duration-200 min-w-[200px] max-w-[300px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-primary" />
      
      <div className="flex flex-col gap-2">
        <div className="font-semibold text-lg text-foreground">
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
