app.post('/remove-staff', (req, res) => {
    const { staffID } = req.body;

    const query = 'UPDATE staff SET removed = 1 WHERE StaffID = ?';
    
    db.query(query, [staffID], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error updating staff', error: err });
        }
        res.status(200).json({ message: 'Staff member removed successfully' });
    });
});
