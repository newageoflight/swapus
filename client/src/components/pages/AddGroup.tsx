import React from 'react'
import { JoinGroup } from '../layout/JoinGroup';
import { CreateGroup } from '../layout/CreateGroup';

export const AddGroup: React.FC = () => {
    return (
        <>
            <JoinGroup />
            <CreateGroup />
            <div>
                <p>All groups are secret! You can only add new users to a group after its creation by passing them the code.</p>
            </div>
        </>
    )
}
