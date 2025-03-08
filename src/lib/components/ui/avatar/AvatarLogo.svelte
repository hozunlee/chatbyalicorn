<script>
	import * as Avatar from '$lib/components/ui/avatar/index.js'

	const { item } = $props()
</script>

<Avatar.Root class="mr-1 size-5">
	<Avatar.Image src={item.profileImage} alt={`${item.name} img`} />
	<Avatar.Fallback>AC</Avatar.Fallback>
</Avatar.Root>
