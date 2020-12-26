import React from 'react'
import { GroupMember } from '../../interfaces/GroupInterface'


export const SwapItem: React.FC<GroupMember> = ({username, have, want, comment}) => {

    return (
        <>
            <li className="swap-item">
                <div className="top">
                    <div className="content">
                        <strong>{username}</strong>
                        {have && want ? (
                            <>
                                : {have} &rarr; {want.join(", ")}
                            </>
                        ) : ""}
                    </div>
                </div>
                <div className="bottom">
                    <span>{!!comment && comment}</span>
                </div>
            </li>
        </>
    )
}
