import { useEffect, useContext, useCallback, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * InactivityDetector Component
 * Monitors user activity and automatically logs out after a period of inactivity
 * based on the session timeout settings configured in the Settings page
 */
const InactivityDetector = () => {
    const {
        isSessionTimeoutEnabled,
        sessionTimeoutMinutes,
        signOut
    } = useContext(AuthContext);

    const navigate = useNavigate();
    const timeoutRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    // Reset the inactivity timer
    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Only set new timeout if session timeout is enabled
        if (isSessionTimeoutEnabled && sessionTimeoutMinutes > 0) {
            const timeoutDuration = sessionTimeoutMinutes * 60 * 1000; // Convert minutes to milliseconds

            timeoutRef.current = setTimeout(async () => {
                try {
                    await signOut();
                    navigate('/login', {
                        state: {
                            message: `You were logged out due to ${sessionTimeoutMinutes} minutes of inactivity.`
                        }
                    });
                } catch (error) {
                    console.error('Error during auto-logout:', error);
                }
            }, timeoutDuration);
        }
    }, [isSessionTimeoutEnabled, sessionTimeoutMinutes, signOut, navigate]);

    // Activity event handler
    const handleActivity = useCallback(() => {
        resetTimer();
    }, [resetTimer]);

    useEffect(() => {
        // Only attach listeners if session timeout is enabled
        if (!isSessionTimeoutEnabled) {
            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            return;
        }

        // Events that indicate user activity
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
        ];

        // Attach event listeners
        events.forEach(event => {
            document.addEventListener(event, handleActivity, true);
        });

        // Initialize timer
        resetTimer();

        // Cleanup function
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity, true);
            });

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isSessionTimeoutEnabled, handleActivity, resetTimer]);

    // This component doesn't render anything
    return null;
};

export default InactivityDetector;
