export function toTitleCase(str: string): string {
    return str.replace(/\b\w+/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
}

export function deunderscorify(str: string): string {
    return str.replace("_", " ")
}

export function getObjProp<T, K extends keyof T>(obj: T, key: K) {
    return obj[key]
}

export function hasKey<T>(obj: T, key: keyof any): key is keyof T {
    return key in obj;
}

export function setIntersection<T>(arr1: T[], arr2: T[]) {
    return arr1.filter(x => arr2.includes(x));
}

export function setDifference<T>(arr1: T[], arr2: T[]) {
    return arr1.filter(x => !arr2.includes(x));
}