import React from 'react';

export const Subpara = ({ node, children }) => {
    return (
        <div className="ml-6 flex items-baseline mt-1 font-serif text-black">
            {/* Label is usually the first child */}
            {children}
        </div>
    );
};
