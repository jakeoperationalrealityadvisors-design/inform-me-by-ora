import React, { useCallback } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    Handle,
    Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Zap, GitBranch, Mail, Bell, CheckCircle, Code } from 'lucide-react';

const nodeTypes = {
    trigger: TriggerNode,
    condition: ConditionNode,
    action: ActionNode,
    code: CodeNode
};

function TriggerNode({ data }) {
    return (
        <div className="px-4 py-3 rounded-lg border-2 border-blue-500 bg-blue-50 shadow-md min-w-[200px]">
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-500" />
            <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-600" />
                <div className="font-semibold text-sm text-blue-900">Trigger</div>
            </div>
            <div className="text-xs text-blue-700">{data.label}</div>
        </div>
    );
}

function ConditionNode({ data }) {
    return (
        <div className="px-4 py-3 rounded-lg border-2 border-amber-500 bg-amber-50 shadow-md min-w-[200px]">
            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-amber-500" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-amber-500" />
            <div className="flex items-center gap-2 mb-1">
                <GitBranch className="w-4 h-4 text-amber-600" />
                <div className="font-semibold text-sm text-amber-900">Condition</div>
            </div>
            <div className="text-xs text-amber-700">{data.label}</div>
        </div>
    );
}

function ActionNode({ data }) {
    const icons = {
        send_email: Mail,
        send_notification: Bell,
        create_task: CheckCircle,
        default: CheckCircle
    };
    const Icon = icons[data.actionType] || icons.default;

    return (
        <div className="px-4 py-3 rounded-lg border-2 border-green-500 bg-green-50 shadow-md min-w-[200px]">
            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-green-500" />
            <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-green-600" />
                <div className="font-semibold text-sm text-green-900">Action</div>
            </div>
            <div className="text-xs text-green-700">{data.label}</div>
        </div>
    );
}

function CodeNode({ data }) {
    return (
        <div className="px-4 py-3 rounded-lg border-2 border-purple-500 bg-purple-50 shadow-md min-w-[200px]">
            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-purple-500" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-purple-500" />
            <div className="flex items-center gap-2 mb-1">
                <Code className="w-4 h-4 text-purple-600" />
                <div className="font-semibold text-sm text-purple-900">Custom Code</div>
            </div>
            <div className="text-xs text-purple-700">{data.label}</div>
        </div>
    );
}

export default function VisualWorkflowBuilder({ automation, onUpdate }) {
    const initialNodes = [
        {
            id: 'trigger',
            type: 'trigger',
            position: { x: 250, y: 50 },
            data: { label: automation.trigger_type?.replace(/_/g, ' ') || 'Trigger Event' }
        },
        ...(automation.condition_logic?.groups?.length > 0 ? [{
            id: 'conditions',
            type: 'condition',
            position: { x: 250, y: 150 },
            data: { label: `${automation.condition_logic.groups.length} condition group(s)` }
        }] : []),
        ...(automation.actions?.map((action, idx) => ({
            id: `action-${idx}`,
            type: action.type === 'custom_code' ? 'code' : 'action',
            position: { 
                x: 250 + (idx - Math.floor(automation.actions.length / 2)) * 250, 
                y: automation.condition_logic?.groups?.length > 0 ? 250 : 150 
            },
            data: { 
                label: action.type === 'custom_code' ? 'Custom Code' : action.type.replace(/_/g, ' '),
                actionType: action.type
            }
        })) || [])
    ];

    const initialEdges = [
        { 
            id: 'trigger-to-next', 
            source: 'trigger', 
            target: automation.condition_logic?.groups?.length > 0 ? 'conditions' : 'action-0',
            animated: true,
            style: { stroke: '#3b82f6' }
        },
        ...(automation.condition_logic?.groups?.length > 0 ? 
            automation.actions?.map((_, idx) => ({
                id: `conditions-to-action-${idx}`,
                source: 'conditions',
                target: `action-${idx}`,
                animated: true,
                style: { stroke: '#f59e0b' }
            })) || [] : []
        ),
        ...(automation.actions?.length > 1 && !automation.condition_logic?.groups?.length ? 
            automation.actions.slice(1).map((_, idx) => ({
                id: `action-${idx}-to-${idx + 1}`,
                source: `action-${idx}`,
                target: `action-${idx + 1}`,
                animated: true,
                style: { stroke: '#10b981' }
            })) : []
        )
    ];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        <div className="h-[500px] border-2 border-slate-200 rounded-xl bg-slate-50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#e2e8f0" gap={16} />
                <Controls className="bg-white border border-slate-200 rounded-lg" />
                <MiniMap 
                    nodeColor={(node) => {
                        switch (node.type) {
                            case 'trigger': return '#3b82f6';
                            case 'condition': return '#f59e0b';
                            case 'code': return '#a855f7';
                            default: return '#10b981';
                        }
                    }}
                    className="bg-white border border-slate-200 rounded-lg"
                />
            </ReactFlow>
        </div>
    );
}