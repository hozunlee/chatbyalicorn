export const load = async ({ locals: { user }, event }) => {
	console.log('user', user)
	// const sessionId = event.cookies.get('sessionId')

	// if (!sessionId && event.url.pathname != '/auth/login') throw redirect(302, '/auth/login')

	// const isUser = user && user.id ? true : false

	// if (!isUser) {
	// 	return false
	// }

	// return { userName: user.name }
}
