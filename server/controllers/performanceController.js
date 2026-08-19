const pool = require('../config/db');

exports.getPerformanceStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const { class_id } = req.query; // optional for admin
        
        let targetClassId = class_id || null;

        if (role === 'CLASS_TEACHER') {
            const [teacherClass] = await pool.execute(
                'SELECT c.id FROM classes c JOIN teachers t ON c.teacher_id = t.id WHERE t.user_id = ?',
                [userId]
            );
            if (teacherClass.length > 0) {
                targetClassId = teacherClass[0].id;
            } else {
                return res.json({ success: true, data: null, message: "No class assigned" });
            }
        }

        let baseWhere = targetClassId ? `WHERE s.class_id = ?` : ``;
        let params = targetClassId ? [targetClassId] : [];

        const [studentAverages] = await pool.execute(`
            SELECT s.id, s.first_name, s.last_name, 
                   AVG((m.marks_obtained / m.max_marks) * 100) as avg_percentage
            FROM students s
            JOIN marks m ON s.id = m.student_id
            ${baseWhere}
            GROUP BY s.id
        `, params);
        
        if (studentAverages.length === 0) {
             return res.json({ 
                 success: true, 
                 data: { 
                     overview: { average: 0, highest: 0, lowest: 0, passPercentage: 0 }, 
                     subjectAverages: [], 
                     distribution: [
                         { name: '90% and above', value: 0, color: '#10b981' },
                         { name: '75% - 89%', value: 0, color: '#3b82f6' },
                         { name: '50% - 74%', value: 0, color: '#f59e0b' },
                         { name: 'Below 50%', value: 0, color: '#ef4444' }
                     ], 
                     topStudents: [], 
                     bottomStudents: [] 
                 }
             });
        }

        // Calculate overview
        let totalAvg = 0;
        let highest = 0;
        let lowest = 100;
        let passCount = 0;
        let highestStudent = '';
        let lowestStudent = '';
        
        let dist = {
             above90: 0,
             above75: 0,
             above50: 0,
             below50: 0
        };

        studentAverages.forEach(student => {
             const score = parseFloat(student.avg_percentage);
             totalAvg += score;
             if (score > highest || highestStudent === '') {
                 highest = score;
                 highestStudent = `${student.first_name} ${student.last_name}`;
             }
             if (score < lowest || lowestStudent === '') {
                 lowest = score;
                 lowestStudent = `${student.first_name} ${student.last_name}`;
             }
             if (score >= 40) passCount++; 

             if (score >= 90) dist.above90++;
             else if (score >= 75) dist.above75++;
             else if (score >= 50) dist.above50++;
             else dist.below50++;
        });

        const overview = {
             average: (totalAvg / studentAverages.length).toFixed(1),
             highest: highest.toFixed(1),
             highestStudent,
             lowest: lowest.toFixed(1),
             lowestStudent,
             passPercentage: ((passCount / studentAverages.length) * 100).toFixed(1)
        };

        const sorted = [...studentAverages].sort((a, b) => b.avg_percentage - a.avg_percentage);
        const topStudents = sorted.slice(0, 3).map((s, idx) => ({ 
            id: s.id, 
            rank: idx+1, 
            name: `${s.first_name} ${s.last_name}`, 
            score: parseFloat(s.avg_percentage).toFixed(1) + '%' 
        }));
        
        const topIds = new Set(topStudents.map(s => s.id));
        const bottomStudents = sorted.filter(s => parseFloat(s.avg_percentage) < 75 && !topIds.has(s.id))
            .sort((a, b) => a.avg_percentage - b.avg_percentage) // lowest first
            .slice(0, 5) // limit to 5
            .map((s) => ({ 
                name: `${s.first_name} ${s.last_name}`, 
                score: parseFloat(s.avg_percentage).toFixed(1) + '%' 
            }));

        const [subjectAveragesDB] = await pool.execute(`
            SELECT sub.subject_name as name, AVG((m.marks_obtained / m.max_marks) * 100) as avg
            FROM marks m
            JOIN subjects sub ON m.subject_id = sub.id
            JOIN students s ON m.student_id = s.id
            ${baseWhere}
            GROUP BY sub.id
        `, params);

        res.json({
            success: true,
            data: {
                overview,
                subjectAverages: subjectAveragesDB.map(s => ({ name: s.name, avg: parseFloat(s.avg) })),
                distribution: [
                     { name: '90% and above', value: Math.round((dist.above90 / studentAverages.length) * 100), color: '#10b981' },
                     { name: '75% - 89%', value: Math.round((dist.above75 / studentAverages.length) * 100), color: '#3b82f6' },
                     { name: '50% - 74%', value: Math.round((dist.above50 / studentAverages.length) * 100), color: '#f59e0b' },
                     { name: 'Below 50%', value: Math.round((dist.below50 / studentAverages.length) * 100), color: '#ef4444' }
                ],
                topStudents,
                bottomStudents
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
