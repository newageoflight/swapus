import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { Link, useHistory } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { objectToFormData } from '../../utils/FormToJSON';
import { callLogin } from '../../utils/HTTPHandlers';
import { LoggedIn } from './../../context/LoggedIn';
import { TokenInterface } from './../../interfaces/TokenInterface';

// todo: https://frankie567.github.io/fastapi-users/usage/flow/#request_2
// just copy the code from the link above. capture the form data and use fetch to get a response
interface LoginForm {
    username: string;
    password: string;
}

export const Login: React.FC = () => {
    const history = useHistory();
    const { register, handleSubmit, errors } = useForm<LoginForm>();
    const setLoggedIn = useSetRecoilState(LoggedIn);
    const [loginFailed, setLoginFailed] = useState(false);
    const onSubmit = (data: LoginForm) => {
        let username = data.username;
        // the server still accepts html form data
        // call an async function to handle
        async function login() {
            let token = await callLogin("/api/v1/auth/token", {payload: objectToFormData(data), method: "POST"}) as TokenInterface;
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
    }

    return (
        <>
            <h1>Login</h1>
            { loginFailed ? (
                <p>Login failed, please try again</p>
            ) : "" }
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="input-label-oneline">
                    <label htmlFor="username">Username</label>
                    <input id="username" name="username" type="text" placeholder="Enter your username..." ref={register({required: true})}/>
                    {errors.username && <span className="form-error">Please enter your username</span>}
                </div>
                <div className="input-label-oneline">
                    <label htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" placeholder="Enter your password..." ref={register({required: true})}/>
                    {errors.password && <span>Please enter your password</span>}
                </div>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <Link to="/register">
                Register here
            </Link></p>
        </>
    )
}
