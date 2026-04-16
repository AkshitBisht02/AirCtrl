# AirCtrl — Gesture-Based System Navigation

Control your computer with hand gestures via webcam using MediaPipe, OpenCV, and Electron.

## Requirements

- Node.js 18+
- Python 3.8+
- pip3
- A webcam

## Setup & Run

```bash
# 1. Install Python dependencies
pip3 install -r backend/requirements.txt

# 2. Install Node dependencies (root + frontend)
npm run install:all

# 3. Start the app
npm start
```

## Gestures

| Gesture | Action |
|---------|--------|
| ☝️ Index finger | Move cursor |
| ✌️ Two fingers | Scroll |
| 👍 Thumb up | Volume up |
| 👎 Thumb down | Volume down |
| ✊ Fist | Idle / pause |

## Architecture

```
/airctrl
  /frontend     → React UI (Tailwind + CSS)
  /electron     → Electron main + preload
  /backend      → Python gesture_controller.py
  package.json  → Root scripts
  README.md
```

## Troubleshooting

- **Camera not found**: Ensure webcam is connected and not used by another app.
- **Python not found**: Make sure `python3` is in your PATH.
- **Linux audio**: Install `amixer` (`sudo apt install alsa-utils`).
