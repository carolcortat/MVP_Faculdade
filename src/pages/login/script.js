async function logar() {
  const email = document.getElementById('usuario').value;
  const senha = document.getElementById('senha').value;

  if (!email || !senha) {
    alert('Preencha o email e a senha!');
    return;
  }

  try {
    const resposta = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro || 'Email ou senha inválidos');
      return;
    }

    // Salva o token no localStorage
    localStorage.setItem('token', dados.token);
    localStorage.setItem('adminEmail', dados.email);

    window.location.href = '../admin/admin-index.html';

  } catch (erro) {
    alert('Erro ao conectar com o servidor. Verifique se ele está rodando.');
    console.error(erro);
  }
}