# Deployment Guide for BG Remover Pro

## 1. Database Setup (Neon)

### Create Database
1. Go to https://neon.tech
2. Sign up / Log in
3. Create new project
4. Copy the connection string
5. Add to Vercel environment variables as `DATABASE_URL`

### Run Migrations
```bash
# Local development
npx prisma migrate dev

# Production (after connecting to Neon)
npx prisma migrate deploy
```

## 2. Vercel Deployment

### Install Vercel CLI
```bash
npm i -g vercel
```

### Login & Deploy
```bash
vercel login
vercel --prod
```

### Environment Variables (Vercel Dashboard)

Required:
- `NEXTAUTH_URL` - Your production URL (e.g., https://bgremover.pro)
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `DATABASE_URL` - Neon PostgreSQL connection string
- `REMOVE_BG_API_KEY` - From https://www.remove.bg/api
- `STRIPE_SECRET_KEY` - From Stripe Dashboard
- `STRIPE_WEBHOOK_SECRET` - From Stripe webhook configuration
- `STRIPE_PRICE_ID_PRO` - Create in Stripe Dashboard
- `RESEND_API_KEY` - From https://resend.com
- `FROM_EMAIL` - Your sender email (e.g., noreply@yourdomain.com)

Optional:
- `FAL_API_KEY` - For AI background generation
- `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO` - Same as STRIPE_PRICE_ID_PRO

## 3. Stripe Configuration

### Create Products & Prices
1. Go to Stripe Dashboard → Products
2. Create product "BG Remover Pro"
3. Create recurring price: $9.99/month
4. Copy Price ID to environment variables

### Configure Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
4. Copy webhook secret to environment variables

## 4. Domain Setup

### Custom Domain (Vercel)
1. Go to Vercel Dashboard → Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

### Email Domain (Resend)
1. Go to Resend Dashboard
2. Add and verify your domain
3. Configure SPF, DKIM, DMARC records

## 5. Post-Deployment Checklist

### Test Core Features
- [ ] User registration
- [ ] Email verification
- [ ] Login/logout
- [ ] Background removal (free tier)
- [ ] Upgrade to Pro (Stripe checkout)
- [ ] Webhook processing
- [ ] Email notifications

### Test Growth Features
- [ ] Referral system
- [ ] Referral code tracking
- [ ] Affiliate application
- [ ] Affiliate link tracking

### Test Email Flows
- [ ] Welcome email
- [ ] Verification email
- [ ] Low credits reminder

## 6. Monitoring & Analytics

### Add Google Analytics
1. Create GA4 property
2. Add tracking ID to `_app.tsx` or layout

### Add Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
```

### Vercel Analytics
Enable in Vercel Dashboard → Analytics

## 7. Backup & Maintenance

### Database Backups
Neon provides automatic backups. For manual backup:
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Regular Tasks
- Monitor Stripe webhooks for failures
- Check email delivery rates in Resend
- Review affiliate applications
- Monitor server logs in Vercel

## Quick Commands

```bash
# Deploy to production
vercel --prod

# View logs
vercel logs --production

# Environment variables
vercel env ls

# Add secret
vercel env add DATABASE_URL production
```

## Troubleshooting

### Build Errors
- Check Node.js version (18+)
- Ensure all env variables are set
- Run `npm install` locally to verify

### Database Connection
- Verify DATABASE_URL format
- Check if IP is allowlisted (Neon)
- Test connection: `npx prisma db pull`

### Stripe Webhook Failures
- Check webhook URL is correct
- Verify webhook secret matches
- Check Vercel logs for errors

### Email Not Sending
- Verify Resend API key
- Check FROM_EMAIL is verified domain
- Review Resend dashboard for bounces
