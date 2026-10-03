# 🚀 Path Finding Visualizer (C++ & WebAssembly Engine)

A high-performance interactive Graph Traversal and Pathfinding Visualizer built with C++17, WebAssembly (Emscripten), JavaScript, and Vanilla CSS. Inspired by Google Maps routing algorithms, this application allows real-time visualization and benchmarking of classical search algorithms on grid graphs.

---

## 🌟 Key Features

1. **Dual Computation Engine**:
   - **C++ WebAssembly (WASM) Engine**: Ultra-fast compiled binary execution via Emscripten for microsecond performance.
   - **High-Performance JS Engine**: Automatic zero-dependency fallback for universal browser compatibility.
2. **Comprehensive Graph Search Algorithms**:
   - **Breadth-First Search (BFS)** ($O(V + E)$) — Unweighted shortest path.
   - **Depth-First Search (DFS)** ($O(V + E)$) — Branch exploration via LIFO stack.
   - **Dijkstra's Algorithm** ($O(E \log V)$) — Optimal path finding for weighted graphs.
   - **A* Search** ($O(E \log V)$) — Heuristic-guided optimal search ($f(n) = g(n) + h(n)$).
   - **Greedy Best-First Search** ($O(E \log V)$) — Heuristic-driven greedy search towards destination.
   - **Bidirectional BFS** ($O(b^{d/2})$) — Simultaneous dual-frontier search meeting in the middle.
3. **Interactive Features**:
   - **8-Way Diagonal Search Toggle**: Euclidean and Octile heuristic support.
   - **Multiple Maze Algorithms**: Recursive Backtracker, Prim's Random Maze, Recursive Division, Random Obstacles.
   - **Cell Inspector**: Real-time hover display showing node coordinates $(r, c)$, cell type, terrain weights, and Manhattan distances.
   - **Engine Benchmark Suite**: Live comparison modal benchmarking execution time, visited node count, and peak memory across all algorithms.
   - **Dark & Light Mode Themes**: Modern UI styled with glassmorphism and subtle animations.

---

## 📁 Project Architecture

```
PFV/
├── index.html                   # Application User Interface
├── build.bat                    # Emscripten WASM build script (Windows)
├── build.sh                     # Emscripten WASM build script (Linux/macOS)
├── cpp/                         # Core C++ Algorithm Engine
│   ├── pathfinder.h             # C++ Pathfinder Header & Struct Definitions
│   ├── pathfinder.cpp           # Pathfinding Algorithms Implementation
│   └── bindings.cpp             # C++ C-ABI / Emscripten Export Bindings
├── css/                         # CSS Styling & Glassmorphism Design
│   └── style.css
├── js/                          # Application & Engine Logic
│   ├── pathfinder.js            # WASM Integration & JS Engine Fallback
│   └── app.js                   # DOM Interaction, Visualization & Event Loop
└── docs/                        # Project Documentation & Reports
    ├── Chirag_Ishan_report_file.pptx
    ├── Ishanwaliapresentation1.pptx
    ├── Path_Finding_Visualizer_Report.docx
    ├── Path_Finding_Visualizer_Report_LPU.docx
    └── Report file format CSE343 (Core) CSE443 (Domain).doc
```

---

## ⚙️ Building C++ WebAssembly Engine

To compile the native C++ engine into WebAssembly:

1. **Install Emscripten SDK**:
   ```bash
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk && ./emsdk install latest && ./emsdk activate latest
   source ./emsdk_env.sh
   ```
2. **Run Build Script**:
   - **Windows**: `build.bat`
   - **Linux / macOS**: `./build.sh`

The compiled output will be generated into `wasm/pathfinder.js` and `wasm/pathfinder.wasm`.

---

## 🏃 Running Locally

Serve the directory using any HTTP server:

```bash
# Using Python
python -m http.server 8000

# Using Node / npx
npx serve .
```

Open [`http://localhost:8000`](http://localhost:8000) in your web browser.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :---: | :--- |
| <kbd>Space</kbd> | Start Visualization |
| <kbd>M</kbd> | Generate Selected Maze |
| <kbd>C</kbd> | Clear Walls & Weights |
| <kbd>R</kbd> | Reset Entire Board |
| <kbd>D</kbd> | Toggle Light / Dark Theme |
| <kbd>I</kbd> | View Algorithm Information & Math |

---

## 📜 License

Academic Open Source — Built for CSE Capstone & Computer Science Research.
