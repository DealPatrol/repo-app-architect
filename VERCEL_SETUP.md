# Vercel Deployment Setup

Your TaskFlow app is built and ready to deploy! Follow these steps to make it fully functional on Vercel:

## 1. **Set Environment Variables on Vercel**

The app needs the `DATABASE_URL` environment variable from your Neon database connection.

### Steps:
1. Go to your Vercel project settings: https://vercel.com/projects
2. Find your `repo-app-architect` project
3. Click **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon connection string (postgres://...)
   
   You can find your Neon connection string at:
   - https://console.neon.tech/app/projects
   - Select your project
   - Copy the connection string from the "Connect" section

5. Click **Save** and **Redeploy**

## 2. **What's Working Right Now**

✅ Full SaaS UI with dashboards, task boards, and analytics  
✅ Database schema ready (Neon PostgreSQL)  
✅ All API endpoints built  
✅ Demo fallback (shows sample projects when DB not connected)  
✅ Mobile-responsive design  

## 3. **After Setting DATABASE_URL**

Once you set the environment variable and redeploy, you'll be able to:

- ✅ Create projects
- ✅ Add tasks with drag-and-drop Kanban board
- ✅ Manage team members
- ✅ View analytics and activity logs
- ✅ Upload files to tasks
- ✅ Add comments and collaborate

## 4. **Testing Locally**

The app works perfectly locally! To test locally:

```bash
# Make sure DATABASE_URL is in your .env.local
echo "DATABASE_URL=postgres://..." >> .env.local

pnpm dev
```

Visit http://localhost:3000/dashboard to see everything working.

## 5. **Next Steps (Optional)**

- Add authentication (Stack Auth is pre-configured)
- Connect additional team members
- Set up webhooks for notifications
- Customize branding and theme

## Troubleshooting

**"No buttons work on Vercel"** → Set DATABASE_URL environment variable and redeploy  
**"Projects aren't saving"** → Check that DATABASE_URL is set correctly in Vercel  
**"Database connection error"** → Verify Neon project is still running at https://console.neon.tech

Need help? Check the docs at https://neon.tech/docs or reach out to support.
