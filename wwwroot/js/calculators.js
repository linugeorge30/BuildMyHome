(function () {
  const form = document.getElementById("calc-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    ["width", "length", "height", "doorCount", "windowCount", "wastePercent", "coats", "paintCoveragePerLitre", "tileWidthCm", "tileLengthCm", "flooringCoveragePerPack"].forEach(function (key) {
      data[key] = Number(data[key]);
    });

    const response = await fetch("/api/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    document.getElementById("calc-results").innerHTML =
      "<li>Floor area <strong>" + result.floorArea + " m²</strong></li>" +
      "<li>Floor with waste <strong>" + result.floorAreaWithWaste + " m²</strong></li>" +
      "<li>Wall area <strong>" + result.wallArea + " m²</strong></li>" +
      "<li>Paint <strong>" + result.paintLitres + " L</strong></li>" +
      "<li>Tiles <strong>" + result.tileCount + "</strong></li>" +
      "<li>Flooring packs <strong>" + result.flooringPacks + "</strong></li>";
  });
})();
