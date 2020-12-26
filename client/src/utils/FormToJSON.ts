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

export function objectToFormData(obj: any) {
    const formData = new FormData();
    Object.keys(obj).forEach(key => formData.append(key, obj[key]));
    return formData;
}