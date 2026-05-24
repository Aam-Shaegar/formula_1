(function() {
    console.log('✅ Бесконечная карусель Формулы 1');

    // ---------- ГАМБУРГЕР (без изменений) ----------
    const hamburger = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
            if (hamburger && hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
            }
        }
    });

    // ---------- БЕСКОНЕЧНАЯ КАРУСЕЛЬ (с клонированием) ----------
    const track = document.getElementById('sliderTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('sliderDots');

    const totalOriginal = 11;           // количество реальных изображений
    let currentIndex = 1;               // индекс в расширенном массиве (с учетом клонов)
    let originalImages = [];
    let slideWidth = 0;
    let isTransitioning = false;

    // Генерируем пути к оригинальным изображениям (с .png)
    for (let i = 1; i <= totalOriginal; i++) {
        originalImages.push(`./images/slider1_${i}.png`);
    }

    // Строим расширенный массив: [копия последнего, ...оригиналы..., копия первого]
    function getExtendedImages() {
        if (originalImages.length === 0) return [];
        const last = originalImages[originalImages.length - 1];
        const first = originalImages[0];
        return [last, ...originalImages, first];
    }

    let extendedImages = [];

    // Построение DOM: создаём img для каждого расширенного слайда и точки для оригиналов
    function buildSlider() {
        extendedImages = getExtendedImages();
        track.innerHTML = '';
        dotsContainer.innerHTML = '';

        // Создаем изображения
        extendedImages.forEach((src, idx) => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = `Слайд ${idx}`;
            img.onerror = () => {
                console.warn(`⚠️ Не загрузилось: ${src}`);
                img.style.backgroundColor = '#222';
            };
            track.appendChild(img);
        });

        // Создаем точки (только для оригиналов)
        for (let i = 0; i < totalOriginal; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dot.dataset.index = i;
            dot.addEventListener('click', () => {
                goToOriginalSlide(i);
            });
            dotsContainer.appendChild(dot);
        }

        // Устанавливаем начальную позицию: смещение на 1 слайд (показываем первый оригинал)
        currentIndex = 1; // т.к. extended[0] - клон последнего, extended[1] - первый оригинал
        updateSliderPosition(false);
        updateDots();

        // Слушатель окончания transition, чтобы сделать "бесшовный сброс"
        track.addEventListener('transitionend', handleTransitionEnd);
    }

    function updateSliderPosition(animate = true) {
        if (!track.children.length) return;
        if (!animate) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
        }
        slideWidth = track.children[0].clientWidth;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        // Принудительно сбрасываем transition после синхронного обновления, если анимация не нужна
        if (!animate) {
            // небольшая задержка, чтобы браузер успел применить стили
            setTimeout(() => {
                track.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
            }, 20);
        }
    }

    function handleTransitionEnd() {
        // Если мы на клоне последнего (индекс 0) — перепрыгиваем на оригинал последнего
        if (currentIndex === 0) {
            currentIndex = totalOriginal; // индекс оригинала последнего (т.к. extended[totalOriginal] — последний оригинал? Давайте разберем)
            // extended = [clone_last, original1, original2, ..., originalN, clone_first]
            // Индексы: 0 - clone_last; 1..totalOriginal - оригиналы (1..N); totalOriginal+1 - clone_first
            // Оригинал последнего имеет индекс totalOriginal (например, 11 при N=11)
            // Значит, при переходе на clone_last (0) надо переместиться на totalOriginal (последний оригинал)
            updateSliderPosition(false);
        } 
        // Если мы на клоне первого (индекс totalOriginal+1) — перепрыгиваем на первый оригинал (индекс 1)
        else if (currentIndex === totalOriginal + 1) {
            currentIndex = 1;
            updateSliderPosition(false);
        }
        // Обновляем точки в соответствии с реальным оригинальным индексом
        updateDots();
    }

    function goToOriginalSlide(originalIdx) {
        if (isTransitioning) return;
        // оригинальный индекс от 0 до totalOriginal-1
        // в extended он соответствует индексу originalIdx + 1 (т.к. первый клон в 0)
        const targetExtendedIndex = originalIdx + 1;
        if (targetExtendedIndex === currentIndex) return;
        currentIndex = targetExtendedIndex;
        updateSliderPosition(true);
        updateDots();
    }

    function nextSlide() {
        if (isTransitioning) return;
        currentIndex++;
        updateSliderPosition(true);
        updateDots();
    }

    function prevSlide() {
        if (isTransitioning) return;
        currentIndex--;
        updateSliderPosition(true);
        updateDots();
    }

    function updateDots() {
        // Определяем, какой оригинальный слайд сейчас показывается
        let originalIdx;
        if (currentIndex === 0) {
            originalIdx = totalOriginal - 1; // клон последнего -> последний оригинал
        } else if (currentIndex === totalOriginal + 1) {
            originalIdx = 0; // клон первого -> первый оригинал
        } else {
            originalIdx = currentIndex - 1; // т.к. extended[1] -> оригинал[0]
        }
        // На всякий случай ограничим
        if (originalIdx < 0) originalIdx = 0;
        if (originalIdx >= totalOriginal) originalIdx = totalOriginal - 1;

        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, idx) => {
            if (idx === originalIdx) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Обработчики кнопок
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // Адаптация при ресайзе
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (track.children.length) {
                slideWidth = track.children[0].clientWidth;
                updateSliderPosition(false);
            }
        }, 100);
    });

    // Старт
    buildSlider();

    // Дополнительная коррекция после полной загрузки всех изображений
    window.addEventListener('load', () => {
        setTimeout(() => {
            updateSliderPosition(false);
        }, 100);
    });

    // Логотип
    const logoImg = document.querySelector('.logo');
    if (logoImg) {
        logoImg.addEventListener('error', () => {
            console.warn('⚠️ Логотип не найден: ./images/f1 logo.png');
        });
    }
})();