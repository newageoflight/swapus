import React, { useState } from 'react'
import { useHistory } from 'react-router';

export const Register: React.FC = () => {
    const history = useHistory();
    const [unmatchedPasswords, setUnmatchedPasswords] = useState(false);
    const handleSubmit = (evt: any) => {
        evt.preventDefault();

        const data = new FormData(evt.target);
        if (data.get("confirm-password") === data.get("password")) {
            data.delete("confirm-password")
            fetch("/api/v1/auth/register", {
                method: "POST",
                body: data,
            }).then(res => res.json())
            .then(data => {
                if (data.success)
                    history.push("/login")
            })
            .catch(err => console.error(err))
        }
        else
            setUnmatchedPasswords(true)
    }

    return (
        <>
            <h1>Register</h1>
            <div className="unmatched-passwords" style={{
                display: unmatchedPasswords ? "block" : "none",
                backgroundColor: "#dc3545",
                color: "white",
                borderRadius: "5px"
            }}>Passwords don't match!</div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input id="username" name="username" type="text" placeholder="Enter your username..." />
                <br/>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="text" placeholder="Enter your email..." />
                <br/>
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" placeholder="Enter your password..." />
                <br/>
                <label htmlFor="confirm-password">Confirm password</label>
                <input id="confirm-password" name="confirm-password" type="password" placeholder="Confirm your password..." />
                <br/>
                <button type="submit">Register</button>
            </form>
        </>
    )
}
