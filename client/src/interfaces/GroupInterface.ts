export interface GroupInterface {
    id: string,
    name: string,
    options: string[],
    members: GroupMember[],
    owner: string,
    swap_cycles: Array<Array<GroupMemberSingleWant>>
}

export interface GroupMember {
    username: string,
    have: string | null,
    want: string[] | null
}

export interface GroupMemberSingleWant extends Omit<GroupMember, "want"> {
    want: string | null
}