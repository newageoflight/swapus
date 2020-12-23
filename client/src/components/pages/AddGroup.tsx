import React, { useState } from 'react'
import { useRecoilValue } from "recoil";
import { LoggedIn } from './../../context/LoggedIn';

export const AddGroup: React.FC = () => {
    const [groupOptions, setGroupOptions] = useState([""]);
    const loggedIn = useRecoilValue(LoggedIn);

    const joinGroup = (evt: any) => {
        evt.preventDefault()
        const data = new FormData(evt.target);
        let groupcode = data.get("groupcode")
        fetch(`/api/v1/graph/join/${groupcode}`, {
            method:"POST",
            headers: {
                "Authorization": `Bearer ${loggedIn.token.access_token}`
            }
        })
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.error(err))
            // 401 errors should be caught by prompting the user to log back in
    }

    const createNewGroup = (evt: any) => {
        evt.preventDefault()
        let data = new FormData(evt.target);
        // add self to users in data
        // convert the formdata into a json object
        fetch("/api/v1/graph/create", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${loggedIn.token.access_token}`,
            },
            body: data
        })
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.error(err))
            // 401 errors should be caught by prompting the user to log back in
    }

    return (
        <>
            <div>
                <h2>Join an existing group</h2>
                <form onSubmit={joinGroup}>
                    <label htmlFor="groupcode">Enter a code to join a group:</label>
                    <input type="text" name="groupcode" id="groupcode" />
                    <button type="submit">Submit</button>
                </form>
            </div>
            <div>
                <h2>Create a new group</h2>
                <form onSubmit={createNewGroup}>
                    <label htmlFor="name">Name of your group:</label>
                    <input type="text" name="name" id="group-name"/>
                    <br/>
                    <label>Swap options (don't worry, you can add more later):</label>
                    <br/>
                    {/* todo - fix this so that it retains your options */}
                    {groupOptions.map((opt, index, arr) =>
                       (
                            <>
                                <input type="text" name="options" defaultValue={opt} />
                                <button onClick={(evt:any) => {
                                    evt.preventDefault()
                                    setGroupOptions([...groupOptions, ""])
                                }}>Add</button>
                                {arr.length > 1 ? (<button onClick={(evt:any) => {
                                    evt.preventDefault()
                                    setGroupOptions(groupOptions.filter((item, idx, a) => idx !== index))
                                }
                                    }>Remove</button>)
                                : ""}
                                <br/>
                            </>
                       ) 
                    )}
                    <br/>
                    <button type="submit">Submit</button>
                </form>
            </div>
            <div>
                <p>All groups are secret!</p>
                <p>This should be a modal dialog but I'm just making it a page for now</p>
            </div>
        </>
    )
}
