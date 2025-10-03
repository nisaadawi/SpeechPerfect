# 1. collect_and_analyze.py
# Backend Script to collect webcam frame, record speech, mock HRV, and analyze all inputs.

import speech_recognition as sr
import cv2
import json
import random
from deepface import DeepFace

# --- 1. Facial Emotion Detection ---
cap = cv2.VideoCapture(0)
ret, frame = cap.read()
cap.release()

if ret:
    try:
        analysis = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
        emotion = analysis[0]['dominant_emotion']
    except:
        emotion = "neutral"
else:
    emotion = "unknown"

# --- 2. Speech Recognition & Filler Word Count ---
recognizer = sr.Recognizer()
with sr.Microphone() as source:
    print("Listening for 5 seconds...")
    audio = recognizer.listen(source, timeout=5, phrase_time_limit=5)

try:
    transcript = recognizer.recognize_google(audio)
    words = transcript.lower().split()
    filler_words = [w for w in words if w in ['um', 'uh', 'like', 'you know']]
    filler_count = len(filler_words)
    clarity = "high" if filler_count < 2 else "low"
except:
    transcript = ""
    filler_count = 0
    clarity = "low"

# --- 3. Simulated HRV Data ---
# Normally from serial/BLE device; here we simulate it
hrv = random.randint(45, 80)  # Lower = more stressed

# --- 4. Save to JSON ---
data = {
    "emotion": emotion,
    "transcript": transcript,
    "filler_words": filler_count,
    "speech_clarity": clarity,
    "hrv": hrv
}

with open("backend/data.json", "w") as f:
    json.dump(data, f, indent=4)

print("Data written to backend/data.json")
