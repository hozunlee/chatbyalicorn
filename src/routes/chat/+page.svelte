<script>
	import Chat from './Chat.svelte'

	const { data } = $props()
</script>

<Chat rooms={data.roomList} userList={data.userList} />
