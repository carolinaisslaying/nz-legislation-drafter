import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Sidebar } from './components/Layout/Sidebar';
import { NodeRenderer } from './components/Editor/NodeRenderer';
import { useLegislation } from './context/LegislationContext';
import { generateXML } from './utils/xmlGenerator';

function App() {
    const { state } = useLegislation();
    const [showXML, setShowXML] = useState(true);

    const xmlOutput = generateXML(state);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="no-print">
                <Sidebar onPrint={handlePrint} />
            </div>

            <div className="flex-1 flex flex-col h-full">
                <div className="bg-yellow-50 border-b border-gray-300 p-2 flex justify-between items-center no-print">
                    <div className="flex items-center space-x-2 text-base text-gray-700 font-sans">
                        <span className="font-semibold">⚠️ Demonstration Only:</span>
                        <span>Not actively maintained. Written almost exclusively by Gemini 3.0 Pro (High) with Antigravity as a test.</span>
                    </div>
                    <label className="flex items-center space-x-2 text-sm font-sans">
                        <input
                            type="checkbox"
                            checked={showXML}
                            onChange={(e) => setShowXML(e.target.checked)}
                            className="rounded"
                        />
                        <span>Show XML Preview</span>
                    </label>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Visual Editor */}
                    <div className={`overflow-y-auto bg-gray-50 print-full-width ${showXML ? 'w-1/2 border-r border-gray-300' : 'w-full'}`}>
                        <NodeRenderer node={state} />
                    </div>

                    {/* XML Preview with Syntax Highlighting */}
                    {showXML && (
                        <div className="w-1/2 overflow-y-auto no-print" style={{ backgroundColor: '#1a202c' }}>
                            <SyntaxHighlighter
                                language="xml"
                                style={vscDarkPlus}
                                customStyle={{
                                    margin: 0,
                                    padding: '1rem',
                                    fontSize: '0.875rem',
                                    backgroundColor: '#1a202c',
                                }}
                                wrapLines={true}
                                lineProps={{ style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' } }}
                            >
                                {xmlOutput}
                            </SyntaxHighlighter>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
