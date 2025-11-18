import React from 'react';

export const Subpart = ({ node, children }) => {
    return (
        <div className="mt-8 mb-4 font-serif">
            {/* Subpart renders as a single line: SUBPART {n}—{HEADING} */}
            {/* We expect children to contain label and heading nodes. 
          We might need to render them specifically to achieve the single line layout 
          if they are separate nodes in the tree. 
          For now, we render children which usually are label and heading. 
          We force them to be inline-block or flex. */}
            <div className="flex items-baseline uppercase font-bold text-black">
                {children}
            </div>
        </div>
    );
};
