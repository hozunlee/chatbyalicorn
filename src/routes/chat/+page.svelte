<script>
	import { Button } from '$lib/components/ui/button'
	import Combobox from '$lib/components/ui/combobox/combobox.svelte'
	import Chat from './Chat.svelte'

	let { data } = $props()

	let isNewChat = $state(false)
</script>

<h1>Welcome to 알리콘 chat</h1>

<h2>{data.userName} 님</h2>

<div>
	<section>
		<Button on:click={() => (isNewChat = !isNewChat)}>새로운 채팅</Button>
		{#if isNewChat}
			<Combobox userList={data.userList} />
		{/if}
	</section>

	<Chat rooms={data.roomList} />
</div>
