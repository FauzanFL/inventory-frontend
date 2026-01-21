<script lang="ts">
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { invalidateAll } from '$app/navigation';

	let { users, pagination, token } = $derived(page.data);

	let pages = $derived(Array.from({ length: pagination.total_pages }, (_, i) => i + 1));

	$effect(() => {
		if (!openChangePassword) {
			resetNewPassword();
		}
	});

	let open = $state(false);
	let username = $state('');
	let email = $state('');
	let password = $state('');
	let password2 = $state('');
	let isLoading = $state(false);

	let editOpen = $state(false);
	let confirmOpen = $state(false);
	let roleOpen = $state(false);
	let isEditing = $state(false);
	let isFetchingRole = $state(false);
	let deletionId = $state(0);

	let openChangePassword = $state(false);
	let newPassword = $state('');
	let newPassword2 = $state('');

	let roles: { id: number; name: string }[] = $state([]);

	let selectedUser = $state({
		id: 0,
		username: '',
		email: '',
		role_id: 0
	});

	function resetAddForm() {
		username = '';
		email = '';
		password = '';
		password2 = '';
	}

	function resetNewPassword() {
		newPassword = '';
		newPassword2 = '';
	}

	function resetSelectedUser() {
		selectedUser = {
			id: 0,
			username: '',
			email: '',
			role_id: 0
		};
	}

	async function handleAddUser() {
		if (password !== password2) {
			toast.error('Passwords do not match');
			return;
		}

		isLoading = true;
		try {
			const response = await fetch('http://localhost:8000/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					username,
					email,
					password
				})
			});

			if (response.ok) {
				open = false;
				resetAddForm();
				await invalidateAll();
				toast.success('User added successfully!');
			} else {
				if (response.status === 401) {
					toast.error('Unauthorized');
				}
				const errorData = await response.json();
				toast.error('Failed to add user:' + errorData.detail || response.statusText);
			}
		} catch (error) {
			toast.error('Failed to add user');
		} finally {
			isLoading = false;
		}
	}

	function openEditModal(u: any) {
		selectedUser = u;
		editOpen = true;
	}

	async function handleUpdateUser() {
		isEditing = true;
		try {
			const response = await fetch(`http://localhost:8000/api/users/${selectedUser.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					username: selectedUser.username,
					email: selectedUser.email
				})
			});

			if (response.ok) {
				editOpen = false;
				resetSelectedUser();
				await invalidateAll();
				toast.success('User updated successfully!');
			} else {
				if (response.status === 401) {
					toast.error('Unauthorized');
				}
				toast.error('Failed to update user');
			}
		} catch (error) {
			toast.error('Failed to update user');
		} finally {
			isEditing = false;
		}
	}

	function confirmDelete(id: number) {
		deletionId = id;
		confirmOpen = true;
	}

	async function handleDeleteUser() {
		isLoading = true;
		try {
			const response = await fetch(`http://localhost:8000/api/users/${deletionId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			if (response.ok) {
				confirmOpen = false;
				resetSelectedUser();
				await invalidateAll();
				toast.success('User deleted successfully!');
			} else {
				if (response.status === 401) {
					toast.error('Unauthorized');
				}
				toast.error('Failed to delete user');
			}
		} catch (error) {
			toast.error('Failed to delete user');
		} finally {
			isLoading = false;
		}
	}

	async function openRoleModal(u: any) {
		selectedUser = u;
		roleOpen = true;
		isFetchingRole = true;

		try {
			const response = await fetch('http://localhost:8000/api/roles', {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			if (response.ok) {
				const data = await response.json();
				roles = data.roles;
			} else {
				if (response.status === 401) {
					toast.error('Unauthorized');
				}
				toast.error('Failed to fetch roles');
			}
		} catch (error) {
			toast.error('Failed to fetch roles');
		} finally {
			isFetchingRole = false;
		}
	}

	async function handleUpdateUserRole(roleId: number) {
		if (!roleId) {
			toast.error('Please select a role');
			return;
		}

		isLoading = true;

		try {
			const response = await fetch(
				`http://localhost:8000/api/roles/${roleId}/users/${selectedUser.id}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					}
				}
			);

			if (response.ok) {
				roleOpen = false;
				resetSelectedUser();
				await invalidateAll();
				toast.success('Role updated successfully!');
			} else {
				if (response.status === 401) {
					toast.error('Unauthorized');
				}
				toast.error('Failed to update role');
			}
		} catch (error) {
			toast.error('Failed to update role');
		} finally {
			roleId = 0;
			isLoading = false;
		}
	}

	function openChangePasswordModal(u: any) {
		selectedUser = u;
		openChangePassword = true;
	}

	async function handleUpdateUserPassword() {
		if (!newPassword) {
			toast.error('Please enter a new password');
			return;
		}

		if (newPassword !== newPassword2) {
			toast.error('Passwords do not match');
			return;
		}

		isEditing = true;
		try {
			const response = await fetch(`http://localhost:8000/api/users/${selectedUser.id}/password`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					password: newPassword
				})
			});

			if (response.ok) {
				openChangePassword = false;
				resetSelectedUser();
				resetNewPassword();
				await invalidateAll();
				toast.success('Password updated successfully!');
			} else {
				if (response.status === 401) {
					toast.error('Unauthorized');
				}
				toast.error('Failed to update password');
			}
		} catch (error) {
			toast.error('Failed to update password');
		} finally {
			isEditing = false;
		}
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">User Management</h1>
			<p class="text-muted-foreground">Manage your users here.</p>
		</div>
	</div>

	<div class="space-y-2">
		<Dialog.Root bind:open>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button {...props}>Add User</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title class="text-xl font-bold">Add User</Dialog.Title>
					<Dialog.Description>Add a new user.</Dialog.Description>
				</Dialog.Header>

				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label for="username">Username</Label>
						<Input id="username" bind:value={username} />
					</div>
					<div class="grid gap-2">
						<Label for="email">Email</Label>
						<Input type="email" id="email" bind:value={email} />
					</div>
					<div class="grid gap-2">
						<Label for="password">Password</Label>
						<Input type="password" id="password" bind:value={password} />
					</div>
					<div class="grid gap-2">
						<Label for="password2">Confirm Password</Label>
						<Input type="password" id="password2" bind:value={password2} />
					</div>
				</div>

				<Dialog.Footer>
					<Button type="submit" variant="default" onclick={handleAddUser} disabled={isLoading}>
						{isLoading ? 'Adding...' : 'Add'}
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>

		<Card.Root>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="font-bold">Username</Table.Head>
							<Table.Head class="font-bold">Email</Table.Head>
							<Table.Head class="font-bold">Role</Table.Head>
							<Table.Head class="text-center font-bold">Action</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each users as u}
							<Table.Row>
								<Table.Cell>{u.username}</Table.Cell>
								<Table.Cell>{u.email}</Table.Cell>
								<Table.Cell class="font-semibold">{u.role?.name}</Table.Cell>
								<Table.Cell class="text-center">
									<DropdownMenu.Root>
										<DropdownMenu.Trigger>
											{#snippet child({ props })}
												<Button {...props} variant="outline" size="sm">Manage</Button>
											{/snippet}
										</DropdownMenu.Trigger>
										<DropdownMenu.Content>
											<DropdownMenu.Item onclick={() => openEditModal(u)}
												>Edit User</DropdownMenu.Item
											>
											<DropdownMenu.Item onclick={() => openRoleModal(u)}
												>Change Role</DropdownMenu.Item
											>
											<DropdownMenu.Item onclick={() => openChangePasswordModal(u)}
												>Reset Password</DropdownMenu.Item
											>
											<DropdownMenu.Item
												onclick={() => confirmDelete(u.id)}
												class="!focus:text-destructive-foreground cursor-pointer text-destructive
												focus:bg-destructive">Delete</DropdownMenu.Item
											>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
			<Card.Footer class="flex items-center justify-between border-t p-4">
				<div class="text-sm text-muted-foreground">
					Page <strong>{pagination.current_page}</strong> of
					<strong>{pagination.total_pages}</strong>
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
			</Card.Footer>
		</Card.Root>
	</div>

	<!-- Edit User Modal -->
	<Dialog.Root bind:open={editOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title class="text-xl font-bold">Edit User</Dialog.Title>
				<Dialog.Description>Edit a user.</Dialog.Description>
			</Dialog.Header>

			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label for="username">Username</Label>
					<Input id="username" bind:value={selectedUser.username} />
				</div>
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input type="email" id="email" bind:value={selectedUser.email} />
				</div>
			</div>

			<Dialog.Footer>
				<Button type="submit" variant="default" onclick={handleUpdateUser} disabled={isEditing}>
					{isEditing ? 'Updating...' : 'Update'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Delete User Modal -->
	<AlertDialog.Root bind:open={confirmOpen}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title class="text-xl font-bold">Delete User</AlertDialog.Title>
				<AlertDialog.Description>Are you sure you want to delete this user?</AlertDialog.Description
				>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<Button type="submit" variant="destructive" onclick={handleDeleteUser} disabled={isEditing}>
					{isLoading ? 'Deleting...' : 'Yes, Delete!'}
				</Button>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>

	<!-- Change Role Modal -->
	<Dialog.Root bind:open={roleOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title class="text-xl font-bold">Change Role</Dialog.Title>
				<Dialog.Description>Change a user's role.</Dialog.Description>
			</Dialog.Header>

			<div class="grid max-h-50 gap-2 overflow-auto rounded-md border p-2">
				{#if isFetchingRole}
					<p>Loading...</p>
				{:else}
					{#each roles as role}
						<Button
							variant={role.id === selectedUser.role_id ? 'default' : 'outline'}
							class="flex items-center justify-between text-lg"
							onclick={() => handleUpdateUserRole(role.id)}
							disabled={selectedUser.role_id === role.id}
						>
							{role.name}
							{#if selectedUser.role_id === role.id}
								<span class="text-xs font-normal opacity-70">(Selected)</span>
							{/if}
						</Button>
					{/each}
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Change Password Modal -->
	<Dialog.Root bind:open={openChangePassword}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title class="text-xl font-bold">Change Password</Dialog.Title>
				<Dialog.Description>Change a user's password.</Dialog.Description>
			</Dialog.Header>

			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label for="newPassword">Password</Label>
					<Input type="password" id="newPassword" bind:value={newPassword} />
				</div>
				<div class="grid gap-2">
					<Label for="newPassword2">Confirm Password</Label>
					<Input type="password" id="newPassword2" bind:value={newPassword2} />
				</div>
			</div>

			<Dialog.Footer>
				<Button
					type="submit"
					variant="default"
					onclick={handleUpdateUserPassword}
					disabled={isEditing}
				>
					{isEditing ? 'Updating...' : 'Update'}
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
