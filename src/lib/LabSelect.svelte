 <script lang="ts">
    let {value = $bindable()} = $props(); 
 </script>
 
<label class="label" for="lab">Selected Lab</label>
<select required id="lab" class="select validator input-bordered w-full" placeholder="Laboratory" bind:value>
    <option disabled selected value="">Select a Lab</option>
    <option value="11">11 - CHL</option>
    <option value="20">20 - CHL - Anatomical Pathology</option>
    <option value="22">22 - Greymouth</option>
    <option value="25">25 - Ashburton</option>
    <option value="50">50 - Taranaki</option>
    <option value="52">52 - Hawera</option>
    <option value="60">60 - Hastings</option>
    <option value="61">61 - Waipukurau</option>
    <option value="62">62 - Wairoa</option>
</select>