import { Pool, type QueryResultRow } from "pg";

const DEFAULT_CONNECTION = {
  host: process.env.PGHOST ?? "127.0.0.1",
  port: Number(process.env.PGPORT ?? "54322"),
  database: process.env.PGDATABASE ?? "postgres",
  user: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD ?? "postgres",
};

export const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : DEFAULT_CONNECTION,
);

export type SqlExecutionResult = {
  rowCount: number | null;
  rows: QueryResultRow[];
  fields: string[];
};

const READ_ONLY_START = /^\s*(select|with|show|values|explain|describe)\b/i;
const FORBIDDEN_KEYWORDS =
  /\b(insert|update|delete|merge|upsert|alter|create|drop|truncate|grant|revoke|comment|vacuum|reindex|analyze|refresh|call|do|copy|begin|commit|rollback|savepoint|release)\b/i;

function stripSqlComments(sql: string): string {
  const withoutBlockComments = sql.replace(/\/\*[\s\S]*?\*\//g, " ");
  return withoutBlockComments.replace(/--.*$/gm, " ").trim();
}

export function assertReadOnlySql(sql: string): void {
  const cleaned = stripSqlComments(sql);
  if (!cleaned) {
    throw new Error("SQL query is empty.");
  }

  if (!READ_ONLY_START.test(cleaned)) {
    throw new Error(
      "Only read-only SQL is allowed. Start with SELECT, WITH, SHOW, VALUES, EXPLAIN, or DESCRIBE.",
    );
  }

  if (FORBIDDEN_KEYWORDS.test(cleaned)) {
    throw new Error(
      "Detected write-oriented SQL keyword. Use execute_sql_with_rollback for write/test statements.",
    );
  }
}

export async function runReadOnlySql(
  sql: string,
  maxRows: number,
): Promise<SqlExecutionResult> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN READ ONLY");
    await client.query("SET LOCAL statement_timeout = '15s'");

    const result = await client.query(sql);
    await client.query("ROLLBACK");

    return {
      rowCount: result.rowCount,
      rows: result.rows.slice(0, maxRows),
      fields: result.fields.map((field) => field.name),
    };
  } finally {
    client.release();
  }
}

export async function runSqlWithRollback(
  sql: string,
  maxRows: number,
): Promise<SqlExecutionResult> {
  const client = await pool.connect();
  let result: {
    rowCount: number | null;
    rows: QueryResultRow[];
    fields: { name: string }[];
  } | null = null;

  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL statement_timeout = '15s'");
    result = await client.query(sql);
  } finally {
    try {
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }
  }

  return {
    rowCount: result?.rowCount ?? 0,
    rows: (result?.rows ?? []).slice(0, maxRows),
    fields: (result?.fields ?? []).map((field) => field.name),
  };
}

