import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from collections import Counter
import time
from module.emotion_writer import write_emotion

# Load face detector and emotion model
face_classifier = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
emotion_model = load_model("fer2013_mini_XCEPTION.102-0.66.hdf5")

# Emotion labels
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# Start webcam
cap = cv2.VideoCapture(0)

# Timer for 10-second interval
start_time = time.time()
emotion_log = []

print("🎥 Starting facial emotion recognition...\n(Press 'q' to quit)")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_classifier.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in faces:
        roi_gray = gray[y:y + h, x:x + w]
        roi_gray = cv2.resize(roi_gray, (64, 64), interpolation=cv2.INTER_AREA)

        if np.sum([roi_gray]) != 0:
            roi = roi_gray.astype("float") / 255.0
            roi = img_to_array(roi)
            roi = np.expand_dims(roi, axis=0)

            prediction = emotion_model.predict(roi)[0]
            label = emotion_labels[np.argmax(prediction)]

            emotion_log.append(label)  # Save this frame's emotion

            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 255), 2)
            cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
        else:
            cv2.putText(frame, "No Face Found", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

    # Display frame
    cv2.imshow('Facial Emotion Recognition', frame)

    # Every 10 seconds: print the most common emotion
    if time.time() - start_time >= 10:
        if emotion_log:
            most_common = Counter(emotion_log).most_common(1)[0][0]
            print(f"🕒 Emotion summary (last 10 seconds): {most_common}")
        else:
            print("🕒 No emotion detected in the last 10 seconds.")
        emotion_log.clear()
        start_time = time.time()

    # Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Cleanup
cap.release()
cv2.destroyAllWindows()
print("🛑 Emotion recognition stopped.")
