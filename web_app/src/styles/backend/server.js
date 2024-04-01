const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar a conexão com o banco de dados
const connection = mysql.createConnection({
  host: '127.0.0.1', // host do banco de dados
  user: 'root', // usuário do banco de dados
  password: '1234', // senha do banco de dados
  database: 'unnamed' // Nome do  banco de dados
});

// Conectar ao banco de dados
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conexão bem-sucedida com o banco de dados MySQL');
});

// Middleware para permitir o uso de JSON nas requisições
app.use(express.json());

// Funções para gerar e verificar tokens JWT
function generateToken(userId) {
  return jwt.sign({ userId }, 'secreto', { expiresIn: '1h' });
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, 'secreto');
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// Middleware para verificar token JWT
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  req.userId = userId;
  next();
}

// Definir rota de teste
app.get('/', (req, res) => {
  res.send('Servidor está rodando!');
});

// Rota para registro de usuário
app.post('/register', (req, res) => {
  const { email, senha } = req.body;

  // Se o email não estiver em uso, inserir o novo usuário no banco de dados
  bcrypt.hash(senha, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Erro ao criptografar senha:', err);
      res.status(500).send('Erro interno do servidor');
      return;
    }

    // Inserir o novo usuário no banco de dados com a senha criptografada
    const insertUserQuery = 'INSERT INTO usuarios (email, senha) VALUES (?, ?)';
    connection.query(insertUserQuery, [email, hashedPassword], (err, results) => {
      if (err) {
        console.error('Erro ao registrar usuário:', err);
        res.status(500).send('Erro interno do servidor');
        return;
      }

      // Gerar token JWT para o novo usuário
      const token = generateToken(email);
      res.status(201).json({ token }); // Enviar token JWT como resposta
    });
  });
});

// Rota para login de usuário
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Consultar o banco de dados para verificar as credenciais do usuário
  const loginUserQuery = 'SELECT * FROM usuarios WHERE email = ?';
  connection.query(loginUserQuery, [email], (err, results) => {
    if (err) {
      console.error('Erro ao fazer login:', err);
      res.status(500).send('Erro interno do servidor');
      return;
    }

    if (results.length === 0) {
      // Usuário não encontrado
      res.status(401).send('Credenciais inválidas');
      return;
    }

    // Comparar a senha fornecida com a senha armazenada no banco de dados
    const hashedPassword = results[0].senha;
    bcrypt.compare(senha, hashedPassword, (err, isMatch) => {
      if (err) {
        console.error('Erro ao comparar senhas:', err);
        res.status(500).send('Erro interno do servidor');
        return;
      }

      if (!isMatch) {
        // Senha incorreta
        res.status(401).send('Credenciais inválidas');
        return;
      }

      // Login bem-sucedido - gerar token JWT
      const token = generateToken(email);
      res.status(200).json({ token }); // Enviar token JWT como resposta
    });
  });
});

// Exemplo de uso do middleware em uma rota protegida
app.get('/rota-protegida', authenticate, (req, res) => {
  // Apenas usuários autenticados podem acessar esta rota
  res.json({ message: 'Rota protegida acessada com sucesso!' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
