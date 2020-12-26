import { TokenInterface } from './TokenInterface';

export interface UserDataInterface {
    username: string;
    token: TokenInterface;
}

export const createEmptyUserData = (): UserDataInterface => ({
    username: "",
    token: {access_token: "", token_type: ""}
})