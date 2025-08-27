/**
 * Contract tests for Jest configuration.
 * Framework: Jest
 * These tests validate that jest.config.* exports a stable, well-formed configuration.
 * They focus on the configuration surface so that changes in PR diffs are caught early.
 */

 /* eslint-disable no-undef */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const toArray = (v) => Array.isArray(v) ? v : (v == null ? [] : [v]);
const isPlainObject = (o) => o && typeof o === 'object' && !Array.isArray(o);
const isNonEmptyString = (s) => typeof s === 'string' && s.trim().length > 0;
const isStringArray = (arr) => Array.isArray(arr) && arr.every(isNonEmptyString);
const tryRegex = (s) => { try { new RegExp(s); return true; } catch (_) { return false; } };

async function loadJestConfig() {
  const rootDir = path.resolve(__dirname, '..');
  const candidates = [
    'jest.config.js',
    'jest.config.cjs',
    'jest.config.mjs',
    'jest.config.ts',
    'jest.config.mts',
    'jest.config.cts',
  ].map((p) => path.join(rootDir, p));
  const configPath = candidates.find((p) => fs.existsSync(p));
  if (!configPath) {
    throw new Error(`Could not locate jest config in: ${candidates.join(', ')}`);
  }
  let cfg;
  try {
    // Try CommonJS require first
    // eslint-disable-next-line global-require, import/no-dynamic-require
    cfg = require(configPath);
    if (cfg && typeof cfg === 'object' && 'default' in cfg && Object.keys(cfg).length === 1) {
      // Interop case
      cfg = cfg.default;
    }
  } catch (requireErr) {
    // Fallback to dynamic import (ESM or TS transpiled by Jest)
    const mod = await import(pathToFileURL(configPath).href);
    cfg = mod && (mod.default ?? mod);
  }
  return { cfg, rootDir, configPath };
}

describe('Jest configuration contract', () => {
  /** @type {any} */
  let cfg;
  /** @type {string} */
  let rootDir;
  /** @type {string} */
  let configPath;

  beforeAll(async () => {
    const loaded = await loadJestConfig();
    cfg = loaded.cfg;
    rootDir = loaded.rootDir;
    configPath = loaded.configPath;
  });

  test('exports a plain object', () => {
    expect(cfg).toBeTruthy();
    expect(typeof cfg).toBe('object');
    expect(Array.isArray(cfg)).toBe(false);
  });

  test('contains only serializable top-level values', () => {
    const allowedType = (v) =>
      v == null ||
      ['string', 'number', 'boolean'].includes(typeof v) ||
      Array.isArray(v) ||
      typeof v === 'object';
    Object.entries(cfg).forEach(([k, v]) => {
      expect(allowedType(v)).toBe(true);
    });
  });

  describe('core fields (if present)', () => {
    test('preset is a non-empty string', () => {
      if ('preset' in cfg) expect(isNonEmptyString(cfg.preset)).toBe(true);
    });

    test('testEnvironment is a non-empty string (e.g., "node" or "jsdom")', () => {
      if ('testEnvironment' in cfg) expect(isNonEmptyString(cfg.testEnvironment)).toBe(true);
    });

    test('roots is an array of strings', () => {
      if ('roots' in cfg) expect(isStringArray(cfg.roots)).toBe(true);
    });

    test('moduleFileExtensions is an array of strings', () => {
      if ('moduleFileExtensions' in cfg) expect(isStringArray(cfg.moduleFileExtensions)).toBe(true);
    });

    test('verbose is boolean if set', () => {
      if ('verbose' in cfg) expect(typeof cfg.verbose).toBe('boolean');
    });

    test('bail is boolean or number if set', () => {
      if ('bail' in cfg) expect(['boolean', 'number'].includes(typeof cfg.bail)).toBe(true);
    });

    test('maxWorkers is number or string if set', () => {
      if ('maxWorkers' in cfg) expect(['number', 'string'].includes(typeof cfg.maxWorkers)).toBe(true);
    });

    test('testTimeout is number if set', () => {
      if ('testTimeout' in cfg) expect(typeof cfg.testTimeout).toBe('number');
    });
  });

  describe('test discovery configuration (if present)', () => {
    test('testMatch is an array of non-empty strings (globs)', () => {
      if ('testMatch' in cfg) expect(isStringArray(cfg.testMatch)).toBe(true);
    });

    test('testRegex is string/array of valid regex patterns', () => {
      if ('testRegex' in cfg) {
        const arr = toArray(cfg.testRegex);
        expect(arr.length).toBeGreaterThan(0);
        arr.forEach((rx) => expect(tryRegex(rx)).toBe(true));
      }
    });

    test('testPathIgnorePatterns is an array of strings if set', () => {
      if ('testPathIgnorePatterns' in cfg) expect(isStringArray(cfg.testPathIgnorePatterns)).toBe(true);
    });

    test('watchPathIgnorePatterns is an array of strings if set', () => {
      if ('watchPathIgnorePatterns' in cfg) expect(isStringArray(cfg.watchPathIgnorePatterns)).toBe(true);
    });
  });

  describe('transform configuration (if present)', () => {
    test('transform is an object of { regex: transformer }', () => {
      if ('transform' in cfg) {
        expect(isPlainObject(cfg.transform)).toBe(true);
        Object.entries(cfg.transform).forEach(([pattern, transformer]) => {
          expect(tryRegex(pattern)).toBe(true);
          const okValue =
            typeof transformer === 'string' ||
            (Array.isArray(transformer) && transformer.length >= 1 && typeof transformer[0] === 'string');
          expect(okValue).toBe(true);
        });
      }
    });

    test('transformIgnorePatterns is an array of strings if set', () => {
      if ('transformIgnorePatterns' in cfg) expect(isStringArray(cfg.transformIgnorePatterns)).toBe(true);
    });

    test('extensionsToTreatAsEsm is an array of strings if set', () => {
      if ('extensionsToTreatAsEsm' in cfg) expect(isStringArray(cfg.extensionsToTreatAsEsm)).toBe(true);
    });
  });

  describe('moduleNameMapper configuration (if present)', () => {
    test('moduleNameMapper maps valid regex strings to string or array of strings', () => {
      if ('moduleNameMapper' in cfg) {
        expect(isPlainObject(cfg.moduleNameMapper)).toBe(true);
        Object.entries(cfg.moduleNameMapper).forEach(([rx, target]) => {
          expect(tryRegex(rx)).toBe(true);
          const okTarget =
            typeof target === 'string' ||
            (Array.isArray(target) && target.length > 0 && target.every(isNonEmptyString));
          expect(okTarget).toBe(true);
        });
      }
    });
  });

  describe('setup and lifecycle configuration (if present)', () => {
    test('setupFiles is an array of strings if set', () => {
      if ('setupFiles' in cfg) expect(isStringArray(cfg.setupFiles)).toBe(true);
    });

    test('setupFilesAfterEnv is an array of strings if set', () => {
      if ('setupFilesAfterEnv' in cfg) expect(isStringArray(cfg.setupFilesAfterEnv)).toBe(true);
    });

    test('globalSetup/globalTeardown are strings if set', () => {
      if ('globalSetup' in cfg) expect(isNonEmptyString(cfg.globalSetup)).toBe(true);
      if ('globalTeardown' in cfg) expect(isNonEmptyString(cfg.globalTeardown)).toBe(true);
    });

    test('testRunner/runner are strings if set', () => {
      if ('testRunner' in cfg) expect(isNonEmptyString(cfg.testRunner)).toBe(true);
      if ('runner' in cfg) expect(isNonEmptyString(cfg.runner)).toBe(true);
    });
  });

  describe('coverage configuration (if present)', () => {
    test('collectCoverage is boolean if set', () => {
      if ('collectCoverage' in cfg) expect(typeof cfg.collectCoverage).toBe('boolean');
    });

    test('coverageDirectory is string if set', () => {
      if ('coverageDirectory' in cfg) expect(isNonEmptyString(cfg.coverageDirectory)).toBe(true);
    });

    test('coverageReporters is array of strings if set', () => {
      if ('coverageReporters' in cfg) expect(isStringArray(cfg.coverageReporters)).toBe(true);
    });

    test('coverageThreshold is a nested object of numeric thresholds if set', () => {
      if ('coverageThreshold' in cfg) {
        expect(isPlainObject(cfg.coverageThreshold)).toBe(true);
        Object.values(cfg.coverageThreshold).forEach((v) => {
          expect(isPlainObject(v)).toBe(true);
          Object.values(v).forEach((num) => expect(typeof num).toBe('number'));
        });
      }
    });
  });

  describe('resolvers and globals (if present)', () => {
    test('resolver is string if set', () => {
      if ('resolver' in cfg) expect(isNonEmptyString(cfg.resolver)).toBe(true);
    });

    test('snapshotResolver is string if set', () => {
      if ('snapshotResolver' in cfg) expect(isNonEmptyString(cfg.snapshotResolver)).toBe(true);
    });

    test('testEnvironmentOptions/globals are plain objects if set', () => {
      if ('testEnvironmentOptions' in cfg) expect(isPlainObject(cfg.testEnvironmentOptions)).toBe(true);
      if ('globals' in cfg) expect(isPlainObject(cfg.globals)).toBe(true);
    });

    test('resetMocks/restoreMocks/clearMocks are booleans if set', () => {
      ['resetMocks', 'restoreMocks', 'clearMocks'].forEach((k) => {
        if (k in cfg) expect(typeof cfg[k]).toBe('boolean');
      });
    });
  });

  test('configuration file exists at a canonical path', () => {
    expect(fs.existsSync(configPath)).toBe(true);
  });
});