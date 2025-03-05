/**
 * 로그인 결과 데이터
 *
 * @typedef {object} Types.UserData 구글 OAuth2를 통한 로그인 데이터
 * @property {string} sub 해당 유저의 고유 식별값
 * @property {string} name 관리자 full name
 * @property {string} given_name 관리자 이름
 * @property {string} family_name 관리자 성
 * @property {string} picture 관리자 프로필 사진 URL
 * @property {string} email 관리자 이메일
 * @property {boolean} email_verified 이메일 검증 여부
 * @property {string} locale 관리자의 지역 설정 정보 (언어 및 국가)
 * @property {string} hd 사용자의 도메인 정보
 */

/**
 * JSON형태로 저장되는 Session 데이터
 *
 * @typedef {object} Types.SessionData
 * @property {string} id
 * @property {string} agent
 * @property {number} expiredAt
 */
