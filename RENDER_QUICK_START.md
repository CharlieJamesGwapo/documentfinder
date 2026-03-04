# ⚡ Render.com Quick Start (5 Minutes)

## 🎯 Super Fast Deployment

### Step 1: Deploy Backend to Render (2 minutes)

1. **Go to Render:** https://dashboard.render.com
2. **Click:** "New +" → "Web Service"
3. **Connect GitHub:** Select your `documentfinder` repository
4. **Configure:**
   ```
   Name: documentfinder-backend
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

5. **Add Environment Variables** (Copy from [backend/.env.render](backend/.env.render)):

   **Required:**
   ```bash
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=postgresql://neondb_owner:npg_F7l4chvSKpgD@ep-plain-mode-a4ig67kc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=generate_a_random_secret_here
   CLOUDINARY_CLOUD_NAME=dtr1tnutd
   CLOUDINARY_API_KEY=552711811534446
   CLOUDINARY_API_SECRET=5TmhmETtNnAsQmWiJipsEs9AAiE
   EMAIL_USER=capstonee2@gmail.com
   EMAIL_PASSWORD=qtfsgsycatrxythj
   ```

6. **Click:** "Create Web Service"
7. **Wait:** 3-5 minutes for deployment
8. **Copy URL:** `https://documentfinder-backend.onrender.com`

---

### Step 2: Update Frontend (Vercel) (2 minutes)

1. **Go to Vercel:** https://vercel.com/dashboard
2. **Select** your project
3. **Settings** → **Environment Variables**
4. **Update** `VITE_API_URL`:
   ```
   https://documentfinder-backend.onrender.com/api
   ```
5. **Redeploy:** Deployments → Latest → Redeploy

---

### Step 3: Test (1 minute)

1. Open: https://documentfinder.vercel.app/login
2. Login with: `melanie@admin.com` / `Ma'am123`
3. ✅ Should work!

---

## ⚠️ Important Notes

### Render Free Tier Sleeps
- **Backend sleeps after 15 minutes of no activity**
- **First request takes 30-60 seconds to wake up**
- This is normal for Render's free tier

### Keep Backend Awake (Optional)
Use UptimeRobot to ping your backend every 10 minutes:
1. Go to: https://uptimerobot.com
2. Add monitor: `https://documentfinder-backend.onrender.com`
3. Set interval: 10 minutes

---

## 🚀 That's It!

Your backend is now on Render!

**Deployed URLs:**
- Backend: `https://documentfinder-backend.onrender.com`
- Frontend: `https://documentfinder.vercel.app`

**Test Login:**
```
Email: melanie@admin.com
Password: Ma'am123
```

---

## 📚 Full Documentation

For detailed guide, see: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

---

## 🔄 Auto-Deploy

Every `git push` will automatically:
- ✅ Deploy backend to Render
- ✅ Deploy frontend to Vercel

---

## 🐛 Troubleshooting

**Backend not responding?**
- Wait 60 seconds (cold start)
- Check Render logs in dashboard

**CORS error?**
- Verify API URL in Vercel is correct
- Clear browser cache

**Login not working?**
- Check Render logs for errors
- Verify all environment variables are set

---

**Need help?** Check [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for full guide.
