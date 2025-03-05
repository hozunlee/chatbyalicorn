import { validateSession } from '$lib/server/auth/methods'
import { redirect } from '@sveltejs/kit'
// import { validateSession } from '$lib/server/auth/methods'

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/auth/login' || event.url.pathname === '/auth/login/callback')
		return resolve(event)

	const sessionId = event.cookies.get('sessionId')

	if (!sessionId) throw redirect(302, '/auth/login')

	// 세션 ID를 가지고 user 정보 가져옴
	const user = await validateSession(sessionId)

	// !admin은 세션이 만료 or 불량
	if (!user) {
		console.log('expired session, redirect to /auth/login')
		event.cookies.delete('sessionId', { path: '/' })

		throw redirect(303, '/auth/login')
	}

	// 세션 유지시, locals에 user 정보(id, name) 저장
	event.locals.user = user

	return resolve(event)
}
