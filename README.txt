# Compression Protocol (Android PWA)

## Install
1. Put `index.html`, `manifest.webmanifest`, and `sw.js` together on a static HTTPS host (GitHub Pages works).
2. Open the hosted page in Chrome on Android.
3. Use Chrome's menu → **Install app** / **Add to Home screen**.

A PWA cannot be installed reliably by opening a local HTML file. It needs HTTPS (or localhost).

## First setup
On the first visit in a browser, Compression Protocol shows a First setup screen with a **Download FFMPEG** button. It downloads FFMPEG WASM (about 30–40 MB, the same download that otherwise happens on the first Go) and restarts the app once. After that the app opens straight to "Choose a video". There is no voluntary skip option; single-threaded encoding is used only as a fallback when cross-origin isolation or the multithreaded core cannot be loaded. If download fails, tap Download FFMPEG to retry.

## Use
Choose a video, optionally trim and crop it, check the outputs you want, review the estimates, then press **Go**. One file is made per checked output, one at a time (never in parallel, to spare phone memory). Discord and 4chan are checked by default:
- Discord: main: `Discord` / sub: `MP4, 19 MB target, H264, AAC` (hard output cap 19.9 MB; Discord limit 20 MB) → `name_Discord.mp4`
- 4chan: main: `4chan` / sub: `Webm, 3.8mb target, VP9, Silent` (hard output cap 3.89 MB; 4chan limit 3.9 MB) → `name_4chan.webm` (CPU VP9 is slower than CPU VP8 was; the hardware path is the fast one for 4chan)

When 2 or more outputs are made, finished files are delivered as ONE zip file (`name_clips.zip`), assembled using STORE (no recompression) so phone CPU/battery are not burned on already-compressed video. Single-output batches deliver that file directly. If zip creation fails, individual download links are served as a fallback.

## Formats & Socials pack (specs as of Nov 2026 — platforms change these; check before a big upload)
Pick Formats offers three choices formatted with name on the main line and subheading descriptions underneath:
- Discord — main: `Discord` / sub: `MP4, 19 MB target, H264, AAC`
- 4chan — main: `4chan` / sub: `Webm, 3.8mb target, VP9, Silent`
- Socials — main: `Socials` / sub: `3 Clips. 1080p. Landscape, Portrait, Square, 8mbps H264, AAC`
plus a debug "All 4chan" override flag in the Debug section (main: `All 4chan` / sub: `Force all selected outputs to 3.89 MB mute VP9 WebM`). Checkboxes without descriptions (Experimental speed, Use all cores, Threaded filters, preset radios) remain single-line labels.

The Socials pack replaces the three separate shape checkboxes with ONE checkbox that produces all three shapes in one run at a flat 8 Mbps across the board:
- Horizontal 1920×1080 @ 8 Mbps, Vertical 1080×1920 @ 8 Mbps, Square 1080×1080 @ 8 Mbps — MP4, H.264 High (x264 preset from the Speed setting, default veryfast), AAC 128 kb/s stereo, 30 fps, single pass, faststart, with the selected background mode (Fit / Fill / Blur) applied per shape. Unchecked by default. At 2:00, each Socials clip is at most ~120 MB (down from ~150 MB).

| Output | Frame | Video target | Audio | File |
|---|---|---|---|---|
| Generic Horizontal | 16:9, 1920x1080 | 8000 kb/s | AAC 128k stereo | `name_Horizontal.mp4` |
| Generic Vertical | 9:16, 1080x1920 | 8000 kb/s | AAC 128k stereo | `name_Vertical.mp4` |
| Generic Square | 1:1, 1080x1080 | 8000 kb/s | AAC 128k stereo | `name_Square.mp4` |

**"All 4chan" debug flag (CPU path):**
A debug override checkbox (default off) in the Debug section at the bottom of the options area. When turned on, every selected output (Discord, 4chan, Socials pack shapes) encodes as two-pass VP9 mute WebM under the 4chan cap (3.8 MB target / 3.89 MB cap). Frame shapes and composition (Fit / Fill / Blur) remain intact.

**One file posts everywhere** (at 2:00 or under):
- Vertical 9:16 posts to X, YouTube Shorts, Instagram Reels and TikTok.
- Square 1:1 posts to X, YouTube Shorts, Instagram Reels and TikTok.
- Horizontal 16:9 posts natively to X and uploads elsewhere (a 16:9 file is not a Short and does not fill a vertical feed).

**One universal limit: 2:00.** 2:00 fits everywhere: X allows 2:20, Shorts 3:00, Reels 3:00 for reach (longer Reels still post but are not recommended to non-followers), TikTok 10:00. The size limits on those services are far above what these bitrates produce, so no size caps are applied.

**Single pass for Generic outputs.** Discord and 4chan use two-pass encoding because they must hit a tight size target accurately. The Generic outputs have generous quality bitrates and no size target, so single-pass (preset veryfast) is the better time/quality trade on a phone, especially in a batch.

**Fit vs Fill** (one setting for all Generic outputs: how a clip that doesn't match the output shape is converted into it; Discord/4chan always keep your clip's own shape):
- **Fit — black bars** (default): scales the clip to fit inside the frame and pads with black. Nothing is cut and nothing is stretched. A landscape clip in the 9:16 frame gets bars above and below.
- **Fill — crop to frame**: center-crops the clip to the frame's shape, then scales it to fill the frame. Fills the screen; loses the edges.
- **Blur — blurred background**: like Fit (whole picture, nothing cut, nothing stretched), but the bars are a blurred, darkened copy of the clip instead of black. Made for 16:9 game clips going to Vertical. The background is cheap by construction: the clip is shrunk to 1/8 of the frame (covering it), converted to linear light, box-blurred while tiny, scaled back up to the frame, darkened and converted back. If the clip already matches the output shape there are no bars, and Blur is the same as Fit.
Order: your manual crop first, then fit/fill/blur, then scale to the frame, then 30 fps.

**Speed** (Veryfast default / Superfast / Ultrafast): the x264 preset for the MP4 files — Discord (both passes) and Socials. Faster presets finish sooner and look a little worse at the same file size. It does not change bitrates, size targets or frame sizes, so the estimates do not move. The 4chan WebM (VP9) is not affected.

**Debug options (opt-in):** Four checkboxes at the bottom of the options area, all off by default with no persistence across loads:
- **Experimental speed:** replaces the scale filter flag with `flags=experimental` across all pipelines.
- **Use all cores:** uses the full hardware concurrency (`navigator.hardwareConcurrency`) for x264 encoder `-threads` on the multithreaded core instead of the safe-guess formula.
- **Threaded filters:** adds `-filter_threads <N>` with the active thread count to the encode arguments to enable threaded filter graph processing.
- **All 4chan:** forces every selected output to two-pass VP9 mute WebM under the 4chan cap (see '"All 4chan" debug flag' above).
(Note: Debug checkboxes and x264 speed presets are CPU-path concepts and are ignored on hardware-engine outputs, where scaling is GPU-backed via canvas and bitrateMode CBR governs quality.)

**Format passthrough & fast blur.** Pixel format conversions are never forced: `-pix_fmt yuv420p` is omitted from all outputs, and the blur background chain avoids format conversions (`format=gbrp` and `format=yuv420p` are removed). Sources remain in their native format (e.g. RGB in → 4:4:4 out for H.264, YUV in → YUV out; 4chan VP9 auto-negotiates yuv420p per libvpx-vp9 requirements).

**Length warnings.** Every checked Generic output shows whether the trimmed clip fits the 2:00 fits-everywhere limit. Over 2:00, a warning names the outputs and the per-service limits. The app never re-trims your clip for you, and Go still runs (you might be splitting the clip yourself, or posting only where longer clips are allowed).

If a finished file is over its hard cap, the status line says so next to its real size.

- **Trim:** set start and end (m:ss or seconds, or "Start/End = playhead" from the preview). The size budget is spread over the trimmed length only.
- **Quick lengths (30s / 1m / 2m):** set the end to start + that length, clamped to the end of the video (if the clip is shorter, the actual trimmed length is shown). 2m is the fits-everywhere length: a Generic file of 2:00 or less posts to X, Shorts, Reels and TikTok.
- **Crop:** turn on "Draw / adjust crop" and drag on the preview (draw, move, or drag edges/corners), or type x/y/width/height. The box snaps to even pixels. "Reset crop" returns to the full frame. Crop is applied before scaling.
- **Quality / resolution slider:** "High Resolution, Low Bitrate" keeps bigger frames, "High Quality, Low Res" downscales sooner for a cleaner picture, "Mixed" (default) is the original behavior. It only changes frame size; size targets and bitrates do not change. It affects Discord and 4chan only; the Generic outputs use the fixed frames and bitrates above.
- **Two-pass encoding:** the Discord and 4chan files (and all outputs when All 4chan is enabled) are encoded in two passes for better quality and more accurate sizes. This takes roughly twice as long as a single pass.

The encoder is FFmpeg.wasm and is downloaded from jsDelivr (during First setup, or on first Go). Video processing happens in the browser; the selected video is not uploaded to a server.

**Hardware encoding (WebCodecs + Mediabunny).** Alongside the CPU FFmpeg.wasm engine, Compression Protocol includes a hardware encoding engine using the WebCodecs API and the Mediabunny toolkit (dynamically imported at newest version on boot; not bundled or precached). Hardware encoding is the default path when WebCodecs and output codec configs are supported. Size caps are held via CBR with verify-and-retry, compositing uses GPU-accelerated canvas frames (Fit/Fill/Blur), and 4chan hardware uses VP9 WebM. If hardware encoding is unsupported or fails mid-run, the app falls back to the CPU path per output without interrupting the batch. When hardware handles an encode, the mode line displays `Hardware · <codec>` (e.g. `Hardware · H.264` or `Hardware · VP9`).

**Multithreaded encoding.** After First setup, browsers that support it use the multithreaded FFmpeg.wasm core (`@ffmpeg/core-mt`), with encoder threads computed from hardware concurrency (`Math.min(8, Math.max(2, cores - 1))`, leaving one core for UI responsiveness, cap 8, floor 2; fallback 4 if unavailable; full core count when "Use all cores" is checked) to limit memory use on phones. This computed value feeds only the x264 `-threads` option on the multithreaded core; it does not change the prebuilt core's fixed pthread pool or 1 GiB shared memory. The multithreaded core needs a cross-origin isolated page, and GitHub Pages cannot set the headers for that, so `sw.js` adds `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` to the app's own responses. It does not touch requests to other sites. Isolation starts on the first page load after the service worker is installed, which is why setup restarts once. If isolation is not available or core-mt fails to load, the app falls back to the single-threaded core. An indicator under the title reports `Multithreaded · N threads` or `Single-threaded fallback` (with a "Try fast setup" button to re-run setup) once the engine resolves. Encode settings use fast bilinear scaling (`flags=fast_bilinear`) across all outputs.

**Update check on start.** On startup, Compression Protocol checks whether a newer service worker is available. When an update is ready, a non-blocking prompt offers a Reload button to apply it at your convenience. The app never reloads automatically, so an in-progress encode is never interrupted. Tapping Dismiss hides the prompt for the current session.

**Explicit states, preflight, and stage-specific errors.** Engine readiness (`idle | loading | ready | failed`) and file readiness (`none | picked | verified | stale`) are tracked explicitly rather than inferred from object existence or error strings. At Go time, a lightweight preflight probe verifies that the picked file handle remains readable before encoding starts. If a stale handle fails to re-read (common on mobile after backgrounding or cloud picks), the app acknowledges that the preview succeeded, explains that the file must be re-read for encoding, and prompts to choose the video again without auto-retrying a dead handle or suggesting unrelated video shortening. Auto-retry is restricted exclusively to encoder download failures.

**Single zip download per batch (STORE compression).** When a batch finishes with 2 or more outputs, Compression Protocol packages them into a single zip file (`name_clips.zip`) using JSZip (loaded lazily on batch completion from jsDelivr, version 3.10.1). Outputs are packaged using STORE (level 0 / uncompressed), avoiding phone CPU and battery drain from recompressing video. Batches producing exactly 1 output deliver that file directly. If zip creation or JSZip loading fails, the app falls back to individual download links so outputs are never lost.

**Visual polish pass (Signal Protocol Eva/NERV terminal theme).** The interface adopts the Signal Protocol Eva/NERV terminal-parody palette (warm blacks `#0c0d11`, solid charcoal panels `#15171e`, glowing terminal amber primary `#f59e0b`, diagnostic teal telemetry `#14b8a6` / `#2dd4bf`, signal red error `#f87171` / `#ef4444`, and warning amber `#fbbf24`). Built strictly for legibility and touch ergonomics: solid opaque surfaces, crisp high-contrast typography, interactive touch targets ≥44px in both dimensions across all controls (buttons, inputs, and selection rows), and snappy Earshot-character micro-motion (≤250ms with overshoot easing).

**Trace-Tan mascot companion & Signal SFX.** A bobbing Trace-Tan chibi companion sits at the bottom of the page beside a high-contrast terminal speech bubble with reactive flavor commentary and Signal Protocol sound effects. During batch encoding, her bubble speaks the live progress text (phase + output + percent) while the standalone progress text is suppressed (the progress bar remains visible). Emotes and status messages are wired to the application lifecycle: idle (neutral), file chosen (smug + select sound), encoding (determined), batch done (happy + achievement toast sound), error / stale file / preflight failure (dizzy with spiral eyes + dizzy sound; error details surface in status and bubble), over-length warning (shocked), update available (shocked), and First Setup (nervous). Tapping Trace-Tan plays a blush reaction with a blush emote and SFX. A 44px mute toggle persists audio preferences in localStorage (default unmuted). Idling bobs and animations strictly respect `prefers-reduced-motion` by displaying static frames.

**Build stamp convention.** Every release updates the build stamp under the title in `index.html` to the new date + feature tags before committing, so the loaded build is always identifiable at a glance without scrolling (e.g. `Build Nov 1, 2026 · MT + blur + update-check + states + version + speed + perf + formats + hardware + zip + polish + mascot`).

## Notes / limitations
- Android performance and memory vary. Keep the tab open and screen awake while encoding.
- Bitrates are budgeted conservatively below the stated limits; exact size can still vary with container overhead and encoder behavior. Check the resulting file size before uploading.
- The app uses 30 fps and automatically scales down based on estimated bitrate (biased by the quality/resolution slider). It aims below the platform limits, but always check the resulting file size and playback before uploading.
- Some FFmpeg.wasm builds/devices may not include or support the requested `libx264` or `libvpx` encoders. If encoding reports an unknown encoder, the browser build is incompatible.
