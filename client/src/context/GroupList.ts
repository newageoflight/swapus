import { atom, selector } from 'recoil';
import { GroupInterface } from '../interfaces/GroupInterface';
import { callProtectedEndpoint } from '../utils/HTTPHandlers';

const GroupSelector = selector({
    key: "mySelector",
    get: async ({get}) => {
        return;
        // return await callProtectedEndpoint("/api/v1/groups/")
    }
})

export const GroupList = atom({
    key: "GroupList",
    default: [] as GroupInterface[]
})