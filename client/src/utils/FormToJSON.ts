export function formDataToObject(formData: FormData) {
    let object = {} as any;
    formData.forEach((value, key) => {
        if (!Reflect.has(object, key)) {
            object[key] = value;
            return;
        }
        if (!Array.isArray(object[key])) {
            object[key] = [object[key]];
        }
        object[key].push(value);
    })
    return object;
}