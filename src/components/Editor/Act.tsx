import React from 'react';
import { LegislationNode } from '../../types';

export const Act = ({ children }: { node: LegislationNode; children: React.ReactNode }) => {
    return (
        <div className="max-w-4xl mx-auto p-8 bg-white shadow-sm min-h-screen text-black font-serif">
            {children}
        </div>
    );
};
