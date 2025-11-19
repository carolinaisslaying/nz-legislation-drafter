import React from 'react';
import { useLegislation } from '../../context/LegislationContext';
import { generateXML } from '../../utils/xmlGenerator';
import { NodeType } from '../../types';
import { FaPlus } from 'react-icons/fa';

interface SidebarProps {
    onPrint?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onPrint }) => {
    const { state, dispatch } = useLegislation();

    const handleAdd = (type: NodeType) => {
        dispatch({ type: 'ADD_NODE', payload: { type } });
    };

    const handleExport = () => {
        const xml = generateXML(state);
        const blob = new Blob([xml], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'legislation.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-64 bg-gray-100 border-r border-gray-300 p-4 flex flex-col h-screen font-sans">
            <h2 className="font-bold text-lg mb-4 text-gray-700">Structure</h2>
            <div className="space-y-2 overflow-y-auto max-h-[60vh]">
                <button
                    onClick={() => handleAdd('part')}
                    className="w-full text-left px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center"
                >
                    <FaPlus className="mr-2 text-black" /> Add Part
                </button>
                <button
                    onClick={() => handleAdd('subpart')}
                    className="w-full text-left px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center"
                >
                    <FaPlus className="mr-2 text-black" /> Add Subpart
                </button>
                <button
                    onClick={() => handleAdd('crosshead')}
                    className="w-full text-left px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center"
                >
                    <FaPlus className="mr-2 text-black" /> Add Cross Heading
                </button>
                <button
                    onClick={() => handleAdd('section')}
                    className="w-full text-left px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center"
                >
                    <FaPlus className="mr-2 text-black" /> Add Section
                </button>
                <button
                    onClick={() => handleAdd('subsection')}
                    className="w-full text-left px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center"
                >
                    <FaPlus className="mr-2 text-black" /> Add Subsection
                </button>
                <button
                    onClick={() => handleAdd('para')}
                    className="w-full text-left px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center"
                >
                    <FaPlus className="mr-2 text-black" /> Add Paragraph
                </button>
                <button
                    onClick={() => handleAdd('subpara')}
                    className="w-full text-left px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center"
                >
                    <FaPlus className="mr-2 text-black" /> Add Subparagraph
                </button>
            </div>

            <div className="mt-auto space-y-2">
                <button
                    onClick={handleExport}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
                >
                    Export XML
                </button>
                <button
                    onClick={onPrint}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 font-bold"
                >
                    Export PDF
                </button>
            </div>
        </div>
    );
};
