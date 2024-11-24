import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../css/commission.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSackDollar } from '@fortawesome/free-solid-svg-icons';

function Commission() {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [sales, setSales] = useState('');
    const [commission, setCommission] = useState(0);
    const [commissionData, setCommissionData] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // State for search term

    const navigate = useNavigate();

    useEffect(() => {
        const storedBranch = localStorage.getItem('selectedBranch'); // Retrieve stored branch from local storage
    
        if (storedBranch) {
            // Fetch the staff data with the branch parameter
            fetch(`https://vynceianoani.helioho.st/getstaff2.php?branch=${storedBranch}`)
                .then(response => response.json())
                .then(data => setEmployees(data))
                .catch(error => console.error('Error fetching staff data:', error));
    
            // Fetch the commission data with the branch parameter
            fetch(`https://vynceianoani.helioho.st/getCommissions.php?branch=${storedBranch}`)
                .then(response => response.json())
                .then(data => setCommissionData(data))
                .catch(error => console.error('Error fetching commissions:', error));
        } else {
            console.error('No branch found in local storage.');
        }
    }, []);
    const handleProfileClick = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    const handleLogout = () => {
        navigate('/');
    };

    const handleEmployeeSelect = (employee) => {
        setSelectedEmployee(employee);
        if (employee && employee.StaffID) {
            fetchAvailableDates(employee.StaffID); // Fetch available dates when an employee is selected
        }
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
                    // Update commissionData and reset form after adding
                    setCommissionData([...commissionData, newCommission]);
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

    // Filter commission data based on search input
    const filteredCommissionData = commissionData.filter(item => {
        const nameMatches = item.FullName && item.FullName.toLowerCase().includes(searchTerm.toLowerCase());
        const dateMatches = item.Date && item.Date.includes(searchTerm); // Match date as a substring
        return nameMatches || dateMatches; // Return true if either matches
    });


    return (
        <div className="commission-page">
            <div className="commission-container">
                <FontAwesomeIcon icon={faSackDollar} className="icon-commission" beat />
                <h1>Commission</h1>

                <div className="profile2-container">
                    <i className="fas fa-user profile-icon"></i>
                    <p className="profile2-label" onClick={handleProfileClick}>
                        Admin
                        <i className="fas fa-chevron-down arrow-icon"></i>
                    </p>
                    {isDropdownVisible && (
                        <div className="dropdown-menu">
                            <p className="dropdown-item" onClick={handleLogout}>
                                Logout <i className="fa-solid fa-right-from-bracket logout-icon"></i>
                            </p>
                        </div>
                    )}
                </div>

                {/* Search Bar */}
                <div className="search-bar-commission-container">
                    <label>Search:</label>
                    <input
                        type="text"
                        placeholder="search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="add-commission-container">
                    <div>
                        <label>Select Employee:</label>
                        <select
                            value={selectedEmployee ? `${selectedEmployee.Fname} ${selectedEmployee.Lname}` : ''} // Display full name if selected
                            onChange={(e) => {
                                const fullName = e.target.value; // Get selected full name
                                const selectedEmp = employees.find(
                                    (employee) => `${employee.Fname} ${employee.Lname}` === fullName // Match full name to employee object
                                );
                                handleEmployeeSelect(selectedEmp); // Pass the selected employee object
                            }}
                            className="employee-select"
                        >
                            <option value="">Select an employee</option>
                            {employees.map((employee) => (
                                <option key={employee.StaffID} value={`${employee.Fname} ${employee.Lname}`}>
                                    {employee.Fname} {employee.Lname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Select Date:</label>
                        <select
                            value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''} // Prevent undefined value
                            onChange={(e) => {
                                const dateStr = e.target.value;
                                const dateObj = new Date(dateStr);
                                setSelectedDate(dateObj);
                            }}
                            className="date-select"
                        >
                            <option value="">Select a date</option>
                            {Array.isArray(availableDates) && availableDates.length > 0 ? (
                                availableDates.map((date, index) => (
                                    <option key={index} value={date}>
                                        {new Date(date).toLocaleDateString()} {/* Format date as MM/DD/YYYY */}
                                    </option>
                                ))
                            ) : (
                                <option value="">No available dates</option>
                            )}
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

                    <button className="add-commission-button" onClick={handleAddCommission}>
                        Add Commission
                    </button>
                </div>

                <div className="table-commission-container">
                    <table className="commission-table">
                        <thead>
                            <tr>
                                <th>Staff ID</th>
                                <th>Staff Name</th>
                                <th>Date</th>
                                <th>Total Sales Per Day</th>
                                <th>Total Commission Per Day</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCommissionData.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.StaffID}</td>
                                    <td>{item.FullName}</td>
                                    <td>{item.Date ? new Date(item.Date).toISOString().split('T')[0] : 'N/A'}</td>
                                    <td>{item.total_sales_per_day}</td>
                                    <td>{item.total_commission_per_day}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Commission;
