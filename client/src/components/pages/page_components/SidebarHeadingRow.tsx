import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

interface Props {
    headingText: string;
    arrayItem: Array<string>;
}

export const SidebarHeadingRow: React.FC<Props> = ({headingText, arrayItem}) => {
    const [expandItems, setExpandItems] = useState(false);

    return (
        <>
            <div className="heading-row">
                <h2>{headingText} ({arrayItem.length})</h2>
                <button onClick={() => setExpandItems(!expandItems)}><FontAwesomeIcon icon={expandItems ? faMinus : faPlus} /></button>
            </div>
            {expandItems && (
                <ul>
                    {arrayItem.map((item, index) => (<li key={index}>{item}</li>))}
                </ul>
            )}
        </>
    )
}
