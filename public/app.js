const tasksContainer = document.getElementById("tasksContainer");
const refreshBtn = document.getElementById("refreshBtn");
const taskForm = document.getElementById("taskForm");
const taskCount = document.getElementById("taskCount");

function renderTasks(tasks) {
  tasksContainer.innerHTML = "";

  const done = tasks.filter(t => t.completed).length;
  taskCount.textContent = `${tasks.length} tasks — ${done} completed`;

  if (tasks.length === 0) {
    tasksContainer.innerHTML = `<p class="text-muted">No tasks yet. Add one!</p>`;
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
          <h5 class="card-title ${task.completed ? "done" : ""}">${task.title}</h5>
          <div class="card-actions">
            <button class="btn btn-sm ${task.completed ? "btn-outline-secondary" : "btn-success"}"
              onclick="toggleTask(${task.id})">
              ${task.completed ? "Mark Pending" : "Complete"}
            </button>
            <button class="btn btn-sm btn-danger btn-delete-task" onclick="deleteTask(${task.id})">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;

    tasksContainer.appendChild(col);
  });
}

async function loadTasks() {
  try {
    const response = await fetch("/api/tasks");
    const tasks = await response.json();
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