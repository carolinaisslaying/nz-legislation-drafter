import React from 'react';

export const Para = ({ node, children }) => {
    return (
        <div className="ml-6 mt-1 font-serif text-black flex items-baseline">
            {children}
        </div>
    );
};
