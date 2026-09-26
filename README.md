# 🥔 감자마켓 (Gamza)

> 따뜻한 정이 넘치는 우리 동네 이웃과의 중고거래 & 동네생활 웹 플랫폼

---

## 📖 프로젝트 소개

**감자마켓(Gamza)**은 직관적이고 깔끔한 UI를 갖춘 당근마켓 스타일의 중고거래 웹 애플리케이션입니다.  
가까운 동네 이웃과의 따뜻한 직거래부터 실시간 찜하기, 검색 및 필터링, 상품 등록 및 채팅 UI까지 웹 브라우저에서 편리하게 경험할 수 있습니다.

---

## ✨ 주요 기능

- 🔍 **상품 탐색 및 필터링**
  - 최신 등록순 상품 목록 조회
  - 카테고리별(디지털, 가구, 의류, 생활가전 등) 필터링 및 검색어 실시간 검색
- 🛍️ **상품 상세 보기**
  - 상품 이미지 슬라이더, 판매자 매너온도 및 판매 정보
  - 찜하기(좋아요) 토글 및 실시간 찜 개수 반영
- ✏️ **상품 등록 / 수정 / 삭제**
  - 상품 사진 업로드 (Supabase Storage 연동)
  - 가격, 카테고리, 설명 입력 및 유효성 검사
- 💬 **채팅 및 커뮤니케이션 UI**
  - 판매자와의 1:1 대화 모달 인터페이스
- 🔐 **사용자 인증 (Supabase Auth)**
  - 이메일/비밀번호 회원가입 및 로그인 지원
  - 프로필 관리 및 내 거래 내역 확인

---

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend / Database**: Supabase (PostgreSQL, Auth, Storage)
- **Local Server**: Node.js 내장 `http` 모듈 (`server.mjs`)

---

## 🚀 시작하기 (Getting Started)

### 사전 준비사항
- [Node.js](https://nodejs.org/) (v16 이상 권장)

### 1. 저장소 복제 (Clone)
```bash
git clone https://github.com/jjs0388-commits/gamja.git
cd gamja
```

### 2. 로컬 실행
별도의 패키지 설치 없이 Node.js 내장 모듈로 바로 실행 가능합니다.

```bash
npm start
```
또는
```bash
node server.mjs
```

브라우저에서 `http://localhost:3000` 으로 접속합니다.

---

## 🌐 배포 안내

감자마켓은 정적 웹 자원(HTML, CSS, JS)과 Supabase 백엔드로 구성되어 있어 정적 웹 호스팅 서비스에 바로 배포할 수 있습니다:

- **GitHub Pages**: 저장소 Settings -> Pages -> Source: `Deploy from a branch (main)` 설정
- **Vercel / Netlify**: 저장소 연동 후 루트 디렉터리를 정적 파일로 원클릭 배포 가능

---

## 📄 라이선스

This project is licensed under the MIT License.
