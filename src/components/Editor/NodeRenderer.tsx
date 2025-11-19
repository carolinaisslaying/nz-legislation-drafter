import React from 'react';
import { Act } from './Act';
import { Part } from './Part';
import { Section } from './Section';
import { Subsection } from './Subsection';
import { Para } from './Para';
import { DefPara } from './DefPara';

import { Subpart } from './Subpart';
import { CrossHeading } from './CrossHeading';
import { Subpara } from './Subpara';
import { Subsubpara } from './Subsubpara';

import { useLegislation } from '../../context/LegislationContext';
import { LegislationNode, NodeType } from '../../types';

// Editable leaf components
interface EditableTextProps {
    node: LegislationNode;
    path: number[];
    className?: string;
    tagName?: React.ElementType;
}

const EditableText: React.FC<EditableTextProps> = ({ node, path, className, tagName: Tag = 'div' }) => {
    const { dispatch } = useLegislation();

    const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
        dispatch({
            type: 'UPDATE_NODE_CONTENT',
            payload: { path, content: e.target.innerText },
        });
    };

    return (
        <Tag
            contentEditable
            suppressContentEditableWarning
            onBlur={handleBlur}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className={`outline-none focus:bg-yellow-50 ${className || ''}`}
        >
            {node.content}
        </Tag>
    );
};

const Label = ({ node, parentType }: { node: LegislationNode; parentType?: NodeType }) => {
    let className = "mr-2 flex-shrink-0";

    // Bold labels for Part, Subpart, Section
    if (['part', 'subpart', 'section'].includes(parentType || '')) {
        className += " font-bold";
    }

    // Fixed widths for labels to ensure alignment in flex containers
    // Added 'section' to ensure Section Title aligns with Subsection text
    if (['section', 'subsection', 'para', 'subpara', 'subsubpara', 'def-para'].includes(parentType || '')) {
        className += " w-12 block";
    }

    return <span className={className}>{node.content}</span>;
};

const Heading = ({ node, path, parentType }: { node: LegislationNode; path: number[]; parentType?: NodeType }) => {
    let className = "font-serif mb-2 text-heading inline-block min-w-[50px]";

    // Bold headings for Part, Subpart, Section
    if (['part', 'subpart', 'section'].includes(parentType || '')) {
        className += " font-bold";
    }

    // Size adjustments
    if (['part', 'subpart'].includes(parentType || '')) {
        className += " text-[14pt]";
    } else {
        className += " text-[12pt]";
    }

    // Spacing adjustments
    if (parentType === 'section') {
        className = className.replace('mb-2', 'mb-0');
    }

    if (['section', 'subsection', 'para', 'subpara', 'subsubpara', 'def-para'].includes(parentType || '')) {
        className += " flex-1 block";
    }
    return <EditableText node={node} path={path} tagName="h3" className={className} />;
};

const Title = ({ node, path }: { node: LegislationNode; path: number[] }) => <EditableText node={node} path={path} tagName="h1" className="font-serif font-bold text-3xl mb-4 text-heading block w-full text-center" />;

const Text = ({ node, path, parentType }: { node: LegislationNode; path: number[]; parentType?: NodeType }) => {
    let className = "";
    if (['subsection', 'para', 'subpara', 'subsubpara', 'def-para'].includes(parentType || '')) {
        className += " flex-1 block";
    }
    if (parentType === 'metadata-bill') {
        className += " text-center block font-serif";
    }
    return <EditableText node={node} path={path} tagName="span" className={className} />;
};

const MetadataRow = ({ children }: { children: React.ReactNode }) => (
    <div className="contents">
        {children}
    </div>
);

const MetadataKey = ({ node, path }: { node: LegislationNode; path: number[] }) => {
    if (node.attributes?.readOnly === 'true') {
        return <span className="font-serif text-right">{node.content}</span>;
    }
    return <EditableText node={node} path={path} tagName="span" className="font-serif text-right" />;
};

const MetadataValue = ({ node, path }: { node: LegislationNode; path: number[] }) => (
    <EditableText node={node} path={path} tagName="span" className="font-serif text-left" />
);

const Body = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

interface NodeRendererProps {
    node: LegislationNode;
    path?: number[];
    parentType?: NodeType;
}

// Helper to determine if types can be siblings/reordered
const areTypesCompatible = (type1: NodeType, type2: NodeType): boolean => {
    if (type1 === type2) return true;

    // Sections, Cross-headings, and Subparts can mix (high-level structure)
    const highLevelTypes = ['section', 'crosshead', 'subpart'];
    if (highLevelTypes.includes(type1) && highLevelTypes.includes(type2)) {
        return true;
    }

    return false;
};

export const NodeRenderer: React.FC<NodeRendererProps & { parentType?: NodeType }> = ({ node, path = [], parentType }) => {
    const { state, dispatch } = useLegislation();

    if (!node) return null;

    const isSelected = state.selectedPath && state.selectedPath.join(',') === path.join(',');

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent bubbling
        dispatch({ type: 'SELECT_NODE', payload: path });
    };

    const renderChildren = (currentNodeType: NodeType) => {
        return node.children?.map((child, index) => (
            <React.Fragment key={index}>
                <NodeRenderer node={child} path={[...path, index]} parentType={currentNodeType} />
                {currentNodeType === 'subpart' && child.type === 'label' && <span className="mx-1">—</span>}
            </React.Fragment>
        ));
    };

    // Global variable to track dragged type since dataTransfer is restricted in dragOver
    // This is safe because drag operations are single-threaded in the browser UI
    const [dragOverPosition, setDragOverPosition] = React.useState<'before' | 'after' | null>(null);

    const handleDragStart = (e: React.DragEvent, nodePath: number[]) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ path: nodePath, type: node.type }));
        // Store type globally for dragOver check
        (window as any).__draggedType = node.type;
        e.stopPropagation();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const draggedType = (window as any).__draggedType;

        // Relaxed Rule: Allow reordering if types are compatible
        if (!draggedType || !areTypesCompatible(draggedType, node.type)) {
            setDragOverPosition(null);
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const position = e.clientY < midY ? 'before' : 'after';

        setDragOverPosition(position);
    };

    const handleDragLeave = () => {
        setDragOverPosition(null);
    };

    const handleDrop = (e: React.DragEvent, targetPath: number[]) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverPosition(null);
        (window as any).__draggedType = null;

        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        const { path: sourcePath, type: sourceType } = JSON.parse(data);

        // Double check type compatibility on drop
        if (!areTypesCompatible(sourceType, node.type)) return;

        // Prevent dropping into self or children
        const isChild = (parent: number[], child: number[]) => {
            if (child.length <= parent.length) return false;
            return parent.every((val, i) => val === child[i]);
        };

        if (sourcePath.join(',') === targetPath.join(',') || isChild(sourcePath, targetPath)) {
            return;
        }

        dispatch({
            type: 'MOVE_NODE',
            payload: { sourcePath, targetPath, position: dragOverPosition || 'after' }
        });
    };

    const Container = ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <div
            onClick={handleSelect}
            draggable
            onDragStart={(e) => handleDragStart(e, path)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, path)}
            // Removed p-1 to ensure exact spacing control
            className={`relative ${className || ''} ${isSelected ? 'ring-2 ring-blue-500 rounded bg-blue-100' : ''} transition-all cursor-pointer w-full hover:bg-gray-100`}
        >
            {dragOverPosition === 'before' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 pointer-events-none z-10" />
            )}
            {children}
            {dragOverPosition === 'after' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 pointer-events-none z-10" />
            )}
        </div>
    );

    const insertActOptions = () => {
        const metadataNode: LegislationNode = {
            type: 'metadata-act',
            children: [
                {
                    type: 'metadata-row',
                    children: [
                        { type: 'metadata-key', content: 'Public Act' },
                        { type: 'metadata-value', content: '2019 No 58' }
                    ]
                },
                {
                    type: 'metadata-row',
                    children: [
                        { type: 'metadata-key', content: 'Date of assent', attributes: { readOnly: 'true' } },
                        { type: 'metadata-value', content: '28 October 2019' }
                    ]
                },
                {
                    type: 'metadata-row',
                    children: [
                        { type: 'metadata-key', content: 'Commencement', attributes: { readOnly: 'true' } },
                        { type: 'metadata-value', content: 'see section 2' }
                    ]
                }
            ]
        };
        // Insert at end of cover children
        dispatch({ type: 'INSERT_NODE', payload: { path: [...path, node.children?.length || 0], node: metadataNode } });
    };

    const insertBillOptions = () => {
        const metadataNode: LegislationNode = {
            type: 'metadata-bill',
            children: [
                { type: 'text', content: "Member's Bill" }
            ]
        };
        // Insert at end of cover children
        dispatch({ type: 'INSERT_NODE', payload: { path: [...path, node.children?.length || 0], node: metadataNode } });
    };

    switch (node.type) {
        case 'act':
            return <Act node={node}>{renderChildren('act')}</Act>;
        case 'cover':
            const hasMetadata = node.children?.some(c => c.type === 'metadata-act' || c.type === 'metadata-bill');
            return (
                <Container className="mb-8">
                    {renderChildren('cover')}
                    {!hasMetadata && (
                        <div className="flex justify-center gap-4 mt-4 no-print">
                            <button onClick={insertActOptions} className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700">
                                Insert Act Options
                            </button>
                            <button onClick={insertBillOptions} className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700">
                                Insert Bill Options
                            </button>
                        </div>
                    )}
                </Container>
            );
        case 'title':
            return <Title node={node} path={path} />;
        case 'metadata-act':
            return <div className="mt-4 mb-8 grid grid-cols-2 gap-x-6 w-fit mx-auto text-lg">{renderChildren('metadata-act')}</div>;
        case 'metadata-bill':
            return <div className="mt-4 mb-8">{renderChildren('metadata-bill')}</div>;
        case 'metadata-row':
            return <MetadataRow>{renderChildren('metadata-row')}</MetadataRow>;
        case 'metadata-key':
            return <MetadataKey node={node} path={path} />;
        case 'metadata-value':
            return <MetadataValue node={node} path={path} />;
        case 'body':
            return <Body>{renderChildren('body')}</Body>;
        case 'part':
            return <Container><Part node={node}>{renderChildren('part')}</Part></Container>;
        case 'subpart':
            return <Container><Subpart node={node}>{renderChildren('subpart')}</Subpart></Container>;
        case 'crosshead':
            return <Container><CrossHeading node={node}>{renderChildren('crosshead')}</CrossHeading></Container>;
        case 'section':
            return <Container><Section node={node}>{renderChildren('section')}</Section></Container>;
        case 'subsection':
            return <Container><Subsection node={node}>{renderChildren('subsection')}</Subsection></Container>;
        case 'para':
            // Indentation handled by Para component padding
            return <Container><Para node={node}>{renderChildren('para')}</Para></Container>;
        case 'subpara':
            // Indentation handled by Subpara component padding
            return <Container><Subpara node={node}>{renderChildren('subpara')}</Subpara></Container>;
        case 'subsubpara':
            // Indentation handled by Subsubpara component padding
            return <Container><Subsubpara node={node}>{renderChildren('subsubpara')}</Subsubpara></Container>;
        case 'def-para':
            return <Container><DefPara node={node}>{renderChildren('def-para')}</DefPara></Container>;
        case 'label':
            return <Label node={node} parentType={parentType} />;
        case 'heading':
            return <Heading node={node} path={path} parentType={parentType} />;
        case 'text':
            return <Text node={node} path={path} parentType={parentType} />;
        case 'def-term':
            return <strong className="font-bold"><EditableText node={node} path={path} tagName="span" /></strong>;
        default:
            return <div className="text-red-500">Unknown node type: {node.type}</div>;
    }
};
