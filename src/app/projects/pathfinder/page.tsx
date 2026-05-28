import PathfinderClient from './PathfinderClient';

export const metadata = {
  title: 'Pathfinding Visualizer | Arpit Agarwala',
  description: 'Interactive Pathfinding Visualizer. See algorithms like Dijkstra and A* in action.',
};

export default function PathfinderPage() {
  return <PathfinderClient />;
}
