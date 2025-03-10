<script>
	import { onMount } from 'svelte'
	import { dev } from '$app/environment'
	import { goto } from '$app/navigation'

	import { userName } from '$lib/store.js'
	import { socket } from '$lib/socket_client'

	import LoaderCircle from 'lucide-svelte/icons/loader-circle'

	import Combobox from '$lib/components/ui/combobox/combobox.svelte'
	import RoomList from '$lib/components/chat/room-list.svelte'
	import * as Resizable from '$lib/components/ui/resizable/index.js'
	import { Separator } from '$lib/components/ui/separator'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import ChatDisplay from '$lib/components/chat/chat-display.svelte'
	import { Button } from '$lib/components/ui/button'

	let { rooms, userList } = $props()

	let isNewChat = $state(false)
	let isConnected = $state(false)

	/** @type {ChatRoomItem[]} */
	let roomList = $state(rooms)

	/**
	 * @typedef {Object} User
	 * @property {number} id - 사용자 고유 ID
	 * @property {string} name - 사용자 이름
	 * @property {string} [profileImage] - 사용자 프로필 이미지 URL
	 */

	/**
	 * 사용자 파트너를 나타냅니다.
	 *
	 * @typedef {Object} Partner
	 * @property {number} id - 파트너의 고유 식별자.
	 * @property {string} name - 파트너의 이름.
	 * @property {string} profileImage - 파트너의 프로필 이미지 URL.
	 */

	/**
	 * 대화방의 마지막 메시지 정보입니다.
	 *
	 * @typedef {Object} LastMessage
	 * @property {string} id - 메시지 ID
	 * @property {string} content - 메시지 내용
	 * @property {string} createdAt - 생성 시각
	 * @property {number} senderId - 보낸 사람 ID
	 */

	/**
	 * 채팅방 항목을 나타냅니다.
	 *
	 * @typedef {Object} ChatRoomItem
	 * @property {string} id - 대화방 ID
	 * @property {User} partner - 대화 상대방 정보
	 * @property {LastMessage | null} lastMessage - 마지막 메시지 정보
	 * @property {string} updatedAt - 마지막 업데이트 시각
	 * @property {number} [unreadCount] - 읽지 않은 메시지 수
	 */

	/** @type {ChatRoomItem} | {} */
	let selectedRoomInfo = $state({})

	$effect(() => {
		if (isConnected) {
			const messageUnsubscribe = socket.on('room_joined', (roomData) => {
				if (dev) console.log('선택된 채팅방 정보 수신', roomData)
				selectedRoomInfo = roomData

				// 새 채팅방이면 목록에 추가
				if (roomData && !roomList.some((room) => room.id === roomData.id)) {
					addRoomToList(roomData)
				}
			})

			socket.on('new_message', (newMsg) => {
				if (dev) console.log('update_room_last', newMsg)

				updateRoomWithMessage(newMsg)
			})

			return () => messageUnsubscribe()
		}
	})

	/** @param {ChatRoomItem} room */
	const addRoomToList = (room) => {
		// 이미 목록에 있는지 확인
		if (!roomList.some((existingRoom) => existingRoom.id === room.id)) {
			roomList = [room, ...roomList]
		}
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

	/** @param {Message} message */
	const updateRoomWithMessage = (message) => {
		// 메시지에 필요한 정보가 있는지 확인
		if (!message || !message.roomId) return

		const roomId = message.roomId
		const roomIndex = roomList.findIndex((room) => room.id === roomId)

		if (roomIndex >= 0) {
			// 기존 방이면 메시지 정보 업데이트 및 목록 맨 위로 이동
			const updatedRoom = {
				...roomList[roomIndex],
				lastMessage: {
					id: message.id,
					content: message.content,
					createdAt: message.createdAt,
					senderId: message.senderId
				}
			}

			// 해당 방을 제외한 나머지 방들
			const otherRooms = roomList.filter((room) => room.id !== roomId)

			// 업데이트된 방을 맨 위로 이동
			roomList = [updatedRoom, ...otherRooms]
		}
	}

	let defaultLayout = [265, 440, 655]

	/** @param sizes {string} */
	function onLayoutChange(sizes) {
		document.cookie = `PaneForge:layout=${JSON.stringify(sizes)}`
	}

	const isNewChatHandler = () => {
		isNewChat = !isNewChat
	}

	const logoutHandler = async () => {
		const result = await fetch('/api/logout', {
			method: 'POST'
		})

		const { success } = await result.json()

		if (success) {
			goto('/auth/login')
		}
	}

	onMount(() => {
		// 소켓 연결 상태를 감지하여 렌더링 결정
		if (socket.isConnected.subscribe) {
			const unsubscribe = socket.isConnected.subscribe((connected) => {
				isConnected = connected
			})

			return () => {
				unsubscribe()
				socket.off('new_message')
			}
		}
	})
</script>

{#if !isConnected}
	<div class="flex h-screen flex-col items-center justify-center">
		<div class="my-10">
			<LoaderCircle class="mr-2 h-4 w-4 animate-spin text-yellow-500" />
		</div>
		<p>chat - alicorn</p>
		<p>잠시만 기다려주세요.</p>
	</div>
{:else}
	<div class="h-vh-100 hidden md:block">
		<Resizable.PaneGroup
			direction="horizontal"
			{onLayoutChange}
			class="h-full max-h-[800px] items-stretch"
		>
			<Resizable.Handle withHandle />
			<Resizable.Pane defaultSize={defaultLayout[1]} minSize={30}>
				<Tabs.Root value="all">
					<div class="flex items-center px-4 py-2">
						<h1 class="text-xl font-bold">Alicorn-Chat ({$userName})</h1>
						<Tabs.List class="ml-auto">
							<Tabs.Trigger
								on:click={logoutHandler}
								value="logout"
								class="text-xs text-zinc-600 dark:text-zinc-200"
							>
								log-out
							</Tabs.Trigger>
							<!-- <Tabs.Trigger value="all" class="text-zinc-600 dark:text-zinc-200">
								All Chat
							</Tabs.Trigger>
							<Tabs.Trigger value="unread" class="text-zinc-600 dark:text-zinc-200">
								Unread
							</Tabs.Trigger> -->
						</Tabs.List>
					</div>
					<Separator />
					<div
						class="bg-background/95 supports-[backdrop-filter]:bg-background/60 p-4 backdrop-blur"
					>
						<form>
							<section class="flex py-3">
								<Button on:click={isNewChatHandler}>새로운 채팅</Button>
								{#if isNewChat}
									<Combobox {userList} onSelectIsOpen={isNewChatHandler} />
								{/if}
							</section>
							<!-- <div class="relative">
								<Search
									class="text-muted-foreground absolute top-[50%] left-2 h-4 w-4 translate-y-[-50%]"
								/>
								<Input placeholder="Search" class="pl-8" />
							</div> -->
						</form>
					</div>
					<Tabs.Content value="all" class="m-0">
						<RoomList items={roomList} />
					</Tabs.Content>
					<!-- <Tabs.Content value="unread" class="m-0">
					<RoomList items={chatList.filter((item) => !item.read)} />
				</Tabs.Content> -->
				</Tabs.Root>
			</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane defaultSize={defaultLayout[2]}>
				{#if selectedRoomInfo && selectedRoomInfo?.id}
					{#key selectedRoomInfo.id}
						<ChatDisplay roomInfo={selectedRoomInfo} />
					{/key}
				{/if}
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</div>
{/if}
