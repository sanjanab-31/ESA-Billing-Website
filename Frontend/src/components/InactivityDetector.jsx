import React, { useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';

const InactivityDetector = () => {
    const { signOut, isSessionTimeoutEnabled } = useContext(AuthContext);
    const timeoutRef = useRef(null);

    const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

    const handleLogout = () => {
        signOut();
    };

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    };

    useEffect(() => {
        if (!isSessionTimeoutEnabled) {
            clearTimeout(timeoutRef.current);
            return;
        }

        const activityEvents = [
            'mousemove',
            'mousedown',
            'keypress',
            'scroll',
            'touchstart'
        ];
        
        resetTimeout();
        activityEvents.forEach(event => {
            window.addEventListener(event, resetTimeout);
        });

        return () => {
            clearTimeout(timeoutRef.current);
            activityEvents.forEach(event => {
                window.removeEventListener(event, resetTimeout);
            });
        };
    }, [isSessionTimeoutEnabled]);

    return null;
};

export default InactivityDetector;