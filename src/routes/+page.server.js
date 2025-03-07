import { redirect } from '@sveltejs/kit'

export const load = async (event) => {
	const sessionId = event.cookies.get('sessionId')

	// 세션이 유효할 시, '/'로 이동
	if (sessionId) redirect(302, '/chat')
}
