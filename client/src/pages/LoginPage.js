import React from "react";
import "../styles/LoginPage.css";

function Login() {
  return (
    <div className="login-page">
      <h1>Log in to Spotify</h1>
      <a className="login-button" href={process.env.REACT_APP_AUTH_URL}>
        Log In
      </a>
    </div>
  );
}

export default Login;