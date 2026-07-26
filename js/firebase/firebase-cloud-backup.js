"use strict";

import { AuthenticationManager } from "../managers/authentication.manager.js";
import { DashboardRepository } from "../repositories/dashboard.repository.js";

const MAX_CLOUD_BACKUP_BYTES = 700 * 1024;
function byteLength(value){return new TextEncoder().encode(JSON.stringify(value)).length;}
async function requireUser(){await AuthenticationManager.initialize();const user=AuthenticationManager.getCurrentUser();if(!user?.uid)throw new Error("Sign in before using cloud backups.");return user;}

/** User-scoped cloud backup service using the existing Dashboard repository. */
const FirebaseCloudBackup = Object.freeze({
    /** Save an existing validated backup payload. @param {Object} payload BackupManager payload. @returns {Promise<string>} Cloud document ID. @throws {Error} On authentication, size, or repository failure. */
    async create(payload){const user=await requireUser();if(!payload||typeof payload!=="object"||Array.isArray(payload))throw new Error("Backup data is unavailable.");const size=byteLength(payload);if(size>MAX_CLOUD_BACKUP_BYTES)throw new Error("Cloud backup exceeds the safe Firestore size limit. Export it as a local file instead.");return DashboardRepository.save({recordType:"cloud-backup",schemaVersion:1,ownerUid:user.uid,createdAt:new Date().toISOString(),sizeBytes:size,payload});},
    /** List the authenticated user's cloud backups. @returns {Promise<Object[]>} Newest backups first. @throws {Error} On authentication or repository failure. */
    async list(){await requireUser();const documents=await DashboardRepository.getAll();return documents.filter(x=>x?.data?.recordType==="cloud-backup").sort((a,b)=>String(b.data.createdAt).localeCompare(String(a.data.createdAt)));},
    /** Read one cloud backup. @param {string} id Repository document ID. @returns {Promise<Object>} Backup payload. @throws {Error} If missing or invalid. */
    async get(id){await requireUser();const document=await DashboardRepository.getById(id);if(document?.data?.recordType!=="cloud-backup"||!document.data.payload)throw new Error("Cloud backup was not found.");return document.data.payload;},
    /** Delete one cloud backup. @param {string} id Repository document ID. @returns {Promise<void>} Completion. @throws {Error} On validation or repository failure. */
    async delete(id){await requireUser();await DashboardRepository.delete(id);}
});

export { FirebaseCloudBackup, MAX_CLOUD_BACKUP_BYTES };
