import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { Pool } from 'pg';

dotenv.config();

type PgColumn = {
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: 'YES' | 'NO';
  character_maximum_length: number | null;
  numeric_precision: number | null;
  numeric_scale: number | null;
};

function mysqlTypeFor(column: PgColumn): string {
  const dataType = column.data_type.toLowerCase();
  const udt = column.udt_name.toLowerCase();

  if (dataType === 'boolean') return 'BOOLEAN';
  if (dataType === 'smallint') return 'SMALLINT';
  if (dataType === 'integer') return 'INT';
  if (dataType === 'bigint') return 'BIGINT';
  if (dataType === 'real') return 'FLOAT';
  if (dataType === 'double precision') return 'DOUBLE';

  if (dataType === 'numeric' || dataType === 'decimal') {
    if (column.numeric_precision && column.numeric_scale !== null) {
      return `DECIMAL(${column.numeric_precision},${column.numeric_scale})`;
    }
    return 'DECIMAL(65,30)';
  }

  if (dataType === 'uuid') return 'VARCHAR(36)';
  if (dataType === 'date') return 'DATE';
  if (dataType.includes('timestamp')) return 'DATETIME';
  if (dataType.includes('time')) return 'TIME';
  if (dataType === 'bytea') return 'LONGBLOB';

  if (dataType === 'character varying' || dataType === 'character') {
    if (column.character_maximum_length && column.character_maximum_length <= 1024) {
      return `VARCHAR(${column.character_maximum_length})`;
    }
    return 'LONGTEXT';
  }

  if (dataType === 'json' || dataType === 'jsonb') return 'LONGTEXT';

  if (dataType === 'array' || udt.startsWith('_')) return 'LONGTEXT';

  if (dataType === 'text') return 'LONGTEXT';

  return 'LONGTEXT';
}

function mysqlIdentifier(name: string): string {
  return `\`${name.replace(/`/g, '``')}\``;
}

function pgIdentifier(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function toInsertValue(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null) return null;
  if (value instanceof Date) return value;
  if (Buffer.isBuffer(value)) return value;

  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value;
}

async function main() {
  const sourceUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

  if (!sourceUrl) {
    throw new Error('Missing source Postgres URL. Set SUPABASE_DATABASE_URL or DATABASE_URL.');
  }

  const mysqlHost = process.env.MYSQL_HOST;
  const mysqlPort = Number(process.env.MYSQL_PORT || 3306);
  const mysqlUser = process.env.MYSQL_USER;
  const mysqlPassword = process.env.MYSQL_PASSWORD || '';
  const mysqlDatabase = process.env.MYSQL_DATABASE;

  if (!mysqlHost || !mysqlUser || !mysqlDatabase) {
    throw new Error('Missing MySQL config. Set MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE, and optional MYSQL_PASSWORD/MYSQL_PORT.');
  }

  const source = new Pool({ connectionString: sourceUrl, ssl: { rejectUnauthorized: false } });
  const target = await mysql.createConnection({
    host: mysqlHost,
    port: mysqlPort,
    user: mysqlUser,
    password: mysqlPassword,
    database: mysqlDatabase,
    multipleStatements: true
  });

  try {
    console.log('Reading source table list from Postgres...');

    const tablesResult = await source.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`
    );

    const tableNames = tablesResult.rows.map((row) => row.table_name);

    if (tableNames.length === 0) {
      console.log('No tables found under public schema. Nothing to migrate.');
      return;
    }

    console.log(`Found ${tableNames.length} tables.`);

    await target.execute('SET FOREIGN_KEY_CHECKS = 0');

    for (const tableName of tableNames) {
      console.log(`\nMigrating table: ${tableName}`);

      const columnsResult = await source.query<PgColumn>(
        `SELECT column_name,
                data_type,
                udt_name,
                is_nullable,
                character_maximum_length,
                numeric_precision,
                numeric_scale
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [tableName]
      );

      const columns = columnsResult.rows;

      const pkResult = await source.query<{ column_name: string }>(
        `SELECT kcu.column_name
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu
           ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
          AND tc.table_name = kcu.table_name
         WHERE tc.table_schema = 'public'
           AND tc.table_name = $1
           AND tc.constraint_type = 'PRIMARY KEY'
         ORDER BY kcu.ordinal_position`,
        [tableName]
      );

      const primaryKeys = new Set(pkResult.rows.map((row) => row.column_name));

      const columnDefs = columns.map((column) => {
        const type = mysqlTypeFor(column);
        const nullable = column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        return `${mysqlIdentifier(column.column_name)} ${type} ${nullable}`;
      });

      const primaryKeyClause = primaryKeys.size
        ? `, PRIMARY KEY (${Array.from(primaryKeys).map((key) => mysqlIdentifier(key)).join(', ')})`
        : '';

      const createTableSql = `
        CREATE TABLE IF NOT EXISTS ${mysqlIdentifier(tableName)} (
          ${columnDefs.join(',\n          ')}
          ${primaryKeyClause}
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `;

      await target.execute(createTableSql);
      await target.execute(`TRUNCATE TABLE ${mysqlIdentifier(tableName)}`);

      const rowsResult = await source.query<Record<string, unknown>>(
        `SELECT * FROM public.${pgIdentifier(tableName)}`
      );

      const rows = rowsResult.rows;
      console.log(`Rows to copy: ${rows.length}`);

      if (rows.length === 0) {
        continue;
      }

      const columnNames = columns.map((column) => column.column_name);
      const insertColumns = columnNames.map((name) => mysqlIdentifier(name)).join(', ');
      const placeholders = `(${columnNames.map(() => '?').join(', ')})`;

      const batchSize = 500;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);

        const valuesSql = batch.map(() => placeholders).join(', ');
        const flatValues: unknown[] = [];

        for (const row of batch) {
          for (const columnName of columnNames) {
            flatValues.push(toInsertValue(row[columnName]));
          }
        }

        await target.execute(
          `INSERT INTO ${mysqlIdentifier(tableName)} (${insertColumns}) VALUES ${valuesSql}`,
          flatValues
        );
      }
    }

    await target.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\nMigration completed successfully.');
  } finally {
    await source.end();
    await target.end();
  }
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
