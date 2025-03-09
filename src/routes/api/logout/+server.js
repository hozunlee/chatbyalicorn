import { resetSession } from '$lib/server/auth/methods.js'
import { json } from '@sveltejs/kit'

export async function POST(event) {
	// 로그아웃시, sessionId & admin user 정보 삭제
	event.cookies.delete('sessionId', { path: '/' })

	// 로그아웃시, session field {} 로 수정
	if (!event.locals.user) throw new Error('user not found')

	const logOutAdmin = await resetSession(event.locals.user.id)
	if (!logOutAdmin) delete event.locals.user
	console.log('session & locals.user delete; locals.user =', event.locals.user)

	return json({ success: true })

	// 세션 만료 후 reset되면 false 반환함.
}
