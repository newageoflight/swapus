import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import CreatableSelect from "react-select/creatable";


interface ModifyPreferencesForm {
    have: string | null;
    want: string[] | null;
    comment: string | null;
}

interface Props {
    dataPoster: (data: any) => void;
    options: string[];
    currentHave: string;
    currentComment: string;
    currentWant: string[];
}

export const SetPreferencesForm: React.FC<Props> = ({dataPoster, options, currentHave, currentWant, currentComment}) => {
    const { register, control, handleSubmit } = useForm<ModifyPreferencesForm>();
    const [showChangePreferences, setShowChangePreferences] = useState(false);

    const onSubmit = (data: ModifyPreferencesForm) => {
        if (!data.have)
            data.have = currentHave;
        if (!data.want)
            data.want = currentWant;
        if (!data.comment)
            data.comment = currentComment;
        // now post the form
        dataPoster(data);
        setShowChangePreferences(false);
    }

    const resetPreferences = () => {
        dataPoster({have: null, want: null, comment: null} as ModifyPreferencesForm);
        setShowChangePreferences(false);
    }

    return (
        <div id="set-preferences">
        {
            showChangePreferences ? (
                <form onSubmit={handleSubmit(onSubmit)} id="prefs-form">
                    <label htmlFor="have">I have* (required):</label>
                    <Controller name="have" control={control} rules={{setValueAs: val => val?.value}} render={
                        ({onChange, onBlur, name}) =>
                            <CreatableSelect name={name} options={options.map(opt => ({value: opt, label: opt}))} onChange={onChange} onBlur={onBlur}
                            defaultValue={currentHave !== "" ? {value: currentHave, label: currentHave} : null} />
                    } />
                    <label htmlFor="want">I want* (required):</label>
                    <Controller name="want" control={control} rules={{setValueAs: val => val?.map((v:any) => v.value)}} render={
                        ({onChange, onBlur, name}) =>
                            <CreatableSelect name={name} isMulti options={options.map(opt => ({value: opt, label: opt}))} onChange={onChange} onBlur={onBlur}
                            defaultValue={currentWant?.map(w => ({value: w, label: w}))}/>
                    } />
                    <label htmlFor="comment">Add a comment:</label><br/>
                    <textarea name="comment" ref={register} defaultValue={currentComment}></textarea>
                    <br/>
                    <button type="submit">Submit</button>
                    <button onClick={() => setShowChangePreferences(false)}>Cancel</button>
                </form>
            ) : (
                <>
                    <p><strong>I have:</strong> {currentHave}</p>
                    <p><strong>I want:</strong> {currentWant?.join(", ")}</p>
                    <p><strong>Comment:</strong> {currentComment}</p>
                    <button onClick={() => setShowChangePreferences(true)}>Change my preferences</button>
                    <button onClick={() => resetPreferences()}>Reset my preferences</button>
                </>
            )
        }
        </div>
    )
}
