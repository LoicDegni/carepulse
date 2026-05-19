-- Supprimer la base de donnees si elle existe
DROP DATABASE IF EXISTS healthcare_db;

-- Créer la base de donnees
CREATE DATABASE healthcare_db;

-- Sélectionner la base
USE healthcare_db;

-- Supprimer l'utilisateur existant (pour Mysql local!)
DROP USER IF EXISTS 'carepulse_admin'@'localhost';
FLUSH PRIVILEGES;

-- Créer un utilisateur dédié (pour Mysql local!)
CREATE USER 'carepulse_admin'@'localhost' IDENTIFIED BY 'test1234';
GRANT ALL PRIVILEGES ON healthcare_db.* TO 'carepulse_admin'@'localhost';
FLUSH PRIVILEGES;

-- Création des tables initiales
-- Supprimer les tables si elles existent pour éviter les conflits
-- Drop la database devrait avoir effacer les tables.
DROP TABLE IF EXISTS appointment;
DROP TABLE IF EXISTS patient;
DROP TABLE IF EXISTS doctor;

-- Table Patient
CREATE TABLE patient (
    medical_card_number VARCHAR(12) NOT NULL UNIQUE PRIMARY KEY, -- Revoir
    username VARCHAR(50) NOT NULL UNIQUE,
    pwd VARCHAR(255) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(100) NOT NULL,
    tel VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    medical_infos TEXT,
    emergency_contact TEXT
);

-- Table Doctor
CREATE TABLE doctor (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    specialty VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    pin_code VARCHAR(255)
);

-- Table Appointment
CREATE TABLE appointment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATETIME(0) NOT NULL,
    status ENUM('ABSENT', 'SCHEDULED', 'CANCELLED', 'COMPLETED', 'NOSHOW') NOT NULL,
    reason TEXT,
    note TEXT,
    medical_notes TEXT,
    prescription TEXT, 
    patient_medical_card_number VARCHAR(12) NOT NULL,
    doctor_id BIGINT NOT NULL,
    FOREIGN KEY (patient_medical_card_number) REFERENCES patient(medical_card_number),
    FOREIGN KEY (doctor_id) REFERENCES doctor(id)
);

-- Table for managing the indisponibilities of doctors
CREATE TABLE doctor_indisponibility (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    start_date DATETIME(0) NOT NULL,
    end_date DATETIME(0) NOT NULL,
    doctor_id BIGINT NOT NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctor(id)
);

INSERT INTO doctor (name, specialty, image_url, pin_code) VALUES
('Jimmy Bon-Doc', 'Cardiologue', '', '1234'),
('Alex Gendron', 'Dermatologue', '', '2345'),
('Victoria Secret', 'Pédiatre', '', '3456'),
('Philippe Cha-Boss', 'Psychologue', '', '4567');
