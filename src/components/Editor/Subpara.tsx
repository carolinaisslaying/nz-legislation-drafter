import React from 'react';
import { LegislationNode } from '../../types';

export const Subpara = ({ children }: { node: LegislationNode; children: React.ReactNode }) => {
    return (
        <div className="flex flex-row flex-wrap items-baseline mb-[3pt] text-[12pt] font-normal font-serif text-justify pl-[3.5rem]">
            {children}
        </div>
    );
};
