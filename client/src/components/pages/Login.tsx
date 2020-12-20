import React from 'react'
import { Link } from 'react-router-dom';

// todo: https://frankie567.github.io/fastapi-users/usage/flow/#request_2
// just copy the code from the link above. capture the form data and use fetch to get a response
export const Login: React.FC = () => {
    const handleSubmit = (evt: any) => {
        evt.preventDefault();

        const data = new FormData(evt.target);
        fetch("/api/v1/auth/cookie/login", {
            method: "POST",
            headers: {
                "Content-Type": "multipart/form-data"
            },
            body: data
        }).then(res => console.log(res))
        .catch(err => console.error(err))
    }

    return (
        <>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Email</label>
                <input id="username" name="username" type="text" placeholder="Enter your email..." />
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
