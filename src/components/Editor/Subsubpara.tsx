import React from 'react';
import { LegislationNode } from '../../types';

export const Subsubpara = ({ children }: { node: LegislationNode; children: React.ReactNode }) => {
    return (
        <div className="flex flex-row flex-wrap items-baseline mb-[3pt] text-[12pt] font-normal font-serif text-justify pl-[3.5rem] relative group">
            {children}
            <div className="absolute left-[-200px] top-0 bg-yellow-100 text-yellow-800 text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity w-48 border border-yellow-300 pointer-events-none">
                Avoid subsubparagraphs. Try turning the subsection into a section.
            </div>
        </div>
    );
};
