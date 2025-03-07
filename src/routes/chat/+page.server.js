import { prisma } from '$lib/server'
import { redirect } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	try {
		const currentUser = locals.user

		if (!currentUser.id) {
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

		// 채팅방 목록 조회
		const chatRooms = await prisma.chatRoom.findMany({
			where: {
				OR: [{ user1Id: currentUser.id }, { user2Id: currentUser.id }]
			},
			include: {
				user1: {
					select: {
						id: true,
						name: true,
						profileImage: true
					}
				},
				user2: {
					select: {
						id: true,
						name: true,
						profileImage: true
					}
				},
				// 최근 메시지 조회
				messages: {
					orderBy: { createdAt: 'desc' },
					take: 1,
					select: {
						id: true,
						content: true,
						createdAt: true,
						senderId: true
					}
				}
			},
			orderBy: {
				updatedAt: 'desc' // 최근 업데이트된 채팅방 순
			}
		})

		// 채팅방 데이터 가공
		const formattedRooms = chatRooms.map((room) => {
			// 현재 사용자 기준으로 상대방 정보 결정
			const otherUser = room.user1Id === currentUser.id ? room.user2 : room.user1

			return {
				id: room.id,
				otherUser,
				lastMessage: room.messages[0] || null,
				updatedAt: room.updatedAt,
				unreadCount: 0 // 추후에 구현
			}
		})
		console.log('🚀 ~ load ~ formattedRooms:', currentUser.id, formattedRooms)

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
