export function handleResponse(res: any, history: any) {
    if (res.status === 401)
        history.push("/login");
    else
        return res.json();
}

export function handleError(err: any) {
    console.error(err);
}

interface EndpointCallOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "HEAD" | "DELETE";
    body?: any;
    specifiedHeaders?: Record<string,string>;
    next?: () => void;
}

export async function callProtectedEndpoint(endpoint: string, tokenVal: string, history: any, loginResetter: () => void, options?: EndpointCallOptions) {
    let specifiedHeaders: Record<string,string> = (options ? options.specifiedHeaders : {}) as Record<string,string>;
    let fetchParams = {
        method: options ? options.method : "GET",
        headers: {
            "Authorization": `Bearer ${tokenVal}`,
            ...specifiedHeaders
        },
        body: options ? options.body : null
    }
    try {
        let res = await fetch(endpoint, fetchParams);
        switch (res.status) {
            case 200:
                return await res.json();
            case 401:
                history.push("/login");
                localStorage.clear();
                loginResetter();
                throw new Error("Not logged in!")
            default:
                console.log(await res.json());
        }
        options?.next && options.next();
    } catch (error) {
        console.error(error)
    }
}

export async function callLogin(endpoint: string, {payload, method, specifiedHeaders, next}: {payload?: any, method?: string, specifiedHeaders?: Record<string, string>, next?: () => void}) {
    try {
        let res = await fetch(endpoint, {
            method: method || "GET",
            headers: {
                ...specifiedHeaders
            },
            body: payload
        });
        switch (res.status) {
            case 200:
                return await res.json();
            case 401:
                throw new Error("Not logged in!")
        }
        !!next && next();
    } catch (error) {
        console.error(error)
    }
}