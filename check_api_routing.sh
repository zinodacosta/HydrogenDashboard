#!/bin/bash
# Check API Routing Configuration
# This checks how api.kitechnik.com is currently configured

echo "=== Full Nginx Configuration for api.kitechnik.com ==="
echo ""

# Check all nginx config files for api.kitechnik.com
echo "Searching for api.kitechnik.com in nginx configs..."
sudo grep -r "api.kitechnik.com" /etc/nginx/ --include="*.conf" 2>/dev/null

echo ""
echo "=== Active Nginx Server Blocks ==="
echo ""

# List all active server blocks
for config in /etc/nginx/sites-enabled/*; do
    if [ -f "$config" ]; then
        echo "--- File: $config ---"
        sudo cat "$config" | grep -A 5 "server_name\|location\|proxy_pass" | head -30
        echo ""
    fi
done

echo ""
echo "=== Testing Backend Connectivity ==="
echo ""

# Test if backend is accessible locally
echo "Testing localhost:3000..."
curl -s http://localhost:3000/ || echo "Backend not responding on port 3000"

echo ""
echo "=== Current DNS Records ==="
echo ""

# Check DNS
echo "A record for api.kitechnik.com:"
dig +short api.kitechnik.com A

echo ""
echo "TXT records for kitechnik.com:"
dig +short kitechnik.com TXT

echo ""
echo "=== Checking for Chatbot Configuration ==="
echo ""

# Look for chatbot-related configs
sudo grep -r "chatbot" /etc/nginx/ --include="*.conf" 2>/dev/null | head -10


