<script lang="ts">
	import '../layout.css';
	import { page } from '$app/state';
	import Navbar from '$lib/components/ui/Navbar.svelte';

	let { children } = $props();

	let user = $derived(page.data.user);
</script>

<div class="min-h-screen bg-muted/20">
	{#if user}
		<Navbar />
	{/if}

	<main>
		{@render children()}
	</main>
</div>
