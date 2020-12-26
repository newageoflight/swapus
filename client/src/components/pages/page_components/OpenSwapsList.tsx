import React from 'react'

import { SwapItem } from '../../layout/SwapItem';
import { GroupMember } from '../../../interfaces/GroupInterface'

interface Props {
    membersWithSwaps: GroupMember[];
}

export const OpenSwapsList: React.FC<Props> = ({membersWithSwaps}) => {
    return (
        <>
            <h2>Open swaps</h2>
            {membersWithSwaps.length > 0 ?
            (
                <ul className="swap-members-list">
                    {membersWithSwaps.map(m => (
                        <SwapItem {...m} />
                    ))}
                </ul>
            )
            : <p>There are no swaps currently open.</p>}
        </>
    )
}
