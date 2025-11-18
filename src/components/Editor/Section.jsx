import React from 'react';

export const Section = ({ node, children }) => {
    return (
        <div className="mt-6 mb-4 font-serif text-black">
            <div className="flex items-baseline font-bold text-lg">
                {children}
            </div>
        </div>
    );
};
