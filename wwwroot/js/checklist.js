(function () {
  const boxes = document.querySelectorAll(".checklist-box");
  if (!boxes.length || !window.BMH) {
    return;
  }

  const progress = document.getElementById("check-progress");

  function render() {
    const plan = BMH.load();
    let done = 0;
    boxes.forEach(function (box) {
      box.checked = Boolean(plan.checklist[box.dataset.id]);
      if (box.checked) {
        done += 1;
      }
    });
    progress.textContent = done + " / " + boxes.length;
  }

  boxes.forEach(function (box) {
    box.addEventListener("change", function () {
      const plan = BMH.load();
      plan.checklist[box.dataset.id] = box.checked;
      BMH.save(plan);
      render();
    });
  });

  render();
})();
