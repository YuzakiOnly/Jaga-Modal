import { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

export function useSmartRefresh({
    baseOnly = [],
    priorityOnly = [],
    baseInterval = 10000,
    priorityInterval = null,
    idleBaseInterval = 30000,
    idlePriorityInterval = null,
    idleTimeout = 60000,
    debug = false,
}) {
    const timerRef = useRef(null);
    const tickCountRef = useRef(0);
    const lastActivityRef = useRef(Date.now());
    const isIdleRef = useRef(false);
    const mountedRef = useRef(true);
    const isLoadingRef = useRef(false);

    const hasPriority = priorityOnly.length > 0 && priorityInterval != null;
    const effectivePriorityInterval = hasPriority ? priorityInterval : baseInterval;
    const effectiveIdlePriorityInterval = hasPriority ? (idlePriorityInterval ?? idleBaseInterval) : idleBaseInterval;

    const isVisible = () => document.visibilityState === 'visible';

    const log = (...args) => {
        if (debug) console.log('[useSmartRefresh]', ...args);
    };

    const getEffectiveIntervals = () => {
        const idle = Date.now() - lastActivityRef.current > idleTimeout;
        isIdleRef.current = idle;
        return {
            base: idle ? idleBaseInterval : baseInterval,
            priority: idle ? effectiveIdlePriorityInterval : effectivePriorityInterval,
        };
    };

    const doReload = (only, label) => {
        if (!mountedRef.current || !isVisible()) {
            log(`skip [${label}] — not mounted or hidden`);
            return;
        }
        if (isLoadingRef.current) {
            log(`skip [${label}] — previous request still in flight`);
            return;
        }
        if (router.activeVisit) {
            log(`skip [${label}] — inertia busy`);
            return;
        }

        isLoadingRef.current = true;
        log(`reload [${label}]`, only);

        router.reload({
            only: only.length > 0 ? only : undefined,
            onFinish: () => {
                isLoadingRef.current = false;
                log(`finish [${label}]`);
            },
            onError: () => {
                isLoadingRef.current = false;
                log(`error [${label}]`);
            },
        });
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            log('timer stopped');
        }
    };

    const startTimer = () => {
        stopTimer();
        if (!mountedRef.current) return;

        const { priority } = getEffectiveIntervals();
        tickCountRef.current = 0;

        log(`timer started — tick every ${priority}ms, hasPriority=${hasPriority}`);

        timerRef.current = setInterval(() => {
            if (!mountedRef.current) return;

            const { base: currentBase, priority: currentPriority } = getEffectiveIntervals();

            tickCountRef.current += 1;

            let isBaseTick;
            if (!hasPriority) {
                isBaseTick = true;
            } else {
                const baseEvery = Math.round(currentBase / currentPriority);
                isBaseTick = tickCountRef.current % baseEvery === 0;
                log(`tick #${tickCountRef.current} | idle=${isIdleRef.current} | baseEvery=${baseEvery} | isBaseTick=${isBaseTick}`);
            }

            if (isBaseTick) {
                tickCountRef.current = 0;
                doReload(baseOnly, 'base');
            } else {
                doReload(priorityOnly, 'priority');
            }
        }, priority);
    };

    useEffect(() => {
        mountedRef.current = true;

        const removeFinish = router.on('finish', () => {
            isLoadingRef.current = false;
        });

        log('mounted');
        startTimer();

        const handleVisibility = () => {
            if (!mountedRef.current) return;
            if (isVisible()) {
                log('tab visible — immediate reload + restart timer');
                doReload(baseOnly, 'visibility');
                startTimer();
            } else {
                log('tab hidden — stopping timer');
                stopTimer();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            mountedRef.current = false;
            removeFinish();
            log('unmounted');
            document.removeEventListener('visibilitychange', handleVisibility);
            stopTimer();
        };
    }, [baseOnly.length, priorityOnly.length]);

    useEffect(() => {
        const updateActivity = () => {
            if (!mountedRef.current) return;
            const wasIdle = isIdleRef.current;
            lastActivityRef.current = Date.now();
            if (wasIdle) {
                log('user active after idle — restarting timer');
                startTimer();
            }
        };

        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        events.forEach(e => window.addEventListener(e, updateActivity, { passive: true }));

        return () => {
            events.forEach(e => window.removeEventListener(e, updateActivity));
        };
    }, []);

    return { reload: () => doReload(baseOnly, 'manual') };
}