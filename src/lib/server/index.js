import { dev } from '$app/environment'
import { PrismaClient } from '@prisma/client'

// import { createClient } from '@supabase/supabase-js'

// import { SUPABASE_URL, SUPABASE_KEY } from '$env/static/private'

// storage 연결 시 필요 ( 아바타 img 저장)
// export const { storage } = createClient(SUPABASE_URL, SUPABASE_KEY)

/** @type {PrismaClient} */
export let prisma

if (!dev) {
	prisma = new PrismaClient()
} else {
	// for global.prisma
	// eslint-disable-next-line
	if (!global.prisma) {
		global.prisma = new PrismaClient()
	}
	prisma = global.prisma
}
