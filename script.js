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
    const totalOriginal = 11;
    let currentIndex = 1;
    let originalImages = [];
    let slideWidth = 0;
    let isTransitioning = false;

    for (let i = 1; i <= totalOriginal; i++) {
        originalImages.push(`./images/slider1_${i}.png`);
    }

    function getExtendedImages() {
        if (originalImages.length === 0) return [];
        const last = originalImages[originalImages.length - 1];
        const first = originalImages[0];
        return [last, ...originalImages, first];
    }

    let extendedImages = [];

    function buildSlider() {
        extendedImages = getExtendedImages();
        track.innerHTML = '';
        dotsContainer.innerHTML = '';

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

        for (let i = 0; i < totalOriginal; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dot.dataset.index = i;
            dot.addEventListener('click', () => {
                goToOriginalSlide(i);
            });
            dotsContainer.appendChild(dot);
        }

        currentIndex = 1;
        updateSliderPosition(false);
        updateDots();
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
        if (!animate) {
            setTimeout(() => {
                track.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
            }, 20);
        }
    }

    function handleTransitionEnd() {
        if (currentIndex === 0) {
            currentIndex = totalOriginal;
            updateSliderPosition(false);
        } else if (currentIndex === totalOriginal + 1) {
            currentIndex = 1;
            updateSliderPosition(false);
        }
        updateDots();
    }

    function goToOriginalSlide(originalIdx) {
        if (isTransitioning) return;
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
        let originalIdx;
        if (currentIndex === 0) {
            originalIdx = totalOriginal - 1;
        } else if (currentIndex === totalOriginal + 1) {
            originalIdx = 0;
        } else {
            originalIdx = currentIndex - 1;
        }
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

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

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

    buildSlider();

    window.addEventListener('load', () => {
        setTimeout(() => {
            updateSliderPosition(false);
        }, 100);
    });

    const logoImg = document.querySelector('.logo');
    if (logoImg) {
        logoImg.addEventListener('error', () => {
            console.warn('⚠️ Логотип не найден: ./images/f1 logo.png');
        });
    }

    // --- Логика обратного отсчета до следующей гонки ---
    async function loadNextRaceData() {
        const container = document.getElementById('next-race-countdown');
        if (!container) return;
        try {
            const response = await fetch('https://api.jolpi.ca/ergast/f1/2026.json');
            if (!response.ok) throw new Error('Ошибка загрузки календаря');
            const data = await response.json();
            const races = data.MRData.RaceTable.Races;
            if (!races || races.length === 0) throw new Error('Нет данных о гонках');
            const now = new Date();
            let nextRace = null;
            for (const race of races) {
                const raceDate = new Date(race.date);
                if (raceDate >= now) {
                    nextRace = race;
                    break;
                }
            }
            if (!nextRace) {
                container.innerHTML = '<div class="countdown-card">Сезон 2026 года завершён. До следующего сезона ещё много времени!</div>';
                return;
            }
            displayRaceInfo(nextRace, container);
            startCountdown(nextRace.date, container);
        } catch (error) {
            console.error('Ошибка получения данных о следующей гонке:', error);
            container.innerHTML = '<div class="countdown-card error">⚠️ Не удалось загрузить информацию о следующей гонке.</div>';
        }
    }

        function displayRaceInfo(race, container) {
        const raceName = race.raceName;
        const circuit = race.Circuit.circuitName;
        const country = race.Circuit.Location.country;
        const raceDateObj = new Date(race.date);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = raceDateObj.toLocaleDateString('ru-RU', options);
        
        container.innerHTML = `
            <div class="countdown-card">
                <h3>СЛЕДУЮЩАЯ ГОНКА</h3>
                <div class="race-name">${escapeHtml(raceName)}</div>
                <div class="race-circuit">${escapeHtml(circuit)}, ${escapeHtml(country)}</div>
                <div class="race-date">${formattedDate}</div>
                <div class="countdown-timer" id="countdown-timer">
                    <div class="time-unit"><span id="days">00</span><span>Дней</span></div>
                    <div class="time-unit"><span id="hours">00</span><span>Часов</span></div>
                    <div class="time-unit"><span id="minutes">00</span><span>Минут</span></div>
                    <div class="time-unit"><span id="seconds">00</span><span>Секунд</span></div>
                </div>
                <div id="previous-winner-info" class="previous-winner">Загрузка информации о прошлом победителе...</div>
            </div>
        `;
        
        // Загружаем прошлого победителя
        loadPreviousWinner(race);
    }

    function startCountdown(targetDate, container) {
        const countDownDate = new Date(targetDate).getTime();
        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = countDownDate - now;
            if (distance < 0) {
                clearInterval(timerInterval);
                const timerDiv = document.getElementById('countdown-timer');
                if (timerDiv) timerDiv.innerHTML = '<div class="race-started">ГОНКА НАЧАЛАСЬ!</div>';
                return;
            }
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            if (document.getElementById('days')) {
                document.getElementById('days').innerText = days < 10 ? '0' + days : days;
                document.getElementById('hours').innerText = hours < 10 ? '0' + hours : hours;
                document.getElementById('minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
                document.getElementById('seconds').innerText = seconds < 10 ? '0' + seconds : seconds;
            }
        };
        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // ========== ТАБЛИЦА РЕЗУЛЬТАТОВ (динамическая) ==========
    async function loadResultsTable() {
        const container = document.getElementById('race-results-table');
        if (!container) return;
        try {
            const response = await fetch('https://api.jolpi.ca/ergast/f1/2026/results.json?limit=100');
            if (!response.ok) throw new Error('Ошибка загрузки результатов');
            const data = await response.json();
            const races = data.MRData.RaceTable.Races;
            if (!races || races.length === 0) throw new Error('Нет данных');
            let html = `
                <div class="race-results">
                    <h2 class="section-title">2026 RACE RESULTS</h2>
                    <div class="table-wrapper">
                        <table class="results-table">
                            <thead>
                                <tr><th>ГРАН-ПРИ</th><th>ДАТА</th><th>ПОБЕДИТЕЛЬ</th><th>КОМАНДА</th><th>КРУГИ</th><th>ВРЕМЯ</th></tr>
                            </thead>
                            <tbody>
            `;
            for (const race of races) {
                if (!race.Results || race.Results.length === 0) continue;
                const winner = race.Results[0];
                const driver = winner.Driver;
                const constructor = winner.Constructor;
                const time = winner.Time?.time || winner.status || '—';
                const dateObj = new Date(race.date);
                const formattedDate = `${dateObj.getDate().toString().padStart(2,'0')} ${dateObj.toLocaleString('ru', { month: 'short' }).replace('.','')}`;
                html += `
                    <tr>
                        <td>${escapeHtml(race.raceName)}</td>
                        <td>${formattedDate}</td>
                        <td>${escapeHtml(driver?.familyName || '—')}</td>
                        <td>${escapeHtml(constructor?.name || '—')}</td>
                        <td>${winner.laps || '—'}</td>
                        <td><strong>${escapeHtml(time)}</strong></td>
                    </tr>
                `;
            }
            html += `</tbody></table></div></div>`;
            container.innerHTML = html;
        } catch (error) {
            console.error('Таблица не загружена:', error);
            container.innerHTML = '<div class="error-message" style="text-align:center; color:#ff6666; padding:2rem;">⚠️ Не удалось загрузить результаты гонок</div>';
        }
    }

    // Запускаем обе функции после загрузки страницы
    document.addEventListener('DOMContentLoaded', () => {
        loadNextRaceData();
        loadResultsTable();
    });


        // Загрузка информации о прошлом победителе на этой трассе (сезон 2025)
        // Загрузка информации о прошлом победителе на этой трассе (поиск по последним сезонам)
    async function loadPreviousWinner(nextRace) {
        const winnerContainer = document.getElementById('previous-winner-info');
        if (!winnerContainer) return;

        const circuitId = nextRace.Circuit.circuitId;
        const seasons = [2025, 2024, 2023]; // от самого свежего к более старым

        for (const season of seasons) {
            try {
                const response = await fetch(`https://api.jolpi.ca/ergast/f1/${season}/results.json?limit=100`);
                if (!response.ok) continue;
                const data = await response.json();
                const races = data.MRData.RaceTable.Races;
                const pastRace = races.find(race => race.Circuit.circuitId === circuitId);
                if (pastRace && pastRace.Results && pastRace.Results.length > 0) {
                    const winner = pastRace.Results[0];
                    const driver = winner.Driver;
                    const constructor = winner.Constructor;
                    const driverName = `${driver.givenName} ${driver.familyName}`;
                    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(driverName)}&background=e10600&color=fff&size=100&rounded=true&bold=true`;
                    const raceDate = new Date(pastRace.date);
                    const formattedDate = raceDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
                    const time = winner.Time?.time || winner.status || '—';
                    
                    winnerContainer.innerHTML = `
                        <div class="previous-winner-card">
                            <div class="winner-photo">
                                <img src="${avatarUrl}" alt="${driverName}">
                            </div>
                            <div class="winner-details">
                                <div class="winner-label">ПОБЕДИТЕЛЬ НА ЭТОЙ ТРАССЕ (${season})</div>
                                <div class="winner-name">${escapeHtml(driverName)}</div>
                                <div class="winner-team">${escapeHtml(constructor.name)}</div>
                                <div class="winner-date">📅 ${formattedDate}</div>
                                <div class="winner-laps">Круги: ${winner.laps}</div>
                                <div class="winner-time">⏱ Время: ${escapeHtml(time)}</div>
                            </div>
                        </div>
                    `;
                    return;
                }
            } catch (err) {
                console.warn(`Не удалось загрузить сезон ${season}:`, err);
            }
        }
        // Если ничего не нашли
        winnerContainer.innerHTML = `<div class="previous-winner-error">Нет данных о прошлом победителе для этой трассы</div>`;
    }
})();