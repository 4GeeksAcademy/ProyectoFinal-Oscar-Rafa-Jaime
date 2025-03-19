
import React from "react";
import ReactDOM from "react-dom";


import "../i18n"; // Import i18n configuration here


import "../styles/index.css";

//import your own components
import Layout from "./layout";

//render your react application
ReactDOM.render(<Layout />, document.querySelector("#app"));
