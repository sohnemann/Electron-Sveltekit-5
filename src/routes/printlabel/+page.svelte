<script lang="ts">
  let printerIp = '';
  let param = '';
  let status = '';

  async function sendPrint() {
    if (!printerIp || !param) {
      status = 'Please enter printer IP and parameter';
      return;
    }
    status = 'Sending to printer...';

    try {
      const res = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printerIp, param })
      });
      if (res.ok) {
        status = 'Printed successfully!';
      } else {
        const text = await res.text();
        status = `Print error: ${text || res.statusText}`;
      }
    } catch (e: unknown) {
      status = e instanceof Error ? `Error: ${e.message}` : 'Unknown print error';
    }
  }
</script>

<input
  type="text"
  bind:value={printerIp}
  placeholder="Printer IP"
  required
/>
<input
  type="text"
  bind:value={param}
  placeholder="Parameter to insert"
  required
/>

<button on:click={sendPrint} disabled={!printerIp || !param}>
  Print Label
</button>

<p>{status}</p>