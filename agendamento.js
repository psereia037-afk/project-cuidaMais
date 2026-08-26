document.addEventListener('DOMContentLoaded', () => {
const form = document.querySelector('form');

if (!form) return;

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Pega os campos do formulário de agendamento
    const dados = {
usuario_id: document.querySelector('input[type="number"], input[placeholder*="Ex"]').value,
medico_especialidade: document.querySelector('select').value,
data_consulta: document.querySelector('input[type="datetime-local"], input[type="date"]').value,
observacoes: document.querySelector('textarea') ? document.querySelector('textarea').value : ''
    };

    try {
      // Envia os dados para a rota do Flask na porta 3000
const res = await fetch('http://127.0.0.1:3000/api/consultas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    document.addEventListener('DOMContentLoaded', async () => {
  // 1. Pega o ID do paciente que ficou salvo no cadastro
  const usuarioId = localStorage.getItem('usuario_id');

  if (!usuarioId) return;

 try {
    // 2. Chama a NOVA rota do Python passando o ID do paciente
    const res = await fetch(`http://127.0.0.1:3000/api/consultas/paciente/${usuarioId}`);
    const consultas = await res.json();

    // 3. Pega a tabela na tela
    const tabela = document.getElementById('lista-consultas-paciente');
    if (!tabela) return;
    
    tabela.innerHTML = '';

    // 4. Preenche a tabela com as consultas que o Python já entregou em ordem cronológica
    consultas.forEach(c => {
const dataFormatada = new Date(c.data_consulta).toLocaleString('pt-BR');
    tabela.innerHTML += `
        <tr>
        <td>${c.medico_especialidade}</td>
        <td>${dataFormatada}</td>
        <td>${c.status}</td>
        </tr>
    `;
    });
} catch (erro) {
    console.error('Erro ao buscar histórico do paciente:', erro);
}
});

    const resultado = await res.json();

    if (res.ok) {
        alert('✅ Consulta agendada com sucesso!');
        window.location.href = 'painel.html'; // Leva para o painel do hospital
    } else {
        alert(`⚠️ Erro ao agendar: ${resultado.erro || resultado.mensagem}`);
    }
    } catch (error) {
    alert(`❌ Erro de Conexão: ${error.message}\nVerifique se o python app.py está rodando no terminal!`);
    }
});
});
