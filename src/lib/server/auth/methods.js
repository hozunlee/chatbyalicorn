import { prisma } from '../'
import crypto from 'crypto'

/**
 * Unique한 email값을 활용해 userId 가져오기
 *
 * @param {string} email User email
 * @returns {Promise<number | undefined>} Returns user id
 */
export const getUserId = async (email) => {
	const user = await prisma.user.findUnique({
		where: {
			email
		},
		select: {
			id: true
		}
	})

	return user?.id
}

/**
 * 처음 로그인 시, 계정 생성
 *
 * @param {{ name: string; email: string; profileImage: string }} userInfo Create user info
 * @returns {Promise<number>} Returns user id
 */
export const createUser = async (userInfo) => {
	const { id } = await prisma.user.create({
		data: userInfo
	})

	return id
}

/**
 * 처음 로그인이 아닐 시, 계정 업데이트
 *
 * @param {{ name: string; email: string; profileImage: string }} userInfo Create user info
 * @returns {Promise<number>} Returns user id
 */
export const upsertUser = async (userInfo) => {
	const { id } = await prisma.user.upsert({
		where: { email: userInfo.email },
		create: userInfo,
		update: userInfo,
		select: {
			id: true
		}
	})
	return id
}

/**
 * OAuth2 리턴 값을 활용하여 안전한 세션 아이디를 생성하는 함수
 *
 * @param {string} oauthReturn - OAuth2에서 전달받은 리턴 값 (access_token)
 * @returns {Promise<string>} 생성된 세션 아이디 (SHA-256 해시)
 */
async function generateSessionId(oauthReturn) {
	// 고유 난수(임의의 salt) 생성
	const salt = crypto.randomBytes(16).toString('hex')

	// 현재 타임스탬프도 함께 결합 (예: 밀리초 단위)
	const timestamp = Date.now().toString()

	// OAuth2 리턴 값과 salt, 타임스탬프를 결합
	const combinedValue = `${oauthReturn}-${salt}-${timestamp}`

	// SHA-256 해시 알고리즘으로 결합된 값을 해싱하여 세션 아이디 생성
	const sessionId = crypto.createHash('sha256').update(combinedValue).digest('hex')

	return sessionId
}

/**
 * 로그인 시, 세션 생성
 *
 * @param {number} userId Id
 * @param {string} accessToken Access token
 * @returns {Promise<string | false>} Session id
 */
export const createSession = async (userId, accessToken) => {
	const isExisted = await prisma.user.findUnique({
		where: {
			id: userId
		},
		select: {
			id: true
		}
	})

	if (!isExisted) return false

	const sessionId = await generateSessionId(accessToken) // session 설정

	const { session } = await prisma.user.update({
		where: {
			id: userId
		},
		data: {
			session: sessionId
		},
		select: {
			session: true
		}
	})
	if (!session) return false

	return session
}

/**
 * Session id를 통해 user 정보 가져오기
 *
 * @param {string} sessionId Cookies에 저장된 sessionId
 * @returns {Promise<{ id: number; name: string | null } | null>} Session id
 */
export const validateSession = async (sessionId) => {
	const user = await prisma.user.findFirst({
		where: {
			session: sessionId
		},
		select: {
			id: true,
			name: true,
			profileImage: true
		}
	})

	return user
}
