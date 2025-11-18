import React from 'react';

export const Part = ({ node, children }) => {
    return (
        <div className="mt-10 mb-6 font-serif text-black">
            <div className="flex flex-col items-center font-bold uppercase tracking-wide">
                {children}
            </div>
        </div>
    );
};
