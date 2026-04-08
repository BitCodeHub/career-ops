#!/usr/bin/env node
/**
 * Test runner — executes all test files in test/ directory
 *
 * Run: node test/run-tests.mjs
 */

import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const testFiles = readdirSync(__dirname)
  .filter(f => f.startsWith('test-') && f.endsWith('.mjs'))
  .sort();

let totalPassed = 0;
let totalFailed = 0;

console.log('=== career-ops test suite ===\n');
console.log(`Found ${testFiles.length} test files\n`);

for (const file of testFiles) {
  const path = join(__dirname, file);
  try {
    const output = execSync(`node ${path}`, {
      encoding: 'utf-8',
      timeout: 30000,
      cwd: join(__dirname, '..'),
    });
    console.log(output);

    // Count passes/failures from output
    const resultsMatch = output.match(/(\d+) passed, (\d+) failed/);
    if (resultsMatch) {
      totalPassed += parseInt(resultsMatch[1]);
      totalFailed += parseInt(resultsMatch[2]);
    }
  } catch (e) {
    console.log(e.stdout || '');
    console.log(`\n  ERROR: ${file} exited with code ${e.status}\n`);

    const resultsMatch = (e.stdout || '').match(/(\d+) passed, (\d+) failed/);
    if (resultsMatch) {
      totalPassed += parseInt(resultsMatch[1]);
      totalFailed += parseInt(resultsMatch[2]);
    } else {
      totalFailed++;
    }
  }
}

console.log('='.repeat(50));
console.log(`\nTotal: ${totalPassed} passed, ${totalFailed} failed\n`);

process.exit(totalFailed > 0 ? 1 : 0);
