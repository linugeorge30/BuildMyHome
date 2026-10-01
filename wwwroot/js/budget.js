(function () {
  const table = document.getElementById("budget-table");
  if (!table || !window.BMH) {
    return;
  }

  const materials = JSON.parse(document.getElementById("budget-materials").textContent);

  function currentPrices() {
    const prices = BMH.load().prices || {};
    document.querySelectorAll(".price-input").forEach(function (input) {
      prices[input.dataset.id] = Number(input.value) || 0;
    });
    return prices;
  }

  function fillPriceInputs() {
    const saved = BMH.load().prices || {};
    document.querySelectorAll(".price-input").forEach(function (input) {
      if (saved[input.dataset.id] != null) {
        input.value = saved[input.dataset.id];
      }
    });
  }

  async function estimateRoom(room, prices) {
    const paint = materials.find((item) => item.id === room.paintId);
    const flooring = materials.find((item) => item.id === room.flooringId);
    const payload = {
      width: room.width,
      length: room.length,
      height: room.height,
      doorCount: 1,
      windowCount: 1,
      wastePercent: 10,
      coats: 2,
      paintCoveragePerLitre: (paint && paint.typicalCoverage) || 11,
      tileWidthCm: 60,
      tileLengthCm: 60,
      flooringCoveragePerPack: 2.16,
      paintPrice: prices[room.paintId] || 0,
      flooringPrice: prices[room.flooringId] || 0,
      tilePrice: prices.tiles || 0
    };
    const response = await fetch("/api/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return response.json();
  }

  async function render() {
    const plan = BMH.load();
    const prices = currentPrices();
    plan.prices = prices;
    const body = table.querySelector("tbody");
    body.innerHTML = "";
    const empty = document.getElementById("budget-empty");
    if (!plan.rooms.length) {
      empty.hidden = false;
      document.getElementById("budget-total").textContent = "0.00";
      BMH.save(plan);
      return;
    }
    empty.hidden = true;
    let total = 0;
    for (const room of plan.rooms) {
      const estimate = await estimateRoom(room, prices);
      room.estimate = estimate;
      total += estimate.totalCost;
      const row = document.createElement("tr");
      row.innerHTML =
        "<td>" + room.name + "</td>" +
        "<td>" + room.width + " × " + room.length + " m</td>" +
        "<td>" + (room.paintName || "—") + "</td>" +
        "<td>" + (room.flooringName || "—") + "</td>" +
        "<td>" + estimate.paintCost.toFixed(2) + "</td>" +
        "<td>" + estimate.flooringCost.toFixed(2) + "</td>" +
        "<td>" + estimate.tileCost.toFixed(2) + "</td>" +
        "<td>" + estimate.totalCost.toFixed(2) + "</td>";
      body.appendChild(row);
    }
    document.getElementById("budget-total").textContent = total.toFixed(2);
    BMH.save(plan);
  }

  document.getElementById("recalc-budget").addEventListener("click", render);
  fillPriceInputs();
  render();
})();
