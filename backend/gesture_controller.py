import cv2
import mediapipe as mp
import pyautogui
import numpy as np
import sys
import time
import platform

# Safety settings
pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

screen_w, screen_h = pyautogui.size()

SMOOTHING = 5
prev_x, prev_y = 0, 0
curr_x, curr_y = 0, 0

prev_scroll_y = None
scroll_cooldown = 0

vol_cooldown = 0

def fingers_up(hand_landmarks):
    tips = [4, 8, 12, 16, 20]
    fingers = []

    # Thumb
    if hand_landmarks.landmark[tips[0]].x < hand_landmarks.landmark[tips[0] - 1].x:
        fingers.append(1)
    else:
        fingers.append(0)

    # Other fingers
    for tip in tips[1:]:
        if hand_landmarks.landmark[tip].y < hand_landmarks.landmark[tip - 2].y:
            fingers.append(1)
        else:
            fingers.append(0)

    return fingers

def is_thumb_up(hand_landmarks):
    lm = hand_landmarks.landmark
    # Thumb tip is above thumb base, other fingers are folded
    thumb_up = lm[4].y < lm[3].y < lm[2].y
    index_down = lm[8].y > lm[6].y
    middle_down = lm[12].y > lm[10].y
    return thumb_up and index_down and middle_down

def is_thumb_down(hand_landmarks):
    lm = hand_landmarks.landmark
    thumb_down = lm[4].y > lm[3].y > lm[2].y
    index_down = lm[8].y > lm[6].y
    middle_down = lm[12].y > lm[10].y
    return thumb_down and index_down and middle_down

def adjust_volume(direction):
    os_name = platform.system()
    if os_name == "Darwin":
        if direction == "up":
            pyautogui.press("volumeup")
        else:
            pyautogui.press("volumedown")
    elif os_name == "Windows":
        if direction == "up":
            pyautogui.hotkey("volumeup")
        else:
            pyautogui.hotkey("volumedown")
    else:
        try:
            import subprocess
            if direction == "up":
                subprocess.call(["amixer", "-D", "pulse", "sset", "Master", "5%+"])
            else:
                subprocess.call(["amixer", "-D", "pulse", "sset", "Master", "5%-"])
        except:
            pass

def main():
    global prev_x, prev_y, curr_x, curr_y, prev_scroll_y, scroll_cooldown, vol_cooldown

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("ERROR: Cannot open camera", flush=True)
        sys.exit(1)

    print("STARTED", flush=True)

    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.7
    )

    frame_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        scroll_cooldown = max(0, scroll_cooldown - 1)
        vol_cooldown = max(0, vol_cooldown - 1)

        if results.multi_hand_landmarks:
            hand = results.multi_hand_landmarks[0]
            lm = hand.landmark

            fingers = fingers_up(hand)
            total_fingers = sum(fingers)

            # Fist — no action
            if total_fingers == 0:
                prev_scroll_y = None

            # Thumb up → volume up
            elif is_thumb_up(hand) and vol_cooldown == 0:
                adjust_volume("up")
                vol_cooldown = 20
                print("GESTURE:volume_up", flush=True)

            # Thumb down → volume down
            elif is_thumb_down(hand) and vol_cooldown == 0:
                adjust_volume("down")
                vol_cooldown = 20
                print("GESTURE:volume_down", flush=True)

            # Two fingers (index + middle) → scroll
            elif fingers[1] == 1 and fingers[2] == 1 and fingers[3] == 0 and fingers[4] == 0:
                index_y = lm[8].y * frame_h
                if prev_scroll_y is not None and scroll_cooldown == 0:
                    delta = prev_scroll_y - index_y
                    if abs(delta) > 5:
                        pyautogui.scroll(int(delta / 10))
                        print(f"GESTURE:scroll", flush=True)
                        scroll_cooldown = 2
                prev_scroll_y = index_y

            # Index finger only → move cursor
            elif fingers[1] == 1 and fingers[2] == 0:
                prev_scroll_y = None
                x = int(np.interp(lm[8].x, [0.1, 0.9], [0, screen_w]))
                y = int(np.interp(lm[8].y, [0.1, 0.9], [0, screen_h]))
                curr_x = prev_x + (x - prev_x) / SMOOTHING
                curr_y = prev_y + (y - prev_y) / SMOOTHING
                pyautogui.moveTo(curr_x, curr_y)
                prev_x, prev_y = curr_x, curr_y
                print(f"GESTURE:cursor_move", flush=True)

        # Check for stop signal
        line = ""
        try:
            import select
            if select.select([sys.stdin], [], [], 0)[0]:
                line = sys.stdin.readline().strip()
        except:
            pass
        if line == "STOP":
            break

    cap.release()
    hands.close()
    print("STOPPED", flush=True)

if __name__ == "__main__":
    main()
