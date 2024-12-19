import sys
import json
import pickle
from datetime import datetime, timedelta
import cv2
import face_recognition
import mysql.connector

# Mark attendance in the database
def mark_attendance(name):
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="hr_miracle"
        )
        cursor = connection.cursor()

        date_today = datetime.now().date()
        time_now = datetime.now().time()

        # Check if the employee has already signed in today
        cursor.execute("SELECT * FROM attendance WHERE emp_id = %s AND date = %s", (name, date_today))
        result = cursor.fetchone()

        if result:
            # Update sign-out time and calculate worked hours
            sign_in_time = result[3]  # Assuming 'sign_in' is the 4th column in the database
            sign_out_time = time_now

            # Convert to datetime objects for calculation
            if isinstance(sign_in_time, timedelta):
                sign_in_time = (datetime.min + sign_in_time).time()
            sign_in_dt = datetime.combine(date_today, sign_in_time)
            sign_out_dt = datetime.combine(date_today, sign_out_time)

            time_diff = sign_out_dt - sign_in_dt
            hours = time_diff.seconds // 3600
            minutes = (time_diff.seconds % 3600) // 60
            time_worked = f"{hours}h {minutes}m"

            # Update the record
            cursor.execute(
                "UPDATE attendance SET sign_out = %s, hours = %s WHERE emp_id = %s AND date = %s",
                (sign_out_time, time_worked, name, date_today)
            )
        else:
            # Insert a new sign-in record
            cursor.execute(
                "INSERT INTO attendance (emp_id, date, sign_in) VALUES (%s, %s, %s)",
                (name, date_today, time_now)
            )

        connection.commit()
    except mysql.connector.Error as err:
        sys.stderr.write(f"Database error: {err}\n")
        sys.stderr.flush()
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Load known face encodings
def load_known_faces():
    try:
        with open("face_encodings.pkl", "rb") as file:
            known_encodings = pickle.load(file)
        return known_encodings
    except FileNotFoundError:
        sys.stderr.write("Error: face_encodings.pkl not found.\n")
        sys.stderr.flush()
        return {}

# Main recognition and attendance marking function
def recognize_and_mark():
    known_faces = load_known_faces()
    known_encodings = list(known_faces.values())
    known_names = list(known_faces.keys())

    cam = cv2.VideoCapture(0)
    if not cam.isOpened():
        sys.stderr.write("Error: Camera could not be opened.\n")
        sys.stderr.flush()
        return

    recognized_names = []

    try:
        while True:
            ret, frame = cam.read()
            if not ret:
                sys.stderr.write("Error: Failed to capture frame from camera.\n")
                sys.stderr.flush()
                break

            # Convert the frame to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Detect faces and encode them
            face_locations = face_recognition.face_locations(rgb_frame)
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

            for face_encoding in face_encodings:
                # Compare the detected face with known encodings
                face_distances = face_recognition.face_distance(known_encodings, face_encoding)
                name = "Unknown"
                if len(face_distances) > 0:
                    best_match_index = face_distances.argmin()
                    if face_distances[best_match_index] < 0.6:  # Adjust threshold if needed
                        name = known_names[best_match_index]
                        if name not in recognized_names:
                            recognized_names.append(name)
                            mark_attendance(name)
                            sys.stdout.write(json.dumps({"recognized_names": recognized_names}) + "\n")
                            sys.stdout.flush()


            # Break the loop after processing the frames (adjust duration if necessary)
            if len(recognized_names) > 0:
                break
    finally:
        cam.release()

    # Send the final recognition result to Node.js
    sys.stdout.write(json.dumps({"recognized_names": recognized_names}) + "\n")
    sys.stdout.flush()

if __name__ == "__main__":
    recognize_and_mark()
