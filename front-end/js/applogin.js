const form = document.querySelector('form');
const submitBtn = document.querySelector('.btn-login');

form.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;

    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Verificando...";
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.7";

    const dadosLogin = {
        email: emailInput,
        senha: passwordInput
    };

    try {
      
        const response = await fetch('http://localhost:2005/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosLogin)
        });

        const respostaTexto = await response.text();

        if (response.ok) {
            
            window.location.href = "index.html"; 
        } else {
            alert("Acesso negado: " + respostaTexto);
            document.getElementById('password').value = ""; // Limpa a senha
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao conectar com o servidor.");
    } finally {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
    }
});