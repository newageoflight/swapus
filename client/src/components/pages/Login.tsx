import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { callLogin } from '../../utils/HTTPHandlers';
import { LoggedIn } from './../../context/LoggedIn';
import { TokenInterface } from './../../interfaces/TokenInterface';

// todo: https://frankie567.github.io/fastapi-users/usage/flow/#request_2
// just copy the code from the link above. capture the form data and use fetch to get a response
export const Login: React.FC = () => {
    const history = useHistory();
    const setLoggedIn = useSetRecoilState(LoggedIn);
    const [loginFailed, setLoginFailed] = useState(false);
    const handleSubmit = (evt: any) => {
        evt.preventDefault();

        const data = new FormData(evt.target);
        let username = data.get("username") as string;
        // call an async function to handle
        async function login() {
            let token = await callLogin("/api/v1/auth/token", history, data, "POST") as TokenInterface;
            if (!!token) {
                localStorage.setItem("username", username);
                localStorage.setItem("tokenValue", token.access_token);
                localStorage.setItem("tokenType", token.token_type)
                setLoggedIn({username, token})
                history.push("/")
            } else {
                setLoginFailed(true);
            }
        }
        login()
        // fetch("/api/v1/auth/token", {
        //     method: "POST",
        //     body: data
        // }).then(res => res.json())
        // .then(val => {
        //     if (val) {
        //         localStorage.setItem("username", username);
        //         localStorage.setItem("token", val)
        //         console.log("Token value", val)
        //         setLoggedIn({username, token: val})
        //         // redirect back to the homepage
        //         history.push("/")
        //     }
        // })
        // // .then(data => window.localStorage.setItem("authToken", data))
        // .catch(err => console.error(err))

    }

    return (
        <>
            <h1>Login</h1>
            { loginFailed ? (
                <p>Login failed, please try again</p>
            ) : "" }
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input id="username" name="username" type="text" placeholder="Enter your username..." />
                <br/>
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" placeholder="Enter your password..." />
                <br/>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <Link to="/register">
                Register here
            </Link></p>
        </>
    )
}
