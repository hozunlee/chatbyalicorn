import { Server } from 'socket.io'
import { createServer } from 'http'
import { validateSession } from './auth/methods'

/**
 * @typedef {Object} User
 * @property {number} id - 사용자 ID
 * @property {string} name - 사용자 이름
 * @property {string} [email] - 사용자 이메일
 * @property {string} [profileImage] - 프로필 이미지 URL
 */

/**
 * @typedef {Object} MessageData
 * @property {string} roomId - 채팅방 ID
 * @property {string} content - 메시지 내용
 * @property {Date} [timestamp] - 타임스탬프
 */

// 전역 싱글톤 변수 (Node.js 모듈 캐싱 활용)
/** @type {import('socket.io').Server | null} */
let io = null

/** @type {import('http').Server | null} */
let httpServer = null

/** @type {boolean} */
let initialized = false

// 포트 체크 유틸리티
/**
 * 지정된 포트가 사용 가능한지 확인합니다
 *
 * @param {number} port 포트번호
 * @returns {Promise<boolean>} 포트 사용 가능 여부
 */
async function isPortAvailable(port) {
	return new Promise((resolve) => {
		const tempServer = createServer()
		tempServer.once('error', () => {
			// 에러 = 포트 사용 중
			resolve(false)
		})

		tempServer.once('listening', () => {
			// 성공 = 포트 사용 가능
			tempServer.close(() => resolve(true))
		})

		tempServer.listen(port)
	})
}

export const socketService = {
	// 초기화 되었는지 확인
	isInitialized() {
		return initialized
	},

	// 현재 IO 인스턴스 반환
	getIO() {
		return io
	},

	/**
	 * 프로덕션 환경: 기존 HTTP 서버에 Socket.IO 연결
	 *
	 * @param {import('http').Server} server - HTTP 서버 인스턴스
	 * @returns {Promise<import('socket.io').Server | null>} Socket.IO 서버 인스턴스
	 */
	async initialize(server) {
		if (initialized) return io

		io = new Server(server, {
			cors: {
				origin:
					process.env.NODE_ENV === 'production'
						? 'https://chat.hololog.dev'
						: 'http://localhost:5173',
				credentials: true
			}
		})

		setupSocketHandlers(io)
		initialized = true
		console.log('Socket.IO 서버가 기존 HTTP 서버에 연결되었습니다.')
		return io
	},

	// 개발: 독립 서버 생성
	async initializeStandalone() {
		// 이미 초기화된 경우
		if (initialized) return io

		// 포트 사용 가능 여부 확인
		const PORT = 3001
		const available = await isPortAvailable(PORT)

		if (!available) {
			console.log(`포트 ${PORT}가 이미 사용 중입니다. Socket.IO 서버를 생성하지 않습니다.`)
			return null
		}

		httpServer = createServer()
		io = new Server(httpServer, {
			cors: {
				// 개발 환경에서는 로컬 호스트만 허용
				origin: 'http://localhost:5173',
				credentials: true
			}
		})

		setupSocketHandlers(io)

		httpServer.listen(PORT, () => {
			console.log(`독립 Socket.IO 서버가 포트 ${PORT}에서 시작되었습니다.`)
		})

		initialized = true
		return io
	}
}

/**
 * Socket.IO 서버에 이벤트 핸들러 설정
 *
 * @param {import('socket.io').Server} io - Socket.IO 서버 인스턴스
 */
function setupSocketHandlers(io) {
	// 인증 미들웨어
	io.use(async (socket, next) => {
		try {
			// auth 객체에서 세션 ID 확인
			const sessionId = socket.handshake.auth.sessionId

			// 쿠키에서도 세션 ID 확인 (백업)
			if (!sessionId && socket.handshake.headers.cookie) {
				const cookies = socket.handshake.headers.cookie
				const match = cookies.match(/sessionId=([^;]+)/)
				if (match) {
					const cookieSessionId = match[1]
					socket.handshake.auth.sessionId = cookieSessionId
				}
			}

			// 최종 세션 ID 확인
			const finalSessionId = socket.handshake.auth.sessionId
			if (!finalSessionId) {
				return next(new Error('인증 정보가 없습니다'))
			}

			// 세션 검증
			const user = await validateSession(finalSessionId)
			if (!user) {
				return next(new Error('유효하지 않은 세션입니다'))
			}

			// 소켓에 사용자 정보 저장
			socket.data.user = user
			next()
		} catch (error) {
			console.error('소켓 인증 오류:', error)
			next(new Error('인증 중 오류가 발생했습니다'))
		}
	})

	// 연결 이벤트
	io.on('connection', (socket) => {
		const user = socket.data.user
		console.log(`사용자 연결됨: ${user?.name || '알 수 없음'} (${socket.id})`)

		// 채팅방 입장
		socket.on('join_room', (data) => {
			if (data.roomId) {
				socket.join(data.roomId)
				socket.emit('room_joined', { roomId: data.roomId })
			}
		})

		// 메시지 전송
		socket.on('send_message', (data) => {
			console.log('메시지 수신:', data)

			if (data.roomId) {
				socket.to(data.roomId).emit('new_message', {
					sender: user,
					content: data.content,
					timestamp: new Date()
				})
			}
		})

		// 연결 해제
		socket.on('disconnect', () => {
			console.log(`사용자 연결 해제: ${socket.id}`)
		})
	})
}
