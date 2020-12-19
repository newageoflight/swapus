import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faSync } from '@fortawesome/free-solid-svg-icons';

export const Frontpage: React.FC = () => {
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
