import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';

export const About: React.FC = () => {
    return (
        <>
            <h1>About</h1>
            <div>
                <p>Makes it easy to swap sequences, allocations, etc. Intelligently figures out optimal swap paths, even very complicated ones.</p>
                <p>Born out of my personal frustration with the existing methods i.e. having to use Facebook groups for everything.</p>
                <p>Copyright &copy; <a href="https://github.com/newageoflight/">Christopher Chen</a> 2020-</p>
            </div>
            <div>
                <h2>How to use</h2>
                <ol>
                    <li>If you haven't already made an account, register.</li>
                    <li>Login to your account.</li>
                    <li>To add or join a swap group, click the "Add swap group" button in the navbar.</li>
                    <li>To join a group, type in the group code. To add a new group, use the menu to add swap options and users.</li>
                    <li>Your groups will now show under "My groups" - any groups where you have active swaps open will be shown on the dashboard ("Home").</li>
                </ol>
                <p>SwapUs will show an icon under each dashboard icon when it finds an optimal swap cycle for you: <FontAwesomeIcon icon={faSync} /></p>
            </div>
        </>
    )
}
