import React from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'

export const Groups: React.FC = () => {
    return (
        <>
            <h1>My Swap Groups</h1>
            <Tabs>
                <TabList>
                    <Tab>Recently visited</Tab>
                    <Tab>Groups I belong to</Tab>
                    <Tab>Groups I manage</Tab>
                </TabList>
                <TabPanel>
                    <p>Recently visited goes here</p>
                </TabPanel>
                <TabPanel>
                    <p>Groups I belong to go here</p>
                </TabPanel>
                <TabPanel>
                    <p>Groups I manage go here</p>
                </TabPanel>
            </Tabs>
        </>
    )
}
