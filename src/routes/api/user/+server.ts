// src/routes/api/user/+server.ts
import { json } from '@sveltejs/kit';
import { UserService } from '$lib/services/user';
import type { RequestHandler } from './$types.ts';

export const GET: RequestHandler = async ({ url }) => {
  const usercode = url.searchParams.get('usercode');
    
  if (!usercode) {
    return json({
      success: false,
      error_code: -20000,
      error_message: 'usercode parameter is required'
    }, { status: 400 });
  }

  const result = await UserService.getUser(
    usercode
  );

  //console.log(result);
  return json(result);
};