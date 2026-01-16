// Глобальні змінні
const API_URL = "http://127.0.0.1:8000";

async function login() {
  const name = document.getElementById("username").value;

  const response = await fetch(
    `http://127.0.0.1:8000/login?name=${encodeURIComponent(name)}`,
    { method: "POST" }
  );

  const data = await response.json();

  localStorage.setItem("user", data.username);
  alert("Увійшов як " + data.username);
}
// ==================== ГОЛОВНА ІНІЦІАЛІЗАЦІЯ ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 KIBER-KAFE 3 завантажується...');
    

const savedUser = localStorage.getItem('cafeNexusUser');
    if (savedUser) {
        STATE.user = JSON.parse(savedUser);
    }
    updateUI();

    initNavigation();
    initHeroSection();
    initVideoSection();
    initMenuSection();
    initNftGallery();
    initAvatarsSection();
    initBonusesSection();
    initSecuritySection();
    initContactSection();
    initModals();
    initAuth();

    
    loadNfts();
    updateOnlineStats();
    startStatsAnimation();
    
    console.log('✅ KIBER-KAFE 3 готоадй до зв\'язку з API!');
    
    setTimeout(() => {
        showNotification('🌟 Ласкаво просимо до METAVCECBITУ!', 'success');
    }, 1000);
});

// ==================== МОДАЛЬНІ ВІКНА ТА API ЛОГІКА ====================


function initModals() {
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const submitLogin = document.getElementById('submitLogin');

    if (loginBtn) {
        loginBtn.onclick = () => {
            loginModal.style.display = 'flex';
            loginModal.classList.add('active');
        };
    }

    if (submitLogin) {
      
        submitLogin.onclick = async function () {
            const usernameInput = document.getElementById('username');
            const username = usernameInput ? usernameInput.value.trim() : '';

            if (!username) {
                showNotification('❌ Введіть логін', 'error');
                return;
            }

            // Блокуємо кнопку та вмикаємо спінер
            this.disabled = true;
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вхід...';

            try {
                // Спроба зв'язку з Python сервером
                const response = await fetch(`${API_URL}/login?name=${encodeURIComponent(username)}`, { 
                    method: 'POST' 
                }).catch(() => ({ ok: false })); 

                if (response.ok) {
                    const data = await response.json();
                    STATE.user = { username: data.user.name, level: data.user.level, xp: data.user.xp };
                } else {
                    // Якщо бекенд не відповідає, логінимо локально
                    STATE.user = { username: username, level: 1, xp: 0 };
                }

                // Зберігаємо стан та оновлюємо нік у профілі
                localStorage.setItem('cafeNexusUser', JSON.stringify(STATE.user));
                document.getElementById('profileName').textContent = STATE.user.username;
                
                if (typeof updateUI === "function") updateUI();

                // ГАРАНТОВАНЕ ЗАКРИТТЯ ВІКНА
                loginModal.style.display = 'none';
                loginModal.classList.remove('active');
                
                showNotification(`✅ Вітаємо, ${STATE.user.username}!`, 'success');

            } catch (err) {
                console.error("Помилка авторизації:", err);
            } finally {
                // Повертаємо кнопку в робочий стан у будь-якому випадку
                this.disabled = false;
                this.innerHTML = originalText;
            }
        };
    }



    
    // Логіка закриття через хрестик
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.onclick = (e) => {
            if (e.target === el || e.target.classList.contains('modal-close')) {
                loginModal.style.display = 'none';
                loginModal.classList.remove('active');
            }
        };
    });
}

function initAuth() {
    // 1. Елементи
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const submitLogin = document.getElementById('submitLogin');
    const profileName = document.getElementById('profileName');

    // 2. Відкриття
    if (loginBtn && loginModal) {
        loginBtn.onclick = () => {
            loginModal.style.display = 'flex';
        };
    }

    // 3. Логіка входу
    if (submitLogin) {
        submitLogin.onclick = function() {
            const usernameInput = document.getElementById('username');
            const username = usernameInput ? usernameInput.value.trim() : '';

            if (!username) {
                showNotification('❌ Введіть нікнейм', 'error');
                return;
            }

            // Анімація на кнопці
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-cog fa-spin"></i> ВХІД...';

            setTimeout(() => {
                // Оновлюємо стан
                STATE.user = {
                    username: username,
                    level: STATE.userLevel || 1,
                    xp: STATE.userXP || 0
                };

                // Оновлюємо текст у профілі
                if (profileName) profileName.textContent = username;

                // Зберігаємо в пам'ять
                saveUserToStorage();

                // ПРИМУСОВЕ ЗАКРИТТЯ (найважливіше)
                if (loginModal) {
                    loginModal.style.display = 'none';
                }

                // Повертаємо кнопку в норму
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-sign-in-alt"></i> УВІЙТИ';

                showNotification(`✅ Вітаємо, ${username}!`, 'success');
                addXP(10);
            }, 500);
        };
    }

    // 4. Закриття на хрестик
    const closeBtn = document.getElementById('closeLoginModal');
    if (closeBtn && loginModal) {
        closeBtn.onclick = () => {
            loginModal.style.display = 'none';
        };
    }
}

    // Закриття модалок
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.onclick = (e) => {
            if (e.target === el || e.target.classList.contains('modal-close')) {
                const modal = el.closest('.modal-overlay');
                if (modal) closeModal(modal.id);
            }
        };
    });


// ==================== АВАТАРИ ТА СИНХРОНІЗАЦІЯ (UPDATE) ====================
async function syncAvatarWithServer() {
    try {
        await fetch(`${API_URL}/user/avatar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                head: userAvatar.head,
                body: userAvatar.body,
                colorSkin: userAvatar.colorSkin,
                colorClothes: userAvatar.colorClothes
            })
        });
        console.log('📡 Аватар збережено на сервері');
    } catch (err) {
        console.warn('📡 Сервер офлайн, дані не синхронізовано');
    }
}



// 1. ФУНКЦІЯ ОНОВЛЕННЯ ІНТЕРФЕЙСУ (Додай перед функцією init)

function updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileName = document.getElementById('profileName');

    // Перевіряємо наявність елементів перед маніпуляціями
    if (!loginBtn || !logoutBtn) return;

    if (STATE.user && STATE.user.username) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'flex';
        if (profileName) profileName.textContent = STATE.user.username;
    } else {
        loginBtn.style.display = 'flex';
        logoutBtn.style.display = 'none';
        if (profileName) profileName.textContent = 'Гість';
    }
}


// 3. ПЕРЕДАЧА ЗАМОВЛЕННЯ НА PYTHON
async function sendToPython(name, price) {
    try {
        const userId = STATE.user ? STATE.user.id : 0;
        await fetch('http://127.0.0.1:8000/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                item: name,
                price: parseInt(price),
                user_id: userId
            })
        });
        console.log(`✅ Надіслано на Python: ${name}`);
    } catch (err) {
        console.error("❌ Бекенд не відповідає:", err);
    }
}

// 4. ОНОВЛЕНА ФУНКЦІЯ addToCart (Щоб летіло в базу)
function addToCart(name, price, category) {
    // Відправка на сервер
    sendToPython(name, price);

    const existingItem = STATE.cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        STATE.cart.push({ name, price, category, quantity: 1, id: Date.now() });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    showNotification(`${name} додано!`, 'success');
}

// 5. ОНОВЛЕНА ФУНКЦІЯ ІНІЦІАЛІЗАЦІЇ (Наприкінці файлу)
function init() {

loadUserFromStorage(); // завантажуємо user123 з пам'яті
    
    if (STATE.user) {
        // Повідомляємо серверу, що ми повернулися
        fetch(`http://127.0.0.1:8000/login?name=${encodeURIComponent(STATE.user.username)}`, { method: 'POST' });
    }

    const savedUser = localStorage.getItem('cafeNexusUser');
    if (savedUser) {
        STATE.user = JSON.parse(savedUser);
    }
    
    // Оновлюємо кнопки ПЕРЕД завантаженням інших систем
    updateUI();

  

    initCart();
    initChat();
    initPayment();
    initAuth();
    initNFTGallery();
    initAvatarCustomizer();
    initSecurityFeatures();
    initBonusesAndQuests();
    initMapAndContact();
    initMenuFilter();
    initNavigation();
    initAnimations();
    initScrollEffects();
}


function updateAvatar(option, value) {
    userAvatar[option] = value;
    renderAvatar();
    syncAvatarWithServer(); // Надсилаємо зміни на бекенд
}

function initAvatarsSection() {
    renderAvatar();
    
    // Обробка кнопок вибору (тип тіла, голови)
    document.querySelectorAll('.avatar-type').forEach(btn => {
        btn.addEventListener('click', function() {
            const option = this.dataset.option;
            const value = this.dataset.value;
            
            document.querySelectorAll(`.avatar-type[data-option="${option}"]`).forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            updateAvatar(option, value);
            animateButton(this);
        });
    });

    // Обробка кольорів
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            const type = this.dataset.type;
            const color = this.dataset.color;
            
            document.querySelectorAll(`.color-option[data-type="${type}"]`).forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            
            updateAvatar(type === 'skin' ? 'colorSkin' : 'colorClothes', color);
        });
    });
}

// ==================== ВІЗУАЛІЗАЦІЯ АВАТАРА ====================
function renderAvatar() {
    const canvas = document.getElementById('avatarRender');
    if (!canvas) return;
    
    // Твій код рендерингу аватара тут...
    // (Я залишив спрощену схему, щоб не роздувати код, але твоя логіка з SVG/Div працюватиме так само)
    canvas.style.backgroundColor = userAvatar.colorClothes;
    canvas.style.borderColor = userAvatar.colorSkin;
}

// ==================== ДОПОМІЖНІ ФУНКЦІЇ ====================
function openModal(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active'); 
}

function closeModal(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active'); 
}

function showNotification(msg, type) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
    
    container.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function addXp(amount) {
    currentXp += amount;
    const lvlDisplay = document.getElementById('userLevelDisplay');
    if (lvlDisplay) lvlDisplay.textContent = `LVL ${currentLevel}`;
    // Логіка підвищення рівня...
}

function animateButton(btn) {
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => btn.style.transform = '', 100);
}











// Глобальні змінні
let currentUser = null;
let currentLevel = 1;
let currentXp = 0;
let xpToNextLevel = 100;
let cart = [];
let nfts = [];
let userAvatar = {
    head: 'human',
    body: 'human',
    colorSkin: '#F5D0A9',
    colorClothes: '#00FF00',
    equipment: []
};






/* =========================
   Avatar SVG renderer (мульт-реалістичний)
   ========================= */
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function shade(hex, percent){
    // percent: -100..100 (negative = darker, positive = lighter)
    const h = String(hex || '').replace('#','').trim();
    if (h.length !== 6) return hex;
    const r = parseInt(h.slice(0,2), 16);
    const g = parseInt(h.slice(2,4), 16);
    const b = parseInt(h.slice(4,6), 16);
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent) / 100;
    const R = Math.round((t - r) * p + r);
    const G = Math.round((t - g) * p + g);
    const B = Math.round((t - b) * p + b);
    return '#' + [R,G,B].map(v => clamp(v,0,255).toString(16).padStart(2,'0')).join('');
}

function getAvatarSVG(a){
  // type: human | robot | alien | animal
  const type = (a.head || 'human');
  // body: human | athletic | robotic | mythical
  const bodyStyle = (a.body || 'human');

  const skin = a.colorSkin || '#F5D0A9';
  const cloth = a.colorClothes || '#6a11cb';

  const skinLight = shade(skin, 18);
  const skinDark  = shade(skin, -24);

  const clothLight = shade(cloth, 14);
  const clothDark  = shade(cloth, -22);

  // Robot metal tint follows skin picker so color works for all types
  const metalBase = (type === 'robot') ? skin : '#aeb7c7';
  const metalLight = shade(metalBase, 55);
  const metalMid   = shade(metalBase, 10);
  const metalDark  = shade(metalBase, -35);

  // Animal fur follows clothes picker (so 2nd color works for all types)
  const furBase = (type === 'animal') ? (a.colorClothes || '#8b4a22') : '#8b4a22';
  const furLight = shade(furBase, 18);
  const furDark  = shade(furBase, -28);

  const eq = Array.isArray(a.equipment) ? a.equipment : [];
  const hasEq = (item) => eq.some(e => e && e.item === item);

  const uid = 'av' + Math.random().toString(16).slice(2);

  // --- proportions (feel "human", even for robot/alien/animal) ---
  const P = (() => {
    const base = {
      headRx: 56, headRy: 64,
      neckW: 44, neckH: 32,
      shoulderW: 150,
      chestW: 130,
      waistW: 112,
      hipW: 122,
      torsoH: 160,
      armTh: 16,
      forearmTh: 14,
      legTh: 20,
      calfTh: 18,
      limbRound: 18,
      scaleY: 1
    };

    // body styles
    if (bodyStyle === 'athletic'){
      base.shoulderW = 168;
      base.chestW = 150;
      base.waistW = 112;
      base.hipW = 130;
      base.armTh = 18;
      base.legTh = 22;
    } else if (bodyStyle === 'robotic'){
      base.limbRound = 8;
      base.headRx = 54; base.headRy = 58;
      base.armTh = 18; base.forearmTh = 16;
      base.legTh = 22; base.calfTh = 20;
    } else if (bodyStyle === 'mythical'){
      base.headRx = 58; base.headRy = 68;
      base.shoulderW = 156;
      base.hipW = 136;
      base.torsoH = 170;
    }

    // avatar types
    if (type === 'alien'){
      base.headRx += 8; base.headRy += 10;
      base.shoulderW -= 14;
      base.chestW -= 10;
      base.armTh -= 2;
      base.legTh -= 2;
    } else if (type === 'robot'){
      base.limbRound = Math.min(base.limbRound, 10);
      base.neckH = 26;
    } else if (type === 'animal'){
      base.headRx += 2; base.headRy += 2;
      base.shoulderW -= 6;
      base.hipW += 8;
      base.armTh += 4; // paws feel chunkier
      base.forearmTh += 4;
      base.legTh += 4;
      base.calfTh += 4;
    }
    return base;
  })();

  const defs = `
    <defs>
      <filter id="ds_${uid}" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="18" stdDeviation="14" flood-color="rgba(0,0,0,.55)"/>
      </filter>

      <radialGradient id="bg_${uid}" cx="40%" cy="18%" r="90%">
        <stop offset="0" stop-color="rgba(124,92,255,.28)"/>
        <stop offset="0.55" stop-color="rgba(0,212,255,.12)"/>
        <stop offset="1" stop-color="rgba(0,0,0,0)"/>
      </radialGradient>

      <radialGradient id="skin_${uid}" cx="40%" cy="28%" r="78%">
        <stop offset="0" stop-color="${skinLight}"/>
        <stop offset="0.62" stop-color="${skin}"/>
        <stop offset="1" stop-color="${skinDark}"/>
      </radialGradient>

      <linearGradient id="cloth_${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${clothLight}"/>
        <stop offset="1" stop-color="${clothDark}"/>
      </linearGradient>

      <linearGradient id="metal_${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${metalLight}"/>
        <stop offset="0.45" stop-color="${metalMid}"/>
        <stop offset="1" stop-color="${metalDark}"/>
      </linearGradient>

      <radialGradient id="fur_${uid}" cx="35%" cy="25%" r="85%">
        <stop offset="0" stop-color="${furLight}"/>
        <stop offset="0.65" stop-color="${furBase}"/>
        <stop offset="1" stop-color="${furDark}"/>
      </radialGradient>

      <radialGradient id="accent_${uid}" cx="50%" cy="45%" r="72%">
        <stop offset="0" stop-color="${clothLight}" stop-opacity="0.9"/>
        <stop offset="0.55" stop-color="${cloth}" stop-opacity="0.35"/>
        <stop offset="1" stop-color="${cloth}" stop-opacity="0"/>
      </radialGradient>
    </defs>
  `;

  const bg = `
    <rect x="0" y="0" width="320" height="420" fill="url(#bg_${uid})"/>
    <circle cx="92" cy="96" r="64" fill="rgba(255,255,255,.04)"/>
    <circle cx="255" cy="140" r="42" fill="rgba(255,255,255,.03)"/>
    <circle cx="240" cy="330" r="78" fill="rgba(255,255,255,.02)"/>
  `;

  // materials per type
  const matSkin = (type === 'robot') ? `url(#metal_${uid})` : (type === 'animal' ? `url(#fur_${uid})` : `url(#skin_${uid})`);
  const matCloth = (type === 'robot') ? `url(#metal_${uid})` : (type === 'animal' ? `url(#fur_${uid})` : `url(#cloth_${uid})`);
  const strokeSoft = (type === 'robot') ? "rgba(255,255,255,.20)" : "rgba(255,255,255,.14)";

  // anchors
  const headCX = 160, headCY = 122;
  const neckTopY = 178;
  const torsoTopY = 206;
  const hipY = 330;
  const handRY = 298;
  const handLY = 298;

  // helper for rounded rect path
  const rr = (x,y,w,h,r) => {
    const R = Math.max(0, Math.min(r, Math.min(w,h)/2));
    return `M${x+R} ${y}h${w-2*R}a${R} ${R} 0 0 1 ${R} ${R}v${h-2*R}a${R} ${R} 0 0 1 -${R} ${R}h-${w-2*R}a${R} ${R} 0 0 1 -${R} -${R}v-${h-2*R}a${R} ${R} 0 0 1 ${R} -${R}z`;
  };

  // torso silhouette
  const sW = P.shoulderW, cW = P.chestW, wW = P.waistW, hW = P.hipW;
  const torsoH = P.torsoH;

  const torsoPath = (() => {
    // smooth torso path (shoulders -> waist -> hips)
    const sx1 = headCX - sW/2, sx2 = headCX + sW/2;
    const cx1 = headCX - cW/2, cx2 = headCX + cW/2;
    const wx1 = headCX - wW/2, wx2 = headCX + wW/2;
    const hx1 = headCX - hW/2, hx2 = headCX + hW/2;

    const y0 = torsoTopY, y1 = torsoTopY + 44, y2 = torsoTopY + 98, y3 = torsoTopY + torsoH;

    return `
      M ${sx1} ${y0}
      C ${sx1+18} ${y0+10}, ${cx1} ${y1-6}, ${cx1} ${y1}
      C ${cx1-6} ${y1+40}, ${wx1+4} ${y2-18}, ${wx1} ${y2}
      C ${wx1-6} ${y2+52}, ${hx1+6} ${y3-10}, ${hx1} ${y3}
      L ${hx2} ${y3}
      C ${hx2-6} ${y3-10}, ${wx2+6} ${y2+52}, ${wx2} ${y2}
      C ${wx2-4} ${y2-18}, ${cx2+6} ${y1+40}, ${cx2} ${y1}
      C ${cx2} ${y1-6}, ${sx2-18} ${y0+10}, ${sx2} ${y0}
      Z
    `;
  })();

  // limbs
  const armRX = headCX + sW/2 - 12;
  const armLX = headCX - sW/2 + 12;

  const handRX = headCX + sW/2 + 28;
  const handLX = headCX - sW/2 - 28;

  const elbowRY = torsoTopY + 72;
  const elbowLY = torsoTopY + 72;

  const wristRY = torsoTopY + 118;
  const wristLY = torsoTopY + 118;

  const legLX = headCX - hW/4;
  const legRX = headCX + hW/4;
  const kneeY = hipY + 56;
  const ankleY = hipY + 118;

  const limbStroke = (w) => `stroke="${matSkin}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

  const handShape = (x,y,side='r') => {
    const dir = side==='r' ? 1 : -1;
    const palmW = 18, palmH = 16;
    const px = x - (palmW/2), py = y - 8;
    const fingers = [0,1,2,3].map(i=>{
      const fx = x + dir*(8 + i*4);
      const fy1 = y - 6;
      const fy2 = y - 18 - i*1.2;
      return `<path d="M${fx} ${fy1} L${fx} ${fy2}" stroke="rgba(255,255,255,.22)" stroke-width="2" stroke-linecap="round" opacity="${0.9 - i*0.12}"/>`;
    }).join('');
    return `
      <g opacity="0.98">
        <path d="${rr(px, py, palmW, palmH, 7)}" fill="${matSkin}" stroke="${strokeSoft}" stroke-width="1"/>
        ${fingers}
      </g>
    `;
  };

  // face variants
  const face = (() => {
    if (type === 'robot'){
      return `
        <rect x="${headCX-34}" y="${headCY-4}" width="68" height="34" rx="12" fill="rgba(0,0,0,.38)"/>
        <circle cx="${headCX-14}" cy="${headCY+12}" r="6" fill="rgba(0,212,255,.95)"/>
        <circle cx="${headCX+14}" cy="${headCY+12}" r="6" fill="rgba(0,212,255,.95)"/>
        <rect x="${headCX-20}" y="${headCY+38}" width="40" height="8" rx="4" fill="rgba(255,255,255,.20)"/>
      `;
    }
    if (type === 'alien'){
      return `
        <ellipse cx="${headCX-20}" cy="${headCY+10}" rx="18" ry="26" fill="rgba(15,15,20,.90)"/>
        <ellipse cx="${headCX+20}" cy="${headCY+10}" rx="18" ry="26" fill="rgba(15,15,20,.90)"/>
        <circle cx="${headCX-16}" cy="${headCY+2}" r="3" fill="rgba(255,255,255,.70)"/>
        <circle cx="${headCX+24}" cy="${headCY+2}" r="3" fill="rgba(255,255,255,.70)"/>
        <path d="M${headCX-10} ${headCY+54} C ${headCX} ${headCY+62}, ${headCX} ${headCY+62}, ${headCX+10} ${headCY+54}"
          stroke="rgba(0,0,0,.22)" stroke-width="5" stroke-linecap="round" fill="none"/>
      `;
    }
    if (type === 'animal'){
      return `
        <!-- ears -->
        <path d="M${headCX-50} ${headCY-38} C ${headCX-74} ${headCY-80}, ${headCX-36} ${headCY-92}, ${headCX-24} ${headCY-56} Z" fill="${matSkin}" opacity="0.98"/>
        <path d="M${headCX+50} ${headCY-38} C ${headCX+74} ${headCY-80}, ${headCX+36} ${headCY-92}, ${headCX+24} ${headCY-56} Z" fill="${matSkin}" opacity="0.98"/>

        <ellipse cx="${headCX-22}" cy="${headCY+14}" rx="14" ry="14" fill="rgba(15,15,20,.95)"/>
        <ellipse cx="${headCX+22}" cy="${headCY+14}" rx="14" ry="14" fill="rgba(15,15,20,.95)"/>
        <circle cx="${headCX-18}" cy="${headCY+10}" r="3" fill="rgba(255,255,255,.75)"/>
        <circle cx="${headCX+26}" cy="${headCY+10}" r="3" fill="rgba(255,255,255,.75)"/>

        <path d="M${headCX} ${headCY+44} c 10 0 14 8 0 16 c -14 -8 -10 -16 0 -16 z" fill="rgba(10,10,12,.92)"/>
      `;
    }
    // human
    return `
      <ellipse cx="${headCX-22}" cy="${headCY+14}" rx="18" ry="13" fill="rgba(255,255,255,.95)"/>
      <ellipse cx="${headCX+22}" cy="${headCY+14}" rx="18" ry="13" fill="rgba(255,255,255,.95)"/>
      <circle cx="${headCX-18}" cy="${headCY+16}" r="7" fill="#111"/>
      <circle cx="${headCX+18}" cy="${headCY+16}" r="7" fill="#111"/>
      <circle cx="${headCX-16}" cy="${headCY+14}" r="2.5" fill="rgba(255,255,255,.85)"/>
      <circle cx="${headCX+20}" cy="${headCY+14}" r="2.5" fill="rgba(255,255,255,.85)"/>
      <path d="M${headCX} ${headCY+30} c -8 12 -8 22 0 30" stroke="rgba(0,0,0,.22)" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M${headCX-24} ${headCY+70} c 16 12 32 12 48 0" stroke="rgba(120,55,55,.40)" stroke-width="6" stroke-linecap="round" fill="none"/>
    `;
  })();

  const hairOrDetails = (() => {
    if (type !== 'human') return '';
    return `
      <path d="M${headCX-64} ${headCY-24} C ${headCX-52} ${headCY-84}, ${headCX+40} ${headCY-102}, ${headCX+78} ${headCY-34}
               C ${headCX+48} ${headCY-58}, ${headCX+10} ${headCY-56}, ${headCX} ${headCY-34}
               C ${headCX-10} ${headCY-56}, ${headCX-42} ${headCY-56}, ${headCX-64} ${headCY-24} Z"
            fill="rgba(20,20,30,.72)"/>
      <path d="M${headCX-62} ${headCY-20} C ${headCX-52} ${headCY-44}, ${headCX-32} ${headCY-56}, ${headCX-10} ${headCY-60}"
            stroke="rgba(255,255,255,.06)" stroke-width="6" stroke-linecap="round" opacity=".7"/>
    `;
  })();

  const equipmentSVG = (() => {
    let out = '';

    // Wings (behind)
    if (hasEq('wings')){
      out += `
        <g opacity="0.96" filter="url(#ds_${uid})">
          <path d="M${headCX-22} ${torsoTopY+40} C ${headCX-120} ${torsoTopY+20}, ${headCX-120} ${hipY}, ${headCX-26} ${hipY-10}
                   C ${headCX-72} ${hipY-44}, ${headCX-68} ${torsoTopY+84}, ${headCX-22} ${torsoTopY+40} Z"
                fill="rgba(255,255,255,.10)" stroke="rgba(255,255,255,.16)" stroke-width="2"/>
          <path d="M${headCX+22} ${torsoTopY+40} C ${headCX+120} ${torsoTopY+20}, ${headCX+120} ${hipY}, ${headCX+26} ${hipY-10}
                   C ${headCX+72} ${hipY-44}, ${headCX+68} ${torsoTopY+84}, ${headCX+22} ${torsoTopY+40} Z"
                fill="rgba(255,255,255,.10)" stroke="rgba(255,255,255,.16)" stroke-width="2"/>
        </g>
      `;
    }

    // Helmet (on head)
    if (hasEq('helmet')){
      out += `
        <g filter="url(#ds_${uid})">
          <path d="M${headCX-64} ${headCY-40} C ${headCX-48} ${headCY-92}, ${headCX+48} ${headCY-92}, ${headCX+64} ${headCY-40}
                   L ${headCX+54} ${headCY-22} C ${headCX+34} ${headCY-48}, ${headCX-34} ${headCY-48}, ${headCX-54} ${headCY-22} Z"
                fill="rgba(10,10,14,.55)" stroke="rgba(255,255,255,.16)" stroke-width="2"/>
          <rect x="${headCX-40}" y="${headCY-20}" width="80" height="22" rx="11" fill="rgba(0,212,255,.18)"/>
        </g>
      `;
    }

    // Shield (left arm)
    if (hasEq('shield')){
      out += `
        <g filter="url(#ds_${uid})">
          <path d="M${armLX-46} ${wristLY-18} 
                   C ${armLX-72} ${wristLY+10}, ${armLX-62} ${wristLY+72}, ${armLX-22} ${wristLY+92}
                   C ${armLX+18} ${wristLY+72}, ${armLX+28} ${wristLY+10}, ${armLX+2} ${wristLY-18}
                   Z"
                fill="rgba(255,255,255,.10)" stroke="rgba(255,255,255,.18)" stroke-width="2"/>
          <path d="M${armLX-22} ${wristLY-8} L ${armLX-22} ${wristLY+82}" stroke="rgba(0,212,255,.25)" stroke-width="4" stroke-linecap="round"/>
        </g>
      `;
    }

    // Weapon (right hand)
    const weapon = hasEq('sword') ? 'sword' : (hasEq('staff') ? 'staff' : (hasEq('gun') ? 'gun' : null));
    if (weapon){
      if (weapon === 'sword'){
        out += `
          <g filter="url(#ds_${uid})">
            <path d="M${handRX+8} ${handRY-110} L ${handRX+18} ${handRY-12}" stroke="rgba(255,255,255,.82)" stroke-width="6" stroke-linecap="round"/>
            <path d="M${handRX+2} ${handRY-94} L ${handRX+24} ${handRY-84}" stroke="rgba(0,212,255,.35)" stroke-width="6" stroke-linecap="round"/>
            <rect x="${handRX-4}" y="${handRY-10}" width="30" height="10" rx="5" fill="rgba(10,10,14,.55)"/>
            <rect x="${handRX+6}" y="${handRY-18}" width="10" height="24" rx="5" fill="rgba(10,10,14,.70)"/>
          </g>
        `;
      } else if (weapon === 'staff'){
        out += `
          <g filter="url(#ds_${uid})">
            <path d="M${handRX+14} ${handRY-130} L ${handRX+14} ${handRY-8}" stroke="rgba(255,255,255,.50)" stroke-width="8" stroke-linecap="round"/>
            <circle cx="${handRX+14}" cy="${handRY-140}" r="16" fill="rgba(0,212,255,.20)" stroke="rgba(0,212,255,.35)" stroke-width="3"/>
            <circle cx="${handRX+14}" cy="${handRY-140}" r="6" fill="rgba(255,255,255,.65)"/>
          </g>
        `;
      } else if (weapon === 'gun'){
        out += `
          <g filter="url(#ds_${uid})">
            <rect x="${handRX-2}" y="${handRY-52}" width="62" height="22" rx="8" fill="rgba(10,10,14,.55)" stroke="rgba(255,255,255,.18)" stroke-width="2"/>
            <rect x="${handRX+40}" y="${handRY-46}" width="22" height="10" rx="5" fill="rgba(0,212,255,.22)"/>
            <path d="M${handRX+10} ${handRY-30} L ${handRX+18} ${handRY-10}" stroke="rgba(10,10,14,.70)" stroke-width="10" stroke-linecap="round"/>
          </g>
        `;
      }
    }

    return out;
  })();

  const torsoFill = (() => {
    if (type === 'robot') return `url(#metal_${uid})`;
    if (type === 'animal') return `url(#fur_${uid})`;
    return `url(#cloth_${uid})`;
  })();

  const torsoAccent = (type === 'robot')
    ? `<path d="${torsoPath}" fill="url(#accent_${uid})" opacity="0.65"/>`
    : `<path d="${torsoPath}" fill="url(#accent_${uid})" opacity="0.45"/>`;

  const skinLine = (type === 'robot') ? "rgba(0,0,0,.30)" : "rgba(0,0,0,.18)";

  const bodyDetails = (() => {
    if (bodyStyle === 'robotic' || type === 'robot'){
      return `
        <path d="M${headCX-44} ${torsoTopY+46} H ${headCX+44}" stroke="rgba(255,255,255,.18)" stroke-width="3" stroke-linecap="round"/>
        <path d="M${headCX-36} ${torsoTopY+92} H ${headCX+36}" stroke="rgba(0,212,255,.20)" stroke-width="3" stroke-linecap="round"/>
        <circle cx="${headCX}" cy="${torsoTopY+72}" r="10" fill="rgba(0,212,255,.18)" stroke="rgba(255,255,255,.16)" stroke-width="2"/>
      `;
    }
    if (bodyStyle === 'mythical'){
      return `
        <path d="M${headCX-74} ${torsoTopY+20} C ${headCX-102} ${torsoTopY+130}, ${headCX-70} ${hipY+92}, ${headCX} ${hipY+98}
                 C ${headCX+70} ${hipY+92}, ${headCX+102} ${torsoTopY+130}, ${headCX+74} ${torsoTopY+20}"
              fill="rgba(0,0,0,.18)" opacity=".55"/>
        <path d="M${headCX} ${torsoTopY+30} L ${headCX} ${hipY+84}" stroke="rgba(255,255,255,.10)" stroke-width="8" stroke-linecap="round"/>
      `;
    }
    // human / athletic default
    return `
      <path d="M${headCX} ${torsoTopY+18} C ${headCX-10} ${torsoTopY+42}, ${headCX-10} ${torsoTopY+90}, ${headCX} ${torsoTopY+114}
               C ${headCX+10} ${torsoTopY+90}, ${headCX+10} ${torsoTopY+42}, ${headCX} ${torsoTopY+18} Z"
            fill="rgba(255,255,255,.08)" opacity="0.85"/>
    `;
  })();

  // Final SVG
  return `
  <svg viewBox="0 0 320 420" role="img" aria-label="${type} avatar">
    ${defs}
    ${bg}

    <g filter="url(#ds_${uid})">
      <!-- wings behind -->
      ${equipmentSVG}

      <!-- legs -->
      <path d="M${legLX} ${hipY} C ${legLX-10} ${kneeY-16}, ${legLX-6} ${kneeY+10}, ${legLX} ${kneeY}
               C ${legLX+6} ${kneeY+34}, ${legLX+6} ${ankleY-10}, ${legLX} ${ankleY}"
            fill="none" ${limbStroke(P.legTh)}/>
      <path d="M${legRX} ${hipY} C ${legRX+10} ${kneeY-16}, ${legRX+6} ${kneeY+10}, ${legRX} ${kneeY}
               C ${legRX-6} ${kneeY+34}, ${legRX-6} ${ankleY-10}, ${legRX} ${ankleY}"
            fill="none" ${limbStroke(P.legTh)}/>

      <!-- shoes/feet -->
      <path d="M${legLX-18} ${ankleY+16} c 10 -10 38 -10 48 0 c -12 12 -36 14 -48 0 z" fill="${type==='robot'?'rgba(0,0,0,.35)':'rgba(0,0,0,.28)'}"/>
      <path d="M${legRX-30} ${ankleY+16} c 10 -10 38 -10 48 0 c -12 12 -36 14 -48 0 z" fill="${type==='robot'?'rgba(0,0,0,.35)':'rgba(0,0,0,.28)'}"/>

      <!-- torso -->
      <path d="${torsoPath}" fill="${torsoFill}" stroke="${strokeSoft}" stroke-width="1"/>
      ${torsoAccent}
      ${bodyDetails}

      <!-- arms -->
      <path d="M${armLX} ${torsoTopY+20} C ${armLX-26} ${elbowLY-10}, ${armLX-30} ${wristLY+10}, ${handLX} ${handLY}"
            fill="none" ${limbStroke(P.armTh)}/>
      <path d="M${armRX} ${torsoTopY+20} C ${armRX+26} ${elbowRY-10}, ${armRX+30} ${wristRY+10}, ${handRX} ${handRY}"
            fill="none" ${limbStroke(P.armTh)}/>

      ${handShape(handLX, handLY, 'l')}
      ${handShape(handRX, handRY, 'r')}

      <!-- neck -->
      <path d="${rr(headCX-P.neckW/2, neckTopY, P.neckW, P.neckH, Math.max(10, P.limbRound))}" fill="${matSkin}" stroke="${strokeSoft}" stroke-width="1"/>

      <!-- head -->
      <g>
        <ellipse cx="${headCX}" cy="${headCY}" rx="${P.headRx}" ry="${P.headRy}" fill="${matSkin}" stroke="${strokeSoft}" stroke-width="1"/>
        ${hairOrDetails}
        <!-- ears (skip for robot) -->
        ${type==='robot' ? '' : `<ellipse cx="${headCX-(P.headRx+10)}" cy="${headCY+20}" rx="10" ry="16" fill="${matSkin}" opacity=".92"/>
                                <ellipse cx="${headCX+(P.headRx+10)}" cy="${headCY+20}" rx="10" ry="16" fill="${matSkin}" opacity=".92"/>`}
        ${face}
      </g>

      <!-- subtle outline -->
      <path d="${torsoPath}" fill="none" stroke="${skinLine}" stroke-width="2" opacity="0.28"/>
    </g>
  </svg>`;
}

function renderAvatar(){
    const render = document.getElementById('avatarRender');
    if (!render) return;
    render.innerHTML = getAvatarSVG(userAvatar);
}


let isPrivacyEnabled = false;
let blocksCount = 5;

// Початкова ініціалізація



document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.menu-filter-btn');

  // ФІЛЬТР МЕНЮ — ТІЛЬКИ ПОКАЗ / СХОВАННЯ
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.menu-item').forEach(item => {
        item.style.display =
          category === 'all' || item.dataset.category === category
            ? 'flex'
            : 'none';
      });
    });
  });

  // ⚠️ initApp НЕ ПОВИНЕН віша́ти click на .menu-item-order
  // він може ініціалізувати ТІЛЬКИ модалки / UI / секції
  initApp();
});


// ✅ ЄДИНИЙ обробник "Додати в кошик" (ОДИН РАЗ У ФАЙЛІ)




function initApp() {
    console.log('🚀 KIBER-KAFE 3 ініціалізовано! Ласкаво просимо до метавсесвіту!');



    const safe = (name, fn) => {
        try { fn(); }
        catch (e) { console.error(`❌ ${name} помилка:`, e); }
    };

    // Ініціалізація всіх секцій (safe, щоб одна помилка не ламала весь сайт)
    safe('initNavigation', () => initNavigation());
    safe('initHeroSection', () => initHeroSection());
    safe('initVideoSection', () => initVideoSection());
    safe('initConceptSection', () => initConceptSection());
    safe('initMenuSection', () => initMenuSection());
    safe('initNftGallery', () => initNftGallery());
    safe('initAvatarsSection', () => initAvatarsSection());
    safe('initBonusesSection', () => initBonusesSection());
    safe('initSecuritySection', () => initSecuritySection());
    safe('initContactSection', () => initContactSection());
    safe('initModals', () => initModals());
    safe('initNotifications', () => initNotifications());
    safe('startAnimations', () => startAnimations());

    // Завантаження даних
    safe('loadUserData', () => loadUserData());
    safe('loadNfts', () => loadNfts());
    safe('updateCart', () => updateCart());

    // Оновлення статистики
    safe('updateHeroStats', () => updateHeroStats());
    safe('updateOnlineStats', () => updateOnlineStats());

    // Анімації при скролі
    safe('initScrollAnimations', () => initScrollAnimations());
}

// Навігація
function initNavigation() {

     if (window.__NAV_INITED) return;
  window.__NAV_INITED = true;

    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');

    // Якщо на сторінці немає навігації — нічого не робимо
    if (!mobileMenuBtn || !navMenu) return;

    let menuJustOpened = false;

    const setMenuIcon = () => {
        mobileMenuBtn.innerHTML = navMenu.classList.contains('active')
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>';
    };

    const closeMenu = () => {
        navMenu.classList.remove('active');
        setMenuIcon();
    };

    // Не даємо клікам всередині меню закривати його
    navMenu.addEventListener('click', (e) => e.stopPropagation());

    // Мобільне меню (відкриття/закриття)
    mobileMenuBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const willOpen = !navMenu.classList.contains('active');
        navMenu.classList.toggle('active');
        setMenuIcon();

        if (typeof animateButton === 'function') animateButton(this);

        // Захист від миттєвого закриття тим самим кліком (коли інші handler-и слухають document)
        if (willOpen) {
            menuJustOpened = true;
            setTimeout(() => { menuJustOpened = false; }, 0);
        }
    });

    // Закриття меню при кліку поза ним
   

    // Закриття меню при кліку на посилання
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 992) closeMenu();

            // Активний пункт меню
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Плавна прокрутка
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Закрити по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) closeMenu();
    });

    // Sticky navbar
    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }

    // На старті — синхронізуємо іконку
    setMenuIcon();
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Герой секція
function initHeroSection() {
    // Кнопка дізнатися більше
    document.getElementById('discoverBtn').addEventListener('click', function() {
        document.querySelector('#concept').scrollIntoView({ behavior: 'smooth' });
        animateButton(this);
        showNotification('📚 Перехід до концепції метавсесвіту', 'info');
    });
    
    // Кнопка переглянути відео
    document.getElementById('watchVideoBtn').addEventListener('click', function() {
        document.querySelector('#demo').scrollIntoView({ behavior: 'smooth' });
        animateButton(this);
        showNotification('🎬 Перехід до відео демонстрації', 'info');
    });
    
    // Кнопка переглянути меню
    document.getElementById('viewMenuBtn').addEventListener('click', function() {
        document.querySelector('#menu').scrollIntoView({ behavior: 'smooth' });
        animateButton(this);
        showNotification('☕ Перехід до меню кафе', 'info');
    });
    
    // Прокрутка вниз
    document.querySelector('.scroll-down').addEventListener('click', function() {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
        animateButton(this);
    });
}

// Відео секція
function initVideoSection() {
    const video = document.getElementById('mainVideo');
    const playBtn = document.getElementById('videoPlayBtn');
    const muteBtn = document.getElementById('videoMuteBtn');
    const volumeSlider = document.getElementById('videoVolume');
    const fullscreenBtn = document.getElementById('videoFullscreenBtn');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const videoLoading = document.querySelector('.video-loading');
    const videoOverlay = document.querySelector('.video-overlay');
    
    if (!video) return;
    
    // Завантаження відео
    video.addEventListener('loadeddata', function() {
        videoLoading.style.display = 'none';
        videoOverlay.style.display = 'flex';
    });
    
    // Відтворення/пауза
    playBtn.addEventListener('click', function() {
        if (video.paused) {
            video.play();
            this.innerHTML = '<i class="fas fa-pause"></i>';
            videoOverlay.style.display = 'none';
            showNotification('▶️ Відео відтворюється', 'info');
        } else {
            video.pause();
            this.innerHTML = '<i class="fas fa-play"></i>';
            videoOverlay.style.display = 'flex';
        }
        animateButton(this);
    });
    
    // Гучність
    muteBtn.addEventListener('click', function() {
        video.muted = !video.muted;
        this.innerHTML = video.muted ? 
            '<i class="fas fa-volume-mute"></i>' : 
            '<i class="fas fa-volume-up"></i>';
        animateButton(this);
    });
    
    volumeSlider.addEventListener('input', function() {
        video.volume = this.value / 100;
    });
    
    // Повноекранний режим
    fullscreenBtn.addEventListener('click', function() {
        if (!document.fullscreenElement) {
            video.requestFullscreen().catch(err => {
                console.log('Помилка повноекранного режиму:', err);
            });
            showNotification('🖥️ Повноекранний режим', 'info');
        } else {
            document.exitFullscreen();
        }
        animateButton(this);
    });
    
    // Мініатюри відео
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // Видалити активний клас
            thumbnails.forEach(t => t.classList.remove('active'));
            // Додати активний клас
            this.classList.add('active');
            // Оновити відображення
            const videoSrc = this.dataset.video;
            // Тут можна змінити відео, якщо потрібно
            showNotification('🎥 Відео змінено', 'info');
            animateButton(this);
        });
    });
    
    // Події відео
    video.addEventListener('play', function() {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    });
    
    video.addEventListener('pause', function() {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
    
    video.addEventListener('ended', function() {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        videoOverlay.style.display = 'flex';
        showNotification('🎬 Відео завершено', 'info');
    });
}

// Концепція
function initConceptSection() {
    // Кнопки дій на картках
    document.querySelectorAll('.btn-card-action').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            animateButton(this);
            
            switch(action) {
                case 'virtual':
                    showNotification('🚪 Вхід до віртуального світу...', 'info');
                    addXp(10);
                    break;
                case 'nft':
                    showNotification('💎 Перехід до NFT колекції...', 'info');
                    document.querySelector('#gallery').scrollIntoView({ behavior: 'smooth' });
                    break;
                case 'rewards':
                    showNotification('🏆 Перехід до нагород...', 'info');
                    document.querySelector('#bonuses').scrollIntoView({ behavior: 'smooth' });
                    break;
            }
        });
    });
    
    // Лічильники
    initCounters();
}

function initCounters() {
    const counters = document.querySelectorAll('.counter-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.floor(current).toLocaleString();
                setTimeout(updateCounter, 20);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };
        
        // Запуск при появі на екрані
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

// Меню кафе
const filterBtns = document.querySelectorAll('.menu-filter-btn');
const menuItems = document.querySelectorAll('.menu-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;

    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    menuItems.forEach(item => {
      if (category === 'all' || item.dataset.category === category) {
        item.style.display = 'block';
      } else {
       item.style.display = 'flex';

      }
    });
  });
})

// Ініціалізація секції МЕНЮ (кнопки "Замовити" + корзина)



// 1. Виносимо функцію зв'язку окремо (це наш "поштовий голуб")
// 1. Ця функція відправляє дані в Python
// Нова функція для зв'язку з Python


// 1. Додай цю функцію на початок файлу
async function sendToPython(name, price) {
    try {
        await fetch('http://127.0.0.1:8000/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item: name, price: parseInt(price) })
        });
        console.log("✅ Дані відправлено в Python!");
    } catch (e) {
        console.error("❌ Помилка: Сервер не запущений!");
    }
}

// 2. Онови існуючу функцію addToCart
async function sendToPython(name, price) {
    // Перевіряємо, чи є авторизований юзер
    const currentUser = window.STATE && STATE.user ? STATE.user.username : "Гість";
    const userId = window.STATE && STATE.user ? STATE.user.id : 0;

    console.log(`Відправка замовлення від: ${currentUser}`);

    try {
        await fetch('http://127.0.0.1:8000/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                item: name,
                price: parseInt(price),
                user_id: userId // Передаємо ID
            })
        });
    } catch (e) {
        console.error("Помилка зв'язку!");
    }
}

// Твоя основна функція кнопки
function addToCart(name, price, category) {
    // 1. Відправляємо в базу
    sendToPython(name, price);

    // 2. Логіка кошика (твоя стара)
    const existingItem = STATE.cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        STATE.cart.push({ name, price, category, quantity: 1, id: Date.now() });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    showNotification(`${name} додано!`, 'success');
}



function removeFromCart(itemName) {
    cart = cart.filter(item => item.name !== itemName);
    updateCart();
    showNotification(`🗑️ "${itemName}" видалено з кошика`, 'info');
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    // Очистити кошик
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Кошик порожній</div>';
        cartTotal.textContent = '0₴';
        return;
    }
    
    // Додати товари
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-details">
                <span class="cart-item-quantity">${item.quantity} × ${item.price}₴</span>
                <span class="cart-item-price">${item.price * item.quantity}₴</span>
                <button class="cart-item-remove" data-item="${item.name}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    // Оновити загальну суму
    cartTotal.textContent = `${total}₴`;
    
    // Додати обробники видалення
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemName = this.dataset.item;
            removeFromCart(itemName);
            animateButton(this);
        });
    });
}

// NFT Галерея
function initNftGallery() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const nftGrid = document.getElementById('nftGrid');
    const sortSelect = document.getElementById('nftSort');
    const loadMoreBtn = document.getElementById('loadMoreNfts');
    
    // Фільтрація NFT
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Оновити активну кнопку
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            animateButton(this);
            
            // Застосувати фільтр
            filterNfts(filter);
            showNotification(`🎨 Фільтр: ${getFilterName(filter)}`, 'info');
        });
    });
    
    // Сортування
    sortSelect.addEventListener('change', function() {
        sortNfts(this.value);
        showNotification(`🔃 Сортування: ${this.options[this.selectedIndex].text}`, 'info');
    });
    
    // Завантажити більше
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadMoreNfts();
            animateButton(this);
        });
    }
    
    // Детальний перегляд NFT
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-view-nft')) {
            const nftCard = e.target.closest('.nft-item');
            const nftId = nftCard.dataset.id;
            openNftDetail(nftId);
        }
    });
}

function getFilterName(filter) {
    const filters = {
        'all': 'Всі NFT',
        'avatar': 'Аватари',
        'weapon': 'Зброя',
        'artifact': 'Артефакти',
        'land': 'Земля'
    };
    return filters[filter] || 'Всі NFT';
}

function loadNfts() {
  nfts = [
    {
      id: 1,
      name: 'Кібер-дракон',
      description: 'Рідкісний NFT дракона з неоновим блиском',
      price: 1.5,
      rarity: 'legendary',
      category: 'avatar',
      image: "https://i.ibb.co/pBVJ15sC/photo-2026-01-15-19-44-45.jpg",
      stats: {
        strength: 95,
        speed: 80,
        rarity: 99
      }
    },
    {
      id: 2,
      name: 'Меч світла',
      description: 'Епічна зброя з божественною енергією',
      price: 0.8,
      rarity: 'epic',
      category: 'weapon',
      image: 'sword',
          image: "https://i.ibb.co/tpRYtBpW/photo-2026-01-16-01-40-05.jpg",
      stats: {
        damage: 85,
        speed: 75,
        rarity: 85
      }
    },
    {
      id: 3,
      name: 'Кристал сили',
      description: 'Артефакт, що збільшує міць власника',
      price: 0.3,
      rarity: 'rare',
      category: 'artifact',
      image: 'crystal',
         image: "https://i.ibb.co/MyQQLsS2/photo-2026-01-16-01-42-03.jpg",
      stats: {
        power: 70,
        magic: 65,
        rarity: 70
      }
    },
    {
      id: 4,
      name: 'Острів мрій',
      description: 'Віртуальна земля для будівництва',
      price: 2.5,
      rarity: 'legendary',
      category: 'land',
      image: 'island',
         image: "https://i.ibb.co/TB7ghcZ8/photo-2026-01-16-01-42-43.jpg",
      stats: {
        size: 95,
        value: 90,
        rarity: 95
      }
    },
    {
      id: 5,
      name: 'Робот-охоронець',
      description: 'Автоматичний охоронець для вашої території',
      price: 0.5,
      rarity: 'common',
      category: 'avatar',
      image: 'robot',
          image: "https://i.ibb.co/XfCPHYs5/photo-2026-01-16-01-43-28.jpg",
      stats: {
        defense: 60,
        speed: 50,
        rarity: 40
      }
    },
    {
      id: 6,
      name: 'Посох вічності',
      description: 'Магічний посох з древніми рунами',
      price: 1.2,
      rarity: 'epic',
      category: 'weapon',
      image: 'staff',
       image: "https://i.ibb.co/7dV19ngN/photo-2026-01-16-01-45-08.jpg",
      stats: {
        magic: 90,
        wisdom: 85,
        rarity: 80
      }
    }
  ];

  renderNfts();
}


function renderNfts(filter = 'all') {
    const nftGrid = document.getElementById('nftGrid');
    if (!nftGrid) return;
    
    nftGrid.innerHTML = '';
    
    const filteredNfts = filter === 'all' ? nfts : nfts.filter(nft => nft.category === filter);
    
    filteredNfts.forEach(nft => {
        const nftCard = document.createElement('div');
        nftCard.className = 'nft-item';
        nftCard.dataset.id = nft.id;
        
        const rarityClass = nft.rarity;
        const rarityText = getRarityText(nft.rarity);
        
        nftCard.innerHTML = `
  <div class="nft-image">
    <img src="${nft.image}" alt="${nft.name}">
    <div class="nft-rarity ${rarityClass}">${rarityText}</div>
</div>

            <div class="nft-info">
                <h4>${nft.name}</h4>
                <p class="nft-description">${nft.description}</p>
                <div class="nft-stats">
                    <div class="nft-stat">
                        <span class="nft-stat-label">Рідкість</span>
                        <span class="nft-stat-value">${nft.stats.rarity}%</span>
                    </div>
                    <div class="nft-stat">
                        <span class="nft-stat-label">Категорія</span>
                        <span class="nft-stat-value">${getCategoryName(nft.category)}</span>
                    </div>
                </div>
                <div class="nft-price">
                    <span><i class="fab fa-ethereum"></i> ${nft.price} ETH</span>
                    <span>≈ ${Math.round(nft.price * 1800)}₴</span>
                </div>
                <button class="btn-view-nft">
                    <i class="fas fa-eye"></i> Переглянути
                </button>
            </div>
        `;
        
        nftGrid.appendChild(nftCard);
    });
}

function getRarityText(rarity) {
    const rarities = {
        'legendary': 'Легендарний',
        'epic': 'Епічний',
        'rare': 'Рідкісний',
        'common': 'Звичайний'
    };
    return rarities[rarity] || 'Звичайний';
}

function getColorByRarity(rarity) {
    const colors = {
        'legendary': '#FFD700, #FFA500',
        'epic': '#9b59b6, #8e44ad',
        'rare': '#3498db, #2980b9',
        'common': '#95a5a6, #7f8c8d'
    };
    return colors[rarity] || '#95a5a6, #7f8c8d';
}

function getCategoryName(category) {
    const categories = {
        'avatar': 'Аватар',
        'weapon': 'Зброя',
        'artifact': 'Артефакт',
        'land': 'Земля'
    };
    return categories[category] || 'Інше';
}

function filterNfts(filter) {
    renderNfts(filter);
}

function sortNfts(sortBy) {
    switch(sortBy) {
        case 'newest':
            nfts.sort((a, b) => b.id - a.id);
            break;
        case 'expensive':
            nfts.sort((a, b) => b.price - a.price);
            break;
        case 'cheap':
            nfts.sort((a, b) => a.price - b.price);
            break;
        case 'rare':
            nfts.sort((a, b) => b.stats.rarity - a.stats.rarity);
            break;
    }
    
    renderNfts(document.querySelector('.filter-btn.active').dataset.filter);
}

function loadMoreNfts() {
    // Емуляція завантаження додаткових NFT
    const loadingBtn = document.getElementById('loadMoreNfts');
    loadingBtn.disabled = true;
    loadingBtn.innerHTML = '<i class="fas fa-cog fa-spin"></i> Завантаження...';
    
    setTimeout(() => {
        // Додаємо нові NFT
        const newNfts = [
            {
                id: nfts.length + 1,
                name: 'Фенікс возрождения',
                description: 'Міфічний птах з вогняними крилами',
                price: 3.2,
                rarity: 'legendary',
                category: 'avatar',
                image: 'phoenix',
                 image: "https://i.ibb.co/wFVs5T89/unnamed-2.jpg",
                stats: {
                    strength: 98,
                    magic: 95,
                    rarity: 99
                }
            },
            {
                id: nfts.length + 2,
                name: 'Лук місяця',
                description: 'Елегантна зброя з срібним покриттям',
                price: 1.1,
                rarity: 'epic',
                category: 'weapon',
                image: 'bow',
                 image: "https://i.ibb.co/9kmVyLHp/unnamed-1.jpg",
                stats: {
                    damage: 80,
                    accuracy: 95,
                    rarity: 82
                }
            }
        ];
        
        nfts.push(...newNfts);
        renderNfts(document.querySelector('.filter-btn.active').dataset.filter);
        
        loadingBtn.disabled = false;
        loadingBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Завантажити більше NFT';
        showNotification('✨ Завантажено нові NFT!', 'success');
        addXp(15);
    }, 1500);
}

function openNftDetail(nftId) {
    const nft = nfts.find(n => n.id == nftId);
    if (!nft) return;
    
    const modalContainer = document.getElementById('nftDetailContainer');
    if (!modalContainer) return;
    
    modalContainer.innerHTML = `
        <div class="nft-detail-image">
    <img src="${nft.image}" alt="${nft.title}">
    <div class="nft-detail-rarity ${nft.rarity}">
        ${getRarityText(nft.rarity)}
    </div>
</div>

        <div class="nft-detail-info">
            <h4>${nft.name}</h4>
            <p class="nft-detail-description">${nft.description}</p>
            <div class="nft-detail-stats">
                <div class="nft-detail-stat">
                    <span class="nft-detail-stat-label">Ціна</span>
                    <span class="nft-detail-stat-value">${nft.price} ETH</span>
                </div>
                <div class="nft-detail-stat">
                    <span class="nft-detail-stat-label">Рідкість</span>
                    <span class="nft-detail-stat-value">${nft.stats.rarity}%</span>
                </div>
                <div class="nft-detail-stat">
                    <span class="nft-detail-stat-label">Категорія</span>
                    <span class="nft-detail-stat-value">${getCategoryName(nft.category)}</span>
                </div>
                <div class="nft-detail-stat">
                    <span class="nft-detail-stat-label">ID</span>
                    <span class="nft-detail-stat-value">#${nft.id.toString().padStart(4, '0')}</span>
                </div>
            </div>
            <div class="nft-detail-price">
                <i class="fab fa-ethereum"></i> ${nft.price} ETH ≈ ${Math.round(nft.price * 1800)}₴
            </div>
            <div class="nft-detail-actions">
                <button class="btn-buy-nft" data-nft-id="${nft.id}">
                    <i class="fas fa-shopping-cart"></i> Купити зараз
                </button>
                <button class="btn-offer-nft" data-nft-id="${nft.id}">
                    <i class="fas fa-handshake"></i> Зробити пропозицію
                </button>
            </div>
        </div>
    `;
    
    openModal('nftDetailModal');
    
    // Додаємо обробники для кнопок
    document.querySelector('.btn-buy-nft').addEventListener('click', function() {
        const nftId = this.dataset.nftId;
        showNotification(`💎 Покупка NFT #${nftId}... (емуляція)`, 'info');
        closeModal('nftDetailModal');
        addXp(25);
    });
    
    document.querySelector('.btn-offer-nft').addEventListener('click', function() {
        const nftId = this.dataset.nftId;
        showNotification(`🤝 Пропозиція для NFT #${nftId}... (емуляція)`, 'info');
        closeModal('nftDetailModal');
        addXp(10);
    });
}

// Аватари
function initAvatarsSection() {
    const tabs = document.querySelectorAll('.custom-tab');
    const optionItems = document.querySelectorAll('.option-item');
    const equipmentItems = document.querySelectorAll('.equipment-item');
    const colorOptions = document.querySelectorAll('.color-option');
    const randomizeBtn = document.getElementById('randomizeAvatar');
    const saveBtn = document.getElementById('saveAvatar');
    const mintBtn = document.getElementById('mintAvatar');

    // Початковий рендер прев'ю
    renderAvatar();
    
    // Перемикання вкладок
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Оновити активну вкладку
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Показати відповідний контент
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`tab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`).classList.add('active');
            
            animateButton(this);
        });
    });
    
    // Вибір опцій
    optionItems.forEach(item => {
        item.addEventListener('click', function() {
            const option = this.dataset.option;
            const value = this.dataset.value;
            
            // Оновити виділення
            document.querySelectorAll(`[data-option="${option}"]`).forEach(i => {
                i.classList.remove('selected');
            });
            this.classList.add('selected');
            
            // Оновити аватар
            updateAvatar(option, value);
            animateButton(this);
        });
    });
    
    // Обладнання
   // Обладнання (FIX double click)
equipmentItems.forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // анти-дубль кліку
        if (this.dataset.locked === '1') return;
        this.dataset.locked = '1';

        const type = this.dataset.type;
        const itemName = this.dataset.item;

        toggleEquipment(type, itemName);
        animateButton(this);

        requestAnimationFrame(() => {
            this.dataset.locked = '0';
        });
    });
});

    
    // Кольори
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            const color = this.dataset.color;
            const colorType = this.closest('.color-options').previousElementSibling.textContent;
            
            // Оновити виділення
            this.parentElement.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
            
            // Оновити аватар
            if (colorType.includes('шкіри')) {
                updateAvatar('colorSkin', color);
            } else {
                updateAvatar('colorClothes', color);
            }
            animateButton(this);
        });
    });
    
    // Випадковий аватар
    randomizeBtn.addEventListener('click', function() {
        randomizeAvatar();
        animateButton(this);
        showNotification('🎲 Створено випадковий аватар!', 'success');
        addXp(5);
    });
    
    // Зберегти аватар
    saveBtn.addEventListener('click', function() {
        saveAvatar();
        animateButton(this);
        showNotification('💾 Аватар збережено!', 'success');
        addXp(10);
    });
    
    // Створити NFT
    mintBtn.addEventListener('click', function() {
        mintAvatar();
        animateButton(this);
    });
}

function updateAvatar(option, value) {
    switch(option) {
        case 'head':
            userAvatar.head = value;
            break;
        case 'body':
            userAvatar.body = value;
            break;
        case 'colorSkin':
            userAvatar.colorSkin = value;
            break;
        case 'colorClothes':
            userAvatar.colorClothes = value;
            break;
    }

    // Перемалювати SVG прев'ю
    renderAvatar();
}

function toggleEquipment(type, itemName) {
  // 1) Якщо клік по вже вибраному предмету — знімаємо його
  const sameIndex = userAvatar.equipment.findIndex(
    (eq) => eq.type === type && eq.item === itemName
  );

  if (sameIndex > -1) {
    const removed = userAvatar.equipment.splice(sameIndex, 1)[0];
    showNotification(`🗑️ ${getEquipmentName(removed.item)} видалено`, 'info');
    updateEquipmentDisplay();
    return;
  }

  // 2) Ліміт: максимум 2 речі загалом
  // (і по 1 на тип: weapon + accessory)
  const typeIndex = userAvatar.equipment.findIndex((eq) => eq.type === type);

  if (typeIndex > -1) {
    // якщо вже є предмет цього типу — замінюємо його
    const removed = userAvatar.equipment.splice(typeIndex, 1)[0];
    showNotification(
      `🔁 ${getEquipmentName(removed.item)} замінено на ${getEquipmentName(itemName)}`,
      'info'
    );
  } else if (userAvatar.equipment.length >= 2) {
    // якщо вже 2 предмети — прибираємо найстаріший
    const removed = userAvatar.equipment.shift();
    showNotification(`🧹 ${getEquipmentName(removed.item)} прибрано (ліміт 2)`, 'info');
  }

  // 3) Додаємо новий
  userAvatar.equipment.push({ type, item: itemName });
  showNotification(`🎯 ${getEquipmentName(itemName)} додано`, 'success');

  updateEquipmentDisplay();
}


function getEquipmentName(item) {
    const names = {
        'sword': 'Меч',
        'staff': 'Посох',
        'gun': 'Бластер',
        'helmet': 'Шолом',
        'shield': 'Щит',
        'wings': 'Крила'
    };
    return names[item] || item;
}

function getEquipmentFaIcon(item) {
    // Font Awesome v6 FREE-safe icon names (solid)
    const icons = {
        sword: 'sword',
        staff: 'wand-magic-sparkles',
        gun: 'crosshairs',        // 'gun' may be Pro on some builds
        helmet: 'helmet-un',
        shield: 'shield',
        wings: 'feather'
    };
    return icons[item] || 'circle-question';
}


function updateEquipmentDisplay() {
    const equipmentContainer = document.getElementById('avatarEquipment');
    if (!equipmentContainer) return;

    equipmentContainer.innerHTML = '';

    // icons on preview
    userAvatar.equipment.forEach(eq => {
        const icon = document.createElement('div');
        icon.className = 'equipment-icon';
        const fa = getEquipmentFaIcon(eq.item);
        icon.title = getEquipmentName(eq.item);
        icon.innerHTML = `<i class="fa-solid fa-${fa}"></i>`;
        equipmentContainer.appendChild(icon);
    });

    // keep selected state in equipment grid
   document.querySelectorAll('.equipment-item').forEach(itemEl => {
  itemEl.addEventListener('click', (e) => {
    e.stopPropagation(); // 🔥 КРИТИЧНО

    const type = itemEl.dataset.type;
    const item = itemEl.dataset.item;

    const index = userAvatar.equipment.findIndex(e => e.item === item);

    if (index === -1) {
      // ➕ ДОДАТИ
      userAvatar.equipment.push({ type, item });
      showToast(`🗡️ ${item} додано`, 'success');
    } else {
      // ➖ ВИДАЛИТИ
      userAvatar.equipment.splice(index, 1);
      showToast(`🗑️ ${item} видалено`, 'info');
    }

    renderAvatar();
  });
});


    // re-render avatar so equipment/badges stay in sync if you later add overlays
    renderAvatar();
}

function randomizeAvatar() {
    // Випадкові опції для голови
    const heads = ['human', 'robot', 'alien', 'animal'];
    const randomHead = heads[Math.floor(Math.random() * heads.length)];
    
    // Випадкові опції для тіла
    const bodies = ['human', 'athletic', 'robotic', 'mythical'];
    const randomBody = bodies[Math.floor(Math.random() * bodies.length)];
    
    // Випадкові кольори
    const skinColors = ['#F5D0A9', '#D4A574', '#8D5524', '#C0C0C0', '#00CED1'];
    const clothesColors = ['#6a11cb', '#2575fc', '#FF0000', '#00FF00', '#FFFF00'];
    
    const randomSkin = skinColors[Math.floor(Math.random() * skinColors.length)];
    const randomClothes = clothesColors[Math.floor(Math.random() * clothesColors.length)];
    
    // Оновити аватар
    userAvatar = {
        head: randomHead,
        body: randomBody,
        colorSkin: randomSkin,
        colorClothes: randomClothes,
        equipment: []
    };
    
    // Оновити відображення
    updateAvatar('head', randomHead);
    updateAvatar('body', randomBody);
    updateAvatar('colorSkin', randomSkin);
    updateAvatar('colorClothes', randomClothes);
    
    // Оновити вибір в інтерфейсі
    document.querySelectorAll(`[data-option="head"]`).forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.value === randomHead) {
            item.classList.add('selected');
        }
    });
    
    document.querySelectorAll(`[data-option="body"]`).forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.value === randomBody) {
            item.classList.add('selected');
        }
    });
    
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === randomSkin || option.dataset.color === randomClothes) {
            option.classList.add('selected');
        }
    });
    
    // Очистити обладнання
    updateEquipmentDisplay();
}

function saveAvatar() {
    // Зберегти аватар у локальне сховище
    localStorage.setItem('userAvatar', JSON.stringify(userAvatar));
    
    // Оновити відображення профілю
    const profileAvatar = document.querySelector('.profile-avatar');
    if (profileAvatar) {
        profileAvatar.style.background = `linear-gradient(135deg, ${userAvatar.colorSkin}, ${userAvatar.colorClothes})`;
    }
}

function mintAvatar() {
    // Емуляція створення NFT з аватара
    showNotification('⛏️ Створення NFT з вашого аватара...', 'info');
    
    setTimeout(() => {
        // Додати новий NFT до колекції
        const newNft = {
            id: nfts.length + 1,
            name: `Аватар ${userAvatar.head}`,
            description: `Унікальний аватар створений вами. Тип: ${userAvatar.head}, Колір: ${userAvatar.colorClothes}`,
            price: 0.5,
            rarity: 'rare',
            category: 'avatar',
            image: 'avatar',
            stats: {
                uniqueness: 85,
                style: 75,
                rarity: 70
            }
        };
        
        nfts.unshift(newNft);
        renderNfts(document.querySelector('.filter-btn.active').dataset.filter);
        
        showNotification('🎉 NFT успішно створено та додано до вашої колекції!', 'success');
        addXp(30);
    }, 2000);
}

// Бонуси
function initBonusesSection() {
    const claimNftBtn = document.getElementById('claimNftBtn');
    const upgradeVipBtn = document.getElementById('upgradeVipBtn');
    const claimRewardsBtn = document.getElementById('claimRewardsBtn');
    const questCheckboxes = document.querySelectorAll('.quest-checkbox input');
    
    // Отримання NFT
    claimNftBtn.addEventListener('click', function() {
        if (currentXp >= 100) {
            animateButton(this);
            
            // Емуляція отримання NFT
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-cog fa-spin"></i> Отримання...';
            
            setTimeout(() => {
                // Додати новий NFT
                const newNft = {
                    id: nfts.length + 1,
                    name: 'Бонусний NFT',
                    description: 'Особливий NFT отриманий за досягнення',
                    price: 0,
                    rarity: 'rare',
                    category: 'artifact',
                    image: 'bonus',
                    stats: {
                        value: 100,
                        rarity: 75
                    }
                };
                
                nfts.unshift(newNft);
                renderNfts(document.querySelector('.filter-btn.active').dataset.filter);
                
                // Скинути прогрес
                currentXp = 0;
                updateRareNftProgress();
                
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-gift"></i> Отримати NFT';
                
                showNotification('🎁 Бонусний NFT отримано!', 'success');
            }, 1500);
        } else {
            showNotification('📈 Наберіть 100 XP для отримання NFT', 'warning');
        }
    });
    
    // Покращення VIP
    upgradeVipBtn.addEventListener('click', function() {
        const tiers = ['STANDARD', 'GOLD', 'PLATINUM', 'DIAMOND'];
        const currentTierElement = document.getElementById('currentTier');
        const nextTierElement = document.getElementById('nextTier');
        
        const currentTier = currentTierElement.textContent;
        const currentIndex = tiers.indexOf(currentTier);
        
        if (currentIndex < tiers.length - 1) {
            // Перевірка XP для покращення
            if (currentXp >= 50) {
                currentTierElement.textContent = tiers[currentIndex + 1];
                
                if (currentIndex + 2 < tiers.length) {
                    nextTierElement.textContent = tiers[currentIndex + 2];
                } else {
                    nextTierElement.textContent = 'MAX';
                }
                
                // Витратити XP
                currentXp -= 50;
                updateRareNftProgress();
                
                animateButton(this);
                playSoundEffect('upgrade');
                updateVipPerks(currentIndex + 1);
                
                showNotification(`🌟 VIP статус покращено до ${tiers[currentIndex + 1]}!`, 'success');
            } else {
                showNotification('📈 Потрібно 50 XP для покращення VIP статусу', 'warning');
            }
        } else {
            showNotification('🏆 Ви вже маєте максимальний VIP статус!', 'info');
        }
    });
    
    // Отримання нагород за завдання
    claimRewardsBtn.addEventListener('click', function() {
        const checkboxes = document.querySelectorAll('.quest-checkbox input:checked');
        const xpReward = checkboxes.length * 25; // 25 XP за кожне виконане завдання
        
        if (checkboxes.length > 0) {
            addXp(xpReward);
            
            // Скинути чекбокси
            checkboxes.forEach(cb => {
                cb.checked = false;
            });
            
            animateButton(this);
            playSoundEffect('quest');
            
            showNotification(`🎯 Отримано ${xpReward} XP за виконання завдань!`, 'success');
        } else {
            showNotification('📋 Виконайте хоча б одне завдання для отримання нагороди', 'warning');
        }
    });
    
    // Відмітка виконання завдань
    questCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                showNotification('✅ Завдання виконано!', 'success');
            }
        });
    });
    
    // Таймер завдань
    startQuestsTimer();
    
    // Ініціалізація прогресу
    updateRareNftProgress();
    updateVipPerks(0);
}

function updateRareNftProgress() {
    const progress = Math.min(currentXp / 100 * 100, 100);
    const progressBar = document.getElementById('rareNftProgress');
    const progressPercent = document.getElementById('rareNftPercent');
    const progressText = document.getElementById('rareNftText');
    
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;
    
    if (progressText) {
        if (progress >= 100) {
            progressText.textContent = 'Готово до отримання NFT!';
        } else {
            const xpNeeded = 100 - progress;
            progressText.textContent = `Потрібно ще ${xpNeeded}% до рідкісного NFT`;
        }
    }
}

function updateVipPerks(tierIndex) {
    const perks = document.querySelectorAll('.perk');
    const vipChecks = document.querySelectorAll('.vip-check');
    const vipTimes = document.querySelectorAll('.vip-times');
    
    if (perks.length === 0) return;
    
    perks.forEach(perk => {
        perk.style.opacity = '0.5';
    });
    
    vipChecks.forEach((check, index) => {
        if (index <= tierIndex) {
            check.style.display = 'inline-block';
            if (perks[index]) perks[index].style.opacity = '1';
        } else {
            check.style.display = 'none';
        }
    });
    
    vipTimes.forEach((times, index) => {
        if (index <= tierIndex) {
            times.style.display = 'none';
        } else {
            times.style.display = 'inline-block';
        }
    });
}

function startQuestsTimer() {
    const timerElement = document.getElementById('questsTimer');
    if (!timerElement) return;
    
    function updateTimer() {
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const diff = endOfDay - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateTimer();
    setInterval(updateTimer, 1000);
}

// Безпека
function initSecuritySection() {
    const encryptBtn = document.getElementById('encryptBtn');
    const privacyToggle = document.getElementById('privacyToggle');
    const addBlockBtn = document.getElementById('addBlockBtn');
    const validateChainBtn = document.getElementById('validateChainBtn');
    
    // Шифрування
    if (encryptBtn) {
        encryptBtn.addEventListener('click', function() {
            const originalText = 'Hello World!';
            const encryptedTextElement = document.getElementById('encryptedText');
            
            animateButton(this);
            playSoundEffect('encrypt');
            
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-cog fa-spin"></i> Шифрування...';
            
            setTimeout(() => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let encrypted = '';
                
                for (let i = 0; i < 16; i++) {
                    encrypted += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                
                if (encryptedTextElement) {
                    encryptedTextElement.textContent = encrypted;
                    encryptedTextElement.style.animation = 'none';
                    setTimeout(() => {
                        encryptedTextElement.style.animation = 'textGlow 2s infinite alternate';
                    }, 10);
                }
                
                this.disabled = false;
                this.innerHTML = 'Зашифрувати';
                
                showNotification('🔐 Текст зашифровано!', 'success');
                addXp(5);
            }, 1000);
        });
    }
    
    // Приватність
    if (privacyToggle) {
        privacyToggle.addEventListener('click', function() {
            const toggle = this;
            const statusText = document.getElementById('privacyStatusText');
            
            isPrivacyEnabled = !isPrivacyEnabled;
            
            if (isPrivacyEnabled) {
                toggle.classList.add('active');
                if (statusText) statusText.textContent = 'Приватність активовано';
                showNotification('🛡️ Приватність увімкнено - ваші дані захищені', 'success');
            } else {
                toggle.classList.remove('active');
                if (statusText) statusText.textContent = 'Трекінг активовано';
                showNotification('📊 Трекінг увімкнено - збір анонімних даних', 'info');
            }
            
            toggle.style.transform = 'scale(0.95)';
            setTimeout(() => {
                toggle.style.transform = 'scale(1)';
            }, 200);
            
            playSoundEffect('toggle');
        });
    }
    
    // Блокчейн
    if (addBlockBtn) {
        addBlockBtn.addEventListener('click', function() {
            animateButton(this);
            playSoundEffect('block');
            
            const blocksContainer = document.getElementById('blocksContainer');
            const newBlock = document.getElementById('newBlock');
            const blockchainBlocks = document.getElementById('blockchainBlocks');
            const blockchainHash = document.getElementById('blockchainHash');
            
            if (!blocksContainer || !newBlock) return;
            
            const newHash = '#' + Math.random().toString(16).substr(2, 6);
            
            newBlock.style.animation = 'newBlockPulse 2s infinite';
            newBlock.textContent = `#${blocksCount + 1}`;
            
            setTimeout(() => {
                blocksCount++;
                newBlock.classList.remove('new');
                newBlock.classList.add('block');
                newBlock.id = '';
                newBlock.style.animation = '';
                
                const nextNewBlock = document.createElement('div');
                nextNewBlock.id = 'newBlock';
                nextNewBlock.className = 'block new';
                nextNewBlock.textContent = 'Новий';
                nextNewBlock.style.animation = 'newBlockPulse 2s infinite';
                blocksContainer.appendChild(nextNewBlock);
                
                if (blockchainBlocks) blockchainBlocks.textContent = blocksCount;
                if (blockchainHash) blockchainHash.textContent = newHash;
                
                blocksContainer.scrollLeft = blocksContainer.scrollWidth;
                
                showNotification('⛓️ Новий блок додано до блокчейну!', 'success');
                addXp(10);
            }, 1000);
        });
    }
    
    if (validateChainBtn) {
        validateChainBtn.addEventListener('click', function() {
            animateButton(this);
            playSoundEffect('validate');
            
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-cog fa-spin"></i> Перевірка...';
            
            setTimeout(() => {
                const isValid = Math.random() > 0.1;
                
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-check"></i> Перевірити ланцюг';
                
                if (isValid) {
                    showNotification('✅ Ланцюг блоків валідний! Безпека підтверджена.', 'success');
                    
                    const blocks = document.querySelectorAll('.block:not(.new)');
                    blocks.forEach((block, index) => {
                        setTimeout(() => {
                            block.style.background = 'rgba(76, 175, 80, 0.1)';
                            block.style.borderColor = 'var(--success-color)';
                            block.style.boxShadow = '0 0 15px var(--success-color)';
                            
                            setTimeout(() => {
                                block.style.background = '';
                                block.style.borderColor = '';
                                block.style.boxShadow = '';
                            }, 500);
                        }, index * 200);
                    });
                } else {
                    showNotification('⚠️ Виявлено невідповідності в ланцюзі! Потрібна перевірка.', 'warning');
                }
            }, 1500);
        });
    }
    
    updateBlockchainStats();
}

function updateBlockchainStats() {
    setInterval(() => {
        const blockCountElement = document.getElementById('blockCount');
        const txCountElement = document.getElementById('txCount');
        
        if (blockCountElement && txCountElement) {
            let blocks = parseInt(blockCountElement.textContent.replace(',', '')) || 1247;
            let transactions = parseInt(txCountElement.textContent.replace(',', '')) || 12458;
            
            blocks += Math.floor(Math.random() * 3);
            transactions += Math.floor(Math.random() * 50);
            
            blockCountElement.textContent = blocks.toLocaleString();
            txCountElement.textContent = transactions.toLocaleString();
        }
    }, 5000);
}

// Контакти
function initContactSection() {
    const openMapBtn = document.getElementById('openMapBtn');
    const callBtn = document.getElementById('callBtn');
    const subscribeBtn = document.getElementById('subscribeBtn');
    const joinBtn = document.getElementById('joinBtn');
    const virtualTourBtn = document.getElementById('virtualTourBtn');
    const socialIcons = document.querySelectorAll('.social-icon');
    
    // Карта
    if (openMapBtn) {
        openMapBtn.addEventListener('click', function() {
            openModal('mapModal');
            animateButton(this);
            showNotification('🗺️ Відкрито карту локації', 'info');
        });
    }
    
    // Телефон
    if (callBtn) {
        callBtn.addEventListener('click', function() {
            animateButton(this);
            
            if (confirm('📞 Зателефонувати до кафе?\n\n+38 098 765 4321')) {
                showNotification('📱 З\'єднання з кафе... (емуляція)', 'info');
                
                setTimeout(() => {
                    showNotification('✅ Дзвінок прийнято! Очікуйте відповіді оператора.', 'success');
                }, 2000);
            }
        });
    }
    
    // Підписка
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', function() {
            const emailInput = document.getElementById('contactEmail');
            const email = emailInput ? emailInput.value.trim() : '';
            
            if (!validateEmail(email)) {
                showNotification('❌ Будь ласка, введіть коректний email', 'error');
                if (emailInput) {
                    emailInput.style.borderColor = 'var(--danger-color)';
                    emailInput.focus();
                }
                return;
            }
            
            animateButton(this);
            playSoundEffect('subscribe');
            
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-cog fa-spin"></i>';
            
            setTimeout(() => {
                if (emailInput) emailInput.value = '';
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-paper-plane"></i>';
                
                showNotification('📧 Ви успішно підписались на розсилку!', 'success');
                addXp(15);
            }, 1000);
        });
    }
    
    // Приєднатися
    if (joinBtn) {
        joinBtn.addEventListener('click', function() {
            openModal('joinModal');
            animateButton(this);
            showNotification('🚀 Перехід до реєстрації...', 'info');
        });
    }
    
    // Віртуальний тур
    if (virtualTourBtn) {
        virtualTourBtn.addEventListener('click', function() {
            animateButton(this);
            
            if (confirm('👓 Запустити віртуальний тур по метавсесвіту?\n\nПотрібен VR-шолом для повного занурення.')) {
                showNotification('🔄 Завантаження віртуального туру...', 'info');
                
                setTimeout(() => {
                    showNotification('🎮 Віртуальний тур запущено! Насолоджуйтесь зануренням.', 'success');
                    addXp(25);
                    document.querySelector('#demo').scrollIntoView({ behavior: 'smooth' });
                }, 2000);
            }
        });
    }
    
    // Соціальні мережі
    socialIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const platform = this.dataset.tooltip;
            
            animateButton(this);
            playSoundEffect('social');
            
            showNotification(`📱 Перехід до ${platform}... (емуляція)`, 'info');
        });
    });
    
    updateOnlineStats();
}

function updateOnlineStats() {
    setInterval(() => {
        const onlineElements = document.querySelectorAll('#onlineCount, #footerOnline, #heroOnline');
        const joinTodayElement = document.getElementById('joinToday');
        const activeNowElement = document.getElementById('activeNow');
        
        let online = 247;
        let joinToday = 12;
        let activeNow = 84;
        
        if (onlineElements.length > 0) {
            online = parseInt(onlineElements[0].textContent) || 247;
        }
        
        if (joinTodayElement) {
            joinToday = parseInt(joinTodayElement.textContent) || 12;
        }
        
        if (activeNowElement) {
            activeNow = parseInt(activeNowElement.textContent) || 84;
        }
        
        const change = Math.floor(Math.random() * 5) - 2;
        online = Math.max(200, online + change);
        
        if (Math.random() > 0.7) {
            joinToday += 1;
            activeNow += Math.floor(Math.random() * 3);
        }
        
        onlineElements.forEach(el => el.textContent = online);
        if (joinTodayElement) joinTodayElement.textContent = joinToday;
        if (activeNowElement) activeNowElement.textContent = activeNow;
    }, 10000);
}

// Модальні вікна
function initModals() {
    const loginBtn = document.getElementById('loginBtn');
    const joinBtn = document.getElementById('joinBtn');
    const registerLink = document.getElementById('registerLink');
    const loginLink = document.getElementById('loginLink');
    const modalCloses = document.querySelectorAll('.modal-close');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const metamaskLoginBtn = document.getElementById('metamaskLoginBtn');
    const submitLogin = document.getElementById('submitLogin');
    const submitJoin = document.getElementById('submitJoin');
    const getDirectionsBtn = document.getElementById('getDirectionsBtn');
    const closeNftModal = document.getElementById('closeNftModal');
    
    // Відкриття модальних вікон
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            openModal('loginModal');
            animateButton(this);
        });
    }
    
    if (joinBtn) {
        joinBtn.addEventListener('click', function() {
            openModal('joinModal');
        });
    }
    
    // Перемикання між логіном та реєстрацією
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal('loginModal');
            setTimeout(() => {
                openModal('joinModal');
            }, 300);
        });
    }
    
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal('joinModal');
            setTimeout(() => {
                openModal('loginModal');
            }, 300);
        });
    }
    
    // Закриття модальних вікон
    modalCloses.forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.closest('.modal-overlay').id;
            closeModal(modalId);
        });
    });
    
    // Забули пароль
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('📧 Інструкція по відновленню паролю відправлена на email (емуляція)', 'info');
        });
    }
    
    // Авторизація через соціальні мережі
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function() {
            animateButton(this);
            showNotification('🔐 Авторизація через Google... (емуляція)', 'info');
            
            setTimeout(() => {
                simulateLogin();
            }, 1500);
        });
    }
    
    if (metamaskLoginBtn) {
        metamaskLoginBtn.addEventListener('click', function() {
            animateButton(this);
            showNotification('🦊 Підключення MetaMask... (емуляція)', 'info');
            
            setTimeout(() => {
                simulateLogin();
            }, 2000);
        });
    }
    
    // Вхід
   if (submitLogin) {
    submitLogin.addEventListener('click', function() {
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        
        const usernameValue = username ? username.value : '';
        const passwordValue = password ? password.value : '';
        
        if (!usernameValue || !passwordValue) {
            showNotification('❌ Будь ласка, заповніть всі поля', 'error');
            return;
        }
        
        // Візуальний ефект натискання
        if (typeof animateButton === "function") animateButton(this);
        
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-cog fa-spin"></i> Вхід...';
        
        // Імітація затримки сервера
       // Знайди цей блок у script.js
setTimeout(() => {
    STATE.user = { 
        id: 1, 
        username: usernameValue 
    };
    
    localStorage.setItem('cafeNexusUser', JSON.stringify(STATE.user));
    
    updateUI(); // Важливо викликати тут!
    
    elements.loginModal.style.display = 'none';
    this.disabled = false;
    this.innerHTML = '<i class="fas fa-sign-in-alt"></i> УВІЙТИ';
    
    showNotification(`✅ Вітаємо, ${usernameValue}!`, 'success');
}, 300); // Зміни 1500 на 300 для швидкості
    });
}
    
    // Реєстрація
    if (submitJoin) {
        submitJoin.addEventListener('click', function() {
            const joinEmail = document.getElementById('joinEmail');
            const joinUsername = document.getElementById('joinUsername');
            const joinPassword = document.getElementById('joinPassword');
            const termsAgree = document.getElementById('termsAgree');
            
            const email = joinEmail ? joinEmail.value : '';
            const username = joinUsername ? joinUsername.value : '';
            const password = joinPassword ? joinPassword.value : '';
            const terms = termsAgree ? termsAgree.checked : false;
            
            if (!email || !username || !password) {
                showNotification('❌ Будь ласка, заповніть всі поля', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showNotification('❌ Будь ласка, введіть коректний email', 'error');
                return;
            }
            
            if (password.length < 6) {
                showNotification('❌ Пароль повинен містити принаймні 6 символів', 'error');
                return;
            }
            
            if (!terms) {
                showNotification('❌ Будь ласка, прийміть умови використання', 'error');
                return;
            }
            
            animateButton(this);
            
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-cog fa-spin"></i> Реєстрація...';
            
            setTimeout(() => {
                closeModal('joinModal');
                showNotification('🎉 Реєстрація успішна! Ласкаво просимо до метавсесвіту!', 'success');
                addXp(50);
                
                document.getElementById('profileName').textContent = username;
                document.getElementById('userLevelDisplay').textContent = `LVL ${currentLevel}`;
                
                playSoundEffect('register');
                
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-user-plus"></i> СТВОРИТИ АКАУНТ';
            }, 2000);
        });
    }
    
    // Валідація email в реальному часі
    const joinEmail = document.getElementById('joinEmail');
    if (joinEmail) {
        joinEmail.addEventListener('input', function() {
            const email = this.value.trim();
            if (email && !validateEmail(email)) {
                this.style.borderColor = 'var(--danger-color)';
            } else {
                this.style.borderColor = '';
            }
        });
    }
    
    // Перевірка доступності імені користувача
    const joinUsername = document.getElementById('joinUsername');
    if (joinUsername) {
        joinUsername.addEventListener('input', function() {
            const username = this.value.trim();
            const availability = document.getElementById('usernameAvailability');
            
            if (!availability) return;
            
            if (username.length < 3) {
                availability.innerHTML = '<i class="fas fa-info-circle"></i> Мінімум 3 символи';
                availability.style.color = 'var(--warning-color)';
            } else if (username.length > 20) {
                availability.innerHTML = '<i class="fas fa-times-circle"></i> Максимум 20 символів';
                availability.style.color = 'var(--danger-color)';
            } else if (username.toLowerCase() === 'admin' || username.toLowerCase() === 'root') {
                availability.innerHTML = '<i class="fas fa-times-circle"></i> Ім\'я зайняте';
                availability.style.color = 'var(--danger-color)';
            } else {
                setTimeout(() => {
                    const isAvailable = Math.random() > 0.3;
                    
                    if (isAvailable) {
                        availability.innerHTML = '<i class="fas fa-check-circle"></i> Доступне';
                        availability.style.color = 'var(--success-color)';
                    } else {
                        availability.innerHTML = '<i class="fas fa-times-circle"></i> Зайняте';
                        availability.style.color = 'var(--danger-color)';
                    }
                }, 500);
            }
        });
    }
    
    // Перевірка сили пароля
    const joinPassword = document.getElementById('joinPassword');
    if (joinPassword) {
        joinPassword.addEventListener('input', function() {
            const password = this.value;
            const strengthBar = document.querySelector('.strength-bar');
            const strengthValue = document.querySelector('.strength-value');
            
            if (!strengthBar || !strengthValue) return;
            
            let strength = 0;
            let color = 'var(--danger-color)';
            let text = 'Слабкий';
            
            if (password.length >= 6) strength += 25;
            if (password.length >= 8) strength += 25;
            if (/[A-Z]/.test(password)) strength += 25;
            if (/[0-9]/.test(password)) strength += 25;
            
            if (strength >= 75) {
                color = 'var(--success-color)';
                text = 'Сильний';
            } else if (strength >= 50) {
                color = 'var(--warning-color)';
                text = 'Середній';
            } else if (strength >= 25) {
                color = 'var(--danger-color)';
                text = 'Слабкий';
            } else {
                color = 'var(--danger-color)';
                text = 'Дуже слабкий';
            }
            
            strengthBar.style.width = `${strength}%`;
            strengthBar.style.background = color;
            strengthValue.textContent = text;
            strengthValue.style.color = color;
        });
    }
    
    // Закриття модальних вікон при кліку на оверлей
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // Прокласти маршрут
    if (getDirectionsBtn) {
        getDirectionsBtn.addEventListener('click', function() {
            closeModal('mapModal');
            showNotification('🗺️ Маршрут прокладено! Переходьте до Google Maps (емуляція)', 'success');
        });
    }
    
    // Закриття NFT модального
    if (closeNftModal) {
        closeNftModal.addEventListener('click', function() {
            closeModal('nftDetailModal');
        });
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
        
        playSoundEffect('modalOpen');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        playSoundEffect('modalClose');
    }
}

function simulateLogin() {
    closeModal('loginModal');
    showNotification('✅ Успішний вхід! Ласкаво просимо до метавсесвіту!', 'success');
    
    document.getElementById('profileName').textContent = 'Користувач';
    document.getElementById('userLevelDisplay').textContent = `LVL ${currentLevel}`;
    
    addXp(10);
    playSoundEffect('login');
}

// Сповіщення
function initNotifications() {
    const container = document.getElementById('notificationContainer');
    if (!container) {
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const icon = icons[type] || 'fas fa-info-circle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="${icon}"></i>
            </div>
            <div class="notification-text">
                <p>${message}</p>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.appendChild(notification);
    
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            notification.style.opacity = '0';
            
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Анімації при скролі
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });
    
    // Додаємо клас для анімації до всіх карток і секцій
    document.querySelectorAll('.concept-card, .menu-item, .nft-item, .bonus-card, .security-feature, .contact-item').forEach(element => {
        element.classList.add('animate-on-scroll');
    });
}

// Утиліти
function animateButton(button) {
    if (!button) return;
    
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 200);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function addXp(amount) {
    const oldXp = currentXp;
    currentXp += amount;
    
    if (currentXp >= xpToNextLevel) {
        currentLevel++;
        currentXp = currentXp - xpToNextLevel;
        xpToNextLevel = Math.floor(xpToNextLevel * 1.5);
        
        showNotification(`🎉 Новий рівень ${currentLevel}! Продовжуйте в тому ж дусі!`, 'success');
        playSoundEffect('levelUp');
        
        document.querySelectorAll('.profile-level, #userLevelDisplay').forEach(el => {
            el.textContent = `LVL ${currentLevel}`;
        });
    }
    
    updateUserDisplay();
    updateRareNftProgress();
    saveUserData();
    
    const xpDisplay = document.getElementById('xpDisplay');
    if (xpDisplay) {
        xpDisplay.textContent = currentXp;
        xpDisplay.style.animation = 'none';
        setTimeout(() => {
            xpDisplay.style.animation = 'xpGain 0.5s ease';
        }, 10);
    }
}

function updateUserDisplay() {
    const xpDisplay = document.getElementById('xpDisplay');
    const xpProgress = document.querySelector('.xp-progress');
    
    if (xpDisplay) {
        xpDisplay.textContent = currentXp;
    }
    
    if (xpProgress) {
        const progress = (currentXp / xpToNextLevel) * 100;
        xpProgress.style.width = `${progress}%`;
    }
}

function loadUserData() {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
        const data = JSON.parse(savedData);
        currentLevel = data.level || 1;
        currentXp = data.xp || 0;
        xpToNextLevel = data.xpToNextLevel || 100;
        
        document.getElementById('profileName').textContent = data.username || 'Гість';
        document.getElementById('userLevelDisplay').textContent = `LVL ${currentLevel}`;
    }
    
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        userAvatar = JSON.parse(savedAvatar);
        
        // Оновити відображення аватара
        updateAvatar('colorSkin', userAvatar.colorSkin);
        updateAvatar('colorClothes', userAvatar.colorClothes);
        
        const profileAvatar = document.querySelector('.profile-avatar');
        if (profileAvatar) {
            profileAvatar.style.background = `linear-gradient(135deg, ${userAvatar.colorSkin}, ${userAvatar.colorClothes})`;
        }
    }
}

function saveUserData() {
    const userData = {
        level: currentLevel,
        xp: currentXp,
        xpToNextLevel: xpToNextLevel,
        username: document.getElementById('profileName').textContent
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
}

function updateHeroStats() {
    const stats = [
        { id: 'heroUsers', target: 1250 },
        { id: 'heroNfts', target: 5432 },
        { id: 'heroOnline', target: 247 }
    ];
    
    stats.forEach(stat => {
        const element = document.getElementById(stat.id);
        if (element) {
            let current = 0;
            const increment = stat.target / 50;
            
            const timer = setInterval(() => {
                if (current < stat.target) {
                    current += increment;
                    element.textContent = Math.floor(current).toLocaleString();
                } else {
                    element.textContent = stat.target.toLocaleString();
                    clearInterval(timer);
                }
            }, 30);
        }
    });
}

function playSoundEffect(type) {
    const soundEffects = {
        click: () => {
            try {
                const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
                audio.volume = 0.1;
                audio.play().catch(() => {});
            } catch (e) {}
        },
        add: () => {
            document.documentElement.style.setProperty('--primary-color', '#00FF00');
            setTimeout(() => {
                document.documentElement.style.setProperty('--primary-color', '#6a11cb');
            }, 300);
        },
        success: () => {
            const body = document.body;
            body.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
            setTimeout(() => {
                body.style.backgroundColor = '';
            }, 500);
        }
    };
    
    if (soundEffects[type]) {
        soundEffects[type]();
    }
}

function startAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes cartShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        @keyframes xpGain {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    setInterval(() => {
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            if (Math.random() > 0.8) {
                const current = parseInt(stat.textContent.replace(/,/g, '')) || 0;
                const change = Math.floor(Math.random() * 3);
                stat.textContent = (current + change).toLocaleString();
                
                stat.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    stat.style.transform = 'scale(1)';
                }, 300);
            }
        });
    }, 5000);
}

// Експорт глобальних функцій для консолі браузера
window.kiberKafe = {
    addXp,
    showNotification,
    updateUserDisplay,
    saveUserData,
    openModal,
    closeModal
};

// ✅ ДОДАЙ ОЦЕ ДЛЯ НОВИХ КНОПОК .avatar-type (Голова)
const avatarTypes = document.querySelectorAll('.avatar-type');

avatarTypes.forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.preventDefault();

    const option = this.dataset.option; // "head"
    const value = this.dataset.value;   // "human/robot/alien/animal"

    // активний стан тільки в цій групі
    document.querySelectorAll(`.avatar-type[data-option="${option}"]`)
      .forEach(b => b.classList.remove('active'));

    this.classList.add('active');

    // оновити аватар
    updateAvatar(option, value);
    animateButton(this);
  });
});



// === Запуск додатку (страховка, щоб працювало навіть якщо DOMContentLoaded вже пройшов) ===
(function bootKiberKafe(){
    const safeInit = () => {
        try {
            if (typeof initApp === 'function') initApp();
            else console.error('initApp() не знайдено');
        } catch (err) {
            console.error('❌ Помилка ініціалізації:', err);
        }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInit);
    } else {
        safeInit();
    }
})();


/* ================= FIX MENU AUTO ORDER ================= */

// 1. Автоматично додаємо кнопку "Замовити" до кожного menu-item
/* ==================== GLOBAL HARD FIX ==================== */

/* ==================== PAYMENT FIX (FINAL) ==================== */

// 1️⃣ ПЕРЕХІД ДО ОПЛАТИ — БЕЗ ОЧИСТКИ КОШИКА
/* ==================== FINAL PAYMENT UI FIX ==================== */

// 1️⃣ ОНОВЛЕННЯ ТЕКСТУ КНОПКИ "СПЛАТИТИ {СУМА}"

/* ===================== FULL CONSOLIDATED JS ===================== */
const elements = {
  cartItems: document.getElementById('cartItems'),
  emptyCart: document.getElementById('emptyCart'),
  cartTotal: document.getElementById('cartTotal'),
  discountCode: document.getElementById('discountCode'),
  applyDiscountBtn: document.getElementById('applyDiscountBtn'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  payAmount: document.getElementById('payAmount'),
  paymentForm: document.getElementById('paymentForm'),
  paymentSuccess: document.getElementById('paymentSuccess'),
  viewOrderBtn: document.getElementById('viewOrderBtn'),
  chatInput: document.getElementById('chatInput'),
  chatMessages: document.getElementById('chatMessages'),
  sendMessageBtn: document.getElementById('sendMessageBtn'),
  newChatBtn: document.getElementById('newChatBtn'),
  quickResponses: document.querySelectorAll('.quick-response')
};

const STATE = {
  cart: JSON.parse(localStorage.getItem('cart')||'[]'),
  chatHistory: []
};

function saveCartToStorage(){
  localStorage.setItem('cart', JSON.stringify(STATE.cart));
}

function getTotal(){
  return STATE.cart.reduce((s,i)=>s+i.price*i.quantity,0);
}

function updatePayAmount(){
  const total = getTotal();
  if(elements.cartTotal) elements.cartTotal.textContent = total+'₴';
  if(elements.payAmount) elements.payAmount.textContent = total+'₴';
}

function updateCartDisplay(){
  if(!elements.cartItems) return;
  if(STATE.cart.length===0){
    elements.cartItems.innerHTML='';
    elements.emptyCart.style.display='flex';
    updatePayAmount();
    return;
  }
  elements.emptyCart.style.display='none';
  elements.cartItems.innerHTML = STATE.cart.map(i=>`
    <div class="cart-item">
      <div class="cart-item-info">
        <h4>${i.name}</h4>
        <p>${i.price}₴ × ${i.quantity}</p>
      </div>
      <div class="cart-item-actions">
        <span>${i.price*i.quantity}₴</span>
        <button class="btn-remove-item" data-id="${i.id}">✕</button>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.btn-remove-item').forEach(b=>{
    b.onclick=()=>{
      STATE.cart = STATE.cart.filter(i=>i.id!=b.dataset.id);
      saveCartToStorage();
      updateCartDisplay();
    };
  });
  updatePayAmount();
}

function addToCart(name,price){
  const f=STATE.cart.find(i=>i.name===name);
  if(f) f.quantity++;
  else STATE.cart.push({id:Date.now(),name,price,quantity:1});
  saveCartToStorage();
  updateCartDisplay();
}

function applyDiscount(){
  const code = elements.discountCode.value.trim().toUpperCase();
  const discounts={WELCOME10:10,METAVERSE20:20,CYBER50:50};
  if(!discounts[code]) return;
  const total=getTotal()-discounts[code];
  if(elements.cartTotal) elements.cartTotal.textContent=total+'₴';
  if(elements.payAmount) elements.payAmount.textContent=total+'₴';
}

function processPayment(){
  if(getTotal()===0) return;
  elements.paymentForm.style.display='none';
  elements.paymentSuccess.style.display='block';
  STATE.cart.length = 0;
  saveCartToStorage();
  updateCartDisplay();
}

function addMessageToChat(text,sender){
  const div=document.createElement('div');
  div.className='message '+(sender==='user'?'user-message':'barista-message');
  div.innerHTML=`<div class="message-content"><p>${text}</p></div>`;
  elements.chatMessages.appendChild(div);
  elements.chatMessages.scrollTop=elements.chatMessages.scrollHeight;
}

// ПОКРАЩЕНА AI-ЛОГІКА ВІДПОВІДЕЙ
function generateAIResponse(message) {
  const t = message.toLowerCase().trim();

  // ===== РЕКОМЕНДАЦІЇ СЬОГОДНІ =====
  if (
    t.includes('що рекомендуєте') ||
    t.includes('що порадите') ||
    t.includes('поради') ||
    t.includes('рекомендуєш')
  ) {
    return '☕ Сьогодні раджу Галактичний Капучино — мʼякий смак + NFT-бонус. Якщо хочеш міцніше — Кібер-Еспресо.';
  }

  // ===== NFT =====
  if (
    t.includes('nft') ||
    t.includes('які nft') ||
    t.includes('nft можна') ||
    t.includes('nft отримати')
  ) {
    return '🎁 Ти можеш отримати NFT: «Кавовий артефакт», «Еспресо-тотем», «Лате-амулет» або «Капучино-реліквія». Вони дають XP та бонуси.';
  }

  // ===== МЕТАВСЕСВІТ =====
  if (
    t.includes('метавсесвіт') ||
    t.includes('як працює метавсесвіт') ||
    t.includes('як це працює') ||
    t.includes('що таке метавсесвіт')
  ) {
    return '🌐 Метавсесвіт — це система рівнів, XP і NFT. Ти замовляєш каву → отримуєш XP → відкриваєш бонуси та ексклюзивні напої.';
  }

  // ===== ПРИВІТ =====
  if (
    t === 'привіт' ||
    t === 'hi' ||
    t === 'hello' ||
    t.includes('добр')
  ) {
    return 'Привіт! ☕ Я AI-бариста. Можу порадити каву, розповісти про NFT або допомогти з замовленням.';
  }

  // ===== ЦІНИ =====
  if (t.includes('ціна') || t.includes('скільки коштує')) {
    return '☕ Кава від 85₴, десерти від 120₴. Хочеш — підберу щось конкретне.';
  }

  // ===== ОПЛАТА =====
  if (t.includes('оплат') || t.includes('карт')) {
    return '💳 Обери спосіб оплати, заповни дані та натисни «Сплатити». Після цього замовлення підтвердиться.';
  }

  // ===== DEFAULT (НЕ ТУПИЙ) =====
  return '🙂 Добре. Що саме цікавить: рекомендація ☕, NFT 🎁 чи метавсесвіт 🌐?';
}


function sendMessage(){
  const m=elements.chatInput.value.trim();
  if(!m) return;
  addMessageToChat(m,'user');
  elements.chatInput.value='';
  setTimeout(()=>addMessageToChat(generateAIResponse(m),'barista'),600);
}

document.addEventListener('DOMContentLoaded',()=>{
  updateCartDisplay();
  elements.applyDiscountBtn?.addEventListener('click',applyDiscount);
  elements.paymentForm?.addEventListener('submit',e=>{e.preventDefault();processPayment();});
  elements.sendMessageBtn?.addEventListener('click',sendMessage);
  elements.chatInput?.addEventListener('keydown',e=>e.key==='Enter'&&sendMessage());
  elements.quickResponses.forEach(b=>b.onclick=()=>{elements.chatInput.value=b.dataset.question;sendMessage();});
});

// ЖОРСТКА БЛОКІРОВКА ОПЛАТИ БЕЗ ДАНИХ
const _processPayment = processPayment;
processPayment = function () {
  const cardNumber = document.getElementById('cardNumber')?.value.trim();
  const expiry = document.getElementById('cardExpiry')?.value.trim();
  const cvc = document.getElementById('cardCvc')?.value.trim();
  const name = document.getElementById('cardName')?.value.trim();

  if (!cardNumber || !expiry || !cvc || !name) {
    showNotification('❌ Дані картки не заповнені', 'error');
    return;
  }

  _processPayment();
};


// FIX: відкриття методів оплати
document.querySelectorAll('.payment-method').forEach(method => {
  method.addEventListener('click', () => {
    // активна кнопка
    document.querySelectorAll('.payment-method')
      .forEach(m => m.classList.remove('active'));
    method.classList.add('active');

    // показ відповідного блоку
    const type = method.dataset.method;
    document.querySelectorAll('.payment-panel')
      .forEach(p => p.style.display = 'none');

    const panel = document.querySelector(`#payment-${type}`);
    if (panel) panel.style.display = 'block';
  });
});


// === CART DELEGATION (ONE TIME) ===
document.addEventListener('click', e => {
  const addBtn = e.target.closest('.menu-item-order');
  if (addBtn) {
    const item = addBtn.closest('.menu-item');
    addToCart(
      addBtn.dataset.item,
      Number(addBtn.dataset.price),
      item.dataset.category
    );
    return;
  }

  if (e.target.closest('#clearCartBtn')) {
    clearCart();
  }
});


function clearCart() {
    if (!confirm('Очистити кошик?')) return;

    // 1. чистимо STATE (БЕЗ втрати посилання)
    STATE.cart.length = 0;

    // 2. чистимо DOM корзини НАПРЯМУ
    if (elements?.cartItems) {
        elements.cartItems.innerHTML = '';
    }

    // 3. скид total
    if (elements?.cartTotal) {
        elements.cartTotal.textContent = '0';
    }

    // 4. чистимо localStorage (якщо є)
    localStorage.removeItem('cart');

    showNotification('Кошик очищено', 'info');


STATE.total = 0;

if (elements?.payAmount) {
    elements.payAmount.textContent = '0';
}

if (elements?.payBtn) {
    elements.payBtn.textContent = 'Сплатити 0 ₴';
}

}



document.addEventListener('click', e => {
    if (e.target.closest('#clearCartBtn')) {
        e.preventDefault();
        clearCart();
    }
});


// === AUTH UI FIX ===
function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userPanel = document.getElementById('userPanel');
    const userNameDisplay = document.getElementById('userNameDisplay');

    if (STATE.user) {
        // Якщо юзер є: ховаємо "Увійти", показуємо панель з ім'ям і "Вийти"
        if (loginBtn) loginBtn.style.display = 'none';
        if (userPanel) userPanel.style.display = 'flex';
        if (userNameDisplay) userNameDisplay.textContent = STATE.user.username;
    } else {
        // Якщо юзера немає: показуємо "Увійти", ховаємо панель
        if (loginBtn) loginBtn.style.display = 'block';
        if (userPanel) userPanel.style.display = 'none';
    }
}

// 2. Функція виходу
function logout() {
    STATE.user = null; // Очищуємо стан
    localStorage.removeItem('cafeNexusUser'); // Видаляємо з пам'яті
    
    updateUI(); // <--- ЦЕЙ РЯДОК ПРИБЕРЕ КНОПКУ МИТТЄВО
    
    showNotification("Ви вийшли з системи", "info");
    
    // Перезавантаження для повної чистоти
    setTimeout(() => {
        location.reload();
    }, 300);
}
document.addEventListener('DOMContentLoaded', updateAuthUI);

document.addEventListener('click', e => {
  if (e.target.closest('#logoutBtn')) {
    localStorage.removeItem('user');
    updateAuthUI();
  }
});


function updateAuthUI() {
  const loginBtn = document.getElementById('loginBtn');
  const profileName = document.getElementById('profileName');

  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.nickname) {
    profileName.textContent = user.nickname;
    loginBtn.innerHTML = 'ВИЙТИ';
    loginBtn.onclick = () => {
      localStorage.removeItem('user');
      location.reload();
    };
  } else {
    profileName.textContent = 'Гість';
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> УВІЙТИ';
    loginBtn.onclick = () => openModal('loginModal');
  }
}


document.addEventListener('DOMContentLoaded', updateAuthUI);

document.addEventListener('click', e => {
  if (e.target.closest('#logoutBtn')) {
    localStorage.removeItem('isLoggedIn');
    updateAuthUI();
  }
});

updateAuthUI();


document.addEventListener('DOMContentLoaded', () => {
    // Перевіряємо, чи був юзер збережений у LocalStorage
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
        STATE.user = JSON.parse(savedUser);
    }

    updateAuthUI();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

