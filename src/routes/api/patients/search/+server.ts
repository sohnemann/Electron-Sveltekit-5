// src/routes/api/patients/search/+server.ts
import { json } from '@sveltejs/kit';
import { PatientService } from '$lib/services/patients';
import type { RequestHandler } from './$types.ts';

export const GET: RequestHandler = async ({ url }) => {
  const nhi = url.searchParams.get('nhi');
    
  if (!nhi) {
    return json({
      success: false,
      error_code: -20000,
      error_message: 'usercode parameter is required'
    }, { status: 400 });
  }

  const result = await PatientService.getPatients(
    nhi
  );

  return json(result);
};