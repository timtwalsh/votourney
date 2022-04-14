import * as React from "react";
import App from "./App";
import {BrowserRouter} from "react-router-dom";
import {createRoot} from "react-dom/client";
import reportWebVitals from "./reportWebVitals";



function AppWithCallbackAfterRender() {
    return (
        <BrowserRouter>
            <App />
        </BrowserRouter>
    )
}

const container = document.getElementById("base");
const root = createRoot(container);
root.render(<AppWithCallbackAfterRender />);

reportWebVitals();