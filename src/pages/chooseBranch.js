  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import { useNavigate } from 'react-router-dom';
  import pic1 from '../pictures/pic1.jpg';
  import '../css/chooseBranch.css';
  import Modal from './modal';

  const ChooseBranch = () => {
    const [branches, setBranches] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchBranches = async () => {
        try {
          const response = await axios.get('https://vynceianoani.helioho.st/branch.php');
          setBranches(response.data);
        } catch (error) {
          console.error('Error fetching branches:', error);
        }
      };

      fetchBranches();
    }, []);

    const handleBranchClick = (branchName) => {
      console.log(`${branchName} branch selected`);
      localStorage.setItem('selectedBranch', branchName); 
      navigate('/signIn', { state: { selectedBranch: branchName } });
    };
    

    const handleAddBranch = async (branchName) => {
      if (!branchName) return; 
      try {
        await axios.post('https://vynceianoani.helioho.st/branch.php', { name: branchName });
        setBranches([...branches, { name: branchName }]);
      } catch (error) {
        console.error('Error adding branch:', error);
      }
    };

    const handleConfirmDelete = async () => {
      if (!selectedBranch) return;
    
      console.log(`Deleting branch: ${selectedBranch.name}`); 
    
      try {
        const response = await fetch(`https://vynceianoani.helioho.st/deleteBranch.php?branch=${encodeURIComponent(selectedBranch.name)}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        const data = await response.json();
        if (data.success) {
          setBranches(branches.filter(branch => branch.name !== selectedBranch.name));
          setIsDeleteMode(false);
          setIsModalOpen(false);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error deleting branch:', error);
      }
    };
    
    const handleRightClick = (e, branch) => {
      e.preventDefault();
      setSelectedBranch(branch);
      setIsDeleteMode(true); 
      setIsModalOpen(true); 
    };

    return (
      <div className="choose-branch">
        <div className="branch-buttons">
        <h4p>Payroll System for Chic Station</h4p>
          <h1>Choose Branch</h1>
          <div className="button-container">
            {branches.map((branch, index) => (
              <button
                key={index}
                onClick={() => handleBranchClick(branch.name)}
                onContextMenu={(e) => handleRightClick(e, branch)}
              >
                {branch.name}
              </button>
            ))}
          </div>
          <div className="add-branch-container">
            <button
              className="add-branch-button"
              onClick={() => {
                setIsModalOpen(true);
                setIsDeleteMode(false);
                setSelectedBranch(null); 
              }}
            >
              Add Branch
            </button>
          </div>
        </div>
        <div className="branch-image">
          <img src={pic1} alt="Branch" />
        </div>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddBranch={handleAddBranch}
          onConfirmDelete={handleConfirmDelete}
          isDeleteMode={isDeleteMode}
          branchName={selectedBranch?.name}
        />
      </div>
    );
  };

  export default ChooseBranch;
