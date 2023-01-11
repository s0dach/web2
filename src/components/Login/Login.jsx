import React from "react";
import { AuthContext } from "../../context/context";
import "./styles.css";

export const Login = () => {
  const { setIsAuth } = React.useContext(AuthContext);
  const [valueLogin, setValueLogin] = React.useState("");
  const [valuePassword, setValuePassword] = React.useState("");
  const login = (event) => {
    event.preventDefault();
    if (valueLogin === "editor" && valuePassword === "editorbot22") {
      setIsAuth(true);
      localStorage.setItem("auth", "true");
    } else {
      setIsAuth(false);
    }
  };
  return (
    <div className="container">
      <div className="login_page">
        <div className="form">
          <form onSubmit={login} className="login_form">
            <span className="spanLogin">Логин</span>
            <input
              className="login_login"
              onChange={(e) => setValueLogin(e.target.value)}
              type="text"
            />
            <span className="spanLogin">Пароль</span>
            <input
              onChange={(e) => setValuePassword(e.target.value)}
              type="password"
            />
            {/* <div className="captcha"></div> */}
            <div className="div_button">
              <button className="header_active">войти</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
