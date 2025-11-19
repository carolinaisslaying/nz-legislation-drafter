import { LegislationNode, NodeType } from '../types';

const unescapeXML = (str: string): string => {
    return str
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"');
};

const parseAttributes = (element: Element): Record<string, string> | undefined => {
    const attributes: Record<string, string> = {};

    for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attributes[attr.name] = unescapeXML(attr.value);
    }

    return Object.keys(attributes).length > 0 ? attributes : undefined;
};

const parseXMLElement = (element: Element): LegislationNode => {
    const type = element.tagName as NodeType;
    const attributes = parseAttributes(element);

    // Text-only node types (leaf nodes)
    const textNodeTypes: NodeType[] = ['text', 'label', 'heading', 'title', 'def-term', 'metadata-key', 'metadata-value'];

    if (textNodeTypes.includes(type)) {
        return {
            type,
            content: unescapeXML(element.textContent || ''),
            attributes,
        };
    }

    // Container nodes - parse children
    const children: LegislationNode[] = [];
    let hasTextContent = false;

    for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i];

        if (child.nodeType === Node.ELEMENT_NODE) {
            children.push(parseXMLElement(child as Element));
        } else if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent?.trim();
            if (text) {
                hasTextContent = true;
            }
        }
    }

    const node: LegislationNode = {
        type,
        attributes,
    };

    if (children.length > 0) {
        node.children = children;
    }

    // Some nodes might have direct text content instead of children
    if (hasTextContent && children.length === 0) {
        node.content = unescapeXML(element.textContent || '');
    }

    return node;
};

export const parseXML = (xmlString: string): LegislationNode => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error('Invalid XML: ' + parserError.textContent);
    }

    // Get the root element
    const rootElement = xmlDoc.documentElement;
    if (!rootElement) {
        throw new Error('No root element found in XML');
    }

    return parseXMLElement(rootElement);
};
