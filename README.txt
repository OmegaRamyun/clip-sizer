# Clip Sizer (Android PWA)

## Install
1. Put `index.html`, `manifest.webmanifest`, and `sw.js` together on a static HTTPS host (GitHub Pages works).
2. Open the hosted page in Chrome on Android.
3. Use Chrome's menu → **Install app** / **Add to Home screen**.

A PWA cannot be installed reliably by opening a local HTML file. It needs HTTPS (or localhost).

## Use
Choose a video, optionally trim and crop it, check the outputs you want, review the estimates, then press **Go**. One file is made per checked output, one at a time (never in parallel, to spare phone memory). Discord and 4chan are checked by default:
- Discord: MP4 / H.264 / AAC stereo, target 19 MB (hard output cap 19.9 MB; Discord limit 20 MB) → `name_Discord.mp4`
- 4chan: WebM / VP8 / no audio, target 3.8 MB (hard output cap 3.89 MB; 4chan limit 3.9 MB) → `name_4chan.webm`

## Social outputs (free-tier specs as of Nov 2026 — platforms change these; check before a big upload)
All are MP4, H.264 (yuv420p, faststart) + AAC 128 kb/s stereo, 30 fps. They are NOT size-budgeted: size is not the binding limit on these services, length and shape are. Each uses a fixed quality bitrate and the app reports the real size afterwards.

| Output | Frame | Video | Max length (free) | File |
|---|---|---|---|---|
| X / Twitter | nearest of 16:9 / 1:1 / 9:16 to your (cropped) clip; 1080p tier if the clip's short side is over 720 px, else 720p | 8 Mb/s (1080p), 5 Mb/s (720p) | 2:20 | `name_Twitter.mp4` |
| Instagram (Reels) | 1080x1920 (9:16) | 10 Mb/s | 3:00 for recommendation reach (the app allows up to 20 min, but posts over 3:00 are not recommended to non-followers) | `name_Instagram.mp4` |
| TikTok | 1080x1920 (9:16) | 10 Mb/s | 10:00 | `name_TikTok.mp4` |
| YouTube Shorts | 1080x1920 (9:16), always: a 16:9 file does not count as a Short | 10 Mb/s | 3:00 | `name_Shorts.mp4` |

The size limits are far above what these bitrates produce (X 512 MB free; TikTok 4 GB API / under 10 GB web; YouTube 256 GB), so no size caps are applied. Instagram does not publish an in-app file limit (the 300 MB API/scheduler limit does not apply to in-app uploads). TikTok in-app uploads may recompress large files; the "72 MB Android / 287 MB iOS" figures that circulate are unpublished creator observations, not rules, and are not enforced here.

**Single pass for social outputs.** Discord and 4chan use two-pass encoding because they must hit a tight size target accurately. The social outputs have generous quality bitrates and no size target, so single-pass (preset veryfast) is the better time/quality trade on a phone, especially in a batch.

**Fit vs Fill** (one setting for all social outputs; Discord/4chan always keep your clip's own shape):
- **Fit — black bars** (default): scales the clip to fit inside the frame and pads with black. Nothing is cut and nothing is stretched. A landscape clip in a 9:16 frame gets bars above and below.
- **Fill — crop to frame**: center-crops the clip to the frame's shape, then scales it to fill the frame. Fills the screen; loses the edges.
Order: your manual crop first, then fit/fill, then scale to the frame, then 30 fps. X picks the shape nearest your clip, so a vertical phone clip gives a 9:16 X file and a landscape clip a 16:9 one.

**Length warnings.** For each checked social output the app shows whether the trimmed clip fits its limit. If one doesn't, a warning names the service and its limit. The app never re-trims your clip for you, and Go still runs (you might be splitting the clip yourself).

If a finished file is over its hard cap, the status line says so next to its real size.

- **Trim:** set start and end (m:ss or seconds, or "Start/End = playhead" from the preview). The size budget is spread over the trimmed length only.
- **Quick lengths (30s / 1m / 2m):** set the end to start + that length, clamped to the end of the video (if the clip is shorter, the actual trimmed length is shown). These are the safe lengths: all three fit every output, including X's 2:20.
- **Crop:** turn on "Draw / adjust crop" and drag on the preview (draw, move, or drag edges/corners), or type x/y/width/height. The box snaps to even pixels. "Reset crop" returns to the full frame. Crop is applied before scaling.
- **Quality / resolution slider:** "High Resolution, Low Bitrate" keeps bigger frames, "High Quality, Low Res" downscales sooner for a cleaner picture, "Mixed" (default) is the original behavior. It only changes frame size; size targets and bitrates do not change. It affects Discord and 4chan only; the social outputs use the fixed frames and bitrates above.
- **Two-pass encoding:** the Discord and 4chan files are encoded in two passes for better quality and more accurate sizes. This takes roughly twice as long as a single pass.

The encoder is FFmpeg.wasm and is downloaded from jsDelivr on first use. Video processing happens in the browser; the selected video is not uploaded to a server.

## Notes / limitations
- Android performance and memory vary. Keep the tab open and screen awake while encoding.
- Bitrates are budgeted conservatively below the stated limits; exact size can still vary with container overhead and encoder behavior. Check the resulting file size before uploading.
- The app uses 30 fps and automatically scales down based on estimated bitrate (biased by the quality/resolution slider). It aims below the platform limits, but always check the resulting file size and playback before uploading.
- Some FFmpeg.wasm builds/devices may not include or support the requested `libx264` or `libvpx` encoders. If encoding reports an unknown encoder, the browser build is incompatible.
