(function (global) {
  const KEY = "buildMyHome.plan.v1";

  function defaultPlan() {
    return {
      version: 1,
      projectName: "My home plan",
      layoutId: null,
      layoutName: null,
      styleId: null,
      styleName: null,
      rooms: [],
      prices: {},
      checklist: {},
      updatedAt: null
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        return defaultPlan();
      }
      return Object.assign(defaultPlan(), JSON.parse(raw));
    } catch {
      return defaultPlan();
    }
  }

  function save(plan) {
    plan.updatedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(plan));
    document.dispatchEvent(new CustomEvent("bmh:plan-changed", { detail: plan }));
    return plan;
  }

  function upsertRoom(room) {
    const plan = load();
    const index = plan.rooms.findIndex((item) => item.id === room.id);
    if (index >= 0) {
      plan.rooms[index] = room;
    } else {
      plan.rooms.push(room);
    }
    return save(plan);
  }

  function removeRoom(id) {
    const plan = load();
    plan.rooms = plan.rooms.filter((item) => item.id !== id);
    return save(plan);
  }

  function download(filename, text, type) {
    const blob = new Blob([text], { type: type || "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function exportJson() {
    download("build-my-home-plan.json", JSON.stringify(load(), null, 2), "application/json");
  }

  async function importFile(file) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data || typeof data !== "object") {
      throw new Error("That file is not a plan.");
    }
    return save(Object.assign(defaultPlan(), data, { version: 1 }));
  }

  function clear() {
    localStorage.removeItem(KEY);
    const plan = defaultPlan();
    document.dispatchEvent(new CustomEvent("bmh:plan-changed", { detail: plan }));
    return plan;
  }

  function newId() {
    if (global.crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  global.BMH = {
    load,
    save,
    upsertRoom,
    removeRoom,
    exportJson,
    importFile,
    clear,
    defaultPlan,
    download,
    newId
  };
})(window);
