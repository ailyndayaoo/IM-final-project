import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/addstaff.css'; 

function EditStaff() {
    const { staffID } = useParams();
    const [staffData, setStaffData] = useState({
        Fname: '',
        Lname: '',
        Address: '',
        Email: '',
        Sex: '',
        ContactNumber: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchStaffData();
    }, []);

    const fetchStaffData = () => {
        fetch(`https://vynceianoani.helioho.st/GetID.php?staffID=${staffID}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.staff) {
                    setStaffData(data.staff); 
                } else {
                    alert('Staff not found or inactive.');
                }
            })
            .catch(error => console.error('Error fetching staff data:', error));
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setStaffData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setStaffData({
            ...staffData,
            Photo: file 
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        Object.keys(staffData).forEach(key => {
            formData.append(key, staffData[key]);
        });
        
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
    
        fetch('https://vynceianoani.helioho.st/editstaff.php', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                console.log(data); 
                if (data.status === 'success') {
                    alert('Staff information updated successfully!');
                    navigate('/home/staff');
                } else {
                    alert(data.message);
                    navigate('/home/staff');
                }
            })
            .catch(error => {
                console.error('Error updating staff:', error);
                alert('Error updating staff: ' + error.message);
            });
    };
    
    return (
        <div className="page-container">
            <div className="header-container">
                <button className="back-button" onClick={() => navigate('/home/staff')}>
                    &lt; Back
                </button>
                <h1>Edit Staff </h1>
                <span className="new-staff-title">Edit staff details</span>
            </div>

            <form onSubmit={handleSubmit} className="form-background">
                <div className="form-container">
                    <div className="scrollable-section">
                        <div className="input-group input-two-column">
                            <div className="input-item">
                                <label className="input-label">First Name</label>
                                <input
                                    type="text"
                                    name="Fname"
                                    placeholder="Enter first name"
                                    className="input-field"
                                    value={staffData.Fname}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-item">
                                <label className="input-label">Last Name</label>
                                <input
                                    type="text"
                                    name="Lname"
                                    placeholder="Enter last name"
                                    className="input-field"
                                    value={staffData.Lname}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Address</label>
                            <input
                                type="text"
                                name="Address"
                                placeholder="Enter Address"
                                className="input-field"
                                value={staffData.Address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <input
                                type="email"
                                name="Email"
                                placeholder="Enter Email Address"
                                className="input-field"
                                value={staffData.Email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Gender</label>
                            <select
                                name="Sex"
                                className="input-field"
                                value={staffData.Sex}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Phone Number</label>
                            <input
                                type="tel"
                                name="ContactNumber"
                                placeholder="Enter phone number"
                                className="input-field"
                                value={staffData.ContactNumber}
                                onChange={handleChange}
                                pattern="[0-9]*" 
                                maxLength="11" 
                            />
                        </div>
                    </div>
                </div>

                <button className="submit-add-button" type="submit">
                    Save Changes
                </button>
            </form>
        </div>
    );
}

export default EditStaff;
