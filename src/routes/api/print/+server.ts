import type { RequestHandler } from '@sveltejs/kit';
import net from 'net';
import { readFile } from 'fs/promises';
import path from 'path';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { printerIp, param } = await request.json();

    if (!printerIp) {
      return new Response('Printer IP is required', { status: 400 });
    }
    if (!param) {
      return new Response('Parameter "param" is required', { status: 400 });
    }

    const zplFilePath = path.resolve('static/labels/chllabel.zpl');
    let zpl = await readFile(zplFilePath, 'utf-8');

    // Simple replace of the placeholder with the param value
    zpl = zpl.replace(/{{PARAM}}/g, param);

    await new Promise<void>((resolve, reject) => {
      const client = new net.Socket();

      client.connect(9100, printerIp, () => {
        client.write(zpl, () => {
          client.end();
          resolve();
        });
      });

      client.on('error', (err: any) => {
        reject(err);
      });
    });

    return new Response('Printed successfully');
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
};
