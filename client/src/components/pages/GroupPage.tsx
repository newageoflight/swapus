import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useRecoilState } from 'recoil';
import CreatableSelect from "react-select/creatable";

import { LoggedIn } from './../../context/LoggedIn';
import { GroupMember, GroupMemberSingleWant } from './../../interfaces/GroupInterface';
import { callProtectedEndpoint } from './../../utils/HTTPHandlers';
import { SwapItem } from '../layout/SwapItem';
import { GroupSelector } from './../../context/GroupSelector';


export const GroupPage: React.FC = () => {
    // gonna use this for the selection elements
    // https://react-select.com/home
    let { id } = useParams() as any;
    const history = useHistory()
    // if data is still being fetched from the server it should show a loading screen and not misleading content
    // see here: https://stackoverflow.com/questions/63255744/how-do-i-set-the-result-of-an-api-call-as-the-default-value-for-a-recoil-atom
    const [groupState, setGroupState] = useRecoilState(GroupSelector(id));
    const [loggedIn, setLoggedIn] = useRecoilState(LoggedIn);
    const [currentHave, setCurrentHave] = useState<string>();
    const [currentWant, setCurrentWant] = useState<string[]>();
    const [showChangePreferences, setShowChangePreferences] = useState(false);
    // TODO: can this be changed to use Recoil state as a cache?

    useEffect(() => {
        async function setGroups() {
            let groupData = await callProtectedEndpoint(`/api/v1/graph/group/${id}`, loggedIn.token.access_token, history)
            setGroupState(groupData.data)
        }
        setGroups()
    }, [])

    useEffect(() => {
        console.log(groupState)
        if (!!groupState) {
            let currentUserPrefs = groupState.members.find((props: GroupMember) => props.username === loggedIn.username)
            setCurrentHave(currentUserPrefs?.have as string)
            setCurrentWant(currentUserPrefs?.want as string[])
        }
        // eslint-disable-next-line
    }, [groupState])
    
    const handleSubmit = (evt: any) => {
        setShowChangePreferences(false);
        evt.preventDefault();
        let data = new FormData(evt.target);
        data.set("username", loggedIn.username);
        data.set("db_id", id);
        // now post the form
        const setData = async () => {
            let results = await callProtectedEndpoint("/api/v1/graph/modify", loggedIn.token.access_token, history, data, "PATCH");
            let dataToSet = results.data;
            setGroupState(dataToSet);
        }
        setData();
    }

    const deleteGroup = (evt: any) => {
        evt.preventDefault();
        const delThis = async () => {
            await callProtectedEndpoint(`/api/v1/graph/group/${id}`, loggedIn.token.access_token, history, {}, "DELETE");
        }
        if (window.confirm("Are you sure you want to delete this group?")) {
            delThis()
            history.push("/")
        }
    }

    if (!!groupState)
        return (
            <>
                <header>
                    <h1>
                        {groupState?.name}
                    </h1>
                    <p>
                        Group code: {groupState?.id}
                    </p>
                    <p>
                        Owner: {groupState?.owner}
                    </p>
                </header>
                <div className="group-container">
                    <aside className="group-sidebar">
                        <h2>Swap options</h2>
                        <ul>
                            {groupState?.options.map(opt => (<li>{opt}</li>))}
                        </ul>
                        <h2>Members</h2>
                        <ul>
                            {groupState?.members.map(({ username }) => (<li>{username}</li>))}
                        </ul>
                        {groupState?.owner === loggedIn.username ?
                            <button onClick={deleteGroup}>Delete this group</button>
                        : ""}
                        
                    </aside>
                    <main className="group-main">
                        <div id="set-preferences">
                        {
                            showChangePreferences ? (
                                <form onSubmit={handleSubmit} id="prefs-form">
                                    <label htmlFor="have">I have:</label>
                                    <CreatableSelect name="have" options={groupState.options.map(opt => ({value: opt, label: opt}))} 
                                        defaultValue={{value: currentHave, label: currentHave}}
                                    />
                                    <label htmlFor="want">I want:</label>
                                    <CreatableSelect name="want" isMulti options={groupState.options.map(opt => ({value: opt, label: opt}))}
                                    />
                                    <button type="submit">Submit</button>
                                    <button onClick={() => setShowChangePreferences(!showChangePreferences)}>Cancel</button>
                                </form>
                            ) : (
                                <>
                                    <p><strong>I have:</strong> {currentHave}</p>
                                    <p><strong>I want:</strong> {currentWant?.join(", ")}</p>
                                    <button onClick={() => setShowChangePreferences(!showChangePreferences)}>Change my preferences</button>
                                </>
                            )
                        }
                        </div>
                        <div id="preferences-list">
                            {groupState.swap_cycles !== null && groupState.swap_cycles.length > 0 ? (
                                <>
                                    <h2>Suggested swap cycles for you</h2>
                                    <ul>
                                        <li>{groupState.swap_cycles
                                        .filter((cycle: GroupMemberSingleWant[]) => cycle.map(
                                            (elem: GroupMemberSingleWant) => elem.username === loggedIn.username
                                        ))
                                        .map((cycle: GroupMemberSingleWant[]) => cycle.map(
                                            (elem: GroupMemberSingleWant, index, arr) =>
                                                (<>
                                                    {`${elem.username} (${elem.have}) `}
                                                    {index < arr.length - 1 ? <>&rarr; </> : ""}
                                                </>)
                                        ))}</li>
                                    </ul>
                                </>
                            ) : ""}
                            <h2>Open swaps</h2>
                            <ul className="swap-members-list">
                                {groupState.members.map(m => (
                                    <SwapItem {...m} />
                                ))}
                            </ul>
                        </div>
                    </main>
                </div>
            </>
        )
    else
        return (
            <>
                <p>Loading...</p>
            </>
        )
}
