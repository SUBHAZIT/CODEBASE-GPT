# Dependency Graph Overlap Fix - Expand/Collapse

Status: In Progress

## Plan Summary
Fix overlapping nodes/boxes in DependencyGraph when expanding/collapsing in RepoDashboard.
Root cause: Simulation recreates on height change without position preservation or adequate spacing.

## Steps

### [x] 1. Update RepoDashboard.tsx
Pass `expanded={graphExpanded}` prop (duplicate harmless). ✅

### [ ] 2. Refactor DependencyGraph.tsx (in progress)
- Add `expanded?: boolean` prop
- Use `useRef` to store previous nodes' positions (fx/fy)
- Increase forces: collision radius=30, link distance=80, charge strength=-150
- Set initial node positions based on depth (grid-like)
- Add `simulation.tick(50)` warmup before first render
- Add `force("bounds", d3.forceCollide().radius(25).strength(0.5))`
- Truncate long labels, adjust text anchor/dy
- `simulation.alpha(0.4).restart()` on changes

### [ ] 3. Test
- `bun run dev`
- Navigate to dashboard
- Toggle expand/collapse 5+ times
- Verify smooth repositioning without overlaps
- Test drag, zoom, context menu

### [x] 4. Track Progress
Update this file after each step

## Notes
- No new dependencies
- Preserve existing functionality

