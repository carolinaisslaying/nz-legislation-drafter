import { LegislationNode, NodeType } from '../types';

export const renumberNodes = (nodes: LegislationNode[], type: NodeType): LegislationNode[] => {
    let counter = 1;
    return nodes.map(node => {
        if (node.type === type) {
            // Find the label child
            const labelIndex = node.children?.findIndex((c: LegislationNode) => c.type === 'label');

            // Even if label doesn't exist, we might need to create it or just skip? 
            // For now assuming structure is correct from createNode.

            if (labelIndex !== undefined && labelIndex !== -1 && node.children) {
                const labelNode = node.children[labelIndex];
                // Only renumber if auto.number is yes or not set (defaulting to yes for this logic)
                if (!labelNode.attributes || labelNode.attributes['auto.number'] !== 'no') {
                    // Create a new label node with updated content
                    let newContent = String(counter);

                    if (type === 'subsection') {
                        newContent = `(${counter})`;
                    } else if (type === 'para') {
                        // Convert 1 -> a, 2 -> b, etc.
                        newContent = `(${String.fromCharCode(96 + counter)})`;
                    } else if (type === 'subpara') {
                        // Roman numerals: i, ii, iii, iv, v
                        const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
                        newContent = `(${romans[counter - 1] || counter})`;
                    } else if (type === 'subsubpara') {
                        // Uppercase letters: A, B, C
                        newContent = `(${String.fromCharCode(64 + counter)})`;
                    }

                    const newLabel = { ...labelNode, content: newContent };
                    const newChildren = [...node.children];
                    newChildren[labelIndex] = newLabel;

                    counter++;
                    return { ...node, children: newChildren };
                }
            }
            // If we found the node type but skipped renumbering (e.g. auto.number=no), we still increment?
            // Usually manual numbering implies it's outside the sequence or fixed. 
            // For now, let's assume we increment only if we renumbered, OR if we want to skip a number.
            // But typically manual numbers are distinct. Let's increment counter to keep sequence for others.
            counter++;
        }
        return node;
    });
};

export const createNode = (type: NodeType): LegislationNode => {
    const baseNode: LegislationNode = {
        type,
        attributes: { id: `${type}_${Date.now()}` }, // Simple unique ID
        children: []
    };

    if (type === 'part') {
        baseNode.children = [
            { type: 'label', attributes: { 'auto.number': 'yes' }, content: 'Part X' },
            { type: 'heading', content: 'New Part Heading' }
        ];
    } else if (type === 'subpart') {
        baseNode.children = [
            { type: 'label', attributes: { 'auto.number': 'yes' }, content: 'Subpart X' },
            { type: 'heading', content: 'New Subpart Heading' }
        ];
    } else if (type === 'crosshead') {
        baseNode.children = [
            { type: 'heading', content: 'Cross-heading' }
        ];
    } else if (type === 'section') {
        baseNode.children = [
            { type: 'label', attributes: { 'auto.number': 'yes' }, content: '0' },
            { type: 'heading', content: '[Insert section heading]' },
            {
                type: 'subsection', attributes: { id: `sub_${Date.now()}` }, children: [
                    { type: 'label', content: '(1)' },
                    { type: 'text', content: '[Type text here...]' }
                ]
            }
        ];
    } else if (type === 'subsection') {
        baseNode.children = [
            { type: 'label', content: '(x)' },
            { type: 'text', content: '[Type text here...]' }
        ];
    } else if (type === 'para') {
        baseNode.children = [
            { type: 'label', content: '(a)' },
            { type: 'text', content: 'Paragraph text...' }
        ];
    } else if (type === 'subpara') {
        baseNode.children = [
            { type: 'label', content: '(i)' },
            { type: 'text', content: 'Subparagraph text...' }
        ];
    } else if (type === 'subsubpara') {
        baseNode.children = [
            { type: 'label', content: '(A)' },
            { type: 'text', content: 'Sub-subparagraph text...' }
        ];
    }

    return baseNode;
};
