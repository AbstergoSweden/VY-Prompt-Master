/**
 * VY Prompt Master - Configuration Management
 * Handles loading and managing application configuration
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load environment variables first
config();

export interface VYConfiguration {
  /** AI provider to use by default */
  defaultProvider: 'anthropic' | 'openai' | 'mock';
  /** Default model for the selected provider */
  defaultModel?: string;
  /** Maximum refinement iterations */
  maxIterations: number;
  /** Enable strict mode */
  strictMode: boolean;
  /** Enable verbose logging */
  verbose: boolean;
  /** Size limit for YAML files in bytes */
  yamlSizeLimit: number;
  /** Default timeout for API calls in ms */
  apiTimeout: number;
}

/** Default configuration values */
const DEFAULT_CONFIG: VYConfiguration = {
  defaultProvider: 'anthropic',
  maxIterations: 3,
  strictMode: false,
  verbose: false,
  yamlSizeLimit: 1024 * 100, // 100KB
  apiTimeout: 30000, // 30 seconds
};

/**
 * Loads configuration from various sources
 * Priority: Environment Variables > Config File > Defaults
 */
export function loadConfiguration(): VYConfiguration {
  // Start with defaults
  const config: VYConfiguration = { ...DEFAULT_CONFIG };

  // Override with environment variables if present
  if (process.env.DEFAULT_AI_PROVIDER) {
    const provider = process.env.DEFAULT_AI_PROVIDER.toLowerCase();
    if (provider === 'anthropic' || provider === 'openai' || provider === 'mock') {
      config.defaultProvider = provider as 'anthropic' | 'openai' | 'mock';
    }
  }

  if (process.env.DEFAULT_MODEL) {
    config.defaultModel = process.env.DEFAULT_MODEL;
  }

  if (process.env.MAX_REFINEMENT_ITERATIONS) {
    const iterations = parseInt(process.env.MAX_REFINEMENT_ITERATIONS, 10);
    if (!isNaN(iterations) && iterations > 0) {
      config.maxIterations = iterations;
    }
  }

  if (process.env.STRICT_VALIDATION) {
    config.strictMode = process.env.STRICT_VALIDATION.toLowerCase() === 'true';
  }

  if (process.env.LOG_LEVEL) {
    config.verbose = process.env.LOG_LEVEL.toLowerCase() === 'debug' || 
                     process.env.LOG_LEVEL.toLowerCase() === 'verbose';
  }

  if (process.env.YAML_SIZE_LIMIT) {
    const limit = parseInt(process.env.YAML_SIZE_LIMIT, 10);
    if (!isNaN(limit) && limit > 0) {
      config.yamlSizeLimit = limit;
    }
  }

  if (process.env.API_TIMEOUT) {
    const timeout = parseInt(process.env.API_TIMEOUT, 10);
    if (!isNaN(timeout) && timeout > 0) {
      config.apiTimeout = timeout;
    }
  }

  // Try to load from config file
  const configPaths = [
    resolve(process.cwd(), 'vy.config.json'),
    resolve(process.cwd(), '.vyrc.json'),
    resolve(process.cwd(), 'vy.config.js'),
    resolve(process.cwd(), '.vyrc.js'),
  ];

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        const configFileContent = readFileSync(configPath, 'utf-8');
        let fileConfig: Partial<VYConfiguration>;
        
        if (configPath.endsWith('.json')) {
          fileConfig = JSON.parse(configFileContent);
        } else {
          // For JS files, we'd need to eval or require, but that's risky
          // For now, we'll just support JSON config files
          continue;
        }

        // Override with values from config file
        if (fileConfig.defaultProvider) {
          config.defaultProvider = fileConfig.defaultProvider;
        }
        if (fileConfig.defaultModel) {
          config.defaultModel = fileConfig.defaultModel;
        }
        if (fileConfig.maxIterations !== undefined) {
          config.maxIterations = fileConfig.maxIterations;
        }
        if (fileConfig.strictMode !== undefined) {
          config.strictMode = fileConfig.strictMode;
        }
        if (fileConfig.verbose !== undefined) {
          config.verbose = fileConfig.verbose;
        }
        if (fileConfig.yamlSizeLimit !== undefined) {
          config.yamlSizeLimit = fileConfig.yamlSizeLimit;
        }
        if (fileConfig.apiTimeout !== undefined) {
          config.apiTimeout = fileConfig.apiTimeout;
        }
        
        break; // Use the first config file found
      } catch (error) {
        console.warn(`Warning: Could not load config file ${configPath}:`, error);
      }
    }
  }

  return config;
}