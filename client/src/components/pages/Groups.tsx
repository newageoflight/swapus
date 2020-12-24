import React from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import { useRecoilValue } from 'recoil';
import 'react-tabs/style/react-tabs.css'

import { LoggedIn } from './../../context/LoggedIn';
import { SwapGroupItem } from '../layout/SwapGroupItem';
import { GroupList } from './../../context/GroupList';

export const Groups: React.FC = () => {
    const loggedIn = useRecoilValue(LoggedIn)
    const groupList = useRecoilValue(GroupList);

    // useEffect(() => {
    //     async function getGroups() {
    //         let userGroups = await callProtectedEndpoint(`/api/v1/graph/usergroups`, loggedIn.token.access_token, history)
    //         setGroupList(userGroups.data);
    //     }
    //     getGroups()
    //     // eslint-disable-next-line
    // }, [])

    return (
        <>
            <h1>My Swap Groups</h1>
            <Tabs>
                <TabList>
                    <Tab>Groups I belong to</Tab>
                    <Tab>Groups I manage</Tab>
                </TabList>
                <TabPanel>
                    <ul className="swap-list">
                        {groupList.length > 0 ? groupList.map(grp => (
                            <SwapGroupItem key={grp.id} id={grp.id} name={grp.name} />
                        )) : <p>You are not in any groups.</p>}
                    </ul>
                </TabPanel>
                <TabPanel>
                    <ul className="swap-list">
                        {groupList.filter(grp => grp.owner === loggedIn.username).length > 0
                            ? groupList.filter(grp => grp.owner === loggedIn.username)
                            .map(grp => <SwapGroupItem key={grp.id} id={grp.id} name={grp.name} />)
                            : <p>You do not own any groups.</p>}
                    </ul>
                </TabPanel>
            </Tabs>
        </>
    )
}
