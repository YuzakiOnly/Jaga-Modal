import { useState, useRef, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

export function useSidebarTransition(delay = 500) {
    const { state: sidebarState } = useSidebar();
    const prevSidebarStateRef = useRef(sidebarState);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (prevSidebarStateRef.current !== sidebarState) {
            prevSidebarStateRef.current = sidebarState;
            setIsTransitioning(true);

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                setIsTransitioning(false);
                timerRef.current = null;
            }, delay);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [sidebarState, delay]);

    return isTransitioning;
}