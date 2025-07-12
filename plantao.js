// plantao.js

import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from './firebase-init.js';

const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const selectInicio = document.getElementById("hora-inicio");
  const selectFim = document.getElementById("hora-fim");

  // Verifica se os selects existem
  if (!selectInicio || !selectFim) {
    console.error("Campos de hora não encontrados no HTML!");
    return;
  }

  // Preenche apenas com horas cheias (00:00, 01:00, ..., 23:00)
  for (let h = 0; h < 24; h++) {
    const hora = `${h.toString().padStart(2, '0')}:00`;

    const optInicio = document.createElement("option");
    optInicio.value = hora;
    optInicio.text = hora;
    selectInicio.appendChild(optInicio);

    const optFim = document.createElement("option");
    optFim.value = hora;
    optFim.text = hora;
    selectFim.appendChild(optFim);
  }
});



let userUID = null;

onAuthStateChanged(auth, user => {
  if (user) {
    userUID = user.uid;
    carregarPlantoes();
  } else {
    alert("Usuário não autenticado. Redirecionando para login.");
    window.location.href = "index.html";
  }
});


window.mostrarResumo = function () {
  const hospital = document.getElementById("hospital").value;
  const data = document.getElementById("data-plantao").value;
  const inicio = document.getElementById("hora-inicio").value;
  const fim = document.getElementById("hora-fim").value;

  if (!hospital || !data || !inicio || !fim) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  const textoResumo = `Hospital: ${hospital}
Data: ${data}
Início: ${inicio}
Término: ${fim}`;

  document.getElementById("resumo-texto").innerText = textoResumo;
  document.getElementById("resumo").classList.remove("hidden");
};

window.confirmarPlantao = async function () {
  const hospital = document.getElementById("hospital").value;
  const data = document.getElementById("data-plantao").value;
  const inicio = document.getElementById("hora-inicio").value;
  const fim = document.getElementById("hora-fim").value;

  try {
    await addDoc(collection(db, "plantoes"), {
      uid: userUID,
      hospital,
      data,
      inicio,
      fim,
      criadoEm: new Date()
    });

    mostrarMensagem("Plantão registrado com sucesso!", "sucesso");
    window.location.reload();
  } catch (e) {
    mostrarMensagem("Erro ao cadastrar: " + error.message, "erro");
  }
};

import { getDocs, query, where, collection, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let plantoesDoUsuario = [];

async function carregarPlantoes() {
  const q = query(collection(db, "plantoes"), where("uid", "==", userUID));
  const snapshot = await getDocs(q);

  const lista = document.getElementById("lista-plantoes");
  lista.innerHTML = "";
  plantoesDoUsuario = [];

  const dadosOrdenados = [];
  snapshot.forEach(docSnap => {
    dadosOrdenados.push({ id: docSnap.id, ...docSnap.data() });
  });

  // Ordenar por data crescente
  dadosOrdenados.sort((a, b) => new Date(a.data) - new Date(b.data));

  dadosOrdenados.forEach(dados => {
    const item = document.createElement("li");
    item.innerHTML = `
      <strong>${dados.data}</strong> - ${dados.hospital} (${dados.inicio} às ${dados.fim})
      <button onclick="editarPlantao('${dados.id}')">Editar</button>
      <button onclick="excluirPlantao('${dados.id}')">Excluir</button>
    `;
    lista.appendChild(item);
    plantoesDoUsuario.push(dados);
  });
}



window.editarPlantao = function (id) {
  const plantao = plantoesDoUsuario.find(p => p.id === id);
  if (!plantao) return;

  document.getElementById("hospital").value = plantao.hospital;
  document.getElementById("data-plantao").value = plantao.data;
  document.getElementById("hora-inicio").value = plantao.inicio;
  document.getElementById("hora-fim").value = plantao.fim;

  document.getElementById("resumo").classList.remove("hidden");
  document.getElementById("resumo-texto").innerText = `Editando: ${plantao.data} - ${plantao.hospital}`;

  window._plantaoEditando = id; // armazena ID temporariamente
};

window.excluirPlantao = async function (id) {
  if (confirm("Tem certeza que deseja excluir este plantão?")) {
    await deleteDoc(doc(db, "plantoes", id));
    alert("Plantão excluído com sucesso.");
    carregarPlantoes();
  }
};

window.confirmarPlantao = async function () {
  const hospital = document.getElementById("hospital").value;
  const data = document.getElementById("data-plantao").value;
  const inicio = document.getElementById("hora-inicio").value;
  const fim = document.getElementById("hora-fim").value;

  try {
    if (window._plantaoEditando) {
      await updateDoc(doc(db, "plantoes", window._plantaoEditando), {
        hospital, data, inicio, fim
      });
      alert("Plantão atualizado!");
      window._plantaoEditando = null;
    } else {
      await addDoc(collection(db, "plantoes"), {
        uid: userUID, hospital, data, inicio, fim, criadoEm: new Date()
      });
      mostrarMensagem("Plantão registrado com sucesso!", "sucesso");
    }

    window.location.reload();
  } catch (e) {
    mostrarMensagem("Erro ao cadastrar: " + error.message, "erro");
  }
};

import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
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

document.getElementById("btn-resumo").addEventListener("click", mostrarResumo);

