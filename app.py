from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

# Configuração do Flask (servindo os arquivos estáticos da pasta public)
app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

# Função para conectar ao banco de dados MySQL
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', '0000'),
        database=os.getenv('DB_DATABASE', 'cuidamais_db')
    )

# Rota para abrir as páginas HTML diretamente pelo navegador
@app.route('/')
def index():
    return send_from_directory('public', 'agendamento.html')

# ==========================================
# 1. ROTAS DO VICTOR (Cadastro e Login)
# ==========================================

@app.route('/api/usuarios/cadastro', methods=['POST'])
def cadastrar_usuario():
    dados = request.get_json()
    nome = dados.get('nome')
    email = dados.get('email')
    telefone = dados.get('telefone')
    senha = dados.get('senha')
    perfil = dados.get('perfil', 'paciente')

    if not nome or not email or not senha:
        return jsonify({"erro": "Preencha os campos obrigatórios!"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = "INSERT INTO usuarios (nome, email, telefone, senha, perfil) VALUES (%s, %s, %s, %s, %s)"
        cursor.execute(sql, (nome, email, telefone, senha, perfil))
        conn.commit()
        novo_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({"mensagem": "Usuário cadastrado com sucesso!", "id": novo_id}), 201
    except mysql.connector.Error as err:
        return jsonify({"erro": f"Erro no banco de dados: {err}"}), 500

@app.route('/api/usuarios/login', methods=['POST'])
def login_usuario():
    dados = request.get_json()
    email = dados.get('email')
    senha = dados.get('senha')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    sql = "SELECT id, nome, email, perfil FROM usuarios WHERE email = %s AND senha = %s"
    cursor.execute(sql, (email, senha))
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()

    if usuario:
        return jsonify({"mensagem": "Login com sucesso!", "usuario": usuario}), 200
    else:
        return jsonify({"erro": "E-mail ou senha incorretos!"}), 401

# ==========================================
# 2. ROTAS DA LUDMILA (Agendamento de Consultas)
# ==========================================

@app.route('/api/consultas', methods=['POST'])
def criar_consulta():
    try:
        dados = request.get_json()
        usuario_id = dados.get('usuario_id')
        especialidade = dados.get('medico_especialidade')
        data_consulta = dados.get('data_consulta')
        observacoes = dados.get('observacoes', '')

        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            INSERT INTO consultas (usuario_id, medico_especialidade, data_consulta, observacoes, status)
            VALUES (%s, %s, %s, %s, 'Pendente')
        """
        cursor.execute(query, (usuario_id, especialidade, data_consulta, observacoes))
        conn.commit()
        
        consulta_id = cursor.lastrowid
        cursor.close()
        conn.close()

        return jsonify({'mensagem': 'Consulta agendada com sucesso!', 'id': consulta_id}), 201
    except Exception as e:
        return jsonify({'erro': str(e)}), 500
    
    # Rota para buscar as consultas do paciente em ordem cronológica
@app.route('/api/consultas/paciente/<int:usuario_id>', methods=['GET'])
def buscar_consultas_paciente(usuario_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT id, medico_especialidade, data_consulta, observacoes, status 
            FROM consultas 
            WHERE usuario_id = %s 
            ORDER BY data_consulta ASC
        """
        cursor.execute(query, (usuario_id,))
        consultas = cursor.fetchall()
        
        cursor.close()
        conn.close()

        return jsonify(consultas), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500


# ==========================================
# 3. ROTAS DA LAVÍNIA (Painel do Médico)
# ==========================================

@app.route('/api/consultas', methods=['GET'])
def listar_consultas():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        sql = """
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
        """
        cursor.execute(sql)
        consultas = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(consultas), 200
    except mysql.connector.Error as err:
        return jsonify({"erro": f"Erro ao buscar consultas: {err}"}), 500

@app.route('/api/consultas/<int:id>/confirmar', methods=['PATCH'])
def confirmar_consulta(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = "UPDATE consultas SET status = 'Confirmada' WHERE id = %s"
        cursor.execute(sql, (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"mensagem": "Consulta confirmada com sucesso!"}), 200
    except mysql.connector.Error as err:
        return jsonify({"erro": f"Erro ao confirmar: {err}"}), 500

# Inicialização do servidor na porta 3000
if __name__ == '__main__':
    print(" Servidor Python (Flask) rodando em http://localhost:3000")
    app.run(port=3000, debug=True)
