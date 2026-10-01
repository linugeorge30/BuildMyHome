(function () {
  const board = document.getElementById("room-board");
  if (!board || !window.BMH) {
    return;
  }

  const bootstrapEl = document.getElementById("planner-bootstrap");
  const bootstrap = JSON.parse(bootstrapEl.textContent);
  const catalog = bootstrap.furniture || [];
  const houses = bootstrap.houses || [];
  const flooring = bootstrap.flooring || [];
  const paints = bootstrap.paints || [];

  const els = {
    name: document.getElementById("room-name"),
    width: document.getElementById("room-width"),
    length: document.getElementById("room-length"),
    height: document.getElementById("room-height"),
    layout: document.getElementById("layout-select"),
    layoutRoom: document.getElementById("layout-room-select"),
    flooring: document.getElementById("flooring-select"),
    paint: document.getElementById("paint-select"),
    palette: document.getElementById("furniture-palette"),
    saved: document.getElementById("saved-rooms"),
    overlap: document.getElementById("overlap-warn")
  };

  let state = newRoomState();
  let lastEstimate = null;
  let placingId = catalog[0] ? catalog[0].id : null;
  let drag = null;
  let estimateTimer = 0;

  function newRoomState() {
    return {
      id: BMH.newId(),
      name: "Living room",
      width: 4.5,
      length: 5.5,
      height: 2.7,
      flooringId: flooring[0] && flooring[0].id,
      paintId: paints[0] && paints[0].id,
      items: [],
      selectedId: null
    };
  }

  function sizeOf(item) {
    const def = catalog.find((entry) => entry.id === item.furnitureId);
    if (!def) {
      return { width: 0, depth: 0, name: "Item" };
    }
    return {
      width: item.rotated ? def.depth : def.width,
      depth: item.rotated ? def.width : def.depth,
      name: def.name,
      color: def.color
    };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function pxPerMeter() {
    const wrap = board.parentElement;
    const maxW = Math.max(220, wrap.clientWidth - 28);
    const maxH = 540;
    return Math.min(80, maxW / state.width, maxH / state.length);
  }

  function swatch(select) {
    const option = select.options[select.selectedIndex];
    return option ? option.dataset.swatch : "#d4b483";
  }

  function intersects(a, b) {
    const as = sizeOf(a);
    const bs = sizeOf(b);
    return a.x < b.x + bs.width && a.x + as.width > b.x && a.y < b.y + bs.depth && a.y + as.depth > b.y;
  }

  function hasOverlap() {
    for (let i = 0; i < state.items.length; i += 1) {
      for (let j = i + 1; j < state.items.length; j += 1) {
        if (intersects(state.items[i], state.items[j])) {
          return true;
        }
      }
    }
    return false;
  }

  function renderBoard() {
    const ppm = pxPerMeter();
    board.style.width = state.width * ppm + "px";
    board.style.height = state.length * ppm + "px";
    board.style.backgroundColor = swatch(els.flooring) || "#d4b483";
    board.style.borderColor = swatch(els.paint) || "#c4785a";
    board.style.backgroundImage =
      "linear-gradient(to right, rgba(28,25,23,.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(28,25,23,.12) 1px, transparent 1px)";
    board.style.backgroundSize = ppm + "px " + ppm + "px";

    board.innerHTML = "";
    state.items.forEach(function (item) {
      const size = sizeOf(item);
      const el = document.createElement("div");
      el.className = "furn-item" + (item.id === state.selectedId ? " selected" : "");
      el.style.left = item.x * ppm + "px";
      el.style.top = item.y * ppm + "px";
      el.style.width = size.width * ppm + "px";
      el.style.height = size.depth * ppm + "px";
      el.style.background = size.color || "#6b4f3a";
      el.dataset.id = item.id;
      el.innerHTML = "<span>" + size.name + "</span>";
      el.addEventListener("pointerdown", onDragStart);
      board.appendChild(el);
    });

    refreshStats();
  }

  function onDragStart(event) {
    event.preventDefault();
    event.stopPropagation();
    const id = event.currentTarget.dataset.id;
    state.selectedId = id;
    const item = state.items.find((entry) => entry.id === id);
    const ppm = pxPerMeter();
    const rect = board.getBoundingClientRect();
    drag = {
      id: id,
      offsetX: (event.clientX - rect.left) / ppm - item.x,
      offsetY: (event.clientY - rect.top) / ppm - item.y
    };
    board.querySelectorAll(".furn-item").forEach(function (el) {
      el.classList.toggle("selected", el.dataset.id === id);
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  board.addEventListener("pointermove", function (event) {
    if (!drag) {
      return;
    }
    const item = state.items.find((entry) => entry.id === drag.id);
    if (!item) {
      return;
    }
    const size = sizeOf(item);
    const ppm = pxPerMeter();
    const rect = board.getBoundingClientRect();
    item.x = clamp((event.clientX - rect.left) / ppm - drag.offsetX, 0, Math.max(0, state.width - size.width));
    item.y = clamp((event.clientY - rect.top) / ppm - drag.offsetY, 0, Math.max(0, state.length - size.depth));
    const el = board.querySelector('[data-id="' + drag.id + '"]');
    if (el) {
      el.style.left = item.x * ppm + "px";
      el.style.top = item.y * ppm + "px";
    }
  });

  board.addEventListener("pointerup", function () {
    if (drag) {
      drag = null;
      refreshStats();
    }
  });

  board.addEventListener("click", function (event) {
    if (event.target !== board || !placingId) {
      return;
    }
    const def = catalog.find((entry) => entry.id === placingId);
    if (!def) {
      return;
    }
    const ppm = pxPerMeter();
    const rect = board.getBoundingClientRect();
    let x = (event.clientX - rect.left) / ppm - def.width / 2;
    let y = (event.clientY - rect.top) / ppm - def.depth / 2;
    x = clamp(x, 0, Math.max(0, state.width - def.width));
    y = clamp(y, 0, Math.max(0, state.length - def.depth));
    const placed = { id: BMH.newId(), furnitureId: def.id, x: x, y: y, rotated: false };
    state.items.push(placed);
    state.selectedId = placed.id;
    renderBoard();
  });

  function markPalette() {
    els.palette.querySelectorAll(".furniture-chip").forEach(function (chip) {
      chip.classList.toggle("active", chip.dataset.id === placingId);
    });
  }

  els.palette.addEventListener("click", function (event) {
    const chip = event.target.closest(".furniture-chip");
    if (!chip) {
      return;
    }
    placingId = chip.dataset.id;
    markPalette();
  });

  document.getElementById("apply-room").addEventListener("click", function () {
    readRoomFields();
    state.items.forEach(function (item) {
      const size = sizeOf(item);
      item.x = clamp(item.x, 0, Math.max(0, state.width - size.width));
      item.y = clamp(item.y, 0, Math.max(0, state.length - size.depth));
    });
    renderBoard();
  });

  document.getElementById("rotate-item").addEventListener("click", function () {
    const item = state.items.find((entry) => entry.id === state.selectedId);
    if (!item) {
      return;
    }
    item.rotated = !item.rotated;
    const size = sizeOf(item);
    item.x = clamp(item.x, 0, Math.max(0, state.width - size.width));
    item.y = clamp(item.y, 0, Math.max(0, state.length - size.depth));
    renderBoard();
  });

  document.getElementById("delete-item").addEventListener("click", function () {
    state.items = state.items.filter((entry) => entry.id !== state.selectedId);
    state.selectedId = null;
    renderBoard();
  });

  document.getElementById("clear-furniture").addEventListener("click", function () {
    state.items = [];
    state.selectedId = null;
    renderBoard();
  });

  els.flooring.addEventListener("change", renderBoard);
  els.paint.addEventListener("change", renderBoard);
  window.addEventListener("resize", renderBoard);

  function readRoomFields() {
    state.name = els.name.value.trim() || "Room";
    state.width = Math.max(1, Number(els.width.value) || 4);
    state.length = Math.max(1, Number(els.length.value) || 4);
    state.height = Math.max(2, Number(els.height.value) || 2.7);
    state.flooringId = els.flooring.value;
    state.paintId = els.paint.value;
  }

  function writeRoomFields() {
    els.name.value = state.name;
    els.width.value = state.width;
    els.length.value = state.length;
    els.height.value = state.height;
    if (state.flooringId) {
      els.flooring.value = state.flooringId;
    }
    if (state.paintId) {
      els.paint.value = state.paintId;
    }
  }

  async function refreshStats() {
    readRoomFields();
    const furnitureArea = state.items.reduce(function (sum, item) {
      const size = sizeOf(item);
      return sum + size.width * size.depth;
    }, 0);
    const floor = state.width * state.length;
    document.getElementById("stat-floor").textContent = floor.toFixed(2) + " m²";
    document.getElementById("stat-furniture").textContent = furnitureArea.toFixed(2) + " m²";
    document.getElementById("stat-remain").textContent = Math.max(0, floor - furnitureArea).toFixed(2) + " m²";
    els.overlap.hidden = !hasOverlap();

    window.clearTimeout(estimateTimer);
    estimateTimer = window.setTimeout(fetchEstimate, 220);
  }

  async function fetchEstimate() {
    try {
      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          width: state.width,
          length: state.length,
          height: state.height,
          doorCount: 1,
          windowCount: 1,
          wastePercent: 10,
          coats: 2,
          paintCoveragePerLitre: 11,
          tileWidthCm: 60,
          tileLengthCm: 60,
          flooringCoveragePerPack: 2.16
        })
      });
      lastEstimate = await response.json();
      document.getElementById("stat-wall").textContent = lastEstimate.wallArea + " m²";
      document.getElementById("stat-paint").textContent = lastEstimate.paintLitres + " L";
      document.getElementById("stat-waste").textContent = lastEstimate.floorAreaWithWaste + " m²";
      document.getElementById("stat-tiles").textContent = lastEstimate.tileCount + " tiles";
      document.getElementById("stat-packs").textContent = lastEstimate.flooringPacks + " packs";
    } catch {
      lastEstimate = null;
    }
  }

  function furnitureNames() {
    return state.items.map(function (item) {
      return sizeOf(item).name;
    });
  }

  document.getElementById("save-room").addEventListener("click", function () {
    readRoomFields();
    const flooringName = els.flooring.options[els.flooring.selectedIndex].text;
    const paintName = els.paint.options[els.paint.selectedIndex].text;
    BMH.upsertRoom({
      id: state.id,
      name: state.name,
      width: state.width,
      length: state.length,
      height: state.height,
      flooringId: state.flooringId,
      paintId: state.paintId,
      flooringName: flooringName,
      paintName: paintName,
      furniture: state.items,
      furnitureNames: furnitureNames(),
      estimate: lastEstimate
    });
    renderSaved();
    document.getElementById("save-room").textContent = "Saved to this browser";
    setTimeout(function () {
      document.getElementById("save-room").textContent = "Save this room to my plan";
    }, 1600);
  });

  function renderSaved() {
    const plan = BMH.load();
    els.saved.innerHTML = "";
    if (!plan.rooms.length) {
      els.saved.innerHTML = "<p class='muted'>No rooms saved yet.</p>";
      return;
    }
    plan.rooms.forEach(function (room) {
      const row = document.createElement("div");
      row.className = "saved-room";
      row.innerHTML =
        "<span><strong>" + room.name + "</strong><br /><small>" + room.width + " × " + room.length + " m</small></span>";
      const actions = document.createElement("span");
      const openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "btn btn-ghost btn-sm";
      openBtn.textContent = "Edit";
      openBtn.addEventListener("click", function () {
        loadSavedRoom(room);
      });
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn btn-ghost btn-sm";
      delBtn.textContent = "×";
      delBtn.addEventListener("click", function () {
        BMH.removeRoom(room.id);
        renderSaved();
      });
      actions.append(openBtn, delBtn);
      row.appendChild(actions);
      els.saved.appendChild(row);
    });
  }

  function loadSavedRoom(room) {
    state = {
      id: room.id,
      name: room.name,
      width: room.width,
      length: room.length,
      height: room.height,
      flooringId: room.flooringId,
      paintId: room.paintId,
      items: (room.furniture || []).map(function (item) {
        return Object.assign({}, item);
      }),
      selectedId: null
    };
    writeRoomFields();
    renderBoard();
  }

  function fillLayoutRooms(layoutId, selectedRoomId) {
    const house = houses.find((entry) => entry.id === layoutId);
    els.layoutRoom.innerHTML = "<option value=''>Choose a room</option>";
    els.layoutRoom.disabled = !house;
    if (!house) {
      return;
    }
    house.rooms.forEach(function (room) {
      const option = document.createElement("option");
      option.value = room.id;
      option.textContent = room.name + " (" + room.width + " × " + room.length + " m)";
      els.layoutRoom.appendChild(option);
    });
    if (selectedRoomId) {
      els.layoutRoom.value = selectedRoomId;
      applyLayoutRoom(layoutId, selectedRoomId);
    }
  }

  function applyLayoutRoom(layoutId, roomId) {
    const house = houses.find((entry) => entry.id === layoutId);
    if (!house) {
      return;
    }
    const room = house.rooms.find((entry) => entry.id === roomId);
    if (!room) {
      return;
    }
    const plan = BMH.load();
    plan.layoutId = house.id;
    plan.layoutName = house.name;
    BMH.save(plan);
    state = newRoomState();
    state.name = room.name;
    state.width = room.width;
    state.length = room.length;
    state.height = room.height || 2.7;
    writeRoomFields();
    renderBoard();
  }

  els.layout.addEventListener("change", function () {
    fillLayoutRooms(els.layout.value);
  });
  els.layoutRoom.addEventListener("change", function () {
    applyLayoutRoom(els.layout.value, els.layoutRoom.value);
  });

  const params = new URLSearchParams(window.location.search);
  const layoutParam = params.get("layout");
  const roomParam = params.get("room");
  if (layoutParam) {
    els.layout.value = layoutParam;
    fillLayoutRooms(layoutParam, roomParam);
  }

  markPalette();
  writeRoomFields();
  renderBoard();
  renderSaved();
})();
