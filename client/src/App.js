import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./pages/LoginPage";
import Home from "./pages/HomePage";
import { GlobalStyle } from "./styles"
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

library.add(fas);

const code = new URLSearchParams(window.location.search).get("code");

function App() {
 return (
   <div>
     <GlobalStyle />
     {code ? <Home code={code} /> : <Login />}
   </div>
 );
};

export default App;
