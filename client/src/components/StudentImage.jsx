import React, { useState } from 'react';

import { getDirectImageUrl } from '../utils/imageUtils';

function StudentImage({ studentId, studentName, photoUrl, className, style }) {
    const [failed, setFailed] = useState(false);

    if (failed || !studentId) {
        const getInitials = (name) => {
            if (!name || name === 'undefined undefined' || name === 'undefined') return 'S';
            const parts = name.replace(/undefined/g, '').split(' ').filter(p => p.trim() !== '');
            if (parts.length === 0) return 'S';
            if (parts.length === 1) return parts[0][0].toUpperCase();
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        };

        const initials = getInitials(studentName);
        const width = style?.width || '40px';
        const height = style?.height || '40px';
        const borderRadius = style?.borderRadius || '50%';

        return (
            <div 
                className={className}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--primary, #3B82F6)',
                    color: 'white',
                    fontWeight: 600,
                    width,
                    height,
                    borderRadius,
                    fontSize: `calc(${width} / 2.5)`,
                    ...style
                }}
                title={studentName}
            >
                {initials}
            </div>
        );
    }

    return (
        <img
            src={photoUrl ? getDirectImageUrl(photoUrl) : `http://localhost:5000/api/students/${studentId}/image`}
            alt={studentName || "Student"}
            className={className}
            style={style}
            onError={() => setFailed(true)}
        />
    );
}

export default StudentImage;
