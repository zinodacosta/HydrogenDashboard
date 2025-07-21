# Hydrogen Dashboard - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Netlify (Free & Easy)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `public/` folder
3. Get a live URL instantly
4. Custom domain available

### Option 2: Vercel (Free & Fast)
1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Deploy automatically
4. Custom domain available

### Option 3: GitHub Pages (Free)
1. Create a GitHub repository
2. Upload your `public/` folder
3. Enable GitHub Pages
4. Your site will be at: `https://username.github.io/repository-name`

### Option 4: Traditional Web Hosting
1. Upload all files from `public/` to your web server
2. Ensure proper file permissions
3. Test the dashboard functionality

## 📁 File Structure for Deployment

```
your-website/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   └── simulation.js
├── icons/
│   ├── battery.webp
│   ├── electrolyzer.webp
│   ├── fuelcell.webp
│   ├── photovoltaik.webp
│   ├── arrow.webp
│   ├── arrowanim.gif
│   └── ...
└── graphIdentifiers.json
```

## ⚙️ Configuration Checklist

- [ ] All files uploaded to web server
- [ ] File permissions set correctly (644 for files, 755 for folders)
- [ ] API URL is correct in JavaScript files
- [ ] HTTPS enabled (recommended for production)
- [ ] CORS headers configured (if needed)
- [ ] Dashboard loads without errors
- [ ] Data is displaying correctly

## 🔧 Server Configuration

### Apache (.htaccess)
```apache
# Enable CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type"

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
</IfModule>
```

### Nginx
```nginx
# Enable CORS
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
add_header Access-Control-Allow-Headers "Content-Type";

# Enable compression
gzip on;
gzip_types text/html text/css application/javascript;

# Cache static assets
location ~* \.(css|js|webp|gif)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🧪 Testing Checklist

- [ ] Dashboard loads on desktop
- [ ] Dashboard loads on mobile
- [ ] All charts display data
- [ ] Real-time updates work
- [ ] No console errors
- [ ] API calls succeed
- [ ] Responsive design works
- [ ] All interactive elements function

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify API connectivity
3. Test with different browsers
4. Contact technical support

---

**Backend API:** http://159.69.192.158:3000  
**Dashboard Version:** 1.0 