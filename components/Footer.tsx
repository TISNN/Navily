import React from 'react';

const NavilyMiniLogo = () => (
    <svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        <path d="M40 32 H92 C98 32 102 36 102 42 V212 C102 218 98 222 92 222 H40 C34 222 30 218 30 212 V42 C30 36 34 32 40 32 Z" fill="#515151"/>
        <path d="M102 32 H150 C156 32 160 36 158 42 L128 222 C127 228 123 232 117 232 H69 C63 232 59 228 60 222 L92 42 C93 36 97 32 102 32 Z" fill="#DCDCDC"/>
        <path d="M150 32 H198 C204 32 208 36 208 42 V212 C208 218 204 222 198 222 H150 C144 222 140 218 140 212 V42 C140 36 144 32 150 32 Z" fill="#3A3A3A"/>
    </svg>
);

export const Footer: React.FC = () => {
    return (
        <footer className="w-full max-w-[1400px] mx-auto px-6 py-10 mt-20 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <NavilyMiniLogo />
                <span className="text-xs font-bold tracking-widest text-navily-muted/50 uppercase">Navily System</span>
            </div>
            <p className="text-xs font-mono text-navily-muted/40">Made for your daily web routine</p>
        </footer>
    );
};