const STORAGE_KEY = "zodo-tasks-v1";
const dateElement = document.querySelector("#today-date");
const form = document.querySelector("#task-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const count = document.querySelector("#task-count");
const progress = document.querySelector("#progress");

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readTasks() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

let savedTasks = readTasks();
let activeDate = localDateKey();
const todayTasks = () => Array.isArray(savedTasks[activeDate]) ? savedTasks[activeDate] : [];

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTasks)); }
  catch { /* Keep the page usable if browser storage is unavailable. */ }
}

function render() {
  const tasks = todayTasks();
  const completed = tasks.filter(task => task.done).length;
  dateElement.textContent = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  count.textContent = String(tasks.length);
  progress.textContent = `${completed} done`;
  emptyState.hidden = tasks.length > 0;
  list.replaceChildren();
  for (const task of tasks) {
    const item = document.createElement("li");
    item.className = `task-item${task.done ? " done" : ""}`;
    const checkbox = document.createElement("input");
    checkbox.className = "task-checkbox";
    checkbox.type = "checkbox";
    checkbox.id = `task-${task.id}`;
    checkbox.checked = Boolean(task.done);
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      item.classList.toggle("done", task.done);
      progress.textContent = `${todayTasks().filter(entry => entry.done).length} done`;
      save();
    });
    const label = document.createElement("label");
    label.className = "task-text";
    label.htmlFor = checkbox.id;
    label.textContent = task.text;
    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.setAttribute("aria-label", `Delete ${task.text}`);
    remove.innerHTML = '<i class="ph ph-trash" aria-hidden="true"></i>';
    remove.addEventListener("click", () => {
      savedTasks[activeDate] = todayTasks().filter(entry => entry.id !== task.id);
      save(); render();
    });
    item.append(checkbox, label, remove);
    list.append(item);
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  savedTasks[activeDate] = [...todayTasks(), { id: crypto.randomUUID(), text, done: false }];
  input.value = "";
  save(); render(); input.focus();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && localDateKey() !== activeDate) {
    activeDate = localDateKey();
    savedTasks = readTasks();
    render();
  }
});

render();
