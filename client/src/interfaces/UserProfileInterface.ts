export interface UserProfileInterface {
    username: string,
    email?: string,
    full_name?: string,
    phone_number?: string,
    bio?: string,
    disabled?: boolean,
    hashed_password: string
}