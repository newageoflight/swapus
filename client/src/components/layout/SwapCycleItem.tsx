import React, { useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import Modal from "react-modal";
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync, faTimes } from '@fortawesome/free-solid-svg-icons';

import { GroupMemberSingleWant } from '../../interfaces/GroupInterface'

Modal.setAppElement("#root")

interface Props {
    swapCycle: GroupMemberSingleWant[];
}

const customStyles = {
    overlay: {zIndex: 100}
}

export const SwapCycleItem: React.FC<Props> = ({ swapCycle }) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <li className="swap-item" onClick={() => setShowModal(true)}>
                <FontAwesomeIcon icon={faSync} />
                {swapCycle.slice(0,5).map((elem: GroupMemberSingleWant, index, arr) =>
                <>
                    <Link to={`/profile/${elem.username}`}>{elem.username}</Link> ({elem.have})
                    {index < arr.length - 1 && <>&rarr; </>}
                    {(index === 5 && index < arr.length - 1) && "..."}
                </>)}
            </li>
            <Modal isOpen={showModal} onRequestClose={() => setShowModal(false)} contentLabel="Suggested swap" style={customStyles}>
                <div className="heading-row">
                    <h2>Suggested swap cycle</h2>
                    <button onClick={() => setShowModal(false)}><FontAwesomeIcon icon={faTimes} /></button>
                </div>
                <Tabs>
                    <TabList>
                        <Tab>As path</Tab>
                        <Tab>As table</Tab>
                    </TabList>
                    <TabPanel>
                        <p>
                            {swapCycle.map((elem: GroupMemberSingleWant, index, arr) =>
                            <>
                                <Link to={`/profile/${elem.username}`}>{elem.username}</Link> ({elem.have})
                                {index < arr.length - 1 && <>&rarr; </>}
                            </>)}
                        </p>
                    </TabPanel>
                    <TabPanel>
                        <ul>
                            {swapCycle.map((elem: GroupMemberSingleWant, index, arr) =>
                            <li>
                                <Link to={`/profile/${elem.username}`}>{elem.username}</Link>: {elem.have} &rarr; {elem.want}
                            </li>)}
                        </ul>
                    </TabPanel>
                </Tabs>
            </Modal>
        </>
    )
}
