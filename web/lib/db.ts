/**
 * Career-Ops SQLite Database Layer
 *
 * Uses better-sqlite3 for synchronous, high-performance SQLite access.
 * All tables are created lazily on first access via `initDb()`.
 *
 * Database location: controlled by DATABASE_PATH env var
 * (default: ./data/career-ops.db relative to project root).
 */

import Database from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import type {
  Profile,
  Resume,
  Application,
  Report,
  PipelineUrl,
  ScanHistory,
  Story,
  ApplicationStatus,
} from "./types";

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _db: Database.Database | null = null;

/**
 * Returns the singleton database instance, creating it (and running
 * migrations) on first call.
 */
export function getDb(): Database.Database {
  if (_db) return _db;

  const dbPath = process.env.DATABASE_PATH
    ? path.resolve(process.env.DATABASE_PATH)
    : path.resolve(process.cwd(), "data", "career-ops.db");

  // Ensure parent directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(dbPath);

  // Enable WAL mode for better concurrent read performance
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  initDb(_db);
  return _db;
}

// ---------------------------------------------------------------------------
// Schema creation
// ---------------------------------------------------------------------------

/**
 * Creates all tables if they do not already exist.
 * Called automatically by `getDb()` on first access.
 */
export function initDb(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id                  TEXT PRIMARY KEY,
      full_name           TEXT NOT NULL,
      email               TEXT NOT NULL,
      phone               TEXT,
      location            TEXT,
      linkedin            TEXT,
      portfolio_url       TEXT,
      github              TEXT,
      headline            TEXT,
      exit_story          TEXT,
      target_roles        TEXT NOT NULL DEFAULT '[]',
      superpowers         TEXT NOT NULL DEFAULT '[]',
      compensation_target TEXT,
      compensation_min    TEXT,
      timezone            TEXT,
      created_at          TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id          TEXT PRIMARY KEY,
      profile_id  TEXT NOT NULL,
      content     TEXT NOT NULL,
      filename    TEXT,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS applications (
      id          TEXT PRIMARY KEY,
      num         INTEGER NOT NULL UNIQUE,
      date        TEXT NOT NULL,
      company     TEXT NOT NULL,
      role        TEXT NOT NULL,
      score       REAL,
      status      TEXT NOT NULL DEFAULT 'Evaluated',
      has_pdf     INTEGER NOT NULL DEFAULT 0,
      report_id   TEXT,
      notes       TEXT,
      url         TEXT,
      archetype   TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reports (
      id             TEXT PRIMARY KEY,
      application_id TEXT,
      num            INTEGER NOT NULL,
      company        TEXT NOT NULL,
      role           TEXT NOT NULL,
      date           TEXT NOT NULL,
      archetype      TEXT,
      score          REAL,
      url            TEXT,
      content        TEXT NOT NULL,
      summary        TEXT,
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS pipeline_urls (
      id           TEXT PRIMARY KEY,
      url          TEXT NOT NULL,
      company      TEXT,
      title        TEXT,
      status       TEXT NOT NULL DEFAULT 'pending',
      source       TEXT,
      added_at     TEXT NOT NULL DEFAULT (datetime('now')),
      processed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS scan_history (
      id         TEXT PRIMARY KEY,
      url        TEXT NOT NULL,
      first_seen TEXT NOT NULL,
      portal     TEXT,
      title      TEXT,
      company    TEXT,
      status     TEXT
    );

    CREATE TABLE IF NOT EXISTS stories (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      source     TEXT,
      theme      TEXT,
      situation  TEXT,
      task       TEXT,
      action     TEXT,
      result     TEXT,
      reflection TEXT,
      best_for   TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_applications_company_role
      ON applications(company, role);
    CREATE INDEX IF NOT EXISTS idx_applications_status
      ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_applications_num
      ON applications(num);
    CREATE INDEX IF NOT EXISTS idx_reports_application_id
      ON reports(application_id);
    CREATE INDEX IF NOT EXISTS idx_pipeline_urls_status
      ON pipeline_urls(status);
    CREATE INDEX IF NOT EXISTS idx_pipeline_urls_url
      ON pipeline_urls(url);
    CREATE INDEX IF NOT EXISTS idx_scan_history_url
      ON scan_history(url);
    CREATE INDEX IF NOT EXISTS idx_resumes_profile_id
      ON resumes(profile_id);
  `);
}

// ---------------------------------------------------------------------------
// Helpers — generate IDs and timestamps
// ---------------------------------------------------------------------------

function newId(): string {
  return uuidv4();
}

function now(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

// ---------------------------------------------------------------------------
// CRUD — Profiles
// ---------------------------------------------------------------------------

export function createProfile(
  data: Omit<Profile, "id" | "created_at" | "updated_at">
): Profile {
  const db = getDb();
  const id = newId();
  const ts = now();

  db.prepare(`
    INSERT INTO profiles (
      id, full_name, email, phone, location, linkedin, portfolio_url,
      github, headline, exit_story, target_roles, superpowers,
      compensation_target, compensation_min, timezone, created_at, updated_at
    ) VALUES (
      @id, @full_name, @email, @phone, @location, @linkedin, @portfolio_url,
      @github, @headline, @exit_story, @target_roles, @superpowers,
      @compensation_target, @compensation_min, @timezone, @created_at, @updated_at
    )
  `).run({ ...data, id, created_at: ts, updated_at: ts });

  return getProfileById(id)!;
}

export function getProfileById(id: string): Profile | null {
  const db = getDb();
  return (db.prepare("SELECT * FROM profiles WHERE id = ?").get(id) as Profile) ?? null;
}

export function getDefaultProfile(): Profile | null {
  const db = getDb();
  return (
    (db
      .prepare("SELECT * FROM profiles ORDER BY created_at ASC LIMIT 1")
      .get() as Profile) ?? null
  );
}

export function listProfiles(): Profile[] {
  const db = getDb();
  return db.prepare("SELECT * FROM profiles ORDER BY created_at ASC").all() as Profile[];
}

export function updateProfile(
  id: string,
  data: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>
): Profile | null {
  const db = getDb();
  const existing = getProfileById(id);
  if (!existing) return null;

  const fields = Object.keys(data) as (keyof typeof data)[];
  if (fields.length === 0) return existing;

  const sets = fields.map((f) => `${f} = @${f}`).join(", ");
  db.prepare(`UPDATE profiles SET ${sets}, updated_at = @updated_at WHERE id = @id`).run({
    ...data,
    id,
    updated_at: now(),
  });

  return getProfileById(id);
}

export function deleteProfile(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM profiles WHERE id = ?").run(id);
  return result.changes > 0;
}

// ---------------------------------------------------------------------------
// CRUD — Resumes
// ---------------------------------------------------------------------------

export function createResume(
  data: Omit<Resume, "id" | "uploaded_at">
): Resume {
  const db = getDb();
  const id = newId();
  const ts = now();

  db.prepare(`
    INSERT INTO resumes (id, profile_id, content, filename, uploaded_at)
    VALUES (@id, @profile_id, @content, @filename, @uploaded_at)
  `).run({ ...data, id, uploaded_at: ts });

  return getResumeById(id)!;
}

export function getResumeById(id: string): Resume | null {
  const db = getDb();
  return (db.prepare("SELECT * FROM resumes WHERE id = ?").get(id) as Resume) ?? null;
}

export function getResumesByProfile(profileId: string): Resume[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM resumes WHERE profile_id = ? ORDER BY uploaded_at DESC")
    .all(profileId) as Resume[];
}

export function getLatestResume(profileId: string): Resume | null {
  const db = getDb();
  return (
    (db
      .prepare(
        "SELECT * FROM resumes WHERE profile_id = ? ORDER BY uploaded_at DESC LIMIT 1"
      )
      .get(profileId) as Resume) ?? null
  );
}

export function updateResume(
  id: string,
  data: Partial<Omit<Resume, "id" | "uploaded_at">>
): Resume | null {
  const db = getDb();
  const existing = getResumeById(id);
  if (!existing) return null;

  const fields = Object.keys(data) as (keyof typeof data)[];
  if (fields.length === 0) return existing;

  const sets = fields.map((f) => `${f} = @${f}`).join(", ");
  db.prepare(`UPDATE resumes SET ${sets} WHERE id = @id`).run({ ...data, id });

  return getResumeById(id);
}

export function deleteResume(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM resumes WHERE id = ?").run(id);
  return result.changes > 0;
}

// ---------------------------------------------------------------------------
// CRUD — Applications
// ---------------------------------------------------------------------------

export function getNextApplicationNum(): number {
  const db = getDb();
  const row = db.prepare("SELECT MAX(num) as max_num FROM applications").get() as {
    max_num: number | null;
  };
  return (row.max_num ?? 0) + 1;
}

export function createApplication(
  data: Omit<Application, "id" | "num" | "created_at" | "updated_at"> & { num?: number }
): Application {
  const db = getDb();
  const id = newId();
  const ts = now();
  const num = data.num ?? getNextApplicationNum();

  db.prepare(`
    INSERT INTO applications (
      id, num, date, company, role, score, status, has_pdf,
      report_id, notes, url, archetype, created_at, updated_at
    ) VALUES (
      @id, @num, @date, @company, @role, @score, @status, @has_pdf,
      @report_id, @notes, @url, @archetype, @created_at, @updated_at
    )
  `).run({
    ...data,
    id,
    num,
    created_at: ts,
    updated_at: ts,
  });

  return getApplicationById(id)!;
}

export function getApplicationById(id: string): Application | null {
  const db = getDb();
  return (
    (db.prepare("SELECT * FROM applications WHERE id = ?").get(id) as Application) ?? null
  );
}

export function getApplicationByNum(num: number): Application | null {
  const db = getDb();
  return (
    (db.prepare("SELECT * FROM applications WHERE num = ?").get(num) as Application) ??
    null
  );
}

export function findApplication(company: string, role: string): Application | null {
  const db = getDb();
  return (
    (db
      .prepare(
        "SELECT * FROM applications WHERE LOWER(company) = LOWER(?) AND LOWER(role) = LOWER(?)"
      )
      .get(company, role) as Application) ?? null
  );
}

export function listApplications(options?: {
  status?: ApplicationStatus | string;
  minScore?: number;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDir?: "ASC" | "DESC";
}): Application[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (options?.status) {
    conditions.push("status = @status");
    params.status = options.status;
  }
  if (options?.minScore !== undefined) {
    conditions.push("score >= @minScore");
    params.minScore = options.minScore;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy = options?.orderBy ?? "num";
  const orderDir = options?.orderDir ?? "DESC";
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;

  return db
    .prepare(
      `SELECT * FROM applications ${where} ORDER BY ${orderBy} ${orderDir} LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit, offset }) as Application[];
}

export function countApplications(options?: {
  status?: ApplicationStatus | string;
  minScore?: number;
}): number {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (options?.status) {
    conditions.push("status = @status");
    params.status = options.status;
  }
  if (options?.minScore !== undefined) {
    conditions.push("score >= @minScore");
    params.minScore = options.minScore;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const row = db
    .prepare(`SELECT COUNT(*) as count FROM applications ${where}`)
    .get(params) as { count: number };
  return row.count;
}

export function updateApplication(
  id: string,
  data: Partial<
    Omit<Application, "id" | "num" | "created_at" | "updated_at">
  >
): Application | null {
  const db = getDb();
  const existing = getApplicationById(id);
  if (!existing) return null;

  const fields = Object.keys(data) as (keyof typeof data)[];
  if (fields.length === 0) return existing;

  const sets = fields.map((f) => `${f} = @${f}`).join(", ");
  db.prepare(`UPDATE applications SET ${sets}, updated_at = @updated_at WHERE id = @id`).run(
    {
      ...data,
      id,
      updated_at: now(),
    }
  );

  return getApplicationById(id);
}

export function deleteApplication(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM applications WHERE id = ?").run(id);
  return result.changes > 0;
}

// ---------------------------------------------------------------------------
// CRUD — Reports
// ---------------------------------------------------------------------------

export function getNextReportNum(): number {
  const db = getDb();
  const row = db.prepare("SELECT MAX(num) as max_num FROM reports").get() as {
    max_num: number | null;
  };
  return (row.max_num ?? 0) + 1;
}

export function createReport(
  data: Omit<Report, "id" | "created_at"> & { id?: string }
): Report {
  const db = getDb();
  const id = data.id ?? newId();
  const ts = now();

  db.prepare(`
    INSERT INTO reports (
      id, application_id, num, company, role, date,
      archetype, score, url, content, summary, created_at
    ) VALUES (
      @id, @application_id, @num, @company, @role, @date,
      @archetype, @score, @url, @content, @summary, @created_at
    )
  `).run({ ...data, id, created_at: ts });

  return getReportById(id)!;
}

export function getReportById(id: string): Report | null {
  const db = getDb();
  return (db.prepare("SELECT * FROM reports WHERE id = ?").get(id) as Report) ?? null;
}

export function getReportByApplicationId(applicationId: string): Report | null {
  const db = getDb();
  return (
    (db
      .prepare("SELECT * FROM reports WHERE application_id = ?")
      .get(applicationId) as Report) ?? null
  );
}

export function getReportByNum(num: number): Report | null {
  const db = getDb();
  return (
    (db.prepare("SELECT * FROM reports WHERE num = ?").get(num) as Report) ?? null
  );
}

export function listReports(options?: {
  limit?: number;
  offset?: number;
  minScore?: number;
}): Report[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (options?.minScore !== undefined) {
    conditions.push("score >= @minScore");
    params.minScore = options.minScore;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;

  return db
    .prepare(
      `SELECT * FROM reports ${where} ORDER BY num DESC LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit, offset }) as Report[];
}

export function updateReport(
  id: string,
  data: Partial<Omit<Report, "id" | "created_at">>
): Report | null {
  const db = getDb();
  const existing = getReportById(id);
  if (!existing) return null;

  const fields = Object.keys(data) as (keyof typeof data)[];
  if (fields.length === 0) return existing;

  const sets = fields.map((f) => `${f} = @${f}`).join(", ");
  db.prepare(`UPDATE reports SET ${sets} WHERE id = @id`).run({ ...data, id });

  return getReportById(id);
}

export function deleteReport(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM reports WHERE id = ?").run(id);
  return result.changes > 0;
}

// ---------------------------------------------------------------------------
// CRUD — Pipeline URLs
// ---------------------------------------------------------------------------

export function createPipelineUrl(
  data: Omit<PipelineUrl, "id" | "added_at" | "processed_at">
): PipelineUrl {
  const db = getDb();
  const id = newId();
  const ts = now();

  db.prepare(`
    INSERT INTO pipeline_urls (id, url, company, title, status, source, added_at)
    VALUES (@id, @url, @company, @title, @status, @source, @added_at)
  `).run({ ...data, id, added_at: ts });

  return getPipelineUrlById(id)!;
}

export function getPipelineUrlById(id: string): PipelineUrl | null {
  const db = getDb();
  return (
    (db.prepare("SELECT * FROM pipeline_urls WHERE id = ?").get(id) as PipelineUrl) ??
    null
  );
}

export function findPipelineUrlByUrl(url: string): PipelineUrl | null {
  const db = getDb();
  return (
    (db
      .prepare("SELECT * FROM pipeline_urls WHERE url = ?")
      .get(url) as PipelineUrl) ?? null
  );
}

export function listPipelineUrls(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): PipelineUrl[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (options?.status) {
    conditions.push("status = @status");
    params.status = options.status;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;

  return db
    .prepare(
      `SELECT * FROM pipeline_urls ${where} ORDER BY added_at DESC LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit, offset }) as PipelineUrl[];
}

export function countPipelineUrls(status?: string): number {
  const db = getDb();
  if (status) {
    const row = db
      .prepare("SELECT COUNT(*) as count FROM pipeline_urls WHERE status = ?")
      .get(status) as { count: number };
    return row.count;
  }
  const row = db
    .prepare("SELECT COUNT(*) as count FROM pipeline_urls")
    .get() as { count: number };
  return row.count;
}

export function updatePipelineUrl(
  id: string,
  data: Partial<Omit<PipelineUrl, "id" | "added_at">>
): PipelineUrl | null {
  const db = getDb();
  const existing = getPipelineUrlById(id);
  if (!existing) return null;

  const fields = Object.keys(data) as (keyof typeof data)[];
  if (fields.length === 0) return existing;

  const sets = fields.map((f) => `${f} = @${f}`).join(", ");
  db.prepare(`UPDATE pipeline_urls SET ${sets} WHERE id = @id`).run({ ...data, id });

  return getPipelineUrlById(id);
}

export function markPipelineUrlProcessed(
  id: string,
  status: "processed" | "error" | "skipped" = "processed"
): PipelineUrl | null {
  return updatePipelineUrl(id, { status, processed_at: now() });
}

export function deletePipelineUrl(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM pipeline_urls WHERE id = ?").run(id);
  return result.changes > 0;
}

// ---------------------------------------------------------------------------
// CRUD — Scan History
// ---------------------------------------------------------------------------

export function createScanHistory(
  data: Omit<ScanHistory, "id">
): ScanHistory {
  const db = getDb();
  const id = newId();

  db.prepare(`
    INSERT INTO scan_history (id, url, first_seen, portal, title, company, status)
    VALUES (@id, @url, @first_seen, @portal, @title, @company, @status)
  `).run({ ...data, id });

  return getScanHistoryById(id)!;
}

export function getScanHistoryById(id: string): ScanHistory | null {
  const db = getDb();
  return (
    (db.prepare("SELECT * FROM scan_history WHERE id = ?").get(id) as ScanHistory) ??
    null
  );
}

export function findScanHistoryByUrl(url: string): ScanHistory | null {
  const db = getDb();
  return (
    (db
      .prepare("SELECT * FROM scan_history WHERE url = ?")
      .get(url) as ScanHistory) ?? null
  );
}

export function listScanHistory(options?: {
  portal?: string;
  limit?: number;
  offset?: number;
}): ScanHistory[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (options?.portal) {
    conditions.push("portal = @portal");
    params.portal = options.portal;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;

  return db
    .prepare(
      `SELECT * FROM scan_history ${where} ORDER BY first_seen DESC LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit, offset }) as ScanHistory[];
}

export function updateScanHistory(
  id: string,
  data: Partial<Omit<ScanHistory, "id">>
): ScanHistory | null {
  const db = getDb();
  const existing = getScanHistoryById(id);
  if (!existing) return null;

  const fields = Object.keys(data) as (keyof typeof data)[];
  if (fields.length === 0) return existing;

  const sets = fields.map((f) => `${f} = @${f}`).join(", ");
  db.prepare(`UPDATE scan_history SET ${sets} WHERE id = @id`).run({ ...data, id });

  return getScanHistoryById(id);
}

export function deleteScanHistory(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM scan_history WHERE id = ?").run(id);
  return result.changes > 0;
}

// ---------------------------------------------------------------------------
// CRUD — Stories (STAR+R interview bank)
// ---------------------------------------------------------------------------

export function createStory(
  data: Omit<Story, "id" | "created_at">
): Story {
  const db = getDb();
  const id = newId();
  const ts = now();

  db.prepare(`
    INSERT INTO stories (
      id, title, source, theme, situation, task, action,
      result, reflection, best_for, created_at
    ) VALUES (
      @id, @title, @source, @theme, @situation, @task, @action,
      @result, @reflection, @best_for, @created_at
    )
  `).run({ ...data, id, created_at: ts });

  return getStoryById(id)!;
}

export function getStoryById(id: string): Story | null {
  const db = getDb();
  return (db.prepare("SELECT * FROM stories WHERE id = ?").get(id) as Story) ?? null;
}

export function listStories(options?: {
  theme?: string;
  limit?: number;
  offset?: number;
}): Story[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (options?.theme) {
    conditions.push("theme = @theme");
    params.theme = options.theme;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;

  return db
    .prepare(
      `SELECT * FROM stories ${where} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit, offset }) as Story[];
}

export function searchStories(query: string): Story[] {
  const db = getDb();
  const pattern = `%${query}%`;
  return db
    .prepare(
      `SELECT * FROM stories
       WHERE title LIKE @pattern
          OR theme LIKE @pattern
          OR situation LIKE @pattern
          OR action LIKE @pattern
          OR best_for LIKE @pattern
       ORDER BY created_at DESC
       LIMIT 20`
    )
    .all({ pattern }) as Story[];
}

export function updateStory(
  id: string,
  data: Partial<Omit<Story, "id" | "created_at">>
): Story | null {
  const db = getDb();
  const existing = getStoryById(id);
  if (!existing) return null;

  const fields = Object.keys(data) as (keyof typeof data)[];
  if (fields.length === 0) return existing;

  const sets = fields.map((f) => `${f} = @${f}`).join(", ");
  db.prepare(`UPDATE stories SET ${sets} WHERE id = @id`).run({ ...data, id });

  return getStoryById(id);
}

export function deleteStory(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM stories WHERE id = ?").run(id);
  return result.changes > 0;
}

// ---------------------------------------------------------------------------
// Utility — Dashboard stats
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalApplications: number;
  byStatus: Record<string, number>;
  averageScore: number | null;
  pendingPipeline: number;
  totalStories: number;
}

export function getDashboardStats(): DashboardStats {
  const db = getDb();

  const total = (
    db.prepare("SELECT COUNT(*) as count FROM applications").get() as { count: number }
  ).count;

  const statusRows = db
    .prepare("SELECT status, COUNT(*) as count FROM applications GROUP BY status")
    .all() as { status: string; count: number }[];
  const byStatus: Record<string, number> = {};
  for (const row of statusRows) {
    byStatus[row.status] = row.count;
  }

  const avgRow = db
    .prepare("SELECT AVG(score) as avg FROM applications WHERE score IS NOT NULL")
    .get() as { avg: number | null };
  const averageScore = avgRow.avg ? Math.round(avgRow.avg * 100) / 100 : null;

  const pendingPipeline = countPipelineUrls("pending");

  const totalStories = (
    db.prepare("SELECT COUNT(*) as count FROM stories").get() as { count: number }
  ).count;

  return { totalApplications: total, byStatus, averageScore, pendingPipeline, totalStories };
}

// ---------------------------------------------------------------------------
// Utility — Close database (for graceful shutdown)
// ---------------------------------------------------------------------------

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}
