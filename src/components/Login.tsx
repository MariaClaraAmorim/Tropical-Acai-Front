import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import '../App.css';

interface LoginProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setUserType: React.Dispatch<React.SetStateAction<string | null>>;
  setClientId: React.Dispatch<React.SetStateAction<string | null>>;
  setName: React.Dispatch<React.SetStateAction<string | null>>;
}

const Login: React.FC<LoginProps> = ({ setIsLoggedIn, setUserType, setClientId, setName }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('https://tropical-acai-back.onrender.com/api/login', { email, password });
      const { clientId, userType, name } = response.data;

      if (clientId && userType && name) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userType', userType);
        localStorage.setItem('clientId', clientId);
        localStorage.setItem('clientName', name);

        setIsLoggedIn(true);
        setUserType(userType);
        setClientId(clientId);
        setName(name);

        toast.success('Login realizado com sucesso');
        navigate('/home');
      } else {
        toast.error('Erro de login: resposta inválida');
      }
    } catch (error) {
      toast.error('Erro de login');
    } finally {
      setIsLoading(false); // Desativa o loading após a resposta
    }
  };

  return (
    <div className="login-container">
      <div className="loginContent">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
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
            {isLoading ? 'Carregando...' : 'Login'} {/* Exibe o texto de carregamento */}
          </button>

          <span className="redirect">
            Ainda não fez seu cadastro?
            <a href="/register">Clique aqui</a>
          </span>

        </form>
      </div>
    </div>
  );
};

export default Login;
