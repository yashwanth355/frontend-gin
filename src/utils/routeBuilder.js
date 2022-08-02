export function routeBuilder(type, id, action) {
    id = encodeURIComponent(id);
    switch (action) {
        case "view":
            return `/${type}/${id}/view`
        case "edit":
            return `/${type}/${id}/edit`
        case "create":
            return `/${type}/create`
        default:
            return `/${type}/create`
    }
}
export function addParams(url, params) {
    console.log("Params are", params);
    let uri = `${url}?`
    for (let key of Object.keys(params)) {
        uri = `${uri}${key}=${params[key]}&`
    }
    return uri;
}