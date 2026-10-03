(() => {
  'use strict';

  const ROWS = 27;
  const COLS = 53;

  const SPEEDS = { slow: 25, medium: 8, fast: 2, instant: 0 };

  let grid = [];
  let weights = [];
  let startR, startC, endR, endC;
  let currentAlgo = 'astar';
  let currentTool = 'wall';
  let isMouseDown = false;
  let isVisualizing = false;
  let dragTarget = null;
  let allowDiagonal = false;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const gridEl = $('#grid');

  /* ===== Init ===== */
  async function init() {
    const savedTheme = localStorage.getItem('pfv-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    await PathfinderEngine.initWasm();
    updateEngineBadge();

    resetBoard();
    bindEvents();
    updateStats(null);
  }

  function updateEngineBadge() {
    const badge = $('#engine-badge');
    const text = $('#engine-text');
    if (PathfinderEngine.useWasm) {
      badge.classList.add('wasm');
      text.textContent = '⚡ C++ WASM Engine';
    } else {
      badge.classList.remove('wasm');
      text.textContent = '💻 JS Engine';
    }
  }

  function createEmptyGrid() {
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill('empty'));
    weights = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
    startR = Math.floor(ROWS / 2);
    startC = Math.floor(COLS / 8);
    endR = Math.floor(ROWS / 2);
    endC = COLS - Math.floor(COLS / 8) - 1;
    grid[startR][startC] = 'start';
    grid[endR][endC] = 'end';
  }

  function renderGrid() {
    gridEl.style.gridTemplateColumns = `repeat(${COLS}, 22px)`;
    gridEl.innerHTML = '';

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        applyCellClass(cell, r, c);
        gridEl.appendChild(cell);
      }
    }
  }

  function applyCellClass(el, r, c) {
    el.className = 'cell';
    const type = grid[r][c];
    if (type === 'start') { el.classList.add('start'); el.textContent = 'A'; }
    else if (type === 'end') { el.classList.add('end'); el.textContent = 'B'; }
    else if (type === 'wall') el.classList.add('wall');
    else if (type === 'weight') el.classList.add('weight');
    else if (type === 'visited') el.classList.add('visited');
    else if (type === 'path') el.classList.add('path');
    else el.textContent = '';
  }

  function getCellEl(r, c) {
    return gridEl.children[r * COLS + c];
  }

  function clearVisualization() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === 'visited' || grid[r][c] === 'path') {
          grid[r][c] = weights[r][c] > 1 ? 'weight' : 'empty';
        }
      }
    }
    renderGrid();
  }

  /* ===== Drawing ===== */
  function paintCell(r, c) {
    if (isVisualizing) return;
    if (r === startR && c === startC) return;
    if (r === endR && c === endC) return;

    if (currentTool === 'wall') {
      grid[r][c] = 'wall';
      weights[r][c] = 1;
    } else if (currentTool === 'weight') {
      grid[r][c] = 'weight';
      weights[r][c] = 5;
    } else if (currentTool === 'erase') {
      grid[r][c] = 'empty';
      weights[r][c] = 1;
    }

    applyCellClass(getCellEl(r, c), r, c);
  }

  function moveNode(type, r, c) {
    if (!isWalkable(r, c)) return;
    if (type === 'start') {
      grid[startR][startC] = weights[startR][startC] > 1 ? 'weight' : 'empty';
      startR = r; startC = c;
      grid[r][c] = 'start';
    } else {
      grid[endR][endC] = weights[endR][endC] > 1 ? 'weight' : 'empty';
      endR = r; endC = c;
      grid[r][c] = 'end';
    }
    renderGrid();
  }

  function isWalkable(r, c) {
    return grid[r][c] !== 'wall' && !(r === startR && c === startC) && !(r === endR && c === endC);
  }

  /* ===== Maze Generators ===== */
  function generateSelectedMaze() {
    if (isVisualizing) return;
    const type = $('#maze-select').value;
    clearVisualization();

    if (type === 'backtracker') generateBacktrackerMaze();
    else if (type === 'prims') generatePrimsMaze();
    else if (type === 'division') generateRecursiveDivisionMaze();
    else if (type === 'random') generateRandomObstacles();
  }

  function generateBacktrackerMaze() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] !== 'start' && grid[r][c] !== 'end') {
          grid[r][c] = 'wall';
        }
      }
    }

    const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const stack = [[startR, startC]];
    visited[startR][startC] = true;
    grid[startR][startC] = 'start';

    const dirs = [[-2,0],[2,0],[0,-2],[0,2]];

    while (stack.length) {
      const [r, c] = stack[stack.length - 1];
      const neighbors = [];

      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr > 0 && nr < ROWS - 1 && nc > 0 && nc < COLS - 1 && !visited[nr][nc]) {
          neighbors.push([nr, nc, dr, dc]);
        }
      }

      if (neighbors.length) {
        const [nr, nc, dr, dc] = neighbors[Math.floor(Math.random() * neighbors.length)];
        grid[r + dr / 2][c + dc / 2] = 'empty';
        grid[nr][nc] = 'empty';
        weights[nr][nc] = 1;
        weights[r + dr / 2][c + dc / 2] = 1;
        visited[nr][nc] = true;
        stack.push([nr, nc]);
      } else {
        stack.pop();
      }
    }

    grid[startR][startC] = 'start';
    grid[endR][endC] = 'end';
    ensureStartEndOpen();
    renderGrid();
  }

  function generatePrimsMaze() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] !== 'start' && grid[r][c] !== 'end') grid[r][c] = 'wall';
      }
    }

    const wallsList = [];
    const addWalls = (r, c) => {
      const dirs = [[-2,0],[2,0],[0,-2],[0,2]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr > 0 && nr < ROWS - 1 && nc > 0 && nc < COLS - 1 && grid[nr][nc] === 'wall') {
          wallsList.push([r, c, nr, nc, dr, dc]);
        }
      }
    };

    grid[startR][startC] = 'start';
    addWalls(startR, startC);

    while (wallsList.length) {
      const idx = Math.floor(Math.random() * wallsList.length);
      const [r, c, nr, nc, dr, dc] = wallsList.splice(idx, 1)[0];

      if (grid[nr][nc] === 'wall') {
        grid[r + dr / 2][c + dc / 2] = 'empty';
        grid[nr][nc] = 'empty';
        weights[nr][nc] = 1;
        weights[r + dr / 2][c + dc / 2] = 1;
        addWalls(nr, nc);
      }
    }

    grid[startR][startC] = 'start';
    grid[endR][endC] = 'end';
    ensureStartEndOpen();
    renderGrid();
  }

  function generateRecursiveDivisionMaze() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] !== 'start' && grid[r][c] !== 'end') {
          grid[r][c] = (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) ? 'wall' : 'empty';
        }
      }
    }

    const divide = (r1, r2, c1, c2) => {
      if (r2 - r1 < 2 || c2 - c1 < 2) return;
      const horizontal = (r2 - r1) > (c2 - c1);

      if (horizontal) {
        const wallR = Math.floor((r1 + r2) / 2);
        const passC = Math.floor(Math.random() * (c2 - c1 + 1)) + c1;
        for (let c = c1; c <= c2; c++) {
          if (c !== passC && grid[wallR][c] !== 'start' && grid[wallR][c] !== 'end') {
            grid[wallR][c] = 'wall';
          }
        }
        divide(r1, wallR - 1, c1, c2);
        divide(wallR + 1, r2, c1, c2);
      } else {
        const wallC = Math.floor((c1 + c2) / 2);
        const passR = Math.floor(Math.random() * (r2 - r1 + 1)) + r1;
        for (let r = r1; r <= r2; r++) {
          if (r !== passR && grid[r][wallC] !== 'start' && grid[r][wallC] !== 'end') {
            grid[r][wallC] = 'wall';
          }
        }
        divide(r1, r2, c1, wallC - 1);
        divide(r1, r2, wallC + 1, c2);
      }
    };

    divide(1, ROWS - 2, 1, COLS - 2);
    grid[startR][startC] = 'start';
    grid[endR][endC] = 'end';
    ensureStartEndOpen();
    renderGrid();
  }

  function generateRandomObstacles() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] !== 'start' && grid[r][c] !== 'end') {
          grid[r][c] = Math.random() < 0.22 ? 'wall' : 'empty';
        }
      }
    }
    ensureStartEndOpen();
    renderGrid();
  }

  function ensureStartEndOpen() {
    const adjDirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (const [dr, dc] of adjDirs) {
      const sr = startR + dr, sc = startC + dc;
      if (sr >= 0 && sr < ROWS && sc >= 0 && sc < COLS && grid[sr][sc] !== 'end') {
        grid[sr][sc] = 'empty'; weights[sr][sc] = 1; break;
      }
    }
    for (const [dr, dc] of adjDirs) {
      const er = endR + dr, ec = endC + dc;
      if (er >= 0 && er < ROWS && ec >= 0 && ec < COLS && grid[er][ec] !== 'start') {
        grid[er][ec] = 'empty'; weights[er][ec] = 1; break;
      }
    }
  }

  function sprinkleWeights() {
    if (isVisualizing) return;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === 'empty' && Math.random() < 0.15) {
          grid[r][c] = 'weight';
          weights[r][c] = 5;
        }
      }
    }
    renderGrid();
  }

  function clearWalls() {
    if (isVisualizing) return;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === 'wall' || grid[r][c] === 'weight') {
          grid[r][c] = 'empty';
          weights[r][c] = 1;
        }
      }
    }
    renderGrid();
  }

  function resetBoard() {
    if (isVisualizing) return;
    createEmptyGrid();
    renderGrid();
    updateStats(null);
  }

  /* ===== Visualize & Benchmark ===== */
  async function visualize() {
    if (isVisualizing) return;
    isVisualizing = true;
    setButtonsDisabled(true);
    clearVisualization();

    const state = {
      rows: ROWS, cols: COLS, grid, weights,
      startR, startC, endR, endC, algo: currentAlgo,
      allowDiagonal,
    };

    const result = PathfinderEngine.syncGrid(state);
    const speed = SPEEDS[$('#speed-select').value] || 8;

    for (let i = 0; i < result.visitOrder.length; i += 2) {
      const r = result.visitOrder[i];
      const c = result.visitOrder[i + 1];
      if ((r === startR && c === startC) || (r === endR && c === endC)) continue;
      if (grid[r][c] === 'empty' || grid[r][c] === 'weight') {
        grid[r][c] = 'visited';
        const el = getCellEl(r, c);
        el.classList.add('visited');
        if (currentAlgo === 'bibfs') el.classList.add('frontier');
      }
      if (speed > 0) await sleep(speed);
    }

    if (result.found) {
      for (let i = 0; i < result.path.length; i += 2) {
        const r = result.path[i];
        const c = result.path[i + 1];
        if ((r === startR && c === startC) || (r === endR && c === endC)) continue;
        grid[r][c] = 'path';
        applyCellClass(getCellEl(r, c), r, c);
        if (speed > 0) await sleep(Math.max(1, speed / 2));
      }
    }

    updateStats(result);
    isVisualizing = false;
    setButtonsDisabled(false);
  }

  function runBenchmark() {
    if (isVisualizing) return;
    const algos = ['bfs', 'dfs', 'dijkstra', 'astar', 'greedy', 'bibfs'];
    let html = `<h3>Engine Benchmark Summary</h3><table style="width:100%;border-collapse:collapse;margin-top:10px;">
      <tr style="text-align:left;border-bottom:2px solid var(--border);">
        <th style="padding:6px;">Algorithm</th><th style="padding:6px;">Found</th><th style="padding:6px;">Visited</th><th style="padding:6px;">Path</th><th style="padding:6px;">Time</th>
      </tr>`;

    for (const algo of algos) {
      const state = {
        rows: ROWS, cols: COLS, grid, weights,
        startR, startC, endR, endC, algo, allowDiagonal,
      };
      const res = PathfinderEngine.syncGrid(state);
      const name = PathfinderEngine.META[algo].name;
      html += `<tr style="border-bottom:1px solid var(--border);">
        <td style="padding:6px;font-weight:600;">${name}</td>
        <td style="padding:6px;">${res.found ? '✅ Yes' : '❌ No'}</td>
        <td style="padding:6px;">${res.visitedCount}</td>
        <td style="padding:6px;">${res.pathLength}</td>
        <td style="padding:6px;font-family:monospace;">${res.executionMs.toFixed(2)} ms</td>
      </tr>`;
    }
    html += `</table>`;
    showModal('Engine Benchmark Results', html);
  }

  function updateStats(result) {
    const meta = PathfinderEngine.META[currentAlgo];
    $('#stat-algo').textContent = meta.name;
    $('#stat-complexity').textContent = meta.complexity;

    if (!result) {
      $('#stat-visited').textContent = '0';
      $('#stat-path').textContent = '—';
      $('#stat-time').textContent = '0 ms';
      $('#stat-memory').textContent = '0 nodes';
      return;
    }

    $('#stat-visited').textContent = result.visitedCount;
    $('#stat-path').textContent = result.found ? `${result.pathLength} steps` : '—';
    $('#stat-time').textContent = `${result.executionMs.toFixed(1)} ms`;
    $('#stat-memory').textContent = `${result.peakMemory} nodes`;
  }

  function setButtonsDisabled(disabled) {
    $$('.btn, .tool-btn, .algo-list li').forEach(el => {
      if (disabled) el.style.pointerEvents = 'none';
      else el.style.pointerEvents = '';
    });
    $('#visualize-btn').disabled = disabled;
  }

  function selectAlgo(algo) {
    if (isVisualizing) return;
    currentAlgo = algo;
    $$('.algo-list li').forEach(li => {
      li.classList.toggle('active', li.dataset.algo === algo);
    });
    $('#algo-select').value = algo;
    updateStats(null);
  }

  function showModal(title, html) {
    $('#modal-title').textContent = title;
    $('#modal-body').innerHTML = html;
    $('#modal-backdrop').classList.add('active');
  }

  function closeModal() {
    $('#modal-backdrop').classList.remove('active');
  }

  function showInfoModal() {
    const meta = PathfinderEngine.META[currentAlgo];
    const html = `
      <h3>${meta.name}</h3>
      <p><strong>Complexity:</strong> <code>${meta.complexity}</code></p>
      <p><strong>Mathematical Concept:</strong> ${meta.formula}</p>
      <hr style="margin:12px 0;border:0;border-top:1px solid var(--border);" />
      <h3>Key Properties & Features</h3>
      <ul>
        <li><strong>Weighted Support:</strong> ${currentAlgo === 'dijkstra' || currentAlgo === 'astar' ? 'Yes (Accounts for terrain weights)' : 'No (Treats all edges equally)'}</li>
        <li><strong>Optimality:</strong> ${currentAlgo === 'bfs' || currentAlgo === 'dijkstra' || currentAlgo === 'astar' ? 'Guaranteed shortest path' : 'Heuristic search / Suboptimal'}</li>
        <li><strong>Diagonal Movement:</strong> ${allowDiagonal ? 'Enabled (8-Way)' : 'Disabled (4-Way)'}</li>
        <li><strong>Active Engine:</strong> ${PathfinderEngine.useWasm ? 'C++ WebAssembly Engine (O3 compiled)' : 'JavaScript Fallback Engine'}</li>
      </ul>
    `;
    showModal(`Algorithm Guide: ${meta.name}`, html);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ===== Events ===== */
  function bindEvents() {
    gridEl.addEventListener('mousedown', (e) => {
      if (isVisualizing) return;
      isMouseDown = true;
      const cell = e.target.closest('.cell');
      if (!cell) return;
      const r = +cell.dataset.r, c = +cell.dataset.c;

      if (cell.classList.contains('start')) dragTarget = 'start';
      else if (cell.classList.contains('end')) dragTarget = 'end';
      else paintCell(r, c);
    });

    gridEl.addEventListener('mousemove', (e) => {
      const cell = e.target.closest('.cell');
      if (cell) {
        const r = +cell.dataset.r, c = +cell.dataset.c;
        const type = grid[r][c].toUpperCase();
        const cost = weights[r][c];
        const dist = Math.abs(r - endR) + Math.abs(c - endC);
        $('#inspector').textContent = `Cell (${r}, ${c}) | Type: ${type} | Cost: ${cost} | Manhattan h(n): ${dist}`;
      }

      if (!isMouseDown || isVisualizing) return;
      if (!cell) return;
      const r = +cell.dataset.r, c = +cell.dataset.c;

      if (dragTarget) moveNode(dragTarget, r, c);
      else paintCell(r, c);
    });

    document.addEventListener('mouseup', () => {
      isMouseDown = false;
      dragTarget = null;
    });

    gridEl.addEventListener('contextmenu', (e) => e.preventDefault());

    $$('.algo-list li').forEach(li => {
      li.addEventListener('click', () => selectAlgo(li.dataset.algo));
    });

    $('#algo-select').addEventListener('change', (e) => selectAlgo(e.target.value));

    $('#diagonal-toggle').addEventListener('change', (e) => {
      allowDiagonal = e.target.checked;
    });

    $$('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (isVisualizing) return;
        $$('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.dataset.tool;
      });
    });

    $('#visualize-btn').addEventListener('click', visualize);
    $('#maze-btn').addEventListener('click', generateSelectedMaze);
    $('#benchmark-btn').addEventListener('click', runBenchmark);
    $('#sprinkle-btn').addEventListener('click', sprinkleWeights);
    $('#clear-walls-btn').addEventListener('click', clearWalls);
    $('#reset-btn').addEventListener('click', resetBoard);

    $('#info-btn').addEventListener('click', showInfoModal);
    $('#modal-close').addEventListener('click', closeModal);
    $('#modal-backdrop').addEventListener('click', (e) => {
      if (e.target.id === 'modal-backdrop') closeModal();
    });

    $('#theme-toggle').addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('pfv-theme', next);
    });

    $('#refresh-btn').addEventListener('click', resetBoard);

    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
      switch (e.code) {
        case 'Space': e.preventDefault(); visualize(); break;
        case 'KeyM': generateSelectedMaze(); break;
        case 'KeyC': clearWalls(); break;
        case 'KeyR': resetBoard(); break;
        case 'KeyD': $('#theme-toggle').click(); break;
        case 'KeyI': showInfoModal(); break;
      }
    });
  }

  init();
})();
