import React from 'react';

export const Subsubpara = ({ node, children }) => {
    return (
        <div className="ml-6 flex items-baseline mt-1 font-serif text-black relative group">
            {children}
            <div className="absolute left-[-200px] top-0 bg-yellow-100 text-yellow-800 text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity w-48 border border-yellow-300 pointer-events-none">
                Avoid subsubparagraphs. Try turning the subsection into a section.
            </div>
        </div>
    );
};
