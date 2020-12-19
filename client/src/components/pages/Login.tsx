import React from 'react'

export const Login: React.FC = () => {
    return (
        <>
            <form action="/api/v1/auth/token" method="post">
                <label htmlFor="username">Username</label>
                <input id="username" name="username" type="text" placeholder="Enter your username..." />
                <br/>
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" placeholder="Enter your password..." />
                <br/>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? Register here</p>
        </>
    )
}
