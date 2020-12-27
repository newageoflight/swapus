import React from 'react'
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import { useRecoilState } from "recoil";
import CreatableSelect from "react-select/creatable";

import { callProtectedEndpoint } from '../../utils/HTTPHandlers';
import { LoggedIn } from '../../context/LoggedIn';
import { createEmptyUserData } from '../../interfaces/UserDataInterface';
import { FormError } from './FormError';

interface CreateGroupForm {
    name: string;
    options: string[];
    members: string[];
}

export const CreateGroup: React.FC = () => {
    const { control, register, handleSubmit, errors } = useForm<CreateGroupForm>();
    const history = useHistory();
    const [loggedIn, setLoggedIn] = useRecoilState(LoggedIn);
    const resetLoggedIn = () => setLoggedIn(createEmptyUserData())

    const createNewGroup = (data: CreateGroupForm) => {
        async function makeGroup() {
            let ret = await callProtectedEndpoint("/api/v1/graph/create", loggedIn.token.access_token, history, resetLoggedIn, {
                method: "POST", body: JSON.stringify(data), specifiedHeaders: {"Content-Type": "application/json"}
            })
            if (!!ret && Object.keys(ret).length > 0 && ret.success)
                history.push(`/groups/${ret.data}`)
        }
        console.log(data)
        makeGroup()
    }

    return (
        <div>
            <h2>Create a new group</h2>
            <form onSubmit={handleSubmit(createNewGroup)}>
                <div className="input-label-oneline">
                    <label htmlFor="name">Name of your group (required):</label>
                    <input type="text" name="name" id="group-name" ref={register({required: true})}/>
                </div>
                {errors.name && <FormError>This field is required!</FormError>}
                <label>Swap options (don't worry, you can add more later):</label>
                <Controller name="options" control={control} rules={{required: true, minLength: 2, setValueAs: val => val?.map((v: any) => v.value)}} render={
                    ({onChange, onBlur, name}) => <CreatableSelect name={name} isMulti onChange={onChange} onBlur={onBlur}/>
                } />
                {errors.options && <FormError>You must specify at least two options!</FormError>}
                <label>Members to add to the group (don't worry, you can add more later):</label>
                <Controller name="members" control={control} rules={{required: true, minLength: 2, setValueAs: val => val?.map((v: any) => v.value)}} render={
                    ({onChange, onBlur, name}) => <CreatableSelect name={name} isMulti onChange={onChange} onBlur={onBlur}/>
                } />
                {errors.members && <FormError>You must specify at least two options!</FormError>}
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}
