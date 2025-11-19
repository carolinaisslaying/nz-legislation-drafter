import React from 'react';
import { LegislationNode } from '../../types';

export const Subpart = ({ children }: { node: LegislationNode; children: React.ReactNode }) => {
    return (
        <div className="mt-8 mb-[12pt] font-serif">
            <div className="text-center font-bold text-[14pt] mb-[12pt] block font-serif">
                {children}
            </div>
        </div>
    );
};
