const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Data storage - we'll use a simple JSON file to store submissions
// In a production app, you'd use a database instead
const DATA_FILE = path.join(__dirname, 'submissions.json');

// Initialize empty data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Route to serve the student page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to serve the admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API to submit solution
app.post('/api/submissions', (req, res) => {
  try {
    const submission = req.body;
    
    // Add server timestamp
    submission.serverTimestamp = new Date().toISOString();
    
    // Read current submissions
    let submissionsData = [];
    try {
      submissionsData = JSON.parse(fs.readFileSync(DATA_FILE));
      
      // Make sure it's an array
      if (!Array.isArray(submissionsData)) {
        submissionsData = [];
      }
    } catch (error) {
      console.error('Error reading submissions file, creating new:', error);
      submissionsData = [];
    }
    
    // Add new submission
    submissionsData.push(submission);
    
    // Write back to file
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissionsData, null, 2));
    
    res.status(200).json({ success: true, message: 'Submission saved successfully' });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ success: false, message: 'Error saving submission' });
  }
});

// API to get all submissions (for admin)
app.get('/api/submissions', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.json([]);
    }
    
    const submissionsData = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(submissionsData);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Error fetching submissions' });
  }
});

// Optional: API to reset data (for testing)
app.post('/api/reset', (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    res.status(200).json({ success: true, message: 'Data reset successfully' });
  } catch (error) {
    console.error('Error resetting data:', error);
    res.status(500).json({ success: false, message: 'Error resetting data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Student interface: http://localhost:${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
});