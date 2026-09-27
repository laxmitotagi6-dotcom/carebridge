<?php

include "db.php";

$patient_name = $_POST['patient_name'];
$doctor_name = $_POST['doctor_name'];
$appointment_date = $_POST['appointment_date'];
$appointment_time = $_POST['appointment_time'];

$sql = "INSERT INTO appointments 
(patient_name, doctor_name, appointment_date, appointment_time, status)
VALUES 
('$patient_name', '$doctor_name', '$appointment_date', '$appointment_time', 'Confirmed')";

if ($conn->query($sql) === TRUE) {
    echo "Appointment booked successfully";
} else {
    echo "Error: " . $conn->error;
}

$conn->close();

?>