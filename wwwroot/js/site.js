function updatePlanStatus(plan) {
  const status = document.getElementById("plan-status");
  if (!status) {
    return;
  }
  const rooms = plan.rooms.length;
  const style = plan.styleName ? ` · ${plan.styleName}` : "";
  status.textContent = rooms
    ? `${rooms} room${rooms === 1 ? "" : "s"} saved${style}`
    : "No rooms saved yet";
}

document.addEventListener("DOMContentLoaded", function () {
  if (!window.BMH) {
    return;
  }

  updatePlanStatus(BMH.load());
  document.addEventListener("bmh:plan-changed", function (event) {
    updatePlanStatus(event.detail);
  });

  const exportBtn = document.getElementById("export-plan");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      BMH.exportJson();
    });
  }

  const importInput = document.getElementById("import-plan");
  if (importInput) {
    importInput.addEventListener("change", async function () {
      const file = importInput.files && importInput.files[0];
      if (!file) {
        return;
      }
      try {
        await BMH.importFile(file);
        window.location.reload();
      } catch {
        alert("Could not import that file. Use a JSON export from this site.");
      }
      importInput.value = "";
    });
  }

  const clearBtn = document.getElementById("clear-plan");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      if (confirm("Clear the plan stored in this browser?")) {
        BMH.clear();
        window.location.reload();
      }
    });
  }

  document.querySelectorAll(".apply-style").forEach(function (button) {
    button.addEventListener("click", function () {
      const plan = BMH.load();
      plan.styleId = button.dataset.id;
      plan.styleName = button.dataset.name;
      BMH.save(plan);
      button.textContent = "Added to plan";
    });
  });
});
