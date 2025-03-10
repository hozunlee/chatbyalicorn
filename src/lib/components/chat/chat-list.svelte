<script>
	import { formatDate } from '$lib/utils'

	/**
	 * @typedef {{
	 * 	content: string
	 * 	createdAt: string
	 * 	isMyMessage: boolean
	 * 	senderId: number
	 * 	id: string
	 * }} message
	 */

	/**
	 * @typedef {{
	 * 	messageList: message[]
	 * 	searchTerm: string
	 * }} Props
	 */
	/** @type {Props} */
	const { messageList, searchTerm = '' } = $props()

	/**
	 * 텍스트 내에서 검색어를 강조 표시
	 *
	 * @param text {string} - 검색 대상 텍스트
	 * @param term {string} - 검색어
	 * @returns {string} - 강조 표시된 HTML 문자열
	 */
	function highlightSearchTerm(text, term) {
		if (!text || !term) return convertUrlsToLinks(text)

		const regex = new RegExp(`(${term})`, 'gi')
		const highlighted = convertUrlsToLinks(text).replace(
			regex,
			'<span class="bg-yellow-200 dark:bg-yellow-800">$1</span>'
		)
		return highlighted
	}

	// 필터링된 메시지 목록 계산
	const filteredMessages = $derived(
		searchTerm
			? messageList.filter((message) =>
					message.content.toLowerCase().includes(searchTerm.toLowerCase())
				)
			: messageList
	)

	/**
	 * 문자열 내 URL을 감지하여 클릭 가능한 링크로 변환
	 *
	 * @param {string} text - 변환할 텍스트
	 * @returns {string} HTML 문자열
	 */
	function convertUrlsToLinks(text) {
		if (!text) return ''

		// URL 패턴을 정규 표현식으로 정의
		const urlRegex = /(https?:\/\/[^\s]+)/g

		// URL을 <a> 태그로 변환
		return text.replace(urlRegex, (url) => {
			return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`
		})
	}
</script>

<div class="flex flex-col space-y-4 p-2">
	{#each messageList as message (message.id)}
		<div class="flex {message.isMyMessage ? 'justify-end' : 'justify-start'}">
			<div
				class="max-w-[60%] rounded-lg px-4 py-1 {message.isMyMessage
					? 'text-foreground rounded-br-none bg-orange-300'
					: 'bg-muted text-foreground rounded-bl-none'}"
			>
				<!-- 기존 코드를 {@html}을 사용하여 HTML 태그가 반영되도록 변경 -->
				<p class="break-words">{@html highlightSearchTerm(message.content, searchTerm)}</p>
				<div class=" flex justify-end text-xs opacity-70">
					<span> {formatDate(message.createdAt)} </span>
				</div>
			</div>
		</div>
	{/each}
</div>
<!-- 검색 결과 상태 표시 -->
{#if searchTerm && filteredMessages.length > 0}
	<div class="text-muted-foreground px-4 py-1 text-sm">
		"{searchTerm}" 검색 결과: {filteredMessages.length}개 메시지
	</div>
{:else if searchTerm && filteredMessages.length === 0}
	<div class="text-muted-foreground flex justify-center py-4">검색 결과가 없습니다</div>
{/if}
