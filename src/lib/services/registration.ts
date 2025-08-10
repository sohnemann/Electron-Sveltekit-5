import { db } from '$lib/db';
import type { Patient, Test, ApiResponse } from '../types.js';

export class RegistrationService {
  private static version = '1.0';

  static getVersion(): string {
    return this.version;
  }

  private static isNumber(value: string): boolean {
    return !isNaN(Number(value)) && !isNaN(parseFloat(value));
  }

  private static validateRequired(value: any, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new Error(`${fieldName} is required`);
    }
  }

  static async searchPatients(
    //lpidLabno: number,
    //doctorLabno: number,
    nhi: string,
    //encounter?: string
  ): Promise<ApiResponse<Patient[]>> {
    try {
      //this.validateRequired(lpidLabno, 'lpidLabno');
      //this.validateRequired(doctorLabno, 'doctorLabno');

      if (!nhi) { //&& !encounter) {
        throw new Error('Either NHI or Encounter must be provided');
      }

       const query = `SELECT * FROM LPID WHERE ptid = :nhi
       `;

     /* const query = `
        SELECT 
          l.*,
          COALESCE(d1.alpha_code, TO_CHAR(d1.docnum)) AS att_alpha_code,
          COALESCE(d2.alpha_code, TO_CHAR(d2.docnum)) AS location_alpha_code
        FROM lpid l
        LEFT JOIN doctor d1 ON d1.labno = :doctorLabno AND d1.docnum = l.att_docnum AND d1.sub = 0
        LEFT JOIN doctor d2 ON d2.labno = :doctorLabno AND d2.docnum = l.location_docnum AND d2.sub = 0
        WHERE l.labno = :labno
          AND l.ptid = COALESCE(UPPER(:ptid), l.ptid)
          AND l.encounter = COALESCE(:encounter, l.encounter)
          AND l.inactive = 'N'
        ORDER BY l.ptid, l.encounter
      `;*/



      const params = {
        //labno: lpidLabno,
        //doctorLabno,
        nhi: nhi,
        //encounter
      };

      const patients = await db.query(query, params);

      return {
        success: true,
        data: patients
      };

    } catch (error) {
      console.error('Error in searchPatients:', error);
      return {
        success: false,
        error_code: -20000,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async searchTests(
    attachedLabno: number,
    testLabno: number,
    searchTest: string
  ): Promise<ApiResponse<Test[]>> {
    try {
      this.validateRequired(attachedLabno, 'attachedLabno');
      this.validateRequired(testLabno, 'testLabno');
      this.validateRequired(searchTest, 'searchTest');

      let query: string;
      let params: any;

      if (this.isNumber(searchTest)) {
        query = `
          SELECT 
            t.labno,
            t.test,
            t.alf_key,
            t.short_desc,
            t.text,
            t.orderable,
            CASE 
              WHEN (
                SELECT MAX(statis)
                FROM testlist l
                WHERE l.labno = :attachedLabno AND l.code = l.test AND l.test = t.test
              ) IN (4, 5)
              OR (
                SELECT MAX(statis)
                FROM testlist l
                WHERE l.labno = :testLabno AND l.code = l.test AND l.test = t.test
              ) IN (4, 5)
              THEN 'Yes'
              ELSE 'No'
            END AS is_orderable
          FROM testmaster t
          WHERE t.labno = :testLabno
            AND t.test = :test
            AND SYSDATE BETWEEN t.start_date AND t.end_date
          ORDER BY t.alf_key
        `;
        params = {
          test: parseInt(searchTest),
          attachedLabno,
          testLabno
        };
      } else {
        query = `
          SELECT 
            t.labno,
            t.test,
            t.alf_key,
            t.short_desc,
            t.text,
            t.orderable,
            CASE 
              WHEN (
                SELECT MAX(statis)
                FROM testlist l
                WHERE l.labno = :attachedLabno AND l.code = l.test AND l.test = t.test
              ) IN (4, 5)
              OR (
                SELECT MAX(statis)
                FROM testlist l
                WHERE l.labno = :testLabno AND l.code = l.test AND l.test = t.test
              ) IN (4, 5)
              THEN 'Yes'
              ELSE 'No'
            END AS is_orderable
          FROM testmaster t
          WHERE t.labno = :testLabno
            AND UPPER(t.alf_key) LIKE UPPER(:searchTest) || '%'
            AND SYSDATE BETWEEN t.start_date AND t.end_date
          ORDER BY t.alf_key
        `;
        params = {
          searchTest,
          attachedLabno,
          testLabno
        };
      }

      const tests = await db.query(query, params);

      return {
        success: true,
        data: tests
      };

    } catch (error) {
      console.error('Error in searchTests:', error);
      return {
        success: false,
        error_code: -20000,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
