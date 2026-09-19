(() => {
  'use strict';
  const root = document.getElementById('oracle-app');
  if (!root) return;
  const names = ['Творчество','Исполнение','Начальная трудность','Недознание','Ожидание','Тяжба','Войско','Приближение','Воспитание малым','Наступление','Расцвет','Упадок','Единомышленники','Владение многим','Смирение','Вольность','Последование','Исправление порчи','Посещение','Созерцание','Стиснутые зубы','Убранство','Разрушение','Возврат','Беспорочность','Воспитание великим','Питание','Перегрузка','Бездна','Сияние','Взаимодействие','Постоянство','Бегство','Мощь великого','Восход','Поражение света','Домашние','Разлад','Препятствие','Разрешение','Убыль','Приумножение','Выход','Перечение','Собирание','Подъём','Истощение','Колодец','Смена','Котёл','Молния','Сосредоточенность','Течение','Невеста','Изобилие','Странствие','Проникновение','Радость','Раздробление','Ограничение','Внутренняя правда','Превосходство малого','Уже конец','Ещё не конец'];
  const tri = {'111':'Qian','100':'Zhen','010':'Kan','001':'Gen','000':'Kun','011':'Xun','101':'Li','110':'Dui'};
  const kw = {
    Qian:{Qian:1,Zhen:34,Kan:5,Gen:26,Kun:11,Xun:9,Li:14,Dui:43}, Zhen:{Qian:25,Zhen:51,Kan:3,Gen:27,Kun:24,Xun:42,Li:21,Dui:17},
    Kan:{Qian:6,Zhen:40,Kan:29,Gen:4,Kun:7,Xun:59,Li:64,Dui:47}, Gen:{Qian:33,Zhen:62,Kan:39,Gen:52,Kun:15,Xun:53,Li:56,Dui:31},
    Kun:{Qian:12,Zhen:16,Kan:8,Gen:23,Kun:2,Xun:20,Li:35,Dui:45}, Xun:{Qian:44,Zhen:32,Kan:48,Gen:18,Kun:46,Xun:57,Li:50,Dui:28},
    Li:{Qian:13,Zhen:55,Kan:63,Gen:22,Kun:36,Xun:37,Li:30,Dui:49}, Dui:{Qian:10,Zhen:54,Kan:60,Gen:41,Kun:19,Xun:61,Li:38,Dui:58}
  };
  const find = selector => root.querySelector(selector);
  let lines = [];
  find('#oracle-question').addEventListener('input', event => { find('#oracle-count').textContent = `${event.target.value.length} / 700`; });
  find('.oracle-begin').addEventListener('click', () => {
    const question = find('#oracle-question').value.trim();
    if (question.length < 12) { find('.oracle-error').textContent = 'Опишите вопрос чуть подробнее — хотя бы одним предложением.'; return; }
    find('.oracle-error').textContent = '';
    find('.oracle-question-step').hidden = true;
    find('.oracle-toss-step').hidden = false;
    find('.oracle-toss-step').scrollIntoView({behavior:'smooth', block:'center'});
  });
  find('.oracle-toss').addEventListener('click', () => {
    const button = find('.oracle-toss');
    if (lines.length >= 6 || button.disabled) return;
    button.disabled = true;
    const coinsBox = find('.oracle-coins');
    coinsBox.classList.add('tossing');
    const coins = [0,0,0].map(() => crypto.getRandomValues(new Uint8Array(1))[0] % 2 ? 3 : 2);
    setTimeout(() => {
      coinsBox.classList.remove('tossing');
      [...coinsBox.children].forEach((coin, index) => { coin.textContent = coins[index] === 3 ? 'Ян' : 'Инь'; });
      const sum = coins.reduce((total, value) => total + value, 0);
      lines.push({yang:sum === 7 || sum === 9, changing:sum === 6 || sum === 9});
      draw(find('.oracle-progress'), lines);
      if (lines.length === 6) finish(); else { find('.oracle-step-number').textContent = `Бросок ${lines.length + 1} из 6`; button.disabled = false; }
    }, 900);
  });
  function draw(node, source) { node.innerHTML = source.map(line => `<span class="oracle-line ${line.yang ? 'yang' : 'yin'} ${line.changing ? 'changing' : ''}"></span>`).join(''); }
  function hexNumber(bits) { return kw[tri[bits.slice(0,3).join('')]][tri[bits.slice(3,6).join('')]]; }
  function finish() {
    find('.oracle-toss-step').hidden = true;
    find('.oracle-result-step').hidden = false;
    const bits = lines.map(line => line.yang ? 1 : 0);
    const changed = lines.map(line => line.changing ? (line.yang ? 0 : 1) : (line.yang ? 1 : 0));
    const primary = hexNumber(bits), relating = hexNumber(changed);
    const moving = lines.map((line, index) => line.changing ? index + 1 : null).filter(Boolean);
    find('.oracle-primary-title').textContent = `№${primary} «${names[primary - 1]}»`;
    find('.oracle-relating-title').textContent = `№${relating} «${names[relating - 1]}»`;
    draw(find('.oracle-primary-lines'), lines);
    draw(find('.oracle-relating-lines'), lines.map(line => ({yang:line.changing ? !line.yang : line.yang, changing:false})));
    find('.oracle-changing-note').textContent = moving.length ? `Изменяющиеся линии: ${moving.join(', ')}. Они показывают, где ситуация находится в движении.` : 'Изменяющихся линий нет: основной акцент остаётся на текущем состоянии ситуации.';
    find('.oracle-interpret').dataset.primary = primary;
    find('.oracle-interpret').dataset.relating = relating;
    find('.oracle-result-step').scrollIntoView({behavior:'smooth', block:'start'});
  }
  find('.oracle-interpret').addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    find('.oracle-api-error').textContent = '';
    find('.oracle-loading').hidden = false;
    find('.oracle-answer').hidden = true;
    const primary = Number(button.dataset.primary), relating = Number(button.dataset.relating);
    const changingLines = lines.map((line,index) => line.changing ? index + 1 : null).filter(Boolean);
    try {
      const response = await fetch('/api/public/iching', {method:'POST', credentials:'same-origin', headers:{'Content-Type':'application/json'}, body:JSON.stringify({question:find('#oracle-question').value.trim(), clientName:find('#oracle-name').value.trim(), hexagram1:{num:primary,name:names[primary-1]}, hexagram2:{num:relating,name:names[relating-1]}, changingLines})});
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.answer) throw new Error(data.error || 'Не удалось получить ответ. Попробуйте ещё раз.');
      find('.oracle-answer-text').textContent = data.answer;
      find('.oracle-answer').hidden = false;
      button.hidden = true;
      find('.oracle-answer').scrollIntoView({behavior:'smooth', block:'start'});
    } catch (error) {
      find('.oracle-api-error').textContent = error.message || 'Ошибка соединения. Попробуйте ещё раз.';
      button.disabled = false;
    } finally { find('.oracle-loading').hidden = true; }
  });
  find('.oracle-restart').addEventListener('click', () => {
    lines = [];
    find('.oracle-result-step').hidden = true;
    find('.oracle-question-step').hidden = false;
    find('.oracle-answer').hidden = true;
    find('.oracle-interpret').hidden = false;
    find('.oracle-interpret').disabled = false;
    find('.oracle-api-error').textContent = '';
    find('.oracle-progress').innerHTML = '';
    find('.oracle-step-number').textContent = 'Бросок 1 из 6';
    find('.oracle-toss').disabled = false;
    root.scrollIntoView({behavior:'smooth'});
  });
})();
