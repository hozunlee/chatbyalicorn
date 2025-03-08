import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { cubicOut } from 'svelte/easing'

export function cn(...inputs) {
	return twMerge(clsx(inputs))
}

export const flyAndScale = (node, params = { y: -8, x: 0, start: 0.95, duration: 150 }) => {
	const style = getComputedStyle(node)
	const transform = style.transform === 'none' ? '' : style.transform

	const scaleConversion = (valueA, scaleA, scaleB) => {
		const [minA, maxA] = scaleA
		const [minB, maxB] = scaleB

		const percentage = (valueA - minA) / (maxA - minA)
		const valueB = percentage * (maxB - minB) + minB

		return valueB
	}

	const styleToString = (style) => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str
			return str + `${key}:${style[key]};`
		}, '')
	}

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0])
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0])
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1])

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			})
		},
		easing: cubicOut
	}
}

const DIVISIONS = [
	{ amount: 60, name: 'seconds' },
	{ amount: 60, name: 'minutes' },
	{ amount: 24, name: 'hours' },
	{ amount: 7, name: 'days' },
	{ amount: 4.34524, name: 'weeks' },
	{ amount: 12, name: 'months' },
	{ amount: Number.POSITIVE_INFINITY, name: 'years' }
]

const formatter = new Intl.RelativeTimeFormat(undefined, {
	numeric: 'auto'
})

// /**
//  * @param {Date} date
//  * @returns
//  */
// export function formatTimeAgo(date) {
// 	console.log('🚀 ~ formatTimeAgo ~ date:', date, new Date())
// 	let duration = (date.getTime() - new Date().getTime()) / 1000
// 	console.log('🚀 ~ formatTimeAgo ~ duration:', duration)

// 	for (let i = 0; i <= DIVISIONS.length; i++) {
// 		const division = DIVISIONS[i]
// 		console.log('🚀 ~ formatTimeAgo ~ division:', division)
// 		console.log(Math.abs(duration) < division.amount)
// 		// if (Math.abs(duration) < division.amount) {
// 		// 	return formatter.format(Math.round(duration), division.name)
// 		// }
// 		// duration /= division.amount
// 	}
// }

/**
 * 상대적 시간 형식으로 변환하는 함수 당일인 경우 "hh:mm AM/PM" 형식으로 표시
 *
 * @param {Date} date - 변환할 날짜
 * @returns {string} 상대적 시간 표현 또는 시간 형식
 */
export function formatTimeAgo(date) {
	// 입력값이 날짜 객체인지 확인
	const inputDate = date instanceof Date ? date : new Date(date)
	const now = new Date()

	// 당일 날짜인지 확인 (년, 월, 일이 같은지)
	const isSameDay =
		inputDate.getFullYear() === now.getFullYear() &&
		inputDate.getMonth() === now.getMonth() &&
		inputDate.getDate() === now.getDate()

	// 당일이면 시간 형식으로 표시
	if (isSameDay) {
		return inputDate.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true // AM/PM 표시
		})
	}

	// 당일이 아니면 상대적 시간 표시
	let duration = (now.getTime() - inputDate.getTime()) / 1000

	// 각 시간 단위별로 확인
	for (let i = 0; i < DIVISIONS.length; i++) {
		const division = DIVISIONS[i]

		// 현재 단위보다 작으면 (예: 59초면 "seconds" 단위 사용)
		if (Math.abs(duration) < division.amount) {
			return formatter.format(Math.round(-duration), division.name)
		}

		// 다음 단위로 변환 (초→분→시→일→주→월→년)
		duration /= division.amount
	}

	// 모든 단위를 벗어나면 (거의 발생하지 않음)
	return formatter.format(Math.round(-duration), 'years')
}
