<script lang="ts">
    import LabSelect from '$lib/LabSelect.svelte';
    import StationField from '$lib/StationField.svelte';
    import WorkstationField from '$lib/WorkstationField.svelte';
    import { writable, get } from 'svelte/store';
    let selectedLab = $state('');
    let labName = $state('');
    let assetNumberRaw = $state('');
    let assetNumber = $derived(assetNumberRaw.toUpperCase());
    let prodLabelPrinter = $state('');
    let testLabelPrinter = $state('');
    let prodGeneralPrinter = $state('');
    let testGeneralPrinter = $state('');
    let station = $state('');
    let usesTTID = $state(false);

  $effect(() => {
    setKeyValue('General', 'Station', station);
    setKeyValue('WINSOCK PRODSOCK', 'GeneralPrinter', prodGeneralPrinter);
    setKeyValue('WINSOCK PRODSOCK', 'LabelPrinter', prodLabelPrinter);
    setKeyValue('WINSOCK TESTSOCK', 'GeneralPrinter', testGeneralPrinter);
    setKeyValue('WINSOCK TESTSOCK', 'LabelPrinter', testLabelPrinter);
  });

  type IniLine =
    | { type: 'section'; name: string }
    | { type: 'key'; section: string; key: string; value: string }
    | { type: 'comment'; content: string }
    | { type: 'empty' };

  type IniFile = IniLine[];
  const iniData = writable<IniFile | null>(null);
  const error = writable<string | null>(null);

  function parseIni(text: string): IniFile {
    const lines = text.split(/\r?\n/);
    let currentSection = '';

    return lines.map(line => {
      const trimmed = line.trim();
      if (trimmed === '') return { type: 'empty' };
      if (trimmed.startsWith(';') || trimmed.startsWith('#')) return { type: 'comment', content: line };

      const sectionMatch = trimmed.match(/^\[(.+)]$/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        return { type: 'section', name: currentSection };
      }

      const keyValMatch = trimmed.match(/^([^=]+)=(.*)$/);
      if (keyValMatch) {
        return {
          type: 'key',
          section: currentSection,
          key: keyValMatch[1].trim(),
          value: keyValMatch[2].trim()
        };
      }

      return { type: 'comment', content: line };
    });
  }

  function serializeIni(lines: IniFile): string {
    return lines.map(line => {
      switch (line.type) {
        case 'section': return `[${line.name}]`;
        case 'key': return `${line.key}=${line.value}`;
        case 'comment': return line.content;
        case 'empty': return '';
      }
    }).join('\n');
  }

  async function loadIni() {
    if (!selectedLab) {
      iniData.set(null);
      return;
    }

    const baseRes = await fetch('template/base_template.ini.txt');
    const baseText = await baseRes.text();
    const baseParsed = parseIni(baseText);

    let labPath = '';
    switch(selectedLab) {
        case '11': labPath = 'labs/lab11_christchurch.ini.txt'; labName = 'Christchurch'; usesTTID = true; break;
        case '20': labPath = 'labs/lab20_christchurch.ini.txt'; labName = 'Christchurch - Anatomical Pathology'; break;
        case '22': labPath = 'labs/lab22_greymouth.ini.txt'; labName = 'Greymouth';  usesTTID = true; break;
        case '25': labPath = 'labs/lab25_ashburton.ini.txt'; labName = 'Ashburton';  usesTTID = true; break;
        case '50': labPath = 'labs/lab50_taranaki.ini.txt'; labName = 'Taranaki'; break;
        case '52': labPath = 'labs/lab52_hawera.ini.txt'; labName = 'Hawera'; break;
        case '61': labPath = 'labs/lab61_waipukurau.ini.txt'; labName = 'Waipukurau'; break;
        case '62': labPath = 'labs/lab62_wairoa.ini.txt'; labName = 'Wairoa'; break;
        default: iniData.set(baseParsed); return;
      }

    try {
      const labRes = await fetch(labPath);
      if (!labRes.ok) throw new Error('Failed to fetch lab INI');

      const labText = await labRes.text();
      const labParsed = parseIni(labText);

      const merged = mergeIniData(baseParsed, labParsed);
      iniData.set(merged);
      error.set(null);
    } catch (e) {
      error.set(e instanceof Error ? e.message : String(e));
      iniData.set(null);
    }
  }

  function clearForm() {
  assetNumberRaw = '';
  prodGeneralPrinter = '';
  prodLabelPrinter = '';
  station = '';
  testGeneralPrinter = '';
  testLabelPrinter = '';

  iniData.update((data) => {
    if (!data) return data;
    return data.map((line) => {
      if (line.type === 'key') {
        return { ...line, value: '' };
      }
      return line;
    });
  });
}




  $effect(() => {
    if (selectedLab) {
    usesTTID = false;
    clearForm();   // 🔄 clear fields first
    loadIni();     // 📥 load new data
  }
  });


 function mergeIniData(base: IniFile, override: IniFile): IniFile {
  const merged: IniFile = [];
  const seenSections = new Set<string>();
  const seenKeys = new Set<string>();

  // Helper to build a map of override [section] -> [{ key, value }]
  const overrideSections = new Map<string, { key: string, value: string }[]>();
  for (const line of override) {
    if (line.type === 'key') {
      if (!overrideSections.has(line.section)) {
        overrideSections.set(line.section, []);
      }
      overrideSections.get(line.section)!.push({ key: line.key, value: line.value });
    }
  }

  let currentSection = '';
  for (const line of base) {
    merged.push(line);

    if (line.type === 'section') {
      currentSection = line.name;
      seenSections.add(currentSection);
    }

    if (line.type === 'key') {
      seenKeys.add(`${line.section}|${line.key}`);

      const overrides = overrideSections.get(line.section);
      const overrideValue = overrides?.find(kv => kv.key === line.key)?.value;
      if (overrideValue !== undefined) {
        merged[merged.length - 1] = { ...line, value: overrideValue };
      }
    }
  }

  // Append missing keys from override to existing sections
  for (const [section, keys] of overrideSections.entries()) {
    if (seenSections.has(section)) {
      const existingSectionIndex = merged.findIndex(
        (l) => l.type === 'section' && l.name === section
      );
      const insertionIndex = existingSectionIndex + 1;
      for (const { key, value } of keys) {
        const keyId = `${section}|${key}`;
        if (!seenKeys.has(keyId)) {
          merged.splice(insertionIndex, 0, { type: 'key', section, key, value });
          seenKeys.add(keyId);
        }
      }
    }
  }

  // Append entirely new sections and their lines
  let i = 0;
  while (i < override.length) {
    const line = override[i];

    if (line.type === 'section' && !seenSections.has(line.name)) {
      // Copy the entire section and everything until the next section
      merged.push({ ...line });
      seenSections.add(line.name);
      i++;

      while (i < override.length && override[i].type !== 'section') {
        const overrideLine = override[i];
        if (
          overrideLine.type !== 'key' ||
          !seenKeys.has(`${overrideLine.section}|${overrideLine.key}`)
        ) {
          merged.push({ ...overrideLine });
          if (overrideLine.type === 'key') {
            seenKeys.add(`${overrideLine.section}|${overrideLine.key}`);
          }
        }
        i++;
      }
    } else {
      i++;
    }
  }
  return merged;
}

   function findKeyIndex(section: string, key: string): number {
    const data = get(iniData);
    if (!data) return -1;
    return data.findIndex(
      (line) => line.type === 'key' && line.section === section && line.key === key
    );
  }

  // Helper to get value of a key from iniData
  function getKeyValue(section: string, key: string): string {
    const data = get(iniData);
    if (!data) return '';
    const idx = findKeyIndex(section, key);
    return idx >= 0 ? (data[idx] as any).value : '';
  }

  function setKeyValue(section: string, key: string, value: string) {
  iniData.update((data) => {
    if (!data) return data;
    const idx = data.findIndex(
      (line) => line.type === 'key' && line.section === section && line.key === key
    );
    if (idx >= 0) {
      const line = data[idx];
      if (line.type === 'key') {
        data[idx] = { ...line, value };  // Safe now
      }
    }
    return data;
  });
}

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    if (form.checkValidity()) {
      downloadIni();
    } else {
      form.reportValidity();
    }
  }

  function downloadIni() {
    let data = get(iniData);
    if (!data) return;


    // Remove the base template comment
    data = data.filter(
      (line) =>
        !(line.type === 'comment' && line.content.trim() === '# Base Template for all delph32.ini files')
    );

    data.unshift({
      type: 'comment',
      content: `# Delphic INI for ${assetNumber} located in Lab ${selectedLab} (${labName})`
    });

    const blob = new Blob([serializeIni(data)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${assetNumber}.delph32.ini`;
    a.click();

    URL.revokeObjectURL(url);
  }
</script>

<h1 class="text-2xl font-bold mb-4 text-center">DelphicReg - INI Generator</h1>

{#if $error}
<div role="alert" class="alert alert-error">
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <span>Error: {$error}</span>
</div>
{/if}

<div class="grid grid-cols-4 gap-4">
  <section class="col-start-2">
    <div class="card bg-base-100 w-96 shadow-sm">
      <div class="card-body">
        <h2 class="card-title">What is this?</h2>
        <p>This tool allows you to generate a DELPH32.ini file for any lab.</p>
        <p>Sysmex' way to generate / update INI files has been a major issue for a long time.</p>
        <p>Therefore I decided to do something about it while working on rolling out the <b>'new'</b> 😉 DelphicReg version.</p>
        <hr>
        <p><b>How does it work?</b></p>
        <p>It's simple, just select a <b>lab</b>, enter the <b>workstation asset number</b> and <b>Delphic station number</b> you would like to generate an INI file for and add the <b>relevant printers</b>.</p>
        <p>Once that's done, just click on 'Download INI' and you will be provided with a working INI file for the workstation.</p>
        <p>Just copy it to the <b>DelphicReg</b> folder on the <b>K-Drive</b> (<b>see the path below</b>) and it is live immediately.</p>
        <pre>\\mschcrfip2.cdhb.local\labapps\DelphicReg</pre>
        <p>No need to do anything on prodwork and no need to upload it to the database.</p>
        <hr>
        <p><b>Info regarding TTID</b></p>
        <p>For labs that do not use TTID, the generic Lab ini can be used.</p>
        <p>You'll only see the fields that need to be filled out.</p>
      </div>
    </div>
  </section>
  <section class="col-start-3">
    <div class="card bg-base-100 w-96 shadow-sm">
      <div class="card-body">
        <h2 class="card-title">Generator</h2>
        <form onsubmit={handleSubmit} autocomplete="off">
          <fieldset class="fieldset rounded-box border border-base-300 bg-base-200 p-4">
              
              <legend class="fieldset-legend">Lab & Workstation</legend>
              <LabSelect bind:value={selectedLab} />
              {#if $iniData}            
              <WorkstationField bind:value={assetNumberRaw} disabled={!selectedLab} />
               
              {#if usesTTID}
               <legend class="fieldset-legend">General</legend>
               <StationField id="station" digits={4} disabled={!selectedLab} label="Station" bind:value={station}/>
               

               <legend class="fieldset-legend">Production</legend>
               <StationField id="prod_general_printer" digits={4} disabled={!selectedLab} label="General Printer" bind:value={prodGeneralPrinter}/>
               <StationField id="prod_label_printer" digits={4} disabled={!selectedLab} label="Label Printer" bind:value={prodLabelPrinter}/>
               
               <legend class="fieldset-legend">Test</legend>
               <StationField id="test_general_printer" digits={4} disabled={!selectedLab} label="General Printer" bind:value={testGeneralPrinter}/>
               <StationField id="prod_label_printer" digits={4} disabled={!selectedLab} label="Label Printer" bind:value={testLabelPrinter}/>
               {/if}

               <button id="submit_button" class="btn btn-primary mt-6"  disabled={!selectedLab} type="submit">
                Download INI
               </button>
              {/if}
          </fieldset>
        </form>
      </div>
    </div>
  </section>
</div>