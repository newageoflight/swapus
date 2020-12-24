import { atomFamily, selectorFamily } from "recoil";
import { GroupInterface } from './../interfaces/GroupInterface';
import { GroupList } from './GroupList';

export const GroupSelector = atomFamily({
    key: "GroupSelector",
    default: selectorFamily({
        key: "GroupSelector/default",
        get: id => ({get}): GroupInterface => {
            const groupList = get(GroupList);

            return groupList.find((group) => group.id === id) as GroupInterface
        }
    })
})