import { atom } from 'recoil';
import { GroupInterface } from '../interfaces/GroupInterface';

export const GroupList = atom({
    key: "GroupList",
    default: [] as GroupInterface[]
})