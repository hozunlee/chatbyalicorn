<script>
	import { userName } from './../lib/store.js'
	import '../app.css'
	let { children, data } = $props()

	import { onMount } from 'svelte'
	import { socket } from '$lib/socket_client.js'

	onMount(() => {
		socket.connect()

		socket.on('connect', () => {
			console.log('🧑🏾‍💻 Socket connected')
		})

		socket.on('disconnect', () => {
			console.log('🧑🏾‍💻 Socket disconnected')
		})
		return () => {
			socket.disconnect()
		}
	})

	$effect(() => {
		if (data.userName) {
			userName.set(data.userName)
		}
	})
</script>

{@render children()}
