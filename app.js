const STORAGE_KEY = 'timekeeper.entries.v1';

const clockEl = document.getElementById('clock');
const sessionStatusEl = document.getElementById('session-status');
const clockInTimeEl = document.getElementById('clock-in-time');
const elapsedTimeEl = document.getElementById('elapsed-time');
const todayTotalEl = document.getElementById('today-total');
const weekTotalEl = document.getElementById('week-total');
const entryCountEl = document.getElementById('entry-count');
const entriesEl = document.getElementById('entries');
const formErrorEl = document.getElementById('form-error');

const projectInput = document.getElementById('project');
const notesInput = document.getElementById('notes');
const clockInButton = document.getElementById('clock-in');
const clockOutButton = document.getElementById('clock-out');

let entries = loadEntries();
let activeSession = null;

function now() {
  return new Date();
}

function formatDateTime(date) {
  return date.toLocaleString();
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

function formatHoursAndMinutes(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function loadEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function calculateSummaries() {
  const current = now();
  const todayStart = new Date(current.getFullYear(), current.getMonth(), current.getDate());
  const weekStart = new Date(todayStart);
  const dayOfWeek = (todayStart.getDay() + 6) % 7;
  weekStart.setDate(todayStart.getDate() - dayOfWeek);

  let todayMs = 0;
  let weekMs = 0;

  entries.forEach((entry) => {
    const start = new Date(entry.startAt);
    const end = new Date(entry.endAt);
    const duration = Math.max(0, end - start);

    if (start >= todayStart) {
      todayMs += duration;
    }

    if (start >= weekStart) {
      weekMs += duration;
    }
  });

  todayTotalEl.textContent = formatHoursAndMinutes(todayMs);
  weekTotalEl.textContent = formatHoursAndMinutes(weekMs);
  entryCountEl.textContent = String(entries.length);
}

function renderEntries() {
  entriesEl.innerHTML = '';

  const sorted = [...entries].sort((a, b) => new Date(b.startAt) - new Date(a.startAt));

  sorted.forEach((entry) => {
    const li = document.createElement('li');
    li.className = 'entry';

    const title = document.createElement('strong');
    title.textContent = entry.project;

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = `${formatDateTime(new Date(entry.startAt))} → ${formatDateTime(new Date(entry.endAt))} (${formatDuration(
      new Date(entry.endAt) - new Date(entry.startAt),
    )})`;

    li.append(title, meta);

    if (entry.notes) {
      const notes = document.createElement('p');
      notes.textContent = entry.notes;
      li.appendChild(notes);
    }

    entriesEl.appendChild(li);
  });
}

function refreshSessionUi() {
  if (!activeSession) {
    sessionStatusEl.textContent = 'Not clocked in';
    clockInTimeEl.textContent = '—';
    elapsedTimeEl.textContent = '00:00:00';
    clockInButton.disabled = false;
    clockOutButton.disabled = true;
    return;
  }

  sessionStatusEl.textContent = `Clocked in (${activeSession.project})`;
  clockInTimeEl.textContent = formatDateTime(activeSession.startAt);
  elapsedTimeEl.textContent = formatDuration(now() - activeSession.startAt);
  clockInButton.disabled = true;
  clockOutButton.disabled = false;
}

function tickClock() {
  clockEl.textContent = now().toLocaleTimeString();
  refreshSessionUi();
}

function clearError() {
  formErrorEl.textContent = '';
}

function showError(message) {
  formErrorEl.textContent = message;
}

clockInButton.addEventListener('click', () => {
  clearError();

  if (activeSession) {
    showError('You are already clocked in.');
    return;
  }

  const project = projectInput.value.trim();
  const notes = notesInput.value.trim();

  if (project.length < 2) {
    showError('Project name must be at least 2 characters.');
    return;
  }

  activeSession = {
    project,
    notes,
    startAt: now(),
  };

  refreshSessionUi();
});

clockOutButton.addEventListener('click', () => {
  clearError();

  if (!activeSession) {
    showError('You must clock in before clocking out.');
    return;
  }

  const endAt = now();
  const entry = {
    project: activeSession.project,
    notes: activeSession.notes,
    startAt: activeSession.startAt.toISOString(),
    endAt: endAt.toISOString(),
  };

  entries.push(entry);
  saveEntries();
  renderEntries();
  calculateSummaries();

  activeSession = null;
  projectInput.value = '';
  notesInput.value = '';
  refreshSessionUi();
});

setInterval(tickClock, 1000);
tickClock();
renderEntries();
calculateSummaries();
refreshSessionUi();
