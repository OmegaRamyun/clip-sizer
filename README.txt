# Clip Sizer (Android PWA)

## Install
1. Put `index.html`, `manifest.webmanifest`, and `sw.js` together on a static HTTPS host (GitHub Pages works).
2. Open the hosted page in Chrome on Android.
3. Use Chrome's menu → **Install app** / **Add to Home screen**.

A PWA cannot be installed reliably by opening a local HTML file. It needs HTTPS (or localhost).

## Use
Choose a video, optionally trim and crop it, pick a quality/resolution mode, review the estimated settings, then press **Go**. Two files are generated:
- Discord: MP4 / H.264 / AAC stereo, target 19 MB (hard output cap 19.9 MB; Discord limit 20 MB)
- 4chan: WebM / VP8 / no audio, target 3.8 MB (hard output cap 3.89 MB; 4chan limit 3.9 MB)

If a finished file is over its hard cap, the status line says so next to its real size.

- **Trim:** set start and end (m:ss or seconds, or "Start/End = playhead" from the preview). The size budget is spread over the trimmed length only.
- **Crop:** turn on "Draw / adjust crop" and drag on the preview (draw, move, or drag edges/corners), or type x/y/width/height. The box snaps to even pixels. "Reset crop" returns to the full frame. Crop is applied before scaling.
- **Quality / resolution slider:** "High Resolution, Low Bitrate" keeps bigger frames, "High Quality, Low Res" downscales sooner for a cleaner picture, "Mixed" (default) is the original behavior. It only changes frame size; size targets and bitrates do not change.
- **Two-pass encoding:** both files are encoded in two passes for better quality and more accurate sizes. This takes roughly twice as long as a single pass.

The encoder is FFmpeg.wasm and is downloaded from jsDelivr on first use. Video processing happens in the browser; the selected video is not uploaded to a server.

## Notes / limitations
- Android performance and memory vary. Keep the tab open and screen awake while encoding.
- Bitrates are budgeted conservatively below the stated limits; exact size can still vary with container overhead and encoder behavior. Check the resulting file size before uploading.
- The app uses 30 fps and automatically scales down based on estimated bitrate (biased by the quality/resolution slider). It aims below the platform limits, but always check the resulting file size and playback before uploading.
- Some FFmpeg.wasm builds/devices may not include or support the requested `libx264` or `libvpx` encoders. If encoding reports an unknown encoder, the browser build is incompatible.
