export type NodeType = 'act' | 'cover' | 'title' | 'body' | 'part' | 'subpart' | 'crosshead' | 'section' | 'subsection' | 'para' | 'subpara' | 'subsubpara' | 'def-para' | 'def-term' | 'label' | 'heading' | 'text';

export interface LegislationNode {
    type: NodeType;
    attributes?: Record<string, string>;
    content?: string; // For leaf nodes like text, label, heading
    children?: LegislationNode[];
}

export interface LegislationState extends LegislationNode {
    selectedPath?: number[];
}
