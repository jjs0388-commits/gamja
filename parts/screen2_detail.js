/**
 * ========================================================
 * [화면 2] 감자(Gamza) 상품 상세 모달 JavaScript 컨트롤러
 * ========================================================
 */

// 현재 모달에 바인딩된 아이템 객체 저장
let currentDetailItem = null;

/**
 * 감자 매너온도에 따른 이모지 및 색상 반환 헬퍼
 * @param {number} temp 매너온도 (예: 37.5)
 */
function getMannerTempInfo(temp) {
  const t = Number(temp) || 36.5;
  let emoji = '😊';
  let fillColor = '#8C532B';

  if (t >= 50) {
    emoji = '👑';
    fillColor = '#E65100';
  } else if (t >= 40) {
    emoji = '😄';
    fillColor = '#B77B3C';
  } else if (t >= 36.5) {
    emoji = '😊';
    fillColor = '#8C532B';
  } else if (t >= 30) {
    emoji = '😐';
    fillColor = '#7A6F68';
  } else {
    emoji = '🥺';
    fillColor = '#9E938B';
  }

  // 0 ~ 100% 게이지 제한
  const percent = Math.min(Math.max(t, 0), 100);

  return { emoji, percent, fillColor };
}

/**
 * 숫자 금액을 한국 원화 형식(콤마 포함)으로 변환
 * @param {number|string} price
 */
function formatGamzaPrice(price) {
  if (price === 0 || price === '0') return '0';
  if (!price) return '0';
  const num = typeof price === 'number' ? price : parseInt(String(price).replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? '0' : num.toLocaleString('ko-KR');
}

/**
 * 상품 상세 팝업(모달) 열기 함수
 * @param {Object} item 상품 데이터 객체
 */
function openDetailModal(item) {
  // 전달된 데이터가 없으면 기본 샘플 데이터 적용
  const data = item || {
    id: 'sample-001',
    title: '강원도 햇 감자 5kg (박스 미개봉 새상품)',
    category: '식품 / 농산물',
    price: 18000,
    isNegotiable: true,
    status: '판매중', // '판매중' | '예약중' | '거래완료'
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
    location: '강원도 춘천시 퇴계동',
    tradeLocation: '퇴계동 주민센터 앞 또는 남춘천역 1번 출구',
    uploadedAt: '10분 전',
    views: 42,
    wishCount: 7,
    isWished: false,
    description: `올해 수확한 강원도 청정 햇수미감자 5kg 팝니다!\n포슬포슬하고 분이 많아 쪄먹어도 맛있고 감자전 부쳐먹기 딱 좋습니다.\n선물용으로 한 박스 더 구매했다가 남아서 판매해요.\n\n- 직거래 선호 (주말 상시 가능)\n- 쿨거래 시 약간의 네고 가능합니다 :)`,
    seller: {
      nickname: '포슬포슬감자왕',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      location: '춘천시 퇴계동',
      mannerTemp: 42.8,
      isVerified: true
    }
  };

  currentDetailItem = data;

  const modalEl = document.getElementById('gamzaDetailModal');
  if (!modalEl) {
    console.error('Gamza Detail Modal element (#gamzaDetailModal) not found.');
    return;
  }

  // 1. 대표 이미지
  const imgEl = document.getElementById('modalProductImage');
  if (imgEl) {
    imgEl.src = data.image || 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80';
    imgEl.alt = data.title || '상품 이미지';
  }

  // 2. 판매 상태 뱃지
  const statusBadge = document.getElementById('modalStatusBadge');
  if (statusBadge) {
    statusBadge.textContent = data.status || '판매중';
    statusBadge.className = 'gamza-badge';
    if (data.status === '예약중') {
      statusBadge.classList.add('status-reserved');
    } else if (data.status === '거래완료') {
      statusBadge.classList.add('status-completed');
    } else {
      statusBadge.classList.add('status-selling');
    }
  }

  // 3. 카테고리
  const catBadge = document.getElementById('modalCategoryBadge');
  if (catBadge) {
    catBadge.textContent = data.category || '중고거래';
  }

  // 4. 판매자 정보
  const seller = data.seller || {};
  const avatarEl = document.getElementById('modalSellerAvatar');
  if (avatarEl) {
    avatarEl.src = seller.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
    avatarEl.alt = `${seller.nickname || '판매자'} 프로필`;
  }

  const nickEl = document.getElementById('modalSellerNickname');
  if (nickEl) nickEl.textContent = seller.nickname || '익명의 감자';

  const sLocEl = document.getElementById('modalSellerLocation');
  if (sLocEl) sLocEl.textContent = seller.location || data.location || '동네 인증 완료';

  // 감자 매너온도
  const temp = seller.mannerTemp !== undefined ? seller.mannerTemp : 36.5;
  const tempInfo = getMannerTempInfo(temp);
  const tempValEl = document.getElementById('modalSellerTemp');
  if (tempValEl) tempValEl.textContent = `${temp.toFixed(1)}℃`;

  const tempFillEl = document.getElementById('modalTempBarFill');
  if (tempFillEl) {
    tempFillEl.style.width = `${tempInfo.percent}%`;
    tempFillEl.style.background = `linear-gradient(90deg, #B77B3C 0%, ${tempInfo.fillColor} 100%)`;
  }

  const tempEmojiEl = document.getElementById('modalTempEmoji');
  if (tempEmojiEl) tempEmojiEl.textContent = tempInfo.emoji;

  // 5. 상품 텍스트 정보
  const titleEl = document.getElementById('modalProductTitle');
  if (titleEl) titleEl.textContent = data.title || '제목 없음';

  const pLocEl = document.getElementById('modalProductLocation');
  if (pLocEl) pLocEl.textContent = data.location || '지역 미지정';

  const timeEl = document.getElementById('modalProductTime');
  if (timeEl) timeEl.textContent = data.uploadedAt || '최근 등록';

  const viewsEl = document.getElementById('modalProductViews');
  if (viewsEl) viewsEl.textContent = `조회 ${data.views || 0}`;

  // 가격
  const formattedPrice = formatGamzaPrice(data.price);
  const priceEl = document.getElementById('modalProductPrice');
  if (priceEl) priceEl.textContent = formattedPrice;

  const btmPriceEl = document.getElementById('modalBottomPrice');
  if (btmPriceEl) btmPriceEl.textContent = `${formattedPrice}원`;

  const negoBadge = document.getElementById('modalPriceNegotiable');
  if (negoBadge) {
    negoBadge.style.display = data.isNegotiable ? 'inline-block' : 'none';
  }

  // 본문 설명
  const descEl = document.getElementById('modalProductDescription');
  if (descEl) descEl.textContent = data.description || '상세 설명이 없습니다.';

  // 직거래 희망 장소
  const tradeLocEl = document.getElementById('modalTradeLocation');
  if (tradeLocEl) {
    tradeLocEl.textContent = data.tradeLocation || `${data.location || '협의 후 결정'} 인근`;
  }

  // 6. 하단 찜 버튼 상태
  const wishBtn = document.getElementById('modalWishBtn');
  const wishCountEl = document.getElementById('modalWishCount');
  if (wishBtn && wishCountEl) {
    if (data.isWished) {
      wishBtn.classList.add('is-active');
    } else {
      wishBtn.classList.remove('is-active');
    }
    wishCountEl.textContent = data.wishCount || 0;
  }

  // 모달 열기 클래스 추가 및 접근성 설정
  modalEl.classList.add('is-open');
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // 배경 스크롤 방지

  // 스크롤 상단 리셋
  const scrollBody = modalEl.querySelector('.gamza-modal-scroll-body');
  if (scrollBody) scrollBody.scrollTop = 0;
}

/**
 * 상품 상세 팝업(모달) 닫기 함수
 */
function closeDetailModal() {
  const modalEl = document.getElementById('gamzaDetailModal');
  if (modalEl) {
    modalEl.classList.remove('is-open');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // 스크롤 복원
  }
}

/**
 * 찜 (관심 상품) 토글 핸들러
 * @param {HTMLElement} btnEl
 */
function toggleWishItem(btnEl) {
  if (!btnEl) btnEl = document.getElementById('modalWishBtn');
  const wishCountEl = document.getElementById('modalWishCount');
  if (!wishCountEl) return;

  const isActive = btnEl.classList.toggle('is-active');
  let count = parseInt(wishCountEl.textContent, 10) || 0;

  if (isActive) {
    count += 1;
  } else {
    count = Math.max(0, count - 1);
  }
  wishCountEl.textContent = count;

  if (currentDetailItem) {
    currentDetailItem.isWished = isActive;
    currentDetailItem.wishCount = count;
  }

  // 커스텀 이벤트 발송 (상위 모듈 or 목록 동기화용)
  const event = new CustomEvent('gamza:wish-toggle', {
    detail: {
      item: currentDetailItem,
      isWished: isActive,
      wishCount: count
    }
  });
  window.dispatchEvent(event);
}

/**
 * 채팅 시작하기 버튼 클릭 핸들러
 */
function handleStartChat() {
  if (!currentDetailItem) return;

  // 다른 화면 또는 채팅 시스템으로 연결하기 위한 커스텀 이벤트 발송
  const event = new CustomEvent('gamza:start-chat', {
    detail: {
      product: currentDetailItem,
      seller: currentDetailItem.seller
    }
  });
  window.dispatchEvent(event);

  alert(`[감자 톡] '${currentDetailItem.seller?.nickname || '판매자'}'님과의 채팅방을 엽니다! 🥔`);
}

// 키보드 ESC 키 누를 시 모달 닫기 이벤트 리스너 등록
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' || e.key === 'Esc') {
    const modalEl = document.getElementById('gamzaDetailModal');
    if (modalEl && modalEl.classList.contains('is-open')) {
      closeDetailModal();
    }
  }
});

// 전역(Window)에 핵심 제어 함수 노출
window.openDetailModal = openDetailModal;
window.closeDetailModal = closeDetailModal;
window.toggleWishItem = toggleWishItem;
window.handleStartChat = handleStartChat;
