<script>
	let { data } = $props()

	import { Button } from '$lib/components/ui/button'
	import Input from '$lib/components/ui/input/input.svelte'
</script>

<h1>Welcome to 알리콘 chat</h1>

<h2>{data.userName} 님</h2>
