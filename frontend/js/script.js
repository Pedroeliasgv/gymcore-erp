// --- AUTHENTICATION CHECK ---
if (!localStorage.getItem('gymcore_token')) {
    window.location.href = 'login.html';
}

function carregarDadosPerfil() {
    const userName = localStorage.getItem('gymcore_user') || 'Usuário';
    const userEmail = localStorage.getItem('gymcore_email') || 'email@gymcore.com';
    
    document.getElementById('profileNameDisplay').textContent = userName;
    document.getElementById('profileEmailDisplay').textContent = userEmail;
    
    // Generate avatar based on name
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=00e676&color=000&bold=true`;
    document.getElementById('topbarAvatar').src = avatarUrl;
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

const API_BASE_URL = "http://localhost:5105/api";

// DOM Elements & Charts
let revenueChartInstance = null;
let attendanceChartInstance = null;

async function fetchData(endpoint) {
    try {
        const res = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (res.ok) return await res.json();
        return null;
    } catch (e) {
        console.error(`Error fetching ${endpoint}`, e);
        return null;
    }
}

async function loadDashboard() {
    const data = await fetchData('dashboard');
    if (!data) return;

    // Update Metrics
    document.querySelector('.metric-card:nth-child(1) .metric-value').innerHTML = `${data.alunosAtivos} <span class="trend up"><i class="fa-solid fa-arrow-up"></i></span>`;
    document.querySelector('.metric-card:nth-child(2) .metric-value').innerHTML = `R$ ${data.receitaMensal.toLocaleString('pt-BR')} <span class="trend up"><i class="fa-solid fa-arrow-up"></i></span>`;
    document.querySelector('.metric-card:nth-child(3) .metric-value').innerHTML = `${data.inadimplencia}% <span class="trend down"><i class="fa-solid fa-arrow-down"></i></span>`;
    document.querySelector('.metric-card:nth-child(4) .metric-value').innerHTML = `${data.checkInsHoje}`;

    // Update Charts
    if (revenueChartInstance) {
        revenueChartInstance.data.datasets[0].data = data.graficoReceita;
        revenueChartInstance.update();
    }
}

function initCharts() {
    const revenueCtx = document.getElementById('revenueChart');
    const attendanceCtx = document.getElementById('attendanceChart');

    if (revenueCtx) {
        revenueChartInstance = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Receita (R$)',
                    data: [32000, 34500, 36000, 38200, 41000, 45230], // Will be updated by API
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2, fill: true, tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#334155' } }, x: { grid: { display: false } } } }
        });
    }

    if (attendanceCtx) {
        attendanceChartInstance = new Chart(attendanceCtx, {
            type: 'bar',
            data: {
                labels: ['06h', '09h', '12h', '15h', '18h', '20h'],
                datasets: [{ label: 'Check-ins', data: [85, 45, 60, 40, 150, 110], backgroundColor: '#3b82f6', borderRadius: 6 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#334155' } }, x: { grid: { display: false } } } }
        });
    }
}

// Navigation
document.querySelectorAll('.nav-item').forEach(button => {
    button.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
        const targetId = e.currentTarget.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');

        // Load specific section data
        if (targetId === 'dashboard') loadDashboard();
        if (targetId === 'alunos') carregarAlunos();
        if (targetId === 'financeiro') carregarFinanceiro();
        if (targetId === 'treinos') carregarTreinos();
        if (targetId === 'planos') carregarPlanos();
        if (targetId === 'operacional') carregarCheckins();
    });
});

function openModal(modalId) { document.getElementById(modalId).classList.add('active'); }
function closeModal(modalId) { document.getElementById(modalId).classList.remove('active'); }

// ALUNOS
async function carregarAlunos() {
    alunos = await fetchData('alunos') || [];
    renderAlunos();
}

async function salvarAluno() {
    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const plano = document.getElementById("plano").value;
    if (!nome || !cpf) return alert("Preencha Nome e CPF.");

    try {
        const response = await fetch(`${API_BASE_URL}/alunos`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, cpf, plano, status: 'Ativo' })
        });
        if (response.ok) {
            carregarAlunos();
            document.getElementById("formAluno").reset();
            closeModal('modalAluno');
            loadDashboard(); // Refresh dash
        }
    } catch (e) { alert("Erro ao cadastrar aluno."); }
}

function renderAlunos() {
    const tbody = document.getElementById("listaAlunos");
    tbody.innerHTML = "";
    if (alunos.length === 0) return tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhum aluno.</td></tr>`;

    alunos.forEach(a => {
        const badgeClass = a.status === 'Ativo' ? 'success' : 'danger';
        tbody.innerHTML += `
            <tr>
                <td><strong>${a.nome}</strong></td><td>${a.cpf}</td><td>${a.plano}</td>
                <td><span class="badge ${badgeClass}">${a.status}</span></td>
                <td><button class="icon-btn" style="width:30px; height:30px;" title="Registrar Acesso" onclick="registrarCheckin('${a.nome}')"><i class="fa-solid fa-arrow-right-to-bracket text-success"></i></button></td>
            </tr>`;
    });
}

async function registrarCheckin(alunoNome) {
    try {
        const response = await fetch(`${API_BASE_URL}/checkins`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nomeAluno: alunoNome, status: 'Liberado', motivo: 'Catraca 1' })
        });
        if (response.ok) {
            alert(`Check-in de ${alunoNome} registrado com sucesso!`);
            loadDashboard();
        }
    } catch (e) { console.error(e); }
}

// FINANCEIRO
async function carregarFinanceiro() {
    const transacoes = await fetchData('transacoes') || [];
    const tbody = document.querySelector("#financeiro .data-table tbody");
    
    // Calcular metricas
    let saldo = 0;
    let receber = 0;
    let inadimplencia = 3480; // Hardcoded mock
    
    transacoes.forEach(t => {
        if (t.status === 'Pago') {
            if (t.tipo === 'Entrada') saldo += t.valor;
            else saldo -= t.valor;
        } else if (t.tipo === 'Entrada') {
            receber += t.valor;
        }
    });
    
    document.getElementById('finSaldo').textContent = `R$ ${saldo.toFixed(2).replace('.',',')}`;
    document.getElementById('finReceber').textContent = `R$ ${receber.toFixed(2).replace('.',',')}`;
    document.getElementById('finInadimplencia').textContent = `R$ ${inadimplencia.toFixed(2).replace('.',',')}`;

    if(transacoes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhuma transação financeira.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = "";
    transacoes.forEach(t => {
        const isEntrada = t.tipo === 'Entrada';
        const color = isEntrada ? 'text-success' : 'text-danger';
        const symbol = isEntrada ? '+' : '-';
        tbody.innerHTML += `
            <tr>
                <td>${new Date(t.data).toLocaleDateString()}</td>
                <td>${t.descricao}</td>
                <td>${t.tipo}</td>
                <td class="${color}">${symbol} R$ ${t.valor.toFixed(2)}</td>
                <td><span class="badge ${t.status === 'Pago' ? 'success' : 'warning'}">${t.status}</span></td>
            </tr>
        `;
    });
}

async function salvarTransacao() {
    const descricao = document.getElementById('transDescricao').value;
    const tipo = document.getElementById('transTipo').value;
    const valor = parseFloat(document.getElementById('transValor').value);
    
    if (!descricao || !valor) return alert('Preencha os campos obrigatórios!');
    
    try {
        const res = await fetch(`${API_BASE_URL}/transacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao, tipo, valor, data: new Date().toISOString(), status: 'Pago' })
        });
        
        if (res.ok) {
            closeModal('modalTransacao');
            document.getElementById('formTransacao').reset();
            carregarFinanceiro();
            loadDashboard();
        }
    } catch (e) {
        console.error(e);
        alert('Erro ao salvar transação.');
    }
}

// TREINOS
async function carregarTreinos() {
    const treinos = await fetchData('treinos') || [];
    const grid = document.querySelector(".workouts-grid");
    
    if(treinos.length === 0) {
        grid.innerHTML = `<p class="text-muted text-center w-100" style="grid-column: 1/-1; padding: 40px; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px dashed var(--border-color);">Nenhuma ficha cadastrada. Clique em "Nova Ficha".</p>`;
        return;
    }

    grid.innerHTML = "";
    treinos.forEach(t => {
        const badge = t.nivel === 'Iniciante' ? 'info' : (t.nivel === 'Avançado' ? 'danger' : 'warning');
        grid.innerHTML += `
            <div class="workout-card">
                <div class="workout-header">
                <h3>${t.nome}</h3><span class="badge ${badge}">${t.nivel}</span>
                </div>
                <p>${t.descricao}</p>
                <div class="workout-meta">
                <span><i class="fa-solid fa-user-tie"></i> Inst. ${t.instrutor}</span>
                <span><i class="fa-solid fa-users"></i> ${t.quantidadeAlunos} alunos</span>
                </div>
            </div>
        `;
    });
}

async function salvarTreino() {
    const nome = document.getElementById('treinoNome').value;
    const nivel = document.getElementById('treinoNivel').value;
    const instrutor = document.getElementById('treinoInstrutor').value;
    
    if (!nome || !instrutor) return alert('Preencha os campos obrigatórios!');
    
    try {
        const res = await fetch(`${API_BASE_URL}/treinos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, nivel, descricao: 'Ficha padronizada pelo instrutor', instrutor, quantidadeAlunos: 0 })
        });
        
        if (res.ok) {
            closeModal('modalTreino');
            document.getElementById('formTreino').reset();
            carregarTreinos();
        }
    } catch (e) {
        console.error(e);
        alert('Erro ao salvar treino.');
    }
}

// PLANOS
async function carregarPlanos() {
    const planos = await fetchData('planos') || [];
    const grid = document.querySelector(".plans-grid");
    
    if(planos.length === 0) {
        grid.innerHTML = `<p class="text-muted text-center w-100" style="grid-column: 1/-1; padding: 40px; background: rgba(0,0,0,0.2); border-radius: 12px; border: 1px dashed var(--border-color);">Nenhum plano configurado. Clique em "Novo Plano" para cadastrar.</p>`;
        return;
    }

    grid.innerHTML = "";
    planos.forEach(p => {
        const featClass = p.destaque ? "featured" : "";
        const badge = p.destaque ? `<div class="featured-badge">Mais Popular</div>` : "";
        
        let benHtml = p.beneficios.split(',').map(b => `<li><i class="fa-solid fa-check"></i> ${b.trim()}</li>`).join('');
        
        grid.innerHTML += `
            <div class="plan-card ${featClass}">
                ${badge}
                <h3>${p.nome}</h3>
                <div class="plan-price">R$ ${p.valorMensal.toFixed(2)}<span>/mês</span></div>
                <ul class="plan-features">${benHtml}</ul>
                <div style="display: flex; gap: 10px; margin-top: auto;">
                    <button class="btn btn-outline" style="flex: 1;" onclick="alert('Edição será implementada em breve!')"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color); border: 1px solid var(--danger-color);" onclick="excluirPlano(${p.id})"><i class="fa-solid fa-trash"></i> Excluir</button>
                </div>
            </div>
        `;
    });
}

async function salvarPlano() {
    const nome = document.getElementById('planoNome').value;
    const valorMensal = parseFloat(document.getElementById('planoValor').value);
    const beneficios = document.getElementById('planoBeneficios').value;
    const destaque = document.getElementById('planoDestaque').checked;
    
    if (!nome || !valorMensal || !beneficios) return alert('Preencha os campos obrigatórios!');
    
    try {
        const res = await fetch(`${API_BASE_URL}/planos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, valorMensal, beneficios, destaque })
        });
        
        if (res.ok) {
            closeModal('modalPlano');
            document.getElementById('formPlano').reset();
            carregarPlanos();
        } else {
            alert('Erro ao salvar plano.');
        }
    } catch (e) {
        console.error(e);
        alert('Erro ao salvar plano.');
    }
}

async function excluirPlano(id) {
    if (!confirm('Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.')) return;
    
    try {
        const res = await fetch(`${API_BASE_URL}/planos/${id}`, { method: 'DELETE' });
        if (res.ok) {
            carregarPlanos();
        } else {
            alert('Erro ao excluir plano.');
        }
    } catch (e) {
        console.error(e);
        alert('Erro ao excluir plano.');
    }
}

// OPERACIONAL
async function carregarCheckins() {
    const checkins = await fetchData('checkins') || [];
    const ul = document.querySelector(".feed-list");
    
    if(checkins.length === 0) {
        ul.innerHTML = `<li><div class="feed-info text-muted">Nenhum acesso registrado hoje.</div></li>`;
        return;
    }

    ul.innerHTML = "";
    checkins.forEach(c => {
        const time = new Date(c.dataHora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const badgeClass = c.status === 'Liberado' ? 'success' : 'danger';
        ul.innerHTML += `
            <li>
                <div class="feed-time">${time}</div>
                <div class="feed-info">
                  <strong>${c.nomeAluno}</strong> ${c.status.toLowerCase()}
                  <span class="badge ${badgeClass}">${c.motivo}</span>
                </div>
            </li>
        `;
    });
}

// Profile logic
function openProfileModal() {
    document.getElementById('profileNome').value = localStorage.getItem('gymcore_user') || '';
    document.getElementById('profileEmail').value = localStorage.getItem('gymcore_email') || '';
    document.getElementById('profileSenha').value = '';
    openModal('modalProfile');
}

async function salvarPerfil() {
    const nome = document.getElementById('profileNome').value;
    const email = document.getElementById('profileEmail').value;
    const senha = document.getElementById('profileSenha').value;
    const userId = localStorage.getItem('gymcore_userid');
    
    if (!userId || userId === "0") {
        alert("O usuário Administrador padrão (Demo) não pode ter seu perfil editado via API.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, email: email, novaSenha: senha })
        });

        if (response.ok) {
            const result = await response.json();
            localStorage.setItem('gymcore_user', result.user);
            localStorage.setItem('gymcore_email', result.email);
            carregarDadosPerfil();
            closeModal('modalProfile');
            alert("Perfil atualizado com sucesso!");
        } else {
            alert("Erro ao atualizar o perfil.");
        }
    } catch (error) {
        console.error("Error updating profile:", error);
    }
}

// INIT
window.addEventListener('DOMContentLoaded', () => {
    initCharts();
    loadDashboard();
    fetchAlunos();
    carregarDadosPerfil();
});
