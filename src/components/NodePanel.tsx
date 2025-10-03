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
    mock?: boolean;
    score: number;
    tags?: string[];
    snippet?: string;
    youtube_id?: string;
    view?: 'inner' | 'web';
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
    category?: string;
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
  const category = nodeData?.category || 'topic';

  const getCategoryBadgeColor = () => {
    switch (category) {
      case 'study':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'job':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'note':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'video':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return '';
    }
  };

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
          <label className="text-sm font-medium mb-2 block">Category</label>
          <Badge className={`capitalize ${getCategoryBadgeColor()}`}>
            {category === 'study' && '📚 Study'}
            {category === 'job' && '💼 Job'}
            {category === 'note' && '📝 Note'}
            {category === 'video' && '🎥 Video'}
            {!['study', 'job', 'note', 'video'].includes(category) && nodeType}
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
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-medium text-sm truncate">{resource.title}</h4>
                        {resource.meta.official && (
                          <Badge variant="default" className="text-xs bg-green-600">Official</Badge>
                        )}
                        {resource.meta.mock && (
                          <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-600">Mock</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span className="font-medium">{resource.provider}</span>
                        <span>•</span>
                        <span className="capitalize">{resource.type}</span>
                      </div>
                      
                      {resource.meta.snippet && (
                        <p className="text-xs text-muted-foreground italic border-l-2 border-primary/50 pl-2 mb-2">
                          {resource.meta.snippet}
                        </p>
                      )}
                      
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
                      
                      {resource.meta.tags && resource.meta.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resource.meta.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-xs bg-accent/30 text-accent-foreground rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {!resource.meta.youtube_id && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-muted rounded-md transition-colors flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  
                  {resource.meta.youtube_id && (
                    <div className="mt-2 aspect-video rounded overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://youtube.com/embed/${resource.meta.youtube_id}`}
                        title={resource.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  )}
                  
                  {resource.type === 'pdf' && resource.meta.view && (
                    <div className="flex gap-2 mt-2">
                      {resource.meta.view === 'inner' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(resource.url, '_blank')}
                          className="text-xs"
                        >
                          Open Inside
                        </Button>
                      )}
                      <Button
                        size="sm"
                        asChild
                        className="text-xs"
                      >
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          Open in Web →
                        </a>
                      </Button>
                    </div>
                  )}
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
