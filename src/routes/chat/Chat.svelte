<script>
	import Search from 'lucide-svelte/icons/search'
	import LoaderCircle from 'lucide-svelte/icons/loader-circle'

	import RoomList from '$lib/components/chat/room-list.svelte'
	import { Input } from '$lib/components/ui/input/index.js'
	import * as Resizable from '$lib/components/ui/resizable/index.js'
	import { Separator } from '$lib/components/ui/separator'
	import * as Tabs from '$lib/components/ui/tabs/index.js'
	import ChatDisplay from '$lib/components/chat/chat-display.svelte'

	import { userName } from '$lib/store.js'

	import { Button } from '$lib/components/ui/button'
	import Combobox from '$lib/components/ui/combobox/combobox.svelte'
	import { socket } from '$lib/socket_client'
	import { onMount } from 'svelte'
	import { dev } from '$app/environment'

	let { rooms, userList } = $props()

	let isNewChat = $state(false)
	let isConnected = $state(false)
	let roomList = $state(rooms)
	console.log('🚀 ~ roomList:', $state.snapshot(roomList))

	let selectedRoomInfo = $state([])

	onMount(() => {
		const unsubscribe = socket.isConnected.subscribe((connected) => {
			isConnected = connected
		})

		return () => unsubscribe()
	})

	$effect(() => {
		if (isConnected) {
			const messageUnsubscribe = socket.on('room_joined', (roomData) => {
				if (dev) console.log('선택된 채팅방 정보 수신', roomData)
				selectedRoomInfo = roomData
			})

			// newMessage를 받게 되면 해당 방의 room lastMessage update
			socket.on('new_message', (roomData) => {
				if (dev) console.log('update_room_last', roomData)

				//FIXME : roomList의 lastMessage 업데이트
			})

			return () => messageUnsubscribe()
		}
	})

	// }

	let defaultLayout = [265, 440, 655]

	/** @param sizes {string} */
	function onLayoutChange(sizes) {
		document.cookie = `PaneForge:layout=${JSON.stringify(sizes)}`
	}
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
							<Tabs.Trigger value="all" class="text-zinc-600 dark:text-zinc-200">
								All Chat
							</Tabs.Trigger>
							<Tabs.Trigger value="unread" class="text-zinc-600 dark:text-zinc-200">
								Unread
							</Tabs.Trigger>
						</Tabs.List>
					</div>
					<Separator />
					<div
						class="bg-background/95 supports-[backdrop-filter]:bg-background/60 p-4 backdrop-blur"
					>
						<form>
							<section class="py-3">
								<Button on:click={() => (isNewChat = !isNewChat)}>새로운 채팅</Button>
								{#if isNewChat}
									<Combobox {userList} />
								{/if}
							</section>
							<div class="relative">
								<Search
									class="text-muted-foreground absolute top-[50%] left-2 h-4 w-4 translate-y-[-50%]"
								/>
								<Input placeholder="Search" class="pl-8" />
							</div>
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
