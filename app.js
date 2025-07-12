function showCadastro() {
  document.getElementById('form-login').classList.add('hidden');
  document.getElementById('form-cadastro').classList.remove('hidden');
}

function showLogin() {
  document.getElementById('form-cadastro').classList.add('hidden');
  document.getElementById('form-login').classList.remove('hidden');
}

function login() {
  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-password').value;

  alert(`Tentando login com\nEmail: ${email}\nSenha: ${senha}`);
  // Aqui futuramente integrará com Firebase Authentication
}



function mostrarMensagem(texto, tipo = "sucesso") {
  const div = document.getElementById("mensagem");
  if (!div) return;
  div.innerText = texto;
  div.classList.remove("hidden");
  div.classList.remove("erro", "sucesso");
  div.classList.add(tipo);

  setTimeout(() => {
    div.classList.add("hidden");
  }, 3000);
}
