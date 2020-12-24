import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useRecoilState } from 'recoil';
import { LoggedIn } from './../../context/LoggedIn';
import { UserDataInterface } from './../../interfaces/UserDataInterface';
import { TokenInterface } from './../../interfaces/TokenInterface';

export const Navbar: React.FC = () => {
    const [loggedIn, setLoggedIn] = useRecoilState(LoggedIn);
    const [dropDownVisible, setDropDownVisible] = useState(false);

    useEffect(() => {
        setDropDownVisible(false)
    }, [])

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
                    <li className="item">{
                        loggedIn.username !== "" ? 
                            (<>
                                <button className="user-button" onClick={() => setDropDownVisible(!dropDownVisible)}>{loggedIn.username}</button>
                                {
                                    dropDownVisible ? 
                                        (<ul className="user-panel">
                                            <li><NavLink to="/profile">My profile</NavLink></li>
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
            </nav>
        </header>
    )
}
