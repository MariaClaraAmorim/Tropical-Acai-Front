import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

const RegisterUser: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<Role>(Role.USER);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            await axios.post('http://localhost:3000/api/register', {
                email,
                password,
                name,
                role,
            });
            toast.success('User registered successfully!');
            setEmail('');
            setPassword('');
            setName('');
            setRole(Role.USER);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'An error occurred');
        }
    };

    return (
        <div className="register">
            <div className="loginContent">
                <h2>Cadastro</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <div>
                            <label htmlFor="name">Name:</label>
                            <input className="inputsLogin"
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <label htmlFor="email">Email:</label>
                        <input className="inputsLogin"
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input className="inputsLogin"
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="role">Permissão:</label>
                        <select className="inputsLogin"
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as Role)}
                            required
                        >
                            <option value={Role.USER}>User</option>
                            <option value={Role.ADMIN}>Admin</option>
                        </select>
                    </div>
                    <button style={{
                        backgroundColor: 'var(--primary-color)',
                        color: 'var(--secondary-color)',
                        padding: '10px',
                        fontSize: '18px'
                    }} type="submit" > Register</button>
                </form>
            </div>
        </div >
    );
};

export default RegisterUser;
