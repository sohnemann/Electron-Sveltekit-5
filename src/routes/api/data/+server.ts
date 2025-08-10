import oracledb from 'oracledb';
import type { RequestHandler } from '@sveltejs/kit';
export const prerender = false;

import { db } from '$lib/db';


import dotenv from 'dotenv';
dotenv.config();


export const POST: RequestHandler = async ({request}) => {
 
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return new Response('Invalid query', { status: 400 });
    }

    const sql = `SELECT * FROM patient WHERE patientid = :id`;
    const params = { id: query };

   const result = await db.query(sql, params);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('API Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
};


/*export const GET: RequestHandler = async () => {
  let connection;

	oracledb.initOracleClient({ libDir: '/opt/oracle/instantclient_23_8' });

  try {
    connection = await oracledb.getConnection({
      user: user,
      password: password,
      connectString: `${host}:${port}/${dbName}`
    });

    const result = await connection.execute(
      `select * from patient where PATIENTID = 'ZZZ7070'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }  // this is important!
    );

    return new Response(JSON.stringify(result.rows), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
  const message = err instanceof Error ? err.message : String(err);

  console.error('Database error:', message);
  return new Response(JSON.stringify({ error: message }), {
    status: 500
  });
  } finally {
    if (connection) await connection.close();
  }
}*/