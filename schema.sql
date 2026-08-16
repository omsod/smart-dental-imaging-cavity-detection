
-- Project: Smart Dental Imaging Database Schema

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('DENTIST', 'PATIENT') NOT NULL,
    clinic_name VARCHAR(150),
    age INT,
    gender VARCHAR(10),
    contact VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50),
    dentist_id VARCHAR(50),
    image_url TEXT,
    findings_summary TEXT,
    cavity_count INT,
    report_pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (dentist_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS detections (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    report_id VARCHAR(50),
    box_coords VARCHAR(100), -- xmin, ymin, xmax, ymax
    severity VARCHAR(20),
    confidence_score FLOAT,
    FOREIGN KEY (report_id) REFERENCES reports(id)
);
