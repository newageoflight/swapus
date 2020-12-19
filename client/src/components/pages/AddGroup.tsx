import React from 'react'

export const AddGroup: React.FC = () => {
    return (
        <>
            <div>
                <h2>Join an existing group</h2>
                <form action="/api/v1/groups/join/" method="post">
                    <label htmlFor="groupcode">Enter a code to join a group:</label>
                    <input type="text" name="groupcode" id="groupcode" />
                </form>
            </div>
            <div>
                <h2>Create a new group</h2>
                <form action="/api/v1/groups/create/" method="post">
                    <label htmlFor="name">Name of your group:</label>
                    <input type="text" name="name" id="group-name"/>
                    <br/>
                    <label htmlFor="options">Swap options (don't worry, you can add more later):</label>
                    <input type="text" name="name" id="group-name"/>
                </form>
            </div>
            <div>
                <p>All groups are secret!</p>
                <p>This should be a modal dialog but I'm just making it a page for now</p>
            </div>
        </>
    )
}
