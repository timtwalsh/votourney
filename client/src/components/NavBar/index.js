import React from "react";
import {NavLink} from "react-router-dom";

import './style.scss'

// Here, we display our Index
export default function Index() {
    return (
        <div className="navbar">
            <ul className="navbar-nav">
                <li className="nav-item">
                    <NavLink className="nav-link" to="/bracket/view">
                        View Bracket
                    </NavLink>
                    <NavLink className="nav-link" to="/bracket/new">
                        Create Bracket
                    </NavLink>
                </li>
            </ul>
        </div>
    );
}
