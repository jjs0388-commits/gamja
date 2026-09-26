/**
 * ====================================================================
 * [감자(Gamza) 중고거래 웹 애플리케이션 통합 자바스크립트]
 * - 100% 로컬 고화질 실물 사진 적용
 * - 모달 닫기 시 고스트 클릭/클릭 관통(Click-Through) 완전 차단
 * - 화면 1: 상품 목록, 실시간 검색, 카테고리 필터, 거래 가능만 보기 토글
 * - 화면 2: 상품 상세 팝업(모달), 판매자 정보, 감자 매너온도, 찜/채팅 액션
 * - 화면 3: 글쓰기 모달, 이미지 첨부(파일/URL/샘플), 유효성 검사, 상품 등록
 * ====================================================================
 */

(function () {
  'use strict';

  // ==================================================================
  // 0. 수파베이스 (Supabase) 클라이언트 초기화 & 익명 사용자 식별자
  // ==================================================================
  const SUPABASE_URL = 'https://dauqdiebolsaviguzvrb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdXFkaWVib2xzYXZpZ3V6dnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNDIzNTYsImV4cCI6MjEwNDgxODM1Nn0.9h1T1u9rUOVA_AI-21uDS_urTyymWSUe1STz7zsvNpY';
  const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  // RFC4122 표준 UUID 생성기 (Postgres UUID 타입 호환)
  function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function isValidUUID(str) {
    return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
  }

  // 개인 식별 정보(이메일, 실명, 전화번호) 없이 활동 가능한 익명 식별자 관리
  function getOrCreateLocalUser() {
    let userId = localStorage.getItem('gamza_anon_user_id');
    let userNickname = localStorage.getItem('gamza_anon_nickname');
    if (!userId || !isValidUUID(userId)) {
      userId = generateUUID();
      const prefixes = ['포슬포슬', '따끈따끈', '노릇노릇', '달콤한', '바삭한', '귀여운'];
      const suffixes = ['감자새싹', '통감자', '알감자', '감자칩', '감자튀김'];
      userNickname = prefixes[Math.floor(Math.random() * prefixes.length)] + suffixes[Math.floor(Math.random() * suffixes.length)];
      localStorage.setItem('gamza_anon_user_id', userId);
      localStorage.setItem('gamza_anon_nickname', userNickname);
    }
    return { id: userId, nickname: userNickname };
  }

  // ==================================================================
  // 1. 초기 6개 상품 목업 데이터 (로컬 실제 실물 고화질 사진 - 폴백용)
  // ==================================================================
  const INITIAL_PRODUCTS = [
    {
      id: 1,
      title: '아이폰 14 프로 128GB 스페이스 블랙 (배터리 92%)',
      category: '디지털기기',
      price: 850000,
      isFree: false,
      location: '강남구 역삼동',
      tradeLocation: '역삼역 4번 출구 앞 또는 인근 직거래',
      createdAt: '3분 전',
      status: '판매중',
      imageUrl: 'images/item1_iphone.jpg',
      description: '케이스와 강화유리를 항상 착용하여 기스 하나 없는 S급 풀박스입니다.\n배터리 효율 92%이며 3사 호환 정상 해지된 기기입니다.\n네고 문의는 정중히 사양합니다. 역삼역 인근에서 평일 저녁 직거래 가능해요!',
      seller: {
        nickname: '포슬포슬감자',
        avatar: 'images/user_avatar1.jpg',
        location: '역삼1동',
        temperature: 38.5,
        level: '인증판매자'
      },
      views: 34,
      likes: 12,
      isWished: false,
      isNegotiable: false
    },
    {
      id: 2,
      title: '원목 감성 라탄 인테리어 체어 (카페 의자 스타일)',
      category: '가구/인테리어',
      price: 45000,
      isFree: false,
      location: '마포구 연남동',
      tradeLocation: '홍대입구역 3번 출구 또는 연남동 주민센터',
      createdAt: '15분 전',
      status: '판매중',
      imageUrl: 'images/item2_chair.jpg',
      description: '인테리어 촬영 소품용으로 3달 정도 실내에서만 사용했습니다.\n원목 느낌이 아주 따뜻하고 튼튼합니다. 흔들림 없으며 상태 깨끗합니다.\n부피가 있어 연남동 직거래 선호합니다.',
      seller: {
        nickname: '알감자조림',
        avatar: 'images/user_avatar2.jpg',
        location: '연남동',
        temperature: 42.0,
        level: '우수 감자'
      },
      views: 58,
      likes: 8,
      isWished: true,
      isNegotiable: true
    },
    {
      id: 3,
      title: '핸드메이드 브라운 케이블 오버핏 니트 (Free 사이즈)',
      category: '의류',
      price: 28000,
      isFree: false,
      location: '용산구 한남동',
      tradeLocation: '한강진역 1번 출구 앞',
      createdAt: '42분 전',
      status: '예약중',
      imageUrl: 'images/item3_knit.jpg',
      description: '따뜻한 감자색 꽈배기 오버핏 니트입니다.\n1회 단시간 착용 후 드라이클리닝 완료하여 보관 중입니다.\n보풀이나 늘어남 일절 없습니다. 남녀공용으로 입기 좋아요.',
      seller: {
        nickname: '감자튀김러버',
        avatar: 'images/user_avatar1.jpg',
        location: '한남동',
        temperature: 36.8,
        level: '친절 감자'
      },
      views: 89,
      likes: 19,
      isWished: false,
      isNegotiable: false
    },
    {
      id: 4,
      title: '필립스 에센셜 에어프라이어 4.1L 블랙 (HD9200)',
      category: '생활가전',
      price: 35000,
      isFree: false,
      location: '송파구 잠실동',
      tradeLocation: '잠실새내역 인근 아파트 단지 앞',
      createdAt: '2시간 전',
      status: '거래 완료',
      imageUrl: 'images/item4_airfryer.jpg',
      description: '더 큰 대용량 모델로 변경하면서 판매합니다.\n정상 작동 완벽하며 내부 바스켓 깨끗하게 세척/소독 완료했습니다.\n사용감 적고 바로 사용하실 수 있습니다.',
      seller: {
        nickname: '햇감자수확',
        avatar: 'images/user_avatar2.jpg',
        location: '잠실본동',
        temperature: 37.2,
        level: '인증판매자'
      },
      views: 112,
      likes: 4,
      isWished: false,
      isNegotiable: false
    },
    {
      id: 5,
      title: '슬램덩크 신장재편판 1~20권 전권 세트 (미개봉 다수)',
      category: '도서/티켓',
      price: 75000,
      isFree: false,
      location: '서초구 반포동',
      tradeLocation: '고속터미널역 8-1번 출구 앞',
      createdAt: '4시간 전',
      status: '판매중',
      imageUrl: 'images/item5_books.jpg',
      description: '소장용으로 구입 후 랩핑 보관했습니다.\n1~5권만 1회 정독했고 나머지는 새 책 컨디션입니다.\n모서리 찍힘이나 변색 전혀 없습니다.',
      seller: {
        nickname: '구운감자칩',
        avatar: 'images/user_avatar1.jpg',
        location: '반포4동',
        temperature: 45.1,
        level: '열정 감자'
      },
      views: 140,
      likes: 27,
      isWished: false,
      isNegotiable: true
    },
    {
      id: 6,
      title: '커스텀 레트로 기계식 키보드 (황축, 윤활 완료)',
      category: '디지털기기',
      price: 52000,
      isFree: false,
      location: '성남시 분당구 정자동',
      tradeLocation: '정자역 3번 출구 또는 미금역',
      createdAt: '6시간 전',
      status: '판매중',
      imageUrl: 'images/item6_keyboard.jpg',
      description: '부드러운 조약돌 소리가 나는 풀윤활 기계식 키보드입니다.\n블루투스 무선 및 C타입 유선 겸용 모델이며 충전 케이블과 키캡 리무버 함께 드립니다.',
      seller: {
        nickname: '통감자버터구이',
        avatar: 'images/user_avatar2.jpg',
        location: '정자동',
        temperature: 39.0,
        level: '인증판매자'
      },
      views: 95,
      likes: 15,
      isWished: false,
      isNegotiable: false
    },
    {
      id: 7,
      title: '원목 프리미엄 캣타워 & 스크래쳐 풀세트 (미사용 새상품급)',
      category: '반려동물 용품',
      price: 65000,
      isFree: false,
      location: '마포구 망원동',
      tradeLocation: '망원역 2번 출구 앞 또는 인근 직거래',
      createdAt: '30분 전',
      status: '판매중',
      imageUrl: 'images/sample_potato.jpg',
      description: '인테리어 효과도 뛰어난 자작나무 원목 캣타워입니다.\n사이즈 미스로 조립 후 미사용 상태로 보관 중입니다.\n스크래쳐 패드와 해먹까지 풀구성입니다. 부피가 있어 직거래 희망합니다!',
      seller: {
        nickname: '포근한강아지',
        avatar: 'images/user_avatar1.jpg',
        location: '망원2동',
        temperature: 41.5,
        level: '우수 감자'
      },
      views: 28,
      likes: 9,
      isWished: false,
      isNegotiable: true
    }
  ];

  // ==================================================================
  // 2. 전역 상태 (Application State)
  // ==================================================================
  const state = {
    products: [...INITIAL_PRODUCTS],
    activeCategory: '전체',
    searchKeyword: '',
    availableOnly: false,
    currentDetailItem: null,
    currentUser: null, // { id, email, nickname, avatar_url, location, temperature, level }
  };

  // ★ 클릭 관통(Ghost Click) 방지 타임스탬프
  let lastModalClosedTime = 0;
  const MODAL_CLICK_THROUGH_GUARD_MS = 400; // 400ms 이내의 관통 클릭 무시

  // 로그인 후 실행할 지연 액션 (예: 'openWriteModal')
  let pendingActionAfterLogin = null;
  let authModalTimer = null;

  const DEFAULT_REAL_IMAGE = 'images/sample_potato.jpg';
  const DEFAULT_REAL_AVATAR = 'images/user_avatar1.jpg';

  // ==================================================================
  // 3. 유틸리티 함수
  // ==================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case '판매중':
        return 'badge-selling';
      case '예약중':
        return 'badge-reserved';
      case '거래 완료':
      case '거래완료':
        return 'badge-completed';
      default:
        return 'badge-selling';
    }
  }

  function showToast(message) {
    let toast = document.getElementById('gamza-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'gamza-toast';
      toast.className = 'gamza-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    if (toast._timer) clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // ==================================================================
  // 3-1. [화면 4] 수파베이스(Supabase) Auth 및 인증 모달 제어
  // ==================================================================
  function updateHeaderAuthUI() {
    const btnLogin = document.getElementById('btn-login');
    const userMenu = document.getElementById('user-profile-menu');
    const headerNick = document.getElementById('header-user-text');
    const headerAvatar = document.getElementById('header-user-avatar');

    if (state.currentUser) {
      if (btnLogin) btnLogin.style.display = 'none';
      if (userMenu) userMenu.style.display = 'flex';
      if (headerNick) headerNick.textContent = state.currentUser.nickname || '감자이웃';
      if (headerAvatar) {
        headerAvatar.src = state.currentUser.avatar_url || DEFAULT_REAL_AVATAR;
        headerAvatar.onerror = function () {
          this.onerror = null;
          this.src = DEFAULT_REAL_AVATAR;
        };
      }
    } else {
      if (btnLogin) btnLogin.style.display = 'inline-block';
      if (userMenu) userMenu.style.display = 'none';
    }
  }

  async function fetchUserProfile(userId) {
    if (!supabase || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        console.warn('프로필 조회 오류:', error);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('프로필 조회 예외:', e);
      return null;
    }
  }

  async function syncCurrentUser(user) {
    if (!user) {
      state.currentUser = null;
      updateHeaderAuthUI();
      return;
    }

    try {
      let profile = await fetchUserProfile(user.id);
      let defaultNick = user.user_metadata?.nickname || (user.email ? user.email.split('@')[0] : '감자이웃');

      if (!profile) {
        const { data: newProfile, error: insErr } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            nickname: defaultNick,
            avatar_url: DEFAULT_REAL_AVATAR,
            location: '역삼1동',
            manner_temperature: 36.5,
            seller_level: '신규 감자'
          })
          .select()
          .maybeSingle();

        if (!insErr && newProfile) {
          profile = newProfile;
        }
      }

      state.currentUser = {
        id: user.id,
        email: user.email,
        nickname: (profile && profile.nickname) || defaultNick,
        avatar_url: (profile && profile.avatar_url) || DEFAULT_REAL_AVATAR,
        location: (profile && profile.location) || '역삼1동',
        temperature: parseFloat(profile?.manner_temperature) || 36.5,
        level: (profile && profile.seller_level) || '신규 감자'
      };
    } catch (err) {
      console.error('사용자 동기화 실패:', err);
      state.currentUser = {
        id: user.id,
        email: user.email,
        nickname: user.user_metadata?.nickname || '감자이웃',
        avatar_url: DEFAULT_REAL_AVATAR,
        location: '역삼1동',
        temperature: 36.5,
        level: '신규 감자'
      };
    }

    updateHeaderAuthUI();
  }

  async function initAuth() {
    updateHeaderAuthUI();
    if (!supabase) return;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session && session.user) {
        await syncCurrentUser(session.user);
      } else {
        state.currentUser = null;
        updateHeaderAuthUI();
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🥔 Supabase Auth Event:', event);
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
          if (session && session.user) {
            await syncCurrentUser(session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          state.currentUser = null;
          updateHeaderAuthUI();
        }
      });
    } catch (err) {
      console.warn('초기 인증 세션 확인 오류:', err);
    }
  }

  function openAuthModal(initialTab = 'login', noticeText = '') {
    if (Date.now() - lastModalClosedTime < MODAL_CLICK_THROUGH_GUARD_MS) return;

    const modalEl = document.getElementById('gamza-auth-modal');
    if (!modalEl) return;

    // 안내 배너 설정
    const bannerEl = document.getElementById('auth-notice-banner');
    const noticeTextEl = document.getElementById('auth-notice-text');
    if (bannerEl && noticeTextEl) {
      if (noticeText) {
        noticeTextEl.textContent = noticeText;
        bannerEl.style.display = 'flex';
      } else {
        bannerEl.style.display = 'none';
      }
    }

    switchAuthTab(initialTab);

    if (authModalTimer) {
      clearTimeout(authModalTimer);
      authModalTimer = null;
    }
    modalEl.classList.remove('is-closing');

    requestAnimationFrame(() => {
      modalEl.classList.add('is-open');
      modalEl.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');

      const focusTarget = initialTab === 'signup'
        ? document.getElementById('signup-nickname')
        : document.getElementById('login-email');
      if (focusTarget) {
        setTimeout(() => focusTarget.focus(), 120);
      }
    });
  }

  function closeAuthModal(e) {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      pendingActionAfterLogin = null;
    }

    lastModalClosedTime = Date.now();

    const modalEl = document.getElementById('gamza-auth-modal');
    if (modalEl && modalEl.classList.contains('is-open')) {
      if (authModalTimer) clearTimeout(authModalTimer);

      modalEl.classList.add('is-closing');
      modalEl.classList.remove('is-open');
      modalEl.setAttribute('aria-hidden', 'true');

      authModalTimer = setTimeout(() => {
        modalEl.classList.remove('is-closing');
        const detailModal = document.getElementById('gamzaDetailModal');
        const writeModal = document.getElementById('gamza-write-modal');
        const anyModalOpen = (detailModal && detailModal.classList.contains('is-open')) ||
                             (writeModal && writeModal.classList.contains('is-open'));
        if (!anyModalOpen) {
          document.body.classList.remove('modal-open');
        }
        authModalTimer = null;
      }, 240);
    }

    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  }

  function clearAuthErrors() {
    const loginErr = document.getElementById('login-error-msg');
    const signupErr = document.getElementById('signup-error-msg');
    if (loginErr) {
      loginErr.textContent = '';
      loginErr.style.display = 'none';
    }
    if (signupErr) {
      signupErr.textContent = '';
      signupErr.style.display = 'none';
    }
  }

  function showAuthError(formType, message) {
    const errEl = document.getElementById(`${formType}-error-msg`);
    if (errEl) {
      errEl.textContent = message;
      errEl.style.display = 'block';
    }
  }

  function switchAuthTab(tab) {
    clearAuthErrors();
    const tabLogin = document.getElementById('tab-auth-login');
    const tabSignup = document.getElementById('tab-auth-signup');
    const formLogin = document.getElementById('form-auth-login');
    const formSignup = document.getElementById('form-auth-signup');

    if (tab === 'signup') {
      if (tabLogin) {
        tabLogin.classList.remove('active');
        tabLogin.setAttribute('aria-selected', 'false');
      }
      if (tabSignup) {
        tabSignup.classList.add('active');
        tabSignup.setAttribute('aria-selected', 'true');
      }
      if (formLogin) formLogin.style.display = 'none';
      if (formSignup) formSignup.style.display = 'flex';
      const input = document.getElementById('signup-nickname');
      if (input) setTimeout(() => input.focus(), 60);
    } else {
      if (tabLogin) {
        tabLogin.classList.add('active');
        tabLogin.setAttribute('aria-selected', 'true');
      }
      if (tabSignup) {
        tabSignup.classList.remove('active');
        tabSignup.setAttribute('aria-selected', 'false');
      }
      if (formLogin) formLogin.style.display = 'flex';
      if (formSignup) formSignup.style.display = 'none';
      const input = document.getElementById('login-email');
      if (input) setTimeout(() => input.focus(), 60);
    }
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    clearAuthErrors();

    const emailInput = document.getElementById('login-email');
    const pwdInput = document.getElementById('login-password');
    const email = emailInput ? emailInput.value.trim() : '';
    const password = pwdInput ? pwdInput.value : '';

    if (!email) {
      showAuthError('login', '이메일 주소를 입력해주세요.');
      if (emailInput) emailInput.focus();
      return;
    }
    if (!password) {
      showAuthError('login', '비밀번호를 입력해주세요.');
      if (pwdInput) pwdInput.focus();
      return;
    }

    const submitBtn = document.getElementById('btn-submit-login');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳</span> 로그인 중...';
    }

    try {
      if (!supabase) {
        showAuthError('login', '수파베이스 연결이 설정되지 않았습니다.');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Invalid login credentials')) {
          msg = '이메일 또는 비밀번호가 일치하지 않습니다.';
        } else if (msg.includes('Email not confirmed')) {
          msg = '이메일 인증이 필요합니다. 메일함을 확인해주세요.';
        }
        showAuthError('login', msg);
        return;
      }

      if (data && data.user) {
        await syncCurrentUser(data.user);
        closeAuthModal();
        showToast(`🥔 '${state.currentUser?.nickname || '감자'}'님, 반갑습니다!`);

        // 비로그인 상태에서 글쓰기 눌렀던 경우 이어 열기
        if (pendingActionAfterLogin === 'openWriteModal') {
          pendingActionAfterLogin = null;
          setTimeout(() => {
            lastModalClosedTime = 0;
            openWriteModal();
          }, 280);
        }
      }
    } catch (err) {
      console.error('로그인 예외:', err);
      showAuthError('login', '로그인 처리 중 오류가 발생했습니다.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>🥔</span> 로그인';
      }
    }
  }

  async function handleSignUpSubmit(e) {
    e.preventDefault();
    clearAuthErrors();

    const nickInput = document.getElementById('signup-nickname');
    const emailInput = document.getElementById('signup-email');
    const pwdInput = document.getElementById('signup-password');
    const pwdConfInput = document.getElementById('signup-password-confirm');

    const nickname = nickInput ? nickInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = pwdInput ? pwdInput.value : '';
    const confirm = pwdConfInput ? pwdConfInput.value : '';

    if (!nickname) {
      showAuthError('signup', '닉네임을 입력해주세요.');
      if (nickInput) nickInput.focus();
      return;
    }
    if (nickname.length < 2) {
      showAuthError('signup', '닉네임은 2자 이상 입력해주세요.');
      if (nickInput) nickInput.focus();
      return;
    }
    if (!email) {
      showAuthError('signup', '이메일 주소를 입력해주세요.');
      if (emailInput) emailInput.focus();
      return;
    }
    if (!password) {
      showAuthError('signup', '비밀번호를 입력해주세요.');
      if (pwdInput) pwdInput.focus();
      return;
    }
    if (password.length < 6) {
      showAuthError('signup', '비밀번호는 최소 6자리 이상이어야 합니다.');
      if (pwdInput) pwdInput.focus();
      return;
    }
    if (password !== confirm) {
      showAuthError('signup', '비밀번호가 일치하지 않습니다.');
      if (pwdConfInput) pwdConfInput.focus();
      return;
    }

    const submitBtn = document.getElementById('btn-submit-signup');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳</span> 회원가입 중...';
    }

    try {
      if (!supabase) {
        showAuthError('signup', '수파베이스 연결이 설정되지 않았습니다.');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: nickname
          }
        }
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('User already registered') || msg.includes('already registered')) {
          msg = '이미 등록된 이메일 주소입니다. 로그인해주세요.';
        } else if (msg.includes('Password should be at least 6 characters')) {
          msg = '비밀번호는 6자리 이상이어야 합니다.';
        } else if (msg.includes('valid email')) {
          msg = '올바른 이메일 형식을 입력해주세요.';
        }
        showAuthError('signup', msg);
        return;
      }

      if (data && data.user) {
        // 프로필 테이블 upsert
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            nickname: nickname,
            avatar_url: DEFAULT_REAL_AVATAR,
            location: '역삼1동',
            manner_temperature: 36.5,
            seller_level: '신규 감자'
          });
        } catch (pe) {
          console.warn('프로필 upsert 예외:', pe);
        }

        // 세션이 있는 경우 (이메일 확인 불필요)
        if (data.session) {
          await syncCurrentUser(data.user);
          closeAuthModal();
          showToast(`🥔 환영합니다, ${nickname}님!`);

          if (pendingActionAfterLogin === 'openWriteModal') {
            pendingActionAfterLogin = null;
            setTimeout(() => {
              lastModalClosedTime = 0;
              openWriteModal();
            }, 280);
          }
        } else {
          // 이메일 확인이 필요한 경우
          showToast('📧 인증 이메일이 발송되었습니다. 메일 확인 후 로그인해주세요!');
          switchAuthTab('login');
          const loginEmail = document.getElementById('login-email');
          if (loginEmail) {
            loginEmail.value = email;
            const pwd = document.getElementById('login-password');
            if (pwd) pwd.focus();
          }
        }
      }
    } catch (err) {
      console.error('회원가입 예외:', err);
      showAuthError('signup', '회원가입 처리 중 오류가 발생했습니다.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>🌱</span> 감자마켓 회원가입 완료';
      }
    }
  }

  async function handleLogout() {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      state.currentUser = null;
      updateHeaderAuthUI();
      showToast('🥔 로그아웃되었습니다. 다음에 또 만나요!');
    } catch (err) {
      console.error('로그아웃 오류:', err);
      state.currentUser = null;
      updateHeaderAuthUI();
    }
  }

  // ==================================================================
  // 3-2. [화면 5] 내 프로필 수정 및 프로필 이미지 관리 모듈
  // ==================================================================
  let profileModalTimer = null;

  function openProfileModal() {
    if (Date.now() - lastModalClosedTime < MODAL_CLICK_THROUGH_GUARD_MS) return;

    if (!state.currentUser) {
      openAuthModal('login', '🥔 프로필을 확인하고 수정하려면 먼저 로그인해주세요!');
      return;
    }

    const modalEl = document.getElementById('gamza-profile-modal');
    if (!modalEl) return;

    // 폼 값 초기화 및 현재 사용자 정보 채우기
    const previewImg = document.getElementById('profile-avatar-preview');
    const avatarUrlInput = document.getElementById('profile-avatar-url');
    const nickInput = document.getElementById('profile-nickname');
    const nickCount = document.getElementById('profile-nick-count');
    const locationSelect = document.getElementById('profile-location');
    const emailInput = document.getElementById('profile-email');
    const tempEl = document.getElementById('profile-display-temp');
    const levelEl = document.getElementById('profile-display-level');
    const errorBanner = document.getElementById('profile-error-msg');
    const nickError = document.getElementById('error-profile-nickname');

    const curAvatar = state.currentUser.avatar_url || DEFAULT_REAL_AVATAR;
    if (previewImg) {
      previewImg.onerror = function () {
        this.onerror = null;
        this.src = DEFAULT_REAL_AVATAR;
      };
      previewImg.src = curAvatar;
    }
    if (avatarUrlInput) avatarUrlInput.value = curAvatar;

    // 프리셋 버튼 활성화 상태 갱신
    updatePresetAvatarActive(curAvatar);

    if (nickInput) {
      nickInput.value = state.currentUser.nickname || '';
      nickInput.classList.remove('has-error');
      if (nickCount) nickCount.textContent = (state.currentUser.nickname || '').length;
    }
    if (nickError) {
      nickError.textContent = '';
      nickError.classList.remove('show');
    }
    if (locationSelect) {
      locationSelect.value = state.currentUser.location || '역삼1동';
    }
    if (emailInput) {
      emailInput.value = state.currentUser.email || '';
    }
    if (tempEl) {
      tempEl.textContent = `${state.currentUser.temperature || 36.5}℃`;
    }
    if (levelEl) {
      levelEl.textContent = state.currentUser.level || '인증판매자';
    }
    if (errorBanner) {
      errorBanner.style.display = 'none';
      errorBanner.textContent = '';
    }

    if (profileModalTimer) {
      clearTimeout(profileModalTimer);
      profileModalTimer = null;
    }
    modalEl.classList.remove('is-closing');

    requestAnimationFrame(() => {
      modalEl.classList.add('is-open');
      modalEl.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');

      if (nickInput) {
        setTimeout(() => nickInput.focus(), 120);
      }
    });
  }

  function closeProfileModal(e) {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
    }

    lastModalClosedTime = Date.now();
    const modalEl = document.getElementById('gamza-profile-modal');
    if (modalEl && (modalEl.classList.contains('is-open') || modalEl.classList.contains('active'))) {
      if (profileModalTimer) clearTimeout(profileModalTimer);

      modalEl.classList.add('is-closing');
      modalEl.classList.remove('is-open');
      modalEl.setAttribute('aria-hidden', 'true');

      profileModalTimer = setTimeout(() => {
        modalEl.classList.remove('is-closing');
        document.body.classList.remove('modal-open');
        profileModalTimer = null;
      }, 260);
    }
  }

  function updatePresetAvatarActive(avatarUrl) {
    const presetBtns = document.querySelectorAll('.preset-avatar-btn');
    presetBtns.forEach(btn => {
      if (btn.dataset.avatar === avatarUrl) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function setProfileAvatar(avatarUrl, isPreset = false) {
    const previewImg = document.getElementById('profile-avatar-preview');
    const avatarUrlInput = document.getElementById('profile-avatar-url');

    if (previewImg) {
      previewImg.onerror = function () {
        this.onerror = null;
        this.src = DEFAULT_REAL_AVATAR;
      };
      previewImg.src = avatarUrl;
    }
    if (avatarUrlInput) {
      avatarUrlInput.value = avatarUrl;
    }
    updatePresetAvatarActive(avatarUrl);
  }

  // 프로필 이미지 압축 및 DataURL 변환 (400x400 스마트 캔버스 최적화)
  function compressAndSetProfileImage(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('⚠️ 이미지 파일(JPG, PNG 등)만 등록할 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setProfileAvatar(dataUrl, false);
        showToast('📷 프로필 사진이 등록되었습니다! [저장 완료]를 눌러주세요.');
      };
      img.onerror = () => {
        showToast('⚠️ 이미지 로드에 실패했습니다. 다른 사진을 선택해주세요.');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function handleProfileSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!state.currentUser) return;

    const nickInput = document.getElementById('profile-nickname');
    const locationSelect = document.getElementById('profile-location');
    const avatarUrlInput = document.getElementById('profile-avatar-url');
    const submitBtn = document.getElementById('btn-submit-profile');
    const submitText = document.getElementById('submit-profile-text');
    const errorBanner = document.getElementById('profile-error-msg');
    const nickError = document.getElementById('error-profile-nickname');

    const newNickname = nickInput ? nickInput.value.trim() : '';
    const newLocation = locationSelect ? locationSelect.value : '역삼1동';
    const newAvatar = (avatarUrlInput && avatarUrlInput.value) ? avatarUrlInput.value : DEFAULT_REAL_AVATAR;

    // 유효성 검사
    if (!newNickname || newNickname.length < 2) {
      if (nickError) {
        nickError.textContent = '닉네임은 2자 이상 입력해주세요.';
        nickError.classList.add('show');
      }
      if (nickInput) nickInput.classList.add('has-error');
      return;
    }
    if (newNickname.length > 15) {
      if (nickError) {
        nickError.textContent = '닉네임은 15자 이내로 입력해주세요.';
        nickError.classList.add('show');
      }
      if (nickInput) nickInput.classList.add('has-error');
      return;
    }

    if (nickError) {
      nickError.textContent = '';
      nickError.classList.remove('show');
    }
    if (nickInput) nickInput.classList.remove('has-error');
    if (errorBanner) {
      errorBanner.style.display = 'none';
      errorBanner.textContent = '';
    }

    // 저장 버튼 로딩 상태
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = '저장 중... 🥔';

    try {
      if (supabase) {
        // 1. profiles 테이블 업데이트
        const { error: profErr } = await supabase
          .from('profiles')
          .update({
            nickname: newNickname,
            avatar_url: newAvatar,
            location: newLocation
          })
          .eq('id', state.currentUser.id);

        if (profErr) {
          console.warn('프로필 테이블 업데이트 실패:', profErr);
          // RLS 또는 행 부재 시 upsert 시도
          await supabase.from('profiles').upsert({
            id: state.currentUser.id,
            nickname: newNickname,
            avatar_url: newAvatar,
            location: newLocation
          });
        }

        // 2. Supabase Auth 사용자 메타데이터 동기화
        await supabase.auth.updateUser({
          data: {
            nickname: newNickname,
            avatar_url: newAvatar
          }
        });
      }

      // 로컬 상태 즉시 갱신
      state.currentUser.nickname = newNickname;
      state.currentUser.avatar_url = newAvatar;
      state.currentUser.location = newLocation;

      // 헤더 및 UI 즉시 재렌더링
      updateHeaderAuthUI();

      closeProfileModal();
      showToast(`🥔 프로필이 성공적으로 변경되었습니다! 반가워요, ${newNickname}님.`);
    } catch (err) {
      console.error('프로필 저장 중 오류:', err);
      if (errorBanner) {
        errorBanner.textContent = '프로필 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        errorBanner.style.display = 'block';
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (submitText) submitText.textContent = '🥔 프로필 저장 완료';
    }
  }

  // ==================================================================
  // 4. [화면 1] 수파베이스(Supabase) 연동 & 상품 목록 렌더링 & 검색/필터
  // ==================================================================
  function formatRelativeTime(dateString) {
    if (!dateString) return '방금 전';
    const now = new Date();
    const date = new Date(dateString);
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return '방금 전';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay}일 전`;
    return `${Math.floor(diffDay / 30)}달 전`;
  }

  async function loadProductsFromSupabase() {
    if (!supabase) {
      console.warn('⚠️ 수파베이스 SDK 미로드 - 초기 목업 데이터를 유지합니다.');
      renderProductList();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          seller_id,
          title,
          category,
          price,
          is_free,
          status,
          image_url,
          location,
          trade_location,
          description,
          is_negotiable,
          views,
          likes_count,
          created_at,
          profiles (
            id,
            nickname,
            avatar_url,
            location,
            manner_temperature,
            seller_level
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('수파베이스 상품 조회 오류:', error);
        return;
      }

      if (data && data.length > 0) {
        const localUser = getOrCreateLocalUser();
        let userLikedIds = [];
        try {
          const { data: likesData } = await supabase
            .from('product_likes')
            .select('product_id')
            .eq('user_id', localUser.id);
          if (likesData) {
            userLikedIds = likesData.map(l => l.product_id);
          }
        } catch (e) {
          console.warn('찜 목록 로드 실패, 로컬 스토리지 사용:', e);
        }

        const localLikedIds = JSON.parse(localStorage.getItem('gamza_liked_products') || '[]');
        const likedIds = new Set([...localLikedIds, ...userLikedIds]);

        state.products = data.map(item => {
          const seller = item.profiles || {};
          return {
            id: item.id,
            sellerId: item.seller_id || seller.id,
            title: item.title,
            category: item.category,
            price: item.price,
            isFree: item.is_free,
            location: item.location,
            tradeLocation: item.trade_location || `${item.location} 인근 직거래 선호`,
            createdAt: formatRelativeTime(item.created_at),
            status: item.status,
            imageUrl: item.image_url,
            description: item.description,
            seller: {
              id: seller.id || item.seller_id,
              nickname: seller.nickname || '익명의 감자',
              avatar: seller.avatar_url || DEFAULT_REAL_AVATAR,
              location: seller.location || item.location,
              temperature: parseFloat(seller.manner_temperature) || 36.5,
              level: seller.seller_level || '인증판매자'
            },
            views: item.views || 0,
            likes: item.likes_count || 0,
            isWished: likedIds.has(item.id),
            isNegotiable: item.is_negotiable
          };
        });

        renderProductList();
      }
    } catch (err) {
      console.error('수파베이스 데이터 연동 예외:', err);
    }
  }

  function setupSupabaseRealtime() {
    if (!supabase) return;
    try {
      supabase
        .channel('public:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
          console.log('🥔 수파베이스 실시간 변경 감지:', payload.eventType);
          loadProductsFromSupabase();
        })
        .subscribe();
    } catch (err) {
      console.warn('Realtime 구독 실패 (폴링 유지):', err);
    }
  }

  function getFilteredProducts() {
    return state.products.filter(item => {
      // 1) 카테고리 필터
      const isPetCategory = (cat) => cat === '반려동물 용품' || cat === '변려동물 용품' || cat === '반려동물' || cat === '변려동물';
      const matchCategory = (state.activeCategory === '전체' ||
        item.category === state.activeCategory ||
        (isPetCategory(state.activeCategory) && isPetCategory(item.category)));

      // 2) 검색어 필터 (제목 및 동네)
      const keyword = state.searchKeyword.trim().toLowerCase();
      const matchKeyword = !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        (item.location && item.location.toLowerCase().includes(keyword));

      // 3) 거래 가능만 보기 필터 ('거래 완료' 제외)
      const matchAvailable = !state.availableOnly || (item.status !== '거래 완료' && item.status !== '거래완료');

      return matchCategory && matchKeyword && matchAvailable;
    });
  }

  function renderProductList() {
    const gridEl = document.getElementById('gamza-product-grid');
    const emptyEl = document.getElementById('gamza-empty-state');
    const countEl = document.getElementById('product-count-display');

    if (!gridEl) return;

    const filteredItems = getFilteredProducts();

    if (countEl) {
      countEl.textContent = filteredItems.length;
    }

    gridEl.innerHTML = '';

    if (filteredItems.length === 0) {
      gridEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'block';
    } else {
      gridEl.style.display = 'grid';
      if (emptyEl) emptyEl.style.display = 'none';

      filteredItems.forEach(item => {
        const isCompleted = item.status === '거래 완료' || item.status === '거래완료';
        const badgeClass = getStatusBadgeClass(item.status);
        const priceDisplay = item.isFree || item.price === 0 
          ? '<span class="card-price" style="color: var(--gamza-brown-dark);">무료나눔</span>'
          : `<span class="card-price">${(Number(item.price) || 0).toLocaleString('ko-KR')}<span class="currency">원</span></span>`;

        const card = document.createElement('article');
        card.className = `gamza-card ${isCompleted ? 'is-completed' : ''}`;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `${item.title}, ${item.price}원`);

        const itemImg = item.imageUrl || item.image || DEFAULT_REAL_IMAGE;

        card.innerHTML = `
          <div class="card-thumbnail-wrap">
            <img 
              src="${itemImg}" 
              alt="${item.title}" 
              class="card-img" 
              loading="lazy"
            />
            <span class="card-status-badge ${badgeClass}">${item.status}</span>
          </div>
          <div class="card-body">
            <span class="card-category-tag">${escapeHtml(item.category)}</span>
            <h4 class="card-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h4>
            <div class="card-meta">
              <span class="card-seller" title="작성자: ${escapeHtml(item.seller?.nickname || '감자이웃')}">${escapeHtml(item.seller?.nickname || '감자이웃')}</span>
              <span class="card-meta-dot">·</span>
              <span class="card-location">${escapeHtml(item.location || '동네 미지정')}</span>
              <span class="card-meta-dot">·</span>
              <span class="card-time">${item.createdAt || '방금 전'}</span>
            </div>
            <div class="card-footer">
              ${priceDisplay}
            </div>
          </div>
        `;

        const imgTag = card.querySelector('.card-img');
        if (imgTag) {
          imgTag.onerror = function () {
            this.onerror = null;
            this.src = DEFAULT_REAL_IMAGE;
          };
        }

        // ★ 클릭 이벤트 (모달 닫힘 직후 고스트 클릭 원천 차단 가드)
        card.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (Date.now() - lastModalClosedTime < MODAL_CLICK_THROUGH_GUARD_MS) {
            console.log('🛡️ 고스트 클릭 무시됨');
            return;
          }
          openDetailModal(item);
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (Date.now() - lastModalClosedTime < MODAL_CLICK_THROUGH_GUARD_MS) return;
            openDetailModal(item);
          }
        });

        gridEl.appendChild(card);
      });
    }
  }

  // ==================================================================
  // 4.5. 작성자 판별 유틸
  // ==================================================================
  function isCurrentUserAuthor(item) {
    if (!state.currentUser || !item) return false;
    const currentUserId = state.currentUser.id;
    if (item.sellerId && item.sellerId === currentUserId) return true;
    if (item.seller && item.seller.id && item.seller.id === currentUserId) return true;
    // 닉네임 일치 (목업 데이터 등 호환성)
    if (state.currentUser.nickname && item.seller?.nickname && state.currentUser.nickname === item.seller.nickname) {
      return true;
    }
    return false;
  }

  // ==================================================================
  // 5. [화면 2] 상품 상세 팝업 (모달) 로직
  // ==================================================================
  function openDetailModal(item) {
    if (!item) return;
    if (Date.now() - lastModalClosedTime < MODAL_CLICK_THROUGH_GUARD_MS) return;
    
    state.currentDetailItem = item;

    const modalEl = document.getElementById('gamzaDetailModal');
    if (!modalEl) return;

    // 1) 대표 실물 이미지
    const imgEl = document.getElementById('modalProductImage');
    if (imgEl) {
      imgEl.onerror = function () {
        this.onerror = null;
        this.src = DEFAULT_REAL_IMAGE;
      };
      imgEl.src = item.imageUrl || item.image || DEFAULT_REAL_IMAGE;
      imgEl.alt = item.title || '상품 이미지';
    }

    // 2) 판매 상태 뱃지
    const statusBadge = document.getElementById('modalStatusBadge');
    if (statusBadge) {
      statusBadge.textContent = item.status || '판매중';
      statusBadge.className = 'gamza-badge ' + getStatusBadgeClass(item.status);
    }

    // 3) 카테고리 뱃지
    const catBadge = document.getElementById('modalCategoryBadge');
    if (catBadge) {
      catBadge.textContent = item.category || '기타';
    }

    // 4) 판매자 정보
    const seller = item.seller || {};
    const avatarEl = document.getElementById('modalSellerAvatar');
    if (avatarEl) {
      avatarEl.onerror = function () {
        this.onerror = null;
        this.src = DEFAULT_REAL_AVATAR;
      };
      avatarEl.src = seller.avatar || DEFAULT_REAL_AVATAR;
    }

    const nickEl = document.getElementById('modalSellerNickname');
    if (nickEl) nickEl.textContent = seller.nickname || '익명의 감자';

    const sLocEl = document.getElementById('modalSellerLocation');
    if (sLocEl) sLocEl.textContent = seller.location || item.location || '동네 인증 완료';

    const temp = seller.temperature || 36.5;
    const tempValEl = document.getElementById('modalSellerTemp');
    if (tempValEl) tempValEl.textContent = `${temp.toFixed(1)}℃`;

    const tempFillEl = document.getElementById('modalTempBarFill');
    if (tempFillEl) {
      const pct = Math.min(Math.max(temp, 0), 100);
      tempFillEl.style.width = `${pct}%`;
    }

    // 5) 본문 텍스트
    const titleEl = document.getElementById('modalProductTitle');
    if (titleEl) titleEl.textContent = item.title || '제목 없음';

    const pLocEl = document.getElementById('modalProductLocation');
    if (pLocEl) pLocEl.textContent = item.location || '지역 미지정';

    const timeEl = document.getElementById('modalProductTime');
    if (timeEl) timeEl.textContent = item.createdAt || '방금 전';

    const viewsEl = document.getElementById('modalProductViews');
    if (viewsEl) viewsEl.textContent = `조회 ${item.views || 1}`;

    const priceEl = document.getElementById('modalProductPrice');
    const btmPriceEl = document.getElementById('modalBottomPrice');
    const negoBadge = document.getElementById('modalPriceNegotiable');

    if (item.isFree || item.price === 0) {
      if (priceEl) priceEl.textContent = '무료나눔';
      if (btmPriceEl) btmPriceEl.textContent = '무료나눔';
      if (negoBadge) negoBadge.style.display = 'none';
    } else {
      const pStr = (Number(item.price) || 0).toLocaleString('ko-KR');
      if (priceEl) priceEl.textContent = pStr;
      if (btmPriceEl) btmPriceEl.textContent = `${pStr}원`;
      if (negoBadge) negoBadge.style.display = item.isNegotiable ? 'inline-block' : 'none';
    }

    const descEl = document.getElementById('modalProductDescription');
    if (descEl) descEl.textContent = item.description || '상세 설명이 없습니다.';

    const tradeLocEl = document.getElementById('modalTradeLocation');
    if (tradeLocEl) {
      tradeLocEl.textContent = item.tradeLocation || `${item.location || '동네'} 인근 직거래 선호`;
    }

    // 6) 찜 버튼 상태
    const wishBtn = document.getElementById('modalWishBtn');
    const wishCountEl = document.getElementById('modalWishCount');
    if (wishBtn && wishCountEl) {
      wishBtn.classList.toggle('is-active', !!item.isWished);
      wishCountEl.textContent = item.likes || 0;
    }

    // 7) 작성자 전용 관리 패널 및 하단 버튼 분기
    const isAuthor = isCurrentUserAuthor(item);
    const ownerPanel = document.getElementById('modalOwnerActions');
    const chatBtn = document.getElementById('modalChatBtn');
    const ownerBottomBtn = document.getElementById('modalOwnerBottomEditBtn');

    if (ownerPanel) {
      if (isAuthor) {
        ownerPanel.style.display = 'flex';
        updateOwnerStatusButtonsUI(item.status);
      } else {
        ownerPanel.style.display = 'none';
      }
    }

    if (chatBtn) {
      chatBtn.style.display = isAuthor ? 'none' : 'flex';
    }
    if (ownerBottomBtn) {
      ownerBottomBtn.style.display = isAuthor ? 'flex' : 'none';
    }

    // 스크롤 상단 리셋
    const scrollBody = modalEl.querySelector('.gamza-modal-scroll-body');
    if (scrollBody) scrollBody.scrollTop = 0;

    // 모달 열기 (기존 닫기 타이머 취소 및 부드러운 전환)
    if (detailModalTimer) {
      clearTimeout(detailModalTimer);
      detailModalTimer = null;
    }
    modalEl.classList.remove('is-closing');
    
    // 조회수 증가 및 수파베이스 동기화
    incrementProductViews(item);

    requestAnimationFrame(() => {
      modalEl.classList.add('is-open');
      modalEl.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    });
  }

  async function incrementProductViews(item) {
    if (!item) return;
    try {
      item.views = (item.views || 0) + 1;
      const viewsEl = document.getElementById('modalProductViews');
      if (viewsEl) viewsEl.textContent = `조회 ${item.views}`;

      // 수파베이스 DB에 조회수 갱신
      if (supabase && typeof item.id === 'string' && item.id.includes('-')) {
        await supabase
          .from('products')
          .update({ views: item.views })
          .eq('id', item.id);
      }
    } catch (err) {
      console.warn('조회수 동기화 예외:', err);
    }
  }

  let detailModalTimer = null;
  let writeModalTimer = null;

  // ★ 상세 모달 부드러운 닫기 함수
  function closeDetailModal(e) {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }

    lastModalClosedTime = Date.now();

    const modalEl = document.getElementById('gamzaDetailModal');
    if (modalEl && modalEl.classList.contains('is-open')) {
      if (detailModalTimer) clearTimeout(detailModalTimer);
      
      modalEl.classList.add('is-closing');
      modalEl.classList.remove('is-open');
      modalEl.setAttribute('aria-hidden', 'true');

      detailModalTimer = setTimeout(() => {
        modalEl.classList.remove('is-closing');
        const writeModal = document.getElementById('gamza-write-modal');
        if (!writeModal || !writeModal.classList.contains('is-open')) {
          document.body.classList.remove('modal-open');
        }
        detailModalTimer = null;
      }, 240);
    }

    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  }

  async function toggleWishItem() {
    if (!state.currentDetailItem) return;
    const item = state.currentDetailItem;
    const wishBtn = document.getElementById('modalWishBtn');
    const wishCountEl = document.getElementById('modalWishCount');

    item.isWished = !item.isWished;
    item.likes = (item.likes || 0) + (item.isWished ? 1 : -1);
    if (item.likes < 0) item.likes = 0;

    if (wishBtn) {
      wishBtn.classList.toggle('is-active', item.isWished);
    }
    if (wishCountEl) {
      wishCountEl.textContent = item.likes;
    }

    // 로컬 스토리지에 찜 목록 보관
    const liked = new Set(JSON.parse(localStorage.getItem('gamza_liked_products') || '[]'));
    if (item.isWished) {
      liked.add(item.id);
    } else {
      liked.delete(item.id);
    }
    localStorage.setItem('gamza_liked_products', JSON.stringify([...liked]));

    // 카드 그리드의 해당 아이템 상태도 즉시 반영
    const matchedCard = state.products.find(p => p.id === item.id);
    if (matchedCard) {
      matchedCard.likes = item.likes;
      matchedCard.isWished = item.isWished;
    }

    // 수파베이스 DB에 찜 상태 및 카운트 동기화
    if (supabase && typeof item.id === 'string' && item.id.includes('-')) {
      try {
        const localUser = getOrCreateLocalUser();
        if (item.isWished) {
          await supabase.from('product_likes').insert({
            user_id: localUser.id,
            product_id: item.id
          });
        } else {
          await supabase.from('product_likes').delete().match({
            user_id: localUser.id,
            product_id: item.id
          });
        }
        await supabase
          .from('products')
          .update({ likes_count: item.likes })
          .eq('id', item.id);
      } catch (err) {
        console.warn('찜 수 동기화 실패:', err);
      }
    }

    showToast(item.isWished ? '❤️ 관심 목록에 추가되었습니다!' : '🤍 관심 목록에서 제거되었습니다.');
  }

  function handleStartChat() {
    if (!state.currentDetailItem) return;
    const sellerName = state.currentDetailItem.seller?.nickname || '판매자';
    showToast(`🥔 '${sellerName}'님과의 감자 톡 채팅방이 열렸습니다!`);
  }

  // ==================================================================
  // 5.5. [작성자 전용 관리] 거래 상태 변경, 게시글 수정 및 삭제
  // ==================================================================
  // 상태 토글 버튼 활성 클래스 갱신
  function updateOwnerStatusButtonsUI(currentStatus) {
    const btns = document.querySelectorAll('#owner-status-btns .btn-status-toggle');
    btns.forEach(btn => {
      const btnStatus = btn.getAttribute('data-status');
      const isMatch = (btnStatus === currentStatus) ||
                      (btnStatus === '거래 완료' && currentStatus === '거래완료') ||
                      (btnStatus === '거래완료' && currentStatus === '거래 완료');
      btn.classList.toggle('is-active', isMatch);
    });
  }

  // 작성자의 상품 거래 상태 변경 (수파베이스 DB 반영 및 UI 동기화)
  async function updateProductStatus(newStatus) {
    const item = state.currentDetailItem;
    if (!item) return;

    const normalizedItemStatus = item.status === '거래완료' ? '거래 완료' : item.status;
    const normalizedNewStatus = newStatus === '거래완료' ? '거래 완료' : newStatus;

    if (normalizedItemStatus === normalizedNewStatus) {
      showToast(`🥔 이미 '${newStatus}' 상태입니다.`);
      return;
    }

    try {
      // 1) 수파베이스 DB 상태 업데이트
      if (supabase && typeof item.id === 'string' && item.id.includes('-')) {
        const { error } = await supabase
          .from('products')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        if (error) {
          console.error('수파베이스 상태 변경 오류:', error);
          showToast('⚠️ 상태 변경 처리에 실패했습니다.');
          return;
        }
      }

      // 2) 로컬 데이터 동기화
      item.status = newStatus;
      const targetProd = state.products.find(p => p.id === item.id);
      if (targetProd) {
        targetProd.status = newStatus;
      }

      // 3) 상세 모달 뱃지 및 토글 버튼 UI 갱신
      const statusBadge = document.getElementById('modalStatusBadge');
      if (statusBadge) {
        statusBadge.textContent = newStatus;
        statusBadge.className = 'gamza-badge ' + getStatusBadgeClass(newStatus);
      }
      updateOwnerStatusButtonsUI(newStatus);

      // 4) 메인 목록 카드 갱신 (상태 뱃지, 흐림 처리, 거래 가능 토글 필터 자동 반영)
      renderProductList();

      showToast(`🥔 거래 상태가 '${newStatus}'(으)로 변경되었습니다!`);
    } catch (err) {
      console.error('상태 변경 예외:', err);
      showToast('⚠️ 상태 변경 중 문제가 발생했습니다.');
    }
  }

  // 작성자의 게시글 삭제
  async function deleteProduct() {
    const item = state.currentDetailItem;
    if (!item) return;

    const confirmed = window.confirm(`정말 '${item.title}' 게시글을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.`);
    if (!confirmed) return;

    try {
      if (supabase && typeof item.id === 'string' && item.id.includes('-')) {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', item.id);

        if (error) {
          console.error('수파베이스 상품 삭제 오류:', error);
          showToast('⚠️ 게시글 삭제에 실패했습니다.');
          return;
        }
        await loadProductsFromSupabase();
      } else {
        state.products = state.products.filter(p => p.id !== item.id);
        renderProductList();
      }

      showToast('🗑️ 게시글이 성공적으로 삭제되었습니다.');
      closeDetailModal();
    } catch (err) {
      console.error('게시글 삭제 처리 예외:', err);
      showToast('⚠️ 삭제 처리 중 문제가 발생했습니다.');
    }
  }

  // 게시글 수정 모드 지원 변수 및 모달 열기
  let editingProductId = null;

  function openEditModal(item) {
    if (!item) return;
    editingProductId = item.id;

    // 상세 모달 닫기
    closeDetailModal();

    const modalEl = document.getElementById('gamza-write-modal');
    if (!modalEl) return;

    // 모달 타이틀 및 제출 버튼 텍스트 변경
    const titleEl = document.getElementById('write-modal-title');
    if (titleEl) {
      titleEl.innerHTML = '<span>🥔</span> 내 물건 수정하기';
    }
    const descEl = modalEl.querySelector('.gamza-modal-desc');
    if (descEl) {
      descEl.textContent = '수정할 상품 정보를 입력하고 완료 버튼을 눌러주세요.';
    }
    const submitBtn = document.getElementById('write-submit-btn');
    if (submitBtn) {
      submitBtn.innerHTML = '<span>🥔</span> 수정 완료';
    }

    // 폼 초기화 및 기존 데이터 채우기
    const form = document.getElementById('gamza-write-form');
    if (form) form.reset();
    clearAllErrors();

    const titleInput = document.getElementById('write-title');
    if (titleInput) titleInput.value = item.title || '';

    const categorySelect = document.getElementById('write-category');
    if (categorySelect) {
      if (['반려동물 용품', '변려동물 용품', '반려동물', '변려동물'].includes(item.category)) {
        categorySelect.value = '반려동물 용품';
      } else {
        categorySelect.value = item.category || '';
      }
    }

    const isFreeCheck = document.getElementById('write-is-free');
    const priceInput = document.getElementById('write-price');
    const quickPriceBox = document.getElementById('quick-price-container');
    if (isFreeCheck && priceInput) {
      isFreeCheck.checked = !!item.isFree;
      if (item.isFree) {
        priceInput.value = '0';
        priceInput.disabled = true;
        if (quickPriceBox) quickPriceBox.style.opacity = '0.5';
      } else {
        priceInput.disabled = false;
        priceInput.value = item.price ? Number(item.price).toLocaleString('ko-KR') : '';
        if (quickPriceBox) quickPriceBox.style.opacity = '1';
      }
    }

    const locInput = document.getElementById('write-location');
    if (locInput) locInput.value = item.location || '역삼1동';

    const descInput = document.getElementById('write-description');
    if (descInput) descInput.value = item.description || '';

    // 글자 수 카운터 갱신
    const titleChar = document.getElementById('title-char-count');
    if (titleChar) titleChar.textContent = (item.title || '').length;
    const descChar = document.getElementById('desc-char-count');
    if (descChar) descChar.textContent = (item.description || '').length;

    // 상태 라디오 선택
    const normStatus = item.status === '거래완료' ? '거래 완료' : item.status;
    const statusRadio = document.querySelector(`input[name="write-status"][value="${normStatus}"]`);
    if (statusRadio) {
      statusRadio.checked = true;
    }

    // 이미지 프리뷰 세팅
    const imgSrc = item.imageUrl || item.image || DEFAULT_REAL_IMAGE;
    setImagePreview(imgSrc);

    // 모달 열기 애니메이션
    if (writeModalTimer) {
      clearTimeout(writeModalTimer);
      writeModalTimer = null;
    }
    modalEl.classList.remove('is-closing');
    modalEl.classList.remove('active');

    requestAnimationFrame(() => {
      modalEl.classList.add('is-open');
      modalEl.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (titleInput) setTimeout(() => titleInput.focus(), 120);
    });
  }

  // ==================================================================
  // 6. [화면 3] 글쓰기 모달 / 상품 등록 로직
  // ==================================================================
  function openWriteModal() {
    if (Date.now() - lastModalClosedTime < MODAL_CLICK_THROUGH_GUARD_MS) return;

    const modalEl = document.getElementById('gamza-write-modal');
    if (!modalEl) return;

    resetWriteForm();
    
    if (writeModalTimer) {
      clearTimeout(writeModalTimer);
      writeModalTimer = null;
    }
    modalEl.classList.remove('is-closing');
    modalEl.classList.remove('active');

    requestAnimationFrame(() => {
      modalEl.classList.add('is-open');
      modalEl.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');

      const titleInput = document.getElementById('write-title');
      if (titleInput) {
        setTimeout(() => titleInput.focus(), 100);
      }
    });
  }

  function closeWriteModal(e) {
    if (e) {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }

    lastModalClosedTime = Date.now();

    const modalEl = document.getElementById('gamza-write-modal');
    if (modalEl && (modalEl.classList.contains('is-open') || modalEl.classList.contains('active'))) {
      if (writeModalTimer) clearTimeout(writeModalTimer);

      modalEl.classList.add('is-closing');
      modalEl.classList.remove('is-open');
      modalEl.classList.remove('active');
      modalEl.setAttribute('aria-hidden', 'true');

      writeModalTimer = setTimeout(() => {
        modalEl.classList.remove('is-closing');
        const detailModal = document.getElementById('gamzaDetailModal');
        if (!detailModal || !detailModal.classList.contains('is-open')) {
          document.body.classList.remove('modal-open');
        }
        writeModalTimer = null;
        // 수정 모드 초기화
        editingProductId = null;
      }, 240);
    }

    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  }

  function resetWriteForm() {
    editingProductId = null;

    // 모달 타이틀 및 안내 텍스트 원상복구
    const titleEl = document.getElementById('write-modal-title');
    if (titleEl) {
      titleEl.innerHTML = '<span>🥔</span> 내 물건 팔기';
    }
    const descEl = document.querySelector('#gamza-write-modal .gamza-modal-desc');
    if (descEl) {
      descEl.textContent = '따뜻한 이웃들과 포근하고 정직한 거래를 시작해보세요.';
    }
    const submitBtn = document.getElementById('write-submit-btn');
    if (submitBtn) {
      submitBtn.innerHTML = '<span>🥔</span> 작성 완료';
    }

    const form = document.getElementById('gamza-write-form');
    if (form) form.reset();

    clearImagePreview();

    const titleCharCount = document.getElementById('title-char-count');
    const descCharCount = document.getElementById('desc-char-count');
    if (titleCharCount) titleCharCount.textContent = '0';
    if (descCharCount) descCharCount.textContent = '0';

    const priceInput = document.getElementById('write-price');
    if (priceInput) {
      priceInput.disabled = false;
      priceInput.value = '';
    }

    const locationInput = document.getElementById('write-location');
    if (locationInput) {
      locationInput.value = '역삼1동';
    }

    clearAllErrors();
  }

  function setImagePreview(src) {
    const imgEl = document.getElementById('write-image-preview');
    const phEl = document.getElementById('write-image-placeholder');
    const btnRm = document.getElementById('write-remove-image-btn');
    const finalInput = document.getElementById('write-final-image');

    if (imgEl && phEl && finalInput) {
      imgEl.onerror = function () {
        this.onerror = null;
        this.src = DEFAULT_REAL_IMAGE;
      };
      imgEl.src = src;
      imgEl.classList.remove('hidden');
      phEl.classList.add('hidden');
      if (btnRm) btnRm.classList.remove('hidden');
      finalInput.value = src;
      clearFieldError('image');
    }
  }

  function clearImagePreview() {
    const imgEl = document.getElementById('write-image-preview');
    const phEl = document.getElementById('write-image-placeholder');
    const btnRm = document.getElementById('write-remove-image-btn');
    const finalInput = document.getElementById('write-final-image');
    const fileInput = document.getElementById('write-image-file');

    if (imgEl && phEl && finalInput) {
      imgEl.src = '';
      imgEl.classList.add('hidden');
      phEl.classList.remove('hidden');
      if (btnRm) btnRm.classList.add('hidden');
      finalInput.value = '';
      if (fileInput) fileInput.value = '';
    }
  }

  function showFieldError(fieldName, msg) {
    const errEl = document.getElementById(`error-${fieldName}`);
    const inputEl = document.getElementById(`write-${fieldName}`);
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.add('show');
    }
    if (inputEl) {
      inputEl.classList.add('has-error');
    }
  }

  function clearFieldError(fieldName) {
    const errEl = document.getElementById(`error-${fieldName}`);
    const inputEl = document.getElementById(`write-${fieldName}`);
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.remove('show');
    }
    if (inputEl) {
      inputEl.classList.remove('has-error');
    }
  }

  function clearAllErrors() {
    ['image', 'title', 'category', 'price', 'location', 'description'].forEach(clearFieldError);
  }

  function validateWriteForm() {
    clearAllErrors();
    let isValid = true;
    let firstInvalid = null;

    const titleInput = document.getElementById('write-title');
    const titleVal = titleInput ? titleInput.value.trim() : '';
    if (!titleVal) {
      showFieldError('title', '상품명을 입력해주세요.');
      isValid = false;
      if (!firstInvalid) firstInvalid = titleInput;
    } else if (titleVal.length < 2) {
      showFieldError('title', '상품명은 2자 이상 입력해주세요.');
      isValid = false;
      if (!firstInvalid) firstInvalid = titleInput;
    }

    const catSelect = document.getElementById('write-category');
    if (!catSelect || !catSelect.value) {
      showFieldError('category', '카테고리를 선택해주세요.');
      isValid = false;
      if (!firstInvalid) firstInvalid = catSelect;
    }

    const isFreeCheck = document.getElementById('write-is-free');
    const isFree = isFreeCheck ? isFreeCheck.checked : false;
    const priceInput = document.getElementById('write-price');
    const priceRaw = priceInput ? parseInt(priceInput.value.replace(/[^\d]/g, ''), 10) || 0 : 0;

    if (!isFree && priceRaw <= 0) {
      showFieldError('price', '가격을 입력하거나 무료 나눔을 선택해주세요.');
      isValid = false;
      if (!firstInvalid) firstInvalid = priceInput;
    }

    const locInput = document.getElementById('write-location');
    if (!locInput || !locInput.value.trim()) {
      showFieldError('location', '거래 희망 동네를 입력해주세요.');
      isValid = false;
      if (!firstInvalid) firstInvalid = locInput;
    }

    const descInput = document.getElementById('write-description');
    const descVal = descInput ? descInput.value.trim() : '';
    if (!descVal) {
      showFieldError('description', '자세한 설명을 입력해주세요.');
      isValid = false;
      if (!firstInvalid) firstInvalid = descInput;
    } else if (descVal.length < 5) {
      showFieldError('description', '설명은 5자 이상 정성스럽게 작성해주세요.');
      isValid = false;
      if (!firstInvalid) firstInvalid = descInput;
    } else if (descVal.length > 600) {
      showFieldError('description', '설명은 최대 600자까지 입력 가능합니다.');
      isValid = false;
      if (!firstInvalid) firstInvalid = descInput;
    }

    if (firstInvalid) {
      firstInvalid.focus();
    }

    return isValid;
  }

  async function uploadImageToSupabase(file) {
    if (!supabase || !file) return null;
    try {
      const ext = file.name ? file.name.split('.').pop() : 'jpg';
      const fileName = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('스토리지 업로드 실패:', error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('이미지 업로드 예외:', err);
      return null;
    }
  }

  async function handleWriteSubmit(e) {
    e.preventDefault();

    if (!state.currentUser) {
      showToast('🥔 물건을 등록하려면 먼저 로그인이 필요해요!');
      pendingActionAfterLogin = 'openWriteModal';
      openAuthModal('login', '🥔 물건을 등록하려면 먼저 로그인이 필요해요!');
      return;
    }

    if (!validateWriteForm()) {
      showToast('⚠️ 필수 입력 항목을 확인해주세요.');
      return;
    }

    const submitBtn = document.getElementById('write-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = editingProductId ? '<span>⏳</span> 수정 저장 중...' : '<span>⏳</span> 감자 등록 중...';
    }

    try {
      const title = document.getElementById('write-title').value.trim();
      const category = document.getElementById('write-category').value;
      const isFree = document.getElementById('write-is-free').checked;
      const priceRaw = parseInt(document.getElementById('write-price').value.replace(/[^\d]/g, ''), 10) || 0;
      const price = isFree ? 0 : priceRaw;
      const location = document.getElementById('write-location').value.trim();
      const description = document.getElementById('write-description').value.trim();
      const statusRadio = document.querySelector('input[name="write-status"]:checked');
      const status = statusRadio ? statusRadio.value : '판매중';

      // 1) 이미지 업로드 처리: 파일이 있으면 수파베이스 스토리지로 업로드
      let finalImage = document.getElementById('write-final-image').value || DEFAULT_REAL_IMAGE;
      const fileInput = document.getElementById('write-image-file');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const uploadedUrl = await uploadImageToSupabase(fileInput.files[0]);
        if (uploadedUrl) {
          finalImage = uploadedUrl;
        }
      }

      // [수정 모드인 경우 UPDATE 수행]
      if (editingProductId) {
        if (supabase && typeof editingProductId === 'string' && editingProductId.includes('-')) {
          const { error: updateErr } = await supabase
            .from('products')
            .update({
              title,
              category,
              price,
              is_free: isFree,
              status,
              image_url: finalImage,
              location,
              trade_location: `${location} 인근 직거래 선호`,
              description,
              updated_at: new Date().toISOString()
            })
            .eq('id', editingProductId);

          if (updateErr) {
            console.error('수파베이스 상품 수정 오류:', updateErr);
            showToast('⚠️ 상품 수정 중 오류가 발생했습니다.');
            return;
          }
          await loadProductsFromSupabase();
        } else {
          // 로컬 목업 수정
          const targetProd = state.products.find(p => p.id === editingProductId);
          if (targetProd) {
            targetProd.title = title;
            targetProd.category = category;
            targetProd.price = price;
            targetProd.isFree = isFree;
            targetProd.status = status;
            targetProd.imageUrl = finalImage;
            targetProd.location = location;
            targetProd.tradeLocation = `${location} 인근 직거래 선호`;
            targetProd.description = description;
            renderProductList();
          }
        }

        showToast('🥔 상품 정보가 성공적으로 수정되었습니다!');
        editingProductId = null;
        closeWriteModal();
        return;
      }

      const localUser = getOrCreateLocalUser();

      // 2) 신규 등록: 수파베이스 DB 저장
      if (supabase) {
        let sellerId = state.currentUser ? state.currentUser.id : null;
        if (sellerId) {
          try {
            await supabase.from('profiles').upsert({
              id: sellerId,
              nickname: state.currentUser.nickname,
              avatar_url: state.currentUser.avatar_url || DEFAULT_REAL_AVATAR,
              location: location,
              manner_temperature: state.currentUser.temperature || 36.5,
              seller_level: state.currentUser.level || '인증판매자'
            });
          } catch (profErr) {
            console.warn('프로필 동기화 경고:', profErr);
          }
        }

        const { error: insertErr } = await supabase
          .from('products')
          .insert({
            seller_id: sellerId,
            title,
            category,
            price,
            is_free: isFree,
            status,
            image_url: finalImage,
            location,
            trade_location: `${location} 인근 직거래 선호`,
            description,
            is_negotiable: false,
            views: 1,
            likes_count: 0
          });

        if (insertErr) {
          console.error('수파베이스 상품 등록 오류:', insertErr);
          showToast('⚠️ 상품 등록 중 오류가 발생했습니다.');
          return;
        }

        showToast('🥔 수파베이스에 새 감자 상품이 등록되었습니다!');
        await loadProductsFromSupabase();
      } else {
        // 오프라인 목업 fallback
        const sellerId = state.currentUser ? state.currentUser.id : localUser.id;
        const newProduct = {
          id: Date.now(),
          sellerId: sellerId,
          title,
          category,
          price,
          isFree,
          location,
          tradeLocation: `${location} 인근 직거래 선호`,
          createdAt: '방금 전',
          status,
          imageUrl: finalImage,
          description,
          seller: {
            id: sellerId,
            nickname: state.currentUser ? state.currentUser.nickname : localUser.nickname,
            avatar: (state.currentUser && state.currentUser.avatar_url) || DEFAULT_REAL_AVATAR,
            location: location,
            temperature: (state.currentUser && state.currentUser.temperature) || 36.5,
            level: (state.currentUser && state.currentUser.level) || '인증판매자'
          },
          views: 1,
          likes: 0,
          isWished: false,
          isNegotiable: false
        };

        state.products.unshift(newProduct);
        renderProductList();
        showToast('🥔 새로운 감자 상품이 등록되었습니다!');
      }

      closeWriteModal();
    } catch (err) {
      console.error('상품 등록 처리 중 오류:', err);
      showToast('⚠️ 등록 중 문제가 발생했습니다.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>🥔</span> 작성 완료';
      }
    }
  }

  // ==================================================================
  // 7. 모달 백드롭 안전 클릭 감지 (드래그 오작동 및 관통 클릭 완벽 차단)
  // ==================================================================
  function attachSafeBackdropClick(overlayId, closeCallback) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;

    let isMouseDownOnBackdrop = false;

    overlay.addEventListener('mousedown', (e) => {
      if (e.target === overlay || e.target.classList.contains('gamza-modal-backdrop')) {
        isMouseDownOnBackdrop = true;
      } else {
        isMouseDownOnBackdrop = false;
      }
    });

    overlay.addEventListener('mouseup', (e) => {
      if (isMouseDownOnBackdrop && (e.target === overlay || e.target.classList.contains('gamza-modal-backdrop'))) {
        e.preventDefault();
        e.stopPropagation();
        closeCallback(e);
      }
      isMouseDownOnBackdrop = false;
    });
  }

  // ==================================================================
  // 8. 통합 이벤트 바인딩
  // ==================================================================
  function bindAllEvents() {
    // 카테고리 탭
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        if (Date.now() - lastModalClosedTime < MODAL_CLICK_THROUGH_GUARD_MS) return;
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeCategory = tab.getAttribute('data-category') || '전체';
        renderProductList();
      });
    });

    // 실시간 검색
    const searchInput = document.getElementById('search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchKeyword = e.target.value;
        if (searchClearBtn) {
          searchClearBtn.style.display = state.searchKeyword ? 'flex' : 'none';
        }
        renderProductList();
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        state.searchKeyword = '';
        searchClearBtn.style.display = 'none';
        renderProductList();
      });
    }

    // 거래 가능만 보기 토글
    const availableToggle = document.getElementById('toggle-available-only');
    if (availableToggle) {
      availableToggle.addEventListener('change', (e) => {
        state.availableOnly = e.target.checked;
        renderProductList();
      });
    }

    // [글쓰기] 버튼 (상단 헤더 버튼 & 모바일 전용 FAB)
    const handleOpenWriteClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (Date.now() - lastModalClosedTime < MODAL_CLICK_THROUGH_GUARD_MS) return;
      if (!state.currentUser) {
        pendingActionAfterLogin = 'openWriteModal';
        openAuthModal('login', '🥔 글을 작성하려면 먼저 로그인이 필요해요!');
        return;
      }
      openWriteModal();
    };

    const btnOpenWrite = document.getElementById('btn-open-write');
    if (btnOpenWrite) {
      btnOpenWrite.addEventListener('click', handleOpenWriteClick);
    }

    const btnMobileWriteFab = document.getElementById('btn-mobile-write-fab');
    if (btnMobileWriteFab) {
      btnMobileWriteFab.addEventListener('click', handleOpenWriteClick);
    }

    // 모바일 전용 하단 네비게이션 탭 이벤트
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        mobileNavItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        const navId = item.id;
        if (navId === 'nav-item-home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (navId === 'nav-item-town') {
          showToast('🏘️ 따뜻한 동네생활 피드가 곧 찾아옵니다!');
        } else if (navId === 'nav-item-near') {
          showToast('📍 내 근처 이웃 가게들이 곧 오픈됩니다!');
        } else if (navId === 'nav-item-chat') {
          showToast('💬 진행 중인 대화 내역이 없습니다.');
        } else if (navId === 'nav-item-my') {
          if (!state.currentUser) {
            openAuthModal('login', '🥔 나의 감자를 확인하려면 로그인이 필요해요!');
          } else {
            openProfileModal();
          }
        }
      });
    });

    // [로그인] 버튼
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
      btnLogin.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (Date.now() - lastModalClosedTime < MODAL_CLICK_THROUGH_GUARD_MS) return;
        openAuthModal('login');
      });
    }

    // [로그아웃] 버튼
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleLogout();
      });
    }

    // 상단 헤더 프로필 닉네임 버튼 클릭 시 프로필 수정 모달 열기
    const headerUserNickname = document.getElementById('header-user-nickname');
    if (headerUserNickname) {
      headerUserNickname.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openProfileModal();
      });
    }

    // ================================================================
    // 화면 5 (내 프로필 수정 모달) 이벤트 리스너 바인딩
    // ================================================================
    attachSafeBackdropClick('gamza-profile-modal', closeProfileModal);

    const btnCloseProfile = document.getElementById('btn-close-profile-modal');
    if (btnCloseProfile) {
      btnCloseProfile.addEventListener('click', closeProfileModal);
    }
    const btnCancelProfile = document.getElementById('btn-cancel-profile');
    if (btnCancelProfile) {
      btnCancelProfile.addEventListener('click', closeProfileModal);
    }

    // 프로필 아바타 이미지 변경 파일 선택 트리거
    const avatarBox = document.getElementById('profile-avatar-box');
    const avatarFileInput = document.getElementById('profile-avatar-file');
    const btnChangeAvatar = document.getElementById('btn-change-avatar');

    if (avatarBox && avatarFileInput) {
      avatarBox.addEventListener('click', () => {
        avatarFileInput.value = '';
        avatarFileInput.click();
      });
    }
    if (btnChangeAvatar && avatarFileInput) {
      btnChangeAvatar.addEventListener('click', () => {
        avatarFileInput.value = '';
        avatarFileInput.click();
      });
    }

    if (avatarFileInput) {
      avatarFileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          compressAndSetProfileImage(files[0]);
        }
      });
    }

    // 기본 이미지로 초기화 버튼
    const btnDefaultAvatar = document.getElementById('btn-default-avatar');
    if (btnDefaultAvatar) {
      btnDefaultAvatar.addEventListener('click', () => {
        setProfileAvatar(DEFAULT_REAL_AVATAR, true);
        showToast('🥔 기본 프로필 이미지로 변경되었습니다.');
      });
    }

    // 추천 기본 아바타 프리셋 버튼들
    const presetAvatarBtns = document.querySelectorAll('.preset-avatar-btn');
    presetAvatarBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetAvatar = btn.dataset.avatar;
        if (targetAvatar) {
          setProfileAvatar(targetAvatar, true);
        }
      });
    });

    // 닉네임 실시간 글자수 및 에러 지우기
    const profileNickInput = document.getElementById('profile-nickname');
    const profileNickCount = document.getElementById('profile-nick-count');
    if (profileNickInput) {
      profileNickInput.addEventListener('input', () => {
        const len = profileNickInput.value.length;
        if (profileNickCount) profileNickCount.textContent = len;
        const nickErr = document.getElementById('error-profile-nickname');
        if (nickErr) {
          nickErr.textContent = '';
          nickErr.classList.remove('show');
        }
        profileNickInput.classList.remove('has-error');
      });
    }

    // 프로필 폼 제출
    const profileForm = document.getElementById('gamza-profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', handleProfileSubmit);
    }

    // 화면 4 (인증 모달) 백드롭 & 닫기 버튼
    attachSafeBackdropClick('gamza-auth-modal', closeAuthModal);

    const authCloseBtn = document.getElementById('auth-modal-close-btn');
    if (authCloseBtn) {
      authCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeAuthModal(e);
      });
    }

    // 인증 탭 전환 버튼
    const tabAuthLogin = document.getElementById('tab-auth-login');
    const tabAuthSignup = document.getElementById('tab-auth-signup');
    if (tabAuthLogin) {
      tabAuthLogin.addEventListener('click', () => switchAuthTab('login'));
    }
    if (tabAuthSignup) {
      tabAuthSignup.addEventListener('click', () => switchAuthTab('signup'));
    }

    // 폼 내 전환 링크
    const btnGotoSignup = document.getElementById('btn-goto-signup');
    const btnGotoLogin = document.getElementById('btn-goto-login');
    if (btnGotoSignup) {
      btnGotoSignup.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('signup');
      });
    }
    if (btnGotoLogin) {
      btnGotoLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('login');
      });
    }

    // 폼 제출 리스너
    const formLogin = document.getElementById('form-auth-login');
    if (formLogin) {
      formLogin.addEventListener('submit', handleLoginSubmit);
    }
    const formSignup = document.getElementById('form-auth-signup');
    if (formSignup) {
      formSignup.addEventListener('submit', handleSignUpSubmit);
    }

    // 모바일 가상 키패드 가림 방지: 인증 모달 인풋 포커스 시 부드럽게 화면 중앙으로 스크롤
    const authModalEl = document.getElementById('gamza-auth-modal');
    if (authModalEl) {
      const authInputs = authModalEl.querySelectorAll('input');
      authInputs.forEach(input => {
        input.addEventListener('focus', () => {
          setTimeout(() => {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 250);
        });
      });

      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
          const activeEl = document.activeElement;
          if (activeEl && authModalEl.contains(activeEl) && activeEl.tagName === 'INPUT') {
            setTimeout(() => {
              activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 80);
          }
        });
      }
    }

    // 필터 초기화 버튼
    const btnReset = document.getElementById('btn-reset-filters');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        state.activeCategory = '전체';
        state.searchKeyword = '';
        state.availableOnly = false;
        if (searchInput) searchInput.value = '';
        if (searchClearBtn) searchClearBtn.style.display = 'none';
        if (availableToggle) availableToggle.checked = false;
        categoryTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-category') === '전체'));
        renderProductList();
      });
    }

    // 화면 2 (상세 모달) 백드롭 & 닫기 버튼
    attachSafeBackdropClick('gamzaDetailModal', closeDetailModal);

    const detailCloseBtn = document.getElementById('detail-close-btn');
    if (detailCloseBtn) {
      detailCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeDetailModal(e);
      });
    }

    const wishBtn = document.getElementById('modalWishBtn');
    if (wishBtn) {
      wishBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishItem();
      });
    }

    const chatBtn = document.getElementById('modalChatBtn');
    if (chatBtn) {
      chatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleStartChat();
      });
    }

    // [작성자 전용] 상태 변경 버튼 클릭 이벤트
    const statusToggleBtns = document.querySelectorAll('#owner-status-btns .btn-status-toggle');
    statusToggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const newStatus = btn.getAttribute('data-status');
        if (newStatus) {
          updateProductStatus(newStatus);
        }
      });
    });

    // [작성자 전용] 게시글 수정 버튼 (상단 패널 & 하단 바)
    const btnOwnerEdit = document.getElementById('btn-owner-edit');
    if (btnOwnerEdit) {
      btnOwnerEdit.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (state.currentDetailItem) {
          openEditModal(state.currentDetailItem);
        }
      });
    }

    const modalOwnerBottomEditBtn = document.getElementById('modalOwnerBottomEditBtn');
    if (modalOwnerBottomEditBtn) {
      modalOwnerBottomEditBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (state.currentDetailItem) {
          openEditModal(state.currentDetailItem);
        }
      });
    }

    // [작성자 전용] 게시글 삭제 버튼
    const btnOwnerDelete = document.getElementById('btn-owner-delete');
    if (btnOwnerDelete) {
      btnOwnerDelete.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteProduct();
      });
    }

    // 화면 3 (글쓰기 모달) 백드롭 & 닫기 버튼
    attachSafeBackdropClick('gamza-write-modal', closeWriteModal);

    const writeCloseBtn = document.getElementById('write-modal-close-btn');
    const writeCancelBtn = document.getElementById('write-cancel-btn');
    if (writeCloseBtn) {
      writeCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeWriteModal(e);
      });
    }
    if (writeCancelBtn) {
      writeCancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeWriteModal(e);
      });
    }

    // 이미지 소스 탭 전환
    const sourceTabs = document.querySelectorAll('.image-source-tabs .tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    sourceTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        const target = tab.dataset.tab;
        sourceTabs.forEach(t => t.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const activePanel = document.getElementById(`tab-panel-${target}`);
        if (activePanel) activePanel.classList.add('active');
      });
    });

    // 파일 업로드 및 사진 등록 박스 연동
    const fileInput = document.getElementById('write-image-file');
    const previewBox = document.getElementById('write-image-preview-box');

    // 사진 등록 박스(미리보기 박스) 클릭 시 파일 선택창 열기
    if (previewBox && fileInput) {
      previewBox.addEventListener('click', (e) => {
        // 이미지 삭제 버튼 클릭 시에는 파일 창 열지 않음
        if (e.target.closest('#write-remove-image-btn')) return;
        fileInput.value = '';
        fileInput.click();
      });

      // 키보드 접근성 (Enter, Space 키 지원)
      previewBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInput.value = '';
          fileInput.click();
        }
      });

      // 드래그 앤 드롭 지원
      previewBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        previewBox.classList.add('drag-over');
      });
      ['dragleave', 'dragend'].forEach((evtType) => {
        previewBox.addEventListener(evtType, () => {
          previewBox.classList.remove('drag-over');
        });
      });
      previewBox.addEventListener('drop', (e) => {
        e.preventDefault();
        previewBox.classList.remove('drag-over');
        const files = e.dataTransfer && e.dataTransfer.files;
        if (files && files.length > 0) {
          const file = files[0];
          if (!file.type.startsWith('image/')) {
            showFieldError('image', '이미지 파일만 업로드할 수 있습니다.');
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            setImagePreview(event.target.result);
          };
          reader.readAsDataURL(file);

          try {
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInput.files = dt.files;
          } catch (_) {}

          // 탭을 파일 업로드로 활성화
          const uploadTab = document.querySelector('.tab-btn[data-tab="upload"]');
          if (uploadTab) uploadTab.click();
        }
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          showFieldError('image', '이미지 파일만 업로드할 수 있습니다.');
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreview(event.target.result);
        };
        reader.readAsDataURL(file);

        // 탭을 파일 업로드로 활성화
        const uploadTab = document.querySelector('.tab-btn[data-tab="upload"]');
        if (uploadTab) uploadTab.click();
      });
    }

    // URL 적용
    const applyUrlBtn = document.getElementById('write-apply-url-btn');
    const urlInput = document.getElementById('write-image-url');
    if (applyUrlBtn && urlInput) {
      const applyUrl = () => {
        const url = urlInput.value.trim();
        if (url) {
          setImagePreview(url);
          urlInput.value = '';
        } else {
          showFieldError('image', 'URL을 입력해주세요.');
        }
      };
      applyUrlBtn.addEventListener('click', applyUrl);
      urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          applyUrl();
        }
      });
    }

    // 감자 샘플 이미지 칩 바인딩
    const sampleChips = document.querySelectorAll('.sample-chip');
    sampleChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const imgUrl = chip.dataset.img;
        if (imgUrl) setImagePreview(imgUrl);
      });
    });

    // 이미지 삭제
    const rmImgBtn = document.getElementById('write-remove-image-btn');
    if (rmImgBtn) rmImgBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearImagePreview();
    });

    // 제목 글자 수
    const titleInput = document.getElementById('write-title');
    const titleCount = document.getElementById('title-char-count');
    if (titleInput && titleCount) {
      titleInput.addEventListener('input', () => {
        titleCount.textContent = titleInput.value.length;
        clearFieldError('title');
      });
    }

    // 가격 포맷팅
    const priceInput = document.getElementById('write-price');
    if (priceInput) {
      priceInput.addEventListener('input', () => {
        const num = parseInt(priceInput.value.replace(/[^\d]/g, ''), 10) || 0;
        priceInput.value = num > 0 ? num.toLocaleString('ko-KR') : '';
        clearFieldError('price');
      });
    }

    // 무료 나눔 체크
    const freeCheck = document.getElementById('write-is-free');
    const quickPriceBox = document.getElementById('quick-price-container');
    if (freeCheck && priceInput) {
      freeCheck.addEventListener('change', () => {
        if (freeCheck.checked) {
          priceInput.value = '0';
          priceInput.disabled = true;
          if (quickPriceBox) quickPriceBox.style.opacity = '0.5';
        } else {
          priceInput.value = '';
          priceInput.disabled = false;
          if (quickPriceBox) quickPriceBox.style.opacity = '1';
        }
        clearFieldError('price');
      });
    }

    // 빠른 가격 칩
    if (quickPriceBox && priceInput) {
      quickPriceBox.addEventListener('click', (e) => {
        if (freeCheck?.checked) return;
        const add = e.target.dataset.add;
        if (add) {
          const current = parseInt(priceInput.value.replace(/[^\d]/g, ''), 10) || 0;
          priceInput.value = (current + parseInt(add, 10)).toLocaleString('ko-KR');
          clearFieldError('price');
        } else if (e.target.id === 'write-price-clear') {
          priceInput.value = '';
          clearFieldError('price');
        }
      });
    }

    // 설명 글자 수
    const descInput = document.getElementById('write-description');
    const descCount = document.getElementById('desc-char-count');
    if (descInput && descCount) {
      descInput.addEventListener('input', () => {
        descCount.textContent = descInput.value.length;
        clearFieldError('description');
      });
    }

    // 글쓰기 폼 제출
    const writeForm = document.getElementById('gamza-write-form');
    if (writeForm) {
      writeForm.addEventListener('submit', handleWriteSubmit);
    }

    // ESC 키 모달 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        closeDetailModal();
        closeWriteModal();
        closeAuthModal();
      }
    });
  }

  // ==================================================================
  // 9. 앱 초기화
  // ==================================================================
  async function initApp() {
    bindAllEvents();
    renderProductList();
    await initAuth();
    await loadProductsFromSupabase();
    setupSupabaseRealtime();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

  // 전역 노출
  window.openDetailModal = openDetailModal;
  window.closeDetailModal = closeDetailModal;
  window.openWriteModal = openWriteModal;
  window.closeWriteModal = closeWriteModal;
  window.openEditModal = openEditModal;
  window.updateProductStatus = updateProductStatus;
  window.deleteProduct = deleteProduct;
  window.toggleWishItem = toggleWishItem;
  window.handleStartChat = handleStartChat;
  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;
  window.openProfileModal = openProfileModal;
  window.closeProfileModal = closeProfileModal;
  window.handleLogout = handleLogout;
})();
