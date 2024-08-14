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
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('https://tropical-acai-back.onrender.com/api/register', { email, password, name });
      toast.success('Cadastro realizado com sucesso');
      navigate('/login');
    } catch (error: any) {
      toast.error('Erro ao realizar cadastro:', error);
    } finally {
      setIsLoading(false); // Desativa o loading após a resposta
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
            autoComplete="name"

          />
          <input className="inputsLogin"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input className="inputsLogin"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="password"
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Carregando...' : 'Cadastrar'} {/* Exibe o texto de carregamento */}
          </button>
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
