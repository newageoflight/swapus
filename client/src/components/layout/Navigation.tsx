import React from 'react'
import { NavLink } from 'react-router-dom'

export const Navbar: React.FC = () => {

    return (
        <header>
            <nav>
                <div className="left-block">
                    <div className="logo">
                        <img src="logo-crop.png" alt="SwapUs logo"/>
                    </div>
                    <ul className="menu">
                        <li className="item"><NavLink exact to="/">
                            Home
                        </NavLink></li>
                        <li className="item"><NavLink to="/groups">
                            My Groups
                        </NavLink></li>
                        <li className="item"><NavLink to="/about">
                            About
                        </NavLink></li>
                    </ul>
                </div>
                <ul className="user-menu">
                    <li className="item"><NavLink to="/add_group">Add swap group</NavLink></li>
                    <li className="item"><NavLink to="/login">Login</NavLink></li>
                </ul>
            </nav>
        </header>
    )
}
