import { db } from '$lib/db';
import type { Patient, ApiResponse } from '../types.js';

export class PatientService {
static async getPatients(
    nhi: string,
  ): Promise<ApiResponse<Patient[]>> {
    try {
  

      if (!nhi) {
        throw new Error('NHI must be provided');
      }

      const query = `
       SELECT * from lpid where ptid = :nhi
      `;

      const params = {
        nhi: nhi
      };

      const user = await db.query(query, params);

      return {
        success: true,
        data: user
      };

    } catch (error) {
      console.error('Error in getUser:', error);
      return {
        success: false,
        error_code: -20000,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}