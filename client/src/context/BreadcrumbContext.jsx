import React, { createContext, useContext, useState } from 'react';

const BreadcrumbContext = createContext();

export const BreadcrumbProvider = ({ children }) => {
    const [dynamicCrumbs, setDynamicCrumbs] = useState({});
    
    const setDynamicCrumb = (id, name) => {
        setDynamicCrumbs(prev => {
            if (prev[id] === name) return prev; // Prevent unnecessary re-renders
            return { ...prev, [id]: name };
        });
    };

    return (
        <BreadcrumbContext.Provider value={{ dynamicCrumbs, setDynamicCrumb }}>
            {children}
        </BreadcrumbContext.Provider>
    );
};

export const useBreadcrumb = () => useContext(BreadcrumbContext);
