(() => {
  'use strict';
  const names = ['Творчество','Исполнение','Начальная трудность','Недознание','Ожидание','Тяжба','Войско','Приближение','Воспитание малым','Наступление','Расцвет','Упадок','Единомышленники','Владение многим','Смирение','Вольность','Последование','Исправление порчи','Посещение','Созерцание','Стиснутые зубы','Убранство','Разрушение','Возврат','Беспорочность','Воспитание великим','Питание','Перегрузка','Бездна','Сияние','Взаимодействие','Постоянство','Бегство','Мощь великого','Восход','Поражение света','Домашние','Разлад','Препятствие','Разрешение','Убыль','Приумножение','Выход','Перечение','Собирание','Подъём','Истощение','Колодец','Смена','Котёл','Молния','Сосредоточенность','Течение','Невеста','Изобилие','Странствие','Проникновение','Радость','Раздробление','Ограничение','Внутренняя правда','Превосходство малого','Уже конец','Ещё не конец'];
  const tri = {'111':'Qian','100':'Zhen','010':'Kan','001':'Gen','000':'Kun','011':'Xun','101':'Li','110':'Dui'};
  const kw = {
    Qian:{Qian:1,Zhen:34,Kan:5,Gen:26,Kun:11,Xun:9,Li:14,Dui:43}, Zhen:{Qian:25,Zhen:51,Kan:3,Gen:27,Kun:24,Xun:42,Li:21,Dui:17},
    Kan:{Qian:6,Zhen:40,Kan:29,Gen:4,Kun:7,Xun:59,Li:64,Dui:47}, Gen:{Qian:33,Zhen:62,Kan:39,Gen:52,Kun:15,Xun:53,Li:56,Dui:31},
    Kun:{Qian:12,Zhen:16,Kan:8,Gen:23,Kun:2,Xun:20,Li:35,Dui:45}, Xun:{Qian:44,Zhen:32,Kan:48,Gen:18,Kun:46,Xun:57,Li:50,Dui:28},
    Li:{Qian:13,Zhen:55,Kan:63,Gen:22,Kun:36,Xun:37,Li:30,Dui:49}, Dui:{Qian:10,Zhen:54,Kan:60,Gen:41,Kun:19,Xun:61,Li:38,Dui:58}
  };
  const $ = id => document.getElementById(id);
  let lines = [];
  $('question').addEventListener('input', e => $('question-count').textContent = `${e.target.value.length} / 700`);
  $('begin').addEventListener('click', () => {
    const question = $('question').value.trim();
    if (question.length < 12) { $('question-error').textContent = 'Опишите вопрос чуть подробнее — хотя бы одним предложением.'; return; }
    $('question-error').textContent = '';
    document.querySelector('.question-step').hidden = true;
    $('toss-step').hidden = false;
    $('toss-step').scrollIntoView({behavior:'smooth', block:'center'});
  });
  $('toss').addEventListener('click', () => {
    if (lines.length >= 6 || $('toss').disabled) return;
    $('toss').disabled = true;
    $('coins').classList.add('tossing');
    const coins = [0,0,0].map(() => crypto.getRandomValues(new Uint8Array(1))[0] % 2 ? 3 : 2);
    setTimeout(() => {
      $('coins').classList.remove('tossing');
      [...$('coins').children].forEach((coin, i) => coin.querySelector('span').textContent = coins[i] === 3 ? 'Ян' : 'Инь');
      const sum = coins.reduce((a,b) => a+b, 0);
      lines.push({yang:sum === 7 || sum === 9, changing:sum === 6 || sum === 9, value:sum});
      renderProgress();
      if (lines.length === 6) finish(); else { $('step-number').textContent = `Бросок ${lines.length + 1} из 6`; $('toss').disabled = false; }
    }, 920);
  });
  function renderProgress(){ $('line-progress').innerHTML = lines.map(line => `<span class="hex-line ${line.yang?'yang':'yin'} ${line.changing?'changing':''}"></span>`).join(''); }
  function hexNumber(bits){ return kw[tri[bits.slice(0,3).join('')]][tri[bits.slice(3,6).join('')]]; }
  function finish(){
    $('toss-step').hidden = true; $('result-step').hidden = false;
    const bits = lines.map(l=>l.yang?1:0), changed = lines.map(l=>l.changing?(l.yang?0:1):(l.yang?1:0));
    const h1 = hexNumber(bits), h2 = hexNumber(changed), moving = lines.map((l,i)=>l.changing?i+1:null).filter(Boolean);
    $('primary-title').textContent = `№${h1} «${names[h1-1]}»`;
    $('relating-title').textContent = `№${h2} «${names[h2-1]}»`;
    drawHex($('primary-lines'), lines); drawHex($('relating-lines'), lines.map(l=>({yang:l.changing?!l.yang:l.yang, changing:false})));
    $('changing-note').textContent = moving.length ? `Изменяющиеся линии: ${moving.join(', ')}. Они показывают, где ситуация находится в движении.` : 'Изменяющихся линий нет: основной акцент остаётся на текущем состоянии ситуации.';
    $('interpret').dataset.h1 = h1; $('interpret').dataset.h2 = h2;
    $('result-step').scrollIntoView({behavior:'smooth', block:'start'});
  }
  function drawHex(node, source){ node.innerHTML = source.map(l=>`<span class="hex-line ${l.yang?'yang':'yin'} ${l.changing?'changing':''}"></span>`).join(''); }
  $('interpret').addEventListener('click', async () => {
    const button = $('interpret'); button.disabled = true; $('api-error').textContent=''; $('loading').hidden=false; $('answer').hidden=true;
    const h1=Number(button.dataset.h1), h2=Number(button.dataset.h2);
    const changingLines=lines.map((l,i)=>l.changing?i+1:null).filter(Boolean);
    try {
      const response = await fetch('/api/public/iching', {method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:$('question').value.trim(),clientName:$('client-name').value.trim(),hexagram1:{num:h1,name:names[h1-1]},hexagram2:{num:h2,name:names[h2-1]},changingLines})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok || !data.answer) throw new Error(data.error || 'Не удалось получить ответ. Попробуйте ещё раз.');
      $('answer-text').textContent=data.answer; $('answer').hidden=false; button.hidden=true; $('answer').scrollIntoView({behavior:'smooth',block:'start'});
    } catch(error){ $('api-error').textContent=error.message || 'Ошибка соединения. Попробуйте ещё раз.'; button.disabled=false; }
    finally{$('loading').hidden=true;}
  });
  $('restart').addEventListener('click',()=>{
    lines=[]; $('result-step').hidden=true; document.querySelector('.question-step').hidden=false; $('interpret').hidden=false; $('interpret').disabled=false; $('answer').hidden=true; $('api-error').textContent=''; $('line-progress').innerHTML=''; $('step-number').textContent='Бросок 1 из 6'; $('toss').disabled=false; $('oracle').scrollIntoView({behavior:'smooth'});
  });
})();
