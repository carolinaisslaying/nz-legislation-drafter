import { LegislationNode } from '../types';

const escapeXML = (str: string | undefined): string => {
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

const generateAttributes = (attributes?: Record<string, string>): string => {
    if (!attributes) return '';
    return Object.entries(attributes)
        .map(([key, value]) => ` ${key}="${escapeXML(String(value))}"`)
        .join('');
};

export const generateXML = (node: LegislationNode): string => {
    if (!node) return '';

    // Handle text nodes
    if (node.type === 'text' || node.type === 'label' || node.type === 'heading' || node.type === 'title' || node.type === 'def-term') {
        const attrs = generateAttributes(node.attributes);
        return `<${node.type}${attrs}>${escapeXML(node.content)}</${node.type}>`;
    }

    // Handle container nodes
    const attrs = generateAttributes(node.attributes);
    let childrenXML = '';

    if (node.children && node.children.length > 0) {
        childrenXML = node.children.map((child: LegislationNode) => generateXML(child)).join('');
    } else if (node.content) {
        childrenXML = escapeXML(node.content);
    }

    return `<${node.type}${attrs}>${childrenXML}</${node.type}>`;
};
