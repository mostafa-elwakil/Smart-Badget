import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from './ui/Button';

export default function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const onClick = (evt) => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
    };

    if (!supportsPWA) {
        return null;
    }

    return (
        <div className="fixed bottom-20 right-4 z-50 md:bottom-4">
            <Button
                onClick={onClick}
                className="rounded-full shadow-lg p-4 h-14 w-14 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white"
                title="Install App"
            >
                <Download className="h-6 w-6" />
            </Button>
        </div>
    );
}
