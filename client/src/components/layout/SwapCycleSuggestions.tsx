import React from 'react'
import { GroupMemberSingleWant } from '../../interfaces/GroupInterface'
import { SwapCycleItem } from './SwapCycleItem';

interface Props {
    swapCycles: Array<Array<GroupMemberSingleWant>>;
}

export const SwapCycleSuggestions: React.FC<Props> = ({swapCycles}) => {
    return (
        <>
            {(swapCycles != null && swapCycles.length > 0) && (
                <>
                    <h2>Suggested swap cycles for you</h2>
                    <ul className="swap-suggestions-list">
                        {swapCycles.map((cycle: GroupMemberSingleWant[]) => <SwapCycleItem swapCycle={cycle} />)}
                    </ul>
                </>
            )}
        </>
    )
}
