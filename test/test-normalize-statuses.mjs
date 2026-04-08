#!/usr/bin/env node
/**
 * Tests for normalize-statuses.mjs
 */

import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync, copyFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const TEST_DIR = join(__dirname, 'tmp-normalize');
const SCRIPT = join(PROJECT_ROOT, 'normalize-statuses.mjs');

let passed = 0;
let failed = 0;

function setup() {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  mkdirSync(join(TEST_DIR, 'data'), { recursive: true });
}

function cleanup() {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
}

function writeApps(content) {
  writeFileSync(join(TEST_DIR, 'data', 'applications.md'), content);
}

function readApps() {
  return readFileSync(join(TEST_DIR, 'data', 'applications.md'), 'utf-8');
}

function runNormalize(dryRun = false) {
  try {
    const args = dryRun ? '--dry-run' : '';
    const output = execSync(`node ${SCRIPT} --cwd=${TEST_DIR} ${args}`, {
      encoding: 'utf-8',
      timeout: 10000,
    });
    return { exitCode: 0, output };
  } catch (e) {
    return { exitCode: e.status || 1, output: e.stdout || '' };
  }
}

function test(name, fn) {
  setup();
  try {
    fn();
    passed++;
    console.log(`  PASS: ${name}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL: ${name}`);
    console.log(`        ${e.message}`);
  }
  cleanup();
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

// --- Tests ---

console.log('\n=== normalize-statuses.mjs tests ===\n');

test('no applications.md exits cleanly', () => {
  const { exitCode } = runNormalize();
  assert(exitCode === 0, `Expected exit 0, got ${exitCode}`);
});

test('normalizes DUPLICADO to Discarded', () => {
  writeApps(`# Tracker

| # | Date | Company | Role | Score | DUPLICADO #3 | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 5 | 2026-01-01 | Acme | AI Eng | 3.0/5 | DUPLICADO #3 | N | - | |
`);
  runNormalize();
  const content = readApps();
  assert(content.includes('Discarded'), 'Expected Discarded');
});

test('normalizes cerrada to Discarded', () => {
  writeApps(`# Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 1 | 2026-01-01 | Acme | AI Eng | 3.0/5 | cerrada | N | - | |
`);
  runNormalize();
  const content = readApps();
  assert(content.includes('Discarded'), 'Expected Discarded');
});

test('normalizes rechazada to Rejected', () => {
  writeApps(`# Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 1 | 2026-01-01 | Acme | AI Eng | 3.0/5 | rechazada | N | - | |
`);
  runNormalize();
  const content = readApps();
  assert(content.includes('Rejected'), 'Expected Rejected');
});

test('strips markdown bold from status', () => {
  writeApps(`# Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 1 | 2026-01-01 | Acme | AI Eng | 3.0/5 | **Evaluated** | N | - | |
`);
  runNormalize();
  const content = readApps();
  assert(!content.includes('**Evaluated**'), 'Bold should be stripped');
  assert(content.includes('Evaluated'), 'Expected Evaluated');
});

test('strips date from status field', () => {
  writeApps(`# Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 1 | 2026-01-01 | Acme | AI Eng | 3.0/5 | Applied 2026-01-05 | N | - | |
`);
  runNormalize();
  const content = readApps();
  assert(content.includes('Applied'), 'Expected Applied');
});

test('dry-run does not modify file', () => {
  const original = `# Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 1 | 2026-01-01 | Acme | AI Eng | 3.0/5 | cerrada | N | - | |
`;
  writeApps(original);
  const { output } = runNormalize(true);
  assert(output.includes('dry-run'), 'Expected dry-run message');
  const content = readApps();
  assert(content.includes('cerrada'), 'Original should not be modified');
});

// --- Summary ---
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
