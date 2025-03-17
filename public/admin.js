// Helper function to format time
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
        return seconds + 's';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes + 'm ' + remainingSeconds + 's';
}

// Fetch submissions from server
async function fetchSubmissions() {
    try {
        const response = await fetch('/api/submissions');
        if (!response.ok) {
            throw new Error('Failed to fetch submissions');
        }
        const submissions = await response.json();
        return submissions.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return [];
    }
}

// Process submissions data for analytics
function processSubmissions(submissions) {
    if (submissions.length === 0) {
        return {
            totalSubmissions: 0,
            avgTime: 0,
            avgSteps: 0,
            correctPercentage: 0,
            timesData: [],
            stepsData: {}
        };
    }
    
    const totalSubmissions = submissions.length;
    const avgTime = submissions.reduce((sum, sub) => sum + sub.duration, 0) / totalSubmissions;
    const avgSteps = submissions.reduce((sum, sub) => sum + (sub.steps ? sub.steps.length : 0), 0) / totalSubmissions;
    const correctSolutions = submissions.filter(sub => sub.correctlySorted).length;
    const correctPercentage = (correctSolutions / totalSubmissions) * 100;
    
    // Prepare data for charts
    const timesData = submissions.map(sub => sub.duration / 1000); // Convert to seconds
    
    // Count frequency of steps taken
    const stepsData = {};
    submissions.forEach(sub => {
        if (!sub.steps) return;
        const stepCount = sub.steps.length;
        stepsData[stepCount] = (stepsData[stepCount] || 0) + 1;
    });
    
    return {
        totalSubmissions,
        avgTime,
        avgSteps,
        correctPercentage,
        timesData,
        stepsData
    };
}

// Update dashboard UI
async function updateDashboard() {
    const submissions = await fetchSubmissions();
    
    if (submissions.length === 0) {
        // Handle no submissions case
        document.getElementById('totalSubmissions').textContent = '0';
        document.getElementById('avgTime').textContent = '0s';
        document.getElementById('avgSteps').textContent = '0';
        document.getElementById('correctSolutions').textContent = '0%';
        
        // Update tables and charts with empty data
        updateSubmissionsTable([]);
        updateCharts({
            timesData: [],
            stepsData: {}
        });
        
        return;
    }
    
    const stats = processSubmissions(submissions);
    
    // Update summary stats
    document.getElementById('totalSubmissions').textContent = stats.totalSubmissions;
    document.getElementById('avgTime').textContent = formatTime(stats.avgTime);
    document.getElementById('avgSteps').textContent = stats.avgSteps.toFixed(1);
    document.getElementById('correctSolutions').textContent = stats.correctPercentage.toFixed(1) + '%';
    
    // Update charts
    updateCharts(stats);
    
    // Update submissions table
    updateSubmissionsTable(submissions);
}

// Update charts
function updateCharts(stats) {
    // Solution times chart - using a histogram approach
    const timeCtx = document.getElementById('timeChart').getContext('2d');
    
    // Safely destroy existing chart
    if (window.timeChart instanceof Chart) {
        window.timeChart.destroy();
    }
    
    // Handle empty data case
    if (!stats.timesData || stats.timesData.length === 0) {
        window.timeChart = new Chart(timeCtx, {
            type: 'bar',
            data: {
                labels: ['No Data'],
                datasets: [{
                    label: 'Solution Time Distribution',
                    data: [0],
                    backgroundColor: 'rgba(52, 152, 219, 0.6)'
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Submissions'
                        }
                    }
                }
            }
        });
        
        // Also create empty steps chart
        const stepsCtx = document.getElementById('stepsChart').getContext('2d');
        if (window.stepsChart instanceof Chart) {
            window.stepsChart.destroy();
        }
        
        window.stepsChart = new Chart(stepsCtx, {
            type: 'bar',
            data: {
                labels: ['No Data'],
                datasets: [{
                    label: 'Steps Distribution',
                    data: [0],
                    backgroundColor: 'rgba(46, 204, 113, 0.6)'
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        return;
    }
    
    // Create bins for the histogram (time data)
    const timeBinSize = 5; // 5 second bins
    const timeData = stats.timesData;
    const timeBins = {};
    
    // Find the max time to determine the range
    const maxTime = Math.max(...timeData.filter(t => !isNaN(t)));
    
    // Create empty bins
    for (let i = 0; i <= Math.ceil(maxTime / timeBinSize) * timeBinSize; i += timeBinSize) {
        timeBins[i] = 0;
    }
    
    // Fill the bins
    timeData.forEach(time => {
        if (isNaN(time)) return;
        const binIndex = Math.floor(time / timeBinSize) * timeBinSize;
        timeBins[binIndex] = (timeBins[binIndex] || 0) + 1;
    });
    
    const timeLabels = Object.keys(timeBins);
    const timeValues = timeLabels.map(label => timeBins[label]);
    
    window.timeChart = new Chart(timeCtx, {
        type: 'bar',
        data: {
            labels: timeLabels.map(label => `${label}-${parseInt(label) + timeBinSize}s`),
            datasets: [{
                label: 'Solution Time Distribution',
                data: timeValues,
                backgroundColor: 'rgba(52, 152, 219, 0.6)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Submissions'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time (seconds)'
                    }
                }
            }
        }
    });
    
    // Steps chart
    const stepsCtx = document.getElementById('stepsChart').getContext('2d');
    if (window.stepsChart instanceof Chart) {
        window.stepsChart.destroy();
    }
    
    // Handle empty steps data
    if (!stats.stepsData || Object.keys(stats.stepsData).length === 0) {
        window.stepsChart = new Chart(stepsCtx, {
            type: 'bar',
            data: {
                labels: ['No Data'],
                datasets: [{
                    label: 'Steps Distribution',
                    data: [0],
                    backgroundColor: 'rgba(46, 204, 113, 0.6)'
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        return;
    }
    
    const stepsLabels = Object.keys(stats.stepsData).sort((a, b) => parseInt(a) - parseInt(b));
    const stepsValues = stepsLabels.map(label => stats.stepsData[label]);
    
    window.stepsChart = new Chart(stepsCtx, {
        type: 'bar',
        data: {
            labels: stepsLabels,
            datasets: [{
                label: 'Number of Steps Taken',
                data: stepsValues,
                backgroundColor: 'rgba(46, 204, 113, 0.6)',
                borderColor: 'rgba(46, 204, 113, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Submissions'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Steps Count'
                    }
                }
            }
        }
    });
}

// Update submissions table
function updateSubmissionsTable(submissions) {
    const tableBody = document.getElementById('submissionsTableBody');
    tableBody.innerHTML = '';
    
    if (submissions.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 6;
        cell.textContent = 'No submissions yet';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }
    
    submissions.forEach(submission => {
        const row = document.createElement('tr');
        
        const sessionIdCell = document.createElement('td');
        sessionIdCell.textContent = submission.sessionId ? (submission.sessionId.substring(0, 8) + '...') : 'N/A';
        
        const timeCell = document.createElement('td');
        timeCell.textContent = submission.duration ? formatTime(submission.duration) : 'N/A';
        
        const stepsCell = document.createElement('td');
        stepsCell.textContent = submission.steps ? submission.steps.length : 'N/A';
        
        const correctCell = document.createElement('td');
        if (submission.hasOwnProperty('correctlySorted')) {
            correctCell.textContent = submission.correctlySorted ? 'Yes' : 'No';
            correctCell.className = submission.correctlySorted ? 'correct' : 'incorrect';
        } else {
            correctCell.textContent = 'N/A';
        }
        
        const timestampCell = document.createElement('td');
        timestampCell.textContent = submission.timestamp ? new Date(submission.timestamp).toLocaleString() : 'N/A';
        
        const detailsCell = document.createElement('td');
        const detailsButton = document.createElement('button');
        detailsButton.textContent = 'View';
        detailsButton.className = 'view-details';
        detailsButton.onclick = () => showSubmissionDetails(submission);
        detailsCell.appendChild(detailsButton);
        
        row.appendChild(sessionIdCell);
        row.appendChild(timeCell);
        row.appendChild(stepsCell);
        row.appendChild(correctCell);
        row.appendChild(timestampCell);
        row.appendChild(detailsCell);
        
        tableBody.appendChild(row);
    });
}

// Show submission details in modal
function showSubmissionDetails(submission) {
    const modal = document.getElementById('submissionModal');
    
    // Safety check
    if (!submission) {
        console.error('No submission data provided');
        return;
    }
    
    // Fill in the details
    document.getElementById('submissionInfo').innerHTML = `
        <p><strong>Session ID:</strong> ${submission.sessionId || 'N/A'}</p>
        <p><strong>Time Spent:</strong> ${submission.duration ? formatTime(submission.duration) : 'N/A'}</p>
        <p><strong>Correctly Sorted:</strong> <span class="${submission.correctlySorted ? 'correct' : 'incorrect'}">${submission.correctlySorted ? 'Yes' : 'No'}</span></p>
    `;
    
    document.getElementById('startingArray').textContent = submission.startingArray ? `[${submission.startingArray.join(', ')}]` : 'N/A';
    document.getElementById('finalArray').textContent = submission.finalArray ? `[${submission.finalArray.join(', ')}]` : 'N/A';
    document.getElementById('explanation').textContent = submission.explanation || 'No explanation provided';
    
    // Populate steps timeline
    const stepsTimeline = document.getElementById('stepsTimeline');
    stepsTimeline.innerHTML = '';
    
    if (!submission.steps || submission.steps.length === 0) {
        const noSteps = document.createElement('p');
        noSteps.textContent = 'No step data available';
        stepsTimeline.appendChild(noSteps);
    } else {
        submission.steps.forEach((step, index) => {
            if (!step) return; // Skip if step is undefined
            
            const stepItem = document.createElement('div');
            stepItem.className = 'step-item';
            stepItem.innerHTML = `
                <p><strong>Step ${index + 1}:</strong> ${step.action || 'Unknown action'}</p>
                <p><strong>Array state:</strong> ${step.state ? `[${step.state.join(', ')}]` : 'N/A'}</p>
                <p><strong>Time:</strong> ${step.timestamp ? formatTime(step.timestamp) : 'N/A'}</p>
            `;
            stepsTimeline.appendChild(stepItem);
        });
    }
    
    modal.style.display = 'block';
}

// Close modal
document.querySelector('.close').onclick = function() {
    document.getElementById('submissionModal').style.display = 'none';
};

// Click outside modal to close
window.onclick = function(event) {
    const modal = document.getElementById('submissionModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Export data to CSV
document.getElementById('exportData').addEventListener('click', async function() {
    const submissions = await fetchSubmissions();
    if (submissions.length === 0) {
        alert('No data to export.');
        return;
    }
    
    try {
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'Session ID,Starting Array,Final Array,Steps Count,Duration (ms),Correctly Sorted,Explanation,Timestamp\n';
        
        submissions.forEach(sub => {
            const row = [
                sub.sessionId || 'N/A',
                sub.startingArray ? JSON.stringify(sub.startingArray) : 'N/A',
                sub.finalArray ? JSON.stringify(sub.finalArray) : 'N/A',
                sub.steps ? sub.steps.length : 'N/A',
                sub.duration || 'N/A',
                sub.hasOwnProperty('correctlySorted') ? sub.correctlySorted : 'N/A',
                sub.explanation ? `"${sub.explanation.replace(/"/g, '""')}"` : 'N/A',
                sub.timestamp || 'N/A'
            ];
            csvContent += row.join(',') + '\n';
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'sorting_practice_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data. See console for details.');
    }
});

// Refresh data
document.getElementById('refreshData').addEventListener('click', updateDashboard);

// Initialize dashboard on load
window.addEventListener('load', updateDashboard);