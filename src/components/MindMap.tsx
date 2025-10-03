import { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomNode } from './CustomNode';
import { NodePanel } from './NodePanel';
import { AIAssistant } from './AIAssistant';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    data: { label: 'My Mind Map', description: 'Click to edit or add nodes' },
    position: { x: 250, y: 150 },
  },
];

const initialEdges: Edge[] = [];

export const MindMap = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showAI, setShowAI] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, label: string, description?: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, label, description },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'custom',
      data: { label: 'New Node', description: 'Add description...' },
      position: {
        x: Math.random() * 500 + 100,
        y: Math.random() * 400 + 100,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const handleAIGenerate = useCallback((generatedNodes: any) => {
    if (!generatedNodes?.nodes) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // Categorize nodes for better positioning
    const studyNodes: any[] = [];
    const jobNodes: any[] = [];
    const noteNodes: any[] = [];
    const otherNodes: any[] = [];
    
    generatedNodes.nodes.forEach((node: any) => {
      if (node.category === 'study' || node.id === 'study_parent') {
        studyNodes.push(node);
      } else if (node.category === 'job' || node.id === 'jobs_parent') {
        jobNodes.push(node);
      } else if (node.category === 'note' || node.id === 'notes_parent') {
        noteNodes.push(node);
      } else {
        otherNodes.push(node);
      }
    });

    // Position study nodes (left column)
    studyNodes.forEach((node, index) => {
      const isParent = node.id === 'study_parent';
      newNodes.push({
        id: node.id,
        type: 'custom',
        data: { 
          label: node.label || 'Node',
          description: node.description || '',
          type: node.type || 'topic',
          category: node.category || 'study',
          tags: node.tags || [],
          resources: node.resources || [],
          lang: node.lang || 'en'
        },
        position: {
          x: 100,
          y: isParent ? 100 : 300 + (index - 1) * 200,
        },
      });
    });

    // Position job nodes (middle column)
    jobNodes.forEach((node, index) => {
      const isParent = node.id === 'jobs_parent';
      newNodes.push({
        id: node.id,
        type: 'custom',
        data: { 
          label: node.label || 'Node',
          description: node.description || '',
          type: node.type || 'topic',
          category: node.category || 'job',
          tags: node.tags || [],
          resources: node.resources || [],
          lang: node.lang || 'en'
        },
        position: {
          x: 500,
          y: isParent ? 100 : 300 + (index - 1) * 200,
        },
      });
    });

    // Position note nodes (right column)
    noteNodes.forEach((node, index) => {
      const isParent = node.id === 'notes_parent';
      newNodes.push({
        id: node.id,
        type: 'custom',
        data: { 
          label: node.label || 'Node',
          description: node.description || '',
          type: node.type || 'topic',
          category: node.category || 'note',
          tags: node.tags || [],
          resources: node.resources || [],
          lang: node.lang || 'en'
        },
        position: {
          x: 900,
          y: isParent ? 100 : 300 + (index - 1) * 200,
        },
      });
    });

    // Position other nodes
    otherNodes.forEach((node, index) => {
      newNodes.push({
        id: node.id,
        type: 'custom',
        data: { 
          label: node.label || 'Node',
          description: node.description || '',
          type: node.type || 'topic',
          category: node.category,
          tags: node.tags || [],
          resources: node.resources || [],
          lang: node.lang || 'en'
        },
        position: {
          x: 500,
          y: 800 + index * 150,
        },
      });
    });

    // Create edges from the edges array
    if (generatedNodes.edges) {
      generatedNodes.edges.forEach((edge: any) => {
        newEdges.push({
          id: `e-${edge.from}-${edge.to}`,
          source: edge.from,
          target: edge.to,
          animated: edge.relation === 'leads_to' || edge.relation === 'related',
          label: edge.relation,
          style: { stroke: edge.relation === 'leads_to' ? '#10b981' : '#8b5cf6' },
        });
      });
    }

    // Fallback: create edges from children property
    generatedNodes.nodes.forEach((node: any) => {
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((childId: string) => {
          const edgeId = `e-${node.id}-${childId}`;
          if (!newEdges.find(e => e.id === edgeId)) {
            newEdges.push({
              id: edgeId,
              source: node.id,
              target: childId,
              animated: true,
            });
          }
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
    setShowAI(false);
  }, [setNodes, setEdges]);

  return (
    <div className="w-full h-screen flex">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-canvas-bg"
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>

        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={handleAddNode}
            className="px-4 py-2 bg-gradient-primary text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            + Add Node
          </button>
          <button
            onClick={() => setShowAI(!showAI)}
            className="px-4 py-2 bg-gradient-secondary text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            ✨ AI Assistant
          </button>
        </div>
      </div>

      {selectedNode && (
        <NodePanel
          node={selectedNode}
          onUpdate={handleNodeUpdate}
          onDelete={handleNodeDelete}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {showAI && (
        <AIAssistant
          onGenerate={handleAIGenerate}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  );
};
