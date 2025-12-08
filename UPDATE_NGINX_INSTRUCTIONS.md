# Instructions to Update Nginx Configuration

## Problem
The nginx configuration for `api.kitechnik.com` only has routes for the chatbot (port 3001) and returns 404 for Hydrogen Dashboard API endpoints.

## Solution
Add location blocks for Hydrogen Dashboard API endpoints that proxy to port 3000.

## Steps to Deploy

### Method 1: Copy-paste the configuration (Easiest)

1. **SSH into your server:**
   ```bash
   ssh root@159.69.192.158
   ```

2. **Backup the current configuration:**
   ```bash
   sudo cp /etc/nginx/sites-available/api.kitechnik.com /etc/nginx/sites-available/api.kitechnik.com.backup.$(date +%Y%m%d_%H%M%S)
   ```

3. **Edit the nginx configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/api.kitechnik.com
   ```

4. **Add the Hydrogen Dashboard API routes BEFORE the chatbot routes** (after line 196, before the chatbot.js location block):

   Insert this section right after the error_log line and before the chatbot routes:

   ```nginx
   # ===== HYDROGEN DASHBOARD API (Port 3000) =====
   # Graph identifiers endpoint
   location /graphIdentifiers {
       proxy_pass http://127.0.0.1:3000/graphIdentifiers;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       
       add_header Access-Control-Allow-Origin * always;
       add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
       add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
       
       if ($request_method = OPTIONS) {
           add_header Access-Control-Allow-Origin * always;
           add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
           add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
           add_header Access-Control-Max-Age 1728000;
           add_header Content-Type "text/plain; charset=utf-8";
           add_header Content-Length 0;
           return 204;
       }
   }

   # Wholesale price endpoint
   location /get-wholesale-price {
       proxy_pass http://127.0.0.1:3000/get-wholesale-price;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       
       add_header Access-Control-Allow-Origin * always;
       add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
       add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
       
       if ($request_method = OPTIONS) {
           add_header Access-Control-Allow-Origin * always;
           add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
           add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
           add_header Access-Control-Max-Age 1728000;
           add_header Content-Type "text/plain; charset=utf-8";
           add_header Content-Length 0;
           return 204;
       }
   }

   # Carbon intensity endpoint
   location /get-carbon-intensity {
       proxy_pass http://127.0.0.1:3000/get-carbon-intensity;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       
       add_header Access-Control-Allow-Origin * always;
       add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
       add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
       
       if ($request_method = OPTIONS) {
           add_header Access-Control-Allow-Origin * always;
           add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
           add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
           add_header Access-Control-Max-Age 1728000;
           add_header Content-Type "text/plain; charset=utf-8";
           add_header Content-Length 0;
           return 204;
       }
   }

   # Data endpoint (for graph data)
   location /data {
       proxy_pass http://127.0.0.1:3000/data;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       
       add_header Access-Control-Allow-Origin * always;
       add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
       add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
       
       if ($request_method = OPTIONS) {
           add_header Access-Control-Allow-Origin * always;
           add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
           add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
           add_header Access-Control-Max-Age 1728000;
           add_header Content-Type "text/plain; charset=utf-8";
           add_header Content-Length 0;
           return 204;
       }
   }

   # Root endpoint (health check)
   location = / {
       proxy_pass http://127.0.0.1:3000/;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       
       add_header Access-Control-Allow-Origin * always;
       add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
       add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
   }
   ```

5. **Test the nginx configuration:**
   ```bash
   sudo nginx -t
   ```

6. **If test passes, reload nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

7. **Verify the backend is running on port 3000:**
   ```bash
   sudo netstat -tlnp | grep 3000
   # or
   sudo ss -tlnp | grep 3000
   ```

8. **Test the API endpoints:**
   ```bash
   curl https://api.kitechnik.com/
   curl https://api.kitechnik.com/graphIdentifiers
   curl https://api.kitechnik.com/get-wholesale-price
   ```

### Method 2: Upload the complete file

1. **Upload the file to your server:**
   ```bash
   scp api.kitechnik.com-nginx-update.conf root@159.69.192.158:/tmp/
   ```

2. **SSH into server and backup current config:**
   ```bash
   ssh root@159.69.192.158
   sudo cp /etc/nginx/sites-available/api.kitechnik.com /etc/nginx/sites-available/api.kitechnik.com.backup.$(date +%Y%m%d_%H%M%S)
   ```

3. **Copy the new configuration:**
   ```bash
   sudo cp /tmp/api.kitechnik.com-nginx-update.conf /etc/nginx/sites-available/api.kitechnik.com
   ```

4. **Test and reload:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Important Notes

- The API routes MUST come BEFORE the chatbot routes in the nginx config
- Make sure the backend is running on port 3000
- The chatbot continues to work on port 3001
- Both services share the same domain but use different paths

## Troubleshooting

If nginx test fails:
- Check for syntax errors in the config
- Restore backup: `sudo cp /etc/nginx/sites-available/api.kitechnik.com.backup.* /etc/nginx/sites-available/api.kitechnik.com`

If endpoints still return 404:
- Verify backend is running: `ps aux | grep node`
- Check backend logs
- Verify port 3000 is listening: `sudo netstat -tlnp | grep 3000`


