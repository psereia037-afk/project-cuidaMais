document.getElementById('formAgendamento').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede a página de recarregar

    // 1. Pega os dados digitados na tela
    const dadosFormulario = {
        usuario_id: document.getElementById('usuario_id').value,
        medico_especialidade: document.getElementById('especialidade').value,
        data_consulta: document.getElementById('data_consulta').value,
        observacoes: document.getElementById('observacoes').value
    };

    const mensagemDiv = document.getElementById('mensagem');

    try {
        // 2. Envia os dados para a SUA rota no server.js
        const resposta = await fetch('/api/consultas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosFormulario)
        });

        const resultado = await resposta.json();

        // 3. Mostra a resposta do servidor na tela
        if (resposta.ok) {
            mensagemDiv.style.color = 'green';
            mensagemDiv.innerText = '✅ ' + resultado.mensagem;
            document.getElementById('formAgendamento').reset(); // Limpa a tela
        } else {
            // Aqui aparece o aviso caso a data esteja no passado!
            mensagemDiv.style.color = 'red';
            mensagemDiv.innerText = '❌ ' + resultado.erro;
        }
    } catch (erro) {
        mensagemDiv.style.color = 'red';
        mensagemDiv.innerText = '❌ Erro ao conectar com o servidor.';
    }
});




