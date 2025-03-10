import { Server } from 'socket.io'
import { createServer } from 'http'
import { validateSession } from './auth/methods'
import { prisma } from './index.js'

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
		const { id: userId, name: userName } = socket.data.user
		console.log(`사용자 연결됨: ${userName || '알 수 없음'} (${socket.id})`)

		// 채팅방 연결
		// 채팅방이 있을 시 기존 채팅방으로 연결, 없을 시 새로운 채팅방 생성
		socket.on('join_room', async (targetUserId) => {
			console.log('📟 채팅방 연결 요청: 연결할 userId', targetUserId)

			// 이미 존재하는 채팅방 확인
			const existingRoom = await prisma.chatRoom.findFirst({
				where: {
					OR: [
						{ user1Id: userId, user2Id: targetUserId },
						{ user1Id: targetUserId, user2Id: userId }
					]
				},
				include: {
					// user1 정보 포함
					user1: {
						select: {
							id: true,
							name: true,
							profileImage: true
						}
					},
					// user2 정보 포함
					user2: {
						select: {
							id: true,
							name: true,
							profileImage: true
						}
					},
					// 최근 메시지 조회
					messages: {
						orderBy: { createdAt: 'asc' },
						select: {
							id: true,
							content: true,
							createdAt: true,
							senderId: true
						}
					}
				}
			})

			if (existingRoom) {
				// 상대방 정보 결정 (user1이 현재 사용자면 user2가 상대방, 반대의 경우 user1이 상대방)
				const partner = existingRoom.user1Id === userId ? existingRoom.user2 : existingRoom.user1

				const messages = existingRoom.messages.map((message) => ({
					...message,
					isMyMessage: message.senderId === userId
				}))
				console.log('📟 기존 채팅방으로 연결합니다.')

				socket.emit('room_joined', {
					id: existingRoom.id,
					createdAt: existingRoom.createdAt,
					partner: {
						id: partner.id,
						name: partner.name,
						profileImage: partner.profileImage
					},
					messages: messages
				})
				socket.join(existingRoom.id)
				return
			}

			// 새 채팅방 생성
			const newRoom = await prisma.chatRoom.create({
				data: {
					user1Id: userId,
					user2Id: targetUserId
				},
				include: {
					user2: {
						select: {
							id: true,
							name: true,
							profileImage: true
						}
					}
				}
			})
			console.log('📟 새로운 채팅방으로 연결합니다.')

			// 생성된 방 정보 전송
			socket.emit('room_joined', {
				id: newRoom.id,
				createdAt: newRoom.createdAt,
				partner: newRoom.user2,
				messages: null
			})
			socket.join(newRoom.id)
		})

		// 메시지 전송
		socket.on('send_message', async (data) => {
			const savedMessage = await sendMessage(userId, data.roomId, data.content)

			if (savedMessage.id) {
				io.to(data.roomId).emit('new_message', savedMessage)
			}
		})

		// 연결 해제
		socket.on('disconnect', () => {
			console.log(`사용자 연결 해제: ${socket.id}`)
		})
	})
}

/**
 * @param {number} userId
 * @param {string} roomId
 * @param {string} content
 * @returns
 */
async function sendMessage(userId, roomId, content) {
	// 채팅방 정보 조회
	const room = await prisma.chatRoom.findUnique({ where: { id: roomId } })

	if (!room) {
		throw new Error('채팅방을 찾을 수 없습니다')
	}
	// 수신자 ID 결정
	const recipientId = room.user1Id === userId ? room.user2Id : room.user1Id

	// 메시지 생성
	const message = await prisma.message.create({
		data: {
			chatRoomId: roomId,
			senderId: userId,
			content,
			readStatus: 'SENT',
			// 메시지는 수신자 기준으로만 읽음 상태 관리
			readByRecipient: false
		},
		select: {
			id: true,
			content: true,
			createdAt: true,
			senderId: true
		}
	})

	// 채팅방 안 읽은 메시지 수 업데이트
	await prisma.chatRoom.update({
		where: { id: roomId },
		data: {
			lastMessageAt: new Date(),
			// 수신자의 안 읽은 메시지 수만 증가
			...(room.user1Id === recipientId
				? { user1UnreadCount: { increment: 1 } }
				: { user2UnreadCount: { increment: 1 } })
		}
	})

	// isMyMessage 추가
	const savedMessage = {
		...message,
		roomId
	}

	return savedMessage
}
