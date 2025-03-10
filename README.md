# 알리콘을 위한 대화방
<img width="1140" alt="image" src="https://github.com/user-attachments/assets/4c570613-6aa5-48f4-ace4-f6e612a2d14d" />

SvelteKit 기반의 실시간 채팅 시스템 구현
웹소켓을 통한 실시간 통신을 지원하며 Prisma ORM을 활용하여 데이터베이스를 관리합니다.



## 기술스택

프레임워크 : svelteKit

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

## 주요 기능

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

## DB schema
<img width="669" alt="image" src="https://github.com/user-attachments/assets/41a054e1-f220-477b-a198-25f68605068f" />


## 추가기능

 - [x] 로그인, 로그아웃을 할 수 있습니다.
> google oAuth2 로 로그인 / 로그아웃 구현
> sessionId를 cookies에 담아 내부적으로 검증 시스템 마련
![loginout](https://github.com/user-attachments/assets/65715cf3-718b-4ae9-a3cb-c855b12e0d78)
- [x] 비 로그인 사용자 접속 시 로그인을 유도 합니다.
> 비 로그인시 / 접속하여도 sessionId 확인 후 server.hooks 에서 /auth/login으로 redirect
> 로그인 기반 시스템이기 때문에 강제함
- [x] `새 메시지` 버튼 클릭 후 새 대화방 생성 시 대화 상대 검색이 가능합니다.
![usersearch](https://github.com/user-attachments/assets/cf07b91c-aec3-43b6-a075-f5fc37187d4b)

- 대화에 URL이 있는 경우 Clickable하게(실제로 동작) 출력합니다.
> @html 기능을 사용하여 content(대화내용) 의 https:// 를 정규표현식으로 찾은 뒤 <a> tag 로 변환
![linked](https://github.com/user-attachments/assets/ef5d4bc8-8d70-4415-9e68-91bba55f5bf8)


- [x] 대화를 검색할 수 있습니다.
> 대화를 검색하여 하이라이트 처리와 검색 갯수 표시
> 대화로 스크롤링 하는 것은 개선 필요
![search](https://github.com/user-attachments/assets/e3133b89-e857-4a44-898a-a519552d7f10)

## 개선필요 기능
- Responsive를 지원합니다.
> 예시 이미지를 생각하고 desktop 화면부터 구성하여 mobile 화면은 별도 구현
> mobile first로 구현하고 desktop을 확장해나갔어야 하는 아쉬움이 있습니다.
> responsive하게 리팩토링 필요
- 읽지 않은 메시지가 있는 경우 화면상 표기를 다르게 합니다.
> 스키마 구조 변경이 필요하여 isRead를 활용해야할 듯 합니다.
> 현재 1개의 채팅방에 담긴 message를 공유하는 구조라 어려운 부분이 있습니다.
> message model을 좀 더 리팩토링해서 읽기에 대한 flag 를 주는 것이 필요할 것 같습니다.
- 메시지 전송시 상대방에게 Task Queue를 사용하여 메시지 내용을 메일로 전송합니다.
> 구글 로그인으로 email 주소 확보 / nodemailer를 통해 sendMessage event에 sendMail 함수 추가하면 될 것 같습니다.
> 자바스크립트 실행 컨텍스트에 즉시 실행하지 않고 task queue에 넣어 비동기로 백그라운드 처리하면 성능 유지에 나은 결과를 가져올 것 같습니다.
- Production 환경을 구축하여 동작 가능한 임의의 URL로 접속 할 수 있습니다.
> sveltekit을 활용한다는 점을 고민했을 때 별도의 nodejs server를 구축하지 않을 방법을 고민했습니다.
> hooks.server.js를 활용해 socket을 init 시키고 싱글톤으로 구현했습니다.
> 채팅의 경우 svetlekit이 가지고 있는 SSR 기능이 오히려 동기화에 불편함을 가져와 CSR 형식으로 svetlekit의 몇가지 기능만 이용했습니다.
> 초기 데이터 불러오기 / routeing
> vercel의 경우 serveress 기반으로 특정 시간이 지나면 인스턴스가 멈추므로 해당 웹 서비스를 배포하긴 어려움이 있고, nodejs 기반 render를 사용하면 배포 할 수 있는 방법이 있습니다.
> 다른 방법으론 socketIO를 걷어내고 supabase realtime을 이용하는 방법이 있을 것 같습니다.
> 임의 URL의 도메인의 경우는 가지고 있는 도메인에 chat.hololog.dev 처럼 서브 도메인 부여 예정입니다.



## video demo
### desktop
![chat2](https://github.com/user-attachments/assets/25444d80-c1b5-42c0-8591-d0536fad1efc)

### mobile
![mobile](https://github.com/user-attachments/assets/f75e76b0-864f-4092-8630-914a6504db6d)
