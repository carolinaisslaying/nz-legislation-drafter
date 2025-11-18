import React, { createContext, useReducer, useContext } from 'react';
import { initialLegislationState } from './initialState';

const LegislationContext = createContext();

import { renumberNodes, createNode } from '../utils/smartNumbering';

const legislationReducer = (state, action) => {
    switch (action.type) {
        case 'SELECT_NODE': {
            return { ...state, selectedPath: action.payload };
        }
        case 'UPDATE_NODE_CONTENT': {
            const { path, content } = action.payload;
            // (Existing logic for deep update - simplified for brevity in this tool call, 
            // but in reality I should preserve the previous logic or use a helper)
            // To be safe, I will copy the logic I wrote before.

            const newState = JSON.parse(JSON.stringify(state));
            let current = newState;
            // Handle root state properties if needed, but usually we update children
            // We need to traverse carefully.
            // Note: state.selectedPath is at the root, so we need to be careful not to lose it if we replace state.

            // Actually, let's separate the tree data from the UI state (selection)
            // But for now, let's assume state IS the tree, and we add selectedPath as a non-enumerable or just a property.
            // Wait, if I modify `state` structure to be `{ tree: ..., ui: ... }` it changes everything.
            // Let's keep `selectedPath` inside the state object for now, or just handle it.
            // The previous `initialState` was just the tree.

            // Let's assume the state passed here is the tree + selectedPath.

            // Re-implementing the traversal:
            for (let i = 0; i < path.length; i++) {
                const index = path[i];
                if (i === path.length - 1) {
                    if (current.children && current.children[index]) {
                        current.children[index].content = content;
                    }
                } else {
                    if (current.children && current.children[index]) {
                        current = current.children[index];
                    } else {
                        break;
                    }
                }
            }
            return newState;
        }
        case 'ADD_NODE': {
            const { type } = action.payload;
            const newState = JSON.parse(JSON.stringify(state));
            const selectedPath = state.selectedPath || [];

            // Helper to get node at path
            const getNode = (root, path) => {
                let current = root;
                for (let idx of path) {
                    if (current && current.children && current.children[idx]) {
                        current = current.children[idx];
                    } else {
                        return null;
                    }
                }
                return current;
            };

            let targetParent = null;
            let insertIndex = -1;

            // Strategy: Find the nearest ancestor that can accept this type
            if (type === 'part') {
                // Parts always go into Body
                // Find body node
                const bodyNode = newState.children.find(c => c.type === 'body');
                if (bodyNode) {
                    targetParent = bodyNode;
                    insertIndex = bodyNode.children ? bodyNode.children.length : 0;

                    // If we have a selection, try to insert after the selected Part
                    if (selectedPath.length > 0) {
                        // Check if selection is inside a part
                        // Path to part is usually [1, partIndex] (0 is cover, 1 is body)
                        if (selectedPath[0] === 1 && selectedPath.length >= 2) {
                            insertIndex = selectedPath[1] + 1;
                        }
                    }
                }
            } else if (type === 'subpart') {
                // Subparts go into Parts
                if (selectedPath.length > 0 && selectedPath[0] === 1 && selectedPath.length >= 2) {
                    targetParent = newState.children[1].children[selectedPath[1]];
                    insertIndex = targetParent.children ? targetParent.children.length : 0;
                }
            } else if (type === 'crosshead') {
                // Cross headings can go into Parts or Subparts
                // For now, let's assume they go into the current container (Part or Subpart)
                if (selectedPath.length > 0 && selectedPath[0] === 1 && selectedPath.length >= 2) {
                    // If selected is Part, add to Part
                    targetParent = newState.children[1].children[selectedPath[1]];
                    // If selected is inside a subpart (path length >= 3 and parent is subpart), add to subpart
                    // This requires checking the type of the node at path[2]
                    // Simplified: Add to Part for now
                    insertIndex = targetParent.children ? targetParent.children.length : 0;
                }
            } else if (type === 'section') {
                // Sections go into Parts or Subparts
                // Check if we are in a Subpart
                if (selectedPath.length > 0 && selectedPath[0] === 1 && selectedPath.length >= 2) {
                    const part = newState.children[1].children[selectedPath[1]];
                    // Check if selected node is a subpart
                    if (selectedPath.length >= 3) {
                        const potentialSubpart = part.children[selectedPath[2]];
                        if (potentialSubpart && potentialSubpart.type === 'subpart') {
                            targetParent = potentialSubpart;
                            insertIndex = targetParent.children ? targetParent.children.length : 0;
                        } else {
                            targetParent = part;
                            insertIndex = selectedPath[2] + 1;
                        }
                    } else {
                        targetParent = part;
                        insertIndex = part.children ? part.children.length : 0;
                    }
                } else {
                    // Default to last part
                    const bodyNode = newState.children.find(c => c.type === 'body');
                    if (bodyNode && bodyNode.children && bodyNode.children.length > 0) {
                        targetParent = bodyNode.children[bodyNode.children.length - 1];
                        insertIndex = targetParent.children ? targetParent.children.length : 0;
                    }
                }
            } else if (type === 'subsection') {
                // Subsections go into Sections
                // Must have a section selected or be inside one
                if (selectedPath.length > 0 && selectedPath[0] === 1 && selectedPath.length >= 3) {
                    // Navigate to Part -> Section (or Part -> Subpart -> Section)
                    // This path logic is getting brittle.
                    // Better approach: Traverse down to find the nearest Section ancestor.

                    // Let's assume standard Part -> Section for now
                    const part = newState.children[1].children[selectedPath[1]];
                    if (part && part.children && part.children[selectedPath[2]]) {
                        targetParent = part.children[selectedPath[2]];
                        if (targetParent.type !== 'section') {
                            // Maybe it's a subpart, check deeper?
                            // For MVP, assume strict hierarchy Part -> Section
                        }

                        if (selectedPath.length >= 4) {
                            insertIndex = selectedPath[3] + 1;
                        } else {
                            insertIndex = targetParent.children ? targetParent.children.length : 0;
                        }
                    }
                }
            } else if (type === 'para') {
                // Paragraphs go into Subsections
                // Assume selection is inside a subsection
                // Path: Body(1) -> Part(i) -> Section(j) -> Subsection(k)
                if (selectedPath.length >= 4) {
                    const part = newState.children[1].children[selectedPath[1]];
                    const section = part.children[selectedPath[2]];
                    const subsection = section.children[selectedPath[3]];
                    if (subsection && subsection.type === 'subsection') {
                        targetParent = subsection;
                        insertIndex = subsection.children ? subsection.children.length : 0;
                    }
                }
            } else if (type === 'subpara') {
                // Subparas go into Paras
                if (selectedPath.length >= 5) {
                    const part = newState.children[1].children[selectedPath[1]];
                    const section = part.children[selectedPath[2]];
                    const subsection = section.children[selectedPath[3]];
                    const para = subsection.children[selectedPath[4]];
                    if (para && para.type === 'para') {
                        targetParent = para;
                        insertIndex = para.children ? para.children.length : 0;
                    }
                }
            }

            if (targetParent) {
                const newNode = createNode(type);
                if (!targetParent.children) targetParent.children = [];

                if (insertIndex === -1) insertIndex = targetParent.children.length;
                targetParent.children.splice(insertIndex, 0, newNode);

                // Renumbering
                targetParent.children = renumberNodes(targetParent.children, type);
            }

            return newState;
        }
        default:
            return state;
    }
};

export const LegislationProvider = ({ children }) => {
    const [state, dispatch] = useReducer(legislationReducer, initialLegislationState);

    return (
        <LegislationContext.Provider value={{ state, dispatch }}>
            {children}
        </LegislationContext.Provider>
    );
};

export const useLegislation = () => useContext(LegislationContext);
