// src/routes/api/version/+server.ts
import { json } from '@sveltejs/kit';
import { RegistrationService } from '$lib/services/registration.js';

export const GET = () => {
  return json({
    version: RegistrationService.getVersion()
  });
};