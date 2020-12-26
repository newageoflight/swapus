import React from 'react'
import { GroupMemberSingleWant } from '../../../interfaces/GroupInterface'

interface Props {
    swapCycles: Array<Array<GroupMemberSingleWant>>;
}

export const SwapCycleSuggestions: React.FC<Props> = ({swapCycles}) => {
    return (
        <>
            {(swapCycles != null && swapCycles.length > 0) && (
                <>
                    <h2>Suggested swap cycles for you</h2>
                    <ul>
                        <li>{swapCycles
                        .map((cycle: GroupMemberSingleWant[]) => cycle.map(
                            (elem: GroupMemberSingleWant, index, arr) =>
                                (<>
                                    {`${elem.username} (${elem.have}) `}
                                    {index < arr.length - 1 && <>&rarr; </>}
                                </>)
                        ))}</li>
                    </ul>
                </>
            )}
        </>
    )
}
