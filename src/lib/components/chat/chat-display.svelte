<script>
	import AvatarLogo from '$lib/components/ui/avatar/AvatarLogo.svelte'

	import { Button } from '$lib/components/ui/button/index.js'

	import { Separator } from '$lib/components/ui/separator/index.js'

	import Input from '$lib/components/ui/input/input.svelte'
	import { socket } from '$lib/socket_client'
	import ChatList from './chat-list.svelte'

	import { onMount } from 'svelte'
	import { Search } from 'lucide-svelte'

	let { roomInfo, isMobile = false } = $props()
	console.log('🚀 ~ roomInfo:', roomInfo)

	// 메시지 컨테이너 요소에 대한 참조 추가
	let messageContainer = $state()

	// 검색창 표시 여부
	let showSearch = $state(false)

	// 검색어
	let searchTerm = $state('')

	// 메시지 목록이나 선택된 채팅방이 변경될 때마다 스크롤 이동
	$effect(() => {
		if (messageList.length > 0) {
			setTimeout(scrollToBottom, 100)
		}
	})

	// 스크롤을 맨 아래로 이동하는 함수
	function scrollToBottom() {
		if (messageContainer) {
			messageContainer.scrollTop = messageContainer.scrollHeight
		}
	}

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
		newMessage = ''
		// 소켓을 통해 메시지 전송
		socket.emit('send_message', messageData, () => {})
	}

	/**
	 * 메시지 객체를 나타냅니다.
	 *
	 * @typedef {Object} Message
	 * @property {string} id - 메시지의 고유 식별자.
	 * @property {string} content - 메시지 내용.
	 * @property {string} createdAt - 메시지 생성 시각 (ISO 8601 형식).
	 * @property {number} senderId - 메시지를 보낸 사용자의 식별자.
	 * @property {string} roomId - 메시지가 속한 방의 식별자.
	 * @property {boolean} isMyMessage - 해당 메시지가 나의 메시지인지 여부.
	 */

	/**
	 * 새로운 메시지를 처리합니다.
	 *
	 * @param {Message} newMsg
	 * @returns {void}
	 */
	function handleNewMessage(newMsg) {
		if (newMsg.roomId === roomId) {
			// 내 메세지 인지 상대 메세지인지 확인
			newMsg.isMyMessage = newMsg.senderId !== partner.id

			messageList = [...messageList, newMsg]

			setTimeout(scrollToBottom, 100)
		}
	}

	// 검색 토글 함수
	function toggleSearch() {
		showSearch = !showSearch
		if (!showSearch) {
			searchTerm = '' // 검색창을 닫을 때 검색어 초기화
		} else {
			// 검색창이 표시되면 포커스 주기
			setTimeout(() => {
				document.getElementById('chat-search-input')?.focus()
			}, 0)
		}
	}

	onMount(() => {
		if (socket.isConnected) {
			socket.on('new_message', handleNewMessage)
		}
	})
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

				<!-- 검색 버튼 추가 -->
				<Button variant="ghost" size="icon" on:click={toggleSearch} class="ml-auto">
					<Search class="h-4 w-4" />
				</Button>
			</div>

			<!-- 검색창 영역 (토글 가능) -->
			{#if showSearch}
				<div class="bg-muted/30 sticky top-0 z-10 px-4 py-2">
					<div class="relative">
						<Search
							class="text-muted-foreground absolute top-[50%] left-3 h-4 w-4 translate-y-[-50%]"
						/>
						<Input
							id="chat-search-input"
							type="text"
							placeholder="채팅 내용 검색..."
							class="pl-10"
							bind:value={searchTerm}
						/>
					</div>
				</div>
			{/if}

			<Separator />

			<div
				class="flex-1 overflow-y-auto p-4 text-sm whitespace-pre-wrap"
				bind:this={messageContainer}
			>
				{#if messageList.length > 0}
					<ChatList {messageList} {searchTerm} />
				{/if}
			</div>
			<Separator class="mt-auto" />
			<!-- 메시지 입력 영역 -->
			<div class="p-4">
				<form
					onsubmit={(e) => {
						e.preventDefault()
						sendMessage()
					}}
				>
					<div class="flex items-center gap-2">
						<Input
							type="text"
							class="flex-1 p-2"
							placeholder="메시지를 입력하세요..."
							bind:value={newMessage}
							onKeyDown={(e) => {
								// Shift + Enter는 줄바꿈, Enter는 전송
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault()
									sendMessage()
								}
							}}
						/>
						<Button type="button" onClick={sendMessage} size="sm" disabled={!newMessage.trim()}>
							전송
						</Button>
					</div>
				</form>
			</div>
		</div>
	{:else}
		<div class="text-muted-foreground p-8 text-center">대화를 시작해볼까요</div>
	{/if}
</div>
