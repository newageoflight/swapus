export interface UserProfileInterface {
    username: string,
    email: string | null,
    full_name: string | null,
    disabled: boolean | null,
    hashed_password: string
}