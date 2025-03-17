# Sorting Practice App

A simple and interactive web application that allows students to practice sorting algorithms through a drag-and-drop interface. Instructors can view detailed analytics about student performance through an admin dashboard.

## Features

### Student Interface
- Clean, intuitive drag-and-drop interface
- Large, colorful number cards
- Mobile-friendly with touch support
- Simple explanation submission form
- Immediate feedback on submission

### Admin Dashboard
- Comprehensive analytics on student performance
- Visual charts for solution times and steps distribution
- Detailed view of individual submissions
- Data export in CSV format
- Real-time data refresh

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v12 or higher)
- npm (comes with Node.js)

### Setup
1. Clone or download this repository
2. Navigate to the project folder in your terminal
3. Install dependencies:
   ```
   npm install
   ```

## Running the Application

### Start the Server
```
node server.js
```

### Access the Application
- Student interface: [http://localhost:3000](http://localhost:3000)
- Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

## Project Structure

```
sorting-practice-app/
├── server.js                 # Express server
├── package.json              # Project dependencies
├── submissions.json          # Data storage (created automatically)
├── public/                   # Static files
│   ├── index.html            # Student interface
│   ├── admin.html            # Admin dashboard
│   ├── styles-student.css    # Styles for student interface
│   ├── styles-admin.css      # Styles for admin dashboard
│   ├── student.js            # JavaScript for student interface
│   └── admin.js              # JavaScript for admin dashboard
└── README.md                 # This file
```

## Deployment Options

### Option 1: Deploy to a Custom Domain with Vercel

1. Sign up for a [Vercel](https://vercel.com/) account
2. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```
3. Navigate to your project directory and run:
   ```
   vercel
   ```
4. Follow the prompts to deploy your application
5. After deployment, add your custom domain in the Vercel dashboard

### Option 2: Deploy to Heroku

1. Sign up for a [Heroku](https://www.heroku.com/) account
2. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
3. Log in to Heroku:
   ```
   heroku login
   ```
4. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```
5. Add a Procfile (no extension) to your project with:
   ```
   web: node server.js
   ```
6. Deploy to Heroku:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku master
   ```

### Option 3: Deploy to DigitalOcean App Platform

1. Create a [DigitalOcean](https://www.digitalocean.com/) account
2. In the DigitalOcean console, go to App Platform
3. Create a new app and connect to your GitHub repository
4. Configure as a Node.js app
5. Set the run command to `node server.js`
6. Deploy the app
7. Add your custom domain in the app settings

## Customization

### Adjusting the Number Cards
To change the number of cards or the range of numbers:

1. Open `public/student.js`
2. Find the `generateRandomNumbers()` function:
   ```javascript
   function generateRandomNumbers(count = 6, min = 1, max = 100) {
   ```
3. Modify the default parameters as needed

### Changing the Appearance
To customize the look and feel:

1. Modify `public/styles-student.css` for the student interface
2. Modify `public/styles-admin.css` for the admin dashboard

## Production Considerations

For a production environment:

1. **Database Storage**: Replace the JSON file storage with a proper database like MongoDB or PostgreSQL
2. **Authentication**: Add authentication to protect the admin dashboard
3. **HTTPS**: Ensure your deployment uses HTTPS for security
4. **Backup**: Implement regular backups of submission data

## Resetting Data (For Testing)

The app includes a hidden API endpoint to reset all data. **Use with caution** as this will delete all submissions:

```
curl -X POST http://localhost:3000/api/reset
```

## Browser Compatibility

The application is compatible with:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is available under the MIT License.