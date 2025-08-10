<script>
	let { showModal = $bindable(), okay = () =>{}, header, children } = $props();

	let dialog = $state(); // HTMLDialogElement

	$effect(() => {
		if (showModal) dialog.showModal();
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
class="modal w-full"
	bind:this={dialog}
	onclose={() => (showModal = false)}
	onclick={(e) => { if (e.target === dialog) dialog.close(); }}
>
  <div class="modal-box w-11/12 max-w-5xl">
		    <h3 class="text-lg font-bold">{header}</h3>
		<hr />
		{@render children?.()}
		<hr />
		<!-- svelte-ignore a11y_autofocus -->
        <button class="btn btn-primary" onclick={() => dialog.close()}>Alias</button>
        <button class="btn btn-primary" onclick={() => dialog.close()}>New</button>
      <button class="btn btn-primary" onclick={() => { okay(); showModal = false; dialog.close()}}>OK</button>
		<button class="btn btn-primary" onclick={() => dialog.close()}>Cancel</button>
	</div>
</dialog>

<style>
	dialog {
		border-radius: 0.2em;
		border: none;
		padding: 0;
	}
</style>
