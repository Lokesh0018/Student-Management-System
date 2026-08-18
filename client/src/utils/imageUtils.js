export const getDirectImageUrl = (url) => {
    if (!url) return "";

    const match = url.match(/\/d\/([^/]+)/);

    if (match) {
        const fileId = match[1];
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`;
    }

    return url;
};
