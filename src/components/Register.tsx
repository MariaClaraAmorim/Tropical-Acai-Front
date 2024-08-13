import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/register', { email, password, name });
      toast.success('Cadastro realizado com sucesso');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao realizar cadastro');
    }
  };

  return (
    <div className="register-container">
      <div className="loginContent">
        <h2>Cadastro</h2>
        <form onSubmit={handleSubmit}>
          <input className="inputsLogin"
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input className="inputsLogin"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input className="inputsLogin"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Cadastrar</button>
          <span className="redirect">
            Já tem login?
            <a href="/login">Clique aqui</a>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Register;
