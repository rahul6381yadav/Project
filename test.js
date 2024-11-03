const profilePic = {
    uri: "C:\\Users\\rahul\\Downloads\\image.jpg", // Example URI
};

// Extract the file extension and format the formData
const uriParts = profilePic.uri.split('\\'); // Split by backslash for Windows paths
const fileName = uriParts[uriParts.length - 1]; // Get the file name
const fileType = fileName.split('.').pop(); // Extract the file type (extension)

// Create a FormData object
const formData = new FormData();
formData.append('profilePic', {
    uri: profilePic.uri,
    name: `profile.${fileType}`, // Create a name for the file
    type: `image/${fileType}`, // Set the type for the file
});

// Example to check the FormData contents
console.log('FormData:', formData.uri);
