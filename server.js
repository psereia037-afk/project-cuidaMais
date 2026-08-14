const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o Banco de Dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0000', // Insira a senha do seu MySQL se houver
    database: 'cuidamais_db'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar no banco:', err.message);
        return;
    }
    console.log('✅ Conectado ao banco cuidamais_db!');
});

// ==========================================
// PARTE DA LUDMILA: AGENDAMENTO E CONSULTAS
// ==========================================

// 1. ROTA PARA AGENDAR UMA NOVA CONSULTA
app.post('/api/consultas', (req, res) => {
    const { usuario_id, medico_especialidade, data_consulta, observacoes } = req.body;

    // Regra de Validação: Não permite agendar no passado
    const dataAtual = new Date();
    const dataAgendada = new Date(data_consulta);

    if (dataAgendada < dataAtual) {
        return res.status(400).json({ erro: 'A data da consulta precisa ser no futuro!' });
    }

    // Insere o agendamento no banco de dados
    const sql = 'INSERT INTO consultas (usuario_id, medico_especialidade, data_consulta, observacoes) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [usuario_id, medico_especialidade, data_consulta, observacoes], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao salvar o agendamento.' });
        }
        res.json({ mensagem: 'Consulta agendada com sucesso!', id: result.insertId });
    });
});

// 2. ROTA PARA BUSCAR AS CONSULTAS DO PACIENTE
app.get('/api/consultas/paciente/:usuario_id', (req, res) => {
    const { usuario_id } = req.params;

    // Busca no banco todas as consultas daquele paciente específico
    const sql = 'SELECT * FROM consultas WHERE usuario_id = ? ORDER BY data_consulta DESC';
    
    db.query(sql, [usuario_id], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao buscar consultas.' });
        }
        res.json(results);
    });
});


// Inicializa o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// ==========================================
// ROTAS DA LAVÍNIA (Painel do Médico / Gestão)
// ==========================================

// 1. Rota GET: Busca todas as consultas no MySQL com o nome do paciente
app.get('/api/consultas', (req, res) => {
    // Busca as consultas e faz JOIN para pegar o nome do paciente que o Victor cadastrou
    const sql = `
        SELECT 
            c.id, 
            u.nome AS paciente, 
            c.medico_especialidade AS especialidade, 
            DATE_FORMAT(c.data_consulta, '%Y-%m-%d') AS data, 
            DATE_FORMAT(c.data_consulta, '%H:%i') AS horario, 
            c.status 
        FROM consultas c
        JOIN usuarios u ON c.usuario_id = u.id
        ORDER BY c.data_consulta ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erro ao buscar consultas:", err);
            return res.status(500).json({ erro: "Erro ao buscar consultas." });
        }
        res.status(200).json(results);
    });
});

// 2. Rota PATCH: Atualiza o status da consulta no MySQL para 'Confirmada'
app.patch('/api/consultas/:id/confirmar', (req, res) => {
    const { id } = req.params;

    const sql = "UPDATE consultas SET status = 'Confirmada' WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Erro ao confirmar consulta:", err);
            return res.status(500).json({ erro: "Erro ao confirmar consulta no banco." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: "Consulta não encontrada." });
        }

        res.status(200).json({ 
            mensagem: "Consulta confirmada com sucesso!" 
        });
    });
});
//VICTOR

const express = require("express");
const app = express();

app.use(express.json());

let usuarios = [];

// Cadastro
app.post("/cadastro", (req, res) => {
    const { nome, email, telefone, senha, perfil } = req.body;

    usuarios.push({ nome, email, telefone, senha, perfil });

    res.json({ mensagem: "Usuário cadastrado com sucesso!" });
});

// Login (simulado)
app.post("/login", (req, res) => {
    const { email, senha } = req.body;

    const usuario = usuarios.find(
        u => u.email === email && u.senha === senha
    );

    if (!usuario) {
        return res.status(401).json({ mensagem: "Login inválido" });
    }

    res.json({
        mensagem: "Login realizado",
        perfil: usuario.perfil
    });
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});

     
