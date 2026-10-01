(function () {
  const materials = window.BMH_MATERIALS || [];
  const filters = document.getElementById("material-filters");
  if (!filters) {
    return;
  }

  filters.addEventListener("click", function (event) {
    const button = event.target.closest("[data-category]");
    if (!button) {
      return;
    }
    const category = button.dataset.category;
    filters.querySelectorAll(".filter-pill").forEach(function (pill) {
      pill.classList.toggle("active", pill === button);
    });
    document.querySelectorAll(".category-title, .material-grid").forEach(function (block) {
      const show = category === "all" || block.dataset.category === category;
      block.classList.toggle("hidden-cat", !show);
    });
  });

  document.querySelectorAll(".select-material").forEach(function (button) {
    button.addEventListener("click", function () {
      const plan = BMH.load();
      plan.selectedMaterials = plan.selectedMaterials || {};
      plan.selectedMaterials[button.dataset.category] = button.dataset.id;
      BMH.save(plan);
      button.textContent = "Saved";
    });
  });

  function cardHtml(material) {
    if (!material) {
      return "<p class='muted'>Choose a material.</p>";
    }
    return (
      "<article class='material-card'><div class='material-swatch' style='background:linear-gradient(135deg," +
      material.swatch +
      "," +
      material.swatchSecondary +
      ")'></div><div class='material-body'><h3>" +
      material.name +
      "</h3><p><strong>Appearance.</strong> " +
      material.appearance +
      "</p><p><strong>Maintenance.</strong> " +
      material.maintenance +
      "</p><p><strong>Durability.</strong> " +
      material.durability +
      "</p><p>Durability " +
      material.durabilityScore +
      "/10 · Easy care " +
      material.maintenanceEase +
      "/10</p></div></article>"
    );
  }

  function renderCompare() {
    const a = materials.find((item) => item.id === document.getElementById("compare-a").value);
    const b = materials.find((item) => item.id === document.getElementById("compare-b").value);
    document.getElementById("compare-result").innerHTML = cardHtml(a) + cardHtml(b);
  }

  document.getElementById("compare-a").addEventListener("change", renderCompare);
  document.getElementById("compare-b").addEventListener("change", renderCompare);
  if (materials.length > 1) {
    document.getElementById("compare-b").selectedIndex = 1;
  }
  renderCompare();
})();
