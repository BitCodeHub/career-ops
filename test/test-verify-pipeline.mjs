#!/usr/bin/env node
/**
 * Tests for verify-pipeline.mjs
 *
 * Creates temporary applications.md files with various conditions
 * and verifies the pipeline checker catches them correctly.
 */

import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const TEST_DIR = join(__dirname, 'tmp-verify');
const SCRIPT = join(PROJECT_ROOT, 'verify-pipeline.mjs');

let passed = 0;
let failed = 0;

function setup() {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
  mkdirSync(TEST_DIR, { recursive: true });
  mkdirSync(join(TEST_DIR, 'data'), { recursive: true });
  mkdirSync(join(TEST_DIR, 'reports'), { recursive: true });
  mkdirSync(join(TEST_DIR, 'batch', 'tracker-additions'), { recursive: true });
  mkdirSync(join(TEST_DIR, 'templates'), { recursive: true });
}

function cleanup() {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
}

function writeApps(content) {
  writeFileSync(join(TEST_DIR, 'data', 'applications.md'), content);
}

function writeReport(filename, content = '# Report\n**URL:** https://example.com\n') {
  writeFileSync(join(TEST_DIR, 'reports', filename), content);
}

function runVerify() {
  try {
    const output = execSync(`node ${SCRIPT} --cwd=${TEST_DIR}`, {
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

console.log('\n=== verify-pipeline.mjs tests ===\n');

test('no applications.md exits cleanly', () => {
  const { exitCode } = runVerify();
  assert(exitCode === 0, `Expected exit 0, got ${exitCode}`);
});

test('empty tracker passes', () => {
  writeApps(`# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
`);
  const { exitCode, output } = runVerify();
  assert(exitCode === 0, `Expected exit 0, got ${exitCode}`);
  assert(output.includes('0 errors'), 'Expected 0 errors');
});

test('valid English statuses pass', () => {
  writeReport('001-acme-2026-01-01.md');
  writeApps(`# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 1 | 2026-01-01 | Acme | AI Eng | 4.2/5 | Evaluated | Y | [1](reports/001-acme-2026-01-01.md) | Good fit |
`);
  const { exitCode, output } = runVerify();
  assert(exitCode === 0, `Expected exit 0, got ${exitCode}`);
});

test('valid Spanish legacy statuses pass', () => {
  writeReport('001-acme-2026-01-01.md');
  writeApps(`# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 1 | 2026-01-01 | Acme | AI Eng | 4.2/5 | Evaluada | Y | [1](reports/001-acme-2026-01-01.md) | Good fit |
`);
  const { exitCode, output } = runVerify();
  assert(exitCode === 0, `Expected exit 0, got ${exitCode}`);
});

test('detects non-canonical status', () => {
  writeReport('001-acme-2026-01-01.md');
  writeApps(`# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 1 | 2026-01-01 | Acme | AI Eng | 4.2/5 | InProgress | Y | [1](reports/001-acme-2026-01-01.md) | |
`);
  const { exitCode, output } = runVerify();
  assert(exitCode === 1, `Expected exit 1, got ${exitCode}`);
  assert(output.includes('Non-canonical'), 'Expected non-canonical error');
});

test('detects markdown bold in status', () => {
  writeReport('001-acme-2026-01-01.md');
  writeApps(`# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 1 | 2026-01-01 | Acme | AI Eng | 4.2/5 | **Evaluated** | Y | [1](reports/001-acme-2026-01-01.md) | |
`);
  const { exitCode, output } = runVerify();
  assert(exitCode === 1, `Expected exit 1, got ${exitCode}`);
  assert(output.includes('bold'), 'Expected bold error');
});

test('detects invalid score format', () => {
  writeReport('001-acme-2026-01-01.md');
  writeApps(`# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 1 | 2026-01-01 | Acme | AI Eng | 4.2 | Evaluated | Y | [1](reports/001-acme-2026-01-01.md) | |
`);
  const { exitCode, output } = runVerify();
  assert(exitCode === 1, `Expected exit 1, got ${exitCode}`);
  assert(output.includes('score'), 'Expected score error');
});

test('detects broken report link', () => {
  // Don't create the report file
  writeApps(`# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 1 | 2026-01-01 | Acme | AI Eng | 4.2/5 | Evaluated | Y | [1](reports/001-acme-2026-01-01.md) | |
`);
  const { exitCode, output } = runVerify();
  assert(exitCode === 1, `Expected exit 1, got ${exitCode}`);
  assert(output.includes('Report not found'), 'Expected broken report error');
});

test('detects duplicate company+role', () => {
  writeReport('001-acme-2026-01-01.md');
  writeReport('002-acme-2026-01-02.md');
  writeApps(`# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 1 | 2026-01-01 | Acme | AI Engineer | 4.2/5 | Evaluated | Y | [1](reports/001-acme-2026-01-01.md) | |
| 2 | 2026-01-02 | Acme | AI Engineer | 3.8/5 | Evaluated | Y | [2](reports/002-acme-2026-01-02.md) | |
`);
  const { output } = runVerify();
  assert(output.includes('duplicates') || output.includes('Possible'), 'Expected duplicate warning');
});

test('accepts N/A and DUP scores', () => {
  writeApps(`# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
| 1 | 2026-01-01 | Acme | AI Eng | N/A | Evaluated | Y | - | |
| 2 | 2026-01-02 | Beta | PM | DUP | Discarded | N | - | |
`);
  const { exitCode, output } = runVerify();
  assert(exitCode === 0, `Expected exit 0, got ${exitCode}`);
});

// --- Summary ---
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
