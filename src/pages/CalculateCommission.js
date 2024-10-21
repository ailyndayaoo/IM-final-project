import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/commission.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSackDollar } from '@fortawesome/free-solid-svg-icons';

function CalculateCommission() {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [sales, setSales] = useState('');
    const [commission, setCommission] = useState(0);
    const [availableDates, setAvailableDates] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        // Fetch the staff data from the API
        fetch('https://vynceianoani.helioho.st/getstaff.php')
            .then(response => response.json())
            .then(data => setEmployees(data))
            .catch(error => console.error('Error fetching staff data:', error));
    }, []);

    const handleProfileClick = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    const handleLogout = () => {
        navigate('/');
    };

    const handleEmployeeSelect = (employee) => {
        setSelectedEmployee(employee);
        fetchAvailableDates(employee.StaffID); // Fetch available dates when an employee is selected
    };

    const fetchAvailableDates = (staffID) => {
        fetch(`https://vynceianoani.helioho.st/getDtrDates.php?StaffID=${staffID}`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAvailableDates(data);
                } else {
                    console.error('Error fetching available dates:', data.error);
                }
            })
            .catch(error => console.error('Error fetching available dates:', error));
    };

    const handleSalesChange = (e) => {
        setSales(e.target.value);
        setCommission((e.target.value * 0.4).toFixed(2)); // 40% commission calculation
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleAddCommission = () => {
        if (!selectedEmployee || !selectedDate || !sales) {
            alert("Please fill in all fields.");
            return;
        }

        const newCommission = {
            staffID: selectedEmployee.StaffID,
            date: selectedDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
            total_sales: sales,
            total_commission: commission
        };

        // Send commission data to the backend
        fetch('https://vynceianoani.helioho.st/addCommision.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(newCommission),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    // Reset form after adding
                    setSelectedEmployee(null);
                    setSelectedDate(null);
                    setSales('');
                    setCommission(0);
                    setAvailableDates([]); // Clear available dates after adding commission
                } else {
                    alert("Error adding commission: " + data.message);
                }
            })
            .catch(error => console.error('Error:', error));
    };

    return (
        <div className="commission-page">
            <div className="commission-container">
                <FontAwesomeIcon icon={faSackDollar} className="icon-commission" beat />
                <h1>Commission</h1>        

                {/* Add New Commission Section */}
                <div className="add-commission-container">
                    <div>
                        <label>Select Date:</label>
                        <select
                            value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                                const dateStr = e.target.value;
                                const dateObj = new Date(dateStr);
                                setSelectedDate(dateObj);
                            }}
                            className="date-select"
                            disabled={!selectedEmployee} // Disable if no employee is selected
                        >
                            <option value="" disabled>Select a date</option> {/* This option is now unclickable */}
                            {Array.isArray(availableDates) && availableDates.length > 0 ? (
                                availableDates.map((date, index) => (
                                    <option key={index} value={date}>
                                        {new Date(date).toLocaleDateString()}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No available dates</option> // This is also unclickable
                            )}
                        </select>

                    </div>

                    <div>
                        <label>Select Employee:</label>
                        <select
                            value={selectedEmployee ? selectedEmployee.StaffID : ''}
                            onChange={(e) => handleEmployeeSelect(employees.find(emp => emp.StaffID === e.target.value))}
                            className="employee-select"
                        >
                            <option value="" disabled>Select an employee</option>
                            {employees.map(employee => (
                                <option key={employee.StaffID} value={employee.StaffID}>
                                    {employee.Fname} {employee.Lname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Enter Sales:</label>
                        <input
                            type="number"
                            value={sales}
                            onChange={handleSalesChange}
                            placeholder="Enter total sales"
                            className="sales-input"
                        />
                    </div>

                    <button className="add-button" onClick={handleAddCommission}>
                        Add Commission
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CalculateCommission;
