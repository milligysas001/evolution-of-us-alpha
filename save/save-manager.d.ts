export const MAX_MANUAL_SLOTS: number;
export const MAX_AUTOSAVE_BACKUPS: number;
export function createManualSlotRecord(input: any): any;
export function normalizeManualSlotRecord(record: any): any;
export function normalizeManualSlots(input: any): any;
export function manualSlotGame(record: any): any;
export function rotateAutosaveBackups(existing: any[], envelope: any, options?: any): any[];
export function recoveryCandidates(currentEnvelope: any, backupRing?: any[], legacyBackup?: any): any[];
export function saveCheckpointReason(previous: any, next: any): string;
