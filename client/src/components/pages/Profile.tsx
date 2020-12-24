import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router';
import { useRecoilState } from 'recoil';
import { callProtectedEndpoint } from '../../utils/HTTPHandlers';
import { LoggedIn } from './../../context/LoggedIn';
import { UserDataInterface } from './../../interfaces/UserDataInterface';
import { UserProfileInterface } from './../../interfaces/UserProfileInterface';

export const Profile: React.FC = () => {
    const history = useHistory();
    const [loggedIn, setLoggedIn] = useRecoilState(LoggedIn);
    const [userData, setUserData] = useState<UserProfileInterface>({} as UserProfileInterface);

    useEffect(() => {
        async function getProfile() {
            let result = await callProtectedEndpoint("/api/v1/auth/whoami", loggedIn.token.access_token, history);
            console.log(result)
            if (!result) {
                setLoggedIn({username: "", token: {}} as UserDataInterface)
            }
            setUserData(result);
        }
        getProfile()
        
        // eslint-disable-next-line
    }, [])

    if (!!userData)
        return (
            <>
                <h1>{userData.username}'s Profile</h1>
                { !!userData.email ? (<p>Email: <a href={`mailto:${userData.email}`}>{userData.email}</a></p>) : "" }
                { !!userData.full_name ? (<p>Full name: {userData.full_name}</p>) : "" }
            </>
        )
    else
        return (
            <>
                <p>Loading...</p>
            </>
        )
}
