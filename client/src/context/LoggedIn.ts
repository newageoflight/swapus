import { atom } from "recoil";
import { UserDataInterface } from './../interfaces/UserDataInterface';

export const LoggedIn = atom({
    key: "LoggedIn",
    default: {
        username: localStorage.getItem("username") || "",
        token: localStorage.getItem("token") || {}
    } as UserDataInterface
})