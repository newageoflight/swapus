import React, { useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faSync } from '@fortawesome/free-solid-svg-icons';
import { useRecoilValue } from 'recoil';
import { LoggedIn } from './../../context/LoggedIn';

export const Frontpage: React.FC = () => {
    const loggedIn = useRecoilValue(LoggedIn);

    console.log(`Bearer ${loggedIn.token.access_token}`)
    useEffect(() => {
        fetch("/api/v1/auth/whoami", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${loggedIn.token.access_token}`,
                "accept": "application/json"
            },
        }).then(res => res.json())
        .then(data => console.log(data))
        // eslint-disable-next-line
    }, [])

    return (
        <>
            <h1>My Active Swaps</h1>
            <ul className="swap-list">
                <li className="swap-item">
                    <div className="top">
                        <div className="icon">
                            <FontAwesomeIcon icon={faUsers}/>
                        </div>
                        <div className="content">
                            <strong>UNSW Medicine Class of 2020 Phase 3 Sequence Swaps:</strong> A &rarr; B
                        </div>
                    </div>
                    <div className="bottom">
                        <div className="icon">
                            <FontAwesomeIcon icon={faSync} />
                        </div>
                        <div className="content">
                            We found a swap cycle!
                        </div>
                    </div>
                </li>
            </ul>
        </>
    )
}
