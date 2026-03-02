import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  assertReadOnlySql,
  pool,
  runReadOnlySql,
  runSqlWithRollback,
} from "./db.js";

const DEFAULT_MAX_ROWS = 100;
const MAX_ROWS_HARD_LIMIT = 500;

const server = new McpServer({
  name: "postgres-local",
  version: "0.1.0",
});

server.registerTool(
  "list_schemas",
  {
    title: "List database schemas",
    description: "Lists user-visible schemas in the connected PostgreSQL database.",
    inputSchema: {},
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async () => {
    const result = await pool.query<{
      schema_name: string;
    }>(
      `
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name <> 'information_schema'
        AND schema_name NOT LIKE 'pg_%'
      ORDER BY schema_name;
      `,
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.rows, null, 2),
        },
      ],
      structuredContent: {
        schemas: result.rows.map((row) => row.schema_name),
      },
    };
  },
);

server.registerTool(
  "list_objects",
  {
    title: "List schema objects",
    description:
      "Lists tables, views, materialized views, sequences, functions, and procedures for a specific schema.",
    inputSchema: {
      schema: z
        .string()
        .min(1)
        .max(63)
        .describe("Schema name. Example: public"),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ schema }) => {
    const result = await pool.query<{
      object_name: string;
      object_type: string;
    }>(
      `
      SELECT table_name AS object_name, 'table' AS object_type
      FROM information_schema.tables
      WHERE table_schema = $1
        AND table_type = 'BASE TABLE'
      UNION ALL
      SELECT table_name AS object_name, 'view' AS object_type
      FROM information_schema.views
      WHERE table_schema = $1
      UNION ALL
      SELECT matviewname AS object_name, 'materialized_view' AS object_type
      FROM pg_matviews
      WHERE schemaname = $1
      UNION ALL
      SELECT sequence_name AS object_name, 'sequence' AS object_type
      FROM information_schema.sequences
      WHERE sequence_schema = $1
      UNION ALL
      SELECT p.proname AS object_name,
             CASE p.prokind WHEN 'p' THEN 'procedure' ELSE 'function' END AS object_type
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = $1
      ORDER BY object_type, object_name;
      `,
      [schema],
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result.rows, null, 2),
        },
      ],
      structuredContent: {
        schema,
        objects: result.rows,
      },
    };
  },
);

server.registerTool(
  "execute_sql",
  {
    title: "Execute read-only SQL",
    description:
      "Executes SQL in read-only mode. Rejects write-oriented statements (INSERT/UPDATE/DELETE/DDL).",
    inputSchema: {
      sql: z.string().min(1).describe("Read-only SQL query."),
      maxRows: z
        .number()
        .int()
        .positive()
        .max(MAX_ROWS_HARD_LIMIT)
        .optional()
        .describe(
          `Maximum rows to return. Defaults to ${DEFAULT_MAX_ROWS}, hard limit ${MAX_ROWS_HARD_LIMIT}.`,
        ),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ sql, maxRows }) => {
    assertReadOnlySql(sql);

    const limit = maxRows ?? DEFAULT_MAX_ROWS;
    const result = await runReadOnlySql(sql, limit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              rowCount: result.rowCount,
              returnedRows: result.rows.length,
              fields: result.fields,
              rows: result.rows,
            },
            null,
            2,
          ),
        },
      ],
      structuredContent: {
        rowCount: result.rowCount,
        returnedRows: result.rows.length,
        fields: result.fields,
        rows: result.rows,
      },
    };
  },
);

server.registerTool(
  "execute_sql_with_rollback",
  {
    title: "Execute SQL with forced rollback",
    description:
      "Executes SQL in a writable transaction and always rolls back. Useful for tests and dry-runs.",
    inputSchema: {
      sql: z.string().min(1).describe("SQL statement(s) to execute."),
      maxRows: z
        .number()
        .int()
        .positive()
        .max(MAX_ROWS_HARD_LIMIT)
        .optional()
        .describe(
          `Maximum rows to return. Defaults to ${DEFAULT_MAX_ROWS}, hard limit ${MAX_ROWS_HARD_LIMIT}.`,
        ),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
  async ({ sql, maxRows }) => {
    const limit = maxRows ?? DEFAULT_MAX_ROWS;
    const result = await runSqlWithRollback(sql, limit);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              rolledBack: true,
              rowCount: result.rowCount,
              returnedRows: result.rows.length,
              fields: result.fields,
              rows: result.rows,
            },
            null,
            2,
          ),
        },
      ],
      structuredContent: {
        rolledBack: true,
        rowCount: result.rowCount,
        returnedRows: result.rows.length,
        fields: result.fields,
        rows: result.rows,
      },
    };
  },
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("[postgres-local MCP] Fatal error:", error);
  process.exit(1);
});

