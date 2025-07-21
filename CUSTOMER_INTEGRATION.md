# Hydrogen Dashboard - Customer Integration Guide

## 📦 Package Contents
- `index.html` - Main dashboard file
- `js/` - JavaScript files (simulation.js, main.js)
- `css/` - Stylesheet (styles.css)
- `icons/` - Dashboard icons and images
- `graphIdentifiers.json` - Graph configuration data

## 🚀 Integration Options

### Option 1: Iframe Integration (Recommended)
Add this code to your customer's website:

```html
<!-- Hydrogen Dashboard Widget -->
<iframe 
  src="https://your-domain.com/hydrogen-dashboard/index.html" 
  width="100%" 
  height="600px" 
  frameborder="0"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
</iframe>
```

### Option 2: Direct Integration
1. Upload all files to your web server
2. Include the dashboard in your page:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Your Website</title>
    <!-- Include the dashboard CSS -->
    <link rel="stylesheet" href="path/to/css/styles.css">
</head>
<body>
    <!-- Your existing content -->
    
    <!-- Hydrogen Dashboard -->
    <div id="hydrogen-dashboard">
        <!-- Copy the body content from index.html here -->
    </div>
    
    <!-- Include the dashboard scripts -->
    <script src="path/to/js/simulation.js" type="module"></script>
    <script src="path/to/js/main.js" type="module"></script>
</body>
</html>
```

### Option 3: Widget Integration
Add this to any page:

```html
<div id="corner-widget">
    <!-- Copy the widget HTML from index.html -->
</div>
```

## ⚙️ Configuration

### Backend API URL
The dashboard connects to our backend API at: `http://159.69.192.158:3000`

**Important:** If you need to change the API URL, update the `API_BASE_URL` variable in:
- `js/main.js` (line 1)
- `js/simulation.js` (line 6)

### Customization Options
- **Colors:** Edit `css/styles.css` to match your brand colors
- **Size:** Adjust iframe dimensions or CSS for different sizes
- **Features:** Enable/disable specific dashboard features by modifying the JavaScript

## 🔧 Technical Requirements

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection for API calls

### Server Requirements
- Web server (Apache, Nginx, etc.)
- HTTPS recommended for production
- CORS enabled (if integrating directly)

## 📱 Responsive Design
The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🛠️ Troubleshooting

### Common Issues:
1. **Dashboard not loading:** Check if all files are uploaded correctly
2. **No data showing:** Verify internet connection and API accessibility
3. **Styling issues:** Ensure CSS file is properly linked
4. **JavaScript errors:** Check browser console for error messages

### Support
For technical support, contact: [Your Contact Information]

## 📄 License
This dashboard is provided for your use. Please ensure proper attribution.

---

**Version:** 1.0  
**Last Updated:** July 2025  
**Backend API:** http://159.69.192.158:3000 