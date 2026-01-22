<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Input } from '$lib/components/ui/input';

	let { placeholder = 'Search...', searchKey = 'search' } = $props();

	let isTyping = false;

	let searchTerm = $state(page.url.searchParams.get(searchKey) || '');
	let typingTimer: any;

	$effect(() => {
		const fromUrl = page.url.searchParams.get(searchKey) || '';
		if (!isTyping && searchTerm !== fromUrl) {
			searchTerm = fromUrl;
		}
	});

	function handleInput(e: Event) {
		isTyping = true;
		const target = e.target as HTMLInputElement;
		searchTerm = target.value;

		clearTimeout(typingTimer);
		typingTimer = setTimeout(() => {
			isTyping = false;

			const newUrl = new URL(page.url);
			if (searchTerm) {
				newUrl.searchParams.set(searchKey, searchTerm);
			} else {
				newUrl.searchParams.delete(searchKey);
			}
			newUrl.searchParams.set('page', '1');
			goto(newUrl.toString(), { keepFocus: true, noScroll: true, replaceState: true }).then(() => {
				typingTimer = null;
			});
		}, 300);
	}

	function resetInput() {
		searchTerm = '';
		isTyping = false;
		const newUrl = new URL(page.url);
		newUrl.searchParams.delete(searchKey);
		newUrl.searchParams.set('page', '1');
		goto(newUrl.toString(), { keepFocus: true, noScroll: true, replaceState: true });
	}
</script>

<div class="relative w-full max-w-sm">
	<div class="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
		>
	</div>

	<Input type="text" {placeholder} class="pr-10 pl-10" value={searchTerm} oninput={handleInput} />

	{#if searchTerm}
		<button
			type="button"
			onclick={() => resetInput()}
			class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
			aria-label="Clear search"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
			>
		</button>
	{/if}
</div>
