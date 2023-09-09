import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./containers/LoginPage";
import Home from "./containers/HomePage";
import styled from "styled-components/macro";
import { GlobalStyle } from "./styles"
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(fas);

const AppContainer = styled.div`
  height: 100%;
  min-height: 100vh;
`;

const code = new URLSearchParams(window.location.search).get("code");

function App() {
 return (
   <AppContainer>
     <GlobalStyle />

     {code ? <Home code={code} /> : <Login />}
   </AppContainer>
 );
};


export default App;
