<script>
	import { formatDate } from '$lib/utils'

	const { messageList } = $props()
</script>

<div class="flex flex-col space-y-4 p-2">
	{#each messageList as message (message.id)}
		<div class="flex {message.isMyMessage ? 'justify-end' : 'justify-start'}">
			<div
				class="max-w-[60%] rounded-lg px-4 py-1 {message.isMyMessage
					? 'bg-primary text-primary-foreground rounded-br-none'
					: 'bg-muted text-foreground rounded-bl-none'}"
			>
				<p class="break-words">{message.content}</p>
				<div class=" flex justify-end text-xs opacity-70">
					<span> {formatDate(message.createdAt)} </span>
				</div>
			</div>
		</div>
	{/each}
</div>
