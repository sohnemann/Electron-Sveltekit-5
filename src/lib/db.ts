// src/lib/db.ts
import oracledb from 'oracledb';
import { dev } from '$app/environment';
import dotenv from 'dotenv';
dotenv.config();

const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;


class OracleDatabaseManager {
  private debug: boolean = dev;

  constructor() {
    // Set default Oracle client config here if needed
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    //oracledb.initOracleClient({ libDir: '/opt/oracle/instantclient_23_8' }); // Adjust path if needed
    oracledb.initOracleClient({ libDir: 'C:\\app\\instantclient_23_8'});
  }

  async query(sql: string, params: Record<string, any> = {}): Promise<any[]> {
    if (this.debug) {
      console.log('Oracle Query:', sql, 'Params:', params);
    }

    let connection;
    try {
        connection = await oracledb.getConnection({
            user: user,
            password: password,
            connectString: `${host}:${port}/${dbName}`
        });

      const result = await connection.execute(sql, params);
      return result.rows ?? [];
    } catch (err) {
      console.error('Oracle DB Error:', err);
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error('Error closing Oracle DB connection:', closeErr);
        }
      }
    }
  }

  setDebug(enabled: boolean) {
    this.debug = enabled;
  }
}

export const db = new OracleDatabaseManager();
