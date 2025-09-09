import React, { useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';

const InactivityDetector = () => {
    // ✅ UPDATED: Get isSessionTimeoutEnabled from the context
    const { signOut, isSessionTimeoutEnabled } = useContext(AuthContext);
    const timeoutRef = useRef(null);

    const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

    const handleLogout = () => {
        console.log("User has been inactive. Logging out.");
        signOut();
    };

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    };

    useEffect(() => {
        // ✅ UPDATED: Only run the timer if the feature is enabled
        if (!isSessionTimeoutEnabled) {
            // If the feature is turned off, ensure any existing timer is cleared.
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

        // The cleanup function will remove listeners if the component unmounts
        // or if the feature is toggled off.
        return () => {
            clearTimeout(timeoutRef.current);
            activityEvents.forEach(event => {
                window.removeEventListener(event, resetTimeout);
            });
        };
    // ✅ UPDATED: Rerun this effect whenever the toggle state changes
    }, [isSessionTimeoutEnabled]);

    return null;
};

export default InactivityDetector;