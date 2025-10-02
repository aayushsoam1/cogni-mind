import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIAssistantProps {
  onGenerate: (nodes: any) => void;
  onClose: () => void;
}

export const AIAssistant = ({ onGenerate, onClose }: AIAssistantProps) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-mindmap-nodes', {
        body: { prompt }
      });

      if (error) throw error;

      if (data?.nodes) {
        onGenerate(data);
        toast.success('Mind map generated!');
        setPrompt('');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating nodes:', error);
      toast.error('Failed to generate mind map');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-0 right-0 w-96 bg-card border-l border-border h-full shadow-2xl flex flex-col">
      <div className="bg-gradient-primary p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-lg font-semibold">AI Assistant</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Generate Mind Map</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Describe what you want to create and AI will generate a structured mind map for you.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Topic or Idea</label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., DSA study plan, Project roadmap..."
              className="w-full"
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full bg-gradient-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Mind Map
              </>
            )}
          </Button>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Examples:</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• "Create a study plan for Data Structures"</li>
              <li>• "Plan a web development project"</li>
              <li>• "Career roadmap for software engineer"</li>
              <li>• "Learn machine learning fundamentals"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
