const apiBase = "https://retrocessive-unaproned-jolyn.ngrok-free.dev";

async function carregarStatuses() {
  try {
    const res = await fetch(`${apiBase}/statuses`);
    const data = await res.json();
    const select = document.getElementById('statusSelect');
    data.forEach(item => {
      if (item.STATUS) {
        const opt = document.createElement('option');
        opt.value = item.STATUS;
        opt.textContent = item.STATUS;
        select.appendChild(opt);
      }
    });
  } catch (err) {
    console.error("Erro ao carregar status:", err);
  }
}

async function carregarOrdens() {
  const status = document.getElementById('statusSelect').value;
  const dataEntrega = document.getElementById('dataEntrega').value;
  const tbody = document.querySelector('#tabelaOrdens tbody');
  const aviso = document.getElementById('avisoAtualizacao');

  if (aviso) aviso.textContent = "🔄 Atualizando dados...";

  tbody.innerHTML = '<tr><td colspan="6" class="loading">Carregando...</td></tr>';

  let url = `${apiBase}/ordens?`;
  if (status) url += `status=${encodeURIComponent(status)}&`;
  if (dataEntrega) url += `dataEntrega=${encodeURIComponent(dataEntrega)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    tbody.innerHTML = '';
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">Nenhuma ordem encontrada.</td></tr>';
    } else {
      data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${item.STATUS_SERVICO || '-'}</td>
          <td>${item.NOME_CLIENTE || '-'}</td>
          <td>${item.DATA_ABERTURA || '-'}</td>
          <td>${item.DATA_ENTREGA || '-'}</td>
          <td>${item.HORA || '-'}</td>
          <td>${item.FUNCIONARIO || '-'}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    if (aviso) {
      aviso.textContent = "✅ Dados atualizados automaticamente às " + new Date().toLocaleTimeString();
      setTimeout(() => (aviso.textContent = ""), 5000);
    }
  } catch (err) {
    console.error("Erro ao carregar ordens:", err);
    tbody.innerHTML = '<tr><td colspan="6">Erro ao carregar dados.</td></tr>';
    if (aviso) aviso.textContent = "⚠️ Erro ao atualizar.";
  }
}

document.getElementById('btnFiltrar').addEventListener('click', carregarOrdens);

carregarStatuses();
carregarOrdens();

// 🕒 Atualiza automaticamente a cada 3 minutos (180.000 ms)
setInterval(() => {
  console.log("⏳ Atualizando dados automaticamente...");
  carregarOrdens();
}, 60000);
