<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Sheet from '$lib/components/ui/sheet';
	import { logout } from '$lib/api';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';

	let user = $derived(page.data.user);
	let isMobileMenuOpen = $state(false);

	const navItems = [
		{ name: 'User Management', href: '/admin/users' },
		{ name: 'Roles', href: '/admin/roles' },
		{ name: 'Permissions', href: '/admin/permissions' }
	];

	function handleNavigate(path: string) {
		isMobileMenuOpen = false;
		goto(path);
	}
</script>

<nav class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<div class="flex items-center gap-8">
				{#if user?.role === 'ADMIN'}
					<div class="md:hidden">
						<Sheet.Root bind:open={isMobileMenuOpen}>
							<Sheet.Trigger>
								{#snippet child({ props })}
									<Button variant="ghost" size="icon" {...props}>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											><line x1="4" x2="20" y1="12" y2="12" /><line
												x1="4"
												x2="20"
												y1="6"
												y2="6"
											/><line x1="4" x2="20" y1="18" y2="18" /></svg
										>
									</Button>
								{/snippet}
							</Sheet.Trigger>
							<Sheet.Content side="left" class="w-72">
								<div class="flex flex-col gap-6 py-4">
									<a
										href="/dashboard"
										onclick={() => (isMobileMenuOpen = false)}
										class="flex items-center gap-2 px-2 text-xl font-bold text-primary"
									>
										InventoryApp
									</a>
									<nav class="flex flex-col gap-2">
										{#each navItems as item}
											<a
												href={item.href}
												onclick={() => (isMobileMenuOpen = false)}
												class={cn(
													'mx-1 flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
													page.url.pathname === item.href
														? 'bg-primary text-primary-foreground'
														: 'text-muted-foreground hover:bg-accent'
												)}
											>
												{item.name}
											</a>
										{/each}
									</nav>
								</div>
							</Sheet.Content>
						</Sheet.Root>
					</div>
				{/if}

				<a href="/dashboard" class="text-xl font-bold tracking-tight text-primary">
					InventoryApp
				</a>

				{#if user?.role === 'ADMIN'}
					<div class="hidden items-center gap-6 md:flex">
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
					</div>
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
									<Avatar.Fallback class="font-bold">
										{user?.username ? user.username[0].toUpperCase() : '?'}
									</Avatar.Fallback>
								</Avatar.Root>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end" class="w-48">
								<DropdownMenu.Label>My Account</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<DropdownMenu.Item onclick={() => handleNavigate('/profile')}
									>Profile</DropdownMenu.Item
								>
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
