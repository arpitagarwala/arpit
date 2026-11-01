# Local puzzle engine build

The JavaScript/WASM engines use Simon Tatham's MIT-licensed puzzle source at revision `616da16` (the same revision as the original downloaded engines). Game rules are unchanged. Startup fits the canvas after it becomes visible and focuses it without jumping the surrounding page.

`native-status.patch` adds the C export `puzzle_status()`, a read-only call to `midend_status`. The portfolio adapter uses this authoritative result to stop the session clock and record completion. Revealed solutions remain marked as assisted. The patch also makes the upstream CMake export-list quoting work with the Windows SDK.

Build tools used: Emscripten 6.0.13, CMake and Ninja. Source and SDK working directories live under `artifacts/` and are excluded from Git and deployment. The application ships prebuilt files and does not require these tools for a normal Next.js build.

To reproduce: clone `https://git.tartarus.org/simon/puzzles.git`, check out revision `616da16`, apply `native-status.patch`, activate Emscripten 6.0.13, and configure with `emcmake cmake -G Ninja -DCMAKE_BUILD_TYPE=Release -DCMAKE_POLICY_VERSION_MINIMUM=3.5 -DMIN_FIREFOX_VERSION=79 -DMIN_CHROME_VERSION=85`. Build the twelve targets listed in the manifest. Copy their `.js` and `.wasm` outputs here and update the local SHA-256 hashes. Keep the upstream hashes as provenance.

Do not replace these builds using `scripts/vendor-puzzles.mjs`: the unmodified upstream binaries do not expose the completion API. Keep the styled HTML files and shared adapters when rebuilding.
