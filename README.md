# 🚀 AirCtrl — Gesture-Based System Navigation

Control your computer using **hand gestures via webcam**.
Built with **MediaPipe, OpenCV, React, and Electron**, AirCtrl enables touchless interaction for cursor control, clicks, scrolling, and system actions.

---

## ✨ Features

* 🖐️ Real-time hand tracking using MediaPipe
* 🖱️ Cursor control with index finger
* 👆 Gesture-based click interactions
* 🔊 Volume control using hand gestures
* 📜 Smooth scrolling support
* ⚡ Cross-platform desktop app (Electron)

---

## 🧠 Tech Stack

* **Frontend:** React, Tailwind CSS
* **Desktop App:** Electron
* **Backend:** Python
* **Computer Vision:** MediaPipe, OpenCV
* **Automation:** PyAutoGUI

---

## ⚙️ Requirements

* Node.js (v18 or higher)
* Python **3.11 (recommended)**
* pip
* Webcam

---

## 🛠️ Setup & Run

```bash
# 1. Create Python virtual environment (recommended)
py -3.11 -m venv venv
venv\Scripts\activate

# 2. Install Python dependencies
pip install -r backend/requirements.txt

# 3. Install Node dependencies (root + frontend)
npm run install:all

# 4. Start the app
npm start
```

---

## 🎮 Gesture Controls

| Gesture          | Action         |
| ---------------- | -------------- |
| ☝️ Index finger  | Move cursor    |
| 🤏 Thumb + Index | Left click     |
| ✌️ Two fingers   | Scroll         |
| 👍 Thumb up      | Volume up      |
| 👎 Thumb down    | Volume down    |
| ✊ Fist           | Pause tracking |

---

## 🏗️ Project Structure

```
/airctrl
  /frontend     → React UI
  /electron     → Electron main process
  /backend      → Python gesture controller
  package.json  → Root scripts
  README.md
```

---

## ⚠️ Important Notes

* Use **Python 3.11** for best compatibility with MediaPipe
* Ensure no other app is using your webcam
* Run inside virtual environment for stability

---

## 🐛 Troubleshooting

* **Camera not opening**

  * Check webcam permissions
  * Close apps like Zoom/Teams

* **Backend crashing**

  * Ensure correct Python version (3.11)
  * Reinstall dependencies

* **App shows OFFLINE**

  * Backend is not running → check terminal logs

---

## 🚀 Future Improvements

* Gesture customization UI
* Multi-hand support
* AI-based gesture learning
* System-wide shortcuts integration

---

## 📌 Author

**Akshit Bisht**

---

## ⭐ If you like this project

Give it a star on GitHub — it helps a lot!
