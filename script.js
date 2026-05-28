(function() {
    console.log('✅ Сайт Формулы 1 — полная версия');

    // ---------- ГАМБУРГЕР ----------
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
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
            if (hamburger && hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
            }
        }
    });

    // ---------- КАРУСЕЛЬ (полностью ваш старый код) ----------
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
            dot.addEventListener('click', () => { goToOriginalSlide(i); });
            dotsContainer.appendChild(dot);
        }
        currentIndex = 1;
        updateSliderPosition(false);
        updateDots();
        track.addEventListener('transitionend', handleTransitionEnd);
    }
    function updateSliderPosition(animate = true) {
        if (!track.children.length) return;
        if (!animate) track.style.transition = 'none';
        else track.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
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
        if (currentIndex === 0) originalIdx = totalOriginal - 1;
        else if (currentIndex === totalOriginal + 1) originalIdx = 0;
        else originalIdx = currentIndex - 1;
        if (originalIdx < 0) originalIdx = 0;
        if (originalIdx >= totalOriginal) originalIdx = totalOriginal - 1;
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, idx) => {
            if (idx === originalIdx) dot.classList.add('active');
            else dot.classList.remove('active');
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
        setTimeout(() => { updateSliderPosition(false); }, 100);
    });
    const logoImg = document.querySelector('.logo');
    if (logoImg) logoImg.addEventListener('error', () => { console.warn('⚠️ Логотип не найден'); });

    // ---------- ОБРАТНЫЙ ОТСЧЁТ И ПРОШЛЫЙ ПОБЕДИТЕЛЬ (ваш старый код) ----------
    async function loadNextRaceData() {
        const container = document.getElementById('next-race-countdown');
        if (!container) return;
        try {
            const response = await fetch('https://api.jolpi.ca/ergast/f1/2026.json');
            if (!response.ok) throw new Error();
            const data = await response.json();
            const races = data.MRData.RaceTable.Races;
            if (!races || races.length === 0) throw new Error();
            const now = new Date();
            let nextRace = null;
            for (const race of races) {
                const raceDate = new Date(race.date);
                if (raceDate >= now) { nextRace = race; break; }
            }
            if (!nextRace) {
                container.innerHTML = '<div class="countdown-card">Сезон 2026 года завершён. До следующего сезона ещё много времени!</div>';
                return;
            }
            displayRaceInfo(nextRace, container);
            startCountdown(nextRace.date, container);
        } catch (error) {
            container.innerHTML = '<div class="countdown-card error">⚠️ Не удалось загрузить информацию о следующей гонке.</div>';
        }
    }
    function displayRaceInfo(race, container) {
        const raceName = race.raceName;
        const circuit = race.Circuit.circuitName;
        const country = race.Circuit.Location.country;
        const raceDateObj = new Date(race.date);
        const formattedDate = raceDateObj.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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
        loadPreviousWinner(race);
    }
    function startCountdown(targetDate) {
        const countDownDate = new Date(targetDate).getTime();
        let timerInterval;
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
        timerInterval = setInterval(updateTimer, 1000);
    }
    async function loadPreviousWinner(nextRace) {
        const winnerContainer = document.getElementById('previous-winner-info');
        if (!winnerContainer) return;
        const circuitName = nextRace.Circuit.circuitName;
        const country = nextRace.Circuit.Location.country;
        const seasons = [2025, 2024, 2023, 2022, 2021];
        for (const season of seasons) {
            try {
                const response = await fetch(`https://api.jolpi.ca/ergast/f1/${season}/results.json?limit=100`);
                if (!response.ok) continue;
                const data = await response.json();
                const races = data.MRData.RaceTable.Races;
                const pastRace = races.find(race => race.Circuit.circuitName === circuitName || race.Circuit.Location.country === country);
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
                            <div class="winner-photo"><img src="${avatarUrl}" alt="${driverName}"></div>
                            <div class="winner-details">
                                <div class="winner-label">🏆 ПОБЕДИТЕЛЬ НА ЭТОЙ ТРАССЕ (${season})</div>
                                <div class="winner-name">${escapeHtml(driverName)}</div>
                                <div class="winner-team">${escapeHtml(constructor.name)}</div>
                                <div class="winner-date">📅 ${formattedDate}</div>
                                <div class="winner-laps">🏁 Круги: ${winner.laps}</div>
                                <div class="winner-time">⏱ Время: ${escapeHtml(time)}</div>
                            </div>
                        </div>
                    `;
                    return;
                }
            } catch (err) { console.warn(err); }
        }
        winnerContainer.innerHTML = `<div class="previous-winner-card placeholder"><div class="winner-photo placeholder-icon">🏁</div><div class="winner-details"><div class="winner-label">НЕТ ДАННЫХ О ПРОШЛОМ ПОБЕДИТЕЛЕ</div><div class="winner-name">Эта трасса ещё не проводила гонок в 2021–2025</div><div class="winner-team">Данные появятся после первой гонки</div></div></div>`;
    }

    // ---------- ТАБЛИЦА РЕЗУЛЬТАТОВ (ваш старый код) ----------
    async function loadResultsTable() {
        const container = document.getElementById('race-results-table');
        if (!container) return;
        try {
            const response = await fetch('https://api.jolpi.ca/ergast/f1/2026/results.json?limit=100');
            if (!response.ok) throw new Error();
            const data = await response.json();
            const races = data.MRData.RaceTable.Races;
            if (!races || races.length === 0) throw new Error();
            let html = `<div class="race-results"><h2 class="section-title">2026 RACE RESULTS</h2><div class="table-wrapper"><table class="results-table"><thead><tr><th>ГРАН-ПРИ</th><th>ДАТА</th><th>ПОБЕДИТЕЛЬ</th><th>КОМАНДА</th><th>КРУГИ</th><th>ВРЕМЯ</th></tr></thead><tbody>`;
            for (const race of races) {
                if (!race.Results || race.Results.length === 0) continue;
                const winner = race.Results[0];
                const driver = winner.Driver;
                const constructor = winner.Constructor;
                const time = winner.Time?.time || winner.status || '—';
                const dateObj = new Date(race.date);
                const formattedDate = `${dateObj.getDate().toString().padStart(2,'0')} ${dateObj.toLocaleString('ru', { month: 'short' }).replace('.','')}`;
                html += `<tr><td>${escapeHtml(race.raceName)}</td><td>${formattedDate}</td><td>${escapeHtml(driver?.familyName || '—')}</td><td>${escapeHtml(constructor?.name || '—')}</td><td>${winner.laps || '—'}</td><td><strong>${escapeHtml(time)}</strong></td></tr>`;
            }
            html += `</tbody></table></div></div>`;            container.innerHTML = html;
        } catch (error) {
            container.innerHTML = '<div class="error-message" style="text-align:center; color:#ff6666; padding:2rem;">⚠️ Не удалось загрузить результаты гонок</div>';
        }
    }

    // ---------- НОВЫЙ ФРОНТЕНД: голосование, лента, форма ----------
    const driversList = [
        "George Russell",
        "Kimi Antonelli",
        "Charles Leclerc",
        "Lewis Hamilton",
        "Lando Norris",
        "Oscar Piastri",
        "Max Verstappen",
        "Liam Lawson",
        "Arvid Lindblad",
        "Oliver Bearman",
        "Carlos Sainz",
        "Fernando Alonso"
    ];

    async function loadPoll() {
        const container = document.getElementById('poll-container');
        if (!container) return;
        try {
            const res = await fetch('api/poll.php');
            if (!res.ok) throw new Error();
            const data = await res.json();
            let total = 0;
            for (let d of driversList) total += data[d] || 0;
            let html = '';
            for (let driver of driversList) {
                const count = data[driver] || 0;
                const percent = total ? (count/total*100).toFixed(1) : 0;
                html += `<div class="poll-bar"><div class="poll-driver">${escapeHtml(driver)}</div><div class="poll-bar-bg"><div class="poll-bar-fill" style="width:${percent}%">${percent}%</div></div><div class="poll-percent">${count} гол.</div></div>`;
            }
            container.innerHTML = html;
        } catch (err) {
            container.innerHTML = '<p class="error-message">Не удалось загрузить голосование</p>';
        }
    }

    async function loadTicker() {
        const trackDiv = document.getElementById('ticker-track');
        if (!trackDiv) return;
        try {
            const res = await fetch('api/comments.php');
            if (!res.ok) throw new Error();
            const comments = await res.json();
            if (!comments.length) {
                trackDiv.innerHTML = '<div class="ticker-item">Пока нет комментариев. Будьте первым!</div>';
                return;
            }
            let html = '';
            for (let i = 0; i < 2; i++) {
                comments.forEach(c => {
                    html += `<div class="ticker-item" data-id="${c.id}"><div class="ticker-name">${escapeHtml(c.name)}</div><div class="ticker-date">${escapeHtml(c.updated_at)}</div><div class="ticker-comment">${escapeHtml(c.comment.substring(0, 150))}${c.comment.length>150?'…':''}</div></div>`;
                });
            }
            trackDiv.innerHTML = html;
            document.querySelectorAll('.ticker-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    trackDiv.classList.toggle('paused');
                });
            });
        } catch (err) {
            trackDiv.innerHTML = '<div class="ticker-item">Ошибка загрузки комментариев</div>';
        }
    }

    async function initForm() {
        const form = document.getElementById('user-form');
        if (!form) return;
        const driversContainer = document.getElementById('drivers-checkboxes');
        if (driversContainer) {
            driversContainer.innerHTML = '';
            driversList.forEach(driver => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" name="drivers" value="${escapeHtml(driver)}"> ${escapeHtml(driver)}`;
                driversContainer.appendChild(label);
            });
        }
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            document.querySelectorAll('.field-error').forEach(el => el.innerHTML = '');
            document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const birthdate = document.getElementById('birthdate').value;
            const drivers = Array.from(document.querySelectorAll('input[name="drivers"]:checked')).map(cb => cb.value);
            const comment = document.getElementById('comment').value.trim();
            const terms = document.getElementById('terms').checked;
            let hasError = false;
            if (!/^[a-zA-Zа-яА-ЯёЁ]+$/.test(name) || (/[a-zA-Z]/.test(name) && /[а-яА-ЯёЁ]/.test(name))) {
                document.getElementById('name-error').innerHTML = 'Имя должно содержать только русские или только английские буквы';
                document.getElementById('name').classList.add('error');
                hasError = true;
            }
            if (!email.includes('@') || !email.includes('.')) {
                document.getElementById('email-error').innerHTML = 'Неверный формат email';
                document.getElementById('email').classList.add('error');
                hasError = true;
            }
            if (!birthdate) {
                document.getElementById('birthdate-error').innerHTML = 'Введите дату рождения';
                document.getElementById('birthdate').classList.add('error');
                hasError = true;
            } else {
                const age = new Date().getFullYear() - new Date(birthdate).getFullYear();
                if (age < 12) {
                    document.getElementById('birthdate-error').innerHTML = 'Вам должно быть не менее 12 лет';
                    document.getElementById('birthdate').classList.add('error');
                    hasError = true;
                }
            }
            if (drivers.length === 0) {
                document.getElementById('drivers-error').innerHTML = 'Выберите хотя бы одного гонщика';
                document.getElementById('drivers-checkboxes').classList.add('error');
                hasError = true;
            }
            if (!terms) {
                document.getElementById('terms-error').innerHTML = 'Необходимо подтвердить ознакомление с контрактом';
                hasError = true;
            }
            if (hasError) return;
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            const msgDiv = document.getElementById('form-message');
            msgDiv.innerHTML = 'Отправка...';
            try {
                const res = await fetch('api/register.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, birthdate, drivers, comment, terms })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    msgDiv.innerHTML = `<span style="color: #4caf50;">✅ Регистрация успешна!<br>Логин: ${escapeHtml(data.email)}<br>Пароль: <strong>${escapeHtml(data.password)}</strong><br>Сохраните пароль, он больше не будет показан.</span>`;
                    form.reset();
                    loadTicker();
                    loadPoll();
                    setTimeout(() => { msgDiv.innerHTML = ''; }, 15000);
                } else {
                    let errorMsg = '';
                    switch (data.error) {
                        case 'name_invalid': errorMsg = 'Имя содержит недопустимые символы или смешаны алфавиты'; break;
                        case 'name_length': errorMsg = 'Имя слишком длинное'; break;
                        case 'email_invalid': errorMsg = 'Неверный формат email'; break;
                        case 'email_length': errorMsg = 'Email слишком длинный'; break;
                        case 'birthdate_invalid': errorMsg = 'Неверная дата рождения'; break;
                        case 'age_too_young': errorMsg = 'Вам должно быть не менее 12 лет'; break;
                        case 'drivers_empty': errorMsg = 'Выберите хотя бы одного гонщика'; break;
                        case 'terms_not_accepted': errorMsg = 'Подтвердите ознакомление с контрактом'; break;
                        case 'email_exists': errorMsg = 'Этот email уже зарегистрирован'; break;
                        default: errorMsg = 'Ошибка сервера';
                    }
                    msgDiv.innerHTML = `<span style="color: #ff6666;">❌ ${errorMsg}</span>`;
                }
            } catch (err) {
                msgDiv.innerHTML = '<span style="color: #ff6666;">❌ Ошибка соединения с сервером</span>';
            } finally {
                submitBtn.disabled = false;
            }
        });
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

    // ---------- ЗАПУСК ВСЕГО ----------
    document.addEventListener('DOMContentLoaded', () => {
        loadNextRaceData();
        loadResultsTable();
        loadPoll();
        loadTicker();
        initForm();
    });

    // Кнопки навигации
    const profileBtn = document.getElementById('myProfileBtn');
    if (profileBtn) profileBtn.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'login.html'; });
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) adminBtn.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'adminka/login.html'; });

        // ---------- БЕСКОНЕЧНАЯ БЕГУЩАЯ ЛЕНТА ИЗОБРАЖЕНИЙ ГОНЩИКОВ ----------
    async function initRacersFlow() {
        const track = document.getElementById('racersFlowTrack');
        if (!track) return;
        
        const totalRacers = 12; // ← ИСПРАВЛЕНО: было 22, стало 12
        const repeatCount = 5;
        let html = '';
        
        for (let repeat = 0; repeat < repeatCount; repeat++) {
            for (let i = 1; i <= totalRacers; i++) {
                html += `<img src="./images/racers_flow/${i}.png" alt="Гонщик ${i}" loading="lazy" onerror="this.style.opacity='0.5'">`;
            }
        }
        track.innerHTML = html;
        
        const container = document.querySelector('.racers-flow-container');
        if (!container) return;
        
        let imageWidth = 650;
        let gap = 16;
        let setWidth = totalRacers * (imageWidth + gap);
        
        setTimeout(() => {
            const firstImg = track.querySelector('img');
            if (firstImg) {
                imageWidth = firstImg.clientWidth;
                setWidth = totalRacers * (imageWidth + gap);
                container.scrollLeft = setWidth * 2;
            }
        }, 100);
        
        let scrollSpeed = 0;
        let scrollInterval = null;
        
        function smoothScroll() {
            if (Math.abs(scrollSpeed) < 0.05) {
                if (scrollInterval) {
                    clearInterval(scrollInterval);
                    scrollInterval = null;
                }
                return;
            }
            
            let newScrollLeft = container.scrollLeft + scrollSpeed;
            const maxScroll = container.scrollWidth - container.clientWidth;
            
            if (newScrollLeft <= setWidth) {
                newScrollLeft = maxScroll - setWidth * 2;
                container.scrollLeft = newScrollLeft;
            } else if (newScrollLeft >= maxScroll - setWidth) {
                newScrollLeft = setWidth * 2;
                container.scrollLeft = newScrollLeft;
            } else {
                container.scrollLeft = newScrollLeft;
            }
            
            scrollSpeed *= 0.96;
        }
        
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            scrollSpeed += e.deltaY * 0.25;
            if (!scrollInterval) {
                scrollInterval = setInterval(smoothScroll, 16);
            }
        }, { passive: false });
        
        let autoScrollInterval;
        let isUserInteracting = false;
        
        function startAutoScroll() {
            if (autoScrollInterval) clearInterval(autoScrollInterval);
            autoScrollInterval = setInterval(() => {
                if (!isUserInteracting) {
                    let newLeft = container.scrollLeft + 3.5;
                    const maxScroll = container.scrollWidth - container.clientWidth;
                    
                    if (newLeft >= maxScroll - setWidth) {
                        container.scrollLeft = setWidth * 2;
                    } else if (newLeft <= setWidth) {
                        container.scrollLeft = maxScroll - setWidth * 2;
                    } else {
                        container.scrollLeft = newLeft;
                    }
                }
            }, 30);
        }
        
        container.addEventListener('mouseenter', () => { isUserInteracting = true; });
        container.addEventListener('mouseleave', () => { isUserInteracting = false; });
        container.addEventListener('touchstart', () => { isUserInteracting = true; });
        container.addEventListener('touchend', () => { setTimeout(() => { isUserInteracting = false; }, 1000); });
        
        startAutoScroll();
    }
    // Запускаем ленту гонщиков
    initRacersFlow();


})();