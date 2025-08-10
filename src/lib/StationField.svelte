<script lang="ts">
  let { id, digits, label, value = $bindable(), disabled } = $props();
</script>

<label class="label" for={id}>{label}</label>
<input
  required
  pattern={`\d{'{'}${digits.toString()}{'}'}`}
  id={id}
  disabled={disabled}
  type="text"
  class="input validator input-bordered w-full"
  minlength={digits}
  maxlength={digits}
  placeholder={"e.g. 0123"}
  bind:value
/>
