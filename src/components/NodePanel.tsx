import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface NodePanelProps {
  node: Node;
  onUpdate: (nodeId: string, label: string, description?: string) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

export const NodePanel = ({ node, onUpdate, onDelete, onClose }: NodePanelProps) => {
  const nodeData = node.data as { label?: string; description?: string };
  const [label, setLabel] = useState(nodeData?.label || '');
  const [description, setDescription] = useState(nodeData?.description || '');

  useEffect(() => {
    const data = node.data as { label?: string; description?: string };
    setLabel(data?.label || '');
    setDescription(data?.description || '');
  }, [node]);

  const handleSave = () => {
    onUpdate(node.id, label, description);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this node?')) {
      onDelete(node.id);
    }
  };

  return (
    <div className="w-80 bg-card border-l border-border h-full overflow-y-auto shadow-xl">
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit Node</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Label</label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Node label"
            className="w-full"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description..."
            rows={4}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1 bg-gradient-primary">
            Save Changes
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="destructive"
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
