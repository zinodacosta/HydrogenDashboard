#!/bin/bash
# Server Diagnostic Script
# Run this on the server: bash check_server.sh

echo "=== Checking Nginx Configuration ==="
echo ""
echo "1. Nginx sites available:"
ls -la /etc/nginx/sites-available/ | grep -E "api|kitechnik"

echo ""
echo "2. Nginx sites enabled:"
ls -la /etc/nginx/sites-enabled/ | grep -E "api|kitechnik"

echo ""
echo "3. Checking for api.kitechnik.com configuration:"
sudo grep -r "api.kitechnik.com" /etc/nginx/sites-available/ /etc/nginx/sites-enabled/ 2>/dev/null || echo "No api.kitechnik.com found in nginx configs"

echo ""
echo "=== Checking Running Services ==="
echo ""
echo "4. Node.js processes:"
ps aux | grep node | grep -v grep

echo ""
echo "5. Port 3000 status:"
sudo netstat -tlnp | grep 3000 || sudo ss -tlnp | grep 3000

echo ""
echo "=== Checking Nginx Status ==="
echo ""
echo "6. Nginx status:"
sudo systemctl status nginx --no-pager | head -20

echo ""
echo "=== Checking Nginx Error Logs ==="
echo ""
echo "7. Recent nginx errors:"
sudo tail -20 /var/log/nginx/error.log

echo ""
echo "=== Checking Domain/DNS ==="
echo ""
echo "8. DNS resolution for api.kitechnik.com:"
nslookup api.kitechnik.com || dig api.kitechnik.com

echo ""
echo "=== Checking if Backend Directory Exists ==="
echo ""
echo "9. Looking for backend directory:"
find /var/www -name "server.js" -type f 2>/dev/null | head -5
find /home -name "server.js" -type f 2>/dev/null | head -5
find /root -name "server.js" -type f 2>/dev/null | head -5

echo ""
echo "=== Checking PM2 (if installed) ==="
echo ""
if command -v pm2 &> /dev/null; then
    echo "10. PM2 processes:"
    pm2 list
else
    echo "10. PM2 not installed"
fi


