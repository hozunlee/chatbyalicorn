<script>
	import Check from 'lucide-svelte/icons/check'
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down'
	import { tick } from 'svelte'
	import * as Command from '$lib/components/ui/command/index.js'
	import * as Popover from '$lib/components/ui/popover/index.js'
	import { Button } from '$lib/components/ui/button/index.js'
	import { cn } from '$lib/utils.js'
	import { socket } from '$lib/socket_client'
	import AvatarLogo from '../avatar/AvatarLogo.svelte'

	let { userList } = $props()

	let open = $state(false)
	let value = $state('')

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.

	/** @param {string} triggerId */
	function closeAndFocusTrigger(triggerId) {
		open = false
		tick().then(() => {
			document.getElementById(triggerId)?.focus()
		})
	}
</script>

<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={open}
			class="w-[200px] justify-between"
		>
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0">
		<Command.Root>
			<Command.Input placeholder="대화상대 초대" />
			<Command.Empty>유저 이름을 찾을 수 없어요.</Command.Empty>
			<Command.Group>
				{#each userList as user}
					<Command.Item
						value={String(user.id)}
						onSelect={(currentValue) => {
							value = currentValue
							socket.join(Number(currentValue))
							closeAndFocusTrigger(ids.trigger)
						}}
					>
						<AvatarLogo item={user} />
						<Check class={cn('mr-2 h-4 w-4', value !== String(user.id) && 'text-transparent')} />
						{user.name}
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
