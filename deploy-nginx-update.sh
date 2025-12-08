#!/bin/bash
# Script to update nginx configuration for api.kitechnik.com
# Run this on the server

echo "=== Backing up current nginx configuration ==="
sudo cp /etc/nginx/sites-available/api.kitechnik.com /etc/nginx/sites-available/api.kitechnik.com.backup.$(date +%Y%m%d_%H%M%S)

echo ""
echo "=== Copying new configuration ==="
# Note: You'll need to upload api.kitechnik.com-nginx-update.conf to the server first
# Or copy-paste the contents

echo ""
echo "=== Testing nginx configuration ==="
sudo nginx -t

if [ $? -eq 0 ]; then
    echo ""
    echo "=== Configuration test passed! Reloading nginx ==="
    sudo systemctl reload nginx
    echo "Nginx reloaded successfully!"
    
    echo ""
    echo "=== Checking if backend is running on port 3000 ==="
    sudo netstat -tlnp | grep 3000 || sudo ss -tlnp | grep 3000
    
    echo ""
    echo "=== Testing API endpoints ==="
    echo "Testing root endpoint:"
    curl -s https://api.kitechnik.com/ | head -5
    
    echo ""
    echo "Testing graphIdentifiers:"
    curl -s https://api.kitechnik.com/graphIdentifiers | head -5
    
else
    echo ""
    echo "!!! Configuration test failed! Not reloading nginx. !!!"
    echo "Restore backup with: sudo cp /etc/nginx/sites-available/api.kitechnik.com.backup.* /etc/nginx/sites-available/api.kitechnik.com"
    exit 1
fi


