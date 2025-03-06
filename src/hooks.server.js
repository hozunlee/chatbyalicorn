import { redirect } from '@sveltejs/kit'
import { validateSession } from '$lib/server/auth/methods'
import { building, dev } from '$app/environment'
import { Server } from 'socket.io'
import { createServer } from 'http'

// 소켓 서비스 싱글톤
const socketService = {
	io: null,
	httpServer: null,
	initialized: false,

	isInitialized() {
		return this.initialized
	},

	// 프로덕션 환경용 - 기존 HTTP 서버 사용
	initialize(server) {
		if (this.initialized) return this.io

		this.io = new Server(server, {
			cors: {
				origin:
					process.env.NODE_ENV === 'production'
						? 'https://chat.hololog.dev'
						: 'http://localhost:5173',
				credentials: true
			}
		})

		this._setupSocketHandlers()
		this.initialized = true

		console.log('Socket.IO 서버가 기존 HTTP 서버에 연결되었습니다.')
		return this.io
	},

	// 개발 환경용 - 독립 HTTP 서버 생성
	initializeStandalone() {
		if (this.initialized) return this.io

		this.httpServer = createServer()
		this.io = new Server(this.httpServer, {
			cors: {
				origin: 'http://localhost:5173',
				credentials: true
			}
		})

		this._setupSocketHandlers()

		const PORT = 3001
		this.httpServer.listen(PORT, () => {
			console.log(`독립 Socket.IO 서버가 포트 ${PORT}에서 시작되었습니다.`)
		})

		this.initialized = true
		return this.io
	},

	// 공통 소켓 이벤트 핸들러
	_setupSocketHandlers() {
		// 인증 미들웨어
		this.io.use(async (socket, next) => {
			const cookies = socket.handshake.headers.cookie
			if (cookies) {
				const sessionIdMatch = cookies.match(/sessionId=([^;]+)/)
				const sessionId = sessionIdMatch ? sessionIdMatch[1] : null

				if (sessionId) {
					// 세션 ID로 사용자 검증
					const user = await validateSession(sessionId)
					if (!user) return next(new Error('인증 오류'))

					socket.data.user = user
					return next()
				}
			}
		})

		// 연결 이벤트 핸들러
		this.io.on('connection', (socket) => {
			console.log('this.io :>> ', this.io)
			const user = socket.data.user
			console.log(`사용자 연결됨: ${user?.name || '알 수 없음'} (${socket.id})`)

			// 채팅방 입장 이벤트 처리
			socket.on('join_room', (data) => {
				if (data.roomId) {
					socket.join(data.roomId)
					console.log(`User ${socket.id} joined room: ${data.roomId}`)
					socket.emit('room_joined', { roomId: data.roomId })
				}
			})

			// 메시지 처리 이벤트
			socket.on('send_message', (data) => {
				// 메시지 처리 로직
				console.log('메시지 수신:', data)
				console.log('발신자:', user?.name)

				// 채팅방에 메시지 브로드캐스트
				if (data.roomId) {
					// 자신에게는 메시지를 보내지 않고 채팅방의 다른 사용자들에게만 전송
					socket.to(data.roomId).emit('new_message', {
						sender: user,
						content: data.content,
						timestamp: new Date()
					})
				}
			})

			// 연결 해제 처리
			socket.on('disconnect', () => {
				console.log(`사용자 연결 해제: ${socket.id}`)
			})
		})
	}
}

// SvelteKit 서버 시작 시 한 번만 실행되는 로직
let serverInitialized = false

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
	// 로그인 세션 관리
	// 로그인 페이지 접근 시, 세션 확인하지 않음
	if (event.url.pathname === '/auth/login' || event.url.pathname === '/auth/login/callback')
		return resolve(event)

	// 세션 ID 확인
	const sessionId = event.cookies.get('sessionId')
	if (!sessionId) throw redirect(302, '/auth/login')

	// 세션 ID를 가지고 user 정보 가져옴
	const user = await validateSession(sessionId)

	// 세션 정보가 불량일 시 로그인 페이지로 리다이렉트
	if (!user) {
		console.log('expired session, redirect to /auth/login')
		event.cookies.delete('sessionId', { path: '/' })
		throw redirect(303, '/auth/login')
	}

	// 세션 유지 시, locals에 user 정보 저장
	event.locals.user = user

	// 서버가 시작될 때만 소켓 서버 초기화
	// 빌드 중이면 실행하지 않음 + 이미 초기화되었으면 실행하지 않음
	if (!building && !serverInitialized) {
		serverInitialized = true

		if (dev) {
			// 개발 환경: 독립 소켓 서버 초기화
			console.log('개발 환경에서 소켓 서버 초기화')
			socketService.initializeStandalone()
		} else if (event.platform?.server) {
			// 프로덕션 환경: HTTP 서버에 소켓 서버 연결
			console.log('프로덕션 환경에서 소켓 서버 초기화')
			socketService.initialize(event.platform.server)
		}
	}

	return resolve(event)
}

// 다른 서버 컴포넌트에서 사용할 수 있도록 socketService 내보내기
export { socketService }
