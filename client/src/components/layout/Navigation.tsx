import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export const Navbar: React.FC = () => {

    return (
        <header>
            <nav>
                <ul>
                    <li>Home</li>
                    <li>My Swaps</li>
                </ul>
            </nav>
        </header>
    )
}
