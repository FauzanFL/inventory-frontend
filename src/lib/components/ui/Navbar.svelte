<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { logout } from '$lib/api';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';

	let user = $derived(page.data.user);

	function gotoProfile() {
		goto('/profile');
	}

	const navItems = [
		{ name: 'User Management', href: '/admin/users' },
		{ name: 'Roles', href: '/admin/roles' },
		{ name: 'Permissions', href: '/admin/permissions' }
	];
</script>

<nav class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<div class="flex items-center gap-8">
				<a href="/dashboard" class="text-xl font-bold tracking-tight text-primary">
					InventoryApp
				</a>

				{#if user?.role === 'ADMIN'}
					{#each navItems as item}
						<a
							href={item.href}
							class={cn(
								'text-sm font-medium transition-colors',
								page.url.pathname === item.href
									? 'text-primary'
									: 'text-muted-foreground hover:text-accent-foreground'
							)}>{item.name}</a
						>
					{/each}
				{/if}
			</div>
			<div class="flex items-center gap-4">
				{#if user}
					<div class="flex items-center gap-3">
						<div class="hidden text-right sm:block">
							<p class="text-sm leading-none font-medium">{user?.username}</p>
							<p class="text-xs text-muted-foreground uppercase">{user?.role}</p>
						</div>

						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<Avatar.Root class="h-9 w-9 cursor-pointer border">
									<Avatar.Fallback class="font-bold"
										>{user?.username ? user.username[0].toUpperCase() : '?'}</Avatar.Fallback
									>
								</Avatar.Root>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end" class="w-48">
								<DropdownMenu.Label>My Account</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<DropdownMenu.Item onclick={gotoProfile}>Profile</DropdownMenu.Item>
								<DropdownMenu.Item
									onclick={logout}
									class="!focus:text-destructive-foreground cursor-pointer text-destructive focus:bg-destructive"
									>Logout</DropdownMenu.Item
								>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				{:else}
					<Button href="/login" variant="default" size="sm">Login</Button>
				{/if}
			</div>
		</div>
	</div>
</nav>
