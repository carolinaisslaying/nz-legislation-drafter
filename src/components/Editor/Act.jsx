import React from 'react';

export const Act = ({ node, children }) => {
    return (
        <div className="max-w-4xl mx-auto p-8 bg-white shadow-sm min-h-screen text-black">
            {children}
        </div>
    );
};
