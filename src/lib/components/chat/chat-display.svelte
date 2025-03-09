<script>
	import AvatarLogo from '$lib/components/ui/avatar/AvatarLogo.svelte'

	import { Button } from '$lib/components/ui/button/index.js'

	import { Separator } from '$lib/components/ui/separator/index.js'

	import Input from '$lib/components/ui/input/input.svelte'
	import { socket } from '$lib/socket_client'
	import ChatList from './chat-list.svelte'

	import { onMount } from 'svelte'
	import { dev } from '$app/environment'

	onMount(() => {
		if (socket.isConnected) {
			socket.on('new_message', handleNewMessage)
		}
	})

	let { roomInfo } = $props()

	const { partner, messages, id: roomId } = roomInfo

	let messageList = $state(messages || [])
	let newMessage = $state('')

	// 메시지 전송
	function sendMessage() {
		if (!newMessage.trim() || !roomId) return

		const messageData = {
			roomId: roomId,
			content: newMessage.trim(),
			timestamp: new Date().toISOString()
		}

		// 낙관적 UI 업데이트 (전송 중 메시지 표시)
		const tempId = `temp_${Date.now()}`
		const tempMessage = {
			id: tempId,
			content: newMessage.trim(),
			createdAt: new Date().toISOString(),
			senderId: 1,
			isMyMessage: true,
			status: 'sending',
			roomId: roomId // roomId 추가
		}

		messageList = [...messageList, tempMessage]
		newMessage = ''

		// 소켓을 통해 메시지 전송
		socket.emit('send_message', messageData)
	}

	// 새 메시지 처리
	function handleNewMessage(newMsg) {
		if (dev) console.log('🚀 chat-display ~ 새로 받은 메세지:', newMsg)

		console.log(newMsg.roomId, roomId)
		// 받은 메시지의 roomId와 현재 방의 roomId가 같은 경우에만 처리
		if (newMsg.roomId === roomId) {
			messageList = [...messageList, newMsg]
		}
	}

	function handleKeyDown(e) {
		// Shift + Enter는 줄바꿈, Enter는 전송
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			sendMessage()
		}
	}
</script>

<div class="flex h-full flex-col">
	<Separator />
	{#if partner}
		<div class="flex h-full flex-1 flex-col overflow-hidden">
			<div class="flex items-start p-4">
				<div class="flex items-start gap-1 text-sm">
					<AvatarLogo item={partner} />
					<div class="grid gap-1">
						<div class="font-semibold">{partner.name}</div>
					</div>
				</div>
			</div>
			<Separator />

			<div class="flex-1 overflow-y-auto p-4 text-sm whitespace-pre-wrap">
				{#if messageList.length > 0}
					<ChatList {messageList} />
				{/if}
			</div>
			<Separator class="mt-auto" />
			<!-- 메시지 입력 영역 -->
			<div class="p-4">
				<form onsubmit={sendMessage}>
					<div class="flex items-center gap-2">
						<Input
							type="text"
							class="flex-1 p-2"
							placeholder="메시지를 입력하세요..."
							bind:value={newMessage}
							on:keydown={handleKeyDown}
						/>
						<Button type="submit" size="sm" disabled={!newMessage.trim()}>전송</Button>
					</div>
				</form>
			</div>
		</div>
	{:else}
		<div class="text-muted-foreground p-8 text-center">대화를 시작해볼까요</div>
	{/if}
</div>
