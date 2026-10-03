# 🎓 Project Presentation & Viva Guide

Use this guide for presenting the **Path Finder Visualizer** to your professor, examiner, or project evaluator.

---

## 📋 3-Minute Presentation Script

### Step 1: Project Overview (30 Seconds)
> *"Respected Professor, today I am presenting **Path Finder Visualizer**, an interactive web application designed to visualize and benchmark 6 classical graph traversal and pathfinding algorithms in real-time. The application is built using modern Web standards, C++17, and JavaScript."*

---

### Step 2: Key Technical Highlights (60 Seconds)
1. **Dual Execution Architecture**:
   - Demonstrates a hybrid execution model where graph computations can run on either a compiled **C++ WebAssembly (WASM)** binary for ultra-low latency or a high-performance **JS Engine Fallback**.
2. **Algorithm Variety**:
   - **Unweighted Algorithms**: Breadth-First Search (BFS), Depth-First Search (DFS), Bidirectional BFS.
   - **Weighted Algorithms**: Dijkstra’s Algorithm, A* Search (with Manhattan & Octile Heuristics).
   - **Greedy Search**: Greedy Best-First Search.
3. **Maze Generation**:
   - Includes **Recursive Backtracker**, **Prim’s Algorithm**, and **Recursive Division** maze generation algorithms, guaranteed to produce solvable paths.

---

### Step 3: Live Demonstration Steps (90 Seconds)

1. **Demonstrate A* Search**:
   - Select **A* Search** from the sidebar/header.
   - Draw a few **Wall** obstacles and **Weight** nodes (cost 5).
   - Click **Visualize Path**. Show how A* explores significantly fewer nodes than BFS/Dijkstra because of the heuristic $f(n) = g(n) + h(n)$.

2. **Demonstrate Algorithm Benchmark**:
   - Click the **Engine Benchmark** button in the sidebar.
   - Show the evaluator the dynamic benchmark table comparing execution times (ms), visited node counts, and peak memory across all 6 algorithms.

3. **Demonstrate Diagonal Search**:
   - Toggle **Allow 8-Way Diagonal** in Search Options.
   - Re-run **A* Search** to show smooth diagonal shortest paths.

4. **Demonstrate Maze Generation**:
   - Select **Prim's Random Maze** from the Maze dropdown and click **Generate Maze**.
   - Click **Visualize** to show how the pathfinding algorithm solves the maze instantly.

---

## 📊 Quick Reference Table for Viva Questions

| Question | Answer / Formula |
| :--- | :--- |
| **Why is A* faster than Dijkstra?** | A* uses a heuristic function $h(n)$ to estimate distance to the goal, directing the search towards the destination instead of expanding in all directions. |
| **What heuristic is used for 4-way movement?** | **Manhattan Distance**: $h(n) = \|r_1 - r_2\| + \|c_1 - c_2\|$ |
| **What heuristic is used for 8-way diagonal movement?** | **Octile Distance**: $h(n) = dx + dy + (\sqrt{2}-2)\min(dx, dy)$ |
| **Is BFS guaranteed to find the shortest path?** | Yes, on **unweighted** graphs. On weighted graphs, **Dijkstra** or **A\*** must be used. |
| **Why is Bidirectional BFS efficient?** | It reduces search space complexity from $O(b^d)$ to $O(b^{d/2})$ by searching from both Start and End simultaneously. |

---

## 📁 Repository Structure Summary

- `index.html`: Web interface structure and controls.
- `css/style.css`: Clean responsive styling and animations.
- `js/app.js`: DOM binding, state management, and visual renderer.
- `js/pathfinder.js`: Graph algorithms engine and WebAssembly bridge.
- `cpp/`: C++ header (`pathfinder.h`), implementation (`pathfinder.cpp`), and Emscripten C-bindings (`bindings.cpp`).
- `docs/`: Academic project reports, presentation PPTs, and documentation.
