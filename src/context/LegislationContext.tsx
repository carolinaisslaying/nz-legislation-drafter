import { createContext, useReducer, useContext, type ReactNode, type Dispatch } from 'react';
import { initialLegislationState } from './initialState';
import { LegislationNode, LegislationState, NodeType } from '../types';
import { renumberNodes, createNode } from '../utils/smartNumbering';

type Action =
    | { type: 'UPDATE_NODE_CONTENT'; payload: { path: number[]; content: string } }
    | { type: 'ADD_NODE'; payload: { type: NodeType } }
    | { type: 'SELECT_NODE'; payload: number[] }
    | { type: 'MOVE_NODE'; payload: { sourcePath: number[]; targetPath: number[]; position: 'before' | 'after' | 'inside' } };

const LegislationContext = createContext<{ state: LegislationState; dispatch: Dispatch<Action> } | undefined>(undefined);

const findNode = (root: LegislationNode, path: number[]): LegislationNode | null => {
    let current = root;
    for (const index of path) {
        if (current.children && current.children[index]) {
            current = current.children[index];
        } else {
            return null;
        }
    }
    return current;
};

const findParent = (root: LegislationNode, path: number[]): { parent: LegislationNode | null; index: number } => {
    if (path.length === 0) return { parent: null, index: -1 };
    const parentPath = path.slice(0, -1);
    const index = path[path.length - 1];
    const parent = findNode(root, parentPath);
    return { parent, index };
};

const legislationReducer = (state: LegislationState, action: Action): LegislationState => {
    switch (action.type) {
        case 'SELECT_NODE': {
            return { ...state, selectedPath: action.payload };
        }
        case 'UPDATE_NODE_CONTENT': {
            const { path, content } = action.payload;
            const newState = JSON.parse(JSON.stringify(state));
            const node = findNode(newState, path);
            if (node) {
                node.content = content;
            }
            return newState;
        }
        case 'ADD_NODE': {
            const { type } = action.payload;
            const newState = JSON.parse(JSON.stringify(state));
            const selectedPath = state.selectedPath || [];

            let targetParent: LegislationNode | null = null;
            let insertIndex = -1;

            // Helper to find the nearest semantic parent for the new type
            const findInsertionPoint = () => {
                // Default to body if nothing selected
                if (selectedPath.length === 0) {
                    const body = newState.children?.find((c: LegislationNode) => c.type === 'body');
                    return { parent: body, index: body?.children?.length || 0 };
                }

                // Traverse up from selected node to find a valid parent
                let currentPath = [...selectedPath];
                while (currentPath.length >= 0) {
                    const node = findNode(newState, currentPath);
                    const parentData = findParent(newState, currentPath);

                    if (!node) break;

                    // Logic for where to insert based on type
                    if (type === 'part') {
                        if (node.type === 'body') return { parent: node, index: node.children?.length || 0 };
                        if (parentData.parent?.type === 'body') return { parent: parentData.parent, index: parentData.index + 1 };
                    }
                    if (type === 'subpart') {
                        if (node.type === 'part') return { parent: node, index: node.children?.length || 0 };
                        if (parentData.parent?.type === 'part') return { parent: parentData.parent, index: parentData.index + 1 };
                    }
                    if (type === 'section') {
                        if (node.type === 'part' || node.type === 'subpart') return { parent: node, index: node.children?.length || 0 };
                        if (parentData.parent?.type === 'part' || parentData.parent?.type === 'subpart') return { parent: parentData.parent, index: parentData.index + 1 };
                    }
                    if (type === 'subsection') {
                        if (node.type === 'section') return { parent: node, index: node.children?.length || 0 };
                        if (parentData.parent?.type === 'section') return { parent: parentData.parent, index: parentData.index + 1 };
                    }
                    if (type === 'para') {
                        if (node.type === 'subsection') return { parent: node, index: node.children?.length || 0 };
                        if (parentData.parent?.type === 'subsection') return { parent: parentData.parent, index: parentData.index + 1 };
                    }
                    if (type === 'subpara') {
                        if (node.type === 'para') return { parent: node, index: node.children?.length || 0 };
                        if (parentData.parent?.type === 'para') return { parent: parentData.parent, index: parentData.index + 1 };
                    }
                    if (type === 'subsubpara') {
                        if (node.type === 'subpara') return { parent: node, index: node.children?.length || 0 };
                        if (parentData.parent?.type === 'subpara') return { parent: parentData.parent, index: parentData.index + 1 };
                    }
                    if (type === 'crosshead') {
                        // Crossheadings can go in Part or Subpart
                        if (node.type === 'part' || node.type === 'subpart') return { parent: node, index: node.children?.length || 0 };
                        if (parentData.parent?.type === 'part' || parentData.parent?.type === 'subpart') return { parent: parentData.parent, index: parentData.index + 1 };
                    }

                    if (currentPath.length === 0) break;
                    currentPath.pop();
                }
                return { parent: null, index: -1 };
            };

            const insertion = findInsertionPoint();
            targetParent = insertion.parent;
            insertIndex = insertion.index;

            if (targetParent) {
                const newNode = createNode(type);
                if (!targetParent.children) targetParent.children = [];

                if (insertIndex === -1) insertIndex = targetParent.children.length;
                targetParent.children.splice(insertIndex, 0, newNode);

                // Renumber ALL children of this type in the parent
                if (['section', 'subsection', 'para', 'subpara', 'subsubpara'].includes(type)) {
                    targetParent.children = renumberNodes(targetParent.children, type);
                }
            }

            return newState;
        }
        case 'MOVE_NODE': {
            const { sourcePath, targetPath, position } = action.payload;
            if (sourcePath.join(',') === targetPath.join(',')) return state;

            const newState = JSON.parse(JSON.stringify(state));

            // 1. Get Source Info
            const sourceParentData = findParent(newState, sourcePath);
            if (!sourceParentData.parent || !sourceParentData.parent.children) return state;
            const sourceNode = sourceParentData.parent.children[sourceParentData.index];
            const sourceType = sourceNode.type;

            // 2. Remove Source
            sourceParentData.parent.children.splice(sourceParentData.index, 1);

            // 3. Adjust Target Path if needed
            let adjustedTargetIndex = targetPath[targetPath.length - 1];
            let targetParentPath = targetPath.slice(0, -1);

            // Check if we are moving within the same parent
            // We need to compare the *references* of the parents in the NEW state
            // But since we just modified sourceParentData.parent, we can check if paths match
            const sourceParentPath = sourcePath.slice(0, -1);
            const sameParent = sourceParentPath.join(',') === targetParentPath.join(',');

            if (sameParent) {
                if (sourceParentData.index < adjustedTargetIndex) {
                    adjustedTargetIndex -= 1;
                }
            }

            // 4. Get Target Parent
            const targetParent = findNode(newState, targetParentPath);
            if (!targetParent || !targetParent.children) return state;

            // 5. Insert
            let finalIndex = adjustedTargetIndex;
            if (position === 'after') finalIndex += 1;

            // Bound check
            if (finalIndex < 0) finalIndex = 0;
            if (finalIndex > targetParent.children.length) finalIndex = targetParent.children.length;

            targetParent.children.splice(finalIndex, 0, sourceNode);

            // 6. Renumber Source Parent (if different from target, or if same, we renumber target anyway)
            if (!sameParent && ['section', 'subsection', 'para', 'subpara'].includes(sourceType)) {
                sourceParentData.parent.children = renumberNodes(sourceParentData.parent.children, sourceType);
            }

            // 7. Renumber Target Parent
            if (['section', 'subsection', 'para', 'subpara'].includes(sourceType)) {
                targetParent.children = renumberNodes(targetParent.children, sourceType);
            }

            return newState;
        }
        default:
            return state;
    }
};

export const LegislationProvider = ({ children }: { children: ReactNode }) => {
    // @ts-ignore - Initial state matches shape but we need to cast or fix strictness later if needed
    const [state, dispatch] = useReducer(legislationReducer, initialLegislationState);

    return (
        <LegislationContext.Provider value={{ state, dispatch }}>
            {children}
        </LegislationContext.Provider>
    );
};

export const useLegislation = () => {
    const context = useContext(LegislationContext);
    if (context === undefined) {
        throw new Error('useLegislation must be used within a LegislationProvider');
    }
    return context;
};
