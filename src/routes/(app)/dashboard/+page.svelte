<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { logout } from '$lib/api';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { invalidateAll } from '$app/navigation';

	import { page } from '$app/state';

	let { data } = $props();
	let user = $derived(page.data.user);
	let pages = $derived(Array.from({ length: data.pagination.total_pages }, (_, i) => i + 1));
	let pagination = $derived(data.pagination);

	let open = $state(false);
	let name = $state('');
	let description = $state('');
	let sku = $state('');
	let quantity = $state(0);
	let isLoading = $state(false);

	let editOpen = $state(false);
	let isEditing = $state(false);

	function resetAddForm() {
		name = '';
		description = '';
		sku = '';
		quantity = 0;
	}

	let selectedItem = $state({
		id: 0,
		name: '',
		description: '',
		sku: '',
		quantity: 0
	});

	function openEditModal(item: any) {
		selectedItem = {
			id: item.id,
			name: item.name,
			description: item.description,
			sku: item.sku,
			quantity: item.quantity
		};
		editOpen = true;
	}

	async function handleUpdateItem() {
		isEditing = true;
		try {
			const response = await fetch(`http://localhost:8000/api/items/${selectedItem.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${data.token}`
				},
				body: JSON.stringify({
					name: selectedItem.name,
					description: selectedItem.description,
					sku: selectedItem.sku,
					quantity: selectedItem.quantity
				})
			});

			if (response.ok) {
				editOpen = false;
				await invalidateAll();
			} else {
				if (response.status === 401) {
					console.error('Unauthorized');
				}
				console.error('Failed to add item');
			}
		} catch (error) {
			console.error('Failed to add items');
		} finally {
			isEditing = false;
		}
	}

	async function handleAddItem() {
		isLoading = true;
		try {
			const response = await fetch('http://localhost:8000/api/items', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${data.token}`
				},
				body: JSON.stringify({
					name,
					description,
					sku,
					quantity
				})
			});

			if (response.ok) {
				open = false;
				resetAddForm();
				await invalidateAll();
			} else {
				if (response.status === 401) {
					console.error('Unauthorized');
				}
				console.error('Failed to add item');
			}
		} catch (error) {
			console.error('Failed to add items');
		} finally {
			isLoading = false;
		}
	}

	async function handleDeleteItem(id: number) {
		if (!confirm('Are you sure you want to delete this item?')) return;

		try {
			const response = await fetch(`http://localhost:8000/api/items/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${data.token}`
				}
			});

			if (response.ok) {
				await invalidateAll();
			} else {
				if (response.status === 401) {
					console.error('Unauthorized');
				}
				console.error('Failed to delete item');
			}
		} catch (error) {
			console.error('Failed to delete item');
		}
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Inventory List</h1>
			<p class="text-muted-foreground">Manage your items here.</p>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-3">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Description>Total Items</Card.Description>
				<Card.Title class="text-4xl">{data.items.length}</Card.Title>
			</Card.Header>
		</Card.Root>
	</div>

	<div class="space-y-2">
		<Dialog.Root bind:open>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button {...props}>Add Item</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title class="text-xl font-bold">Add Item</Dialog.Title>
					<Dialog.Description>Add a new item to your inventory.</Dialog.Description>
				</Dialog.Header>

				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label for="name">Name</Label>
						<Input id="name" bind:value={name} />
					</div>
					<div class="grid gap-2">
						<Label for="sku">SKU</Label>
						<Input id="sku" bind:value={sku} />
					</div>
					<div class="grid gap-2">
						<Label for="quantity">Quantity</Label>
						<Input type="number" id="quantity" bind:value={quantity} />
					</div>
					<div class="grid gap-2">
						<Label for="description">Description</Label>
						<Textarea id="description" bind:value={description} />
					</div>
				</div>

				<Dialog.Footer>
					<Button type="submit" variant="default" onclick={handleAddItem} disabled={isLoading}>
						{isLoading ? 'Adding...' : 'Add'}
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>

		<Card.Root>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Description</Table.Head>
						<Table.Head>SKU</Table.Head>
						<Table.Head class="text-right">Quantity</Table.Head>
						<Table.Head class="text-center">Action</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.items as item}
						<Table.Row>
							<Table.Cell class="font-medium">{item.name}</Table.Cell>
							<Table.Cell>{item.description ? item.description : '-'}</Table.Cell>
							<Table.Cell>{item.sku}</Table.Cell>
							<Table.Cell class="text-right">{item.quantity}</Table.Cell>
							<Table.Cell class="text-center">
								<Button
									variant="outline"
									onclick={() => openEditModal(item)}
									size="sm"
									class="hover:cursor-pointer">Edit</Button
								>

								{#if user.role === 'ADMIN'}
									<Button
										variant="destructive"
										onclick={() => handleDeleteItem(item.id)}
										size="sm"
										class="hover:cursor-pointer">Delete</Button
									>
								{/if}
							</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell>No items found</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>

			<div class="flex items-center justify-between border-t p-4">
				<div class="text-sm text-muted-foreground">
					Page <strong>{data.pagination.current_page}</strong> of
					<strong>{data.pagination.total_pages}</strong>
				</div>

				<div class="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						href="?page={pagination.current_page - 1}"
						disabled={pagination.current_page <= 1}
						class="hover:cursor-pointer">Previous</Button
					>

					<div class="hidden gap-1 md:flex">
						{#each pages as page}
							<Button
								variant={page === pagination.current_page ? 'default' : 'outline'}
								size="sm"
								href="?page={page}"
								class="hover:cursor-pointer">{page}</Button
							>
						{/each}
					</div>

					<Button
						variant="outline"
						size="sm"
						href="?page={pagination.current_page + 1}"
						disabled={pagination.current_page >= pagination.total_pages}
						class="hover:cursor-pointer">Next</Button
					>
				</div>
			</div>
		</Card.Root>

		<Dialog.Root bind:open={editOpen}>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title class="text-xl font-bold">Edit Item</Dialog.Title>
					<Dialog.Description>Edit an item in your inventory.</Dialog.Description>
				</Dialog.Header>

				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label for="name">Name</Label>
						<Input id="name" bind:value={selectedItem.name} />
					</div>
					<div class="grid gap-2">
						<Label for="sku">SKU</Label>
						<Input id="sku" bind:value={selectedItem.sku} />
					</div>
					<div class="grid gap-2">
						<Label for="quantity">Quantity</Label>
						<Input type="number" id="quantity" bind:value={selectedItem.quantity} />
					</div>
					<div class="grid gap-2">
						<Label for="description">Description</Label>
						<Textarea id="description" bind:value={selectedItem.description} />
					</div>
				</div>

				<Dialog.Footer>
					<Button type="submit" variant="default" onclick={handleUpdateItem} disabled={isLoading}>
						{isLoading ? 'Updating...' : 'Update'}
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</div>
</div>
