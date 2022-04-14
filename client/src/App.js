import * as React from "react";
import './style.scss'
import {Route, Routes} from "react-router-dom";
import Navbar from "./components/NavBar";
import NewBracket from "./components/NewBracket";
import BracketView from "./components/BracketView";
import Cookies from 'universal-cookie';
import {useEffect} from "react";
const {v4: uuidv4} = require('uuid');
const cookies = new Cookies();


const App = () => {
    useEffect(() => {
        if (!cookies.get('userId')) {
            const userId = uuidv4();
            setCookie(userId);
        }
    }, []);

    const setCookie = (newId) => {
        const endDate = new Date();
        endDate.setFullYear(2035);
        cookies.set('userId', newId, {path: '/', expires: endDate});
    };

    return (
        <div className="app-canvas">
            <Navbar/>
            <Routes>
                <Route path="/bracket/new" element={<NewBracket/>}/>
                <Route path="/bracket/view/:bracketId" element={<BracketView/>}/>
            </Routes>
        </div>
    );
};

export default App;