import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faSync } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router';

interface Props {
    id: string,
    name: string,
    have?: string | null,
    want?: string[] | null,
    cycleFound?: boolean
}

export const SwapGroupItem: React.FC<Props> = ({id, name, have, want, cycleFound}) => {
    const history = useHistory();

    return (
        <>
            <li className="swap-item" onClick={() => history.push(`/groups/${id}`)}>
                <div className="top">
                    <div className="icon">
                        <FontAwesomeIcon icon={faUsers}/>
                    </div>
                    <div className="content">
                        <strong>{name}</strong>
                        {have && want ? (
                            <>
                                : {have} &rarr; {want.join(",")}
                            </>
                        ) : ""}
                    </div>
                </div>
                {
                    cycleFound ? (
                        <div className="bottom">
                            <div className="icon">
                                <FontAwesomeIcon icon={faSync} />
                            </div>
                            <div className="content">
                                We found a swap cycle for you!
                            </div>
                        </div>
                    ) : ""
                }
            </li>
        </>
    )
}
