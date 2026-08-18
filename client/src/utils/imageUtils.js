export const getDirectImageUrl = (url) => {
    if (!url) return "";

    if (url.includes('drive.google.com') || url.includes('googleusercontent.com')) {
        return `http://localhost:5000/api/students/preview?url=${encodeURIComponent(url)}`;
    }

    return url;
};
