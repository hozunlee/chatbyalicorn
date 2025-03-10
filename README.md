# 알리콘을 위한 대화방

SvelteKit 기반의 실시간 채팅 시스템 구현
웹소켓을 통한 실시간 통신을 지원하며 Prisma ORM을 활용하여 데이터베이스를 관리합니다.

## 기술스택

프레임워크 : svelteKit( 풀스택 )
실시간 통신 : Socket.IO
스타일링 : shadCN-svelte, tailwind
백엔드 서비스 : Supabase (데이터베이스 및 인증)
ORM : prisma
인증 : google Oauth2
type Check : JSDOC
package manager : PNPM

## 실행 방법

`.env 입력`

```
// DB 환경 구성
PNPM db:generate

// 종속 모듈 설치
PNPM i

// 개발환경 실행
PNPM dev

```

##주요 기능

1. 사용자 인증
   세션 기반 인증 시스템
   Socket.IO 연결 시 쿠키 또는 인증 객체로 사용자 검증
   로그인/로그아웃 기능 (google Oauth2)

2. 채팅방 관리
   채팅방 생성 및 참여
   기존 채팅방 조회
   모든 채팅방 자동 연결 기능

3. 실시간 메시지 교환
   실시간 메시지 송수신

4. 사용자 인터페이스
   데스크톱/모바일 반응형 레이아웃
   채팅방 목록 및 채팅 인터페이스
   새 채팅 시작 및 사용자 검색 기능

## 주요 컴포넌트

### 서버 사이드

`socket-service.js`
Socket.IO 서버 설정 및 이벤트 핸들러 관리
인증 미들웨어 및 채팅방 로직 처리
메시지 저장 및 전달 기능

#### 주요 이벤트:

connection: 클라이언트 연결 처리
join_all_rooms: 사용자의 모든 채팅방 연결
join_room: 특정 채팅방 연결 또는 생성
send_message: 메시지 전송 및 저장

### 클라이언트 사이드

`socket_client.js`
Socket.IO 클라이언트 래퍼 클래스
서버 연결 및 이벤트 처리
채팅방 연결 및 메시지 전송 기능

`Chat.svelte`
메인 채팅 인터페이스
채팅방 목록 및 선택 기능
반응형 레이아웃 (데스크톱/모바일)
새 채팅 시작 기능

`chat-display.svelte`
채팅 메시지 표시 및 입력 인터페이스
메시지 전송 및 실시간 업데이트
메시지 검색 기능
