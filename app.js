const STORAGE_KEY = "todos";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const countEl = document.getElementById("todo-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterBtns = document.querySelectorAll(".filter-btn");

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  todos.push({ id: makeId(), text: trimmed, completed: false });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.completed = !todo.completed;
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function editTodo(id, newText) {
  const trimmed = newText.trim();
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  if (trimmed) {
    todo.text = trimmed;
  } else {
    todos = todos.filter((t) => t.id !== id);
  }
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

function getFilteredTodos() {
  if (currentFilter === "active") return todos.filter((t) => !t.completed);
  if (currentFilter === "completed") return todos.filter((t) => t.completed);
  return todos;
}

function render() {
  const filtered = getFilteredTodos();
  list.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "할 일이 없습니다";
    list.appendChild(empty);
  } else {
    filtered.forEach((todo) => {
      list.appendChild(renderItem(todo));
    });
  }

  const remaining = todos.filter((t) => !t.completed).length;
  countEl.textContent = `${remaining}개 남음`;
}

function renderItem(todo) {
  const li = document.createElement("li");
  li.className = "todo-item" + (todo.completed ? " completed" : "");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;
  text.addEventListener("dblclick", () => startEdit(li, todo));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "×";
  deleteBtn.setAttribute("aria-label", "삭제");
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

  li.appendChild(checkbox);
  li.appendChild(text);
  li.appendChild(deleteBtn);
  return li;
}

function startEdit(li, todo) {
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "todo-text-input";
  editInput.value = todo.text;

  const textEl = li.querySelector(".todo-text");
  li.replaceChild(editInput, textEl);
  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);

  const commit = () => editTodo(todo.id, editInput.value);
  editInput.addEventListener("blur", commit);
  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") editInput.blur();
    if (e.key === "Escape") {
      editInput.removeEventListener("blur", commit);
      render();
    }
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(input.value);
  input.value = "";
  input.focus();
});

clearCompletedBtn.addEventListener("click", clearCompleted);

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

render();
