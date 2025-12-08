# API Backend Deployment Guide

This guide explains how to deploy the backend API server and configure nginx to proxy requests to it.

## Problem

The frontend at `https://hydrogenfrontend.vercel.app` is trying to access the API at `https://api.kitechnik.com`, but getting 404 errors and CORS issues.

## Solution

The backend server runs on port 3000, but needs nginx to proxy requests from `api.kitechnik.com` to the backend.

## Steps to Deploy

### 1. Ensure Backend Server is Running

SSH into your server and check if the backend is running:

```bash
# Check if Node.js process is running
ps aux | grep node

# Or check if port 3000 is in use
sudo netstat -tlnp | grep 3000
# or
sudo ss -tlnp | grep 3000
```

If not running, start it:

```bash
cd /path/to/backend
npm install
npm start
```

Or use a process manager like PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start the backend
cd /path/to/backend
pm2 start server.js --name hydrogen-api

# Make it start on boot
pm2 startup
pm2 save
```

### 2. Configure Nginx for API Subdomain

Copy the nginx configuration file to your server:

```bash
# Copy the nginx configuration
sudo cp nginx-api.conf /etc/nginx/sites-available/api-kitechnik

# Edit if needed (usually not necessary)
sudo nano /etc/nginx/sites-available/api-kitechnik

# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/api-kitechnik /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

### 3. Set Up SSL Certificate (Let's Encrypt)

```bash
# Install certbot if not already installed
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate for API subdomain
sudo certbot --nginx -d api.kitechnik.com

# Certbot will automatically configure SSL in nginx
# Follow the prompts and choose to redirect HTTP to HTTPS
```

After SSL setup, uncomment the HTTPS server block in `/etc/nginx/sites-available/api-kitechnik` and comment out or remove the HTTP-only block.

### 4. Verify Backend is Accessible

Test the API endpoints:

```bash
# Test root endpoint
curl https://api.kitechnik.com/

# Test graphIdentifiers endpoint
curl https://api.kitechnik.com/graphIdentifiers

# Test wholesale price endpoint
curl https://api.kitechnik.com/get-wholesale-price

# Test carbon intensity endpoint
curl https://api.kitechnik.com/get-carbon-intensity
```

### 5. Check Backend Logs

Monitor the backend logs to ensure it's working:

```bash
# If using PM2
pm2 logs hydrogen-api

# If running directly
# Check the console output or log files
```

## Troubleshooting

### Backend returns 404

1. **Check if backend is running:**
   ```bash
   ps aux | grep node
   ```

2. **Check if backend is listening on port 3000:**
   ```bash
   sudo netstat -tlnp | grep 3000
   ```

3. **Check nginx error logs:**
   ```bash
   sudo tail -f /var/log/nginx/api-kitechnik-error.log
   ```

4. **Check nginx access logs:**
   ```bash
   sudo tail -f /var/log/nginx/api-kitechnik-access.log
   ```

### CORS errors persist

1. **Verify CORS configuration in `backend/server.js`:**
   - Check that `https://hydrogenfrontend.vercel.app` is in the `allowedOrigins` array
   - The CORS middleware should be properly configured

2. **Check nginx CORS headers:**
   - The nginx config includes CORS headers as backup
   - Verify they're being sent in responses

3. **Test with curl:**
   ```bash
   curl -H "Origin: https://hydrogenfrontend.vercel.app" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        https://api.kitechnik.com/graphIdentifiers \
        -v
   ```

### Backend not starting

1. **Check for missing dependencies:**
   ```bash
   cd /path/to/backend
   npm install
   ```

2. **Check for missing environment variables:**
   - Verify `environments.env` or `.env` file exists
   - Check if required environment variables are set

3. **Check for port conflicts:**
   ```bash
   sudo lsof -i :3000
   ```

## Environment Variables

The backend may need these environment variables (check `backend/environments.env`):

- `PORT=3000` (default, can be overridden)
- `HOST=0.0.0.0` (default, can be overridden)
- `USE_HTTPS=false` (set to `true` only if running HTTPS directly on Node.js, not recommended when using nginx)

## Notes

- The backend should run on HTTP port 3000 (not HTTPS)
- Nginx handles SSL/TLS termination and proxies to the backend
- This is the recommended setup for production
- The backend CORS configuration allows the frontend domain
- Nginx CORS headers are included as a backup


