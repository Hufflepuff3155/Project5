import React, { useEffect, useState } from 'react';
import {
  Button, Divider, TextField, Typography
} from '@mui/material';
import axios from 'axios';
import './loginRegister.css';

export default function LoginRegister({ onLogin, changeMainContent }) {
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerData, setRegisterData] = useState({
    login_name: '',
    password: '',
    repeat_password: '',
    first_name: '',
    last_name: '',
    location: '',
    description: '',
    occupation: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  useEffect(() => {
    if (changeMainContent) {
      changeMainContent('Please Login');
    }
  }, [changeMainContent]);

  const handleLogin = (event) => {
    event.preventDefault();
    setMessage('');
    axios.post('/admin/login', { login_name: loginName, password: loginPassword })
      .then((response) => {
        setMessageType('success');
        setMessage('Login successful!');
        if (onLogin) {
          onLogin(response.data);
        }
      })
      .catch((error) => {
        const msg = error.response?.data || 'Login failed';
        setMessageType('error');
        setMessage(msg);
      });
  };

  const handleRegisterChange = (field) => (event) => {
    setRegisterData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleRegister = (event) => {
    event.preventDefault();
    setMessage('');
    if (registerData.password !== registerData.repeat_password) {
      setMessageType('error');
      setMessage('Passwords must match.');
      return;
    }

    axios.post('/user', {
      login_name: registerData.login_name,
      password: registerData.password,
      first_name: registerData.first_name,
      last_name: registerData.last_name,
      location: registerData.location,
      description: registerData.description,
      occupation: registerData.occupation
    })
      .then(() => {
        setMessageType('success');
        setMessage('Registration successful! You can now log in.');
        setRegisterData({
          login_name: '',
          password: '',
          repeat_password: '',
          first_name: '',
          last_name: '',
          location: '',
          description: '',
          occupation: ''
        });
      })
      .catch((error) => {
        const msg = error.response?.data || 'Registration failed';
        setMessageType('error');
        setMessage(msg);
      });
  };

  return (
    <div className="login-register">
      <div className="login-register__card">
        <Typography variant="h5" gutterBottom>Login</Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Login Name"
            fullWidth
            margin="dense"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="dense"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <div className="login-register__actions">
            <Button type="submit" variant="contained" color="primary">Login</Button>
          </div>
        </form>
      </div>

      <Divider />

      <div className="login-register__card">
        <Typography variant="h5" gutterBottom>Register</Typography>
        <form onSubmit={handleRegister}>
          <TextField label="Login Name" fullWidth margin="dense" value={registerData.login_name} onChange={handleRegisterChange('login_name')} />
          <TextField label="First Name" fullWidth margin="dense" value={registerData.first_name} onChange={handleRegisterChange('first_name')} />
          <TextField label="Last Name" fullWidth margin="dense" value={registerData.last_name} onChange={handleRegisterChange('last_name')} />
          <TextField label="Password" type="password" fullWidth margin="dense" value={registerData.password} onChange={handleRegisterChange('password')} />
          <TextField label="Repeat Password" type="password" fullWidth margin="dense" value={registerData.repeat_password} onChange={handleRegisterChange('repeat_password')} />
          <TextField label="Location" fullWidth margin="dense" value={registerData.location} onChange={handleRegisterChange('location')} />
          <TextField label="Description" fullWidth margin="dense" value={registerData.description} onChange={handleRegisterChange('description')} />
          <TextField label="Occupation" fullWidth margin="dense" value={registerData.occupation} onChange={handleRegisterChange('occupation')} />
          <div className="login-register__actions">
            <Button type="submit" variant="contained" color="secondary">Register Me</Button>
          </div>
        </form>
      </div>

      {message && (
        <Typography className="login-register__message" color={messageType === 'error' ? 'error' : 'primary'}>
          {message}
        </Typography>
      )}
    </div>
  );
}
