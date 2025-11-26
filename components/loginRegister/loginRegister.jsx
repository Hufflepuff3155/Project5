import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import {
  Alert,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import './loginRegister.css';

/**
 * LoginRegister view handles both login and new-user registration.
 */
function LoginRegister({ onLoginSuccess }) {
  const history = useHistory();
  const [loginForm, setLoginForm] = useState({ login_name: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [registerForm, setRegisterForm] = useState({
    login_name: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    location: '',
    description: '',
    occupation: '',
  });
  const [registerMessage, setRegisterMessage] = useState('');
  const [registerError, setRegisterError] = useState(false);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoginError('');
    try {
      const response = await axios.post('/admin/login', loginForm);
      if (onLoginSuccess) {
        onLoginSuccess(response.data);
      }
      history.push(`/users/${response.data._id}`);
    } catch (err) {
      const serverMessage = err.response?.data;
      setLoginError(
        typeof serverMessage === 'string'
          ? serverMessage
          : 'Unable to login. Please check your credentials.'
      );
    }
  };

  const resetRegisterMessage = () => {
    setRegisterMessage('');
    setRegisterError(false);
  };

  const submitRegistration = async (event) => {
    event.preventDefault();
    resetRegisterMessage();

    if (!registerForm.login_name || !registerForm.password || !registerForm.first_name || !registerForm.last_name) {
      setRegisterError(true);
      setRegisterMessage('Please fill in login name, password, first name, and last name.');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError(true);
      setRegisterMessage("Passwords don't match.");
      return;
    }

    try {
      await axios.post('/user', {
        login_name: registerForm.login_name,
        password: registerForm.password,
        first_name: registerForm.first_name,
        last_name: registerForm.last_name,
        location: registerForm.location,
        description: registerForm.description,
        occupation: registerForm.occupation,
      });

      setRegisterError(false);
      setRegisterMessage('Registration successful! You can login now.');
      setRegisterForm({
        login_name: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        location: '',
        description: '',
        occupation: '',
      });
    } catch (err) {
      const text = err.response?.data;
      setRegisterError(true);
      setRegisterMessage(
        typeof text === 'string'
          ? text
          : 'Unable to register. Please try again.'
      );
    }
  };

  return (
    <div className="login-register__container">
      <Paper elevation={3} className="login-register__panel">
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        <form onSubmit={submitLogin} className="login-register__form">
          <TextField
            label="Login Name"
            name="login_name"
            value={loginForm.login_name}
            onChange={handleLoginChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={loginForm.password}
            onChange={handleLoginChange}
            required
            fullWidth
            margin="normal"
          />
          {loginError && (
            <Alert severity="error" className="login-register__alert">
              {loginError}
            </Alert>
          )}
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Login
          </Button>
        </form>
      </Paper>

      <Divider orientation="vertical" flexItem className="login-register__divider" />

      <Paper elevation={3} className="login-register__panel">
        <Typography variant="h5" gutterBottom>
          Register
        </Typography>
        <form onSubmit={submitRegistration} className="login-register__form">
          <TextField
            label="Login Name"
            name="login_name"
            value={registerForm.login_name}
            onChange={handleRegisterChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={registerForm.password}
            onChange={handleRegisterChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={registerForm.confirmPassword}
            onChange={handleRegisterChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="First Name"
            name="first_name"
            value={registerForm.first_name}
            onChange={handleRegisterChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={registerForm.last_name}
            onChange={handleRegisterChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Location"
            name="location"
            value={registerForm.location}
            onChange={handleRegisterChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            name="description"
            value={registerForm.description}
            onChange={handleRegisterChange}
            fullWidth
            margin="normal"
            multiline
            minRows={2}
          />
          <TextField
            label="Occupation"
            name="occupation"
            value={registerForm.occupation}
            onChange={handleRegisterChange}
            fullWidth
            margin="normal"
          />
          {registerMessage && (
            <Alert
              severity={registerError ? 'error' : 'success'}
              className="login-register__alert"
            >
              {registerMessage}
            </Alert>
          )}
          <Button variant="outlined" color="primary" type="submit" fullWidth>
            Register Me
          </Button>
        </form>
      </Paper>
    </div>
  );
}

LoginRegister.propTypes = {
  onLoginSuccess: PropTypes.func,
};

LoginRegister.defaultProps = {
  onLoginSuccess: () => {},
};

export default LoginRegister;
