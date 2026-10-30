# Analytic Surface Frame Workbench

Offline Electron desktop app. Provides 19 analytic parametric surfaces with adjustable parameters, surface generation, import of JSON polylines exported by `frame_2d_curve_board_upgrade`, mapping of curves into the surface parameter domain, and real-time updates of curves and surfaces when dragging key frames. Supports saving/opening project JSON and exporting the current triangulated surface and projected boundary to OBJ.

## Usage

Select a surface in the left panel, adjust parameters in the right panel, and click "Generate Surface". By default four frames form a closed curve. In the 2D view, drag the dots to change positions and drag the arrows to change tangent direction and scale; Alt-drag a dot to change local out-of-plane displacement. In the 3D view you can also drag frame points; left-drag on empty space to rotate, right-drag to pan, and scroll to zoom. Click "Project Curve" to display the curve; for closed curves you can check "Generate Boundary Trim Surface" to keep only the surface inside the boundary.

When importing JSON from the Godot tool, the program reads the first production curve with `format: frame_curve_polyline`, maps it to `[-1,1]^2` by bounding box, projects the original sample points directly, and constructs an editable Hermite frame from the sampled polyline. After the first frame drag, the curve is rebuilt from the Hermite curve, which may cause slight shape changes; the original Godot frames themselves are not included in the exported file. If the original file contains both left and right production boundaries, only the first is currently read.

The surface field follows the paper's `C=(o,R,D)` idea: a tangent frame `R=[e₁,e₂,n]` is established from the partial derivatives of the analytic parametric surface, and `D` is built from two tangent scales. Frame adjustments produce normal displacement with local Gaussian weights; this is an editable explicit surface deformation, not equivalent to a full CCS integral solver. Projected boundaries retain UV parameters and are re-attached each time the surface is rebuilt. The project JSON records each boundary sample point's surface source, UV, spatial point, normal, and tangent, and also computes the maximum segment midpoint chord error of the projected curve. Source attribution and continuous-segment error follow the distinction made in the reference paper; this program only handles curve projection on a single surface and does not implement the paper's two-surface intersection or four-parameter contact correction.

Trimming follows the single-patch construction of `frame_brep`: remove coincident and collinear sample points, validate the finiteness, in-domain containment, non-self-intersection, and area of the closed UV outer loop, perform boundary-constrained triangulation inside the loop, refine by edge length in the parameter domain, improve to a constrained Delaunay mesh via interior edge flips, and finally map vertices onto the surface. Outer-loop edges are never flipped. Mesh auditing checks positively oriented non-degenerate UV triangles, UV area conservation, edge incidence counts, a single closed boundary loop, Euler characteristic `χ=1`, and non-degenerate 3D triangles. Exported OBJ boundary lines directly reference the trim-surface boundary vertices. Project JSON saves the trim loop and audit summary. During editing, if the boundary temporarily goes out of domain or self-intersects, the UI shows the reason and temporarily displays the full surface; once the boundary becomes valid again, trimming resumes automatically. Currently only a single outer loop is supported; holes, periodic seams, exact NURBS p-curves, and full CAD B-rep shells are not supported.

## Development and Packaging

```powershell
npm install
npm test
npm start
npm run dist
```

Installer output goes to `dist/`. The Three.js module is bundled with the project and does not require network access. The `coordinate_system` Python library and the CCS paper were used to establish the frame model and semantics; there is no Python dependency at runtime.