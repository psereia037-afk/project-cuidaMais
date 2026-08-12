CREATE DATABASE IF NOT EXISTS cuidamais_db
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE cuidamais_db;


CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    tipo_perfil ENUM('Paciente', 'Medico') NOT NULL DEFAULT 'Paciente',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- guarda o agendamento das consultas
CREATE TABLE IF NOT EXISTS consultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    medico_especialidade VARCHAR(100) NOT NULL,
    data_consulta DATETIME NOT NULL,
    status ENUM('Pendente', 'Confirmada', 'Realizada', 'Cancelada') DEFAULT 'Pendente',
    observacoes TEXT,
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_consulta_usuario 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
