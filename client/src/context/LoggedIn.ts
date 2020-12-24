import { atom } from "recoil";
import { UserDataInterface } from './../interfaces/UserDataInterface';

export const LoggedIn = atom({
    key: "LoggedIn",
    default: {
        username: localStorage.getItem("username") || "",
        token: {access_token: localStorage.getItem("tokenValue"), token_type: localStorage.getItem("tokenType")} || {}
    } as UserDataInterface
})