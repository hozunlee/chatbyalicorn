<script>
	// import { mailStore } from '../store.js'
	import { formatTimeAgo } from '$lib/utils.js'
	import { cn } from '$lib/utils.js'
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js'
	import * as Avatar from '$lib/components/ui/avatar/index.js'

	let { items } = $props()
</script>

<ScrollArea class="h-screen">
	<div class="flex flex-col gap-2 p-4 pt-0">
		{#each items as item}
			<!-- 채팅방 연결 on:click 추가 -->
			<button
				class={cn(
					'hover:bg-accent flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all'
					// $mailStore.selected === item.id && "bg-muted"
				)}
			>
				<div class="flex w-full flex-col gap-1">
					<div class="flex items-center">
						<Avatar.Root class="mr-1 size-5">
							<Avatar.Image src={item.profileImage} alt={`${item.name} img`} />
							<Avatar.Fallback>AC</Avatar.Fallback>
						</Avatar.Root>
						<div class="flex items-center gap-2">
							<div class="font-semibold">{item.name}</div>
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
					{item.lastMessage ? item.lastMessage.substring(0, 300) : 'No messages yet'}
				</div>
			</button>
		{/each}
	</div>
</ScrollArea>
