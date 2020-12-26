import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import { objectToFormData } from '../../utils/FormToJSON';
import { FormError } from './page_components/FormError';

interface UserRegisterInterface {
    username: string;
    full_name: string | null;
    email: string | null;
    password: string;
    confirm_password: string;
}

export const Register: React.FC = () => {
    const history = useHistory();
    const { register, errors, handleSubmit, watch } = useForm<UserRegisterInterface>();
    const [unmatchedPasswords, setUnmatchedPasswords] = useState(false);
    const onSubmit = (data: UserRegisterInterface) => {
        if (data.confirm_password === data.password) {
            fetch("/api/v1/auth/register", {
                method: "POST",
                body: objectToFormData(data),
            }).then(res => res.json())
            .then(data => {
                if (data.success)
                    history.push("/login")
            })
            .catch(err => console.error(err))
        }
        else
            setUnmatchedPasswords(true)
    }

    return (
        <>
            <h1>Register</h1>
            <div className="unmatched-passwords" style={{
                display: unmatchedPasswords ? "block" : "none",
                backgroundColor: "#dc3545",
                color: "white",
                borderRadius: "5px"
            }}>Passwords don't match!</div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="input-label-oneline">
                    <label htmlFor="username">Username*</label>
                    <input id="username" name="username" type="text" placeholder="Enter your username..." ref={register({required:true})}/>
                </div>
                {errors.username && <FormError>Must specify a username</FormError>}
                <div className="input-label-oneline">
                    <label htmlFor="full_name">Full name</label>
                    <input id="full_name" name="full_name" type="text" placeholder="Enter your full name..." ref={register}/>
                </div>
                <div className="input-label-oneline">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="text" placeholder="Enter your email..." ref={register} />
                </div>
                <div className="input-label-oneline">
                    <label htmlFor="password">Password*</label>
                    <input id="password" name="password" type="password" placeholder="Enter your password..." ref={register({required:true})} />
                </div>
                {errors.password && <FormError>Must specify a password</FormError>}
                <div className="input-label-oneline">
                    <label htmlFor="confirm_password">Confirm password*</label>
                    <input id="confirm_password" name="confirm_password" type="password" placeholder="Confirm your password..."
                        ref={register({validate: (value) => value === watch("password") || "Passwords don't match"})}/>
                </div>
                {errors.confirm_password && <FormError>Passwords do not match!</FormError>}
                <button type="submit">Register</button>
            </form>
        </>
    )
}
