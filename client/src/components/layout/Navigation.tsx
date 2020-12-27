import React, { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useRecoilState } from 'recoil';
import { LoggedIn } from './../../context/LoggedIn';
import { UserDataInterface } from './../../interfaces/UserDataInterface';
import { TokenInterface } from './../../interfaces/TokenInterface';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

export const Navbar: React.FC = () => {
    const [loggedIn, setLoggedIn] = useRecoilState(LoggedIn);
    const [dropDownVisible, setDropDownVisible] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        setDropDownVisible(false)
    }, [])

    return (
        <header>
            <nav>
                <div className="left-block">
                    <button className="dropdown-activator" onClick={() => setShowMobileMenu(!showMobileMenu)}><FontAwesomeIcon icon={faBars} /></button>
                    <div className="logo">
                        <Link to="/">
                            <img src="https://i.imgur.com/QtUnqeh.png" alt="SwapUs logo"/>
                        </Link>
                    </div>
                </div>
                <div className={`menu-items-container ${showMobileMenu ? "" : "hidden-mobile"}`}>
                    <ul className="menu">
                        <li className="item"><NavLink to="/dashboard">
                            Home
                        </NavLink></li>
                        <li className="item"><NavLink to="/groups">
                            My Groups
                        </NavLink></li>
                        <li className="item"><NavLink to="/about">
                            About
                        </NavLink></li>
                    </ul>
                    <ul className="user-menu">
                        <li className="item"><NavLink to="/add_group">Add swap group</NavLink></li>
                        <li className="item">{
                            loggedIn.username !== "" ? 
                                (<>
                                    <button className={`user-button ${dropDownVisible ? "active" : ""}`} onClick={() => setDropDownVisible(!dropDownVisible)}>{loggedIn.username}</button>
                                    {
                                        dropDownVisible ? 
                                            (<ul className="user-panel">
                                                <li><NavLink to="/profile" onClick={() => setDropDownVisible(false)}>My profile</NavLink></li>
                                                <li><button onClick={() => {
                                                    localStorage.clear()
                                                    setLoggedIn(
                                                        {username: "", token: {access_token: "", token_type: ""} as TokenInterface} as UserDataInterface
                                                    )
                                                    setDropDownVisible(false);
                                                    }
                                                }>Logout</button></li>
                                            </ul>)
                                        : ""
                                    }
                                </>
                                )
                                : (<NavLink to="/login">Login</NavLink>)}</li>
                    </ul>
                </div>
            </nav>
        </header>
    )
}
