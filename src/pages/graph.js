import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../css/graph.css';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Graph() {
    const [financialData, setFinancialData] = useState({ sales: [], commissions: [], debt: [] });
    
    useEffect(() => {
        fetch('https://vynceianoani.helioho.st/graph.php')
            .then(response => response.json())
            .then(data => setFinancialData(data))
            .catch(error => console.error('Error fetching financial data:', error));
    }, []);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const salesData = {
        labels: months,
        datasets: [
            {
                label: 'Sales Amount',
                data: financialData.sales.map(entry => entry.sales), 
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                tension: 0.1,
            },
        ],
    };

    const commissionData = {
        labels: months,
        datasets: [
            {
                label: 'Commission Amount',
                data: financialData.commissions.map(entry => entry.commission), 
                borderColor: 'rgba(153,102,255,1)',
                backgroundColor: 'rgba(153,102,255,0.2)',
                tension: 0.1,
            },
        ],
    };

   

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => `$${tooltipItem.raw}`,
                },
            },
        },
    };

    return (
        <div className="graph-container">
            <h1>Yearly Graph</h1>

            <div className="chart-wrapper">
                <div className="chart-title">
                    <h2>Sales</h2>
                </div>
                <Line data={salesData} options={options} />
            </div>

            <div className="chart-wrapper">
                <div className="chart-title">
                    <h2>Commission</h2>
                </div>
                <Line data={commissionData} options={options} />
            </div>


        </div>
    );
}

export default Graph;
