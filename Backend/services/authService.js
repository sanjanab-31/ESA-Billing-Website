import { getAdmin } from '../config/firebase.js';

/**
 * Authentication Service - Handles user authentication
 */
export const authService = {
    /**
     * Verify Firebase ID token
     */
    async verifyToken(idToken) {
        try {
            const admin = getAdmin();
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            return decodedToken;
        } catch (error) {
            console.error('Error verifying token:', error);
            throw new Error('Invalid authentication token');
        }
    },

    /**
     * Get user by UID
     */
    async getUserByUid(uid) {
        try {
            const admin = getAdmin();
            const userRecord = await admin.auth().getUser(uid);
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                photoURL: userRecord.photoURL,
                emailVerified: userRecord.emailVerified
            };
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    },

    /**
     * Create a new user
     */
    async createUser(userData) {
        try {
            const admin = getAdmin();
            const userRecord = await admin.auth().createUser({
                email: userData.email,
                password: userData.password,
                displayName: userData.displayName,
                emailVerified: false
            });
            return {
                uid: userRecord.uid,
                email: userRecord.email
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    /**
     * Update user
     */
    async updateUser(uid, userData) {
        try {
            const admin = getAdmin();
            await admin.auth().updateUser(uid, userData);
            return { success: true };
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    /**
     * Delete user
     */
    async deleteUser(uid) {
        try {
            const admin = getAdmin();
            await admin.auth().deleteUser(uid);
            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
};
