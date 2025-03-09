import { derived, writable } from 'svelte/store'

// 채팅방 전체 목록
export const connectedSocket = writable(false) // 현재 연결된 소켓

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

export const partner = derived(selectedChatRoom, ($room) => $room?.partner || null)
export const chatList = derived(selectedChatRoom, ($room) => $room?.messages || [])

export const userName = writable('')
