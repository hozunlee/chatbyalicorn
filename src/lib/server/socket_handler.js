import { Server } from 'socket.io'
import { validateSession } from './auth/methods'

/**
 * @typedef {Object} User
 * @property {string} id - 사용자 ID
 * @property {string} name - 사용자 이름
 * @property {string} profileImage - 사용자 아바타 URL
 */

/** @type {Map<string, User>} */
const connectedUsers = new Map()

/** @type {import('socket.io').Server} */
let io

/**
 * Socket.IO 서버를 초기화합니다.
 *
 * @param {import('http').Server} server - HTTP 서버
 * @returns {import('socket.io').Server} - Socket.IO 서버 인스턴스
 */
export function initSocketServer(server) {
	io = new Server(server, {
		cors: {
			origin:
				process.env.NODE_ENV === 'production'
					? 'https://chat.hololog.dev'
					: 'http://localhost:5173',
			credentials: true
		}
	})

	// 미들웨어: 사용자 인증 확인
	io.use(async (socket, next) => {
		const sessionId = socket.handshake.auth.sessionId

		if (!sessionId) {
			return next(new Error('Authentication error'))
		}

		try {
			// Supabase 세션 검증 (실제 구현은 Supabase API에 맞게 조정 필요)
			const user = await validateSession(sessionId)

			if (!user?.id) {
				return next(new Error('Authentication error'))
			}

			// 소켓에 사용자 정보 저장
			socket.data.user = user

			next()
		} catch (error) {
			console.error('Socket authentication error:', error)
			next(new Error('Authentication error'))
		}
	})

	// 연결 이벤트 처리
	io.on('connection', (socket) => {
		const user = socket.data.user

		console.log(`User connected: ${user.name} (${socket.id})`)

		// 사용자 정보 저장
		connectedUsers.set(socket.id, user)

		// // 연결된 모든 사용자에게 현재 접속자 목록 전송
		// io.emit('users', Array.from(connectedUsers.values()));

		// // 새 사용자 입장 알림
		// socket.broadcast.emit('user_joined', user);

		// 메시지 수신 및 전파
		socket.on('send_message', (messageText) => {
			const message = {
				id: `${socket.id}-${Date.now()}`,
				userId: user.id,
				username: user.name,
				text: messageText,
				createdAt: new Date()
			}

			// 모든 클라이언트에게 메시지 전송
			io.emit('new_message', message)
		})

		// 연결 해제 처리
		socket.on('disconnect', () => {
			console.log(`User disconnected: ${user.name} (${socket.id})`)

			// 사용자 정보 제거
			connectedUsers.delete(socket.id)

			// 연결된 모든 사용자에게 접속자 목록 갱신 전송
			io.emit('users', Array.from(connectedUsers.values()))

			// 사용자 퇴장 알림
			socket.broadcast.emit('user_left', user)
		})

		/** 핑-퐁 테스트 핸들러 (연결 테스트용) */
		socket.on('ping', (callback) => {
			callback({
				success: true,
				time: new Date().toISOString(),
				message: 'pong'
			})
		})
	})

	return io
}

/**
 * 현재 Socket.IO 서버 인스턴스를 반환합니다.
 *
 * @returns {import('socket.io').Server}
 */
export function getIO() {
	if (!io) {
		throw new Error('Socket.IO has not been initialized')
	}
	return io
}
