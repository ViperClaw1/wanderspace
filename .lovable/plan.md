
# Fix Plan: Browser Console Errors on Place Detail Page

## Problem Analysis

Two issues were identified when clicking on a place card:

### Issue 1: 406 (Not Acceptable) HTTP Error

**Location:** `src/pages/PlaceDetail.tsx`, lines 44-50

**Cause:** The `checkFavorite` function uses `.single()` when querying `user_favorites`, but this throws a 406 error when no rows match (the place is not in the user's favorites).

**Solution:** Change `.single()` to `.maybeSingle()` which gracefully handles zero results by returning `null` instead of throwing an error.

### Issue 2: TypeError - "r is not a function"

**Location:** `src/components/map/RouteMap.tsx`

**Cause:** This is a known compatibility issue between `react-leaflet` v5 and React 18's strict mode / concurrent rendering. The error occurs in React's context consumer when react-leaflet tries to render map components.

**Solution:** Wrap the map component in a separate component with lazy loading and ensure proper mounting/unmounting lifecycle. Add a mounted state guard and use dynamic imports to prevent the context consumer race condition.

---

## Implementation Steps

### Step 1: Fix the Supabase Query (PlaceDetail.tsx)

Change line 50 from:
```typescript
.single();
```
to:
```typescript
.maybeSingle();
```

This ensures no error is thrown when the user hasn't favorited the place yet.

### Step 2: Fix React-Leaflet Context Issue (RouteMap.tsx)

1. Add a mounted state to delay rendering until the component is fully mounted
2. Wrap the MapContainer in a key-based remount strategy using a stable key
3. Add error boundary protection for the map component
4. Ensure the map only renders after first mount cycle completes

The updated component will:
- Use `useState` to track if component has mounted
- Only render `MapContainer` after mount (avoiding SSR/hydration issues)
- Use a stable key based on places to prevent unnecessary remounts
- Add proper null checks before rendering markers

---

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/PlaceDetail.tsx` | Replace `.single()` with `.maybeSingle()` in `checkFavorite` |
| `src/components/map/RouteMap.tsx` | Add mounted state guard and stable key for MapContainer |

### Code Changes Summary

**PlaceDetail.tsx:**
```typescript
const checkFavorite = async () => {
  const { data } = await supabase
    .from("user_favorites")
    .select("id")
    .eq("user_id", user!.id)
    .eq("place_id", id)
    .maybeSingle();  // Changed from .single()

  setIsFavorite(!!data);
};
```

**RouteMap.tsx:**
```typescript
export function RouteMap({ places, showRoute = false, className = "" }: RouteMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ... existing validation code ...

  if (!isMounted) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-xl ${className}`}>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  // ... rest of map rendering with stable key ...
}
```

---

## Expected Outcome

After these changes:
- The 406 error will no longer appear when viewing unfavorited places
- The map will render without React context consumer errors
- The place detail page will load smoothly with both the place info and map displaying correctly
