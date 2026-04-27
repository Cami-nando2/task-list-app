const tasksContainer = document.getElementById("tasksContainer");
const refreshBtn = document.getElementById("refreshBtn");
const taskForm = document.getElementById("taskForm");

function renderTasks(tasks) {
  tasksContainer.innerHTML = "";
  tasks.forEach(task => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4 mb-4";

    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${task.title}</h5>
          <p>Status: ${task.completed ? "✅ Completed" : "⏳ Pending"}</p>
          <button class="btn btn-sm btn-success" onclick="updateTask(${task.id}, true)">Complete</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">Delete</button>
        </div>
      </div>
    `;
    tasksContainer.appendChild(col);
  });
}

async function loadTasks() {
  const response = await fetch("/api/tasks");
  const tasks = await response.json();
  renderTasks(tasks);
}

async function updateTask(id, completed) {
  await fetch(`/api/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed })
  });
  loadTasks();
}

async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  loadTasks();
}

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = document.getElementById("title").value;

  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });

  taskForm.reset();
  bootstrap.Modal.getInstance(document.getElementById("addTaskModal")).hide();
  loadTasks();
});

refreshBtn.addEventListener("click", loadTasks);

// Cargar tareas al inicio
loadTasks();