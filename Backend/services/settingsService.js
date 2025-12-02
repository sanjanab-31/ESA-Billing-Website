import { getDb } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Settings Service - Handles application settings
 */
export const settingsService = {
    /**
     * Get all settings
     */
    async getSettings() {
        const db = getDb();
        try {
            const snapshot = await db.collection('settings').get();
            const settings = {};

            snapshot.docs.forEach(doc => {
                settings[doc.id] = doc.data();
            });

            return settings;
        } catch (error) {
            console.error('Error getting settings:', error);
            throw error;
        }
    },

    /**
     * Update setting
     */
    async updateSetting(key, value, description) {
        const db = getDb();
        try {
            const settingRef = db.collection('settings').doc(key);
            const doc = await settingRef.get();

            if (doc.exists) {
                // Update existing setting
                await settingRef.update({
                    value,
                    description: description || doc.data().description,
                    updatedAt: FieldValue.serverTimestamp()
                });
            } else {
                // Create new setting
                await settingRef.set({
                    value,
                    description: description || '',
                    createdAt: FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp()
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating setting:', error);
            throw error;
        }
    }
};
