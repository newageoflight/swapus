import React, { useState } from 'react'
import Modal from "react-modal"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faMinus, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

Modal.setAppElement("#root");

interface Props {
    headingText: string;
    arrayItem: Array<any>;
}

export const SidebarHeadingRow: React.FC<Props> = ({headingText, arrayItem}) => {
    const [showModal, setShowModal] = useState(false);
    const [expandItems, setExpandItems] = useState(false);

    return (
        <>
            <div className="heading-row">
                <h2>{headingText} ({arrayItem.length})</h2>
                <div className="buttons">
                    <button onClick={() => setExpandItems(!expandItems)}><FontAwesomeIcon icon={expandItems ? faMinus : faPlus} /></button>
                    <button onClick={() => setShowModal(true)}><FontAwesomeIcon icon={faExpand} /></button>
                </div>
            </div>
            {expandItems && (
                <ul>
                    {arrayItem.slice(0,10).map((item, index) => (<li key={index}>{item}</li>))}
                    {arrayItem.length > 10 && <li>...</li>}
                </ul>
            )}
            <Modal isOpen={showModal} onRequestClose={() => setShowModal(false)} contentLabel={headingText}>
                <div className="heading-row">
                    <h2>{headingText}</h2>
                    <button onClick={() => setShowModal(false)}><FontAwesomeIcon icon={faTimes} /></button>
                </div>
                <p>{arrayItem.length} items</p>
                <ul>
                    {arrayItem.map((item, index) => (<li key={index}>{item}</li>))}
                </ul>
            </Modal>
        </>
    )
}
