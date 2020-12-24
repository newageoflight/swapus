import React from 'react'
import { Link } from 'react-router-dom'

export const Frontpage = () => {
    return (
        <>
            <h1>Welcome to SwapUs!</h1>
            <p>SwapUs is a website that uses graph algorithms to figure out the best swap sequence to make everyone happy.</p>
            <p>SwapUs is uniquely advantaged in that it has no problem handling even the most complicated swap sequences.</p>
            <p>To get started, <Link to="/register">register</Link> with us, or if you already have an account, <Link to="/login">log in</Link>!</p>
        </>
    )
}
