<script>
	import AvatarLogo from '$lib/components/ui/avatar/AvatarLogo.svelte'
	import { formatTimeAgo } from '$lib/utils.js'
	import { cn } from '$lib/utils.js'
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js'
	import { socket } from '$lib/socket_client'
	import { onMount } from 'svelte'

	let { items } = $props()
</script>

<ScrollArea class="h-screen">
	<div class="flex flex-col gap-2 p-4 pt-0">
		{#each items as item}
			<!-- 채팅방 연결 on:click 추가 -->
			<button
				onclick={() => socket.join(Number(item.partner.id))}
				class={cn(
					'hover:bg-accent flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all'
					// $mailStore.selected === item.id && "bg-muted"
				)}
			>
				<div class="flex w-full flex-col gap-1">
					<div class="flex items-center">
						<AvatarLogo item={item.partner} />
						<div class="flex items-center gap-2">
							<div class="font-semibold">{item.partner.name}</div>
							<!-- {#if !item.read}
								<span class="flex h-2 w-2 rounded-full bg-blue-600" />
							{/if} -->
						</div>
						<div
							class={cn(
								'ml-auto text-xs'
								// $mailStore.selected === item.id ? 'text-foreground' : 'text-muted-foreground'
							)}
						>
							{formatTimeAgo(new Date(item.updatedAt))}
						</div>
					</div>
					<!-- <div class="text-xs font-medium">{item.subject}</div> -->
				</div>
				<div class="text-muted-foreground line-clamp-2 text-xs">
					{item.lastMessage ? item.lastMessage.content.substring(0, 10) : 'No messages yet'}
				</div>
			</button>
		{/each}
	</div>
</ScrollArea>
