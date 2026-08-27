from sqlalchemy import text

TABLES_QUERY = text(
    """
    SELECT n.nspname AS table_schema, c.relname AS table_name
    FROM pg_catalog.pg_class AS c
    JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
    WHERE c.relkind IN ('r', 'p')
      AND n.nspname = :schema
    ORDER BY c.relname
    """
)

COLUMNS_QUERY = text(
    """
    SELECT
        n.nspname AS table_schema,
        c.relname AS table_name,
        a.attname AS column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
        NOT a.attnotnull AS nullable
    FROM pg_catalog.pg_attribute AS a
    JOIN pg_catalog.pg_class AS c ON c.oid = a.attrelid
    JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
    WHERE c.relkind IN ('r', 'p')
      AND n.nspname = :schema
      AND a.attnum > 0
      AND NOT a.attisdropped
    ORDER BY c.relname, a.attnum
    """
)

PRIMARY_KEYS_QUERY = text(
    """
    SELECT
        n.nspname AS table_schema,
        c.relname AS table_name,
        a.attname AS column_name
    FROM pg_catalog.pg_constraint AS con
    JOIN pg_catalog.pg_class AS c ON c.oid = con.conrelid
    JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
    JOIN LATERAL generate_subscripts(con.conkey, 1) AS key_position ON TRUE
    JOIN pg_catalog.pg_attribute AS a
      ON a.attrelid = con.conrelid
     AND a.attnum = con.conkey[key_position]
    WHERE con.contype = 'p'
      AND n.nspname = :schema
    ORDER BY c.relname, key_position
    """
)

FOREIGN_KEYS_QUERY = text(
    """
    SELECT
        con.conname AS constraint_name,
        parent_ns.nspname AS parent_schema,
        parent.relname AS parent_table,
        parent_column.attname AS parent_column,
        child_ns.nspname AS child_schema,
        child.relname AS child_table,
        child_column.attname AS child_column,
        CASE con.confdeltype
            WHEN 'a' THEN 'NO ACTION'
            WHEN 'r' THEN 'RESTRICT'
            WHEN 'c' THEN 'CASCADE'
            WHEN 'n' THEN 'SET NULL'
            WHEN 'd' THEN 'SET DEFAULT'
        END AS on_delete,
        CASE con.confupdtype
            WHEN 'a' THEN 'NO ACTION'
            WHEN 'r' THEN 'RESTRICT'
            WHEN 'c' THEN 'CASCADE'
            WHEN 'n' THEN 'SET NULL'
            WHEN 'd' THEN 'SET DEFAULT'
        END AS on_update,
        key_position AS column_position
    FROM pg_catalog.pg_constraint AS con
    JOIN pg_catalog.pg_class AS child ON child.oid = con.conrelid
    JOIN pg_catalog.pg_namespace AS child_ns ON child_ns.oid = child.relnamespace
    JOIN pg_catalog.pg_class AS parent ON parent.oid = con.confrelid
    JOIN pg_catalog.pg_namespace AS parent_ns ON parent_ns.oid = parent.relnamespace
    JOIN LATERAL generate_subscripts(con.conkey, 1) AS key_position ON TRUE
    JOIN pg_catalog.pg_attribute AS child_column
      ON child_column.attrelid = con.conrelid
     AND child_column.attnum = con.conkey[key_position]
    JOIN pg_catalog.pg_attribute AS parent_column
      ON parent_column.attrelid = con.confrelid
     AND parent_column.attnum = con.confkey[key_position]
    WHERE con.contype = 'f'
      AND (parent_ns.nspname = :schema OR child_ns.nspname = :schema)
    ORDER BY con.conname, key_position
    """
)

