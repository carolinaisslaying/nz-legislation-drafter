import React from 'react';
import { LegislationNode } from '../../types';

export const CrossHeading = ({ children }: { node: LegislationNode; children: React.ReactNode }) => {
    return (
        <div className="text-center italic font-normal text-[12pt] mt-[12pt] mb-[6pt] block font-serif">
            {children}
        </div>
    );
};
