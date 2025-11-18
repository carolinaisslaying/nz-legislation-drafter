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

// Editable leaf components
const EditableText = ({ node, path, className, tagName: Tag = 'div' }) => {
    const { dispatch } = useLegislation();

    const handleBlur = (e) => {
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
            onClick={(e) => e.stopPropagation()}
            className={`outline-none focus:bg-yellow-50 ${className}`}
        >
            {node.content}
        </Tag>
    );
};

const Label = ({ node }) => <span className="font-bold mr-2">{node.content}</span>; // Labels are usually auto-generated or fixed, keeping read-only for now
const Heading = ({ node, path }) => <EditableText node={node} path={path} tagName="h3" className="font-sans font-bold text-lg mb-2 text-heading inline-block min-w-[50px]" />;
const Title = ({ node, path }) => <EditableText node={node} path={path} tagName="h1" className="font-sans font-bold text-3xl mb-4 text-heading inline-block min-w-[100px]" />;
const Text = ({ node, path }) => <EditableText node={node} path={path} tagName="span" className="" />;
const Cover = ({ children }) => <div className="mb-8 border-b border-gray-300 pb-4">{children}</div>;
const Body = ({ children }) => <div>{children}</div>;

export const NodeRenderer = ({ node, path = [] }) => {
    const { state, dispatch } = useLegislation();

    if (!node) return null;

    const isSelected = state.selectedPath && state.selectedPath.join(',') === path.join(',');

    const handleSelect = (e) => {
        e.stopPropagation(); // Prevent bubbling
        dispatch({ type: 'SELECT_NODE', payload: path });
    };

    const renderChildren = () => {
        return node.children?.map((child, index) => (
            <NodeRenderer key={index} node={child} path={[...path, index]} />
        ));
    };

    const Container = ({ children, className }) => (
        <div
            onClick={handleSelect}
            className={`${className || ''} ${isSelected ? 'ring-2 ring-blue-500 rounded p-2 bg-blue-100' : 'p-2'} transition-all cursor-pointer`}
        >
            {children}
        </div>
    );

    switch (node.type) {
        case 'act':
            return <Act node={node}>{renderChildren()}</Act>; // Act is root, maybe don't select it easily
        case 'cover':
            return <Container className="mb-8 border-b border-gray-300 pb-4">{renderChildren()}</Container>;
        case 'title':
            return <Title node={node} path={path} />;
        case 'body':
            return <Body>{renderChildren()}</Body>;
        case 'part':
            return <Container className="mt-10 mb-6"><Part node={node}>{renderChildren()}</Part></Container>;
        case 'subpart':
            return <Container className="mt-8 mb-4"><Subpart node={node}>{renderChildren()}</Subpart></Container>;
        case 'crosshead':
            return <Container className="mt-4 mb-2"><CrossHeading node={node}>{renderChildren()}</CrossHeading></Container>;
        case 'section':
            return <Container className="mt-6 mb-4"><Section node={node}>{renderChildren()}</Section></Container>;
        case 'subsection':
            return <Container className="mt-2"><Subsection node={node}>{renderChildren()}</Subsection></Container>;
        case 'para':
            return <Container className="ml-6 mt-1"><Para node={node}>{renderChildren()}</Para></Container>;
        case 'subpara':
            return <Container className="ml-6 mt-1"><Subpara node={node}>{renderChildren()}</Subpara></Container>;
        case 'subsubpara':
            return <Container className="ml-6 mt-1"><Subsubpara node={node}>{renderChildren()}</Subsubpara></Container>;
        case 'def-para':
            return <Container className="ml-6 mt-1"><DefPara node={node}>{renderChildren()}</DefPara></Container>;
        case 'label':
            return <Label node={node} />;
        case 'heading':
            return <Heading node={node} path={path} />;
        case 'text':
            return <Text node={node} path={path} />;
        case 'def-term':
            return <strong className="font-bold"><EditableText node={node} path={path} tagName="span" /></strong>;
        default:
            return <div className="text-red-500">Unknown node type: {node.type}</div>;
    }
};
