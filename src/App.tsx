import { useState } from 'react';
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
                <div className="bg-gray-200 border-b border-gray-300 p-2 flex justify-end no-print">
                    <label className="flex items-center space-x-2 text-sm">
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

                    {/* XML Preview */}
                    {showXML && (
                        <div className="w-1/2 bg-gray-900 text-gray-100 p-4 overflow-y-auto font-mono text-sm no-print">
                            <pre className="whitespace-pre-wrap break-words">{xmlOutput}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
