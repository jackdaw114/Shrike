export function safeStringify(obj,ignore = []) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if(typeof value === "object" && value !== null) {
            if(seen.has(value) || ignore.includes(key)) {
                return "[Circular]";
            }
            seen.add(value);
        }
        if (typeof value === 'function') {
            return value.toString();
        }
        return value;
    });
}
