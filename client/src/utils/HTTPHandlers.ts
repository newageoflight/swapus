export function handleResponse(res: any, history: any) {
    if (res.status === 401)
        history.push("/login");
    else
        return res.json();
}

export function handleError(err: any) {
    console.error(err);
}

export async function callProtectedEndpoint(endpoint: string, tokenVal: string, history: any, payload?: any, method?: string, specifiedHeaders?: Record<string, string>) {
    try {
        let res = await fetch(endpoint, {
            method: method || "GET",
            headers: {
                "Authorization": `Bearer ${tokenVal}`,
                ...specifiedHeaders
            },
            body: payload
        });
        if (res.status === 401) {
            history.push("/login");
            localStorage.clear();
            throw new Error("Not logged in!")
        }
        return await res.json();
    } catch (error) {
        console.error(error)
    }
}

export async function callLogin(endpoint: string, history: any, payload?: any, method?: string, specifiedHeaders?: Record<string, string>) {
    try {
        let res = await fetch(endpoint, {
            method: method || "GET",
            headers: {
                ...specifiedHeaders
            },
            body: payload
        });
        if (res.status === 401) {
            throw new Error("Not logged in!")
        }
        return await res.json();
    } catch (error) {
        console.error(error)
    }
}