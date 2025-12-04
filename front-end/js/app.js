const form = document.querySelector('form');
const submitBtn = document.querySelector('.btn-register');

        form.addEventListener('submit', async (event) => {
            event.preventDefault(); 

        
            const nomeInput = document.getElementById('name').value;
            const emailInput = document.getElementById('email').value;
            const senhaInput = document.getElementById('password').value;
            const confirmSenhaInput = document.getElementById('confirm_password').value;

            // 1. Validação Visual
            if (senhaInput !== confirmSenhaInput) {
                alert("As senhas não coincidem!");
                return;
            }

            // Efeito visual no botão
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "Enviando...";
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.7";

            // 2. Prepara o pacote (JSON) igual sua API pede
            // A API pede: nome, email, senha.
            const dadosUsuario = {
                nome: nomeInput, 
                email: emailInput,
                senha: senhaInput
            };

            try {
                // 3. O FETCH 
                const response = await fetch('http://localhost:2005/cadastroUsuario', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dadosUsuario)
                });

                // 4. Lendo a resposta (ATENÇÃO: Sua API retorna Texto, não JSON)
                const respostaTexto = await response.text();

                if (response.ok) {
                    // Deu tudo certo (Status 200)
                    alert("Sucesso: " + respostaTexto); 
                    window.location.href = "login.html"; // Manda pro login
                } else {
                    // Erro (Status 500 ou outro)
                    alert("Erro no servidor: " + respostaTexto);
                }

            } catch (error) {
                console.error("Erro:", error);
                alert("Não foi possível conectar ao servidor. Verifique se o Node está rodando.");
            } finally {
                // Restaura o botão
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
            }
        });




