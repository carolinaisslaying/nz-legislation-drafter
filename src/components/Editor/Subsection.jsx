import React from 'react';

export const Subsection = ({ node, children }) => {
    return (
        <div className="mt-2 font-serif text-black flex items-baseline">
            {children}
        </div>
    );
};
