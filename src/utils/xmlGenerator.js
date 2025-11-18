// Utility to generate XML from the state tree

const escapeXML = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

const generateAttributes = (attributes) => {
    if (!attributes) return '';
    return Object.entries(attributes)
        .map(([key, value]) => ` ${key}="${escapeXML(String(value))}"`)
        .join('');
};

export const generateXML = (node) => {
    if (!node) return '';

    // Handle text nodes (if we structure them as objects with type 'text' or just strings)
    // In our initial state, we have type: 'text', content: '...'
    if (node.type === 'text' || node.type === 'label' || node.type === 'heading' || node.type === 'title' || node.type === 'def-term') {
        // These are leaf nodes in our simplified model, or contain text content
        // Actually, looking at the schema: <label>...</label>, <heading>...</heading>
        // So we render the tag, attributes, and then the content.
        const attrs = generateAttributes(node.attributes);
        return `<${node.type}${attrs}>${escapeXML(node.content)}</${node.type}>`;
    }

    // Handle container nodes
    const attrs = generateAttributes(node.attributes);
    let childrenXML = '';

    if (node.children && node.children.length > 0) {
        childrenXML = node.children.map(child => generateXML(child)).join('');
    } else if (node.content) {
        // Fallback if a node has content but is not one of the explicit types above
        childrenXML = escapeXML(node.content);
    }

    return `<${node.type}${attrs}>${childrenXML}</${node.type}>`;
};
