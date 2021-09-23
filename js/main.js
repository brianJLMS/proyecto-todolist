const firebaseConfig = {
  //...
};

firebase.initializeApp(firebaseConfig);
const d = document;
const w = window;
const $success = d.querySelector(".success");
const $taskForm = d.getElementById("form");
const $task = d.getElementById("tasks");
const taskRef = firebase.database().ref("tasks");

w.addEventListener("DOMContentLoaded", async (e) => {
  await taskRef.on("value", (tasks) => {
    $task.innerHTML = ``;
    tasks.forEach((task) => {
      let taskData = task.val();
      $task.innerHTML += `
        <div class="task__item">
          <div class="task__checkbox">
            <input type="checkbox" id="${taskData.Tid}" class="check" ${
        taskData.checked ? "checked" : ""
      } />
            <label for="${taskData.Tid}"
              >${taskData.task} <span class="task__date">${
        taskData.date
      }</span></label
            >
          </div>

          <div class="task__btns">
            <button class="btn btn__edit" data-id="${
              taskData.Tid
            }" data-task="${taskData.task}" data-date="${
        taskData.date
      }">&#10000;</button>
            <button class="btn btn__delete" data-id="${
              taskData.Tid
            }">&#10006;</button>
          </div>
        </div>
      `;
    });
  });

  d.addEventListener("submit", (e) => {
    if (e.target === $taskForm) {
      e.preventDefault();

      if (!e.target.id.value) {
        //Create
        const task = $taskForm["task"].value,
          date = $taskForm["date"].value,
          checked = false;

        const registerTask = taskRef.push();

        registerTask.set({
          Tid: registerTask.key,
          task,
          date,
          checked,
        });

        $taskForm["task"].value = "";
        $taskForm["date"].value = "";
      } else {
        //Update
        const task = $taskForm["task"].value;
        const date = $taskForm["date"].value;

        firebase.database().ref(`tasks/${e.target.id.value}`).update({
          task,
          date,
        });

        $taskForm["task"].value = "";
        $taskForm["date"].value = "";
        $taskForm.id.value = "";
        $taskForm.submit.value = "Listar";
      }
    }
  });

  d.addEventListener("change", (e) => {
    if (e.target.matches(".check")) {
      let checked = e.target.checked;

      firebase.database().ref(`tasks/${e.target.id}`).update({
        checked,
      });
    }
  });

  d.addEventListener("click", (e) => {
    if (e.target.matches(".btn__edit")) {
      $taskForm.submit.value = "Editar";

      firebase
        .database()
        .ref(`tasks/${e.target.dataset.id}`)
        .once("value")
        .then((task) => {
          const data = task.val();
          $taskForm["task"].value = data.task;
          $taskForm["date"].value = data.date;
        });

      $taskForm.id.value = e.target.dataset.id;
    }
    if (e.target.matches(".btn__delete")) {
      firebase.database().ref(`tasks/${e.target.dataset.id}`).remove();

      $success.classList.remove("hidden");

      setTimeout(() => {
        $success.classList.add("hidden");
      }, 2000);
    }
  });
});
