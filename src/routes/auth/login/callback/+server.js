import { redirect } from '@sveltejs/kit'
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private'
import { createSession, createUser, getUserId, upsertUser } from '$lib/server/auth/methods'
import { dev } from '$app/environment'

/**
 * Access_token을 통해 user 정보를 fetch 해오는 함수
 *
 * @param {string} access_token Google에서 받아온 token
 * @returns {Promise<Types.UserData>} User info
 */
async function getUserData(access_token) {
	const response = await fetch(
		`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
	)
	const data = await response.json()
	return data
}

/** @param {import('./$types').RequestEvent} event Get url, cookies */
export const GET = async (event) => {
	const { url, cookies } = event
	const tokenEndpoint = 'https://oauth2.googleapis.com/token'
	const redirectURI = `${event.url.origin}/auth/login/callback`
	const code = url.searchParams.get('code')

	if (code) {
		try {
			const response = await fetch(tokenEndpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					code,
					client_id: GOOGLE_CLIENT_ID,
					client_secret: GOOGLE_CLIENT_SECRET,
					redirect_uri: redirectURI,
					grant_type: 'authorization_code'
				})
			})
			const data = await response.json()
			const accessToken = data.access_token

			// 토큰을 이용해 관리자 정보 가져오기
			/** @type {Types.UserData} */
			const userInfo = await getUserData(accessToken)

			/** @type {{ name: string; email: string; profileImage: string }} */
			const user = {
				name: userInfo.name,
				email: userInfo.email,
				profileImage: userInfo.picture
			}

			// userId 가져오기 (unique한 email을 활용)
			let userId = await getUserId(user.email)

			// admin 계정 생성 및 업데이트
			if (!userId) {
				userId = await createUser(user) // adminId가 없을 경우, db에 생성해주기 (upsert는 where 조건이 없기때문에 create로 해줌)
			} else {
				userId = await upsertUser(user)
			}

			const sessionId = await createSession(userId, accessToken) // session 설정

			// 쿠키 설정
			cookies.set('sessionId', sessionId.toString(), {
				httpOnly: true,
				path: '/',
				secure: dev ? false : true,
				maxAge: 3600000 // 1시간
			})

			console.log('session setting; redirect: /')
		} catch (error) {
			console.log('Error login in with Google', error)
		}
	}
	throw redirect(303, '/')
}
