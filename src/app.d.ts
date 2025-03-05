// src/app.d.ts

import type { PrismaClient } from '@prisma/client'

declare global {
	var prisma: PrismaClient
	namespace App {
		interface Locals {
			user: { id: number; name: string | null }
		}
		// interface Error {}
		// interface Platform {}
	}
}
