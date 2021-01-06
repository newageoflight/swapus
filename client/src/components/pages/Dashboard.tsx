import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { LoggedIn } from '../../context/LoggedIn';
import { GroupList } from './../../context/GroupList';
import { GroupInterface, GroupMember, GroupMemberSingleWant } from './../../interfaces/GroupInterface';
import { SwapGroupItem } from '../layout/SwapGroupItem';
import { GroupListPartiallyChanged } from './../../context/GroupListPartiallyChanged';

export const Dashboard: React.FC = () => {
    const loggedIn = useRecoilValue(LoggedIn);
    // if data is still being fetched from the server it should show a loading screen and not misleading content
    const groupList = useRecoilValue(GroupList);
    const [currentActiveSwaps, setCurrentActiveSwaps] = useState<GroupInterface[]>([] as GroupInterface[]);
    const partialChange = useRecoilValue(GroupListPartiallyChanged);

    useEffect(() => {
        // console.log("Group list updated")
        setCurrentActiveSwaps(getCurrentActiveSwaps(groupList));
        // eslint-disable-next-line
    }, [groupList, partialChange])
    
    const getCurrentActiveSwaps = (grpList: GroupInterface[]) => {
        for (const grp of grpList) {
            if (grp.swap_cycles === null)
                return [] as GroupInterface[];
        }
        return grpList.filter(({swap_cycles: cycles}) => cycles.map(cycle => 
            !!cycle.find(member => member.username === loggedIn.username && (member.have && member.want))));
    }

    const getUserHave = ({members}: {members: GroupMember[]}) =>
        members.find(m => m.username === loggedIn.username)!.have

    const getUserWant = ({members}: {members: GroupMember[]}) =>
        members.find(m => m.username === loggedIn.username)!.want

    const existsCycleInvolvingUser = ({swap_cycles: cycles}: {swap_cycles: Array<Array<GroupMemberSingleWant>>}) =>
        !!cycles.find(cycle => cycle.find(({username}) => username === loggedIn.username))

    // console.log(currentActiveSwaps);
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
