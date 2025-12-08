# Self-Hosted Deployment Guide - Hetzner Server

This guide will help you deploy the Hydrogen Dashboard frontend to your Hetzner server with automatic GitHub deployments (replacing Vercel).

## 📋 Prerequisites

- Hetzner server with Ubuntu/Debian
- Nginx installed
- SSH access configured
- Domain name pointed to your server
- GitHub repository access

---

## 🚀 Step-by-Step Setup

### 1. Server Initial Setup

SSH into your Hetzner server and run the initial deployment:

```bash
# Clone the deployment script
cd ~
git clone https://github.com/zinodacosta/HydrogenDashboard.git temp-deploy
cd temp-deploy

# Make the deployment script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

This will:
- Create `/var/www/hydrogen-frontend` directory
- Clone your repository
- Install dependencies
- Set proper permissions

---

### 2. Configure Nginx

```bash
# Copy the nginx configuration
sudo cp /var/www/hydrogen-frontend/nginx.conf /etc/nginx/sites-available/hydrogen-frontend

# Edit the configuration to add your domain
sudo nano /etc/nginx/sites-available/hydrogen-frontend
# Replace 'yourdomain.com' with your actual domain

# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/hydrogen-frontend /etc/nginx/sites-enabled/

# Remove default site if needed
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

### 3. Set Up SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure SSL in nginx
# Follow the prompts and choose to redirect HTTP to HTTPS
```

---

### 4. Configure GitHub Secrets

Go to your GitHub repository: `https://github.com/zinodacosta/HydrogenDashboard/settings/secrets/actions`

Add the following secrets:

#### Required Secrets:

1. **SERVER_HOST**
   - Your Hetzner server IP address
   - Example: `195.201.123.45`

2. **SERVER_USER**
   - SSH username (usually `root` or your custom user)
   - Example: `root`

3. **SSH_PRIVATE_KEY**
   - Your SSH private key for authentication
   - See instructions below to generate

4. **SERVER_PORT** (optional)
   - SSH port (default is 22)
   - Only add if you use a custom SSH port

---

### 5. Generate and Add SSH Key for GitHub Actions

On your **local machine** (not the server):

```bash
# Generate a new SSH key pair specifically for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# This creates two files:
# - github_actions_deploy (private key) → Goes to GitHub Secrets
# - github_actions_deploy.pub (public key) → Goes to your Hetzner server
```

**Add the public key to your Hetzner server:**

```bash
# Copy the public key content
cat ~/.ssh/github_actions_deploy.pub

# SSH into your Hetzner server
ssh your-user@your-server-ip

# Add the public key to authorized_keys
echo "PASTE_YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys

# Set proper permissions
chmod 600 ~/.ssh/authorized_keys
```

**Add the private key to GitHub Secrets:**

```bash
# Copy the entire private key (including BEGIN and END lines)
cat ~/.ssh/github_actions_deploy

# Go to GitHub → Repository → Settings → Secrets and variables → Actions
# Create new secret: SSH_PRIVATE_KEY
# Paste the entire private key content
```

---

### 6. Configure Git on Server (for automated pulls)

```bash
# SSH into your server
cd /var/www/hydrogen-frontend

# Configure git to allow the directory
git config --global --add safe.directory /var/www/hydrogen-frontend

# Set proper permissions for www-data to pull updates
sudo chown -R $USER:www-data /var/www/hydrogen-frontend
sudo chmod -R 775 /var/www/hydrogen-frontend
```

---

### 7. Test the Deployment

```bash
# Make a small change to your repository locally
echo "<!-- Test deployment -->" >> public/index.html

# Commit and push
git add .
git commit -m "Test automated deployment"
git push origin main

# Check GitHub Actions tab to see the deployment progress
# Visit: https://github.com/zinodacosta/HydrogenDashboard/actions
```

---

## 🔧 Configuration Details

### File Locations on Server

- **Frontend files**: `/var/www/hydrogen-frontend/public/`
- **Nginx config**: `/etc/nginx/sites-available/hydrogen-frontend`
- **Nginx logs**: `/var/log/nginx/hydrogen-frontend-*.log`
- **SSL certificates**: `/etc/letsencrypt/live/yourdomain.com/`

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload nginx (no downtime)
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# Check nginx status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/hydrogen-frontend-error.log

# View access logs
sudo tail -f /var/log/nginx/hydrogen-frontend-access.log
```

---

## 🌐 DNS Configuration

Point your domain to your Hetzner server:

1. Go to your domain registrar's DNS settings
2. Add/Update A records:

```
Type    Name    Value (IP Address)      TTL
A       @       YOUR_SERVER_IP          3600
A       www     YOUR_SERVER_IP          3600
```

Wait for DNS propagation (can take up to 48 hours, usually much faster)

---

## 🔄 How Auto-Deployment Works

1. You push code to `main` branch on GitHub
2. GitHub Actions workflow triggers automatically
3. Workflow runs on GitHub's servers:
   - Checks out your code
   - Installs dependencies
   - Connects to your Hetzner server via SSH
4. On your Hetzner server:
   - Pulls latest code from GitHub
   - Installs any new dependencies
   - Reloads nginx
5. Your site is now updated!

---

## 🐛 Troubleshooting

### Deployment fails with "Permission denied"

```bash
# On your server, ensure proper ownership
cd /var/www/hydrogen-frontend
sudo chown -R $USER:www-data .
sudo chmod -R 775 .
```

### Nginx shows 403 Forbidden

```bash
# Check file permissions
sudo chown -R www-data:www-data /var/www/hydrogen-frontend/public
sudo chmod -R 755 /var/www/hydrogen-frontend/public
```

### Changes not appearing after deployment

```bash
# Clear browser cache or use incognito mode
# Check nginx serves the correct directory:
sudo nginx -T | grep root

# Force reload nginx
sudo systemctl restart nginx
```

### SSL certificate renewal

```bash
# Certbot auto-renews via cron, but you can test:
sudo certbot renew --dry-run

# Manual renewal if needed
sudo certbot renew
```

---

## 📊 Monitoring & Logs

### View deployment logs in GitHub
Visit: `https://github.com/zinodacosta/HydrogenDashboard/actions`

### View server logs
```bash
# Nginx access logs
sudo tail -f /var/log/nginx/hydrogen-frontend-access.log

# Nginx error logs
sudo tail -f /var/log/nginx/hydrogen-frontend-error.log

# System logs
sudo journalctl -u nginx -f
```

---

## 🎯 Benefits Over Vercel

✅ **Full control** over your infrastructure
✅ **No vendor lock-in**
✅ **Custom server configuration**
✅ **No build time limits**
✅ **Complete privacy** of your code and data
✅ **Same auto-deploy workflow** as Vercel
✅ **Custom domain support** with SSL
✅ **Frontend and backend** on same server (optional)

---

## 🔐 Security Best Practices

1. **Keep SSH key secure** - Never share your private key
2. **Use strong passwords** for your server
3. **Enable firewall** (UFW):
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
4. **Regular updates**:
   ```bash
   sudo apt update && sudo apt upgrade
   ```
5. **Monitor logs** regularly for suspicious activity

---

## 📝 Next Steps

After successful deployment:

1. ✅ Update your README.md with new URL
2. ✅ Update any API endpoints to point to your domain
3. ✅ Configure CORS if backend is on different subdomain
4. ✅ Set up monitoring (optional: UptimeRobot, Pingdom)
5. ✅ Configure backups for your server

---

## 🆘 Need Help?

- Check GitHub Actions logs for deployment issues
- Review nginx error logs: `sudo tail -f /var/log/nginx/hydrogen-frontend-error.log`
- Verify DNS propagation: `https://dnschecker.org`
- Test SSL: `https://www.ssllabs.com/ssltest/`

---

**Deployment created on**: November 28, 2025
**Repository**: https://github.com/zinodacosta/HydrogenDashboard
