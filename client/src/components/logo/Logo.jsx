import { useState } from "react";
import { useBranding } from "contexts/BrandingContext";
import LogoIcon from "./LogoIcon";

export default function Logo({ width = 140, sx }) {
    const { branding, isLoading, error } = useBranding();
    const [imgError, setImgError] = useState(false);

    // 1️⃣ While branding API is loading → show loading UI
    if (isLoading) {
        return (
            <div
                style={{
                    width,
                    height: 60,
                    background: "#f0f0f0",
                    borderRadius: 6
                }}
            />
        ); // or any skeleton
    }

    // 2️⃣ If API failed to load or returned no logo → show fallback
    if (error || !branding?.logoUrl) {
        return <LogoIcon />;
    }

    // 3️⃣ API gave URL → show image unless the image fails
    if (!imgError) {
        return (
            <img
                src={branding.logoUrl}
                alt="Brand Logo"
                style={{
                    height: 60,
                    maxWidth: "100%",
                    objectFit: "contain",
                    ...sx
                }}
                onError={() => setImgError(true)}
            />
        );
    }

    // 4️⃣ If image failed to load → fallback to <LogoIcon />
    return <LogoIcon />;
}
