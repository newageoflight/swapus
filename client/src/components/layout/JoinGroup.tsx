import React from 'react'
import { useHistory } from 'react-router';
import { useRecoilState } from "recoil";

import { callProtectedEndpoint } from '../../utils/HTTPHandlers';
import { LoggedIn } from '../../context/LoggedIn';
import { createEmptyUserData } from '../../interfaces/UserDataInterface';

export const JoinGroup: React.FC = () => {
    const history = useHistory();
    const [loggedIn, setLoggedIn] = useRecoilState(LoggedIn);
    const resetLoggedIn = () => setLoggedIn(createEmptyUserData())

    const joinGroup = (evt: any) => {
        evt.preventDefault()
        let data = new FormData(evt.target);
        let groupcode = data.get("groupcode");
        async function addSelfToGroup() {
            await callProtectedEndpoint(`/api/v1/graph/join/${groupcode}`, loggedIn.token.access_token, history, resetLoggedIn, {method: "PUT"})
        }
        addSelfToGroup()
        history.push(`/groups/${groupcode}`)
    }

    return (
        <div>
            <h2>Join an existing group</h2>
            <form onSubmit={joinGroup} id="join-group-area">
                <div className="input-label-oneline">
                    <label htmlFor="groupcode">Enter a code to join a group:</label>
                    <input type="text" name="groupcode" id="groupcode" />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}
