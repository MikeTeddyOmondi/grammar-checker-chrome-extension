import { useEffect } from 'react';

export const useTextAreaMonitor = (callback: (text: string) => void) => {
    useEffect(() => {
        const textAreas = document.querySelectorAll('textarea');
        textAreas.forEach((textarea) => {
            textarea.addEventListener('input', (e) => {
                const target = e.target as HTMLTextAreaElement;
                if (target.value.split(' ').length > 5) {
                    callback(target.value);
                }
            });
        });
    }, []);
};
