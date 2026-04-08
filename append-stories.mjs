#!/usr/bin/env node
/**
 * append-stories.mjs — Extract STAR+R stories from evaluation reports
 * and append them to interview-prep/story-bank.md
 *
 * Reads all reports in reports/ directory, finds Block F (Interview Plan)
 * sections, extracts STAR+R stories, and appends new ones to the story bank.
 *
 * Run: node append-stories.mjs [--dry-run] [--report=NNN]
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = join(__dirname, 'reports');
const STORY_BANK = join(__dirname, 'interview-prep', 'story-bank.md');
const DRY_RUN = process.argv.includes('--dry-run');

// Parse --report=NNN flag
const reportFlag = process.argv.find(a => a.startsWith('--report='));
const targetReport = reportFlag ? reportFlag.split('=')[1] : null;

/**
 * Extract metadata from report filename: {NNN}-{company-slug}-{date}.md
 */
function parseReportFilename(filename) {
  const match = filename.match(/^(\d+)-(.+)-(\d{4}-\d{2}-\d{2})\.md$/);
  if (!match) return null;
  return {
    num: match[1],
    companySlug: match[2],
    date: match[3],
    company: match[2].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  };
}

/**
 * Extract role title from report header.
 * Looks for patterns like "## Role: Senior AI Engineer" or "**Role:** ..."
 */
function extractRole(content) {
  const patterns = [
    /\*\*(?:Role|Rol|Position|Puesto)[:\s]*\*\*\s*(.+)/i,
    /^##?\s*(?:Role|Rol|Position):\s*(.+)/mi,
    /\|\s*(?:Role|Rol)\s*\|\s*(.+?)\s*\|/i,
  ];
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) return match[1].trim();
  }
  return 'Unknown Role';
}

/**
 * Extract STAR+R stories from Block F of a report.
 * Looks for structured story blocks with S/T/A/R patterns.
 */
function extractStories(content, meta) {
  const stories = [];

  // Find Block F section
  const blockFPatterns = [
    /## F\).+?(?=## [A-Z]\)|$)/s,
    /## (?:Interview Plan|Plan de Entrevista|Block F).+?(?=## [A-Z]|$)/si,
  ];

  let blockF = null;
  for (const pattern of blockFPatterns) {
    const match = content.match(pattern);
    if (match) { blockF = match[0]; break; }
  }

  if (!blockF) return stories;

  // Extract individual stories — look for ### headers within Block F
  const storyBlocks = blockF.split(/(?=### )/);

  for (const block of storyBlocks) {
    if (!block.startsWith('###')) continue;

    const titleMatch = block.match(/^### (.+)/);
    if (!titleMatch) continue;
    const title = titleMatch[1].trim();

    // Check if this block has STAR content
    const hasS = /\*\*S(?:ituation|ituaci[oó]n)?[:\s]*\*\*/i.test(block);
    const hasA = /\*\*A(?:ction|cci[oó]n)?[:\s]*\*\*/i.test(block);
    const hasR = /\*\*R(?:esult|esultado)?[:\s]*\*\*/i.test(block);

    if (hasS || (hasA && hasR)) {
      // Extract the theme/question type if present
      const questionMatch = block.match(/\*\*(?:Best for|Para preguntas|Questions?)[:\s]*\*\*\s*(.+)/i);
      const questions = questionMatch ? questionMatch[1].trim() : '';

      stories.push({
        title,
        content: block.trim(),
        source: `Report #${meta.num} -- ${meta.company}`,
        questions,
      });
    }
  }

  return stories;
}

/**
 * Read existing story bank to check for duplicates.
 */
function getExistingStoryTitles() {
  if (!existsSync(STORY_BANK)) return new Set();
  const content = readFileSync(STORY_BANK, 'utf-8');
  const titles = new Set();
  const matches = content.matchAll(/^### .+$/gm);
  for (const match of matches) {
    titles.add(match[0].replace(/^### /, '').trim().toLowerCase());
  }
  return titles;
}

// --- Main ---

if (!existsSync(REPORTS_DIR)) {
  console.log('No reports/ directory found. Evaluate some offers first.');
  process.exit(0);
}

const reportFiles = readdirSync(REPORTS_DIR)
  .filter(f => f.endsWith('.md') && f !== '.gitkeep')
  .sort();

if (reportFiles.length === 0) {
  console.log('No reports found in reports/. Evaluate some offers first.');
  process.exit(0);
}

const existingTitles = getExistingStoryTitles();
let totalNew = 0;
const newStories = [];

for (const file of reportFiles) {
  const meta = parseReportFilename(file);
  if (!meta) continue;

  // If --report flag, only process that report
  if (targetReport && meta.num !== targetReport) continue;

  const content = readFileSync(join(REPORTS_DIR, file), 'utf-8');
  const role = extractRole(content);
  const stories = extractStories(content, { ...meta, role });

  for (const story of stories) {
    // Dedup by title
    if (existingTitles.has(story.title.toLowerCase())) {
      console.log(`  Skip (exists): ${story.title}`);
      continue;
    }

    existingTitles.add(story.title.toLowerCase());
    newStories.push(story);
    totalNew++;
    console.log(`  + ${story.title} (from ${story.source})`);
  }
}

if (totalNew === 0) {
  console.log('\nNo new stories to add.');
  process.exit(0);
}

// Append to story bank
const appendContent = newStories.map(s => {
  let entry = `\n${s.content}`;
  // Ensure source line exists
  if (!entry.includes('**Source:**')) {
    entry = entry.replace(/^(### .+)$/m, `$1\n**Source:** ${s.source}`);
  }
  return entry;
}).join('\n');

if (!DRY_RUN) {
  let bankContent = existsSync(STORY_BANK)
    ? readFileSync(STORY_BANK, 'utf-8')
    : '# Story Bank -- Master STAR+R Stories\n\n## Stories\n';

  // Remove the placeholder comment if present
  bankContent = bankContent.replace(
    /<!-- Stories will be added here as you evaluate offers -->\n?/,
    ''
  );

  writeFileSync(STORY_BANK, bankContent.trimEnd() + '\n' + appendContent + '\n');
  console.log(`\nAppended ${totalNew} new stories to ${STORY_BANK}`);
} else {
  console.log(`\n(dry-run) Would append ${totalNew} new stories`);
}
