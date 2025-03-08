import { derived, writable } from 'svelte/store'

// 채팅방 전체 목록
export const chatRoomList = writable([])

// 현재 선택된 채팅방

/**
 * 채팅 상대 정보
 *
 * @typedef {{
 * 	id: number
 * 	name: string
 * 	profileImage: string
 * }} PartnerInfo
 */

/**
 * 채팅방 정보
 *
 * @typedef {{
 * 	id: string
 * 	createAt: string
 * 	partner: PartnerInfo
 * }} SelectedRoomInfo
 */

/* @type {SelectedRoomInfo} | null */
export const selectedChatRoom = writable({})

// 선택된 채팅방 정보 (derived 스토어)
export const selectedRoom = derived(
	[chatRoomList, selectedChatRoom],
	([$chatRoomList, $selectedChatRoom]) => {
		return $chatRoomList.find((room) => room.id === $selectedChatRoom) || null
	}
)
