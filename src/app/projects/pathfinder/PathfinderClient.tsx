'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import BackButton from '@/components/BackButton/BackButton';
import styles from './pathfinder.module.css';

interface NodeData {
  row: number;
  col: number;
  isStart: boolean;
  isFinish: boolean;
  distance: number;
  distanceToFinish: number;
  isVisited: boolean;
  isWall: boolean;
  previousNode: NodeData | null;
}

export default function PathfinderClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [toastMsg, setToastMsg] = useState({ icon: '', msg: '', show: false });
  
  const gridData = useRef<NodeData[][]>([]);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const ROWS = isMobile ? 25 : 21;
  const COLS = isMobile ? 20 : 45;

  const startNodePos = useRef({ row: Math.floor(ROWS/2), col: Math.floor(COLS/5) });
  const finishNodePos = useRef({ row: Math.floor(ROWS/2), col: Math.floor(COLS*4/5) });

  const interactionState = useRef({
    isDrawing: false,
    isEraseMode: false,
    isMovingStart: false,
    isMovingFinish: false,
    isAnimating: false,
    hasVisualized: false
  });

  const [selectedAlgo, setSelectedAlgo] = useState('dijkstra');

  const showToast = (icon: string, msg: string) => {
    setToastMsg({ icon, msg, show: true });
    setTimeout(() => setToastMsg(prev => ({ ...prev, show: false })), 3000);
  };

  const createInitialGrid = useCallback((r: number, c: number) => {
    startNodePos.current = { row: Math.floor(r/2), col: Math.floor(c/5) };
    finishNodePos.current = { row: Math.floor(r/2), col: Math.floor(c*4/5) };
    const grid: NodeData[][] = [];
    for (let row = 0; row < r; row++) {
      const currentRow: NodeData[] = [];
      for (let col = 0; col < c; col++) {
        currentRow.push({
          row, col,
          isStart: row === startNodePos.current.row && col === startNodePos.current.col,
          isFinish: row === finishNodePos.current.row && col === finishNodePos.current.col,
          distance: Infinity,
          distanceToFinish: 0,
          isVisited: false,
          isWall: false,
          previousNode: null,
        });
      }
      grid.push(currentRow);
    }
    return grid;
  }, []);

  const [renderTrigger, setRenderTrigger] = useState(0);

  useEffect(() => {
    setIsClient(true);
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    const r = mobile ? 25 : 21;
    const c = mobile ? 20 : 45;
    gridData.current = createInitialGrid(r, c);
    setRenderTrigger(prev => prev + 1);

    const handleMouseUp = () => {
      interactionState.current.isDrawing = false;
      interactionState.current.isMovingStart = false;
      interactionState.current.isMovingFinish = false;
      interactionState.current.isEraseMode = false;
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [createInitialGrid]);

  const getNodeEl = (row: number, col: number) => document.getElementById(`node-${row}-${col}`);

  const toggleWall = (row: number, col: number, makeWall: boolean) => {
    const node = gridData.current[row][col];
    if (node.isWall === makeWall) return;
    node.isWall = makeWall;
    const el = getNodeEl(row, col);
    if (el) {
      if (makeWall) el.classList.add(styles.nodeWall);
      else el.classList.remove(styles.nodeWall);
    }
  };

  const changeStartNode = (newRow: number, newCol: number) => {
    const oldR = startNodePos.current.row;
    const oldC = startNodePos.current.col;
    gridData.current[oldR][oldC].isStart = false;
    getNodeEl(oldR, oldC)?.classList.remove(styles.nodeStart);
    
    startNodePos.current = { row: newRow, col: newCol };
    gridData.current[newRow][newCol].isStart = true;
    getNodeEl(newRow, newCol)?.classList.add(styles.nodeStart);
  };

  const changeFinishNode = (newRow: number, newCol: number) => {
    const oldR = finishNodePos.current.row;
    const oldC = finishNodePos.current.col;
    gridData.current[oldR][oldC].isFinish = false;
    getNodeEl(oldR, oldC)?.classList.remove(styles.nodeTarget);
    
    finishNodePos.current = { row: newRow, col: newCol };
    gridData.current[newRow][newCol].isFinish = true;
    getNodeEl(newRow, newCol)?.classList.add(styles.nodeTarget);
  };

  const handleMouseDown = (r: number, c: number) => {
    if (interactionState.current.isAnimating) return;
    const node = gridData.current[r][c];
    if (node.isStart) {
      interactionState.current.isMovingStart = true;
    } else if (node.isFinish) {
      interactionState.current.isMovingFinish = true;
    } else {
      interactionState.current.isDrawing = true;
      interactionState.current.isEraseMode = node.isWall;
      toggleWall(r, c, !interactionState.current.isEraseMode);
    }
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (interactionState.current.isAnimating) return;
    const node = gridData.current[r][c];
    if (interactionState.current.isMovingStart && !node.isFinish && !node.isWall) {
      changeStartNode(r, c);
      if (interactionState.current.hasVisualized) instantVisualize();
    } else if (interactionState.current.isMovingFinish && !node.isStart && !node.isWall) {
      changeFinishNode(r, c);
      if (interactionState.current.hasVisualized) instantVisualize();
    } else if (interactionState.current.isDrawing && !node.isStart && !node.isFinish) {
      toggleWall(r, c, !interactionState.current.isEraseMode);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // e.preventDefault(); // done via passive: false on ref if needed, but react TouchMove is fine
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el && el.id && el.id.startsWith('node-')) {
      const parts = el.id.split('-');
      handleMouseEnter(parseInt(parts[1]), parseInt(parts[2]));
    }
  };

  const clearBoard = () => {
    if (interactionState.current.isAnimating) return;
    interactionState.current.hasVisualized = false;
    
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const n = gridData.current[r][c];
        n.isWall = false;
        n.isVisited = false;
        n.distance = Infinity;
        n.previousNode = null;
        const el = getNodeEl(r, c);
        if (el) {
          el.className = styles.node; // Reset classes
          if (n.isStart) el.classList.add(styles.nodeStart);
          if (n.isFinish) el.classList.add(styles.nodeTarget);
          el.style.backgroundColor = '';
          el.style.animation = '';
        }
      }
    }
  };

  const clearPath = () => {
    if (interactionState.current.isAnimating) return;
    interactionState.current.hasVisualized = false;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const n = gridData.current[r][c];
        n.isVisited = false;
        n.distance = Infinity;
        n.previousNode = null;
        const el = getNodeEl(r, c);
        if (el) {
          el.classList.remove(styles.nodeVisited, styles.nodePath);
          el.style.backgroundColor = '';
          el.style.animation = '';
        }
      }
    }
  };

  // Algorithms
  const getNeighbors = (node: NodeData, grid: NodeData[][]) => {
    const ne: NodeData[] = [];
    const { row: r, col: c } = node;
    if (r > 0) ne.push(grid[r-1][c]);
    if (r < ROWS - 1) ne.push(grid[r+1][c]);
    if (c > 0) ne.push(grid[r][c-1]);
    if (c < COLS - 1) ne.push(grid[r][c+1]);
    return ne.filter(n => !n.isVisited && !n.isWall);
  };

  const getAllNodes = (grid: NodeData[][]) => {
    const nodes: NodeData[] = [];
    for (const r of grid) for (const node of r) nodes.push(node);
    return nodes;
  };

  const dijkstra = (grid: NodeData[][], startNode: NodeData, finishNode: NodeData) => {
    const visitedNodesInOrder: NodeData[] = [];
    startNode.distance = 0;
    const unvisitedNodes = getAllNodes(grid);
    
    while (unvisitedNodes.length) {
      unvisitedNodes.sort((a, b) => a.distance - b.distance);
      const closestNode = unvisitedNodes.shift()!;
      
      if (closestNode.isWall) continue;
      if (closestNode.distance === Infinity) return visitedNodesInOrder;
      
      closestNode.isVisited = true;
      visitedNodesInOrder.push(closestNode);
      
      if (closestNode === finishNode) return visitedNodesInOrder;
      
      const neighbors = getNeighbors(closestNode, grid);
      for (const neighbor of neighbors) {
        neighbor.distance = closestNode.distance + 1;
        neighbor.previousNode = closestNode;
      }
    }
    return visitedNodesInOrder;
  };

  const bfs = (grid: NodeData[][], startNode: NodeData, finishNode: NodeData) => {
    const visitedNodesInOrder: NodeData[] = [];
    const queue = [startNode];
    startNode.isVisited = true;
    while (queue.length) {
      const curr = queue.shift()!;
      visitedNodesInOrder.push(curr);
      if (curr === finishNode) return visitedNodesInOrder;
      
      const neighbors = getNeighbors(curr, grid);
      for (const n of neighbors) {
        n.isVisited = true;
        n.previousNode = curr;
        queue.push(n);
      }
    }
    return visitedNodesInOrder;
  };

  const dfs = (grid: NodeData[][], startNode: NodeData, finishNode: NodeData) => {
    const visitedNodesInOrder: NodeData[] = [];
    const stack = [startNode];
    while (stack.length) {
      const curr = stack.pop()!;
      if (curr.isVisited) continue;
      curr.isVisited = true;
      visitedNodesInOrder.push(curr);
      if (curr === finishNode) return visitedNodesInOrder;
      
      const neighbors = getNeighbors(curr, grid);
      for (const n of neighbors) {
        n.previousNode = curr;
        stack.push(n);
      }
    }
    return visitedNodesInOrder;
  };

  const heuristic = (a: NodeData, b: NodeData) => Math.abs(a.row - b.row) + Math.abs(a.col - b.col);

  const astar = (grid: NodeData[][], startNode: NodeData, finishNode: NodeData) => {
    const visitedNodesInOrder: NodeData[] = [];
    startNode.distance = 0;
    startNode.distanceToFinish = heuristic(startNode, finishNode);
    const openSet = [startNode];
    
    while(openSet.length) {
      openSet.sort((a,b) => (a.distance + a.distanceToFinish) - (b.distance + b.distanceToFinish));
      const curr = openSet.shift()!;
      
      if (curr.isWall) continue;
      curr.isVisited = true;
      visitedNodesInOrder.push(curr);
      if (curr === finishNode) return visitedNodesInOrder;
      
      const neighbors = getNeighbors(curr, grid);
      for (const neighbor of neighbors) {
        if (curr.distance + 1 < neighbor.distance) {
          neighbor.distance = curr.distance + 1;
          neighbor.distanceToFinish = heuristic(neighbor, finishNode);
          neighbor.previousNode = curr;
          if (!openSet.includes(neighbor)) openSet.push(neighbor);
        }
      }
    }
    return visitedNodesInOrder;
  };

  const getNodesInShortestPathOrder = (finishNode: NodeData) => {
    const nodesInShortestPathOrder = [];
    let currentNode: NodeData | null = finishNode;
    while (currentNode !== null) {
      nodesInShortestPathOrder.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    return nodesInShortestPathOrder;
  };

  const visualize = async () => {
    if (interactionState.current.isAnimating) return;
    clearPath();
    interactionState.current.isAnimating = true;
    interactionState.current.hasVisualized = true;

    const grid = gridData.current;
    const startNode = grid[startNodePos.current.row][startNodePos.current.col];
    const finishNode = grid[finishNodePos.current.row][finishNodePos.current.col];
    
    let visitedNodesInOrder: NodeData[] = [];
    if (selectedAlgo === 'dijkstra') visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    else if (selectedAlgo === 'bfs') visitedNodesInOrder = bfs(grid, startNode, finishNode);
    else if (selectedAlgo === 'dfs') visitedNodesInOrder = dfs(grid, startNode, finishNode);
    else if (selectedAlgo === 'astar') visitedNodesInOrder = astar(grid, startNode, finishNode);

    const shortestPath = getNodesInShortestPathOrder(finishNode);
    
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        await new Promise(r => setTimeout(r, 60));
        if (shortestPath.length > 1 && shortestPath[shortestPath.length-1] === finishNode) {
          await animateShortestPath(shortestPath);
          showToast('ri-check-double-line text-emerald-400', `Found path! (${shortestPath.length-1} steps)`);
        } else {
          showToast('ri-error-warning-line text-rose-400', `No path found.`);
        }
        interactionState.current.isAnimating = false;
        return;
      }
      const n = visitedNodesInOrder[i];
      if (!n.isStart && !n.isFinish) {
        getNodeEl(n.row, n.col)?.classList.add(styles.nodeVisited);
      }
      if (i % (isMobile ? 2 : 4) === 0) await new Promise(r => setTimeout(r, 5));
    }
  };

  const animateShortestPath = async (nodesInShortestPathOrder: NodeData[]) => {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      const n = nodesInShortestPathOrder[i];
      if (!n.isStart && !n.isFinish) {
        getNodeEl(n.row, n.col)?.classList.add(styles.nodePath);
      }
      await new Promise(r => setTimeout(r, 20));
    }
  };

  const instantVisualize = () => {
    clearPath();
    const grid = gridData.current;
    const startNode = grid[startNodePos.current.row][startNodePos.current.col];
    const finishNode = grid[finishNodePos.current.row][finishNodePos.current.col];
    
    let visitedNodesInOrder: NodeData[] = [];
    if (selectedAlgo === 'dijkstra') visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    else if (selectedAlgo === 'bfs') visitedNodesInOrder = bfs(grid, startNode, finishNode);
    else if (selectedAlgo === 'dfs') visitedNodesInOrder = dfs(grid, startNode, finishNode);
    else if (selectedAlgo === 'astar') visitedNodesInOrder = astar(grid, startNode, finishNode);

    const shortestPath = getNodesInShortestPathOrder(finishNode);
    
    for (let i = 0; i < visitedNodesInOrder.length; i++) {
      const n = visitedNodesInOrder[i];
      if (!n.isStart && !n.isFinish) {
        const el = getNodeEl(n.row, n.col);
        if (el) {
          el.style.animation = 'none';
          el.style.backgroundColor = 'rgba(6, 182, 212, 0.25)'; // Assuming dark mode always in nextapp 
        }
      }
    }
    
    if (shortestPath.length > 1 && shortestPath[shortestPath.length-1] === finishNode) {
      for (let i = 0; i < shortestPath.length; i++) {
        const n = shortestPath[i];
        if (!n.isStart && !n.isFinish) {
          const el = getNodeEl(n.row, n.col);
          if (el) el.style.backgroundColor = 'rgba(234, 179, 8, 1)';
        }
      }
    }
  };

  const chooseOrientation = (width: number, height: number) => {
    if (width < height) return 'H';
    else if (height < width) return 'V';
    else return Math.random() < 0.5 ? 'H' : 'V';
  };

  const recursiveDivision = async (rowStart: number, rowEnd: number, colStart: number, colEnd: number, orientation: string) => {
    if (rowEnd < rowStart || colEnd < colStart) return;
    
    const horizontal = orientation === 'H';
    
    const possibleRows = [];
    for (let number = rowStart; number <= rowEnd; number += 2) possibleRows.push(number);
    const possibleCols = [];
    for (let number = colStart; number <= colEnd; number += 2) possibleCols.push(number);
    
    const randomRowIndex = Math.floor(Math.random() * possibleRows.length);
    const randomColIndex = Math.floor(Math.random() * possibleCols.length);
    
    const currentRow = possibleRows[randomRowIndex];
    const currentCol = possibleCols[randomColIndex];
    
    const possibleRowPassages = [];
    for (let number = rowStart - 1; number <= rowEnd + 1; number += 2) possibleRowPassages.push(number);
    const possibleColPassages = [];
    for (let number = colStart - 1; number <= colEnd + 1; number += 2) possibleColPassages.push(number);
    
    const randomRowPassageIndex = Math.floor(Math.random() * possibleRowPassages.length);
    const randomColPassageIndex = Math.floor(Math.random() * possibleColPassages.length);
    
    const passageRow = possibleRowPassages[randomRowPassageIndex];
    const passageCol = possibleColPassages[randomColPassageIndex];
    
    if (horizontal) {
      for (let c = colStart - 1; c <= colEnd + 1; c++) {
        if (c !== passageCol && c >= 0 && c < COLS && currentRow >= 0 && currentRow < ROWS) {
          const n = gridData.current[currentRow][c];
          if (!n.isStart && !n.isFinish) {
            toggleWall(currentRow, c, true);
            await new Promise(r => setTimeout(r, 8));
          }
        }
      }
      await recursiveDivision(rowStart, currentRow - 2, colStart, colEnd, chooseOrientation(colEnd - colStart + 1, currentRow - 2 - rowStart + 1));
      await recursiveDivision(currentRow + 2, rowEnd, colStart, colEnd, chooseOrientation(colEnd - colStart + 1, rowEnd - (currentRow + 2) + 1));
    } else {
      for (let r = rowStart - 1; r <= rowEnd + 1; r++) {
        if (r !== passageRow && r >= 0 && r < ROWS && currentCol >= 0 && currentCol < COLS) {
          const n = gridData.current[r][currentCol];
          if (!n.isStart && !n.isFinish) {
            toggleWall(r, currentCol, true);
            await new Promise(r => setTimeout(r, 8));
          }
        }
      }
      await recursiveDivision(rowStart, rowEnd, colStart, currentCol - 2, chooseOrientation(currentCol - 2 - colStart + 1, rowEnd - rowStart + 1));
      await recursiveDivision(rowStart, rowEnd, currentCol + 2, colEnd, chooseOrientation(colEnd - (currentCol + 2) + 1, rowEnd - rowStart + 1));
    }
  };

  const generateMaze = async () => {
    if (interactionState.current.isAnimating) return;
    interactionState.current.isAnimating = true;
    clearBoard();
    
    for (let r=0; r<ROWS; r++) { toggleWall(r,0,true); toggleWall(r,COLS-1,true); }
    for (let c=0; c<COLS; c++) { toggleWall(0,c,true); toggleWall(ROWS-1,c,true); }
    
    await recursiveDivision(1, ROWS-2, 1, COLS-2, chooseOrientation(COLS-2, ROWS-2));
    interactionState.current.isAnimating = false;
    showToast('ri-magic-line text-amber-400', 'Maze Generated!');
  };

  if (!isClient) return <div className="min-h-screen bg-slate-950"></div>;

  return (
    <div className="min-h-screen transition-colors duration-300 pb-10 bg-slate-950 text-slate-100">
      <BackButton />

      {/* TOAST */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${toastMsg.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="px-5 py-2.5 rounded-xl text-sm font-bold shadow-2xl flex items-center gap-2 bg-slate-800 text-slate-100 border border-slate-700">
          <i className={toastMsg.icon}></i> {toastMsg.msg}
        </div>
      </div>

      <div className="pt-20 px-4 max-w-[1200px] mx-auto flex flex-col items-center">
        
        <div className={`text-center mb-8 ${styles.fadeUp}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-4">
            <i className="ri-route-line text-3xl text-white"></i>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-100">Pathfinder</h1>
          <p className="mt-2 text-sm max-w-lg mx-auto text-slate-400">
            Visualise algorithms hunting for the shortest path. Draw your own walls and see the logic unfold in real-time.
          </p>
        </div>

        {/* CONTROLS */}
        <div className={`w-full p-4 sm:p-5 rounded-3xl shadow-xl border mb-8 flex flex-wrap gap-4 items-center justify-between bg-slate-800 border-slate-700/50 ${styles.fadeUp}`}>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
              value={selectedAlgo}
              onChange={e => setSelectedAlgo(e.target.value)}
              className="flex-1 w-full md:w-48 border text-sm font-semibold rounded-xl px-4 py-2.5 outline-none focus:ring-2 ring-indigo-500 cursor-pointer transition-all bg-slate-700 border-slate-600 text-slate-200"
            >
              <option value="dijkstra">Dijkstra's Algorithm</option>
              <option value="astar">A* Search</option>
              <option value="bfs">Breadth-First Search</option>
              <option value="dfs">Depth-First Search</option>
            </select>
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button onClick={visualize} className="flex-1 md:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap">
              <i className="ri-play-fill text-lg"></i> Visualize
            </button>
            <button onClick={generateMaze} className="flex-1 md:flex-none px-5 py-2.5 text-sm font-bold rounded-xl border transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600">
              <i className="ri-grid-line"></i> Maze
            </button>
            <button onClick={clearPath} className="flex-1 md:flex-none px-5 py-2.5 text-sm font-bold rounded-xl border transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600">
              Clear Path
            </button>
            <button onClick={clearBoard} className="flex-1 md:flex-none px-5 py-2.5 text-sm font-bold rounded-xl border transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/30">
              <i className="ri-delete-bin-line"></i> Reset
            </button>
          </div>

        </div>

        {/* LEGEND */}
        <div className={`flex flex-wrap items-center justify-center gap-5 sm:gap-8 mb-6 text-xs font-semibold text-slate-400 ${styles.fadeUp}`}>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center"><i className="ri-arrow-up-line text-[10px] text-white font-bold"></i></div> Start Node</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div> Target Node</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-300"></div> Wall Node</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-cyan-200 shadow-[inset_0_0_0_2px_rgba(6,182,212,0.4)] rounded"></div> Visited Node</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 rounded"></div> Shortest Path</div>
        </div>

        {/* GRID */}
        <div className={`p-2 sm:p-4 rounded-3xl shadow-2xl border overflow-x-auto w-full flex justify-center bg-slate-800 border-slate-700/50 ${styles.fadeUp}`}>
          <div 
            ref={gridContainerRef}
            className={`${styles.gridBoard} rounded-2xl overflow-hidden cursor-crosshair`}
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
            onTouchMove={handleTouchMove}
          >
            {gridData.current.map((row, rIdx) => 
              row.map((node, cIdx) => (
                <div 
                  key={`${rIdx}-${cIdx}`}
                  id={`node-${rIdx}-${cIdx}`}
                  className={`${styles.node} ${node.isStart ? styles.nodeStart : ''} ${node.isFinish ? styles.nodeTarget : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); handleMouseDown(rIdx, cIdx); }}
                  onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                  onTouchStart={(e) => { e.preventDefault(); handleMouseDown(rIdx, cIdx); }}
                />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
