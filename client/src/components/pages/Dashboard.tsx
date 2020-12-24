import React, { useEffect, useState } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { LoggedIn } from '../../context/LoggedIn';
import { GroupList } from './../../context/GroupList';
import { callProtectedEndpoint } from '../../utils/HTTPHandlers';
import { useHistory } from 'react-router';
import { GroupInterface, GroupMember, GroupMemberSingleWant } from './../../interfaces/GroupInterface';
import { SwapGroupItem } from '../layout/SwapGroupItem';

export const Dashboard: React.FC = () => {
    const history = useHistory();
    const loggedIn = useRecoilValue(LoggedIn);
    // if data is still being fetched from the server it should show a loading screen and not misleading content
    const [groupList, setGroupList] = useRecoilState(GroupList);
    const [currentActiveSwaps, setCurrentActiveSwaps] = useState<GroupInterface[]>([] as GroupInterface[]);

    useEffect(() => {
        async function getGroups() {
            let userGroups = await callProtectedEndpoint(`/api/v1/graph/usergroups`, loggedIn.token.access_token, history)
            let dataToSet = (userGroups.data as GroupInterface[])
            setGroupList(dataToSet);
            setCurrentActiveSwaps(getCurrentActiveSwaps(dataToSet));
        }
        getGroups()
        // eslint-disable-next-line
    }, [])
    
    const getCurrentActiveSwaps = (grpList: GroupInterface[]) => {
        for (const grp of grpList) {
            if (grp.swap_cycles === null)
                return [] as GroupInterface[];
        }
        return grpList.filter(({swap_cycles: cycles}) => cycles.map(cycle => 
            !!cycle.findIndex(member => member.username === loggedIn.username)));
    }

    const getUserHave = ({members}: {members: GroupMember[]}) =>
        members.find(m => m.username === loggedIn.username)!.have

    const getUserWant = ({members}: {members: GroupMember[]}) =>
        members.find(m => m.username === loggedIn.username)!.want
    
    const existsCycleInvolvingUser = ({swap_cycles: cycles}: {swap_cycles: Array<Array<GroupMemberSingleWant>>}) =>
        !!cycles.find(cycle => cycle.find(({username, have, want}) => username === loggedIn.username))

    return (
        <>
            <h1>My Active Swaps</h1>
            {currentActiveSwaps!.length > 0 ? (
                <ul className="swap-list">
                    {currentActiveSwaps!.map((group: GroupInterface) => (
                        <SwapGroupItem id={group.id} name={group.name}
                            have={getUserHave(group)}
                            want={getUserWant(group)}
                            cycleFound={existsCycleInvolvingUser(group)} />
                    ))}
                </ul>
            ) : (
                <p>You do not have any currently active swaps.</p>
            )}
        </>
    )
}
