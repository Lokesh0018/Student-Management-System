async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/teachers', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-user-id': '1',
                'x-user-role': 'ADMIN'
            },
            body: JSON.stringify({
                name: "API Test",
                email: "api@test.com",
                phone: "111",
                department: "Testing",
                description: "Some desc",
                qualification: "PhD",
                employee_id: "T99",
                joining_date: "2023-01-01",
                assigned_classes: "10-A",
                password: "password123"
            })
        });
        const data = await res.json();
        console.log("Success:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
