/**
 * VY Prompt Master - Configuration Backup and Recovery
 * Handles automatic backups and recovery for corrupted configuration files
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import * as path from 'path';
import { resolve, dirname } from 'path';

export interface BackupResult {
  success: boolean;
  message: string;
  backupPath?: string;
  recoveredFrom?: string;
}

export interface RecoveryResult {
  success: boolean;
  config?: any;
  source: 'original' | 'backup' | 'none';
  error?: string;
  recoveredFrom?: string;
}

/**
 * Ensures a directory exists, creating it if necessary
 */
function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Generates a backup file path with timestamp and random component
 */
function generateBackupPath(originalPath: string): string {
  const dir = dirname(originalPath);
  const ext = originalPath.endsWith('.json') ? '.json' : '';
  const baseName = originalPath.substring(originalPath.lastIndexOf('/') + 1).replace(ext, '');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const random = Math.random().toString(36).substring(2, 8); // Add randomness to prevent collisions

  return resolve(dir, `.${baseName}.backup.${timestamp}-${random}${ext}`);
}

/**
 * Creates a backup of a configuration file
 * @param configPath Path to the configuration file
 * @returns Result of the backup operation
 */
export function createBackup(configPath: string): BackupResult {
  try {
    if (!existsSync(configPath)) {
      return {
        success: false,
        message: `Config file does not exist: ${configPath}`,
      };
    }

    const backupPath = generateBackupPath(configPath);
    const backupDir = dirname(backupPath);

    // Ensure backup directory exists
    ensureDir(backupDir);

    // Create backup
    copyFileSync(configPath, backupPath);

    // Clean up old backups (keep last 10)
    cleanupOldBackups(configPath, 10);

    return {
      success: true,
      message: `Backup created successfully`,
      backupPath,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create backup: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Cleans up old backup files, keeping only the most recent ones
 * @param configPath Original configuration file path
 * @param keepNumber Number of backups to keep
 */
function cleanupOldBackups(configPath: string, keepNumber: number): void {
  try {
    const dir = dirname(configPath);
    const baseName = configPath.substring(configPath.lastIndexOf('/') + 1).replace(/\.json$/, '');
    const backupPattern = new RegExp(`^\\.${baseName}\\.backup\\.[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{3}Z-[a-z0-9]+\\.json$`);

    const files = readdirSync(dir);
    const backups = files
      .filter((f: string) => backupPattern.test(f))
      .map((f: string) => ({
        name: f,
        path: resolve(dir, f),
        stat: statSync(resolve(dir, f)),
      }))
      .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());

    // Remove old backups beyond the keep limit
    for (let i = keepNumber; i < backups.length; i++) {
      try {
        unlinkSync(backups[i].path);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    // Ignore cleanup errors - it's not critical
  }
}

/**
 * Attempts to load a configuration file with automatic recovery from backup
 * @param configPath Path to the configuration file
 * @returns Recovery result with config data and source information
 */
export function loadConfigWithBackup(configPath: string): RecoveryResult {
  // First try to load the original file
  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(content);

      // Config loaded successfully, create a backup
      createBackup(configPath);

      return {
        success: true,
        config,
        source: 'original',
      };
    } catch (error) {
      console.warn(`Config file ${configPath} is corrupted:`, error);

      // Try to recover from backup
      const backupResult = recoverFromLatestBackup(configPath);
      if (backupResult.success) {
        return backupResult;
      }

      return {
        success: false,
        source: 'none',
        error: `Config file corrupted and no valid backup found: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  // File doesn't exist, try to recover from backup
  const backupResult = recoverFromLatestBackup(configPath);
  if (backupResult.success) {
    // Restore the backup to the original location
    try {
      writeFileSync(configPath, JSON.stringify(backupResult.config, null, 2), 'utf-8');
      console.log(`Config restored from backup: ${configPath}`);
    } catch (error) {
      console.warn(`Could not restore config file: ${error}`);
    }
    return backupResult;
  }

  return {
    success: false,
    source: 'none',
    error: `Config file not found and no backups available: ${configPath}`,
  };
}

/**
 * Recovers configuration from the most recent backup
 * @param configPath Original configuration file path
 * @returns Recovery result
 */
function recoverFromLatestBackup(configPath: string): RecoveryResult {
  try {
    const dir = dirname(configPath);
    const baseName = configPath.substring(configPath.lastIndexOf('/') + 1).replace(/\.json$/, '');
    const backupPattern = new RegExp(`^\\.${baseName}\\.backup\\.[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{3}Z-[a-z0-9]+\\.json$`);

    if (!existsSync(dir)) {
      return {
        success: false,
        source: 'none',
        error: 'Backup directory does not exist',
      };
    }

    const files = readdirSync(dir);
    const backups = files
      .filter((f: string) => backupPattern.test(f))
      .map((f: string) => ({
        name: f,
        path: resolve(dir, f),
        stat: statSync(resolve(dir, f)),
      }))
      .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());

    if (backups.length === 0) {
      return {
        success: false,
        source: 'none',
        error: 'No backups found',
      };
    }

    // Try to load the most recent backup
    for (const backup of backups) {
      try {
        const content = readFileSync(backup.path, 'utf-8');
        const config = JSON.parse(content);

        return {
          success: true,
          config,
          source: 'backup',
          recoveredFrom: backup.path,
        };
      } catch (error) {
        console.warn(`Backup ${backup.path} is also corrupted:`, error);
        continue; // Try next backup
      }
    }

    return {
      success: false,
      source: 'none',
      error: 'All backups are corrupted',
    };
  } catch (error) {
    return {
      success: false,
      source: 'none',
      error: `Failed to recover from backup: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Gets the backup directory path for a given config file
 * @param configPath Path to the configuration file
 * @returns Path to the backup directory
 */
export function getBackupDir(configPath: string): string {
  return resolve(dirname(configPath), '.vy-backups');
}

/**
 * Lists all available backups for a configuration file
 * @param configPath Path to the configuration file
 * @returns Array of backup information
 */
export function listBackups(configPath: string): Array<{ path: string; date: Date; size: number }> {
  try {
    const dir = dirname(configPath);
    const baseName = configPath.substring(configPath.lastIndexOf('/') + 1).replace(/\.json$/, '');
    const backupPattern = new RegExp(`^\\.${baseName}\\.backup\\.[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{3}Z-[a-z0-9]+\\.json$`);

    if (!existsSync(dir)) {
      return [];
    }

    const files = readdirSync(dir);
    return files
      .filter((f: string) => backupPattern.test(f))
      .map((f: string) => {
        const path = resolve(dir, f);
        const stat = statSync(path);
        return {
          path,
          date: stat.mtime,
          size: stat.size,
        };
      })
      .sort((a, b) => {
        const timeDiff = b.date.getTime() - a.date.getTime();
        return timeDiff !== 0 ? timeDiff : (path.basename(b.path).localeCompare(path.basename(a.path)));
      });
  } catch (error) {
    return [];
  }
}