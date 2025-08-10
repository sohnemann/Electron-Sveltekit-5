import { db } from '$lib/db';
import type { User, ApiResponse } from '../types.js';

export class UserService {
static async getUser(
    usercode: string,
  ): Promise<ApiResponse<User[]>> {
    try {
  

      if (!usercode) {
        throw new Error('Usercode must be provided');
      }

      const query = `
       SELECT * from uco_table where usercode = :usercode
      `;

      const params = {
        usercode: usercode
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