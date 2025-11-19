import React from 'react';
import { LegislationNode } from '../../types';

export const Part = ({ children }: { node: LegislationNode; children: React.ReactNode }) => {
    return (
        <div className="mt-10 mb-[12pt] font-serif text-black">
            <div className="flex flex-col items-center text-center font-bold text-[14pt] leading-tight mb-[12pt] font-serif">
                {children}
            </div>
        </div>
    );
};
