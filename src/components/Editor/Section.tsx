import React from 'react';
import { LegislationNode } from '../../types';

export const Section = ({ children }: { node: LegislationNode; children: React.ReactNode }) => {
    return (
        <div className="mt-0 mb-0 font-serif text-black">
            <div className="text-left font-bold text-[12pt] mb-0 block font-serif flex flex-row flex-wrap items-baseline">
                {children}
            </div>
        </div>
    );
};
