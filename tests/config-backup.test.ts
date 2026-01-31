/**
 * VY Prompt Master - Config Backup and Recovery Tests
 * Tests for configuration file backup and corruption recovery
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmdirSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import * as os from 'os';
import {
  createBackup,
  loadConfigWithBackup,
  listBackups,
  getBackupDir,
} from '../src/utils/config-backup.js';

describe('Config Backup and Recovery Tests', () => {
  let tempDir: string;
  let configPath: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(os.tmpdir(), 'vy-config-test-'));
    configPath = join(tempDir, 'vy.config.json');
  });

  afterEach(() => {
    try {
      if (existsSync(tempDir)) {
        rmdirSync(tempDir, { recursive: true });
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('createBackup', () => {
    it('should create a backup of a valid config file', () => {
      const config = {
        defaultProvider: 'anthropic',
        maxIterations: 3,
        strictMode: true,
      };
      writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

      const result = createBackup(configPath);

      expect(result.success).toBe(true);
      expect(result.backupPath).toBeDefined();
      expect(result.backupPath).toContain('.vy.config.backup');
      expect(result.backupPath).toContain('.json');
      expect(existsSync(result.backupPath!)).toBe(true);
    });

    it('should return error if config file does not exist', () => {
      const result = createBackup(configPath);

      expect(result.success).toBe(false);
      expect(result.message).toContain('does not exist');
    });

    it('should handle corrupted config file gracefully', () => {
      writeFileSync(configPath, 'not valid json {{{', 'utf-8');

      const result = createBackup(configPath);

      // Backup should still succeed even if config is corrupted
      expect(result.success).toBe(true);
      expect(result.backupPath).toBeDefined();
      expect(existsSync(result.backupPath!)).toBe(true);
    });

    it('should create multiple backups with unique timestamps', () => {
      const config = { test: 'data' };
      writeFileSync(configPath, JSON.stringify(config), 'utf-8');

      const result1 = createBackup(configPath);
      const result2 = createBackup(configPath);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.backupPath).not.toBe(result2.backupPath);
    });
  });

  describe('loadConfigWithBackup', () => {
    it('should load valid config and create backup', () => {
      const config = {
        defaultProvider: 'openai',
        maxIterations: 5,
        strictMode: false,
      };
      writeFileSync(configPath, JSON.stringify(config), 'utf-8');

      const result = loadConfigWithBackup(configPath);

      expect(result.success).toBe(true);
      expect(result.config).toEqual(config);
      expect(result.source).toBe('original');
      expect(result.error).toBeUndefined();
    });

    it('should recover from backup when original is corrupted', () => {
      // Create a valid config and backup
      const config = {
        defaultProvider: 'anthropic',
        maxIterations: 3,
      };
      writeFileSync(configPath, JSON.stringify(config), 'utf-8');
      createBackup(configPath);

      // Corrupt the original
      writeFileSync(configPath, 'corrupted {{{ data', 'utf-8');

      // Should recover from backup
      const result = loadConfigWithBackup(configPath);

      expect(result.success).toBe(true);
      expect(result.config).toEqual(config);
      expect(result.source).toBe('backup');
      expect(result.recoveredFrom).toBeDefined();
    });

    it('should recover from backup when original file is missing', () => {
      // Create config and backup, then delete original
      const config = {
        defaultProvider: 'mock',
        yamlSizeLimit: 50000,
      };
      writeFileSync(configPath, JSON.stringify(config), 'utf-8');
      createBackup(configPath);
      unlinkSync(configPath);

      // Should recover from backup
      const result = loadConfigWithBackup(configPath);

      expect(result.success).toBe(true);
      expect(result.config).toEqual(config);
      expect(result.source).toBe('backup');
      expect(existsSync(configPath)).toBe(true); // Should restore the file
    });

    it('should handle case when config and all backups are corrupted', () => {
      // Create config and backup
      writeFileSync(configPath, JSON.stringify({ test: 'data' }), 'utf-8');
      
      // Create multiple backups to test corruption handling
      const result1 = createBackup(configPath);
      writeFileSync(configPath, JSON.stringify({ test: 'data2' }), 'utf-8');
      const result2 = createBackup(configPath);

      // Get all backup paths
      const allBackups = listBackups(configPath);
      expect(allBackups.length).toBeGreaterThan(0);

      // Corrupt the original and ALL backups
      writeFileSync(configPath, 'corrupted', 'utf-8');
      allBackups.forEach(backup => {
        writeFileSync(backup.path, 'also corrupted', 'utf-8');
      });

      const result = loadConfigWithBackup(configPath);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toMatch(/corrupted|backup/i);
    });

    it('should handle case when config is missing and no backups exist', () => {
      const result = loadConfigWithBackup(configPath);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.error).toContain('no backups available');
    });

    it('should handle empty config file', () => {
      writeFileSync(configPath, '', 'utf-8');

      const result = loadConfigWithBackup(configPath);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle config with invalid JSON structure', () => {
      writeFileSync(configPath, '{ invalid json: missing quotes, }', 'utf-8');

      const result = loadConfigWithBackup(configPath);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('listBackups', () => {
    it('should return empty array when no backups exist', () => {
      const backups = listBackups(configPath);

      expect(backups).toEqual([]);
    });

    it('should list all backups sorted by date (newest first)', () => {
      const config = { test: 'data' };
      writeFileSync(configPath, JSON.stringify(config), 'utf-8');

      // Create multiple backups
      createBackup(configPath);
      createBackup(configPath);
      createBackup(configPath);

      const backups = listBackups(configPath);

      expect(backups.length).toBe(3);
      expect(backups[0].date.getTime()).toBeGreaterThanOrEqual(backups[1].date.getTime());
      expect(backups[1].date.getTime()).toBeGreaterThanOrEqual(backups[2].date.getTime());
      expect(backups[0].size).toBeGreaterThan(0);
    });

    it('should include backup path and metadata', () => {
      const config = { key: 'value' };
      writeFileSync(configPath, JSON.stringify(config), 'utf-8');
      createBackup(configPath);

      const backups = listBackups(configPath);

      expect(backups.length).toBe(1);
      expect(backups[0].path).toBeDefined();
      expect(backups[0].date).toBeInstanceOf(Date);
      expect(backups[0].size).toBeGreaterThan(0);
    });
  });

  describe('getBackupDir', () => {
    it('should return backup directory path', () => {
      const backupDir = getBackupDir(configPath);

      expect(backupDir).toContain(tempDir);
    });
  });

  describe('cleanupOldBackups', () => {
    it('should keep only the most recent backups', () => {
      const config = { test: 'data' };
      writeFileSync(configPath, JSON.stringify(config), 'utf-8');

      // Create more than 10 backups
      for (let i = 0; i < 15; i++) {
        // Modify config slightly to make each backup unique
        writeFileSync(configPath, JSON.stringify({ test: 'data', version: i }), 'utf-8');
        createBackup(configPath);
      }

      // Should only keep 10 most recent
      const backups = listBackups(configPath);
      expect(backups.length).toBeLessThanOrEqual(10);
    });

    it('should handle cleanup errors gracefully', () => {
      const config = { test: 'data' };
      writeFileSync(configPath, JSON.stringify(config), 'utf-8');

      // Create backups
      for (let i = 0; i < 5; i++) {
        createBackup(configPath);
      }

      // Cleanup should not throw
      expect(() => {
        writeFileSync(configPath, JSON.stringify({ test: 'new' }), 'utf-8');
        createBackup(configPath);
      }).not.toThrow();
    });
  });

  describe('Recovery from multiple corrupted backups', () => {
    it('should try backups in order until finding a valid one', () => {
      // Create first config version (older)
      const config1 = { good: 'config', version: 1 };
      writeFileSync(configPath, JSON.stringify(config1), 'utf-8');
      
      // Create first backup (will be the older backup)
      createBackup(configPath);
      
      // Create second config version (newer)
      const config2 = { good: 'config', version: 2 };
      writeFileSync(configPath, JSON.stringify(config2), 'utf-8');
      
      // Create second backup (will be the newer backup)
      createBackup(configPath);
      
      // Verify we have exactly 2 backups
      const backupsBefore = listBackups(configPath);
      expect(backupsBefore.length).toBe(2);
      
      // Corrupt the original config
      writeFileSync(configPath, 'corrupted', 'utf-8');
      
      // Corrupt the NEWEST backup (version 2)
      // Newest backup is backupsBefore[0] due to sort by mtime
      writeFileSync(backupsBefore[0].path, 'also corrupted', 'utf-8');
      
      // Should recover from the older backup (version 1)
      const result = loadConfigWithBackup(configPath);

      expect(result.success).toBe(true);
      expect(result.source).toBe('backup');
      expect(result.config.version).toBe(1); // Should have recovered from older backup
    });
  });
});