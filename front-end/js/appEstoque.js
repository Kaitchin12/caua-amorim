// --- VARIÁVEIS DO MODAL (Mantido) ---
var modal = document.getElementById("myModal");
var btn = document.getElementById("myBtn"); // Botão que abre o modal
var span = document.getElementsByClassName("close")[0];

if(btn) btn.onclick = function() { modal.style.display = "flex"; }
if(span) span.onclick = function() { modal.style.display = "none"; }
window.onclick = function(event) {
  if (event.target == modal) { modal.style.display = "none"; }
}


const formulario = document.querySelector(".formulario-modal");
// Seleciona o TBODY de dentro da sua tabela específica
const tbodyTabela = document.querySelector(".tabela-pagina-estoque tbody");


async function carregarProdutos() {
    try {
        const response = await fetch('http://localhost:2005/mostrarProduto');
        const produtos = await response.json();

        // 1. Limpa o tbody para não duplicar linhas
        tbodyTabela.innerHTML = "";

        // 2. Percorre os produtos vindos do banco
        produtos.forEach(produto => {
            const tr = document.createElement("tr");

         
            const caracteristicas = produto.caracteristicas || "-"; 
            const categoria = produto.categoria || "Geral";
            const minimo = produto.estoque_minimo || 5; // Exemplo: mínimo padrão é 5
            
           
            let statusTexto = "OK";
            let statusCor = "green"; // Estilo visual (opcional)
            
            if (produto.quantidade <= minimo) {
                statusTexto = "Baixo";
                statusCor = "red";
            } else if (produto.quantidade == 0) {
                statusTexto = "Indisponível";
                statusCor = "gray";
            }

          
            tr.innerHTML = `
                <td>${produto.nome_prod}</td>             <td>${caracteristicas}</td>               <td>${categoria}</td>                     <td>${produto.quantidade} un.</td>        <td>${minimo}</td>                        <td style="color: ${statusCor}; font-weight: bold;">
                    ${statusTexto}                        </td>
                <td>                                      <button class="btn-editar" onclick="editarProduto(${produto.id})">✏️</button>
                    <button class="btn-excluir" onclick="excluirProduto(${produto.id})">🗑️</button>
                </td>
            `;

            tbodyTabela.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao carregar tabela:", error);
    }
}


formulario.addEventListener("submit", async (event) => {
    event.preventDefault(); 


    let nomeProd = document.querySelector(".input-nome-modal").value;
    let precoProd = document.querySelector(".input-preco").value; // Se não usar na tabela, fica só no banco
    let qtdProd = document.querySelector(".input-quantidade").value;

    const dadosProduto = {
        nome_prod: nomeProd, 
        preco: parseFloat(precoProd),
        quantidade: parseInt(qtdProd) 

    };

    try {
        const response = await fetch('http://localhost:2005/produtoCadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosProduto)
        });

        const respostaTexto = await response.text();

        if (response.ok) {
            alert("Sucesso: Produto cadastrado!"); 
            modal.style.display = "none";
            formulario.reset(); 
            
            
            carregarProdutos(); 
            
        } else {
            alert("Erro do servidor: " + respostaTexto);
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao conectar com o servidor.");
    }
});


document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
});


async function editarProduto(nome_prod,preco,quantidade) {
   const novoTitulo = prompt("didite o novo titulo" , nome_prod);
   const novoPreco = parseFloat(prompt("digite o novo preco", preco));
   const novaQuantidade = parseInt(prompt("nova quantidade",quantidade));

    try {
        const response = await fetch("http://localhost:2005/editarProduto", {
             method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body : JSON.stringify({
                nome_prod : novoTitulo,
                preco : novoPreco,
                quantidade : novaQuantidade
              })
        });
       if (!response.ok) throw new Error(await response.text());
         alert("Tarefa editada!");
         carregarProdutos(); // vamos atualizar a lista com isso 

    } catch (err) {
        alert("erro ao editar a tarefa")
    }
}

function excluirProduto(id) {
    if(confirm("Tem certeza que deseja excluir o ID " + id + "?")) {
     
        alert("Excluído (simulação)");
    }
}



