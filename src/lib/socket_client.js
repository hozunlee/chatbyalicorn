import { writable } from 'svelte/store'
import { io } from 'socket.io-client'

/**
 * @typedef {Object} SocketOptions
 * @property {boolean} [withCredentials=true] - CORS 인증 허용 여부. Default is `true`
 * @property {string[]} [transports=['websocket']] - 전송 프로토콜. Default is `['websocket']`
 * @property {number} [reconnectionAttempts=5] - 재연결 시도 횟수. Default is `5`
 * @property {number} [reconnectionDelay=1000] - 재연결 시도 간격(ms). Default is `1000`
 */

/**
 * Socket.IO 클라이언트 래퍼
 *
 * @class
 */
class SocketWrapper {
	/** @type {import('socket.io-client').Socket | null} */
	#socket = null
	// #socketStore
	#isConnected // 연결 상태만 관리 (true/false)

	// 싱글톤 인스턴스
	/** @type {SocketWrapper | null} */
	static #instance = null

	constructor() {
		if (SocketWrapper.#instance) {
			return SocketWrapper.#instance
		}

		// this.#socketStore = writable(null)
		this.#isConnected = writable(false)
		SocketWrapper.#instance = this // 인스턴스를 저장
	}

	// 연결 상태를 구독할 수 있는 메서드 추가
	get isConnected() {
		return {
			subscribe: this.#isConnected?.subscribe
		}
	}

	/**
	 * 소켓 연결을 초기화합니다 FIXME product 시 서버 URL 변경 필요
	 *
	 * @param {string} [url='http://localhost:3001'] - 서버 URL. Default is `'http://localhost:3001'`
	 * @param {SocketOptions} [options={}] - 소켓 설정. Default is `{}`
	 */
	connect(url = 'http://localhost:3001', options = {}) {
		console.log('connection 실행')
		if (this.#socket) {
			console.warn('Socket already initialized. Returning existing socket.')
			return this.#socket
		}

		try {
			this.#socket = io(url, {
				withCredentials: true,
				transports: ['websocket'],
				reconnectionAttempts: 5,
				reconnectionDelay: 1000,
				...options
			})

			// this.#socketStore?.set(this.#socket)

			this.#socket.on('connect', () => {
				console.log('Connected with socket ID:', this.#socket?.id)
				this.#isConnected?.set(true) // 연결 상태 업데이트
			})

			this.#socket.on('disconnect', () => {
				console.log('Disconnected')
				this.#isConnected?.set(false) // 연결 해제 상태 업데이트
			})

			// 연결 에러 이벤트 리스너
			this.#socket.on('connect_error', (error) => {
				console.error('Connection error:', error)
			})

			return this.#socket
		} catch (error) {
			console.error('Socket initialization error:', error)
			throw error
		}
	}

	/**
	 * 채팅방을 참여하는 메서드 하지만 채팅방이 없으면 채팅방을 생성요청한다. 기존 채팅방이 있으면, 기존 채팅방 ID를 전달해준다.
	 *
	 * @param {Number} targetUserId - 상대 유저 ID
	 */
	join(targetUserId) {
		console.log('🚀 ~ ROOM:JOIN 상대 ID:', targetUserId)
		if (!targetUserId) {
			return { status: 'fail', message: '대화 상대 ID가 필요합니다' }
		}
		// 채팅방 참여 요청 이벤트 전송
		this.#socket?.emit('join_room', targetUserId)

		// this.#socket?.on('room_joined', (roomInfo) => {
		// selectedChatRoom.set(roomInfo)
		// })
	}

	/**
	 * 이벤트를 서버로 전송합니다
	 *
	 * @param {string} event - 이벤트 이름
	 * @param {any} data - 전송할 데이터
	 * @param {() => void} callback - 콜백 함수
	 */
	emit(event, data, callback) {
		this.#socket?.emit(event, data, callback)
	}

	/**
	 * 이벤트 리스너를 등록합니다
	 *
	 * @param {string} event - 이벤트 이름
	 * @param {any} callback - 콜백 함수
	 * @returns {Function} 리스너 해제 함수
	 */
	on(event, callback) {
		if (!this.#socket) {
			console.warn('Socket not initialized. Call connect() first.')
			return () => {}
		}

		this.#socket.on(event, callback)

		return () => {
			this.#socket?.off(event, callback)
		}
	}

	/**
	 * 이벤트 리스너를 제거합니다
	 *
	 * @param {string} event - 이벤트 이름
	 * @param {() => void} [callback] - 콜백 함수
	 */
	off(event, callback) {
		if (!this.#socket) {
			console.warn('Socket not initialized. Call connect() first.')
			return
		}

		this.#socket.off(event, callback)
	}

	/** 소켓 연결을 종료합니다 */
	disconnect() {
		this.#socket?.disconnect()
		this.#isConnected?.set(false) // 연결 상태 업데이트
	}
}

// 싱글톤 인스턴스를 생성하여 export
export const socket = new SocketWrapper()
