import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { requestData, requestLogin, setToken } from '../services/requests';
import Context from '../Context/Context';

function Login() {
  const { setUserEmail, setUserId, setTokenGlobal,
    setUsername, setSellerOrders } = useContext(Context);
  const [formInput, setFormInput] = useState({ email: '', password: '' });
  const [isDisabled, setIsDisabled] = useState(true);
  const [failLogin, setFailLogin] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user !== null) {
      switch (user.role) {
      case 'customer':
        history.push('/customer/products');
        break;
      case 'seller':
        history.push('/seller/orders');
        break;
      case 'administrator':
        history.push('/admin/manage');
        break;
      default:
        break;
      }
    }
  }, []);

  const inputHandler = ({ target: { name, value } }) => {
    setFormInput({ ...formInput, [name]: value });
  };

  const MIN_LENGTH_PASSWORD = 5;

  useEffect(() => {
    const validator = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    const validInput = formInput.email && formInput.password
      && (validator.test(formInput.email))
      && formInput.password.length > MIN_LENGTH_PASSWORD;

    setIsDisabled(!validInput);
  }, [formInput]);

  const login = async (event) => {
    event.preventDefault();

    const { email, password } = formInput;

    try {
      const result = await requestLogin('/login', { email, password });

      const { token, name, role, id } = result;
      localStorage.setItem('token', token);
      setToken(token);
      const storageObj = { name, email, role, token, id };
      localStorage.setItem('user', JSON.stringify(storageObj));
      setUsername(name);
      setUserEmail(email);
      setUserId(id);
      setTokenGlobal(token);
      setUsername(name);

      const response = await requestData(`sale/${id}`);
      setSellerOrders(response);
      localStorage.setItem('sellerOrders', JSON.stringify(response));

      const allOrders = await requestData(`orders/${id}`);
      localStorage.setItem('customerOrders', JSON.stringify(allOrders));
      localStorage.setItem('orderDetails', JSON.stringify(allOrders));

      switch (result.role) {
      case 'administrator':
        history.push('/admin/manage');
        break;
      case 'customer':
        history.push('/customer/products');
        break;
      case 'seller':
        history.push('/seller/orders');
        break;
      default:
        history.push('/');
      }
    } catch (error) {
      console.log(error);
      setFailLogin(true);
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <form action="">
        <label htmlFor="email-input">
          <span>Login</span>
          <input
            type="email"
            id="email-input"
            data-testid="common_login__input-email"
            name="email"
            required
            onChange={ inputHandler }
          />
        </label>

        <label htmlFor="password-input">
          <span>Password</span>
          <input
            type="password"
            id="password-input"
            data-testid="common_login__input-password"
            name="password"
            required
            onChange={ inputHandler }
          />
        </label>

        <button
          type="submit"
          data-testid="common_login__button-login"
          disabled={ isDisabled }
          onClick={ (event) => login(event) }
        >
          Login
        </button>

        <button
          type="button"
          data-testid="common_login__button-register"
          onClick={ () => history.push('/register') }
        >
          Ainda não tenho conta
        </button>
      </form>

      {
        failLogin
        && (
          <span
            data-testid="common_login__element-invalid-email"
          >
            Erro
          </span>
        )

      }

    </div>
  );
}

export default Login;
