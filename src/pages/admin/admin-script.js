const API = 'http://localhost:3000/api';

// Verifica se está logado
const token = localStorage.getItem('token');
if (!token) {
  alert('Acesso negado! Faça login primeiro.');
  window.location.href = '../login/index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('add-event-btn');
  const cancelBtn = document.getElementById('cancel-add-event-btn');
  const cancelFormBtn = document.getElementById('cancel-form-btn');
  const overlay = document.getElementById('modal-overlay');
  const form = document.getElementById('event-form');

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminEmail');
    window.location.href = '../login/index.html';
  });


  // Carrega eventos do banco ao abrir a página
  carregarEventos();

  // Abre o modal
  addBtn.addEventListener('click', () => {
    overlay.classList.add('ativo');
  });

  // Fecha o modal
  function fecharModal() {
    overlay.classList.remove('ativo');
    form.reset();
  }

  cancelBtn.addEventListener('click', fecharModal);
  cancelFormBtn.addEventListener('click', fecharModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) fecharModal();
  });

  // Submete o formulário
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nome = document.getElementById('event-title').value.trim();
    const data = document.getElementById('event-date').value.trim();
    const horario = document.getElementById('event-horario').value.trim();
    const local = document.getElementById('event-local').value.trim();
    const descricao = document.getElementById('event-theme').value.trim();
    const imagem_url = document.getElementById('event-imagem').value.trim();
    if (!nome || !data || !local) {
      alert('Preencha pelo menos nome, data e local.');
      return;
    }

    try {
      const resposta = await fetch(`${API}/eventos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nome, data, horario, local, descricao, imagem_url })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(dados.erro || 'Erro ao cadastrar evento.');
        return;
      }

      alert('Evento cadastrado com sucesso!');
      fecharModal();
      carregarEventos();

    } catch (erro) {
      alert('Erro ao conectar com o servidor.');
      console.error(erro);
    }
  });
});

async function carregarEventos() {
  const container = document.querySelector('.container-cards-eventos');
  container.innerHTML = '<p>Carregando eventos...</p>';

  try {
    const resposta = await fetch(`${API}/eventos`);
    const eventos = await resposta.json();

    if (eventos.length === 0) {
      container.innerHTML = '<p>Nenhum evento cadastrado ainda.</p>';
      return;
    }

    container.innerHTML = eventos.map(evento => `
      <div class="card-evento" data-id="${evento.id}">
        ${evento.imagem_url ? `<img src="${evento.imagem_url}" alt="${evento.nome}" onerror="this.style.display='none'">` : ''}
        <h3>${evento.nome}</h3>
        ${evento.data ? `<p><strong>Data:</strong> ${formatarData(evento.data)}</p>` : ''}
        ${evento.horario ? `<p><strong>Horário:</strong> ${evento.horario}</p>` : ''}
        ${evento.local ? `<p><strong>Local:</strong> ${evento.local}</p>` : ''}
        ${evento.descricao ? `<p><strong>Descrição:</strong> ${evento.descricao}</p>` : ''}
        <button class="delete-btn" onclick="excluirEvento(${evento.id})">Excluir</button>
      </div>
    `).join('');

  } catch (erro) {
    container.innerHTML = '<p>Erro ao carregar eventos.</p>';
    console.error(erro);
  }
}

async function excluirEvento(id) {
  if (!confirm('Deseja realmente excluir este evento?')) return;

  try {
    const resposta = await fetch(`${API}/eventos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro || 'Erro ao excluir evento.');
      return;
    }

    carregarEventos();

  } catch (erro) {
    alert('Erro ao conectar com o servidor.');
    console.error(erro);
  }
}

function formatarData(data) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}