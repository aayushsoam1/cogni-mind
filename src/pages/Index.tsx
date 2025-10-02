import { MindMap } from '@/components/MindMap';
import { Brain } from 'lucide-react';

const Index = () => {
  return (
    <div className="h-screen w-full flex flex-col">
      <header className="bg-gradient-primary text-white px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">AI Mind Map</h1>
            <p className="text-sm text-white/90">Create, organize, and visualize your ideas</p>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <MindMap />
      </main>
    </div>
  );
};

export default Index;
