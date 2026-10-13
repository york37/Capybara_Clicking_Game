(() => {
  'use strict';
  const colors = ['#91aa77', '#d2a064', '#b296bd', '#7faeb0', '#d18f99'];
  const names = ['Meadow friend', 'Sunshine buddy', 'Lavender dream', 'Pond pal', 'Peach sweetheart'];
  const upgrades = [
    { name: 'Gentle paws', icon: '🐾', bonus: 1, cost: 15 },
    { name: 'Watermelon treat', icon: '🍉', bonus: 2, cost: 40 },
    { name: 'Golden capy', icon: '✨', bonus: 10, cost: 250 },
    { name: 'Cozy hot spring', icon: '♨️', bonus: 25, cost: 750 },
    { name: 'Clover charm', icon: '🍀', bonus: 60, cost: 2000 },
    { name: 'Orange orchard', icon: '🍊', bonus: 150, cost: 6000 },
    { name: 'Capy crown', icon: '👑', bonus: 375, cost: 17500 },
    { name: 'Rainbow picnic', icon: '🌈', bonus: 1000, cost: 50000 },
    { name: 'Moonlight lagoon', icon: '🌙', bonus: 2500, cost: 150000 },
    { name: 'Cosmic capy', icon: '🚀', bonus: 7500, cost: 500000 }
  ];
  let coins = 0, earned = 0, owned = upgrades.map(() => 0), capacity = 100, level = 0;
  let sound = true, audioContext, toastTimer;
  const decorations = [
    { name: 'Little crown', icon: '👑', slot: 'head', x: 675, y: 175, size: 240 },
    { name: 'Party hat', icon: '🥳', slot: 'head', art: '<path d="M550 170 655 -5 760 170Z" fill="#e9a0be" stroke="#694877" stroke-width="10"/><path d="m590 115 115 0m-85-48 52 0" stroke="#ffe49b" stroke-width="18"/><circle cx="655" cy="0" r="25" fill="#ffe49b"/>', },
    { name: 'Sun hat', icon: '👒', slot: 'head', x: 675, y: 185, size: 270 },
    { name: 'Flower clip', icon: '🌸', slot: 'head', x: 850, y: 245, size: 155 },
    { name: 'Cool shades', icon: '🕶️', slot: 'face', x: 565, y: 450, size: 290 },
    { name: 'Rosy bow', icon: '🎀', slot: 'neck', x: 660, y: 650, size: 180 },
    { name: 'Cozy scarf', icon: '🧣', slot: 'neck', art: '<path d="M395 575Q635 705 865 580L880 650Q660 780 390 645Z" fill="#8eafc5" stroke="#4c677a" stroke-width="9"/><path d="m735 660 105-15 5 205-105 0Z" fill="#8eafc5" stroke="#4c677a" stroke-width="9"/><path d="M755 820v40m28-40v40m28-40v40" stroke="#4c677a" stroke-width="10"/>', },
    { name: 'Lucky clover', icon: '🍀', slot: 'hand', x: 620, y: 810, size: 160 },
    { name: 'Tiny balloon', icon: '🎈', slot: 'hand', art: '<path d="M1030 370Q1100 630 750 790" fill="none" stroke="#987f71" stroke-width="8"/><ellipse cx="1030" cy="245" rx="85" ry="115" fill="#e8a1ac" stroke="#895267" stroke-width="8"/><path d="m1030 352-18 28h36Z" fill="#895267"/><path d="M999 176q-25 25-22 52" fill="none" stroke="#ffe1e6" stroke-width="12" stroke-linecap="round"/>', },
    { name: 'Starry sparkles', icon: '✨', slot: 'aura', art: '<g fill="#e4b85d" stroke="#b88732" stroke-width="3"><path d="m210 410 15 42 42 15-42 15-15 42-15-42-42-15 42-15Z"/><path d="m1080 790 15 42 42 15-42 15-15 42-15-42-42-15 42-15Z"/><path d="m920 70 10 28 28 10-28 10-10 28-10-28-28-10 28-10Z"/></g>', }
  ];
  let unlocked = [], equipped = {};
  const el = id => document.getElementById(id);
  const number = new Intl.NumberFormat();
  const button = el('capy');
  const meter = document.querySelector('.meter');
  const valid = value => Number.isSafeInteger(value) && value >= 0;
  try {
    const saved = JSON.parse(localStorage.getItem('capy-club-save'));
    if (saved && valid(saved.coins) && valid(saved.earned) && saved.earned >= saved.coins && Array.isArray(saved.owned) && [3, upgrades.length].includes(saved.owned.length) && saved.owned.every(n => valid(n) && n <= 100)) {
      coins = saved.coins; earned = saved.earned;
      owned = upgrades.map((_, i) => saved.owned[i] ?? 0);
    } else if (saved && valid(saved.points)) {
      coins = earned = saved.points;
    }
    if (saved && Array.isArray(saved.unlocked)) {
      unlocked = [...new Set(saved.unlocked.filter(i => valid(i) && i < decorations.length))];
      if (saved.equipped && typeof saved.equipped === 'object') {
        decorations.forEach((item, i) => {
          if (unlocked.includes(i) && saved.equipped[item.slot] === i) equipped = { [item.slot]: i };
        });
      }
    }
  } catch (_) {}
  const power = () => 1 + upgrades.reduce((sum, upgrade, i) => sum + upgrade.bonus * owned[i], 0);
  const price = i => Math.ceil(upgrades[i].cost * 1.6 ** owned[i]);
  function save() {
    try { localStorage.setItem('capy-club-save', JSON.stringify({ coins, earned, owned, unlocked, equipped })); } catch (_) {}
  }
  function showToast(message) {
    clearTimeout(toastTimer);
    el('toast').textContent = message;
    el('toast').classList.add('visible');
    toastTimer = setTimeout(() => el('toast').classList.remove('visible'), 3500);
  }
  function render() {
    capacity = 100; level = 0;
    while (earned >= capacity && capacity <= Number.MAX_SAFE_INTEGER / 2) { capacity *= 2; level++; }
    el('total-coins').textContent = number.format(coins);
    el('earned-coins').innerHTML = number.format(earned) + '<span>lifetime coins</span>';
    el('target').textContent = number.format(capacity);
    el('target-label').textContent = number.format(capacity) + ' coins';
    el('fill').style.height = Math.min(100, earned / capacity * 100) + '%';
    el('level').textContent = String(level + 1).padStart(2, '0');
    el('level-name').textContent = names[level % names.length];
    document.documentElement.style.setProperty('--accent', colors[level % colors.length]);
    meter.setAttribute('aria-valuemax', String(capacity));
    meter.setAttribute('aria-valuenow', String(earned));
    meter.setAttribute('aria-valuetext', `${earned} of ${capacity} lifetime coins, level ${level + 1}`);
    el('click-power').textContent = number.format(power());
    el('click-reward').textContent = `+${number.format(power())} ${power() === 1 ? 'coin' : 'coins'}`;
    button.setAttribute('aria-label', `Click the capybara to earn ${power()} coins`);
    upgrades.forEach((upgrade, i) => {
      const buy = el(`buy-${i}`);
      const maxed = owned[i] >= 100 || !Number.isSafeInteger(price(i));
      buy.disabled = maxed || coins < price(i);
      buy.textContent = maxed ? 'Maxed out' : `Buy · ${number.format(price(i))} coins`;
      el(`owned-${i}`).textContent = `Owned: ${owned[i]}`;
    });
    renderWardrobe();
  }
  function renderWardrobe() {
    el('wardrobe-count').textContent = `${unlocked.length} / ${decorations.length} unlocked`;
    el('wardrobe-empty').hidden = unlocked.length > 0;
    decorations.forEach((item, i) => {
      const control = el(`decoration-${i}`);
      const available = unlocked.includes(i);
      const wearing = equipped[item.slot] === i;
      control.disabled = !available;
      control.hidden = !available;
      control.style.order = String(unlocked.indexOf(i));
      control.setAttribute('aria-pressed', String(wearing));
      control.setAttribute('aria-label', `${item.name}: ${!available ? 'locked, level up to unlock' : wearing ? 'wearing, click to remove' : 'click to wear'}`);
      control.querySelector('small').textContent = !available ? '🔒 Locked' : wearing ? '✓ Wearing' : 'Wear me';
    });
    el('outfit').innerHTML = Object.values(equipped).map(i => {
      const item = decorations[i];
      return item.art || `<text x="${item.x}" y="${item.y}" font-size="${item.size}" text-anchor="middle" font-family="Segoe UI Emoji, Apple Color Emoji, sans-serif">${item.icon}</text>`;
    }).join('');
  }
  decorations.forEach((item, i) => {
    const control = document.createElement('button');
    control.id = `decoration-${i}`;
    control.type = 'button';
    control.className = 'wardrobe-item';
    control.innerHTML = `<span aria-hidden="true">${item.icon}</span><strong>${item.name}</strong><small>🔒 Locked</small>`;
    control.addEventListener('click', () => {
      if (!unlocked.includes(i)) return;
      if (equipped[item.slot] === i) equipped = {};
      else equipped = { [item.slot]: i };
      renderWardrobe(); save();
    });
    el('wardrobe-items').appendChild(control);
  });
  function coinSound() {
    if (!sound) return;
    try {
      audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      const now = audioContext.currentTime;
      [1318.51, 1760].forEach((frequency, i) => {
        const start = now + i * .055;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(.055, start + .005);
        gain.gain.exponentialRampToValueAtTime(.001, start + .16);
        oscillator.connect(gain); gain.connect(audioContext.destination);
        oscillator.start(start); oscillator.stop(start + .17);
      });
    } catch (_) {}
  }
  upgrades.forEach((upgrade, i) => {
    const card = document.createElement('div');
    card.className = 'upgrade';
    card.innerHTML = `<div class="upgrade-heading"><span aria-hidden="true">${upgrade.icon}</span><div><strong>${upgrade.name}</strong><small>+${upgrade.bonus} coins per click</small></div></div><div class="upgrade-bottom"><span id="owned-${i}">Owned: 0</span><button id="buy-${i}" type="button"></button></div>`;
    el('upgrades').appendChild(card);
    el(`buy-${i}`).addEventListener('click', () => {
      const cost = price(i);
      if (owned[i] >= 100 || !Number.isSafeInteger(cost) || coins < cost) return;
      coins -= cost; owned[i]++;
      coinSound(); render(); save();
      showToast(`${upgrade.icon} ${upgrade.name} purchased! ${power()} coins per click.`);
    });
  });
  button.addEventListener('click', event => {
    const reward = power();
    if (earned > Number.MAX_SAFE_INTEGER - reward || coins > Number.MAX_SAFE_INTEGER - reward) return;
    const previousLevel = level;
    coins += reward; earned += reward;
    render(); coinSound();
    if (level > previousLevel) {
      const surprises = [];
      for (let step = previousLevel; step < level; step++) {
        const locked = decorations.map((_, i) => i).filter(i => !unlocked.includes(i));
        if (!locked.length) break;
        const chosen = locked[Math.floor(Math.random() * locked.length)];
        unlocked.push(chosen); surprises.push(decorations[chosen].name);
      }
      renderWardrobe();
      showToast(`✿ Level ${level + 1}! ${surprises.length ? 'Unlocked: ' + surprises.join(', ') + '!' : 'Your capy keeps growing!'}`);
      el('speech').textContent = 'look at us grow! ♡';
    } else {
      el('speech').textContent = 'a little treasure for you! ♡';
    }
    save();
    button.classList.remove('boop');
    void button.offsetWidth;
    button.classList.add('boop');
    const bounds = button.getBoundingClientRect();
    const particle = document.createElement('span');
    particle.className = 'particle';
    particle.textContent = `🪙 +${number.format(reward)}`;
    particle.style.left = (event.detail === 0 ? bounds.width * .6 : event.clientX - bounds.left) + 'px';
    particle.style.top = (event.detail === 0 ? bounds.height * .45 : event.clientY - bounds.top) + 'px';
    el('particles').appendChild(particle);
    setTimeout(() => particle.remove(), 950);
  });
  el('reset').addEventListener('click', () => {
    coins = earned = level = 0; capacity = 100; owned = upgrades.map(() => 0);
    unlocked = []; equipped = {};
    clearTimeout(toastTimer);
    el('toast').classList.remove('visible'); el('toast').textContent = '';
    el('particles').replaceChildren(); button.classList.remove('boop');
    el('speech').innerHTML = 'hi, new friend! <span>♡</span>';
    sound = true;
    el('sound').setAttribute('aria-pressed', 'true');
    el('sound').setAttribute('aria-label', 'Turn sound off');
    el('sound').querySelector('span').textContent = 'Sound on';
    render(); save();
  });
  el('sound').addEventListener('click', () => {
    sound = !sound;
    el('sound').setAttribute('aria-pressed', String(sound));
    el('sound').setAttribute('aria-label', `Turn sound ${sound ? 'off' : 'on'}`);
    el('sound').querySelector('span').textContent = `Sound ${sound ? 'on' : 'off'}`;
    coinSound();
  });
  render();
})();

