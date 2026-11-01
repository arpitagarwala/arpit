export const PUZZLES = [
  {
    "slug": "keen",
    "title": "Keen",
    "tagline": "Arithmetic cages",
    "description": "Use +, −, × and ÷ clues to complete a number grid.",
    "skill": "Arithmetic",
    "icon": "ri-calculator-line",
    "rules": "Fill each row and column with 1 to the grid size, without repeats. The numbers in each outlined cage must produce its target using the shown operation.",
    "controls": "Select a cell, then use the number pad or keyboard. Right-click a cell for pencil marks."
  },
  {
    "slug": "unequal",
    "title": "Unequal",
    "tagline": "Greater than. Less than.",
    "description": "Place numbers using comparisons and elimination.",
    "skill": "Arithmetic",
    "icon": "ri-arrow-up-down-line",
    "rules": "Fill each row and column with 1 to the grid size without repeats, and satisfy every greater-than or less-than sign.",
    "controls": "Select a cell and enter a digit. Right-click to add pencil marks."
  },
  {
    "slug": "towers",
    "title": "Towers",
    "tagline": "Think in heights",
    "description": "Infer a number grid from the visible skyline.",
    "skill": "Arithmetic",
    "icon": "ri-building-2-line",
    "rules": "Place each height once in every row and column. A clue counts the towers visible from that edge: a taller tower hides shorter ones behind it.",
    "controls": "Select a cell, then enter a number. Start with edge clues of 1 and the full grid size."
  },
  {
    "slug": "bridges",
    "title": "Bridges",
    "tagline": "Connect the islands",
    "description": "Build one connected network without crossing bridges.",
    "skill": "Deduction",
    "icon": "ri-route-line",
    "rules": "Join all islands in one network. Each number is the total bridges touching that island. At most two bridges can join a pair, and bridges cannot cross.",
    "controls": "Drag horizontally or vertically between islands. Click an existing connection to cycle the bridge count."
  },
  {
    "slug": "lightup",
    "title": "Light Up",
    "tagline": "A little illumination",
    "description": "Place bulbs using visibility and numbered clues.",
    "skill": "Deduction",
    "icon": "ri-lightbulb-line",
    "rules": "Light every white square. Bulbs shine along rows and columns until a wall, and must not shine on one another. Numbers specify adjacent bulbs.",
    "controls": "Click a square to place a bulb; right-click to mark a square that cannot contain one."
  },
  {
    "slug": "pattern",
    "title": "Pattern",
    "tagline": "Make the hidden picture",
    "description": "Read run-length clues and uncover a pixel pattern.",
    "skill": "Patterns",
    "icon": "ri-grid-line",
    "rules": "Numbers beside each row and column give the lengths of consecutive filled runs, in order. Leave at least one empty square between runs.",
    "controls": "Left-click or drag to fill cells; right-click or drag to mark empty cells."
  },
  {
    "slug": "net",
    "title": "Net",
    "tagline": "Reconnect the signal",
    "description": "Rotate tiles until every node belongs to one network.",
    "skill": "Spatial",
    "icon": "ri-share-line",
    "rules": "Rotate the tiles to connect every endpoint into one network, with no loops or dangling connections.",
    "controls": "Left-click rotates a tile one way; right-click rotates it the other way."
  },
  {
    "slug": "loopy",
    "title": "Loopy",
    "tagline": "One unbroken loop",
    "description": "Deduce which edges belong to a single closed loop.",
    "skill": "Deduction",
    "icon": "ri-shape-line",
    "rules": "Draw exactly one closed loop without branches. Each numbered cell must have exactly that many of its surrounding edges in the loop.",
    "controls": "Click an edge to include it. Right-click to rule an edge out."
  },
  {
    "slug": "tents",
    "title": "Tents",
    "tagline": "A place for every tree",
    "description": "Place tents with row counts and adjacency rules.",
    "skill": "Deduction",
    "icon": "ri-home-8-line",
    "rules": "Pair every tree with one horizontally or vertically adjacent tent. Tents cannot touch, even diagonally. Match the row and column totals.",
    "controls": "Click to place a tent; right-click to mark grass."
  },
  {
    "slug": "dominosa",
    "title": "Dominosa",
    "tagline": "Find every pair",
    "description": "Partition a number grid into a complete domino set.",
    "skill": "Patterns",
    "icon": "ri-layout-masonry-line",
    "rules": "Split the grid into dominoes so that every unordered number pair appears exactly once. Each domino covers two adjacent cells.",
    "controls": "Click between two cells to pair them. Right-click between cells to rule out a pairing."
  },
  {
    "slug": "fifteen",
    "title": "Fifteen",
    "tagline": "Plan the next move",
    "description": "Slide numbered tiles into order using one empty space.",
    "skill": "Spatial",
    "icon": "ri-layout-grid-line",
    "rules": "Arrange the numbered tiles in reading order, with the empty square last. Use the empty space to move tiles without disturbing solved sections.",
    "controls": "Click a tile in the same row or column as the gap, or use the arrow keys."
  },
  {
    "slug": "untangle",
    "title": "Untangle",
    "tagline": "Make room for clarity",
    "description": "Move the vertices until no connecting lines cross.",
    "skill": "Spatial",
    "icon": "ri-node-tree",
    "rules": "Reposition the points until no two connecting lines cross. Connections stay attached as you move each point.",
    "controls": "Drag a point to move it. Start by separating clusters and placing outer points around the edge."
  }
] as const;
export type Puzzle = (typeof PUZZLES)[number];
