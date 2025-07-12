// firebase-init.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCFjnIa0j-Baob7nQI-LoB4QuZuR-n8aLU",
  authDomain: "mj-app-7a391.firebaseapp.com",
  projectId: "mj-app-7a391",
  storageBucket: "mj-app-7a391.firebasestorage.app",
  messagingSenderId: "272178405573",
  appId: "1:272178405573:web:9e8c30f202a03effaf90ac"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// login
window.login = function () {
  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-password').value;

  signInWithEmailAndPassword(auth, email, senha)
    .then(() => {
      window.location.href = "plantao.html";

      // redirecionar para próxima tela
    })
    .catch(error => {
      alert("Erro ao logar: " + error.message);
    });
};

// cadastro
window.cadastrar = async function () {
  const nome = document.getElementById('cad-nome').value;
  const email = document.getElementById('cad-email').value;
  const senha = document.getElementById('cad-senha').value;
  const hospitais = document.getElementById('cad-hospitais').value.split(',');

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);

    await setDoc(doc(db, "medicos", cred.user.uid), {
      nome,
      email,
      hospitais
    });

    alert("Cadastro realizado com sucesso!");
    showLogin();

  } catch (error) {
    alert("Erro ao cadastrar: " + error.message);
  }
};

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
