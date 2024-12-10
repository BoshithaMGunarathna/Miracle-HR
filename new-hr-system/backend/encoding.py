import os
import cv2
import face_recognition
import pickle
import mysql.connector  # Ensure this is present
from datetime import datetime, timedelta


def encode_faces_from_folder(folder_path="photos/"):
    known_encodings = {}
    for filename in os.listdir(folder_path):
        if filename.endswith(".jpg") or filename.endswith(".png")or filename.endswith(".jpeg"):
            name = os.path.splitext(filename)[0]  # Use the filename (without extension) as the name
            image_path = os.path.join(folder_path, filename)

            # Load the image and encode
            image = face_recognition.load_image_file(image_path)
            face_locations = face_recognition.face_locations(image)
            if face_locations:
                face_encoding = face_recognition.face_encodings(image, face_locations)[0]
                known_encodings[name] = face_encoding
            else:
                print(f"No face found in {filename}")

    # Save the encodings
    with open("face_encodings.pkl", "wb") as file:
        pickle.dump(known_encodings, file)
    print("Encodings saved successfully.")

# Run the function
encode_faces_from_folder()
