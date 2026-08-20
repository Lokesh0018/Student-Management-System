const db = require('../config/db');

exports.getSettings = async (req, res) => {
    try {
        const [settings] = await db.execute('SELECT * FROM payment_settings LIMIT 1');
        if (settings.length === 0) {
            return res.json({ success: true, data: null });
        }
        res.json({ success: true, data: settings[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { upi_id, payee_name, instructions } = req.body;
        const admin_id = req.user.id; // from auth middleware

        if (!upi_id) {
            return res.status(400).json({ success: false, message: 'UPI ID is required' });
        }

        const [existing] = await db.execute('SELECT * FROM payment_settings LIMIT 1');
        if (existing.length === 0) {
            await db.execute(
                'INSERT INTO payment_settings (admin_id, upi_id, payee_name, instructions) VALUES (?, ?, ?, ?)',
                [admin_id, upi_id, payee_name || '', instructions || '']
            );
        } else {
            await db.execute(
                'UPDATE payment_settings SET admin_id = ?, upi_id = ?, payee_name = ?, instructions = ? WHERE id = ?',
                [admin_id, upi_id, payee_name || '', instructions || '', existing[0].id]
            );
        }
        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Fee Terms CRUD
exports.getFeeTerms = async (req, res) => {
    try {
        const [terms] = await db.execute('SELECT * FROM fee_terms ORDER BY due_date ASC');
        res.json({ success: true, data: terms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.createFeeTerm = async (req, res) => {
    try {
        const { name, academic_year_id, amount, due_date, description, status } = req.body;
        if (!name || !amount || !due_date) {
            return res.status(400).json({ success: false, message: 'Name, amount, and due date are required' });
        }

        const [result] = await db.execute(
            'INSERT INTO fee_terms (name, academic_year_id, amount, due_date, description, status) VALUES (?, ?, ?, ?, ?, ?)',
            [name, academic_year_id || null, amount, due_date, description || '', status || 'ACTIVE']
        );
        res.status(201).json({ success: true, message: 'Fee term created successfully', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateFeeTerm = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, academic_year_id, amount, due_date, description, status } = req.body;
        
        await db.execute(
            'UPDATE fee_terms SET name=?, academic_year_id=?, amount=?, due_date=?, description=?, status=? WHERE id=?',
            [name, academic_year_id || null, amount, due_date, description || '', status || 'ACTIVE', id]
        );
        res.json({ success: true, message: 'Fee term updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteFeeTerm = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM fee_terms WHERE id=?', [id]);
        res.json({ success: true, message: 'Fee term deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.assignFee = async (req, res) => {
    try {
        const { fee_term_id, class_id } = req.body;
        if (!fee_term_id || !class_id) {
            return res.status(400).json({ success: false, message: 'Fee term and class are required' });
        }

        const [term] = await db.execute('SELECT * FROM fee_terms WHERE id=?', [fee_term_id]);
        if (term.length === 0) return res.status(404).json({ success: false, message: 'Fee term not found' });

        const [students] = await db.execute('SELECT id FROM students WHERE class_id=?', [class_id]);
        if (students.length === 0) return res.status(404).json({ success: false, message: 'No students found in this class' });

        let assignedCount = 0;
        for (const student of students) {
            const [existing] = await db.execute('SELECT id FROM student_fees WHERE student_id=? AND fee_term_id=?', [student.id, fee_term_id]);
            if (existing.length === 0) {
                await db.execute(
                    'INSERT INTO student_fees (student_id, fee_term_id, amount, due_date) VALUES (?, ?, ?, ?)',
                    [student.id, fee_term_id, term[0].amount, term[0].due_date]
                );
                assignedCount++;
            }
        }

        res.json({ success: true, message: `Fee assigned to ${assignedCount} students successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

// Parent Fees endpoints
exports.getMyChildrenFees = async (req, res) => {
    try {
        const parentId = req.user.id;
        
        // Find children of this parent
        const [children] = await db.execute(
            'SELECT id, first_name, last_name, class_id FROM students WHERE parent_user_id=?',
            [parentId]
        );

        if (children.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // For each child, get their fees
        const data = [];
        for (const child of children) {
            const [classData] = await db.execute('SELECT class_name, section FROM classes WHERE id=?', [child.class_id]);
            const className = classData.length > 0 ? `${classData[0].class_name} ${classData[0].section}` : 'Unknown';

            const [fees] = await db.execute(`
                SELECT sf.id as student_fee_id, sf.amount, sf.status, sf.due_date,
                       ft.name as term_name, ft.description
                FROM student_fees sf
                JOIN fee_terms ft ON sf.fee_term_id = ft.id
                WHERE sf.student_id = ?
                ORDER BY sf.due_date ASC
            `, [child.id]);

            data.push({
                student: {
                    id: child.id,
                    name: `${child.first_name} ${child.last_name}`,
                    className: className
                },
                fees: fees
            });
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.submitPayment = async (req, res) => {
    try {
        const { studentFeeId } = req.params;
        const { utr_number, amount } = req.body;
        const parentId = req.user.id;

        if (!utr_number) {
            return res.status(400).json({ success: false, message: 'UTR number is required' });
        }

        // Verify this fee belongs to a child of this parent
        const [fee] = await db.execute(`
            SELECT sf.id, sf.status 
            FROM student_fees sf
            JOIN students s ON sf.student_id = s.id
            WHERE sf.id = ? AND s.parent_user_id = ?
        `, [studentFeeId, parentId]);

        if (fee.length === 0) {
            return res.status(404).json({ success: false, message: 'Fee record not found or unauthorized' });
        }

        if (fee[0].status === 'PAID') {
            return res.status(400).json({ success: false, message: 'This fee is already paid' });
        }

        // Create payment record
        await db.execute(
            'INSERT INTO payments (student_fee_id, parent_id, amount, utr_number, payment_date, status) VALUES (?, ?, ?, ?, CURDATE(), ?)',
            [studentFeeId, parentId, amount, utr_number, 'SUBMITTED']
        );

        // Update fee status
        await db.execute(
            'UPDATE student_fees SET status = ? WHERE id = ?',
            ['PAYMENT_SUBMITTED', studentFeeId]
        );

        res.json({ success: true, message: 'Payment submitted successfully for verification' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Admin Payment Verification
exports.getPayments = async (req, res) => {
    try {
        const [payments] = await db.execute(`
            SELECT p.id, p.amount, p.utr_number, p.payment_date, p.status, p.rejection_reason,
                   sf.due_date, ft.name as term_name,
                   s.first_name, s.last_name, c.class_name, c.section
            FROM payments p
            JOIN student_fees sf ON p.student_fee_id = sf.id
            JOIN fee_terms ft ON sf.fee_term_id = ft.id
            JOIN students s ON sf.student_id = s.id
            JOIN classes c ON s.class_id = c.id
            ORDER BY p.payment_date DESC
        `);
        res.json({ success: true, data: payments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        const [payment] = await db.execute('SELECT student_fee_id FROM payments WHERE id = ?', [id]);
        if (payment.length === 0) return res.status(404).json({ success: false, message: 'Payment not found' });

        await db.execute('UPDATE payments SET status = ?, verified_by = ?, verified_at = NOW() WHERE id = ?', ['VERIFIED', adminId, id]);
        await db.execute('UPDATE student_fees SET status = ? WHERE id = ?', ['PAID', payment[0].student_fee_id]);

        res.json({ success: true, message: 'Payment verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.rejectPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        if (!reason) return res.status(400).json({ success: false, message: 'Rejection reason is required' });

        const [payment] = await db.execute('SELECT student_fee_id FROM payments WHERE id = ?', [id]);
        if (payment.length === 0) return res.status(404).json({ success: false, message: 'Payment not found' });

        await db.execute('UPDATE payments SET status = ?, rejection_reason = ?, verified_by = ?, verified_at = NOW() WHERE id = ?', ['REJECTED', reason, adminId, id]);
        await db.execute('UPDATE student_fees SET status = ? WHERE id = ?', ['REJECTED', payment[0].student_fee_id]);

        res.json({ success: true, message: 'Payment rejected' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const [fees] = await db.execute('SELECT amount, status FROM student_fees');
        
        let totalExpected = 0;
        let totalCollected = 0;
        let pending = 0;
        let overdue = 0;

        fees.forEach(f => {
            const amt = parseFloat(f.amount);
            totalExpected += amt;
            if (f.status === 'PAID') totalCollected += amt;
            else if (f.status === 'OVERDUE') overdue += amt;
            else pending += amt; // PENDING or PAYMENT_SUBMITTED
        });

        res.json({
            success: true,
            data: {
                totalExpected,
                totalCollected,
                pending,
                overdue
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
