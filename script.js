const canvas = document.getElementById("sandbox");
const ctx = canvas.getContext("2d");
const planetSelect = document.getElementById("planet-select");
const elementPalette = document.getElementById("element-palette");
const planetDescription = document.getElementById("planet-description");
const resetBtn = document.getElementById("reset-btn");
const brushSizeInput = document.getElementById("brush-size");
const brushDensityInput = document.getElementById("brush-density");
const pauseBtn = document.getElementById("pause-btn");
const stepBtn = document.getElementById("step-btn");
const mobilePanelToggle = document.getElementById("mobile-panel-toggle");
const mobilePanelClose = document.getElementById("mobile-panel-close");
const mobileOverlay = document.getElementById("mobile-overlay");
const mobileBreakpoint = window.matchMedia("(max-width: 600px)");

function updateMobileToggleLabel() {
  if (!mobilePanelToggle) return;
  const isOpen = document.body.classList.contains("mobile-panel-open");
  mobilePanelToggle.textContent = isOpen
    ? "Steuerung verbergen"
    : "Steuerung anzeigen";
  mobilePanelToggle.setAttribute("aria-expanded", isOpen);
}

function setMobilePanel(open) {
  if (!mobilePanelToggle) return;
  document.body.classList.toggle("mobile-panel-open", open);
  updateMobileToggleLabel();
}

if (mobilePanelToggle) {
  mobilePanelToggle.addEventListener("click", () => {
    const shouldOpen = !document.body.classList.contains("mobile-panel-open");
    setMobilePanel(shouldOpen);
  });
}

if (mobilePanelClose) {
  mobilePanelClose.addEventListener("click", () => setMobilePanel(false));
}

if (mobileOverlay) {
  mobileOverlay.addEventListener("click", () => setMobilePanel(false));
}

function handleMobileBreakpoint(event) {
  if (!mobilePanelToggle) return;
  if (!event.matches) {
    document.body.classList.remove("mobile-panel-open");
  }
  updateMobileToggleLabel();
}

if (mobileBreakpoint?.addEventListener) {
  mobileBreakpoint.addEventListener("change", handleMobileBreakpoint);
} else if (mobileBreakpoint?.addListener) {
  mobileBreakpoint.addListener(handleMobileBreakpoint);
}

updateMobileToggleLabel();

const CELL_SIZE = 10;
const GRID_WIDTH = canvas.width / CELL_SIZE;
const GRID_HEIGHT = canvas.height / CELL_SIZE;

const TYPES = {
  EMPTY: "empty",
  SAND: "sand",
  WATER: "water",
  STONE: "stone",
  LAVA: "lava",
  STEAM: "steam",
  FIRE: "fire",
  SMOKE: "smoke",
  WOOD: "wood",
  PLANT: "plant",
  METAL: "metal",
  ALLOY: "alloy",
  GLASS: "glass",
  HUMAN: "human",
  ALIEN: "alien",
  CRYSTAL: "crystal",
  HOUSE_HUMAN: "house_human",
  HOUSE_ALIEN: "house_alien",
};

const ELEMENTS = [
  { id: TYPES.SAND, name: "Sand", color: "#c49b54" },
  { id: TYPES.WATER, name: "Wasser", color: "#46a5ff" },
  { id: TYPES.WOOD, name: "Holz", color: "#7b5132" },
  { id: TYPES.PLANT, name: "Pflanze", color: "#41b66f" },
  { id: TYPES.FIRE, name: "Feuer", color: "#ff6b2d" },
  { id: TYPES.LAVA, name: "Lava", color: "#ff3b1f" },
  { id: TYPES.METAL, name: "Metall", color: "#aeb5c6" },
  { id: TYPES.STONE, name: "Stein", color: "#8f9399" },
  { id: TYPES.CRYSTAL, name: "Kristall", color: "#a25cff" },
  { id: TYPES.HUMAN, name: "Mensch", color: "#f5d7b7" },
  { id: TYPES.ALIEN, name: "Alien", color: "#63ff96" },
  { id: TYPES.SMOKE, name: "Rauch", color: "#55585f" },
  { id: TYPES.STEAM, name: "Dampf", color: "#b3d7ff" },
  { id: TYPES.GLASS, name: "Glas", color: "#8ad3ff" },
  { id: TYPES.ALLOY, name: "Legierung", color: "#e1c16d" },
];

const PLANETS = [
  {
    id: "terra",
    name: "Terra",
    description:
      "Der klassische Heimatplanet der Menschen. Ausgewogene Mischung aus Wasser, Wald und fruchtbarem Boden.",
    skyColor: "#1b2a5d",
    baseFill: () => {
      for (let y = GRID_HEIGHT - 15; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          setCell(x, y, createCell(TYPES.SAND));
        }
      }
      scatter(TYPES.WATER, 450);
      scatter(TYPES.WOOD, 260);
      scatter(TYPES.PLANT, 160);
      scatter(TYPES.HUMAN, 10);
    },
  },
  {
    id: "pyros",
    name: "Pyros",
    description:
      "Ein Vulkanplanet voller Lava. Menschen wagen sich selten hierher, aber Metall und Legierungen sind reichlich vorhanden.",
    skyColor: "#581a1a",
    baseFill: () => {
      for (let y = GRID_HEIGHT - 12; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          setCell(x, y, createCell(TYPES.STONE));
        }
      }
      scatter(TYPES.LAVA, 260);
      scatter(TYPES.METAL, 200);
      scatter(TYPES.FIRE, 80);
      scatter(TYPES.HUMAN, 6);
    },
  },
  {
    id: "aquarea",
    name: "Aquarea",
    description:
      "Ein Wasserplanet mit schwebenden Inseln. Perfekt für Pflanzenexperimente und Dampfmaschinen.",
    skyColor: "#14445e",
    baseFill: () => {
      scatter(TYPES.WATER, 1100);
      for (let x = 10; x < GRID_WIDTH; x += 25) {
        const islandY = Math.floor(Math.random() * 15) + 15;
        for (let y = islandY; y < islandY + 5; y++) {
          for (let i = -4; i <= 4; i++) {
            if (x + i >= 0 && x + i < GRID_WIDTH) {
              setCell(x + i, y, createCell(TYPES.SAND));
            }
          }
        }
      }
      scatter(TYPES.PLANT, 220);
      scatter(TYPES.HUMAN, 8);
      scatter(TYPES.METAL, 120);
    },
  },
  {
    id: "xylon",
    name: "Xylon",
    description:
      "Ein fremder Waldplanet, bewohnt von Aliens, die schimmernde Biokuppeln errichten.",
    skyColor: "#1a3b28",
    baseFill: () => {
      for (let y = GRID_HEIGHT - 20; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
          setCell(x, y, createCell(TYPES.PLANT));
        }
      }
      scatter(TYPES.CRYSTAL, 320);
      scatter(TYPES.ALIEN, 14);
    },
  },
];

let grid = new Array(GRID_WIDTH * GRID_HEIGHT).fill(null).map(() => createCell(TYPES.EMPTY));
let buffer = grid.map((cell) => ({ ...cell }));
let activePlanet = PLANETS[0];
let currentElement = TYPES.SAND;
let isPaused = false;
let stepOnce = false;

function createCell(type, data = {}) {
  return { type, data: { ...data } };
}

function index(x, y) {
  return y * GRID_WIDTH + x;
}

function inBounds(x, y) {
  return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

function getCell(x, y) {
  if (!inBounds(x, y)) return null;
  return grid[index(x, y)];
}

function setCell(x, y, cell) {
  if (!inBounds(x, y)) return;
  grid[index(x, y)] = cell;
}

function swapCells(ax, ay, bx, by) {
  const aIdx = index(ax, ay);
  const bIdx = index(bx, by);
  const temp = grid[aIdx];
  grid[aIdx] = grid[bIdx];
  grid[bIdx] = temp;
}

function isEmpty(x, y) {
  const cell = getCell(x, y);
  return !cell || cell.type === TYPES.EMPTY;
}

function scatter(type, amount) {
  for (let i = 0; i < amount; i++) {
    const x = Math.floor(Math.random() * GRID_WIDTH);
    const y = Math.floor(Math.random() * GRID_HEIGHT);
    if (isEmpty(x, y)) {
      setCell(x, y, createCell(type));
    }
  }
}

function cloneGrid(target, source) {
  for (let i = 0; i < source.length; i++) {
    const cell = source[i];
    target[i] = { type: cell.type, data: { ...cell.data } };
  }
}

function resetWorld() {
  grid = new Array(GRID_WIDTH * GRID_HEIGHT).fill(null).map(() => createCell(TYPES.EMPTY));
  buffer = grid.map((cell) => ({ ...cell }));
  activePlanet.baseFill();
  planetDescription.innerHTML = `<strong>${activePlanet.name}:</strong> ${activePlanet.description}`;
  canvas.style.background = activePlanet.skyColor;
}

function setupUI() {
  PLANETS.forEach((planet) => {
    const option = document.createElement("option");
    option.value = planet.id;
    option.textContent = planet.name;
    planetSelect.appendChild(option);
  });

  ELEMENTS.forEach((element) => {
    const button = document.createElement("button");
    button.className = "element-button";
    button.innerHTML = `<span class="swatch" style="background:${element.color}"></span>${element.name}`;
    button.addEventListener("click", () => {
      currentElement = element.id;
      document.querySelectorAll(".element-button").forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
    });
    if (element.id === currentElement) button.classList.add("active");
    elementPalette.appendChild(button);
  });

  planetSelect.addEventListener("change", (event) => {
    const chosen = PLANETS.find((p) => p.id === event.target.value);
    if (chosen) {
      activePlanet = chosen;
      resetWorld();
    }
  });

  resetBtn.addEventListener("click", resetWorld);

  pauseBtn.addEventListener("click", () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "▶ Weiter" : "⏸ Pause";
  });

  stepBtn.addEventListener("click", () => {
    if (isPaused) {
      stepOnce = true;
    }
  });
}

function randomChoice(...choices) {
  return choices[Math.floor(Math.random() * choices.length)];
}

function tryMove(x, y, dx, dy) {
  const nx = x + dx;
  const ny = y + dy;
  if (!inBounds(nx, ny)) return false;
  const target = getCell(nx, ny);
  if (target.type === TYPES.EMPTY || target.type === TYPES.STEAM || target.type === TYPES.SMOKE) {
    swapCells(x, y, nx, ny);
    return true;
  }
  return false;
}

function updateSand(x, y) {
  if (tryMove(x, y, 0, 1)) return;
  const direction = Math.random() < 0.5 ? -1 : 1;
  if (tryMove(x, y, direction, 1)) return;
  tryMove(x, y, -direction, 1);
}

function updateWater(x, y) {
  if (tryMove(x, y, 0, 1)) return;
  const dir = Math.random() < 0.5 ? -1 : 1;
  if (tryMove(x, y, dir, 0)) return;
  tryMove(x, y, -dir, 0);
}

function updateLava(x, y, cell) {
  cell.data.life = (cell.data.life || 80) - 1;
  if (cell.data.life <= 0) {
    setCell(x, y, createCell(TYPES.STONE));
    return;
  }
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny) || (dx === 0 && dy === 0)) continue;
      const neighbor = getCell(nx, ny);
      if (neighbor.type === TYPES.WOOD || neighbor.type === TYPES.PLANT) {
        setCell(nx, ny, createCell(TYPES.FIRE, { life: 20 }));
      }
    }
  }
  if (tryMove(x, y, 0, 1)) return;
  if (tryMove(x, y, Math.random() < 0.5 ? -1 : 1, 0)) return;
}

function updateFire(x, y, cell) {
  cell.data.life = (cell.data.life || 25) - 1;
  if (cell.data.life <= 0) {
    setCell(x, y, createCell(TYPES.SMOKE, { life: 20 }));
    return;
  }
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      const neighbor = getCell(nx, ny);
      if (!neighbor) continue;
      if (neighbor.type === TYPES.WOOD || neighbor.type === TYPES.PLANT) {
        setCell(nx, ny, createCell(TYPES.FIRE, { life: 20 }));
      }
      if (neighbor.type === TYPES.HUMAN || neighbor.type === TYPES.ALIEN) {
        setCell(nx, ny, createCell(TYPES.SMOKE, { life: 10 }));
      }
    }
  }
}

function updateSmoke(x, y, cell) {
  cell.data.life = (cell.data.life || 18) - 1;
  if (cell.data.life <= 0) {
    setCell(x, y, createCell(TYPES.EMPTY));
    return;
  }
  if (!tryMove(x, y, 0, -1)) {
    tryMove(x, y, Math.random() < 0.5 ? -1 : 1, -1);
  }
}

function updateSteam(x, y, cell) {
  cell.data.life = (cell.data.life || 40) - 1;
  if (cell.data.life <= 0) {
    setCell(x, y, createCell(TYPES.WATER));
    return;
  }
  if (!tryMove(x, y, 0, -1)) {
    tryMove(x, y, Math.random() < 0.5 ? -1 : 1, 0);
  }
}

function updatePlant(x, y, cell) {
  cell.data.grow = (cell.data.grow || 0) + 1;
  if (cell.data.grow > 30) {
    const dirs = [
      [0, -1],
      [-1, 0],
      [1, 0],
    ];
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (inBounds(nx, ny) && getCell(nx, ny).type === TYPES.EMPTY) {
        setCell(nx, ny, createCell(TYPES.PLANT));
        cell.data.grow = 0;
        break;
      }
    }
  }
}

function updateHuman(x, y, cell) {
  const data = cell.data;
  data.dir = data.dir ?? (Math.random() < 0.5 ? -1 : 1);
  data.wood = data.wood ?? 0;
  data.taskCooldown = Math.max((data.taskCooldown || 0) - 1, 0);
  data.buildCooldown = Math.max((data.buildCooldown || 0) - 1, 0);

  if (tryMove(x, y, 0, 1)) return;

  const target = locateResource(x, y, TYPES.WOOD, 8);
  if (target && data.taskCooldown === 0) {
    data.dir = Math.sign(target.x - x) || data.dir;
  }

  if (!tryMove(x, y, data.dir, 0)) {
    data.dir *= -1;
  }

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny)) continue;
      const neighbor = getCell(nx, ny);
      if (neighbor.type === TYPES.WOOD && data.wood < 8) {
        setCell(nx, ny, createCell(TYPES.EMPTY));
        data.wood += 1;
        data.taskCooldown = 30;
      }
      if (neighbor.type === TYPES.PLANT && Math.random() < 0.05) {
        setCell(nx, ny, createCell(TYPES.WOOD));
      }
    }
  }

  if (data.wood >= 6 && data.buildCooldown === 0) {
    const spot = findBuildSpot(x, y, 3, 3);
    if (spot) {
      buildHumanHouse(spot.x, spot.y);
      data.wood -= 6;
      data.buildCooldown = 160;
    }
  }
}

function updateAlien(x, y, cell) {
  const data = cell.data;
  data.dir = data.dir ?? (Math.random() < 0.5 ? -1 : 1);
  data.crystals = data.crystals ?? 0;
  data.buildCooldown = Math.max((data.buildCooldown || 0) - 1, 0);

  if (tryMove(x, y, 0, 1)) return;

  const target = locateResource(x, y, TYPES.CRYSTAL, 10);
  if (target) {
    data.dir = Math.sign(target.x - x) || data.dir;
  }

  if (!tryMove(x, y, data.dir, 0)) {
    data.dir *= -1;
  }

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      const neighbor = getCell(nx, ny);
      if (!neighbor) continue;
      if (neighbor.type === TYPES.CRYSTAL) {
        setCell(nx, ny, createCell(TYPES.EMPTY));
        data.crystals += 1;
      }
    }
  }

  if (data.crystals >= 4 && data.buildCooldown === 0) {
    const spot = findBuildSpot(x, y, 4, 4);
    if (spot) {
      buildAlienDome(spot.x, spot.y);
      data.crystals -= 4;
      data.buildCooldown = 180;
    }
  }
}

function locateResource(x, y, type, radius) {
  let closest = null;
  let closestDist = Infinity;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny)) continue;
      const cell = getCell(nx, ny);
      if (cell.type === type) {
        const dist = Math.abs(dx) + Math.abs(dy);
        if (dist < closestDist) {
          closestDist = dist;
          closest = { x: nx, y: ny };
        }
      }
    }
  }
  return closest;
}

function findBuildSpot(x, y, width, height) {
  for (let dy = -height; dy <= height; dy++) {
    for (let dx = -width; dx <= width; dx++) {
      const startX = x + dx;
      const startY = y + dy;
      if (!inBounds(startX, startY)) continue;
      let fits = true;
      for (let yy = 0; yy < height; yy++) {
        for (let xx = 0; xx < width; xx++) {
          const cx = startX + xx;
          const cy = startY + yy;
          if (!inBounds(cx, cy) || getCell(cx, cy).type !== TYPES.EMPTY) {
            fits = false;
            break;
          }
        }
        if (!fits) break;
      }
      if (fits) return { x: startX, y: startY };
    }
  }
  return null;
}

function buildHumanHouse(x, y) {
  const pattern = [
    [TYPES.HOUSE_HUMAN, TYPES.HOUSE_HUMAN, TYPES.HOUSE_HUMAN],
    [TYPES.HOUSE_HUMAN, TYPES.EMPTY, TYPES.HOUSE_HUMAN],
    [TYPES.HOUSE_HUMAN, TYPES.HOUSE_HUMAN, TYPES.HOUSE_HUMAN],
  ];
  applyPattern(x, y, pattern, (type, px, py) => {
    if (type === TYPES.EMPTY) return;
    const door = px === 1 && py === 1;
    const roof = py === 0;
    const cell = createCell(type, { variant: door ? "door" : roof ? "roof" : "wall" });
    setCell(x + px, y + py, cell);
  });
}

function buildAlienDome(x, y) {
  const pattern = [
    [TYPES.EMPTY, TYPES.HOUSE_ALIEN, TYPES.HOUSE_ALIEN, TYPES.EMPTY],
    [TYPES.HOUSE_ALIEN, TYPES.EMPTY, TYPES.EMPTY, TYPES.HOUSE_ALIEN],
    [TYPES.HOUSE_ALIEN, TYPES.HOUSE_ALIEN, TYPES.HOUSE_ALIEN, TYPES.HOUSE_ALIEN],
    [TYPES.EMPTY, TYPES.HOUSE_ALIEN, TYPES.HOUSE_ALIEN, TYPES.EMPTY],
  ];
  applyPattern(x, y, pattern, (type, px, py) => {
    if (type === TYPES.EMPTY) return;
    const variant = py <= 1 ? "glass" : "base";
    setCell(x + px, y + py, createCell(type, { variant }));
  });
}

function applyPattern(x, y, pattern, setter) {
  for (let py = 0; py < pattern.length; py++) {
    for (let px = 0; px < pattern[py].length; px++) {
      setter(pattern[py][px], px, py);
    }
  }
}

function draw() {
  const imageData = ctx.createImageData(GRID_WIDTH, GRID_HEIGHT);
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const cell = getCell(x, y);
      const [r, g, b] = getColor(cell);
      const idx = (y * GRID_WIDTH + x) * 4;
      imageData.data[idx] = r;
      imageData.data[idx + 1] = g;
      imageData.data[idx + 2] = b;
      imageData.data[idx + 3] = 255;
    }
  }
  const offscreen = document.createElement("canvas");
  offscreen.width = GRID_WIDTH;
  offscreen.height = GRID_HEIGHT;
  offscreen.getContext("2d").putImageData(imageData, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
}

function getColor(cell) {
  switch (cell.type) {
    case TYPES.EMPTY:
      return [9, 14, 24];
    case TYPES.SAND:
      return [196, 155, 84];
    case TYPES.WATER:
      return [70, 165, 255];
    case TYPES.STONE:
      return [143, 147, 153];
    case TYPES.METAL:
      return [174, 181, 198];
    case TYPES.ALLOY:
      return [225, 193, 109];
    case TYPES.GLASS:
      return [138, 211, 255];
    case TYPES.LAVA:
      return [255, 59, 31];
    case TYPES.STEAM:
      return [179, 215, 255];
    case TYPES.SMOKE:
      return [85, 88, 95];
    case TYPES.FIRE:
      return [255, 107, 45];
    case TYPES.WOOD:
      return [123, 81, 50];
    case TYPES.PLANT:
      return [65, 182, 111];
    case TYPES.CRYSTAL:
      return [162, 92, 255];
    case TYPES.HUMAN:
      return [245, 215, 183];
    case TYPES.ALIEN:
      return [99, 255, 150];
    case TYPES.HOUSE_HUMAN:
      switch (cell.data.variant) {
        case "roof":
          return [210, 92, 53];
        case "door":
          return [90, 55, 35];
        default:
          return [189, 134, 92];
      }
    case TYPES.HOUSE_ALIEN:
      return cell.data.variant === "glass" ? [120, 205, 255] : [100, 40, 150];
    default:
      return [255, 255, 255];
  }
}

function updateCell(x, y) {
  const cell = getCell(x, y);
  switch (cell.type) {
    case TYPES.SAND:
      updateSand(x, y);
      break;
    case TYPES.WATER:
      updateWater(x, y);
      break;
    case TYPES.LAVA:
      updateLava(x, y, cell);
      break;
    case TYPES.FIRE:
      updateFire(x, y, cell);
      break;
    case TYPES.STEAM:
      updateSteam(x, y, cell);
      break;
    case TYPES.SMOKE:
      updateSmoke(x, y, cell);
      break;
    case TYPES.PLANT:
      updatePlant(x, y, cell);
      break;
    case TYPES.HUMAN:
      updateHuman(x, y, cell);
      break;
    case TYPES.ALIEN:
      updateAlien(x, y, cell);
      break;
    default:
      break;
  }
}

function updateWorld() {
  cloneGrid(buffer, grid);
  for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const cell = buffer[index(x, y)];
      if (cell.type === TYPES.EMPTY) continue;
      if (grid[index(x, y)].type !== cell.type) continue;
      updateCell(x, y);
    }
  }
}

let drawing = false;

function drawElement(evt) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.floor(((evt.clientX || evt.touches?.[0]?.clientX) - rect.left) * scaleX / CELL_SIZE);
  const y = Math.floor(((evt.clientY || evt.touches?.[0]?.clientY) - rect.top) * scaleY / CELL_SIZE);
  const brush = parseInt(brushSizeInput.value, 10);
  const density = parseFloat(brushDensityInput.value);

  for (let dx = -brush; dx <= brush; dx++) {
    for (let dy = -brush; dy <= brush; dy++) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny)) continue;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > brush) continue;
      if (Math.random() > density) continue;
      setCell(nx, ny, createCell(currentElement));
    }
  }
}

canvas.addEventListener("mousedown", (evt) => {
  drawing = true;
  drawElement(evt);
});
canvas.addEventListener("mousemove", (evt) => {
  if (drawing) drawElement(evt);
});
canvas.addEventListener("mouseup", () => (drawing = false));
canvas.addEventListener("mouseleave", () => (drawing = false));
canvas.addEventListener("touchstart", (evt) => {
  drawing = true;
  drawElement(evt);
});
canvas.addEventListener("touchmove", (evt) => {
  evt.preventDefault();
  if (drawing) drawElement(evt);
});
canvas.addEventListener("touchend", () => (drawing = false));

function loop() {
  if (!isPaused || stepOnce) {
    updateWorld();
    stepOnce = false;
  }
  draw();
  requestAnimationFrame(loop);
}

setupUI();
resetWorld();
loop();
