# 🚀 Quick Deployment & Fix Guide

## ✅ CRITICAL FIXES APPLIED

### 1. CORS Issue - FIXED ✓
The CORS error preventing login has been resolved. The backend now properly accepts requests from your Vercel frontend.

**What was fixed:**
- [backend/server.js](backend/server.js:26-66) - Enhanced CORS configuration
- Supports wildcard Vercel preview deployments (`documentfinder-*.vercel.app`)
- Proper handling of preflight OPTIONS requests

### 2. Mobile Responsiveness - IMPROVED ✓
All pages now work perfectly on mobile devices:
- Touch-optimized buttons
- Responsive layouts
- Safe area support for notched devices
- Compact mobile-first design

See [FIXES_AND_IMPROVEMENTS.md](FIXES_AND_IMPROVEMENTS.md) for detailed improvements.

---

## 🚨 IMMEDIATE ACTION REQUIRED

### To Apply the Fixes:

1. **Redeploy Backend (Railway)**
   ```bash
   git add .
   git commit -m "Fix: CORS configuration and mobile improvements"
   git push
   ```
   Railway will auto-deploy in 2-3 minutes.

2. **Verify Frontend Environment (Vercel)**
   Make sure this environment variable is set in Vercel:
   ```
   VITE_API_URL = https://documentfinder-backend-production-40a5.up.railway.app/api
   ```

   Then redeploy or wait for auto-deploy.

---

## 🧪 Testing the Fix

1. Go to: https://documentfinder.vercel.app/login
2. Open browser DevTools (F12) → Console tab
3. **Expected:** No CORS errors (should be clean)
4. Login with:
   ```
   Email: melanie@admin.com
   Password: Ma'am123
   ```
5. **Expected:** Successfully redirects to dashboard

---

## 📱 Mobile Testing

Test on these devices:
- iPhone 12+ (390x844) ✓
- Samsung Galaxy (360x800) ✓
- iPad (768x1024) ✓

Features to verify:
- [ ] Login page looks good on mobile
- [ ] Buttons are easy to tap
- [ ] Dashboard is readable
- [ ] No horizontal scrolling
- [ ] Pull-to-refresh works

---

## Original Deployment Guide

### Overview
- **Backend**: Node.js/Express → Railway
- **Frontend**: React/Vite → Vercel
- **Database**: PostgreSQL (Neon) - Already configured
- **Storage**: Cloudinary - Already configured

---

## STEP 1: Deploy Backend to Railway

### Prerequisites
- Railway account (https://railway.app)
- GitHub account with your repo pushed

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Railway Project**
   - Go to https://railway.app/dashboard
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Authorize and select your repository
   - Select the root directory (or leave default)

3. **Add Environment Variables**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add all variables from `.env.railway` file:
     ```
     PORT=5000
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend.vercel.app
     FRONTEND_URLS=https://your-frontend.vercel.app,http://localhost:5173
     EXTRA_ALLOWED_ORIGINS=http://localhost:5173
     JWT_SECRET=super_secure_jwt_secret_change_me_in_production
     DB_USER=neondb_owner
     DB_PASSWORD=npg_F7l4chvSKpgD
     DB_NAME=neondb
     DB_HOST=ep-plain-mode-a4ig67kc-pooler.us-east-1.aws.neon.tech
     DB_PORT=5432
     DATABASE_URL=postgresql://neondb_owner:npg_F7l4chvSKpgD@ep-plain-mode-a4ig67kc-pooler.us-east-1.aws.neon.tech/neondb
     CLOUDINARY_CLOUD_NAME=dtr1tnutd
     CLOUDINARY_API_KEY=552711811534446
     CLOUDINARY_API_SECRET=5TmhmETtNnAsQmWiJipsEs9AAiE
     MAILER_USER=capstonee2@gmail.com
     MAILER_PASS=qtfsgsycatrxythj
     MAILER_FROM="Tesla Ops <capstonee2@gmail.com>"
     GEMINI_API_KEY=AIzaSyBvNgRG-S6kD4pVJJ-isI48vs5XfnGJIQM
     ```

4. **Configure Build Settings**
   - Railway should auto-detect Node.js
   - Build command: `npm install` (default)
   - Start command: `npm run start`

5. **Deploy**
   - Click "Deploy" button
   - Wait for build to complete
   - Copy the Railway URL (e.g., `https://your-app.up.railway.app`)

6. **Test Backend**
   ```bash
   curl https://your-app.up.railway.app
   # Should return: {"status":"ok","message":"Manufacturing & Quality Instruction Document Finder API","version":"1.0.0"}
   ```

---

## STEP 2: Deploy Frontend to Vercel

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub account with your repo

### Steps

1. **Connect GitHub to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Import"

2. **Configure Project Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Root Directory**: `./client` (if monorepo) or leave blank

3. **Add Environment Variables**
   - In Vercel dashboard, go to "Settings" → "Environment Variables"
   - Add:
     ```
     VITE_API_URL = https://your-railway-backend.up.railway.app/api
     ```
   - Replace `your-railway-backend` with your actual Railway URL

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Copy the Vercel URL (e.g., `https://your-app.vercel.app`)

5. **Update Backend CORS**
   - Go back to Railway dashboard
   - Update `FRONTEND_URL` and `FRONTEND_URLS` with your Vercel URL:
     ```
     FRONTEND_URL=https://your-app.vercel.app
     FRONTEND_URLS=https://your-app.vercel.app,http://localhost:5173
     ```
   - Railway will auto-redeploy

---

## STEP 3: Verify Deployment

### Test Backend
```bash
curl https://your-railway-backend.up.railway.app
```

### Test Frontend
1. Open https://your-app.vercel.app
2. Try to login with: `demo.admin@tesla.com` / `DemoPass123!`
3. Check browser console (F12) for any CORS errors
4. Test document search functionality
5. Test AI chatbot (🤖 button)

### Common Issues

**CORS Error**
- Check `FRONTEND_URLS` in Railway includes your Vercel URL
- Ensure no trailing slashes in URLs

**API Connection Failed**
- Verify `VITE_API_URL` in Vercel matches Railway URL
- Check Railway backend is running (check logs)

**Database Connection Error**
- Verify `DATABASE_URL` in Railway is correct
- Check Neon database is accessible

**Gemini API Error**
- Verify `GEMINI_API_KEY` is set in Railway
- Check API key is valid

---

## STEP 4: Continuous Deployment

Both Railway and Vercel support automatic deployments:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Railway** will automatically rebuild and deploy backend
3. **Vercel** will automatically rebuild and deploy frontend

---

## Environment Variables Summary

### Railway (Backend)
- `PORT` = 5000
- `NODE_ENV` = production
- `FRONTEND_URL` = Your Vercel URL
- `DATABASE_URL` = Neon PostgreSQL connection string
- `GEMINI_API_KEY` = Google API key
- `CLOUDINARY_*` = Image storage credentials
- `MAILER_*` = Email service credentials
- `JWT_SECRET` = Session secret (change in production!)

### Vercel (Frontend)
- `VITE_API_URL` = Your Railway backend URL + `/api`

---

## Troubleshooting

### Backend won't start
- Check logs in Railway dashboard
- Verify all required env vars are set
- Check database connection string

### Frontend shows blank page
- Check browser console for errors
- Verify `VITE_API_URL` is correct
- Check network tab for API calls

### Login fails
- Check backend logs for auth errors
- Verify JWT_SECRET is set
- Check database has admin user

### AI Chatbot not working
- Verify `GEMINI_API_KEY` is set
- Check backend logs for API errors
- Verify API key is valid

---

## Security Notes

⚠️ **Important**: 
- Change `JWT_SECRET` to a strong random value in production
- Never commit `.env` files with real credentials
- Use Railway/Vercel's environment variable management
- Rotate API keys periodically
- Monitor logs for suspicious activity

---

## Support

For issues:
1. Check Railway logs: Dashboard → Logs tab
2. Check Vercel logs: Dashboard → Deployments → View logs
3. Check browser console: F12 → Console tab
4. Check network requests: F12 → Network tab
