<script lang="ts">
	import { onMount } from 'svelte';
	import bwipjs from 'bwip-js';
    import { render } from 'svelte/server';

  let scanning = $state(false);


function toggleScanning() {
	scanning = !scanning;
	if (scanning) {
		scanInput?.focus();
	} else {
		scanInput?.blur();
	}
}


    interface ParsedBarcode {
    versionNo: string;
    dob: string;
    lastName: string;
    firstName: string;
    sex: string;
    nhi: string;
    careOf: string;
    referenceNo: string;
    ordererId: string;
    panPinNzmc: string;
    chargedTo: string;
    fasting: string;
    arrivalTime: string;
    arrivalDate: string;
    collectionTime: string;
    collectionDate: string;
    street: string;
    city: string;
    ethnicity: string;
    urgent: string;
    testCode: string;
}

    function createTestData(){
        versionNo = '3.0.0';
        dob = '02021987';
        lastName = 'TESTING';
        firstName = 'PATIENT';
        sex = 'F';
        nhi = 'ZZZ7070';
        careOf = 'MDP';
        referenceNo = '25H2123456';
        ordererId = '12345';
        panPinNzmc = '12345';
        chargedTo = 'ABCD';
        fasting = 'Y';
        collectionTime = '1336';
        collectionDate = '30101990';
        arrivalTime = '1337';
        arrivalDate = '01011990';
        street = '124 Conch Street';
        city = 'Bikini Bottom';
        ethnicity = '11';
        urgent = 'R';
        testCode = '1234';
        
        renderBarcode();
    }    


    function debug() {
        versionNo = 'versionNo';
        dob = 'dob';
        lastName = 'lastName';
        firstName = 'firstName';
        sex = 'sex';
        nhi = 'nhi';
        careOf = 'careOf';
        referenceNo = 'referenceNo';
        ordererId = 'ordererId';
        panPinNzmc = 'panPinNzmc';
        chargedTo = 'chargedTo';
        fasting = 'fasting';
        collectionTime = 'collectionTime';
        collectionDate = 'collectionDate';
        arrivalTime = 'arrivalTime';
        arrivalDate = 'arrivalDate';
        street = 'street';
        city = 'city';
        ethnicity = 'ethnicity';
        urgent = 'urgent';
        testCode = 'testCode';
    }
    

let scanInput: HTMLInputElement;
	let canvas: HTMLCanvasElement;

    let parsed = $state<ParsedBarcode>({
    versionNo: '',
    dob: '',
    lastName: '',
    firstName: '',
    sex: '',
    nhi: '',
    careOf: '',
    referenceNo: '',
    ordererId: '',
    panPinNzmc: '',
    chargedTo: '',
    fasting: '',
    arrivalTime: '',
    arrivalDate: '',
    collectionTime: '',
    collectionDate: '',
    street: '',
    city: '',
    ethnicity: '',
    urgent: '',
    testCode: '',
});

    // Fields in order of appearance in barcode
    let versionNo = $state('3.0.0');
    let dob = $state('');
    let lastName = $state('');
    let firstName = $state('');
    let sex = $state('');
    let nhi = $state('');
    let careOf = $state('');
    let referenceNo = $state('');
    let ordererId = $state('');
    let panPinNzmc = $state('');
    let chargedTo = $state('');
    let fasting = $state('');
    let collectionTime = $state('');
    let collectionDate = $state('');
    let arrivalTime = $state('');
    let arrivalDate = $state('');
    let street = $state('');
    let city = $state('');
    let ethnicity = $state('');
    let urgent = $state('');
    let testCode = $state('');

    //debug();
    
    // Generated from fields
    let barcodeString = $state('');

    $effect(() => {
        barcodeString = `Version ${versionNo}~${dob}~${lastName},${firstName}~${sex}~~~~5572~${nhi}~~~1~${careOf}~${referenceNo}~~~~${ordererId}~${panPinNzmc}~${chargedTo}~~~ ~ ~ ~${fasting}~${arrivalTime}~${arrivalDate}~~~~${collectionTime}~${collectionDate}~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~${street}~${city}~${city}~~~${ethnicity}~~~~~${urgent}~${testCode}~]`
    });
    
	function renderBarcode() {
		bwipjs.toCanvas(canvas, {
			bcid: 'pdf417',     // Barcode type
			text: barcodeString,        // Text to encode
			scale: 2,           // Scaling factor (try 2–5)
			height: 10,         // Optional: row height
			includetext: false, // Hide human-readable text
			textxalign: 'center'
		});
	}


    function clearFields() {
    dob = '';
    lastName = '';
    firstName = '';
    sex = '';
    nhi = '';
    careOf = '';
    referenceNo = '';
    ordererId = '';
    panPinNzmc = '';
    chargedTo = '';
    fasting = '';
    collectionTime = '';
    collectionDate = '';
    arrivalTime = '';
    arrivalDate = '';
    street = '';
    city = '';
    ethnicity = '';
    urgent = '';
    testCode = '';
    barcodeString = '';
    }

    function downloadBarcode() {
		const link = document.createElement('a');
		link.download = `${nhi}-${referenceNo}.png`;
		link.href = canvas.toDataURL('image/png');
		link.click();
	}



	let timeout: number;
let buffer = '';
let lastTime = 0;
	
function handleKey(e: KeyboardEvent) {
    if (!scanning) return;

	const now = Date.now();
	const delta = now - lastTime;
	lastTime = now;


    
	// New scan if pause too long
	if (delta > 100) buffer = '';

	// Ignore NumLock toggle (doesn't add chars)
	if (e.key.length === 1 || e.code === 'Enter' || e.code === 'NumpadEnter') {
		buffer += e.key;
	}

	// Use timeout instead of relying on Enter
	if (timeout) clearTimeout(timeout);
	timeout = setTimeout(() => {
		const cleaned = buffer.trim();
		if (cleaned.length > 5) { // you can adjust
			processScan(cleaned);
		}
		buffer = '';
	}, 50);
}

function parseBarcodeData(raw: string) {
    const fields = raw
        .replace(/^Version\s*/, '') // Remove leading "Version "
        .replace(/~\]+$/, '')       // Remove trailing ~] if present
        .split('~');

    return {
        versionNo: fields[0] || '',
        dob: fields[1] || '',
        lastName: (fields[2]?.split(',')[0]) || '',
        firstName: (fields[2]?.split(',')[1]) || '',
        sex: fields[3] || '',
        nhi: fields[8] || '',
        careOf: fields[12] || '',
        referenceNo: fields[13] || '',
        ordererId: fields[17] || '',
        panPinNzmc: fields[18] || '',
        chargedTo: fields[19] || '',
        fasting: fields[25] || '',
        arrivalTime: fields[26] || '',
        arrivalDate: fields[27] || '',
        collectionTime: fields[31] || '',
        collectionDate: fields[32] || '',
        street: fields[62] || '',
        city: fields[63] || '',
        ethnicity: fields[67] || '',
        urgent: fields[72] || '',
        testCode: fields[73] || '',
    };
}


	function processScan(data: string) {
	    clearFields();

	    parsed = parseBarcodeData(data);

        versionNo = parsed.versionNo;
        dob = parsed.dob;
        lastName = parsed.lastName;
        firstName = parsed.firstName;
        sex = parsed.sex;
        nhi = parsed.nhi;
        careOf = parsed.careOf;
        referenceNo = parsed.referenceNo;
        ordererId = parsed.ordererId;
        panPinNzmc = parsed.panPinNzmc;
        chargedTo = parsed.chargedTo;
        fasting = parsed.fasting;
        arrivalTime = parsed.arrivalTime;
        arrivalDate = parsed.arrivalDate;
        collectionTime = parsed.collectionTime;
        collectionDate = parsed.collectionDate;
        street = parsed.street;
        city = parsed.city;
        ethnicity = parsed.ethnicity;
        urgent = parsed.urgent;
        testCode = parsed.testCode;


        // ✅ Stop scanning automatically
	scanning = false;
	// Optional: re-render barcode after scan
	    //renderBarcode();
}

	onMount(() => {

         scanInput?.focus();
		renderBarcode();
	});
</script>

<h1 class="text-3xl text-center">2D-Barcode Generator</h1>

<div class="grid grid-cols-6 gap-4 py-10 px-10">
<div>
<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
<!--<label>
    Version:
	 <input type="text" class="input" bind:value={versionNo} />
</label>-->
<label>
    DOB:
	<input type="text" class="input" bind:value={dob} />
</label>
<label>
    Last Name:
		 <input type="text" class="input" bind:value={lastName} />
</label>

<label>
    First Name:
		 <input type="text" class="input" bind:value={firstName} />
</label>
<label>
    Sex:
		 <input type="text" class="input" bind:value={sex} />
</label>
<label>
    NHI:
		 <input type="text" class="input" bind:value={nhi} />
</label>
</fieldset>
</div>
<div>
<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
<label>
    Care of:
		 <input type="text" class="input" bind:value={careOf} />
</label>
<label>
    Reference No.:
		 <input type="text" class="input" bind:value={referenceNo} />
</label>
<label>
    OrdererId:
		 <input type="text" class="input" bind:value={ordererId} />
</label>
<label>
    Pan/Pin/NZMC:
	 <input type="text" class="input" bind:value={panPinNzmc} />
</label>
<label>
    ChargedTo:
	 <input type="text" class="input" bind:value={chargedTo} />
</label>
</fieldset>
</div>
<div>
<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
<label>
    Fasting:
	 <input type="text" class="input" bind:value={fasting} />
</label>
<label>
    CollectedDate:
	 <input type="text" class="input" bind:value={collectionDate} />
</label>
<label>
    Time:
	 <input type="text" class="input" bind:value={collectionTime} />
</label>
<label>
    Date:
	 <input type="text" class="input" bind:value={collectionDate} />
</label>
<label>
    Street:
	 <input type="text" class="input" bind:value={street} />
</label>
</fieldset>
</div>
<div>
<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
<label>
    City:
	 <input type="text" class="input" bind:value={city} />
</label>
<label>
    Ethnicity:
	 <input type="text" class="input" bind:value={ethnicity} />
</label>
<label>
    Urgent:
	 <input type="text" class="input" bind:value={urgent} />
</label>
<label>
    TestCode:
	 <input type="text" class="input" bind:value={testCode} />
</label>




</fieldset>
</div>
<div>
<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">


<button class="btn btn-lg btn-primary" onclick={toggleScanning}>
	{scanning ? '🛑 Stop Scanning' : '🔍 Start Scanning'}
</button>

<button class="btn btn-lg btn-accent" onclick={createTestData}>
    Fill in Test Data
</button>


<button class="btn btn-lg btn-accent" onclick={clearFields}>
    Clear Fields
</button>

<button class="btn btn-lg btn-primary" onclick={renderBarcode}>
    Render Barcode
</button>

<button class="btn btn-lg btn-accent" onclick={downloadBarcode}>Download Barcode</button>
</fieldset>
</div>


<div class="mt-10">
<input
	type="text"
	style="opacity:0; position:absolute;"
	bind:this={scanInput}
	onkeydown={handleKey}
/>




</div>

</div>

<div class="flex w-full justify-center mt-10">
    <div>
<h2 class="text-xl">2D-Barcode:</h2>
<canvas class="max-w-100" bind:this={canvas}></canvas>
</div>
</div>

<!-- For testing only -->
<!-- <div class="divider"></div>

<p>JSON Object:</p>
<pre>{JSON.stringify(parsed, null, 2)}</pre> -->