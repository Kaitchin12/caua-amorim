/* --- CONFIGURAÇÕES --- */
const API_URL = "http://localhost:2005"; 
const nomeUsuarioLogado = localStorage.getItem("usuarioLogado") || "Usuário não identificado";

// Elementos GERAIS
const tabelaMovimentacoes = document.getElementById("tabela-movimentacoes");

// Elementos Modal SAÍDA
const modalSaida = document.getElementById("modalSaida");
const btnNovaSaida = document.getElementById("btnNovaSaida");
const btnConfirmarSaida = document.getElementById("btnConfirmarSaida");
const spanCloseSaida = document.querySelector(".close-saida");
const listaContainerSaida = document.getElementById("listaProdutosSaida");
const inputDataSaida = document.getElementById("dataSaida");

// Elementos Modal ENTRADA
const modalEntrada = document.getElementById("modalEntrada");
const btnNovaEntrada = document.getElementById("btnNovaEntrada");
const btnConfirmarEntrada = document.getElementById("btnConfirmarEntrada");
const spanCloseEntrada = document.querySelector(".close-entrada");
const listaContainerEntrada = document.getElementById("listaProdutosEntrada");
const inputDataEntrada = document.getElementById("dataEntrada");


/* --- FUNÇÃO PARA PEGAR DATA ATUAL FORMATADA (YYYY-MM-DDTHH:MM) --- */
function getDataAtualLocal() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
}

/* --- AO CARREGAR A PÁGINA --- */
window.onload = function() {
    // 1. Exibir nome do usuário
    const pUsuario = document.querySelector(".paragrafo-para-usuario");
    if (pUsuario) pUsuario.innerHTML = `Olá, <strong>${nomeUsuarioLogado}</strong>`;

    // 2. Logout
    const btnLogout = document.querySelector('a[href="login.html"]');
    if (btnLogout) btnLogout.onclick = () => localStorage.removeItem("usuarioLogado");

    // 3. Carregar Tabela
    if (tabelaMovimentacoes) carregarTabelaMovimentacoes();
};


/* --- 1. CARREGAR TABELA DE HISTÓRICO --- */
async function carregarTabelaMovimentacoes() {
    try {
        const response = await fetch(`${API_URL}/mostrarMovimentacao`);
        const dados = await response.json();

        tabelaMovimentacoes.innerHTML = "";

        if (dados.length === 0) {
            tabelaMovimentacoes.innerHTML = "<tr><td colspan='5' style='text-align:center'>Sem movimentações.</td></tr>";
            return;
        }

        dados.forEach(mov => {
            const dataObj = new Date(mov.data_movimentacao);
            const dataFormatada = dataObj.toLocaleDateString('pt-BR') + ' ' + dataObj.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
            
            const cor = mov.tipo === 'ENTRADA' ? 'green' : 'red';
            const ferramenta = mov.nome_produto || `ID: ${mov.id_produto}`;
            const usuario = mov.usuario || 'Sistema';

            const row = `
                <tr>
                    <td>${dataFormatada}</td>
                    <td style="color: ${cor}; font-weight: bold;">${mov.tipo}</td>
                    <td>${ferramenta}</td>
                    <td>${mov.quantidade}</td>
                    <td>${usuario}</td>
                </tr>
            `;
            tabelaMovimentacoes.innerHTML += row;
        });
    } catch (error) { console.error(error); }
}

/* --- FUNÇÃO GENÉRICA PARA CARREGAR PRODUTOS NOS MODAIS --- */
async function carregarProdutosNoModal(container, tipoMovimentacao) {
    container.innerHTML = "<p>Carregando...</p>";
    try {
        const response = await fetch(`${API_URL}/mostrarProduto`);
        const produtos = await response.json();
        container.innerHTML = ""; 

        produtos.forEach(prod => {
            const atributoMax = tipoMovimentacao === 'SAIDA' ? `max="${prod.quantidade}"` : '';
            const textoDisp = tipoMovimentacao === 'SAIDA' ? `(Disp: ${prod.quantidade})` : `(Atual: ${prod.quantidade})`;
            
            // --- AVISO DE ESTOQUE BAIXO ---
            let avisoBaixo = "";
            const minimo = prod.estoque_minimo || 5; // Padrão 5 se não tiver definido
            
            // Se o estoque atual for menor ou igual ao mínimo E estivermos no modal de SAÍDA
            if (tipoMovimentacao === 'SAIDA' && prod.quantidade <= minimo) {
                avisoBaixo = `<span style="color: red; font-weight: bold; font-size: 0.85em; margin-left: 5px;">⚠️ ESTOQUE BAIXO!</span>`;
            }

            // Cria a linha
            const div = document.createElement("div");
            div.className = "lista-item-row";
            div.style = "display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee; padding:5px;";
            
            div.innerHTML = `
                <label style="flex:1;">
                    <input type="checkbox" value="${prod.id}" data-estoque="${prod.quantidade}">
                    ${prod.nome_prod} ${textoDisp} ${avisoBaixo}
                </label>
                <input type="number" class="input-qtd" placeholder="Qtd" min="1" ${atributoMax} disabled style="width:70px;">
            `;

            // Lógica do Checkbox
            const chk = div.querySelector("input[type='checkbox']");
            const input = div.querySelector(".input-qtd");
            
            chk.addEventListener("change", () => {
                input.disabled = !chk.checked;
                if(chk.checked) input.focus(); else input.value = "";
            });

            container.appendChild(div);
        });
    } catch (error) { console.error(error); }
}


/* --- 2. LÓGICA DE SAÍDA --- */
if(btnNovaSaida) {
    btnNovaSaida.onclick = () => {
        modalSaida.style.display = "flex";
        inputDataSaida.value = getDataAtualLocal(); // Preenche com agora
        carregarProdutosNoModal(listaContainerSaida, 'SAIDA');
    };
}
if(spanCloseSaida) spanCloseSaida.onclick = () => modalSaida.style.display = "none";

if(btnConfirmarSaida) {
    btnConfirmarSaida.onclick = () => processarMovimentacao(listaContainerSaida, 'SAIDA', inputDataSaida.value);
}


/* --- 3. LÓGICA DE ENTRADA --- */
if(btnNovaEntrada) {
    btnNovaEntrada.onclick = () => {
        modalEntrada.style.display = "flex";
        inputDataEntrada.value = getDataAtualLocal(); // Preenche com agora
        carregarProdutosNoModal(listaContainerEntrada, 'ENTRADA');
    };
}
if(spanCloseEntrada) spanCloseEntrada.onclick = () => modalEntrada.style.display = "none";

if(btnConfirmarEntrada) {
    btnConfirmarEntrada.onclick = () => processarMovimentacao(listaContainerEntrada, 'ENTRADA', inputDataEntrada.value);
}

// Fechar ao clicar fora
window.onclick = (e) => {
    if(e.target == modalSaida) modalSaida.style.display = "none";
    if(e.target == modalEntrada) modalEntrada.style.display = "none";
};


/* --- 4. FUNÇÃO CENTRAL DE ENVIO (FETCH) --- */
async function processarMovimentacao(container, tipo, dataEscolhida) {
    const checkboxes = container.querySelectorAll("input[type='checkbox']:checked");
    if (checkboxes.length === 0) return alert("Selecione itens.");

    // Formata a data para MySQL (troca o T por espaço)
    const dataFormatada = dataEscolhida.replace("T", " "); 

    const itens = [];
    let erro = false;

    checkboxes.forEach(chk => {
        const row = chk.parentElement.parentElement;
        const input = row.querySelector(".input-qtd");
        const qtd = parseInt(input.value);
        const estoque = parseInt(chk.dataset.estoque);

        if (!qtd || qtd <= 0) { alert("Quantidade inválida."); erro = true; return; }
        
        // Validação só para SAÍDA
        if (tipo === 'SAIDA' && qtd > estoque) { 
            alert("Estoque insuficiente para um dos itens."); erro = true; return; 
        }

        itens.push({
            id_produto: chk.value,
            tipo: tipo === 'SAIDA' ? "SAIDA" : "ENTRADA",
            quantidade: qtd,
            observacao: `${tipo} via Web`,
            usuario: nomeUsuarioLogado,
            data_movimentacao: dataFormatada // Envia a data escolhida
        });
    });

    if (erro) return;

    try {
        const response = await fetch(`${API_URL}/movimentacao`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itens)
        });

        if (response.ok) {
            alert(`${tipo} registrada com sucesso!`);
            window.location.reload();
        } else {
            alert("Erro no servidor.");
        }
    } catch (error) {
        alert("Erro de conexão.");
    }
}