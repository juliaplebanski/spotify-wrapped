import React from "react";
import { Container } from "react-bootstrap";
import styled from "styled-components/macro";
import { theme, mixins, Main } from "../styles";
const { colors, fontSizes } = theme;

const LoginPage = styled(Main)`
  ${mixins.flexCenter};
  flex-direction: column;
  min-height: 100vh;
  h1 {
    font-size: ${fontSizes.xxl};
  }
`;
const LoginButton = styled.a`
  display: inline-block;
  background-color: ${colors.green};
  color: ${colors.black};
  border-radius: 30px;
  padding: 17px 35px;
  margin: 20px 0 70px;
  min-width: 160px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-align: center;
  &:hover,
  &:focus {
    background-color: ${colors.offGreen};
  }
`;

function Login() {
  return (
    <LoginPage>
    <h1>Log in to Spotify</h1>
    <LoginButton href={process.env.REACT_APP_AUTH_URL}>Log In</LoginButton>
  </LoginPage>
  );
}

export default Login;