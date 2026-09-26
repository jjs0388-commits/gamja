/**
 * ========================================================
 * [화면 3] 글쓰기 모달 / 폼 스크립트 (Gamza Screen 3 - Write Modal JS)
 * ========================================================
 */

(function () {
  'use strict';

  // 1. 기본 샘플 이미지 fallback
  const DEFAULT_SAMPLE_IMG = 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80';

  // 2. DOM 요소 참조
  let modalOverlay,
    modalContainer,
    writeForm,
    closeBtn,
    cancelBtn,
    submitBtn,
    imageFileInput,
    imageUrlInput,
    applyUrlBtn,
    removeImageBtn,
    imagePreviewBox,
    imagePreview,
    imagePlaceholder,
    finalImageInput,
    titleInput,
    titleCharCount,
    categorySelect,
    priceInput,
    isFreeCheckbox,
    quickPriceContainer,
    locationInput,
    descriptionInput,
    descCharCount,
    sourceTabs,
    tabPanels,
    sampleChips;

  // 3. 초기화 함수
  function initElements() {
    modalOverlay = document.getElementById('gamza-write-modal');
    if (!modalOverlay) return;

    modalContainer = modalOverlay.querySelector('.gamza-modal-container');
    writeForm = document.getElementById('gamza-write-form');
    closeBtn = document.getElementById('write-modal-close-btn');
    cancelBtn = document.getElementById('write-cancel-btn');
    submitBtn = document.getElementById('write-submit-btn');

    imageFileInput = document.getElementById('write-image-file');
    imageUrlInput = document.getElementById('write-image-url');
    applyUrlBtn = document.getElementById('write-apply-url-btn');
    removeImageBtn = document.getElementById('write-remove-image-btn');
    imagePreviewBox = document.getElementById('write-image-preview-box');
    imagePreview = document.getElementById('write-image-preview');
    imagePlaceholder = document.getElementById('write-image-placeholder');
    finalImageInput = document.getElementById('write-final-image');

    titleInput = document.getElementById('write-title');
    titleCharCount = document.getElementById('title-char-count');
    categorySelect = document.getElementById('write-category');
    priceInput = document.getElementById('write-price');
    isFreeCheckbox = document.getElementById('write-is-free');
    quickPriceContainer = document.getElementById('quick-price-container');
    locationInput = document.getElementById('write-location');
    descriptionInput = document.getElementById('write-description');
    descCharCount = document.getElementById('desc-char-count');

    sourceTabs = modalOverlay.querySelectorAll('.image-source-tabs .tab-btn');
    tabPanels = modalOverlay.querySelectorAll('.tab-panel');
    sampleChips = modalOverlay.querySelectorAll('.sample-chip');

    bindEvents();
  }

  // 4. 이벤트 바인딩
  function bindEvents() {
    // 닫기 및 취소
    if (closeBtn) closeBtn.addEventListener('click', closeWriteModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeWriteModal);

    // 오버레이 클릭 시 닫기 (모달 내부 클릭은 전파 방지)
    if (modalOverlay) {
      modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
          closeWriteModal();
        }
      });
    }

    // ESC 키 닫기
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isModalOpen()) {
        closeWriteModal();
      }
    });

    // 탭 전환
    if (sourceTabs) {
      sourceTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          const targetTab = this.dataset.tab;
          sourceTabs.forEach((t) => t.classList.remove('active'));
          tabPanels.forEach((p) => p.classList.remove('active'));

          this.classList.add('active');
          const activePanel = document.getElementById('tab-panel-' + targetTab);
          if (activePanel) activePanel.classList.add('active');
        });
      });
    }

    // 사진 등록 박스(미리보기 박스) 클릭 시 파일 선택창 열기
    if (imagePreviewBox && imageFileInput) {
      imagePreviewBox.addEventListener('click', function (e) {
        if (e.target.closest('#write-remove-image-btn')) return;
        imageFileInput.value = '';
        imageFileInput.click();
      });
    }

    // 파일 업로드 처리
    if (imageFileInput) {
      imageFileInput.addEventListener('change', handleFileUpload);
    }

    // URL 적용 버튼
    if (applyUrlBtn && imageUrlInput) {
      applyUrlBtn.addEventListener('click', handleUrlApply);
      imageUrlInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleUrlApply();
        }
      });
    }

    // 샘플 칩 클릭
    if (sampleChips) {
      sampleChips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          const imgUrl = this.dataset.img;
          if (imgUrl) {
            setImagePreview(imgUrl);
          }
        });
      });
    }

    // 이미지 삭제
    if (removeImageBtn) {
      removeImageBtn.addEventListener('click', clearImagePreview);
    }

    // 제목 글자 수 카운팅
    if (titleInput && titleCharCount) {
      titleInput.addEventListener('input', function () {
        titleCharCount.textContent = this.value.length;
        clearFieldError('title');
      });
    }

    // 카테고리 변경 시 에러 초기화
    if (categorySelect) {
      categorySelect.addEventListener('change', function () {
        clearFieldError('category');
      });
    }

    // 가격 포맷팅 및 이벤트
    if (priceInput) {
      priceInput.addEventListener('input', handlePriceInput);
      priceInput.addEventListener('focus', function () {
        if (this.value === '0') this.value = '';
      });
    }

    // 나눔 체크박스 토글
    if (isFreeCheckbox && priceInput) {
      isFreeCheckbox.addEventListener('change', handleFreeToggle);
    }

    // 빠른 금액 증감 칩
    if (quickPriceContainer && priceInput) {
      quickPriceContainer.addEventListener('click', handleQuickPrice);
    }

    // 동네 입력 시 에러 초기화
    if (locationInput) {
      locationInput.addEventListener('input', function () {
        clearFieldError('location');
      });
    }

    // 설명 글자 수 카운팅
    if (descriptionInput && descCharCount) {
      descriptionInput.addEventListener('input', function () {
        descCharCount.textContent = this.value.length;
        clearFieldError('description');
      });
    }

    // 폼 제출
    if (writeForm) {
      writeForm.addEventListener('submit', handleFormSubmit);
    }
  }

  // 5. 모달 제어 함수
  function isModalOpen() {
    return modalOverlay && modalOverlay.classList.contains('active');
  }

  function openWriteModal() {
    if (!modalOverlay) initElements();
    if (!modalOverlay) return;

    resetWriteForm();
    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // 포커스 이동
    setTimeout(function () {
      if (titleInput) titleInput.focus();
    }, 100);
  }

  function closeWriteModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function resetWriteForm() {
    if (writeForm) writeForm.reset();
    clearImagePreview();
    if (titleCharCount) titleCharCount.textContent = '0';
    if (descCharCount) descCharCount.textContent = '0';
    if (priceInput) {
      priceInput.disabled = false;
      priceInput.value = '';
    }
    if (locationInput && !locationInput.value) {
      locationInput.value = '역삼1동';
    }
    clearAllErrors();
  }

  // 6. 이미지 처리 로직
  function handleFileUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFieldError('image', '이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showFieldError('image', '파일 크기는 5MB 이하로 선택해주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  function handleUrlApply() {
    if (!imageUrlInput) return;
    const url = imageUrlInput.value.trim();
    if (!url) {
      showFieldError('image', '이미지 URL을 입력해주세요.');
      return;
    }

    setImagePreview(url);
    imageUrlInput.value = '';
  }

  function setImagePreview(src) {
    if (!imagePreview || !imagePlaceholder || !finalImageInput) return;
    imagePreview.src = src;
    imagePreview.classList.remove('hidden');
    imagePlaceholder.classList.add('hidden');
    if (removeImageBtn) removeImageBtn.classList.remove('hidden');
    finalImageInput.value = src;
    clearFieldError('image');
  }

  function clearImagePreview() {
    if (!imagePreview || !imagePlaceholder || !finalImageInput) return;
    imagePreview.src = '';
    imagePreview.classList.add('hidden');
    imagePlaceholder.classList.remove('hidden');
    if (removeImageBtn) removeImageBtn.classList.add('hidden');
    finalImageInput.value = '';
    if (imageFileInput) imageFileInput.value = '';
  }

  // 7. 가격 처리 로직
  function formatNumberWithComma(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function unformatNumber(str) {
    return parseInt(str.toString().replace(/[^\d]/g, ''), 10) || 0;
  }

  function handlePriceInput() {
    const rawVal = unformatNumber(this.value);
    this.value = rawVal > 0 ? formatNumberWithComma(rawVal) : '';
    clearFieldError('price');
  }

  function handleFreeToggle() {
    if (!priceInput) return;
    if (this.checked) {
      priceInput.value = '0';
      priceInput.disabled = true;
      if (quickPriceContainer) quickPriceContainer.style.opacity = '0.5';
      if (quickPriceContainer) quickPriceContainer.style.pointerEvents = 'none';
    } else {
      priceInput.disabled = false;
      priceInput.value = '';
      if (quickPriceContainer) quickPriceContainer.style.opacity = '1';
      if (quickPriceContainer) quickPriceContainer.style.pointerEvents = 'auto';
    }
    clearFieldError('price');
  }

  function handleQuickPrice(e) {
    const target = e.target;
    if (!priceInput || isFreeCheckbox?.checked) return;

    if (target.dataset.add) {
      const addAmount = parseInt(target.dataset.add, 10);
      const currentVal = unformatNumber(priceInput.value);
      const newVal = currentVal + addAmount;
      priceInput.value = formatNumberWithComma(newVal);
      clearFieldError('price');
    } else if (target.id === 'write-price-clear') {
      priceInput.value = '';
      clearFieldError('price');
    }
  }

  // 8. 유효성 검사 (Validation)
  function showFieldError(fieldName, message) {
    const errorEl = document.getElementById('error-' + fieldName);
    const inputEl = document.getElementById('write-' + fieldName);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }
    if (inputEl) {
      inputEl.classList.add('has-error');
    }
  }

  function clearFieldError(fieldName) {
    const errorEl = document.getElementById('error-' + fieldName);
    const inputEl = document.getElementById('write-' + fieldName);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('show');
    }
    if (inputEl) {
      inputEl.classList.remove('has-error');
    }
  }

  function clearAllErrors() {
    ['image', 'title', 'category', 'price', 'location', 'description'].forEach(clearFieldError);
  }

  function validateForm() {
    clearAllErrors();
    let isValid = true;
    let firstInvalidInput = null;

    // 1) 제목
    const titleVal = titleInput ? titleInput.value.trim() : '';
    if (!titleVal) {
      showFieldError('title', '상품명을 입력해주세요.');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = titleInput;
    } else if (titleVal.length < 2) {
      showFieldError('title', '상품명은 2자 이상 입력해주세요.');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = titleInput;
    }

    // 2) 카테고리
    const categoryVal = categorySelect ? categorySelect.value : '';
    if (!categoryVal) {
      showFieldError('category', '카테고리를 선택해주세요.');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = categorySelect;
    }

    // 3) 가격
    const isFree = isFreeCheckbox ? isFreeCheckbox.checked : false;
    const priceNum = priceInput ? unformatNumber(priceInput.value) : 0;
    if (!isFree && priceNum <= 0) {
      showFieldError('price', '가격을 입력하거나 무료 나눔을 선택해주세요.');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = priceInput;
    }

    // 4) 동네
    const locationVal = locationInput ? locationInput.value.trim() : '';
    if (!locationVal) {
      showFieldError('location', '거래 희망 동네를 입력해주세요.');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = locationInput;
    }

    // 5) 설명
    const descVal = descriptionInput ? descriptionInput.value.trim() : '';
    if (!descVal) {
      showFieldError('description', '자세한 설명을 입력해주세요.');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = descriptionInput;
    } else if (descVal.length < 5) {
      showFieldError('description', '설명은 5자 이상 정성스럽게 작성해주세요.');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = descriptionInput;
    } else if (descVal.length > 600) {
      showFieldError('description', '설명은 최대 600자까지 입력 가능합니다.');
      isValid = false;
      if (!firstInvalidInput) firstInvalidInput = descriptionInput;
    }

    if (firstInvalidInput) {
      firstInvalidInput.focus();
    }

    return isValid;
  }

  // 9. 폼 제출 및 아이템 추가
  function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      showToast('⚠️ 필수 항목을 확인해주세요.');
      return;
    }

    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const isFree = isFreeCheckbox.checked;
    const price = isFree ? 0 : unformatNumber(priceInput.value);
    const location = locationInput.value.trim();
    const description = descriptionInput.value.trim();
    const statusRadio = document.querySelector('input[name="write-status"]:checked');
    const status = statusRadio ? statusRadio.value : '판매중';
    const image = finalImageInput.value || DEFAULT_SAMPLE_IMG;

    // 신규 아이템 객체 생성
    const newItem = {
      id: 'gamza_' + Date.now(),
      title: title,
      category: category,
      price: price,
      isFree: isFree,
      location: location,
      status: status,
      description: description,
      image: image,
      createdAt: new Date().toISOString(),
      displayDate: '방금 전',
      seller: {
        nickname: '감자농부',
        level: '신선한 알감자',
        temperature: 36.5
      },
      likes: 0,
      views: 1,
      chatCount: 0
    };

    // 전역 상품 리스트에 추가 (window.gamzaProducts 또는 window.products)
    if (!window.gamzaProducts && !window.products) {
      window.gamzaProducts = [];
    }

    if (Array.isArray(window.gamzaProducts)) {
      window.gamzaProducts.unshift(newItem);
    }
    if (Array.isArray(window.products) && window.products !== window.gamzaProducts) {
      window.products.unshift(newItem);
    }

    // 커스텀 이벤트 발송 (다른 모듈/컴포넌트 연동용)
    const productAddedEvent = new CustomEvent('gamza:product-added', {
      detail: { product: newItem }
    });
    document.dispatchEvent(productAddedEvent);

    // renderList 콜백 호출 지원
    if (typeof window.renderList === 'function') {
      window.renderList();
    } else if (typeof window.renderProductList === 'function') {
      window.renderProductList();
    }

    // 토스트 및 모달 종료
    showToast('🥔 새로운 감자가 성공적으로 등록되었습니다!');
    closeWriteModal();
  }

  // 10. 토스트 알림 생성 / 표시
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

    setTimeout(function () {
      toast.classList.remove('show');
    }, 2800);
  }

  // DOM 로드 완료 시 바인딩
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initElements);
  } else {
    initElements();
  }

  // 전역 API 노출
  window.openWriteModal = openWriteModal;
  window.closeWriteModal = closeWriteModal;
  window.resetWriteForm = resetWriteForm;
  window.showGamzaToast = showToast;
})();
