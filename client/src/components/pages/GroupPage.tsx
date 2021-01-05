import React, { useEffect, useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil';

import { LoggedIn } from './../../context/LoggedIn';
import { GroupMember, GroupMemberSingleWant } from './../../interfaces/GroupInterface';
import { callProtectedEndpoint } from './../../utils/HTTPHandlers';
import { GroupSelector } from './../../context/GroupSelector';
import { useResetRecoilState } from 'recoil';
import { GroupList } from './../../context/GroupList';
import { createEmptyUserData } from '../../interfaces/UserDataInterface';
import { SidebarHeadingRow } from '../layout/SidebarHeadingRow';
import { OpenSwapsList } from '../layout/OpenSwapsList';
import { SwapCycleSuggestions } from '../layout/SwapCycleSuggestions';
import { SetPreferencesForm } from '../layout/SetPreferencesForm';
import { LoadingElement } from '../layout/LoadingElement';
import { GroupListPartiallyChanged } from './../../context/GroupListPartiallyChanged';

export const GroupPage: React.FC = () => {
    // gonna use this for the selection elements
    // https://react-select.com/home
    let { id } = useParams() as any;
    const history = useHistory()
    // if data is still being fetched from the server it should show a loading screen and not misleading content
    // see here: https://stackoverflow.com/questions/63255744/how-do-i-set-the-result-of-an-api-call-as-the-default-value-for-a-recoil-atom
    const [groupState, setGroupState] = useRecoilState(GroupSelector(id));
    const resetGroupState = useResetRecoilState(GroupSelector(id));
    const [groupList, setGroupList] = useRecoilState(GroupList);
    // introducing this state particle might be the stupidest idea I've had but at least it works
    const setPartialChange = useSetRecoilState(GroupListPartiallyChanged);
    const [loggedIn, setLoggedIn] = useRecoilState(LoggedIn);
    const resetLoggedIn = () => setLoggedIn(createEmptyUserData())
    const [currentHave, setCurrentHave] = useState<string>();
    const [currentComment, setCurrentComment] = useState<string>();
    const [currentWant, setCurrentWant] = useState<string[]>();
    // TODO: can this be changed to use Recoil state as a cache?

    useEffect(() => {
        async function setGroups() {
            let groupData = await callProtectedEndpoint(`/api/v1/graph/group/${id}`, loggedIn.token.access_token, history, resetLoggedIn)
            if (!groupData)
                history.push("/")
            else
                setGroupState(groupData)
        }
        setGroups()
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        if (!!groupState && Object.keys(groupState).length > 0) {
            let currentUserPrefs = groupState.members.find((props: GroupMember) => props.username === loggedIn.username)
            setCurrentHave(currentUserPrefs?.have as string)
            setCurrentComment(currentUserPrefs?.comment as string)
            setCurrentWant(currentUserPrefs?.want as string[])
        }
        // eslint-disable-next-line
    }, [groupState])

    const setData = async (data: any) => {
        let results = await callProtectedEndpoint(`/api/v1/graph/group/${id}`, loggedIn.token.access_token, history, resetLoggedIn,
            {body: JSON.stringify(data), method: "PATCH", specifiedHeaders: {"Content-Type": "application/json"}});
        let dataToSet = results;
        setGroupState(dataToSet);
        setPartialChange(true);
    }

    const deleteGroup = (evt: any, msg: string) => {
        evt.preventDefault();
        const delThis = async () => {
            console.log(groupList);
            let result = await callProtectedEndpoint(`/api/v1/graph/group/${id}`, loggedIn.token.access_token, history, resetLoggedIn, {method: "DELETE"});
            if (result.success) {
                let newList = [...groupList];
                console.log(newList)
                let delIndex = newList.findIndex(({id: grpId}) => grpId === id)
                newList.splice(delIndex, 1)
                setGroupList(newList);
                resetGroupState()
                history.push("/")
            }
        }
        if (window.confirm(msg)) {
            delThis()
        }
    }

    if (!!groupState && Object.keys(groupState).length > 0)
        return (
            <>
                <div className="group-header">
                    <h1>{groupState?.name}</h1>
                    <p><strong>Group code:</strong> {groupState?.id}</p>
                    <p><strong>Owner:</strong> {groupState?.owner}</p>
                </div>
                <div className="group-container">
                    <aside className="group-sidebar">
                        <SidebarHeadingRow headingText="Swap options" arrayItem={groupState?.options} />
                        <SidebarHeadingRow headingText="Members" arrayItem={groupState?.members.map(({username}) => <Link to={`/profile/${username}`}>{username}</Link>)} />
                        {groupState?.owner === loggedIn.username ?
                            <button onClick={e => deleteGroup(e, "Are you sure you want to delete this group?")}>Delete this group</button>
                        : <button onClick={e => deleteGroup(e, "Are you sure you want to leave this group?")}>Leave this group</button>}
                        
                    </aside>
                    <main className="group-main">
                        <h2>Your preferences</h2>
                        <SetPreferencesForm options={groupState.options}
                            currentHave={currentHave!} currentWant={currentWant!} currentComment={currentComment!}
                            dataPoster={setData} />
                        <div id="preferences-list">
                            <SwapCycleSuggestions swapCycles={groupState.swap_cycles?.filter((cycle: GroupMemberSingleWant[]) => 
                                cycle.map((elem: GroupMemberSingleWant) => elem.username === loggedIn.username))} />
                            <OpenSwapsList membersWithSwaps={groupState.members.filter(m => m.have && m.want)} />
                        </div>
                    </main>
                </div>
            </>
        )
    else
        return (
            <LoadingElement />
        )
}
