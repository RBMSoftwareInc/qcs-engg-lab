# Studio antigravity background

Studio uses a subtle, mouse-reactive blob background (antigravity-style). It appears on all Studio pages except when embedded in an iframe (e.g. settings modals).

## If the background doesn’t show

1. **Hard refresh**  
   - Windows/Linux: `Ctrl + Shift + R`  
   - macOS: `Cmd + Shift + R`

2. **Clear Vite/SvelteKit cache and restart**
   ```bash
   rm -rf .svelte-kit node_modules/.vite
   npm run dev
   ```

3. **Check “Reduce motion”**  
   If your OS or browser has “Reduce motion” / “Animations” turned off, the blobs still render but won’t animate. The background should still be visible.

4. **Not in embed mode**  
   The background is hidden when Studio is loaded inside an iframe (e.g. from Settings). Open Studio in a normal tab: `/studio`, `/studio/builder`, etc.
