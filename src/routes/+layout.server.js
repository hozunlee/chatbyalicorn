export const load = async ({ locals: { user } }) => {
	if (!user) return

	return { userName: user.name }
}
