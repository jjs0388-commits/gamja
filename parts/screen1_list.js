/**
 * ====================================================================
 * [화면 1: 상품 목록 및 네비게이션] JavaScript 모듈
 * 작성자: 프론트엔드 엔지니어 A
 * 파일명: parts/screen1_list.js
 * ====================================================================
 */

(function () {
  'use strict';

  // 1. 초기 6개 상품 목업 데이터 (고화질 Unsplash 이미지 적용)
  const INITIAL_PRODUCTS = [
    {
      id: 1,
      title: '아이폰 14 프로 128GB 스페이스 블랙 (배터리 92%)',
      category: '디지털기기',
      price: 850000,
      location: '강남구 역삼동',
      createdAt: '3분 전',
      status: '판매중', // '판매중' | '예약중' | '거래 완료'
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      description: '케이스와 강화유리를 항상 착용하여 기스 하나 없는 S급 풀박스입니다. 직거래 선호합니다!',
      seller: {
        nickname: '포슬포슬감자',
        location: '역삼1동',
        temperature: 38.5,
      },
      likes: 12,
      chats: 5
    },
    {
      id: 2,
      title: '원목 감성 라탄 인테리어 체어 (카페 의자 스타일)',
      category: '가구/인테리어',
      price: 45000,
      location: '마포구 연남동',
      createdAt: '15분 전',
      status: '판매중',
      imageUrl: 'https://images.unsplash.com/photo-1580481077197-0f81d1872df0?w=600&auto=format&fit=crop&q=80',
      description: '인테리어 소품용으로 3달 정도 사용했습니다. 원목 느낌이 아주 따뜻하고 튼튼합니다.',
      seller: {
        nickname: '알감자조림',
        location: '연남동',
        temperature: 42.0,
      },
      likes: 8,
      chats: 2
    },
    {
      id: 3,
      title: '핸드메이드 브라운 케이블 오버핏 니트 (Free사이즈)',
      category: '의류',
      price: 28000,
      location: '용산구 한남동',
      createdAt: '42분 전',
      status: '예약중',
      imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80',
      description: '따뜻한 감자색 꽈배기 니트입니다. 1회 단시간 착용 후 드라이클리닝 완료했습니다.',
      seller: {
        nickname: '감자튀김러버',
        location: '한남동',
        temperature: 36.8,
      },
      likes: 19,
      chats: 7
    },
    {
      id: 4,
      title: '필립스 에센셜 에어프라이어 4.1L 블랙 (HD9200)',
      category: '생활가전',
      price: 35000,
      location: '송파구 잠실동',
      createdAt: '2시간 전',
      status: '거래 완료',
      imageUrl: 'https://images.unsplash.com/photo-1586208958839-06c17cacdf08?w=600&auto=format&fit=crop&q=80',
      description: '더 큰 용량으로 업그레이드하면서 내놓습니다. 정상 작동 확인 및 내부 깨끗이 세척했습니다.',
      seller: {
        nickname: '햇감자수확',
        location: '잠실본동',
        temperature: 37.2,
      },
      likes: 4,
      chats: 8
    },
    {
      id: 5,
      title: '슬램덩크 신장재편판 1~20권 전권 세트 (미개봉 다수)',
      category: '도서/티켓',
      price: 75000,
      location: '서초구 반포동',
      createdAt: '4시간 전',
      status: '판매중',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
      description: '소장용으로 구매하여 비닐 랩핑 보관했습니다. 책 모서리 찍힘 없이 최상급 상태입니다.',
      seller: {
        nickname: '구운감자칩',
        location: '반포4동',
        temperature: 45.1,
      },
      likes: 27,
      chats: 11
    },
    {
      id: 6,
      title: '커스텀 레트로 기계식 키보드 (황축, 윤활 완료)',
      category: '디지털기기',
      price: 52000,
      location: '성남시 분당구 정자동',
      createdAt: '6시간 전',
      status: '판매중',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
      description: '부드러운 조약돌 소리가 나는 키보드입니다. 블루투스/유선 겸용 모델이며 충전 케이블 동봉합니다.',
      seller: {
        nickname: '통감자버터구이',
        location: '정자동',
        temperature: 39.0,
      },
      likes: 15,
      chats: 4
    }
  ];

  // 2. 화면 상태(State) 관리
  const state = {
    products: [...INITIAL_PRODUCTS],
    activeCategory: '전체',
    searchKeyword: '',
    availableOnly: false,
  };

  // 3. 유틸리티 함수
  /**
   * 숫자를 3자리 콤마 포맷 원화 문자열로 변환 (예: 850,000원)
   * @param {number} price 
   * @returns {string}
   */
  function formatPrice(price) {
    if (typeof price !== 'number') {
      price = Number(price) || 0;
    }
    return price.toLocaleString('ko-KR') + '원';
  }

  /**
   * 판매 상태에 맞는 CSS 뱃지 클래스 반환
   * @param {string} status 
   * @returns {string}
   */
  function getStatusBadgeClass(status) {
    switch (status) {
      case '판매중':
        return 'badge-selling';
      case '예약중':
        return 'badge-reserved';
      case '거래 완료':
        return 'badge-completed';
      default:
        return 'badge-selling';
    }
  }

  // 4. 모달 연동 훅 (글로벌 윈도우 인터페이스)
  /**
   * 상품 상세 모달 오픈 함수 호출
   * @param {Object} item 
   */
  function openDetailModal(item) {
    console.log('[감자마켓] 상품 상세 모달 오픈 요청:', item);
    if (typeof window.openDetailModal === 'function') {
      window.openDetailModal(item);
    } else {
      console.info('ℹ️ window.openDetailModal 함수가 아직 로드되지 않았습니다.');
      // 임시 알림 예시
      alert(`[상품 상세]\n- 상품명: ${item.title}\n- 가격: ${formatPrice(item.price)}\n- 상태: ${item.status}\n- 지역: ${item.location}`);
    }
  }

  /**
   * 상품 등록(글쓰기) 모달 오픈 함수 호출
   */
  function openWriteModal() {
    console.log('[감자마켓] 글쓰기 모달 오픈 요청');
    if (typeof window.openWriteModal === 'function') {
      window.openWriteModal();
    } else {
      console.info('ℹ️ window.openWriteModal 함수가 아직 로드되지 않았습니다.');
      alert('🥔 감자마켓 글쓰기 모달이 열립니다.');
    }
  }

  // 5. 상품 목록 필터링 및 렌더링 로직
  /**
   * 현재 state를 기반으로 필터링된 상품 목록을 계산
   * @returns {Array}
   */
  function getFilteredProducts() {
    return state.products.filter(item => {
      // 카테고리 필터
      const isPetCategory = (cat) => cat === '반려동물 용품' || cat === '변려동물 용품' || cat === '반려동물' || cat === '변려동물';
      const matchCategory = (state.activeCategory === '전체' ||
        item.category === state.activeCategory ||
        (isPetCategory(state.activeCategory) && isPetCategory(item.category)));

      // 실시간 검색어 필터 (상품명 및 위치 검색)
      const trimmedKeyword = state.searchKeyword.trim().toLowerCase();
      const matchKeyword = !trimmedKeyword || 
        item.title.toLowerCase().includes(trimmedKeyword) || 
        item.location.toLowerCase().includes(trimmedKeyword);

      // 거래 가능만 보기 필터 ('거래 완료' 제외)
      const matchAvailable = !state.availableOnly || (item.status !== '거래 완료');

      return matchCategory && matchKeyword && matchAvailable;
    });
  }

  /**
   * 상품 카드 HTML 요소 생성
   * @param {Object} item 
   * @returns {HTMLElement}
   */
  function createProductCardElement(item) {
    const card = document.createElement('article');
    card.className = `gamza-card ${item.status === '거래 완료' ? 'is-completed' : ''}`;
    card.setAttribute('data-id', item.id);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${item.title}, 가격 ${formatPrice(item.price)}`);

    const badgeClass = getStatusBadgeClass(item.status);

    card.innerHTML = `
      <div class="card-thumbnail-wrap">
        <img 
          src="${item.imageUrl}" 
          alt="${item.title}" 
          class="card-img" 
          loading="lazy"
          onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80';"
        />
        <span class="card-status-badge ${badgeClass}">${item.status}</span>
      </div>
      <div class="card-body">
        <span class="card-category-tag">${item.category}</span>
        <h4 class="card-title" title="${item.title}">${item.title}</h4>
        <div class="card-meta">
          <span class="card-location">${item.location}</span>
          <span class="card-meta-dot">·</span>
          <span class="card-time">${item.createdAt}</span>
        </div>
        <div class="card-footer">
          <span class="card-price">${item.price.toLocaleString('ko-KR')}<span class="currency">원</span></span>
        </div>
      </div>
    `;

    // 카드 클릭 및 키보드 Enter 인터랙션 바인딩
    card.addEventListener('click', () => openDetailModal(item));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDetailModal(item);
      }
    });

    return card;
  }

  /**
   * 필터링된 상품 그리드 렌더링
   */
  function render() {
    const gridEl = document.getElementById('gamza-product-grid');
    const emptyEl = document.getElementById('gamza-empty-state');
    const countEl = document.getElementById('product-count-display');

    if (!gridEl) return;

    const filteredItems = getFilteredProducts();

    // 상품 개수 갱신
    if (countEl) {
      countEl.textContent = filteredItems.length;
    }

    // 그리드 비우기
    gridEl.innerHTML = '';

    if (filteredItems.length === 0) {
      gridEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'block';
    } else {
      gridEl.style.display = 'grid';
      if (emptyEl) emptyEl.style.display = 'none';

      filteredItems.forEach(item => {
        const cardElement = createProductCardElement(item);
        gridEl.appendChild(cardElement);
      });
    }
  }

  // 6. 이벤트 리스너 바인딩
  function bindEvents() {
    // 1) 카테고리 탭 클릭
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeCategory = tab.getAttribute('data-category') || '전체';
        render();
      });
    });

    // 2) 실시간 검색창 입력
    const searchInput = document.getElementById('search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchKeyword = e.target.value;
        if (searchClearBtn) {
          searchClearBtn.style.display = state.searchKeyword ? 'flex' : 'none';
        }
        render();
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
        render();
      });
    }

    // 3) 거래 가능만 보기 토글
    const availableToggle = document.getElementById('toggle-available-only');
    if (availableToggle) {
      availableToggle.addEventListener('change', (e) => {
        state.availableOnly = e.target.checked;
        render();
      });
    }

    // 4) 글쓰기 버튼 클릭
    const btnWrite = document.getElementById('btn-open-write');
    if (btnWrite) {
      btnWrite.addEventListener('click', openWriteModal);
    }

    // 5) 로그인 버튼 클릭 (자리 마련)
    const btnLogin = document.getElementById('btn-login-placeholder');
    if (btnLogin) {
      btnLogin.addEventListener('click', () => {
        alert('🥔 감자마켓 로그인 기능은 준비 중입니다!');
      });
    }

    // 6) 필터 초기화 버튼 클릭 (빈 상태 화면)
    const btnReset = document.getElementById('btn-reset-filters');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        state.activeCategory = '전체';
        state.searchKeyword = '';
        state.availableOnly = false;

        // UI 초기화
        if (searchInput) searchInput.value = '';
        if (searchClearBtn) searchClearBtn.style.display = 'none';
        if (availableToggle) availableToggle.checked = false;
        
        categoryTabs.forEach(t => {
          t.classList.toggle('active', t.getAttribute('data-category') === '전체');
        });

        render();
      });
    }
  }

  // 7. 모듈 초기화 함수
  function init() {
    bindEvents();
    render();
    console.log('🥔 [감자마켓] 화면 1 (상품 목록 및 네비게이션) 모듈이 성공적으로 초기화되었습니다.');
  }

  // DOM 로드 시 자동 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 8. 외부 연동용 공개 API (window.GamzaScreen1)
  window.GamzaScreen1 = {
    init,
    render,
    getProducts: () => [...state.products],
    setProducts: (newProducts) => {
      if (Array.isArray(newProducts)) {
        state.products = [...newProducts];
        render();
      }
    },
    addProduct: (newItem) => {
      state.products.unshift(newItem);
      render();
    },
    updateProductStatus: (id, newStatus) => {
      const target = state.products.find(p => p.id === id);
      if (target) {
        target.status = newStatus;
        render();
      }
    },
    getState: () => ({ ...state }),
    openDetailModal,
    openWriteModal,
  };

})();
