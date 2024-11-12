
function convertToPath(inputString) {
    if (typeof inputString !== 'string') {
        return null;
    }
    // Normalize path and replace backslashes with forward slashes
    const normalizedPath = inputString.replace(/\\/g, '/');

    // Find the portion after "uploads/"
    const match = normalizedPath.match(/uploads\/.*/);

    // If the match exists, prepend the base URL with 'my-backend/'
    return match ? `http://10.0.2.2:8081/my-backend/${match[0]}` : null;
}


const pathFormat = `https://software-project-f463.onrender.com/opt/render/project/src/my-backend/uploads/1731406102392.jpg`;
console.log(pathFormat)