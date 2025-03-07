import { redirect } from '@sveltejs/kit'
import { building, dev } from '$app/environment'

import { validateSession } from '$lib/server/auth/methods'
import { socketService } from '$lib/server/socket-service'

// 소켓 서버 초기화 플래그 (추가 보호 장치)
let initAttempted = false

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
	if (!building && !initAttempted) {
		initAttempted = true

		if (dev) {
			console.log('📟 개발 환경에서 소켓 서버 초기화 시도')
			await socketService.initializeStandalone()
		} else if (event.platform?.server) {
			console.log('📟 프로덕션 환경에서 소켓 서버 초기화')
			await socketService.initialize(event.platform.server)
		}
	}

	return resolve(event)
}

// 다른 서버 컴포넌트에서 사용할 수 있도록 socketService 내보내기
export { socketService }
