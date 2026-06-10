// src/components/logo/LogoIcon.jsx
import { Helmet } from 'react-helmet-async';
import { useBranding } from 'contexts/BrandingContext';

export default function LogoIcon() {
    const { branding, isLoading } = useBranding();

    // Don't render anything while loading → browser keeps default favicon from index.html
    if (isLoading || !branding) return null;

    return (
        <Helmet>
            {/* Standard favicon (.ico is served by your backend) */}
            <link rel="icon" href={branding?.faviconIcoUrl || branding?.faviconUrl} />
            <link rel="shortcut icon" href={branding?.faviconIcoUrl || branding?.faviconUrl} />

            {/* Modern browsers (PNG fallback) */}
            <link rel="icon" type="image/png" sizes="32x32" href={branding?.faviconUrl} />
            <link rel="icon" type="image/png" sizes="16x16" href={branding?.faviconUrl} />

            {/* Apple devices */}
            <link rel="apple-touch-icon" sizes="180x180" href={branding?.appleTouchIconUrl} />
        </Helmet>
    );
}