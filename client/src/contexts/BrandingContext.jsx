import { useBrandSettings } from 'api/queries/brandSettings';
import { createContext, useContext, useEffect } from 'react';

const BrandingContext = createContext();

export const BrandingProvider = ({ children }) => {
    const { data: branding, isPending: isLoading, error } = useBrandSettings();



    const defaultBranding = {
        logoUrl: '/assets/images/logo.svg', // fallback
        faviconUrl: '/favicon.svg',
        faviconIcoUrl: '/favicon.ico',
        appleTouchIconUrl: '/apple-touch-icon.png'
    };

    const value = {
        branding: branding,
        isLoading,
        error
    };

    return (
        <BrandingContext.Provider value={value}>
            {children}
        </BrandingContext.Provider>
    );
};

export const useBranding = () => {
    const context = useContext(BrandingContext);
    if (!context) throw new Error('useBranding must be used within BrandingProvider');
    return context;
};