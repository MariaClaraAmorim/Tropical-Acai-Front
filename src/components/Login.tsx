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
}

const Login: React.FC<LoginProps> = ({ setIsLoggedIn, setUserType, setClientId }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/login', { email, password });
      const { clientId, userType } = response.data;

      if (clientId && userType) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userType', userType);
        localStorage.setItem('clientId', clientId);

        setIsLoggedIn(true);
        setUserType(userType);
        setClientId(clientId);

        toast.success('Login realizado com sucesso');
        navigate('/home');
      } else {
        toast.error('Erro de login: resposta inválida');
      }
    } catch (error) {
      toast.error('Erro de login');
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
          />
          <input className="inputsLogin"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>

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
