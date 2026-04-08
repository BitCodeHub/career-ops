#!/usr/bin/env node
/**
 * Tests for merge-tracker.mjs
 *
 * Creates temporary tracker and TSV files to test merge logic.
 */

import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const TEST_DIR = join(__dirname, 'tmp-merge');
const SCRIPT = join(PROJECT_ROOT, 'merge-tracker.mjs');

let passed = 0;
let failed = 0;

function setup() {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  mkdirSync(join(TEST_DIR, 'data'), { recursive: true });
  mkdirSync(join(TEST_DIR, 'batch', 'tracker-additions'), { recursive: true });
  mkdirSync(join(TEST_DIR, 'reports'), { recursive: true });
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

function writeTsv(filename, content) {
  writeFileSync(join(TEST_DIR, 'batch', 'tracker-additions', filename), content);
}

function runMerge(dryRun = false) {
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

console.log('\n=== merge-tracker.mjs tests ===\n');

test('no applications.md exits cleanly', () => {
  const { exitCode } = runMerge();
  assert(exitCode === 0, `Expected exit 0, got ${exitCode}`);
});

test('no TSVs exits cleanly', () => {
  writeApps(`# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
`);
  const { exitCode, output } = runMerge();
  assert(exitCode === 0, `Expected exit 0, got ${exitCode}`);
  assert(output.includes('No pending'), 'Expected no pending message');
});

test('adds new entry from TSV', () => {
  writeApps(`# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
`);
  writeTsv('001-acme.tsv', '1\t2026-01-01\tAcme\tAI Engineer\tEvaluated\t4.2/5\tY\t[1](reports/001-acme-2026-01-01.md)\tGreat fit');

  const { output } = runMerge();
  assert(output.includes('Add'), 'Expected add message');

  const apps = readApps();
  assert(apps.includes('Acme'), 'Expected Acme in tracker');
  assert(apps.includes('4.2/5'), 'Expected score in tracker');

  // Check TSV moved to merged/
  const mergedFiles = readdirSync(join(TEST_DIR, 'batch', 'tracker-additions', 'merged'));
  assert(mergedFiles.length === 1, `Expected 1 merged file, got ${mergedFiles.length}`);
});

test('deduplicates by company+role', () => {
  writeApps(`# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 1 | 2026-01-01 | Acme | AI Engineer | 4.2/5 | Evaluated | Y | [1](reports/001-acme-2026-01-01.md) | |
`);
  // Same company+role but lower score
  writeTsv('002-acme.tsv', '2\t2026-01-05\tAcme\tAI Engineer\tEvaluated\t3.8/5\tY\t[2](reports/002-acme-2026-01-05.md)\tRe-eval');

  const { output } = runMerge();
  assert(output.includes('Skip'), 'Expected skip message');
});

test('updates entry when new score is higher', () => {
  writeApps(`# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 1 | 2026-01-01 | Acme | AI Engineer | 3.5/5 | Evaluated | Y | [1](reports/001-acme-2026-01-01.md) | |
`);
  // Same company+role but higher score
  writeTsv('002-acme.tsv', '2\t2026-01-05\tAcme\tAI Engineer\tEvaluated\t4.5/5\tY\t[2](reports/002-acme-2026-01-05.md)\tBetter eval');

  const { output } = runMerge();
  assert(output.includes('Update'), 'Expected update message');

  const apps = readApps();
  assert(apps.includes('4.5/5'), 'Expected updated score');
});

test('dry-run does not modify files', () => {
  writeApps(`# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
`);
  writeTsv('001-acme.tsv', '1\t2026-01-01\tAcme\tAI Engineer\tEvaluated\t4.2/5\tY\t[1](reports/001-acme-2026-01-01.md)\tGreat fit');

  const { output } = runMerge(true);
  assert(output.includes('dry-run'), 'Expected dry-run message');

  // TSV should still be in tracker-additions (not moved)
  const additions = readdirSync(join(TEST_DIR, 'batch', 'tracker-additions')).filter(f => f.endsWith('.tsv'));
  assert(additions.length === 1, `Expected TSV still present, got ${additions.length}`);
});

// --- Summary ---
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
