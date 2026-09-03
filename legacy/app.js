const STORAGE_KEY = 'eloquence-training-data';

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      checkins: {},
      notes: {},
      top10: [],
      ratings: {},
      completedDays: [],
      feedback: {}
    };
  } catch {
    return {
      checkins: {},
      notes: {},
      top10: [],
      ratings: {},
      completedDays: [],
      feedback: {}
    };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let appData = loadData();

function renderDayCard(dayNum, isCompleted, isCurrent) {
  const card = document.querySelector(`.day-card[data-day="${dayNum}"]`);
  if (!card) return;
  
  if (isCompleted) {
    card.classList.add('completed');
    card.querySelector('.day-status').textContent = '✓ 已完成';
  } else if (isCurrent) {
    card.classList.add('current');
    card.querySelector('.day-status').textContent = '▶ 当前';
  } else {
    card.querySelector('.day-status').textContent = '';
  }
}

function updateProgress() {
  const completedCount = appData.completedDays.length;
  const percent = Math.round((completedCount / 14) * 100);
  
  document.getElementById('completed-count').textContent = completedCount;
  document.getElementById('overall-progress').style.width = `${percent}%`;
  
  const circle = document.getElementById('progress-circle');
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
  
  document.getElementById('progress-percent').textContent = percent;
  document.getElementById('progress-days').textContent = completedCount;
  
  const phases = [
    { ids: [1, 2, 3], bar: 'phase-1-bar', count: 'phase-1-count', total: 3 },
    { ids: [4, 5, 6, 7], bar: 'phase-2-bar', count: 'phase-2-count', total: 4 },
    { ids: [8, 9, 10, 11], bar: 'phase-3-bar', count: 'phase-3-count', total: 4 },
    { ids: [12, 13, 14], bar: 'phase-4-bar', count: 'phase-4-count', total: 3 }
  ];
  
  phases.forEach((phase, index) => {
    const completed = phase.ids.filter(id => appData.completedDays.includes(id)).length;
    const pct = (completed / phase.total) * 100;
    document.getElementById(phase.bar).style.width = `${pct}%`;
    document.getElementById(phase.count).textContent = `${completed}/${phase.total}`;
  });
  
  for (let i = 1; i <= 14; i++) {
    const isCompleted = appData.completedDays.includes(i);
    const isCurrent = !isCompleted && (i === 1 || appData.completedDays.includes(i - 1));
    renderDayCard(i, isCompleted, isCurrent);
  }
}

function renderTop10() {
  const container = document.getElementById('top10-list');
  if (appData.top10.length === 0) {
    container.innerHTML = `
      <div class="top10-empty">
        <p>完成 Day 12 训练后，在这里记录你最喜欢的 10 句话术</p>
        <button class="add-top10-btn" onclick="showTop10Modal()">添加金句</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = appData.top10.map((item, index) => `
    <div class="top10-item">
      <button class="delete-btn" onclick="deleteTop10(${index})">删除</button>
      <div class="phrase"><strong>${index + 1}. </strong>${item.phrase}</div>
      <div class="meta">
        <span>来自 Day ${item.day}</span>
        <span>${item.scene}</span>
      </div>
      ${item.version ? `<div class="version">我的版本：${item.version}</div>` : ''}
    </div>
  `).join('');
}

function renderCheckins() {
  for (let day = 1; day <= 14; day++) {
    const dayCheckins = appData.checkins[day] || {};
    const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-day="${day}"]`);
    checkboxes.forEach(cb => {
      const item = cb.getAttribute('data-item');
      cb.checked = dayCheckins[item] || false;
    });
    
    const textarea = document.querySelector(`textarea[data-day="${day}"]`);
    if (textarea) {
      textarea.value = appData.notes[day] || '';
    }
  }
}

function renderRatings() {
  const dimensions = ['fluency', 'nervousness', 'reaction', 'satisfaction'];
  dimensions.forEach(dim => {
    const rating = appData.ratings[dim] || 0;
    const stars = document.querySelector(`.star-rating[data-dimension="${dim}"]`);
    if (stars) {
      stars.innerHTML = '';
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.textContent = '★';
        star.className = i <= rating ? 'filled' : '';
        star.onclick = () => setRating(dim, i);
        stars.appendChild(star);
      }
    }
  });
  
  document.getElementById('feedback-gain').value = appData.feedback.gain || '';
  document.getElementById('feedback-next').value = appData.feedback.next || '';
}

function setRating(dimension, value) {
  appData.ratings[dimension] = value;
  saveData(appData);
  renderRatings();
}

function showTop10Modal() {
  document.getElementById('top10-modal').classList.add('active');
}

function closeTop10Modal() {
  document.getElementById('top10-modal').classList.remove('active');
}

function addTop10() {
  const phrase = document.getElementById('top10-phrase').value.trim();
  const day = document.getElementById('top10-day').value;
  const scene = document.getElementById('top10-scene').value.trim();
  const version = document.getElementById('top10-version').value.trim();
  
  if (!phrase) {
    alert('请输入话术内容');
    return;
  }
  
  if (appData.top10.length >= 10) {
    alert('最多只能添加 10 条金句');
    return;
  }
  
  appData.top10.push({ phrase, day, scene, version });
  saveData(appData);
  renderTop10();
  closeTop10Modal();
  
  document.getElementById('top10-phrase').value = '';
  document.getElementById('top10-scene').value = '';
  document.getElementById('top10-version').value = '';
}

function deleteTop10(index) {
  if (confirm('确定要删除这条金句吗？')) {
    appData.top10.splice(index, 1);
    saveData(appData);
    renderTop10();
  }
}

function renderDayModal(dayNum) {
  const data = trainingData[dayNum];
  if (!data) return;
  
  document.getElementById('modal-title').textContent = data.title;
  
  let html = `
    <div style="margin-bottom: 1.5rem;">
      <h3 style="color: #6366f1; margin-bottom: 0.5rem;">🎯 今日目标</h3>
      <p>${data.goal}</p>
    </div>
  `;
  
  if (data.formula) {
    html += `
      <div class="formula-box">
        <h4>📝 话术模板</h4>
        <span class="formula">${data.formula}</span>
      </div>
    `;
  }
  
  if (data.phrases) {
    html += `
      <h4>💬 核心话术</h4>
      <div class="table-box">
        <table>
          <tr><th>话术</th><th>适用场景</th>${data.phrases[0].tip || data.phrases[0].subtext || data.phrases[0].principle ? '<th>要点</th>' : ''}</tr>
          ${data.phrases.map(p => `
            <tr>
              <td>${p.text}</td>
              <td>${p.scenario}</td>
              ${p.tip || p.subtext || p.principle ? `<td>${p.tip || p.subtext || p.principle}</td>` : ''}
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }
  
  if (data.categories) {
    html += `
      <h4>📝 话术模板：三维赞美术</h4>
      <div style="margin-bottom: 1rem;">
        <h5 style="color: #6366f1; margin-top: 0.5rem;">🎨 外貌类</h5>
        <div class="table-box">
          <table>
            <tr><th>话术</th><th>适用场景</th></tr>
            ${data.categories.appearance.map(c => `<tr><td>${c.text}</td><td>${c.scenario}</td></tr>`).join('')}
          </table>
        </div>
      </div>
      <div style="margin-bottom: 1rem;">
        <h5 style="color: #6366f1; margin-top: 0.5rem;">🧠 能力类</h5>
        <div class="table-box">
          <table>
            <tr><th>话术</th><th>适用场景</th></tr>
            ${data.categories.ability.map(c => `<tr><td>${c.text}</td><td>${c.scenario}</td></tr>`).join('')}
          </table>
        </div>
      </div>
      <div style="margin-bottom: 1rem;">
        <h5 style="color: #6366f1; margin-top: 0.5rem;">❤️ 性格类</h5>
        <div class="table-box">
          <table>
            <tr><th>话术</th><th>适用场景</th></tr>
            ${data.categories.personality.map(c => `<tr><td>${c.text}</td><td>${c.scenario}</td></tr>`).join('')}
          </table>
        </div>
      </div>
    `;
  }
  
  if (data.examples) {
    html += `
      <h4>💬 完整话术示例</h4>
      ${data.examples.map(e => `
        <div style="margin-bottom: 1rem; padding-left: 0.5rem; border-left: 3px solid #6366f1;">
          <strong>${e.title}</strong>
          <p style="margin-top: 0.25rem;">${e.content}</p>
        </div>
      `).join('')}
    `;
  }
  
  if (data.variants) {
    html += `
      <h4>💡 进阶变体（白话版，更自然）</h4>
      <div class="compare-box">
        <table>
          <tr><th>正式版</th><th>口语版（跟熟人）</th></tr>
          ${data.variants.map(v => `<tr><td>${v.formal}</td><td>${v.casual}</td></tr>`).join('')}
        </table>
      </div>
    `;
  }
  
  if (data.comparisons) {
    html += `
      <h4>📝 话术模板：5 句合作型表达</h4>
      <div class="compare-box">
        <table>
          <tr><th>❌ 命令式</th><th>✅ 合作型</th><th>效果差异</th></tr>
          ${data.comparisons.map(c => `<tr><td>${c.command}</td><td>${c.cooperative}</td><td>${c.difference}</td></tr>`).join('')}
        </table>
      </div>
    `;
  }
  
  if (data.groups) {
    html += `
      <h4>📝 话术模板：3 组救场话术</h4>
      <div style="margin-bottom: 1rem;">
        <h5 style="color: #6366f1; margin-top: 0.5rem;">组 1：话题拉回（跑偏时）</h5>
        <div class="table-box">
          <table>
            <tr><th>话术</th><th>适用场景</th></tr>
            ${data.groups.pullBack.map(g => `<tr><td>${g.text}</td><td>${g.scenario}</td></tr>`).join('')}
          </table>
        </div>
      </div>
      <div style="margin-bottom: 1rem;">
        <h5 style="color: #6366f1; margin-top: 0.5rem;">组 2：视角切换（卡壳时）</h5>
        <div class="table-box">
          <table>
            <tr><th>话术</th><th>适用场景</th></tr>
            ${data.groups.perspective.map(g => `<tr><td>${g.text}</td><td>${g.scenario}</td></tr>`).join('')}
          </table>
        </div>
      </div>
      <div style="margin-bottom: 1rem;">
        <h5 style="color: #6366f1; margin-top: 0.5rem;">组 3：推进决议（拖太久时）</h5>
        <div class="table-box">
          <table>
            <tr><th>话术</th><th>适用场景</th></tr>
            ${data.groups.resolve.map(g => `<tr><td>${g.text}</td><td>${g.scenario}</td></tr>`).join('')}
          </table>
        </div>
      </div>
    `;
  }
  
  if (data.conversation) {
    html += `
      <h4>💬 场景对话示例</h4>
      <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem;">
        <strong>${data.conversation.scene}</strong>
        ${data.conversation.dialog ? `
          <div style="margin-top: 0.5rem;">
            ${data.conversation.dialog.map(d => `<p><strong>${d.speaker}：</strong>${d.text}</p>`).join('')}
          </div>
        ` : ''}
        ${data.conversation.response ? `<p style="margin-top: 0.5rem;">${data.conversation.response}</p>` : ''}
      </div>
      ${data.conversation.keyPoint ? `<p style="color: #22c55e; font-weight: 500;">💡 ${data.conversation.keyPoint}</p>` : ''}
    `;
  }
  
  if (data.conversations) {
    html += `
      <h4>💬 场景对话示例</h4>
      ${data.conversations.map(c => `
        <div style="margin-bottom: 1rem;">
          <strong>${c.scene}</strong>
          <p style="color: #ef4444; margin-top: 0.25rem;">❌ ${c.wrong}</p>
          <p style="color: #22c55e; margin-top: 0.25rem;">✅ ${c.right}</p>
        </div>
      `).join('')}
    `;
  }
  
  if (data.tips) {
    html += `
      <h4>💡 ${dayNum === 4 ? '汇报的 3 个避坑指南' : dayNum === 9 ? '关键技巧' : '技巧'}</h4>
      <div class="compare-box">
        <table>
          ${dayNum === 4 ? `<tr><th>❌ 不要</th><th>✅ 要</th></tr>` : ''}
          ${data.tips.map((t, i) => {
            if (dayNum === 4) {
              return `<tr><td>${t.bad}</td><td>${t.good}</td></tr>`;
            } else if (dayNum === 9) {
              return `<tr><td colspan="2">${t}</td></tr>`;
            }
            return `<tr><td>${t}</td></tr>`;
          }).join('')}
        </table>
      </div>
    `;
  }
  
  if (data.rules) {
    html += `
      <h4>💡 ${dayNum === 3 ? '赞美术的 3 个黄金法则' : dayNum === 10 ? '敬酒 3 原则' : '规则'}</h4>
      <ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
        ${data.rules.map(r => `<li>${r}</li>`).join('')}
      </ul>
    `;
  }
  
  if (data.positioning) {
    html += `
      <h4>💡 请示的黄金站位</h4>
      <div class="compare-box">
        <table>
          <tr><th>错误站位</th><th>正确站位</th></tr>
          ${data.positioning.map(p => `<tr><td>${p.wrong}</td><td>${p.right}</td></tr>`).join('')}
        </table>
      </div>
    `;
  }
  
  if (data.timing) {
    html += `
      <h4>💡 救场的 3 个时机</h4>
      <div class="table-box">
        <table>
          <tr><th>时机</th><th>动作</th></tr>
          ${data.timing.map(t => `<tr><td>${t.condition}</td><td>${t.action}</td></tr>`).join('')}
        </table>
      </div>
    `;
  }
  
  if (data.pitfalls) {
    html += `
      <h4>💡 拒绝的 3 个天坑</h4>
      <div class="compare-box">
        <table>
          <tr><th>❌ 坑</th><th>✅ 怎么避</th></tr>
          ${data.pitfalls.map(p => `<tr><td>${p.pit}</td><td>${p.avoid}</td></tr>`).join('')}
        </table>
      </div>
    `;
  }
  
  if (data.goldenSeconds) {
    html += `
      <h4>💡 冲突处理的黄金 5 秒</h4>
      <div style="background: #fef3c7; padding: 1rem; border-radius: 8px;">
        <ol style="margin-left: 1.5rem;">
          ${data.goldenSeconds.map((s, i) => `<li>${s}</li>`).join('')}
        </ol>
      </div>
    `;
  }
  
  if (data.materials) {
    html += `
      <h4>🎬 推荐模仿素材</h4>
      <div class="table-box">
        <table>
          <tr><th>类型</th><th>推荐</th><th>为什么适合</th></tr>
          ${data.materials.map(m => `<tr><td>${m.type}</td><td>${m.name}</td><td>${m.reason}</td></tr>`).join('')}
        </table>
      </div>
    `;
  }
  
  if (data.method) {
    html += `
      <h4>📝 模仿三步法</h4>
      <div class="table-box">
        <table>
          <tr><th>步骤</th><th>动作</th><th>要点</th></tr>
          ${data.method.map(m => `<tr><td>${m.step}</td><td>${m.action}</td><td>${m.key}</td></tr>`).join('')}
        </table>
      </div>
    `;
  }
  
  if (data.example) {
    html += `
      <h4>🎯 模仿标注示例</h4>
      <div class="formula-box">
        <p>${data.example.original}</p>
        <p style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem;">${data.example.annotation}</p>
      </div>
    `;
  }
  
  if (data.scenarios) {
    html += `
      <h4>🎭 场景模拟设置</h4>
      <p>选择一个你近期真的会遇到的场景：</p>
      <div class="table-box">
        <table>
          <tr><th>场景</th><th>涉及话术</th></tr>
          ${data.scenarios.map(s => `<tr><td>${s.name}</td><td>${s.days.join(' + ')}</td></tr>`).join('')}
        </table>
      </div>
    `;
  }
  
  if (data.flow) {
    html += `
      <h4>🎬 完整模拟流程</h4>
      ${data.flow.map(f => `
        <div style="margin-bottom: 1rem;">
          <strong>${f.stage}</strong>
          <p>${f.content}</p>
          ${f.prompt ? `<p style="color: #6366f1;">${f.prompt}</p>` : ''}
          ${f.prompts ? f.prompts.map(p => `<p style="color: #6366f1;">${p}</p>`).join('') : ''}
        </div>
      `).join('')}
    `;
  }
  
  if (data.selfAssessment) {
    html += `
      <h4>📊 模拟自评</h4>
      <div class="table-box">
        <table>
          <tr><th>维度</th><th>1-5 分</th><th>为什么</th></tr>
          ${data.selfAssessment.map(s => `<tr><td>${s.dimension}</td><td><input type="number" min="1" max="5" style="width: 50px;" /></td><td><input type="text" placeholder="为什么" style="width: 200px;" /></td></tr>`).join('')}
        </table>
      </div>
    `;
  }
  
  if (data.exercises) {
    html += `
      <div class="exercise-box">
        <h4>🏋️ 今日练习流程</h4>
        <ol>
          ${data.exercises.map(e => `<li><strong>${e.step}. ${e.action}</strong> <span style="color: #64748b;">(${e.duration})</span>${e.note ? ' <span style="color: #94a3b8;">' + e.note + '</span>' : ''}</li>`).join('')}
        </ol>
      </div>
    `;
  }
  
  if (data.checklist) {
    html += `
      <h4>✅ 自检清单</h4>
      <div class="checklist-modal">
        ${data.checklist.map((item, i) => `
          <label>
            <input type="checkbox" data-day="${dayNum}" data-modal-item="${i}" ${(appData.checkins[dayNum] && appData.checkins[dayNum][`modal-${i}`]) ? 'checked' : ''} />
            ${item}
          </label>
        `).join('')}
      </div>
    `;
  }
  
  if (data.notes && data.notes.length > 0) {
    html += `
      <div class="notes-box">
        <h4>📓 我的笔记</h4>
        ${data.notes.map(n => `
          <div style="margin-bottom: 0.5rem;">
            <label>${n.label}</label>
            <textarea placeholder="${n.placeholder || ''}"></textarea>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  html += `<button class="complete-day-btn" onclick="completeDay(${dayNum})">✅ 标记为完成</button>`;
  
  document.getElementById('modal-body').innerHTML = html;
}

function openModal(dayNum) {
  renderDayModal(dayNum);
  document.getElementById('day-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('day-modal').classList.remove('active');
}

function completeDay(dayNum) {
  if (!appData.completedDays.includes(dayNum)) {
    appData.completedDays.push(dayNum);
    appData.completedDays.sort((a, b) => a - b);
  }
  
  const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-day="${dayNum}"]`);
  const dayCheckins = {};
  checkboxes.forEach(cb => {
    const item = cb.getAttribute('data-item') || cb.getAttribute('data-modal-item');
    if (item) {
      dayCheckins[item] = cb.checked;
    }
  });
  appData.checkins[dayNum] = dayCheckins;
  
  saveData(appData);
  updateProgress();
  closeModal();
  
  alert(`🎉 恭喜完成 Day ${dayNum}！继续加油！`);
}

function switchPage(pageId) {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.nav-btn[data-page="${pageId}"]`).classList.add('active');
  
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(`page-${pageId}`).classList.add('active');
  
  if (pageId === 'progress') {
    renderTop10();
  }
}

let recognition = null;
let isRecording = false;
let recordingStartTime = 0;
let recordingTimer = null;
let currentTargetPhrase = '';
let currentDay = null;

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    document.getElementById('recording-status').textContent = '您的浏览器不支持语音识别功能';
    document.getElementById('record-btn').disabled = true;
    return;
  }
  
  recognition = new SpeechRecognition();
  recognition.lang = 'zh-CN';
  recognition.continuous = true;
  recognition.interimResults = true;
  
  recognition.onstart = () => {
    isRecording = true;
    recordingStartTime = Date.now();
    document.getElementById('record-btn').classList.add('recording');
    document.getElementById('record-icon').textContent = '⏹️';
    document.getElementById('record-text').textContent = '停止录音';
    document.getElementById('recording-status').textContent = '正在录音...';
    startTimer();
  };
  
  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    document.getElementById('transcript-text').value = transcript;
  };
  
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    stopRecording();
    document.getElementById('recording-status').textContent = `识别错误: ${event.error}`;
  };
  
  recognition.onend = () => {
    if (isRecording) {
      recognition.start();
    }
  };
}

function startTimer() {
  recordingTimer = setInterval(() => {
    const elapsed = Date.now() - recordingStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    document.getElementById('recording-timer').textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

function stopTimer() {
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
}

function toggleRecording() {
  if (!recognition) {
    initSpeechRecognition();
    if (!recognition) return;
  }
  
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

function startRecording() {
  if (!currentTargetPhrase) {
    alert('请先选择练习内容');
    return;
  }
  
  document.getElementById('transcript-text').value = '';
  document.getElementById('recording-timer').textContent = '00:00';
  try {
    recognition.start();
  } catch (e) {
    console.error('Failed to start recording:', e);
    document.getElementById('recording-status').textContent = '录音启动失败，请重试';
  }
}

function stopRecording() {
  if (isRecording) {
    isRecording = false;
    stopTimer();
    recognition.stop();
    
    document.getElementById('record-btn').classList.remove('recording');
    document.getElementById('record-icon').textContent = '🎤';
    document.getElementById('record-text').textContent = '开始录音';
    document.getElementById('recording-status').textContent = '录音已停止';
    
    const transcript = document.getElementById('transcript-text').value.trim();
    if (transcript) {
      calculateScore(transcript);
      savePracticeRecord(transcript);
    }
  }
}

function calculateScore(transcript) {
  if (!currentTargetPhrase) return;
  
  const target = currentTargetPhrase.replace(/[，。！？、；：]/g, '');
  const actual = transcript.replace(/[，。！？、；：]/g, '');
  
  const targetWords = target.split('');
  const actualWords = actual.split('');
  
  let correctCount = 0;
  const maxLen = Math.max(targetWords.length, actualWords.length);
  
  for (let i = 0; i < Math.min(targetWords.length, actualWords.length); i++) {
    if (targetWords[i] === actualWords[i]) {
      correctCount++;
    }
  }
  
  const accuracy = Math.round((correctCount / maxLen) * 100);
  
  const completeness = Math.round((actualWords.length / targetWords.length) * 100);
  
  const editDistance = levenshteinDistance(target, actual);
  const fluency = Math.max(0, Math.round((1 - editDistance / Math.max(target.length, actual.length)) * 100));
  
  const finalScore = Math.round((accuracy * 0.4 + completeness * 0.3 + fluency * 0.3));
  
  displayScore(finalScore, accuracy, completeness, fluency);
  displayComparison(currentTargetPhrase, transcript);
}

function levenshteinDistance(a, b) {
  const matrix = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

function displayScore(score, accuracy, completeness, fluency) {
  document.getElementById('score-value').textContent = score;
  document.getElementById('accuracy-score').textContent = `${accuracy}%`;
  document.getElementById('completeness-score').textContent = `${completeness}%`;
  document.getElementById('fluency-score').textContent = `${fluency}%`;
  
  const feedbackEl = document.getElementById('score-feedback');
  feedbackEl.classList.remove('positive', 'neutral', 'negative');
  
  if (score >= 80) {
    feedbackEl.classList.add('positive');
    feedbackEl.textContent = '🎉 太棒了！你的表达非常准确和流畅，继续保持！';
  } else if (score >= 60) {
    feedbackEl.classList.add('neutral');
    feedbackEl.textContent = '💪 不错！继续练习，注意提高表达的准确性和完整性。';
  } else {
    feedbackEl.classList.add('negative');
    feedbackEl.textContent = '📝 还需要多练习，多听多说是提高口才的关键！';
  }
}

function displayComparison(target, actual) {
  document.getElementById('compare-target').textContent = target;
  document.getElementById('compare-actual').textContent = actual;
}

function loadPracticePhrases(dayNum) {
  const data = trainingData[dayNum];
  if (!data || !data.practicePhrases) return;
  
  const select = document.getElementById('practice-phrase');
  select.innerHTML = '<option value="">请选择话术</option>';
  
  data.practicePhrases.forEach((phrase, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = phrase.length > 30 ? phrase.substring(0, 30) + '...' : phrase;
    select.appendChild(option);
  });
  
  currentDay = dayNum;
}

function selectPhrase() {
  const dayNum = parseInt(document.getElementById('practice-day').value);
  const phraseIndex = parseInt(document.getElementById('practice-phrase').value);
  
  if (!dayNum || isNaN(phraseIndex)) {
    document.getElementById('target-text').textContent = '请选择上方的练习内容';
    currentTargetPhrase = '';
    return;
  }
  
  const data = trainingData[dayNum];
  currentTargetPhrase = data.practicePhrases[phraseIndex];
  document.getElementById('target-text').textContent = currentTargetPhrase;
  
  document.getElementById('score-value').textContent = '0';
  document.getElementById('accuracy-score').textContent = '0%';
  document.getElementById('completeness-score').textContent = '0%';
  document.getElementById('fluency-score').textContent = '0%';
  document.getElementById('score-feedback').textContent = '';
  document.getElementById('score-feedback').classList.remove('positive', 'neutral', 'negative');
  document.getElementById('compare-target').textContent = '';
  document.getElementById('compare-actual').textContent = '';
  document.getElementById('transcript-text').value = '';
}

function savePracticeRecord(transcript) {
  if (!currentDay || !currentTargetPhrase) return;
  
  const record = {
    day: currentDay,
    dayTitle: trainingData[currentDay].title,
    targetPhrase: currentTargetPhrase,
    actualTranscript: transcript,
    score: parseInt(document.getElementById('score-value').textContent),
    timestamp: new Date().toISOString()
  };
  
  if (!appData.practiceHistory) {
    appData.practiceHistory = [];
  }
  
  appData.practiceHistory.unshift(record);
  if (appData.practiceHistory.length > 20) {
    appData.practiceHistory.pop();
  }
  
  saveData(appData);
  renderPracticeHistory();
}

function renderPracticeHistory() {
  const container = document.getElementById('practice-history');
  
  if (!appData.practiceHistory || appData.practiceHistory.length === 0) {
    container.innerHTML = `
      <div class="history-empty">
        <p>暂无练习记录</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = appData.practiceHistory.map(record => {
    const date = new Date(record.timestamp);
    const timeStr = `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    return `
      <div class="history-item">
        <div class="history-header">
          <span class="history-day">${record.dayTitle}</span>
          <span class="history-score">${record.score}分</span>
        </div>
        <div class="history-phrase">${record.targetPhrase.substring(0, 50)}${record.targetPhrase.length > 50 ? '...' : ''}</div>
        <div class="history-time">${timeStr}</div>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  updateProgress();
  renderCheckins();
  renderRatings();
  renderTop10();
  renderPracticeHistory();
  
  initSpeechRecognition();
  
  document.getElementById('practice-day').addEventListener('change', (e) => {
    loadPracticePhrases(parseInt(e.target.value));
  });
  
  document.getElementById('practice-phrase').addEventListener('change', selectPhrase);
  
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchPage(btn.getAttribute('data-page'));
    });
  });
  
  document.querySelectorAll('.day-card').forEach(card => {
    card.addEventListener('click', () => {
      openModal(parseInt(card.getAttribute('data-day')));
    });
  });
  
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const day = parseInt(cb.getAttribute('data-day'));
      const item = cb.getAttribute('data-item');
      if (!appData.checkins[day]) {
        appData.checkins[day] = {};
      }
      appData.checkins[day][item] = cb.checked;
      saveData(appData);
    });
  });
  
  document.querySelectorAll('textarea[data-day]').forEach(textarea => {
    textarea.addEventListener('input', () => {
      const day = parseInt(textarea.getAttribute('data-day'));
      appData.notes[day] = textarea.value;
      saveData(appData);
    });
  });
  
  document.getElementById('feedback-gain').addEventListener('input', (e) => {
    appData.feedback.gain = e.target.value;
    saveData(appData);
  });
  
  document.getElementById('feedback-next').addEventListener('input', (e) => {
    appData.feedback.next = e.target.value;
    saveData(appData);
  });
  
  document.querySelector('.close-btn').addEventListener('click', closeModal);
  
  document.getElementById('day-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('day-modal')) {
      closeModal();
    }
  });
  
  document.getElementById('top10-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('top10-modal')) {
      closeTop10Modal();
    }
  });
});