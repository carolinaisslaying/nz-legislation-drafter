import React from 'react';
import { LegislationNode } from '../../types';

export const DefPara = ({ children }: { node: LegislationNode; children: React.ReactNode }) => {
    return (
        <div className="ml-6 mt-1 font-serif text-black">
            {children}
        </div>
    );
};
