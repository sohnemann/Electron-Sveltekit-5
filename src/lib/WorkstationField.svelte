<script lang="ts">
  let { value = $bindable(), disabled } = $props();
</script>

<label class="label" for="workstation">Workstation</label>

<input
  id="workstation"
  type="text"
  class="input validator input-bordered w-full mb-2"
  required
  disabled={disabled}
  placeholder="Asset Number"
  pattern="(w||W)\d{'{'}5{'}'}"
  minlength="6"
  maxlength="6"
  bind:value
/>
<p class="validator-hint text-sm text-gray-500 mt-[-0.75rem]">
  Must be in this format: <code>W12345</code>
</p> 