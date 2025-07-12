import { getFirestore, collection, getDocs, query, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from './firebase-init.js';

const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("Usuário não autenticado.");
    window.location.href = "index.html";
    return;
  }

  const medicoRef = doc(db, "medicos", user.uid);
  const medicoSnap = await getDoc(medicoRef);

  if (!medicoSnap.exists() || medicoSnap.data().role !== "admin") {
    alert("Acesso negado. Esta área é restrita a administradores.");
    window.location.href = "index.html";
    return;
  }

  carregarPainelAdmin();
});

async function carregarPainelAdmin() {
  const conteudo = document.getElementById("conteudo-admin");
  conteudo.innerHTML = "<p>Carregando dados...</p>";

  // 1. Buscar todos os médicos
  const medicosSnap = await getDocs(collection(db, "medicos"));
  const medicos = {};
  medicosSnap.forEach(doc => {
    medicos[doc.id] = doc.data();
  });

  // 2. Buscar todos os plantões
  const plantoesSnap = await getDocs(collection(db, "plantoes"));
  const agrupado = {};

  plantoesSnap.forEach(doc => {
    const dados = doc.data();
    const uid = dados.uid;
    if (!agrupado[uid]) agrupado[uid] = [];
    agrupado[uid].push(dados);
  });

  // 3. Renderizar agrupado por médico
  conteudo.innerHTML = "";
  for (const uid in agrupado) {
    const medico = medicos[uid];
    if (!medico) continue;

    const bloco = document.createElement("div");
    bloco.classList.add("card");
    bloco.innerHTML = `
      <h3>${medico.nome}</h3>
      <p><strong>Hospitais:</strong> ${medico.hospitais.join(", ")}</p>
      <ul>
        ${agrupado[uid].map(p => `
          <li>${p.data} | ${p.hospital} | ${p.inicio} - ${p.fim}</li>
        `).join("")}
      </ul>
    `;
    conteudo.appendChild(bloco);
  }
}

import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

window.exportarCSV = async function () {
  const plantoesSnap = await getDocs(collection(db, "plantoes"));
  let csv = "Médico,CRM,Hospital,Data,Início,Fim\n";

  const medicosSnap = await getDocs(collection(db, "medicos"));
  const medicos = {};
  medicosSnap.forEach(doc => {
    medicos[doc.id] = doc.data();
  });

  plantoesSnap.forEach(doc => {
    const dados = doc.data();
    const medico = medicos[dados.uid];
    if (!medico) return;

    csv += `${medico.nome},,${dados.hospital},${dados.data},${dados.inicio},${dados.fim}\n`;

  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'relatorio_plantoes.csv';
  a.click();
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
