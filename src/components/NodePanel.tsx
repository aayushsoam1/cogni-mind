import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { X, ExternalLink, Tag, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Resource {
  r_id: string;
  title: string;
  provider: string;
  url: string;
  type: string;
  meta: {
    official: boolean;
    score: number;
    tags?: string[];
  };
}

interface NodePanelProps {
  node: Node;
  onUpdate: (nodeId: string, label: string, description?: string) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

export const NodePanel = ({ node, onUpdate, onDelete, onClose }: NodePanelProps) => {
  const nodeData = node.data as { 
    label?: string; 
    description?: string;
    type?: string;
    tags?: string[];
    resources?: Resource[];
  };
  const [label, setLabel] = useState(nodeData?.label || '');
  const [description, setDescription] = useState(nodeData?.description || '');

  useEffect(() => {
    const data = node.data as { 
      label?: string; 
      description?: string;
    };
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

  const resources = nodeData?.resources || [];
  const tags = nodeData?.tags || [];
  const nodeType = nodeData?.type || 'topic';

  return (
    <div className="w-80 bg-card border-l border-border h-full overflow-y-auto shadow-xl">
      <div className="sticky top-0 bg-gradient-primary p-4 flex items-center justify-between text-white z-10">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Edit Node</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
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
          <label className="text-sm font-medium mb-2 block">Type</label>
          <Badge variant="secondary" className="capitalize">
            {nodeType}
          </Badge>
        </div>

        {tags.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <Badge key={i} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

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

        {resources.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-3 block">Resources ({resources.length})</label>
            <div className="space-y-3">
              {resources.map((resource) => (
                <Card key={resource.r_id} className="p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-medium text-sm truncate">{resource.title}</h4>
                        {resource.meta.official && (
                          <Badge variant="default" className="text-xs">Official</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span className="font-medium">{resource.provider}</span>
                        <span>•</span>
                        <span className="capitalize">{resource.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-primary"
                            style={{ width: `${resource.meta.score * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(resource.meta.score * 100)}%
                        </span>
                      </div>
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-muted rounded-md transition-colors flex-shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
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
