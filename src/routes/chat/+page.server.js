import { prisma } from '$lib/server'
import { redirect } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	try {
		const currentUser = locals.user

		if (!currentUser) {
			console.error('사용자 정보 없음')
			redirect(302, '/auth/login')
		}

		// 사용자  목록 조회
		const userList = await prisma.user.findMany({
			where: {
				id: { not: currentUser.id }
			},
			select: {
				id: true,
				name: true,
				profileImage: true
			},
			orderBy: {
				name: 'asc'
			}
		})

		return {
			userList
		}
	} catch (error) {
		console.error('사용자 목록 로드 오류:', error)
		return {
			users: [],
			error: '사용자 목록을 불러오는데 실패했습니다'
		}
	}
}
