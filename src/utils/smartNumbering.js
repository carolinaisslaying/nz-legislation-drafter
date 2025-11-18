// Utility for smart numbering

export const renumberNodes = (nodes, type) => {
    let counter = 1;
    return nodes.map(node => {
        if (node.type === type) {
            // Find the label child
            const labelIndex = node.children.findIndex(c => c.type === 'label');
            if (labelIndex !== -1) {
                const labelNode = node.children[labelIndex];
                // Only renumber if auto.number is yes or not set (defaulting to yes for this logic)
                // For now, we force renumbering for simplicity
                if (labelNode.attributes && labelNode.attributes['auto.number'] !== 'no') {
                    // Create a new label node with updated content
                    const newLabel = { ...labelNode, content: String(counter) };
                    if (type === 'subsection') {
                        newLabel.content = `(${counter})`;
                    } else if (type === 'para') {
                        // Convert 1 -> a, 2 -> b, etc.
                        newLabel.content = `(${String.fromCharCode(96 + counter)})`;
                    } else if (type === 'subpara') {
                        // Roman numerals: i, ii, iii, iv, v
                        const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
                        newLabel.content = `(${romans[counter - 1] || counter})`;
                    } else if (type === 'subsubpara') {
                        // Uppercase letters: A, B, C
                        newLabel.content = `(${String.fromCharCode(64 + counter)})`;
                    }

                    const newChildren = [...node.children];
                    newChildren[labelIndex] = newLabel;

                    counter++;
                    return { ...node, children: newChildren };
                }
            }
            counter++;
        }

        // Recursive renumbering for children if needed (e.g. subsections inside sections)
        if (node.children) {
            // This is a bit complex because we need to know what to renumber inside.
            // For now, let's just handle the top-level renumbering of the list passed in.
            return node;
        }
        return node;
    });
};

export const createNode = (type) => {
    const baseNode = {
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
            { type: 'heading', content: 'Cross Heading' }
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
