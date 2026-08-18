import React, { useState } from 'react';

function StudentImage({ studentId, studentName, className, style }) {
    const [failed, setFailed] = useState(false);

    if (failed || !studentId) {
        return (
            <img
                src="/default-avatar.png"
                alt={studentName || "Student"}
                className={className}
                style={style}
            />
        );
    }

    return (
        <img
            src={`http://localhost:5000/api/students/${studentId}/image`}
            alt={studentName || "Student"}
            className={className}
            style={style}
            onError={() => setFailed(true)}
        />
    );
}

export default StudentImage;
