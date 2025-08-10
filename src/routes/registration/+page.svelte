<script lang="ts">
	import type { PageProps } from './$types';
	import Modal from '$lib/Modal.svelte';
      import { onMount, onDestroy } from 'svelte';
    let dialog = $state(); // HTMLDialogElement

    let user: any[] = $state([]);
    let patients: any[] = $state([]);
  
    let selection: any = $state(null);
    let selectedItem: any = $state(null);
    let userStatus = $state();
    let searchStatus = $state();
    let showModal = $state(false);

  let shouldWarnBeforeClose = true;

function handleBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault();
  event.returnValue = ''; // Required for compatibility
}

    let usercode = $state('');
    let nhi = $state('');

   async function getUser() {
  try {
    const res = await fetch(`/api/user?usercode=${encodeURIComponent(usercode)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      const { data } = await res.json();
      user = data;
      userStatus = `Found ${data.length} result${data.length !== 1 ? 's' : ''}.`;
    } else {
      const errText = await res.text();
      userStatus = `Error: ${errText}`;
      user = [];
    }
  } catch (e: unknown) {
    userStatus = e instanceof Error ? e.message : 'Unknown error';
    user = [];
  }
}


  async function search() {
  try {
    const res = await fetch(`/api/patients/search?nhi=${encodeURIComponent(nhi)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      const { data } = await res.json();
      patients = data;

      console.log(data)

      searchStatus = `Found ${data.length} result${data.length !== 1 ? 's' : ''}.`;
    } else {
      const errText = await res.text();
      searchStatus = `Error: ${errText}`;
      patients = [];
    }
  } catch (e: unknown) {
    searchStatus = e instanceof Error ? e.message : 'Unknown error';
    patients = [];
  }
}
  


 

 function handleKey(e: KeyboardEvent) {
  if (e.key === 'F4') {
    e.preventDefault();
    showModal = true;
  }
}

onMount(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKey);
  }
});

onDestroy(() => {
  if (typeof window !== 'undefined') {
       window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('keydown', handleKey);
  }
});

     function formatDate(isoString: string): string {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-NZ', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(date);
    }

  function calculateAge(isoString: string): number {
  const birthDate = new Date(isoString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  // If birthday hasn’t occurred yet this year, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

	let { data }: PageProps = $props();

function okay() {
  if (selectedItem) {
    selection = selectedItem;
  }
}

</script>

<style>
    .blue {
        color: blue;
    }
    .selected {
  background-color: #cce5ff; /* light blue */
}
</style>


{#if selectedItem}
  <ul>
    <li>PID: <span class="blue">{selectedItem.PTID}</span></li>
    <li>Name: <span class="blue">{selectedItem.PATIENT_NAME}</span></li>
    <li>Sex: <span class="blue">{selectedItem.SEX}</span></li>
    <li>DOB: <span class="blue">{formatDate(selectedItem.BIRTHDATE)}</span></li>
    <li>Age: <span class="blue">{selectedItem.AGE} Years</span></li>
    <li>Street: <span class="blue">{(selectedItem.STRADDRESS) || ''}'</span></li>
    <li>Suburb: <span class="blue">{(selectedItem.SUBURB || '')}</span></li>
    <li>City: <span class="blue">{(selectedItem.CITY || '')}</span></li>
    <li>Postcode: <span class="blue">{(selectedItem.POST_CODE || '')}</span></li>
    <li>Country: <span class="blue">{(selectedItem.COUNTRY || '')}</span></li>
  </ul>
{:else}
  <p>No patient selected</p>
{/if}


<button class="btn btn-primary" onclick={() => showModal = true}>Select (F4)</button>

<button class="btn btn-primary" onclick={() => showModal = true}>Update (F3)</button>








<Modal header="Select Patient" {okay} bind:showModal>

    <div class="grid grid-cols-4">
	<div class="col-start-1">
  <legend class="fieldset-legend">Patient ID</legend>
  <input type="text" class="input" placeholder="" bind:value={nhi}/>
  </div>
<div class="col-start-3">
  <legend class="fieldset-legend">Encounter</legend>
  <input type="text" class="input" placeholder="" />
</div>

<div class="col-start-4">

       <button id="clear_button" class="btn btn-primary mt-6" >
                Clear (F4)
               </button>
            
   <button class="btn btn-primary mt-6" onclick={search} disabled={!nhi}>Search</button>
</div>

    <div class="col-span-3">
        <legend class="fieldset-legend">Name</legend>
    <input type="text" class="input w-full" placeholder="" />
   
</div>
    <div class="col-span-3">
    <legend class="fieldset-legend">Street Address</legend>
    <input type="text" class="input  w-full" placeholder="" />

</div>

    

	<div class="col-start-1">
    <legend class="fieldset-legend">Sex</legend>
    <select class="select">
    <option disabled selected>Sex</option>
    <option>M</option>
    <option>F</option>
    </select>
	</div>
   

    <div class="col-start-2">
    <legend class="fieldset-legend">DOB</legend>
        <input type="text" class="input" placeholder="" />
                   </div>

        <div class="col-start-3">
    <legend class="fieldset-legend">Doctor</legend>
        <input type="text" class="input" placeholder="" />
                   </div>
    

                   </div>
   <div class="divider"></div>

                   <p>{searchStatus}</p>

                

<div class="overflow-x-auto rounded-box border border-base-content/5 w-full bg-base-100">
  <table class="table">
    <!-- head -->
    <thead>
      <tr>
        <th>Alias</th>
        <th>PID</th>
        <th>Encounter</th>
        <th>Name</th>
        <th>DOB</th>
        <th>Sex</th>
        <th>Doctor</th>
        <th>Location</th>
        <th>Admission</th>
      </tr>
    </thead>
    <tbody>

   {#each patients as patient}
  <tr 
    class:selected={selectedItem === patient}
    onclick={() => selectedItem = patient}
  >
    <th></th>
    <td>{patient.PTID}</td>
    <td>{patient.Encounter}</td>
    <td>{patient.PATIENT_NAME}</td>
    <td>{formatDate(patient.BIRTHDATE)}</td>
    <td>{patient.SEX}</td>
  </tr>
{/each}
    </tbody>
  </table>
</div>



</Modal>


  <label for="location" class="label">Usercode</label>
  <input id="doctor" type="text" class="input" placeholder="" bind:value={usercode} />
{#if user.length}
  <div class="mt-4 border p-4 rounded bg-gray-50">
    <h2 class="font-bold text-lg mb-2">Logged in User</h2>
  
    <ul>
      {#each user as u}
        <h3>Welcome {u.UCONAME} 😊.</h3>
        <li><strong>UNO:</strong> {u.UNO}</li>
      {/each}
    </ul>
  </div>
{:else if userStatus}
  <p class="text-red-600 mt-2">{userStatus}</p>
{/if}


   <button class="btn btn-primary mt-6" onclick={getUser}>Login</button>



<!--

<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
  <legend class="fieldset-legend">Login</legend>

  <label for="reqno" class="label">Request No</label>
  <input id="reqno" type="text" class="input" placeholder="" />

  <label for="location" class="label">Doctor</label>
    <input id="doctor" type="text" class="input" placeholder="" />

  <label for="location" class="label">Location</label>
    <input id="location" type="text" class="input" placeholder="" />

  <label for="changeto" class="label">Change to</label>
    <input id="changeto" type="text" class="input" placeholder="" />

  <label for="optoff" class="label">Opt Off</label>
    <input id="optoff" type="text" class="input" placeholder="" />

      <label for="site" class="label">Site</label>
    <input id="site" type="text" class="input" placeholder="" />

          <label for="site" class="label">Collection Time</label>
    <input id="site" type="text" class="input" placeholder="" />

          <label for="site" class="label">Test Code</label>
    <input id="site" type="text" class="input" placeholder="" />
    
    
          <label for="site" class="label">Technique</label>
    <input id="site" type="text" class="input" placeholder="" />

        
    
          <label for="site" class="label">Collection Date</label>
    <input id="site" type="text" class="input" placeholder="" />

        
    
          <label for="site" class="label">Reference</label>
    <input id="site" type="text" class="input" placeholder="" />

        
    
          <label for="site" class="label">Smear Taker / Specialist ID</label>
    <input id="site" type="text" class="input" placeholder="" />

           <label for="site" class="label">Smear Taker / Specialist ID</label>
    <input id="site" type="text" class="input" placeholder="" />

           <label for="site" class="label">Arrival Time</label>
    <input id="site" type="text" class="input" placeholder="" />
               <label for="site" class="label">Arrival Date</label>
    <input id="site" type="text" class="input" placeholder="" />

               <label for="site" class="label">Urgent</label>
    <input id="site" type="text" class="input" placeholder="" />

                   <label for="site" class="label">TMM Flag</label>
    <input id="site" type="text" class="input" placeholder="" />

    
  <button class="btn btn-neutral mt-4">Insert</button>
    <button class="btn btn-neutral mt-4">Delete</button>
      <button class="btn btn-neutral mt-4">Done</button>
</fieldset>


-->