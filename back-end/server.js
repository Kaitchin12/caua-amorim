const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");
const cors = require('cors');
const app = express();
app.use(cors());


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Amorim#2210",
    database: "saep_db_new"
});


connection.connect((err) => {
    if (err) {
        console.log("Erro ao conectar no banco:", err.message);
        return;
    }
    console.log("Banco conectado com sucesso!");
});

app.use(express.static(path.join(__dirname, "../front-end")));




app.post("/cadastroUsuario", (req, res) => {
    const { nome,email,senha } = req.body;

    const sql = "INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)";

    connection.query(sql, [nome, email,senha], (err) => {
        if (err) {
            console.error("Erro ao cadastrar tarefa:", err.message);
            return res.status(500).send("Erro ao salvar no banco.");
        }

        res.send("Tarefa cadastrada com sucesso!");
    });
});


app.post("/login", (req, res) => {
    const { email,senha } = req.body;

        const sql = "SELECT * FROM usuario WHERE email = ? AND senha = ?";

    connection.query(sql, [email,senha], (err,results) => {
       if (err) {
            return res.status(500).send("Erro no servidor.");
        }

        // Se a lista de resultados for maior que 0, achou o usuário!
        if (results.length > 0) {
            // Sucesso (Status 200)
            res.status(200).send("Login realizado com sucesso!");
        } else {
            // Falha (Status 401 - Não autorizado)
            res.status(401).send("Email ou senha incorretos.");
        }
    });
});






app.post("/produtoCadastro", (req, res) => {
    const { nome_prod,preco,quantidade } = req.body;

    const sql = "INSERT INTO produto (nome_prod, preco, quantidade) VALUES (?, ?, ?)";

    connection.query(sql, [nome_prod, preco,quantidade], (err) => {
        if (err) {
            console.error("Erro ao cadastrar tarefa:", err.message);
            return res.status(500).send("Erro ao salvar no banco.");
        }

        res.send("produto cadastrada com sucesso!");
    });
});




    app.get("/mostrarProduto", (req,res) => {
    

        const sql = `SELECT * FROM produto `;

        connection.query(sql, (err, results) => {
            if (err) {
                console.error("Erro ao listar Produtos:", err.message);
                return res.status(500).send("Erro ao buscar dados.");
            }

            res.json(results);
        });
    });


app.listen(2005, () =>
    console.log("Servidor rodando em http://localhost:2005/login.html")
);
