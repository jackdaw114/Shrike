export function safeStringify(obj,ignore = [],ignoreProps=[]) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if(typeof value === "object" && value !== null) {
            if(seen.has(value) || ignore.includes(key)) {
                return "[Circular]";
            }
            seen.add(value);
        }    
        if (value instanceof Float32Array || value instanceof Uint32Array 
            || value instanceof Uint16Array) {
            return Array.from(value);
        }
        if (typeof value === 'function') {
            return value.toString();
        }
        return value;
    });
}
