export const findFunctionBody = (content, functionName) => {
    let stack = [];
    let startIndex = -1;
    let inFunction = false;

    console.log("content",content)
    // Find the start of the function
    const functionStartRegex = new RegExp(`(?:function\\s+${functionName}+\\s*\\([^)]*\\)\\s*|${functionName}+\\s*=\\s*\\([^)]*\\)\\s*=>\\s*){`);
    const match = content.match(functionStartRegex);
    console.log("match",match)
    if (!match) return null;
    startIndex = match.index + match[0].length;

    stack.push('{')
    // Parse through the content
    for (let i = startIndex; i < content.length; i++) {
        const char = content[i];

        if (char === '{') {
            stack.push('{');
        } else if (char === '}') {
            stack.pop();
            if (stack.length === 0) {
                return content.substring(startIndex, i);
            }
        }
    }
    return null;
};