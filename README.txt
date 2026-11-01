# Clip Sizer (Android PWA)

## Install
1. Put `index.html`, `manifest.webmanifest`, and `sw.js` together on a static HTTPS host (GitHub Pages works).
2. Open the hosted page in Chrome on Android.
3. Use Chrome's menu → **Install app** / **Add to Home screen**.

A PWA cannot be installed reliably by opening a local HTML file. It needs HTTPS (or localhost).

## Use
Choose a video, review the estimated settings, then press **Go**. Two files are generated:
- Discord: MP4 / H.264 / AAC stereo, target 7.6 MB (hard output cap 7.9 MB)
- 4chan: WebM / VP8 / no audio, target 3.7 MB (hard output cap 3.85 MB)

The encoder is FFmpeg.wasm and is downloaded from jsDelivr on first use. Video processing happens in the browser; the selected video is not uploaded to a server.

## Notes / limitations
- Android performance and memory vary. Keep the tab open and screen awake while encoding.
- Bitrates are budgeted conservatively below the stated limits; exact size can still vary with container overhead and encoder behavior. Check the resulting file size before uploading.
- The app uses 30 fps and automatically scales down based on estimated bitrate. It aims below the platform limits, but always check the resulting file size and playback before uploading.
- Some FFmpeg.wasm builds/devices may not include or support the requested `libx264` or `libvpx` encoders. If encoding reports an unknown encoder, the browser build is incompatible.
