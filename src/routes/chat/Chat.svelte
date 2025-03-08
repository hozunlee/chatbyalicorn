<script>
	import Search from 'lucide-svelte/icons/search'

	// import MailDisplay from "./mail-display.svelte";
	import RoomList from '$lib/components/chat/room-list.svelte'
	import { Input } from '$lib/components/ui/input/index.js'
	import * as Resizable from '$lib/components/ui/resizable/index.js'
	import { Separator } from '$lib/components/ui/separator'
	import * as Tabs from '$lib/components/ui/tabs/index.js'

	let { rooms } = $props()
	console.log('🚀 ~ rooms:', rooms)

	let defaultLayout = [265, 440, 655]

	function onLayoutChange(sizes) {
		document.cookie = `PaneForge:layout=${JSON.stringify(sizes)}`
	}
</script>

<div class="hidden md:block">
	<Resizable.PaneGroup
		direction="horizontal"
		{onLayoutChange}
		class="h-full max-h-[800px] items-stretch"
	>
		<Resizable.Handle withHandle />
		<Resizable.Pane defaultSize={defaultLayout[1]} minSize={30}>
			<Tabs.Root value="all">
				<div class="flex items-center px-4 py-2">
					<h1 class="text-xl font-bold">Alicorn-Chat</h1>
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
				<div class="bg-background/95 supports-[backdrop-filter]:bg-background/60 p-4 backdrop-blur">
					<form>
						<div class="relative">
							<Search
								class="text-muted-foreground absolute top-[50%] left-2 h-4 w-4 translate-y-[-50%]"
							/>
							<Input placeholder="Search" class="pl-8" />
						</div>
					</form>
				</div>
				<Tabs.Content value="all" class="m-0">
					<RoomList items={rooms} />
				</Tabs.Content>
				<!-- <Tabs.Content value="unread" class="m-0">
					<RoomList items={chatList.filter((item) => !item.read)} />
				</Tabs.Content> -->
			</Tabs.Root>
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<!-- <Resizable.Pane defaultSize={defaultLayout[2]}>
			<MailDisplay mail={chats.find((item) => item.id === $chats.selected) || null} />
		</Resizable.Pane> -->
	</Resizable.PaneGroup>
</div>
