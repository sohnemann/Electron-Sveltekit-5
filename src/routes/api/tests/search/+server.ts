// src/routes/api/tests/search/+server.ts
import { json } from '@sveltejs/kit';
import { RegistrationService } from '$lib/services/registration';
import type { RequestHandler } from './$types.ts';

export const GET: RequestHandler = async ({ url }) => {
  const attachedLabno = Number(url.searchParams.get('attached_labno'));
  const testLabno = Number(url.searchParams.get('test_labno'));
  const searchTest = url.searchParams.get('search_test');

  if (!searchTest) {
    return json({
      success: false,
      error_code: -20000,
      error_message: 'search_test parameter is required'
    }, { status: 400 });
  }

  const result = await RegistrationService.searchTests(
    attachedLabno,
    testLabno,
    searchTest
  );

  return json(result);
};