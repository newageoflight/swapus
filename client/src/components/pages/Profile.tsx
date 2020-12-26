import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router';
import { useRecoilState } from 'recoil';
import { useForm } from 'react-hook-form';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { callProtectedEndpoint } from '../../utils/HTTPHandlers';
import { LoggedIn } from './../../context/LoggedIn';
import { createEmptyUserData } from './../../interfaces/UserDataInterface';
import { UserProfileInterface } from './../../interfaces/UserProfileInterface';
import { LoadingElement } from './page_components/LoadingElement';
import { deunderscorify, toTitleCase } from './../../utils/utils';

const displayableKeys = [
    "username",
    "email",
    "full_name",
    "bio",
]

const editableKeys = [
    "email",
    "full_name",
    "bio"
]

interface UserProfileEditables {
    email: string;
    full_name: string;
    bio: string;
}

function onlyEditables(user: UserProfileInterface): UserProfileEditables {
    return {
        email: (user.email === undefined) ? "" : user.email,
        full_name: (user.full_name === undefined) ? "" : user.full_name,
        bio: (user.bio === undefined) ? "" : user.bio,
    }
}

export const Profile: React.FC = () => {
    const history = useHistory();
    const { register, handleSubmit } = useForm<UserProfileInterface>();
    const [loggedIn, setLoggedIn] = useRecoilState(LoggedIn);
    const resetLoggedIn = () => setLoggedIn(createEmptyUserData())
    const [userData, setUserData] = useState<UserProfileInterface>({} as UserProfileInterface);
    const [editData, setEditData] = useState(false);

    useEffect(() => {
        async function getProfile() {
            let result = await callProtectedEndpoint("/api/v1/auth/whoami", loggedIn.token.access_token, history, resetLoggedIn);
            setUserData(result);
        }
        getProfile()
        
        // eslint-disable-next-line
    }, [])

    const modifyUser = (data: UserProfileInterface) => {
        async function sendModification() {
            let result = await callProtectedEndpoint("/api/v1/auth/whoami", loggedIn.token.access_token, history, resetLoggedIn,
                {method: "PATCH", body: JSON.stringify(data)});
            setUserData(result);
        }
        sendModification();
    }

    if (!!userData)
        return (
            <>
                <div className="profile-header">
                    <h1>{userData.full_name || userData.username}'s Profile</h1>
                    <button className="invisible-button" onClick={() => setEditData(!editData)}>
                        <FontAwesomeIcon icon={faPencilAlt} />
                    </button>
                </div>
                {
                    editData ? Object.entries(userData).filter(([key,val]) => displayableKeys.includes(key)).map(([key, val]) => !!val && (
                        <p><strong>{toTitleCase(deunderscorify(key))}:</strong> {val}</p>
                    )) : (<form className="profile-form" onSubmit={handleSubmit(modifyUser)}>
                        {Object.entries(onlyEditables(userData)).map(([key, value]) => (
                            <div className="input-label-oneline">
                                <label htmlFor={key}>{toTitleCase(deunderscorify(key))}</label>
                                <input type="text" name={key} defaultValue={value} ref={register} />
                            </div>
                        ))}
                        <button type="submit">Save changes</button>
                    </form>)
                }
            </>
        )
    else
        return <LoadingElement />
}
