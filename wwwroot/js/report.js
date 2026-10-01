(function () {
  const body = document.getElementById("report-body");
  if (!body || !window.BMH) {
    return;
  }

  const nameInput = document.getElementById("project-name");
  const title = document.getElementById("report-title");
  const meta = document.getElementById("report-meta");

  function render() {
    const plan = BMH.load();
    if (plan.projectName) {
      nameInput.value = plan.projectName;
    }
    title.textContent = nameInput.value || "My home plan";
    const when = plan.updatedAt ? new Date(plan.updatedAt).toLocaleString() : "not saved yet";
    meta.textContent =
      (plan.layoutName ? "Layout: " + plan.layoutName + " · " : "") +
      (plan.styleName ? "Style: " + plan.styleName + " · " : "") +
      "Updated " + when;

    if (!plan.rooms.length) {
      body.innerHTML = "<p>No rooms in this browser yet. Save a room from the planner, then return here.</p>";
      return;
    }

    let html = "<table class='data-table'><thead><tr><th>Room</th><th>Size</th><th>Flooring</th><th>Paint</th><th>Furniture</th><th>Paint (L)</th><th>Floor m²</th><th>Tiles</th><th>Est. cost</th></tr></thead><tbody>";
    let total = 0;
    plan.rooms.forEach(function (room) {
      const estimate = room.estimate || {};
      total += Number(estimate.totalCost) || 0;
      html += "<tr><td>" + room.name + "</td><td>" + room.width + " × " + room.length + " × " + room.height + " m</td><td>" +
        (room.flooringName || "—") + "</td><td>" + (room.paintName || "—") + "</td><td>" +
        ((room.furnitureNames || []).join(", ") || "—") + "</td><td>" + (estimate.paintLitres ?? "—") + "</td><td>" +
        (estimate.floorAreaWithWaste ?? "—") + "</td><td>" + (estimate.tileCount ?? "—") + "</td><td>" +
        (estimate.totalCost != null ? Number(estimate.totalCost).toFixed(2) : "—") + "</td></tr>";
    });
    html += "</tbody></table><p><strong>Combined estimate:</strong> " + total.toFixed(2) + " using prices you entered.</p>";

    const ticks = Object.keys(plan.checklist || {}).filter(function (key) {
      return plan.checklist[key];
    }).length;
    html += "<p>Checklist items marked done: " + ticks + "</p>";
    body.innerHTML = html;
  }

  nameInput.addEventListener("input", function () {
    const plan = BMH.load();
    plan.projectName = nameInput.value;
    BMH.save(plan);
    title.textContent = nameInput.value || "My home plan";
  });

  document.getElementById("print-report").addEventListener("click", function () {
    window.print();
  });

  document.getElementById("download-json").addEventListener("click", function () {
    BMH.exportJson();
  });

  document.getElementById("download-html").addEventListener("click", async function () {
    const plan = BMH.load();
    const payload = {
      projectName: nameInput.value || plan.projectName,
      styleName: plan.styleName,
      layoutName: plan.layoutName,
      rooms: plan.rooms.map(function (room) {
        return {
          name: room.name,
          width: room.width,
          length: room.length,
          height: room.height,
          flooring: room.flooringName,
          paint: room.paintName,
          furniture: room.furnitureNames || [],
          estimate: room.estimate
        };
      }),
      notes: ["Interior planning only. Structural work needs a professional."]
    };
    const response = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "build-my-home-plan.html";
    link.click();
    URL.revokeObjectURL(url);
  });

  render();
})();
