import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { faMoneyCheckDollar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../css/calculatepayroll.css'; // Ensure this file exists and contains your styles
import DatePicker from 'react-datepicker'; // Week picker library
import 'react-datepicker/dist/react-datepicker.css'; // Import the CSS for the date picker

function CalculatePayroll() {
  const [payrollData, setPayrollData] = useState({
    payrollID: '',
    commissionID: '',
    dtrID: '',
    allowance: '',
    debt: '',
    payDate: '',
  });
  const [commissions, setCommissions] = useState([]); // State to hold commission data
  const [selectedWeek, setSelectedWeek] = useState(null); // State for selected week
  const [weeklyCommissions, setWeeklyCommissions] = useState([]); // State for commissions of the selected week
  const [selectedDate, setSelectedDate] = useState(null); // State for selected date
  const [isEdit, setIsEdit] = useState(false); // For editing mode
  const [totalPay, setTotalPay] = useState(0); // State for total pay
  const navigate = useNavigate();
  const location = useLocation(); // To get the passed state

  // Get name and ID from location state
  const { staffID = 'Unknown ID', name = 'Unknown Staff' } = location.state || {};

  const handleBackClick = () => {
    navigate('/home/payrollfinal');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPayrollData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare the data for submission
    const submissionData = {
      StaffID: staffID,
      DTRID: payrollData.dtrID,
      Commission_ID: payrollData.commissionID,
      Pay_Date: selectedWeek ? new Date(selectedWeek).toISOString().split('T')[0] : '',
      Allowance: parseFloat(payrollData.allowance || 0),
      Debt: parseFloat(payrollData.debt || 0),
      Total: totalPay.toFixed(2), // now safe to use toFixed
    };

    try {
      const response = await fetch('https://vynceianoani.helioho.st/savePayrollData.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      console.log("Payroll submission result:", result); // Check response for success or failure

      if (result.success) {
        alert('Payroll data saved successfully!');
        navigate('/home/payrollfinal');
      } else {
        alert('Failed to save payroll data: ' + result.message || 'Unknown error occurred.');
      }

    } catch (error) {
      console.error("Error submitting payroll data:", error);
      alert('Error occurred while saving payroll data: ' + error.message);
    }
  };

  // Fetch commissions from the API for the specific staff member
  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const response = await fetch(`https://vynceianoani.helioho.st/getCommissions.php?staffID=${staffID}`);
        const data = await response.json();
        console.log("Fetched commissions:", data); // Log the fetched data for debugging
        setCommissions(data); // Store the fetched commissions
      } catch (error) {
        console.error("Error fetching commissions:", error);
      }
    };

    if (staffID) {
      fetchCommissions();
    }
  }, [staffID]);

  // Helper function to calculate the week number
  const getWeekNumber = (date) => {
    const d = new Date(date);
    const dayNum = d.getUTCDay() || 7; // Get day of the week (Sunday = 7)
    d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Nearest Thursday
    const yearStart = new Date(d.getUTCFullYear(), 0, 1);
    const weekNumber = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return weekNumber;
  };

  // Filter commissions by the selected week and staffID
  const filterCommissionsByWeek = (commissions, selectedWeek) => {
    if (!selectedWeek) return [];

    const selectedYear = selectedWeek.getFullYear();
    const selectedWeekNumber = getWeekNumber(selectedWeek);

    return commissions.filter((commission) => {
      const commissionDate = new Date(commission.Date);
      const commissionYear = commissionDate.getFullYear();
      const commissionWeekNumber = getWeekNumber(commissionDate);

      return (
        commissionYear === selectedYear &&
        commissionWeekNumber === selectedWeekNumber &&
        commission.StaffID === staffID // Ensure we filter by StaffID as well
      );
    });
  };

  // Whenever selectedWeek or commissions change, filter the commissions
  useEffect(() => {
    const filtered = filterCommissionsByWeek(commissions, selectedWeek);
    setWeeklyCommissions(filtered);
  }, [selectedWeek, commissions]);

  // Handle week selection from the week picker
  const handleWeekChange = (date) => {
    setSelectedWeek(date);
    setSelectedDate(null); // Reset selected date
  };

  // Handle date selection from the week dates
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const commissionsForDate = filterCommissionsByWeek(commissions, date); // Filter commissions for the selected date
    const filteredCommissions = commissionsForDate.filter(commission => {
      const commissionDate = new Date(commission.Date);
      return commissionDate.toDateString() === date.toDateString(); // Match the selected date
    });
    setWeeklyCommissions(filteredCommissions); // Update commissions displayed for the selected date
  };

  // Calculate total commission for the selected week
  const calculateTotalCommission = () => {
    return weeklyCommissions.reduce((total, commission) => total + parseFloat(commission.total_commission_per_day || 0), 0);
  };

  // Calculate total pay whenever weekly commissions, allowance, or debt change
  useEffect(() => {
    const totalCommission = calculateTotalCommission();
    const total = (
      calculateTotalCommission() +
      parseFloat(payrollData.allowance || 0) -
      parseFloat(payrollData.debt || 0)
    );
    const totalPay = isNaN(total) ? 0 : total; // If total is NaN, set it to 0

    setTotalPay(total);
  }, [weeklyCommissions, payrollData.allowance, payrollData.debt]);

  return (
    <div className="calculate-payroll-container">
      <FontAwesomeIcon icon={faMoneyCheckDollar} className="icon-calculate-payroll" beat />
      <h3>Payroll</h3>
      <button className="back-payroll-button" onClick={handleBackClick}>
        &lt; Back
      </button>

      {/* Scrollable Form Container */}
      <div className="scrollable-form-container">
        <div className="form-payroll-background">
          {/* Adding Name and ID Display */}
          <div className="name-id-display">
            <p><strong>Name:</strong> {name}</p>
            <p><strong>ID:</strong> {staffID}</p>
          </div>

          {/* Week Picker */}
          <div className="week-picker">
            <label>Select Week:</label>
            <DatePicker
              selected={selectedWeek}
              onChange={handleWeekChange}
              showWeekNumbers
              dateFormat="yyyy-'W'ww"
              placeholderText="Select a week"
            />
          </div>

          {/* Display the filtered commissions for the selected week */}
          <div className="commissions-list">
  <h4>Weekly Commissions</h4>
  {weeklyCommissions.length > 0 ? (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Commission</th>
        </tr>
      </thead>
      <tbody>
        {weeklyCommissions.map((commission) => (
          <tr key={commission.Commission_ID}>
            <td>{new Date(commission.Date).toLocaleDateString()}</td>
            <td>{commission.total_commission_per_day}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>No commissions for the selected week.</p>
  )}
</div>


          <div className="payroll-columns">
            {/* Existing Payroll Columns Here */}
            <div className="payroll-column">
              <label htmlFor="allowance">Allowance:</label>
              <input
                type="number"
                id="allowance"
                name="allowance"
                value={payrollData.allowance}
                onChange={handleInputChange}
                placeholder="Enter allowance"
              />
            </div>

            <div className="payroll-column">
              <label htmlFor="debt">Debt:</label>
              <input
                type="number"
                id="debt"
                name="debt"
                value={payrollData.debt}
                onChange={handleInputChange}
                placeholder="Enter debt"
              />
            </div>

            <div className="payroll-column">
              <label htmlFor="totalPay">Total Pay:</label>
              <input
                type="text"
                id="totalPay"
                value={totalPay}
                readOnly
              />
            </div>
          </div>

          <button className="save-payroll-button" onClick={handleSubmit}>
            Save Payroll
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalculatePayroll;
