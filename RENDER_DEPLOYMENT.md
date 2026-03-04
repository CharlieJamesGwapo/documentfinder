# 🎨 Deploying to Render.com

## 🚀 Quick Start Guide

This guide will help you deploy the Document Finder backend to Render.com (replacing Railway).

---

## 📋 Prerequisites

- Render.com account (free): https://render.com
- GitHub repository with your code
- All environment variables ready (from `.env.render`)

---

## 🔧 Step 1: Prepare Your Repository

The configuration files are already created:
- ✅ [render.yaml](render.yaml) - Render deployment configuration
- ✅ [backend/.env.render](backend/.env.render) - Environment variables template

---

## 🌐 Step 2: Deploy to Render

### Option A: Deploy via Render Dashboard (Recommended)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click "New +" → "Web Service"

2. **Connect GitHub Repository**
   - Select "Build and deploy from a Git repository"
   - Click "Connect" next to GitHub
   - Authorize Render to access your repository
   - Select your `documentfinder` repository

3. **Configure Service**
   ```
   Name: documentfinder-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

4. **Add Environment Variables**

   Click "Advanced" → "Add Environment Variable" and add ALL of these:

   ```bash
   # Server
   NODE_ENV=production
   PORT=10000

   # Database (Your existing Neon database)
   DB_HOST=ep-plain-mode-a4ig67kc-pooler.us-east-1.aws.neon.tech
   DB_PORT=5432
   DB_NAME=neondb
   DB_USER=neondb_owner
   DB_PASSWORD=npg_F7l4chvSKpgD
   DATABASE_URL=postgresql://neondb_owner:npg_F7l4chvSKpgD@ep-plain-mode-a4ig67kc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

   # JWT Secret (IMPORTANT: Generate a new one!)
   JWT_SECRET=your_super_secure_random_jwt_secret_change_this

   # Cloudinary (Image Storage)
   CLOUDINARY_CLOUD_NAME=dtr1tnutd
   CLOUDINARY_API_KEY=552711811534446
   CLOUDINARY_API_SECRET=5TmhmETtNnAsQmWiJipsEs9AAiE

   # Email (Gmail SMTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=capstonee2@gmail.com
   EMAIL_PASSWORD=qtfsgsycatrxythj
   EMAIL_FROM=Tesla Ops <capstonee2@gmail.com>

   # OTP
   OTP_TTL_MINUTES=15

   # Gemini AI (Optional)
   GEMINI_API_KEY=AIzaSyBvNgRG-S6kD4pVJJ-isI48vs5XfnGJIQM
   ```

5. **Click "Create Web Service"**
   - Render will start building your backend
   - Wait 3-5 minutes for deployment
   - Your backend URL will be: `https://documentfinder-backend.onrender.com`

### Option B: Deploy with render.yaml (Blueprint)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click "New +" → "Blueprint"

2. **Connect Repository**
   - Select your GitHub repository
   - Render will detect `render.yaml` automatically

3. **Review Configuration**
   - Check the detected configuration
   - Add missing environment variables manually

4. **Click "Apply"**
   - Render will deploy according to `render.yaml`

---

## 🔗 Step 3: Update Frontend (Vercel)

Once your Render backend is deployed, you need to update the frontend API URL.

### Get Your Render Backend URL

After deployment completes, copy your Render URL. It will look like:
```
https://documentfinder-backend.onrender.com
```

### Update Vercel Environment Variable

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your `documentfinder` project
   - Go to "Settings" → "Environment Variables"

2. **Update VITE_API_URL**
   - Find: `VITE_API_URL`
   - Change from: `https://documentfinder-backend-production-40a5.up.railway.app/api`
   - Change to: `https://documentfinder-backend.onrender.com/api`
   - Click "Save"

3. **Redeploy Frontend**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Wait 1-2 minutes

### Or Update via Git (Alternative)

```bash
# Update the production environment file
echo "VITE_API_URL=https://documentfinder-backend.onrender.com/api" > client/.env.production

# Commit and push
git add client/.env.production
git commit -m "Update: Switch backend to Render"
git push
```

Vercel will auto-deploy the changes.

---

## ✅ Step 4: Verify Deployment

### Test Backend API

```bash
# Test root endpoint
curl https://documentfinder-backend.onrender.com

# Expected response:
# {"status":"ok","message":"Manufacturing & Quality Instruction Document Finder API","version":"1.0.1"}

# Test health endpoint
curl https://documentfinder-backend.onrender.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2026-03-04T..."}
```

### Test Frontend Connection

1. Open: https://documentfinder.vercel.app/login
2. Open DevTools (F12) → Console
3. **Expected:** No CORS errors
4. Login with:
   ```
   Email: melanie@admin.com
   Password: Ma'am123
   ```
5. **Expected:** Successfully login and see dashboard

---

## 🎯 Important Render.com Notes

### Free Tier Limitations

⚠️ **Render Free Tier:**
- **Spins down after 15 minutes of inactivity**
- **First request after sleep takes 30-60 seconds to wake up**
- This is normal behavior for Render's free tier

**Solutions:**
1. **Keep-Alive Service** (Use a service like UptimeRobot to ping your API every 10 minutes)
2. **Upgrade to Paid Plan** ($7/month for always-on service)
3. **Show Loading State** (Add "Waking up backend..." message in frontend)

### Build Directory

Render will look for `package.json` in the `backend/` directory because we specified:
```yaml
rootDir: backend
```

### Environment Variables

- All variables are stored securely in Render dashboard
- Never commit `.env.render` with real credentials
- Use the template as a reference only

---

## 🔄 Continuous Deployment

Once set up, deployments are automatic:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push

# Render will automatically:
# 1. Detect the push
# 2. Pull latest code
# 3. Run build command
# 4. Deploy new version
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Check Logs:**
- Go to Render Dashboard
- Click your service
- Go to "Logs" tab
- Look for errors

**Common Issues:**
- Missing environment variables
- Database connection failed
- Port binding error (use PORT=10000)

### CORS Errors

The CORS configuration is already set up correctly. If you see CORS errors:

1. **Check backend is running:**
   ```bash
   curl https://your-render-url.onrender.com
   ```

2. **Verify frontend API URL:**
   - Check Vercel environment variables
   - Should be: `https://your-render-url.onrender.com/api`

3. **Clear browser cache:**
   - Ctrl+Shift+Del → Clear cache
   - Hard refresh: Ctrl+Shift+R

### First Request Takes 30+ Seconds

This is normal for Render's free tier. The service "spins down" after 15 minutes of inactivity.

**Solutions:**
1. Use UptimeRobot to keep it alive
2. Show loading message in frontend
3. Upgrade to paid plan

### Database Connection Failed

Check these environment variables:
- `DATABASE_URL` - Must be complete PostgreSQL connection string
- Include `?sslmode=require` at the end
- Verify Neon database is accessible

---

## 📊 Migration Checklist

Use this checklist when migrating from Railway to Render:

- [ ] Backend deployed to Render
- [ ] All environment variables added
- [ ] Backend health check passes
- [ ] Frontend API URL updated in Vercel
- [ ] Frontend redeployed
- [ ] Login works without CORS errors
- [ ] Dashboard loads documents
- [ ] File uploads work
- [ ] AI chatbot works (if using Gemini)
- [ ] Email OTP works

---

## 🔐 Security Reminders

⚠️ **Important:**
- Generate a new `JWT_SECRET` for production
- Never commit `.env` files with real credentials
- Rotate API keys periodically
- Monitor logs for suspicious activity
- Enable 2FA on Render account

---

## 💰 Cost Comparison

| Feature | Railway Free | Render Free |
|---------|--------------|-------------|
| Price | $0/month | $0/month |
| Always On | ✅ Yes | ❌ No (sleeps) |
| Build Time | ~2 min | ~3-5 min |
| Cold Start | N/A | 30-60 sec |
| Bandwidth | 100 GB | 100 GB |
| Runtime | 500 hrs/mo | Unlimited |

**Recommendation:**
- Use Render Free for development/testing
- Upgrade to Render Starter ($7/mo) for production (always-on)
- Or use Railway if you have free credits

---

## 🎉 Success!

Your backend is now running on Render.com!

**URLs:**
- Backend: `https://documentfinder-backend.onrender.com`
- Frontend: `https://documentfinder.vercel.app`

**Admin Login:**
```
Email: melanie@admin.com
Password: Ma'am123
```

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Render Free Tier Details](https://render.com/docs/free)

---

## 🆘 Need Help?

**Check:**
1. Render Dashboard Logs
2. Browser Console (F12)
3. Network Tab (F12 → Network)
4. [FIXES_AND_IMPROVEMENTS.md](FIXES_AND_IMPROVEMENTS.md)
5. [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

**Common URLs to Check:**
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- Your Backend: https://documentfinder-backend.onrender.com
- Your Frontend: https://documentfinder.vercel.app

---

**Last Updated:** March 4, 2026
**Deployment Platform:** Render.com (Free Tier)
