<script>
	const { messageList } = $props()
</script>

<div class="flex flex-col space-y-4 p-2">
	{#each messageList as message (message.id)}
		<div class="flex {message.isMyMessage ? 'justify-end' : 'justify-start'}">
			<div
				class="max-w-[70%] rounded-lg px-4 py-2 {message.isMyMessage
					? 'bg-primary text-primary-foreground rounded-br-none'
					: 'bg-muted text-foreground rounded-bl-none'}"
			>
				<p class="break-words">{message.content}</p>
				<div class="mt-1 flex justify-end text-xs opacity-70">
					<span>
						{new Date(message.createdAt).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit'
						})}
					</span>
				</div>
			</div>
		</div>
	{/each}
</div>
