import { redirect } from '@sveltejs/kit'
import { GOOGLE_CLIENT_ID } from '$env/static/private'

export const actions = {
	Oauth2: async (event) => {
		const redirectURL = `${event.url.origin}/auth/login/callback`

		const scope =
			'https://www.googleapis.com/auth/userinfo.profile+https://www.googleapis.com/auth/userinfo.email openid'

		const authorizeUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectURL}&response_type=code&scope=${scope}`

		redirect(302, authorizeUrl)
	}
}

export const load = async (event) => {
	const sessionId = event.cookies.get('sessionId')

	// 세션이 유효할 시, '/'로 이동
	if (sessionId) redirect(302, '/')
}
