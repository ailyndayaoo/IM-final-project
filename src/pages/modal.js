import React, { useState, useEffect } from 'react';
import '../css/modal.css';

const Modal = ({ isOpen, onClose, onConfirmDelete, isDeleteMode, branchName }) => {
  const [newBranchName, setNewBranchName] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (isDeleteMode) {
        setNewBranchName(branchName || ''); // Set to the branch name if in delete mode
      } else {
        setNewBranchName(''); // Clear input for add mode
      }
    }
  }, [isOpen, isDeleteMode, branchName]);

  const handleAddBranch = () => {
    if (newBranchName.trim()) {
      fetch('https://vynceianoani.helioho.st/addBranch.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newBranchName }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert(data.success); // Show success message
          } else {
            alert(data.error); // Show error message
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Failed to add branch. Please try again.');
        });

      setNewBranchName(''); // Clear the input field
      onClose(); // Close the modal
    } else {
      alert('Branch name cannot be empty!'); // Alert if the input is empty
    }
  };

  const handleConfirmDelete = () => {
    onConfirmDelete();
    onClose(); // Close the modal
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {isDeleteMode ? (
          <>
            <h2>Are you sure you want to delete this branch?</h2>
            <p>{branchName}</p>
            <div className="modal-buttons">
              <button onClick={handleConfirmDelete}>Yes</button>
              <button onClick={onClose}>No</button>
            </div>
          </>
        ) : (
          <>
            <h2>Add Branch</h2>
            <input
              type="text"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="Enter branch name"
            />
            <div className="modal-buttons">
              <button onClick={handleAddBranch}>Add Branch</button>
              <button onClick={onClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
