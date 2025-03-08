<script>
	import { DateFormatter, getDayOfWeek, getLocalTimeZone, now } from '@internationalized/date'

	import * as Avatar from '$lib/components/ui/avatar/index.js'
	import { Button } from '$lib/components/ui/button/index.js'

	import { Separator } from '$lib/components/ui/separator/index.js'
	import { Textarea } from '$lib/components/ui/textarea/index.js'

	import { selectedChatRoom } from '$lib/store.js'
	import { derived } from 'svelte/store'

	let { chats } = $props()

	// partner 속성만 추출한 파생 스토어 생성
	const partner = derived(selectedChatRoom, ($room) => $room?.partner || null)
	console.log('🚀 ~ partner:', $partner)

	const fullFormatter = new DateFormatter('en-US', {
		dateStyle: 'medium',
		timeStyle: 'medium'
	})

	const relativeFormatter = new DateFormatter('en-US', {
		weekday: 'short',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h12'
	})
	let todayDate = now(getLocalTimeZone())

	function getClosestWeekend() {
		const dayOfWeek = getDayOfWeek(todayDate, 'en-US')
		if (dayOfWeek === 6) {
			return todayDate.toDate()
		}
		return todayDate.add({ days: 6 - dayOfWeek }).toDate()
	}
</script>

<div class="flex h-full flex-col">
	<Separator />
	{#if $partner}
		<div class="flex h-full flex-1 flex-col overflow-hidden">
			<div class="flex items-start p-4">
				<div class="flex items-start gap-4 text-sm">
					<div class="grid gap-1">
						<div class="font-semibold">{$partner.name}</div>
					</div>
				</div>
				<!-- {#if mail.date}
					<div class="text-muted-foreground ml-auto text-xs">
						{fullFormatter.format(new Date(mail.date))}
					</div>
				{/if} -->
			</div>
			<Separator />
			대화창
			<div class="flex-1 overflow-y-auto p-4 text-sm whitespace-pre-wrap">
				<!-- {mail.text} -->
			</div>
			<Separator class="mt-auto" />
			<div class="p-4">
				<form>
					<div class="grid gap-4">
						<Textarea class="p-4" placeholder={`메세지`} />
						<div class="flex items-center">
							<Button size="sm" class="ml-auto">Send</Button>
						</div>
					</div>
				</form>
			</div>
		</div>
	{:else}
		<div class="text-muted-foreground p-8 text-center">No message selected</div>
	{/if}
</div>
