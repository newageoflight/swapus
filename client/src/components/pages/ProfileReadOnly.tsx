
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { callProtectedEndpoint } from '../../utils/HTTPHandlers';
import { LoggedIn } from './../../context/LoggedIn';
import { createEmptyUserData } from './../../interfaces/UserDataInterface';
import { UserProfileInterface } from './../../interfaces/UserProfileInterface';
import { LoadingElement } from '../layout/LoadingElement';
import { deunderscorify, toTitleCase } from './../../utils/utils';

const displayableKeys = [
    "username",
    "email",
    "full_name",
    "phone_number",
    "bio",
]

export const ProfileReadOnly: React.FC = () => {
    let { username } = useParams() as any;
    const history = useHistory();
    const [loggedIn, setLoggedIn] = useRecoilState(LoggedIn);
    const resetLoggedIn = () => setLoggedIn(createEmptyUserData())
    const [userData, setUserData] = useState<UserProfileInterface>({} as UserProfileInterface);

    useEffect(() => {
        async function getProfile() {
            let result = await callProtectedEndpoint(`/api/v1/auth/whoami/${username}`, loggedIn.token.access_token, history, resetLoggedIn);
            setUserData(result);
        }
        getProfile()
        
        // eslint-disable-next-line
    }, [])

    if (Object.keys(userData).length > 0)
        return (
            <>
                <div className="profile-header">
                    <h1>{userData.full_name || userData.username}'s Profile</h1>
                </div>
                {
                    Object.entries(userData).filter(([key,val]) => displayableKeys.includes(key)).map(([key, val]) => !!val && (
                        <p><strong>{toTitleCase(deunderscorify(key))}:</strong> {val}</p>
                    ))
                }
            </>
        )
    else
        return <LoadingElement />
}