const tasksContainer = document.getElementById("tasksContainer");
const refreshBtn = document.getElementById("refreshBtn");
const taskForm = document.getElementById("taskForm");
const taskCount = document.getElementById("taskCount");

function renderTasks(tasks) {
  tasksContainer.innerHTML = "";

  const done = tasks.filter(t => t.completed).length;
  taskCount.textContent = `${tasks.length} tasks — ${done} completed`;

  if (tasks.length === 0) {
    tasksContainer.innerHTML = `
      <div class="col-12 empty-state">
        <p style="font-size:32px">📋</p>
        <p style="font-weight:600;color:#555">No tasks yet</p>
        <p>Click "+ Add task" to get started</p>
      </div>`;
    return;
  }

  tasks.forEach(task => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    col.innerHTML = `
      <div class="card h-100 ${task.completed ? "completed" : ""}">
        <div class="card-body">
          <span class="status-badge ${task.completed ? "badge-completed" : "badge-pending"}">
            ${task.completed ? "✅ Completed" : "⏳ Pending"}
          </span>
          <p class="card-title ${task.completed ? "done" : ""}">${task.title}</p>
          <div class="card-actions">
            <button class="btn-toggle ${task.completed ? "" : "complete"}" onclick="toggleTask(${task.id})">
              ${task.completed ? "Mark pending" : "Mark complete"}
            </button>
            <button class="btn-del" onclick="deleteTask(${task.id})">Delete</button>
          </div>
        </div>
      </div>
    `;

    tasksContainer.appendChild(col);
  });
}

async function loadTasks() {
  try {
    const res = await fetch("/api/tasks");
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    tasksContainer.innerHTML = `<p class="text-danger">Could not load tasks.</p>`;
  }
}

async function toggleTask(id) {
  try {
    await fetch(`/api/tasks/${id}/toggle`, { method: "PUT" });
    loadTasks();
  } catch (err) {
    console.error("Error toggling task:", err);
  }
}

async function deleteTask(id) {
  try {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    loadTasks();
  } catch (err) {
    console.error("Error deleting task:", err);
  }
}

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.getElementById("title").value.trim();
  if (!title) return;

  try {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });
    taskForm.reset();
    bootstrap.Modal.getInstance(document.getElementById("addTaskModal")).hide();
    loadTasks();
  } catch (err) {
    console.error("Error creating task:", err);
  }
});

refreshBtn.addEventListener("click", loadTasks);
loadTasks();