import os
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from collections import Counter
import time

# ==============================
# SETTINGS
# ==============================
MODEL_PATH = os.path.join(os.path.dirname(__file__), "fer2013_mini_XCEPTION.102-0.66.hdf5")
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"❌ Emotion model not found at {MODEL_PATH}")

# ==============================
# LOAD MODELS
# ==============================
face_classifier = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
eye_classifier = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
emotion_model = load_model(MODEL_PATH)

emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# ==============================
# HELPER: Detect gaze direction (Option 1)
# ==============================
def get_gaze_direction(eye_frame):
    gray_eye = cv2.cvtColor(eye_frame, cv2.COLOR_BGR2GRAY)
    gray_eye = cv2.GaussianBlur(gray_eye, (7, 7), 0)

    # Invert colors to make pupil white
    _, thresh_eye = cv2.threshold(gray_eye, 30, 255, cv2.THRESH_BINARY_INV)

    contours, _ = cv2.findContours(thresh_eye, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    if len(contours) == 0:
        return "Unknown"

    contour = max(contours, key=cv2.contourArea)
    (x, y, w, h) = cv2.boundingRect(contour)
    pupil_x = x + w / 2
    eye_center_x = eye_frame.shape[1] / 2

    # Simple threshold to decide gaze
    if pupil_x < eye_center_x - 5:
        return "Left"
    elif pupil_x > eye_center_x + 5:
        return "Right"
    else:
        return "Center"

# ==============================
# INITIALIZE CAMERA
# ==============================
emotion_log = []
start_time = time.time()

cap = cv2.VideoCapture(0)
print("🎥 Camera started. Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("⚠️ Camera not found or cannot be accessed.")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_classifier.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in faces:
        roi_gray = gray[y:y + h, x:x + w]
        roi_gray = cv2.resize(roi_gray, (64, 64), interpolation=cv2.INTER_AREA)

        # Emotion prediction
        if np.sum([roi_gray]) != 0:
            roi = roi_gray.astype('float') / 255.0
            roi = img_to_array(roi)
            roi = np.expand_dims(roi, axis=0)
            preds = emotion_model.predict(roi, verbose=0)[0]
            label = emotion_labels[preds.argmax()]
            emotion_log.append(label)
        else:
            label = "Unknown"

        # Detect eyes
        eye_contact = "No"
        gaze_text = "Unknown"
        roi_color = frame[y:y + h, x:x + w]
        eyes = eye_classifier.detectMultiScale(roi_gray)

        if len(eyes) > 0:
            eye_contact = "Yes"

            # Take the first detected eye for gaze
            (ex, ey, ew, eh) = eyes[0]
            eye_roi = roi_color[ey:ey + eh, ex:ex + ew]
            gaze_text = get_gaze_direction(eye_roi)

        # Display results on frame
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 255), 2)
        cv2.putText(frame, f"Emotion: {label}", (x, y - 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
        cv2.putText(frame, f"Eye: {eye_contact}", (x, y - 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, f"Gaze: {gaze_text}", (x, y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

    cv2.imshow('Emotion + Eye Contact + Gaze Detector', frame)

    # Every 10 seconds → summarize emotion
    if time.time() - start_time >= 10:
        if emotion_log:
            most_common = Counter(emotion_log).most_common(1)[0][0]
            print(f"🕒 Emotion summary (last 10s): {most_common}")
        else:
            print("🕒 No emotion detected in last 10s.")
        emotion_log.clear()
        start_time = time.time()

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# ==============================
# CLEAN UP
# ==============================
cap.release()
cv2.destroyAllWindows()
print("👋 Program ended.")
