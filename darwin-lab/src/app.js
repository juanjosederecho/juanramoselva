import { lessons, admissionQuestions, finalQuestions } from './content.js';

const STORAGE_KEY = 'darwin-lab-session-01';
const ASSETS = {
  images: [
    'assets/photos/00-galapagos-portada.webp',
    'assets/photos/01-jirafas.webp',
    'assets/photos/02-pinzones-casos.webp',
    'assets/photos/03-resistencia-bacteriana.webp',
    'assets/photos/04-fosiles.webp',
    'assets/photos/05-evolucion-caracoles.webp',
    'assets/photos/06-variabilidad-pinzones.webp',
    'assets/photos/07-sobreproduccion-plantulas.webp',
    'assets/photos/08-competencia-pinzones.webp',
    'assets/photos/09-seleccion-polillas.webp',
    'assets/photos/10-cuaderno-darwin.webp',
    'assets/photos/11-admision-universitaria.webp'
  ],
  audio: lessons.map(lesson => `audio/${lesson.audio}`)
};

function initialState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === 'object') return { completed: [], answers: { practice: {}, final: {} }, submitted: { practice: false, final: false }, quick: {}, ...saved };
  } catch (error) { console.info('Se iniciará un progreso local nuevo.', error); }
  return { completed: [], answers: { practice: {}, final: {} }, submitted: { practice: false, final: false }, quick: {} };
}
let state = initialState();
const safeSave = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { console.warn('El progreso no se pudo guardar en este dispositivo.', error); } };
const html = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function renderModuleNav() {
  document.getElementById('module-links').innerHTML = lessons.map(lesson => `<a href="#leccion-${lesson.id}" class="nav-link" data-module-link="${lesson.id}"><span class="nav-index">${lesson.number}</span><span>${html(lesson.title)}</span></a>`).join('');
}

function renderInfographicMedia(infographic, lesson) {
  const media = infographic.image ? [{ src: infographic.image, alt: infographic.imageAlt, caption: infographic.imageCaption }] : lesson.id === 'casos' ? [
    { src: lesson.sections[0].image, alt: lesson.sections[0].alt, caption: 'Jirafas · variación heredable y contexto ecológico.' },
    { src: lesson.sections[1].image, alt: lesson.sections[1].alt, caption: 'Pinzones · variación heredable y alimento disponible.' },
    { src: lesson.sections[2].image, alt: lesson.sections[2].alt, caption: 'Bacterias · selección de variantes resistentes.' }
  ] : [];
  if (!media.length) return '';
  const layout = media.length > 1 ? 'infographic-media--multiple' : 'infographic-media--single';
  return `<div class="infographic-media ${layout}">${media.map(photo => `<figure class="infographic-photo"><img src="${html(photo.src)}" alt="${html(photo.alt)}" loading="lazy" decoding="async"><figcaption>${html(photo.caption)}</figcaption></figure>`).join('')}</div>`;
}

function renderStepGraphic(infographic, lesson) {
  return `<section class="infographic" id="infografia-${lesson.id}" aria-label="Infografía: ${html(infographic.title)}" tabindex="-1"><div class="infographic-top"><div><span class="infographic-kicker">INFOGRAFÍA DE CAMPO</span><h4>${html(infographic.title)}</h4></div><button type="button" class="infographic-expand" aria-label="Ampliar infografía" aria-controls="infografia-${lesson.id}" aria-expanded="false" title="Ampliar infografía">↗</button></div><p>${html(infographic.intro)}</p>${renderInfographicMedia(infographic, lesson)}<div class="infographic-steps">${infographic.steps.map(([title, body]) => `<div class="infographic-step"><strong>${html(title)}</strong><p>${html(body)}</p></div>`).join('')}</div></section>`;
}

function renderQuick(lesson) {
  const q = lesson.quick;
  return `<section class="quick-check" data-quick-check="${lesson.id}"><h4>Comprueba tu razonamiento</h4><fieldset><legend>${html(q.question)}</legend><div class="quick-options">${q.options.map((option, index) => `<button class="quick-option" type="button" data-quick-option="${index}" aria-pressed="false">${html(option)}</button>`).join('')}</div></fieldset><p class="quick-feedback" aria-live="polite"></p></section>`;
}

function renderLessons() {
  const container = document.getElementById('lesson-list');
  container.innerHTML = lessons.map(lesson => {
    const completed = state.completed.includes(lesson.id);
    const sections = lesson.sections.map(section => `<section class="lesson-section"><h4>${html(section.title)}</h4><p>${html(section.body)}</p></section>`).join('');
    const transcript = `${lesson.lead} ${lesson.sections.map(section => `${section.title}. ${section.body}`).join(' ')}`;
    const audioNumber = Number(lesson.audio.slice(0, 2));
    return `<article class="lesson-card" id="leccion-${lesson.id}" aria-labelledby="title-${lesson.id}">
      <div class="lesson-number" aria-hidden="true">${lesson.number}</div><div class="lesson-body">
      <div class="lesson-eyebrow">${html(lesson.eyebrow)} <span aria-hidden="true">·</span> ${html(lesson.duration)}</div>
      <h3 class="lesson-title" id="title-${lesson.id}">${html(lesson.title)}</h3><p class="lesson-lead">${html(lesson.lead)}</p>
      <div class="module-narration"><span class="narration-label"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8v4h3l4 3V5L6 8H3Zm10-1.5a5 5 0 0 1 0 7m2-9a8 8 0 0 1 0 11"/></svg>ESCUCHAR MÓDULO</span><audio controls preload="none" aria-label="Narración: ${html(lesson.title)}"><source src="audio/${html(lesson.audio)}" type="audio/mpeg">Tu navegador no admite audio HTML5. Puedes consultar los apuntes de lectura.</audio></div>
      <details class="transcript-details" id="transcript-${lesson.id}"><summary class="audio-transcript">Abrir apuntes de la lección</summary><p>${html(transcript)}</p></details>
      <div class="lesson-sections">${sections}</div>${renderStepGraphic(lesson.infographic, lesson)}
      <aside class="misconception"><span class="label">ACLARA EL MITO</span><p><b>${html(lesson.misconception[0])}</b><br>${html(lesson.misconception[1])}</p></aside>
      ${renderQuick(lesson)}
      <div class="lesson-completion"><button type="button" class="mark-done" data-complete="${lesson.id}" aria-pressed="${completed}"><span class="check" aria-hidden="true">${completed ? '✓' : '○'}</span>${completed ? 'Módulo revisado' : 'Marcar como revisado'}</button><span class="completion-hint">Progreso guardado en este dispositivo</span></div>
      </div></article>`;
  }).join('');
  updateProgress();
}

function updateProgress() {
  const done = lessons.filter(lesson => state.completed.includes(lesson.id)).length;
  const percentage = Math.round(done / lessons.length * 100);
  document.getElementById('progress-label').textContent = `${done} / ${lessons.length}`;
  document.querySelector('.progress-track').setAttribute('aria-valuemax', String(lessons.length));
  document.querySelector('.progress-track').setAttribute('aria-valuenow', String(done));
  document.getElementById('progress-fill').style.width = `${percentage}%`;
  document.getElementById('progress-note').textContent = done === lessons.length ? 'Ruta completada. Ya puedes intentar el examen final.' : 'Marca cada módulo al terminarlo. Tu avance queda guardado aquí.';
  document.querySelectorAll('[data-module-link]').forEach(link => {
    const isDone = state.completed.includes(link.dataset.moduleLink);
    link.classList.toggle('is-done', isDone);
    if (isDone && !link.querySelector('.nav-index').dataset.checked) {
      link.querySelector('.nav-index').dataset.checked = 'true';
      link.querySelector('.nav-index').textContent = '✓';
    } else if (!isDone) {
      link.querySelector('.nav-index').textContent = lessons.find(lesson => lesson.id === link.dataset.moduleLink)?.number || '';
      delete link.querySelector('.nav-index').dataset.checked;
    }
  });
}

function renderQuiz(containerId, questions, key) {
  const container = document.getElementById(containerId);
  const answers = state.answers[key] || {};
  container.innerHTML = questions.map((question, qIndex) => {
    const hasFeedback = state.submitted[key];
    const selected = Number.isInteger(answers[question.id]) ? answers[question.id] : null;
    const correct = selected === question.answer;
    let feedbackClass = 'quiz-feedback';
    let feedbackText = '';
    if (hasFeedback && selected !== null) {
      feedbackClass += correct ? ' is-visible is-correct' : ' is-visible is-incorrect';
      feedbackText = `${correct ? 'Correcto.' : 'No es la mejor opción.'} ${question.explanation}`;
    } else if (hasFeedback) {
      feedbackClass += ' is-visible is-unanswered';
      feedbackText = `Sin respuesta. ${question.explanation}`;
    }
    return `<fieldset class="quiz-question" id="${key}-pregunta-${qIndex + 1}"><legend><span class="quiz-q-number">${String(qIndex + 1).padStart(2, '0')}</span>${html(question.question)}</legend><div class="quiz-options">${question.options.map((option, optionIndex) => `<label class="quiz-option"><input type="radio" name="${key}-${question.id}" value="${optionIndex}" data-quiz="${key}" data-question="${question.id}" ${selected === optionIndex ? 'checked' : ''}><span>${html(option)}</span></label>`).join('')}</div><p class="${feedbackClass}" data-feedback="${key}-${question.id}">${html(feedbackText)}</p></fieldset>`;
  }).join('');
  const result = document.getElementById(`${key}-result`);
  if (state.submitted[key]) showScore(questions, key, false);
  else { result.classList.remove('is-visible'); result.textContent = ''; }
}

function showScore(questions, key, moveFocus = true) {
  const answers = state.answers[key] || {};
  const submitted = questions.filter(q => Number.isInteger(answers[q.id])).length;
  const correct = questions.filter(q => answers[q.id] === q.answer).length;
  const result = document.getElementById(`${key}-result`);
  const percent = submitted ? Math.round(correct / questions.length * 100) : 0;
  let message = 'Revisa las explicaciones de cada pregunta y vuelve a intentarlo. La evaluación está pensada para el aprendizaje, no para una calificación oficial.';
  if (percent >= 80) message = 'Buen dominio: ya puedes justificar el mecanismo y leer con cuidado sus límites.';
  else if (percent >= 60) message = 'Vas avanzando. Concéntrate en la herencia, el éxito reproductivo y el cambio entre generaciones.';
  result.innerHTML = `<h3>Resultado: ${correct} de ${questions.length}</h3><p>Respuestas completadas: ${submitted}/${questions.length} · ${percent}% de aciertos sobre el total.</p><p>${message}</p>`;
  result.classList.add('is-visible');
  if (moveFocus) result.focus({ preventScroll: true });
}

function setupQuiz(formId, containerId, questions, key) {
  const form = document.getElementById(formId);
  renderQuiz(containerId, questions, key);
  form.addEventListener('change', event => {
    const radio = event.target.closest('[data-quiz]');
    if (!radio) return;
    state.answers[key] = state.answers[key] || {};
    state.answers[key][radio.dataset.question] = Number(radio.value);
    safeSave();
    if (state.submitted[key]) {
      const question = questions.find(item => item.id === radio.dataset.question);
      const correct = Number(radio.value) === question.answer;
      const feedback = document.querySelector(`[data-feedback="${key}-${question.id}"]`);
      feedback.className = `quiz-feedback is-visible ${correct ? 'is-correct' : 'is-incorrect'}`;
      feedback.textContent = `${correct ? 'Correcto.' : 'No es la mejor opción.'} ${question.explanation}`;
      showScore(questions, key, false);
    }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    state.submitted[key] = true;
    safeSave();
    renderQuiz(containerId, questions, key);
    showScore(questions, key, true);
  });
  form.querySelector(`[data-reset="${key}"]`).addEventListener('click', () => {
    state.answers[key] = {};
    state.submitted[key] = false;
    safeSave();
    renderQuiz(containerId, questions, key);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

renderModuleNav();
renderLessons();
setupQuiz('practice-form', 'practice-questions', admissionQuestions, 'practice');
setupQuiz('final-form', 'final-questions', finalQuestions, 'final');

// Micro-evaluaciones independientes con retroalimentación inmediata.
document.getElementById('lesson-list').addEventListener('click', event => {
  const expandButton = event.target.closest('.infographic-expand');
  if (expandButton) {
    const card = expandButton.closest('.infographic');
    const open = !card.classList.contains('is-expanded');
    document.querySelectorAll('.infographic.is-expanded').forEach(item => {
      item.classList.remove('is-expanded');
      const button = item.querySelector('.infographic-expand');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Ampliar infografía');
      button.title = 'Ampliar infografía';
      button.textContent = '↗';
    });
    if (open) {
      card.classList.add('is-expanded');
      document.body.classList.add('is-infographic-expanded');
      expandButton.setAttribute('aria-expanded', 'true');
      expandButton.setAttribute('aria-label', 'Reducir infografía');
      expandButton.title = 'Reducir infografía';
      expandButton.textContent = '↙';
      expandButton.focus({ preventScroll: true });
    } else {
      document.body.classList.remove('is-infographic-expanded');
      expandButton.focus({ preventScroll: true });
    }
    return;
  }
  const option = event.target.closest('[data-quick-option]');
  if (option) {
    const check = option.closest('[data-quick-check]');
    const lesson = lessons.find(item => item.id === check.dataset.quickCheck);
    const choice = Number(option.dataset.quickOption);
    check.querySelectorAll('[data-quick-option]').forEach(button => button.setAttribute('aria-pressed', String(button === option)));
    const feedback = check.querySelector('.quick-feedback');
    const correct = choice === lesson.quick.answer;
    feedback.textContent = `${correct ? 'Sí.' : 'Todavía no.'} ${lesson.quick.explanation}`;
    state.quick[lesson.id] = choice;
    safeSave();
    check.querySelectorAll('[data-quick-option]').forEach((button, index) => button.classList.toggle('is-right', index === lesson.quick.answer));
    return;
  }
  const completeButton = event.target.closest('[data-complete]');
  if (completeButton) {
    const id = completeButton.dataset.complete;
    state.completed = state.completed.includes(id) ? state.completed.filter(item => item !== id) : [...state.completed, id];
    safeSave();
    renderLessons();
    document.getElementById(`leccion-${id}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

document.addEventListener('keydown', event => {
  const card = document.querySelector('.infographic.is-expanded');
  if (!card) return;
  if (event.key === 'Escape') {
    card.classList.remove('is-expanded');
    document.body.classList.remove('is-infographic-expanded');
    const button = card.querySelector('.infographic-expand');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Ampliar infografía');
    button.title = 'Ampliar infografía';
    button.textContent = '↗';
    button.focus({ preventScroll: true });
    return;
  }
  if (event.key === 'Tab') {
    const focusable = [...card.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) { event.preventDefault(); card.focus(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    else if (!card.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
  }
});

// Restaura las selecciones de las comprobaciones rápidas.
for (const lesson of lessons) {
  const savedChoice = state.quick[lesson.id];
  if (Number.isInteger(savedChoice)) {
    const check = document.querySelector(`[data-quick-check="${lesson.id}"]`);
    if (check) {
      const buttons = check.querySelectorAll('[data-quick-option]');
      buttons[savedChoice]?.setAttribute('aria-pressed', 'true');
      buttons.forEach((button, index) => button.classList.toggle('is-right', index === lesson.quick.answer));
      check.querySelector('.quick-feedback').textContent = `${savedChoice === lesson.quick.answer ? 'Sí.' : 'Todavía no.'} ${lesson.quick.explanation}`;
    }
  }
}

// Navegación móvil y cierre del menú tras elegir destino.
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const mobileSidebarQuery = window.matchMedia('(max-width: 760px)');
function syncMobileSidebar(open = false) {
  if (!mobileSidebarQuery.matches) {
    sidebar.classList.remove('is-open');
    sidebar.inert = false;
    menuToggle.setAttribute('aria-expanded', 'false');
    return;
  }
  sidebar.inert = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
}
syncMobileSidebar(false);
mobileSidebarQuery.addEventListener('change', () => syncMobileSidebar(false));
menuToggle.addEventListener('click', () => {
  const open = sidebar.classList.toggle('is-open');
  syncMobileSidebar(open);
  if (open) sidebar.querySelector('a')?.focus();
});
document.getElementById('lesson-nav').addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  document.querySelectorAll('.nav-link').forEach(item => item.classList.toggle('is-active', item === link));
  sidebar.classList.remove('is-open');
  syncMobileSidebar(false);
  menuToggle.focus();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
    sidebar.classList.remove('is-open');
    syncMobileSidebar(false);
    menuToggle.focus();
  }
});

// Preparar los recursos de lectura para consultas posteriores sin conexión.
const offlineButton = document.getElementById('offline-button');
offlineButton.addEventListener('click', async () => {
  const status = document.getElementById('offline-status');
  if (!('serviceWorker' in navigator) || !('caches' in window)) {
    status.textContent = 'Este navegador no permite guardar el contenido para uso sin conexión.';
    return;
  }
  status.textContent = 'Guardando módulos y recursos en este dispositivo…';
  try {
    const registration = await navigator.serviceWorker.ready;
    const cache = await caches.open('darwin-lab-v5');
    const core = ['./', 'index.html', 'src/styles.css', 'src/content.js', 'src/app.js', 'manifest.webmanifest', 'manus-routes.json', 'assets/darwin-mark.svg'];
    await cache.addAll(core);
    const media = [...ASSETS.audio, ...ASSETS.images];
    const results = await Promise.allSettled(media.map(path => cache.add(path)));
    const cached = results.filter(result => result.status === 'fulfilled').length;
    status.textContent = `${cached} de ${media.length} audios e imágenes guardados. La lectura queda disponible sin conexión.`;
    if (registration.active) registration.active.postMessage({ type: 'SKIP_WAITING' });
  } catch (error) {
    console.error(error);
    status.textContent = 'Se guardó el contenido principal; algún recurso multimedia podría requerir conexión.';
  }
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(error => console.warn('No se pudo activar el acceso sin conexión.', error)));
}
