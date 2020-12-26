import React from 'react'
import { JoinGroup } from './page_components/JoinGroup';
import { CreateGroup } from './page_components/CreateGroup';

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
