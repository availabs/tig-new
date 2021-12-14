const cache = new Map();
const fetcher = url => {
    if (cache.has(url)) {
        return Promise.resolve(cache.get(url));
    }
    return fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error("Network error");
            }
            return res.json();
        })
        .then(json => {
            cache.set(url, json);
            return json;
        })
        .catch(e => {
            console.log('failed to fetch')
        })
}
export default fetcher;
