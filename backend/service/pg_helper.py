import psycopg2
import json

from backend.config.config import DB_HOST, DB_PORT, DB_SCHEMA, DB_USER, DB_PWD


class PgDBHelper:
    def __init__(self):
        self.conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_SCHEMA,
            user=DB_USER,
            password=DB_PWD
        )
        self.cur = self.conn.cursor()

    def test_connection(self):
        try:
            self.cur.execute('SELECT version()')
            db_version = self.cur.fetchone()[0]
            print(f"Connected to PostgreSQL. Database version: {db_version}")
        except psycopg2.Error as e:
            print(f"Error connecting to PostgreSQL: {e}")

    def has_tables(self):
        table_count = 0
        try:
            self.cur.execute('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \'public\'')
            table_count = self.cur.fetchone()[0]
            print(f"Count tables: {table_count}")
        except psycopg2.Error as e:
            print(f"Error counting tables: {e}")
        finally:
            return table_count

    def execute_sql(self, filename):
        # 读取 SQL 脚本文件内容
        with open(filename, 'r') as file:
            sql_script = file.read()
        # 使用事务执行 SQL 脚本
        try:
            self.cur.execute(sql_script)
            self.conn.commit()
            print("Schema initialized successfully.")
        except psycopg2.Error as e:
            self.conn.rollback()
            print(f"Error initializing schema: {e}")
        # finally:
        #     self.close()

    def save(self, table, data):
        try:
            # 处理 json 类型数据
            data_copy = data.copy()
            for key, value in data_copy.items():
                if isinstance(value, dict):
                    data_copy[key] = json.dumps(value)
            columns = ', '.join(data_copy.keys())
            placeholders = ', '.join(['%s'] * len(data_copy))
            query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders}) RETURNING id"
            self.cur.execute(query, list(data_copy.values()))
            primary_key = self.cur.fetchone()[0]
            self.conn.commit()
            print("Data saved successfully.")
            return primary_key
        except psycopg2.Error as e:
            print(f"Error saving data: {e}")

    def update(self, table, data):
        try:
            id = data['id']
            update_query = f"UPDATE {table} SET "
            update_parts = []
            for column, value in data.items():
                if column != 'id':
                    update_parts.append(f"{column} = '{value}'")
            update_query += ", ".join(update_parts)
            update_query += f" WHERE id = {id}"
            self.cur.execute(update_query)
            self.conn.commit()
            print("Data updated successfully.")
        except psycopg2.Error as e:
            print(f"Error updating data: {e}")

    def delete(self, table, data_id):
        try:
            query = f"DELETE FROM {table} WHERE id = %s"
            self.cur.execute(query, (data_id,))
            self.conn.commit()
            print("Data deleted successfully.")
        except psycopg2.Error as e:
            print(f"Error deleting data: {e}")

    def get_all(self, table, page: int = None, page_size: int = None, filters: dict = None, matches: dict = None):
        try:
            query = f"SELECT * FROM {table}"
            params, where_sql = self.build_conditions(filters, matches)
            query += where_sql
            query += " ORDER BY id"
            if page and page_size:
                offset = (page - 1) * page_size
                params.extend([page_size, offset])
                query += " LIMIT %s OFFSET %s"

            print(query, params)
            self.cur.execute(query, params)
            rows = self.cur.fetchall()
            for row in rows:
                print(row)
            return rows
        except psycopg2.Error as e:
            print(f"Error retrieving data: {e}")

    def count(self, table, filters: dict = None, matches: dict = None):
        try:
            query = f"SELECT COUNT(*) FROM {table}"
            params, where_sql = self.build_conditions(filters, matches)
            query += where_sql
            print(query, params)
            self.cur.execute(query, params)
            count = self.cur.fetchone()[0]
            return count
        except psycopg2.Error as e:
            print(f"Error counting data: {e}")

    def get(self, table, data_id):
        try:
            query = f"SELECT * FROM {table} WHERE id = %s"
            self.cur.execute(query, (data_id,))
            row = self.cur.fetchone()
            if row:
                print(row)
                return row
            else:
                print("Data not found.")
        except psycopg2.Error as e:
            print(f"Error retrieving data: {e}")

    def clear(self, table):
        try:
            query = f"TRUNCATE {table}"
            self.cur.execute(query)
            restart_query = f"ALTER SEQUENCE {table}_id_seq RESTART WITH 1"
            self.cur.execute(restart_query)
            self.conn.commit()
            print("Deleted rows successfully.")
        except psycopg2.Error as e:
            print(f"Error deleting rows: {e}")

    def close(self):
        self.cur.close()
        self.conn.close()
        print("Database connection closed.")

    # mysql 忽略大小写：sql 追加 COLLATE utf8_general_ci
    @staticmethod
    def build_conditions(filters, matches=None):
        if matches is None:
            matches = {}
        params = []
        where_sql = ""
        if filters:
            conditions = []
            for key, value in filters.items():
                if isinstance(value, list):
                    value = [val for val in value if val is not None]
                    if len(value) == 0:
                        continue
                    if key not in matches:
                        conditions.append(f"{key} IN %s")
                        params.append(tuple(value))
                    else:
                        relation = " AND " if matches[key] is True else " OR "
                        conditions.append("(" + relation.join([f"{key} ILIKE %s"] * len(value)) + ")")
                        params.extend([f"%{item}%" for item in value])
                elif value is not None:
                    if key not in matches:
                        conditions.append(f"{key} = %s")
                        params.append(value)
                    elif len(key.split(',')) > 1:
                        like_fields = key.split(',')
                        relation = " AND " if matches[key] is True else " OR "
                        conditions.append("(" + relation.join([f"{like_field} ILIKE %s" for like_field in like_fields]) + ")")
                        params.extend([f"%{value}%"] * len(like_fields))
                    else:
                        conditions.append(f"{key} ILIKE %s")
                        params.append(f"%{value}%")
            if len(conditions) > 0:
                where_sql = " WHERE " + " AND ".join(conditions)

        return params, where_sql
