
## What’s actually happening (root cause)

The error:

- `Uncaught TypeError: render2 is not a function`
- plus the warning (seen earlier): “A context consumer was rendered with multiple children, or a child that isn't a function…”

is coming from **React Context** internals while rendering the map (`MapContainer` from `react-leaflet`).

After inspecting your installed packages:

- `react` is **18.3.1**
- `react-leaflet` is **5.0.0**
- `@react-leaflet/core` is **3.0.0**

Both `react-leaflet@5` and `@react-leaflet/core@3` declare **peer dependency React 19** and are built using **React 19-only APIs/syntax**, specifically:
- rendering a Context provider as `<LeafletContext value={...}>...` (React 19 feature)
- importing `use` from React (`import { use } from 'react'`) (React 19 feature)

In React 18, rendering `<Context ...>` is treated as a **Context.Consumer**, which *must* receive a single function child — so React throws the exact error you’re seeing and the app can blank-screen.

This is why all the “mount guards / Suspense / stable key” attempts didn’t reliably fix it: the library itself is incompatible with the current React version.

---

## Fix approach (recommended): keep React 18, downgrade react-leaflet to v4

### Why this is the best fix
- Lowest risk for the rest of your app (Radix UI, framer-motion, router, etc.)
- `react-leaflet@4` is the compatible major version for React 18
- No significant code rewrite needed for your current usage (`MapContainer`, `TileLayer`, `Marker`, `Polyline`, `useMap` all exist in v4)

### Implementation steps
1. **Update dependencies**
   - Change `react-leaflet` from `^5.0.0` to a React-18-compatible version (e.g. `^4.2.1`).
   - Ensure `@react-leaflet/core` resolves to **v2.x** (it will automatically when using react-leaflet v4).
   - Remove any accidental direct dependency pinning that forces `@react-leaflet/core@3`.

2. **Regenerate the lockfile**
   - Update `package-lock.json` accordingly so the installed tree no longer contains `react-leaflet@5` / `@react-leaflet/core@3`.

3. **Sanity-check the map code**
   - Your current `RouteMapInner.tsx` should work unchanged on v4.
   - Confirm we are only importing from `react-leaflet` (you already are) and not from deep paths like `react-leaflet/MapContainer` (which can affect types in TS).

4. **Add protection against blank screens (optional but strongly recommended)**
   - Add a small React Error Boundary around the map rendering (RouteMap / RouteMapInner) so even if the map fails, the rest of the Place Detail page doesn’t blank-screen.
   - The fallback UI would display “Map failed to load” and allow the user to continue using the page.

5. **Test end-to-end**
   - Click a place card (e.g. `/place/750278df-8ec4-47c2-b536-bff17bf505d4`)
   - Verify:
     - no `render2 is not a function` error
     - the Place Detail page renders fully
     - the map renders (tiles + marker)
   - Also test Route Planner page since it uses the same map component.

---

## Alternative approach (higher risk): upgrade the whole app to React 19

If you *want* to stay on `react-leaflet@5`, the correct path is:
- upgrade `react` and `react-dom` to `^19`
- upgrade `@types/react` and `@types/react-dom` to `^19`
- verify other dependencies are React 19 compatible

I do not recommend this as the first move because it can create knock-on issues across UI libraries, tests, and type packages.

---

## Files that will be changed when implementing the recommended fix
- `package.json` (dependency version change)
- `package-lock.json` (resolved dependency tree update)
- (Optional) a small Error Boundary component file or a small wrapper around RouteMap

---

## Success criteria (what “fixed” looks like)
- Clicking any PlaceCard no longer triggers a blank screen
- No console warning about Context.Consumer children
- No runtime error `render2 is not a function`
- Map loads on both Place Detail and Route Planner pages
